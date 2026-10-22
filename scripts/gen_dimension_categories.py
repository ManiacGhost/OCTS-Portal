"""Regenerate src/data/dimensionCategories.ts from 'src/Dimension_Categorization-v1.xlsx'.

Run from the repo root:  python scripts/gen_dimension_categories.py

Sheet columns: Field | Category (Content / Execution/Eng) | Sub-type (Core, Spec / Execution,
Engagement) | Meaning. Category 'Content' becomes the portal's CORE group; 'Execution/Eng' becomes
EXECUTION / ENGAGEMENT. `sub_ln` is normalised to the portal's `subj_ln` (same typo fix as the
publisher sheet) — both rows are kept so either spelling resolves.
"""
import openpyxl

SRC = 'src/Dimension_Categorization-v1.xlsx'
OUT = 'src/data/dimensionCategories.ts'
GROUP = {'content': 'core', 'execution/eng': 'exec'}

ws = openpyxl.load_workbook(SRC, data_only=True).worksheets[0]
rows = []
for r in ws.iter_rows(min_row=2, values_only=True):
    field, cat, sub = (str(x).strip() if x is not None else '' for x in r[:3])
    if not field:
        continue
    g = GROUP.get(cat.lower())
    if not g:
        print('!! unknown category', field, cat)
        continue
    rows.append((field, g, sub))

lines = [
    "/**",
    " * Core vs Execution/Engagement split of the dimensions, generated from",
    " * 'src/Dimension_Categorization-v1.xlsx' by scripts/gen_dimension_categories.py — don't hand-edit.",
    " *",
    " *   core  = the sheet's 'Content' category (sub-types Core, Spec)",
    " *   exec  = the sheet's 'Execution/Eng' category (sub-types Execution, Engagement)",
    " * Fields the sheet doesn't list are simply absent here (the UI shows them as 'Other').",
    " */",
    "export type DimensionGroup = 'core' | 'exec';",
    "",
    "export const DIMENSION_CATEGORY: Record<string, { group: DimensionGroup; subType: string }> = {",
]
for f, g, sub in rows:
    lines.append(f"  {f}: {{ group: '{g}', subType: '{sub}' }},")
lines.append("};")
open(OUT, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(len(rows), 'fields;', sum(1 for r in rows if r[1] == 'core'), 'core,', sum(1 for r in rows if r[1] == 'exec'), 'exec')
