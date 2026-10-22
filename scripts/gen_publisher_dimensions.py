"""Regenerate src/data/publisherDimensions.ts from 'src/Channel-publisher based Dimensions.xlsx'.

Run from the repo root:  python scripts/gen_publisher_dimensions.py

Reads the per-publisher "Field Name" lists on each sheet (not the ✅ matrices — it cross-checks
against them and prints any disagreement). Cleanups applied, each reported on stdout:
  - duplicated rows within one publisher's list are dropped (first occurrence kept)
  - `sub_ln` is normalised to the portal's existing `subj_ln`
"""
import openpyxl
from collections import OrderedDict

SRC = 'src/Channel-publisher based Dimensions.xlsx'
OUT = 'src/data/publisherDimensions.ts'
# sheet name -> scope key used by kiteTaxonomy.ts (`channel[/sub-channel]`)
SCOPE = {'3P Email': 'Digital/3P Email', 'Display': 'Digital/Display', '3P SMS': 'Digital/3P SMS',
         'Email': 'Email', 'Social-Equals5': 'Social'}
FIX = {'sub_ln': 'subj_ln'}


def s(v):
    return str(v).strip() if v is not None else ''


wb = openpyxl.load_workbook(SRC, data_only=True)
out = OrderedDict()
notes = []

for ws in wb.worksheets:
    if ws.title not in SCOPE:
        notes.append(f"skipped unknown sheet {ws.title!r}")
        continue
    key = SCOPE[ws.title]
    pubs = OrderedDict()
    for row in ws.iter_rows():
        for c in row:
            if s(c.value).lower() != 'publisher':
                continue
            name = s(ws.cell(row=c.row, column=c.column + 1).value)
            if not name:
                continue
            col = c.column + 1
            r = c.row + 1
            while r <= c.row + 3 and s(ws.cell(row=r, column=col).value).lower() != 'field name':
                r += 1
            r += 1
            raw = []
            while r <= ws.max_row and s(ws.cell(row=r, column=col).value):
                v = s(ws.cell(row=r, column=col).value)
                raw.append(FIX.get(v, v))
                r += 1
            seen, fields = set(), []
            for f in raw:
                if f in seen:
                    notes.append(f"{key} / {name}: duplicate row {f!r} dropped")
                    continue
                seen.add(f)
                fields.append(f)
            pubs[name] = fields
    out[key] = pubs

    # cross-check with the sheet's own ✅ matrix, if there is one
    for row in ws.iter_rows():
        for c in row:
            if s(c.value) == 'Field Name' and s(ws.cell(row=c.row, column=c.column + 1).value) in pubs:
                hr, hc = c.row, c.column
                for pi in range(1, 20):
                    pn = s(ws.cell(row=hr, column=hc + pi).value)
                    if not pn:
                        break
                    mset, r = set(), hr + 1
                    while s(ws.cell(row=r, column=hc).value):
                        if s(ws.cell(row=r, column=hc + pi).value) == '✅':
                            code = s(ws.cell(row=r, column=hc).value)
                            mset.add(FIX.get(code, code))
                        r += 1
                    if set(pubs.get(pn, [])) != mset:
                        notes.append(f"{key} / {pn}: list and ✅ matrix disagree")

lines = [
    "/**",
    " * Per-publisher dimension lists, generated from 'src/Channel-publisher based Dimensions.xlsx'",
    " * by scripts/gen_publisher_dimensions.py — do not edit by hand; re-run the script instead.",
    " *",
    " * Keyed by scope (`channel` or `channel/sub-channel`, matching KITE_SOURCES keys) then by",
    " * publisher. IVA and Search are deliberately not in the sheet and keep their existing model.",
    " */",
    "export const PUBLISHER_DIMENSIONS: Record<string, Record<string, string[]>> = {",
]
for scope, pubs in out.items():
    lines.append(f"  '{scope}': {{")
    for p, f in pubs.items():
        lines.append(f"    '{p}': [{', '.join(repr(x) for x in f)}],")
    lines.append("  },")
lines.append("};")
open(OUT, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')

for k, v in out.items():
    print(k, {p: len(f) for p, f in v.items()})
print('\nNOTES:')
for n in notes:
    print(' -', n)
