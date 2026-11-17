"""Generate src/data/kiteDictionarySeed.ts from Kite_Dictionary.xlsx, merged with Kite_Dictionary_Values_v2.xlsx.

Kite_Dictionary.xlsx: one sheet, row 1 holds the field names and the cells beneath each one are that field's
attribute values.
Kite_Dictionary_Values_v2.xlsx (sheet "03_Dictionaries 2026"): row 2 holds the field names; a field is a value
column, optionally followed by an ABBR column with each value's abbreviation. Its values are added to the
matching field (same key) without duplicates, whatever the case; fields it adds are appended.
Run from the project root:  python scripts/gen_kite_dictionary.py
"""
import json
import sys

import openpyxl

SRC = 'Kite_Dictionary.xlsx'
SRC_V2 = 'Kite_Dictionary_Values_v2.xlsx'
OUT = 'src/data/kiteDictionarySeed.ts'

# header in the sheet -> (key, abbreviation, display name)
FIELDS = {
    'brd/product code': ('brd', 'brd', 'Product code'),
    'src': ('src', 'src', 'Source / publisher'),
    'src/platform': ('src', 'src', 'Source / platform'),
    'chnl/medium': ('chnl', 'chnl', 'Channel / medium'),
    'act_nm': ('act_nm', 'act_nm', 'Activity name'),
    'ta': ('ta', 'ta', 'Therapeutic area'),
    'indc': ('indc', 'indc', 'Indication'),
    'devc_nm': ('devc_nm', 'devc_nm', 'Device name'),
    'aset_id': ('aset_id', 'aset_id', 'Asset ID'),
    'global_id': ('global_id', 'global_id', 'Global ID'),
    'sub_chnl': ('sub_chnl', 'sub_chnl', 'Sub-channel'),
    'alrt_typ/campaign typ': ('alrt_typ', 'alrt_typ', 'Campaign type / alert type'),
    'topic': ('topic', 'topic', 'Topic'),
    'sub_topic': ('sub_topic', 'sub_topic', 'Subtopic'),
    'aset_siz': ('aset_siz', 'aset_siz', 'Asset size'),
    'ad size/dimension': ('ad_size', 'ad size', 'Ad size / dimension'),
    'language': ('language', 'language', 'Language'),
    'target/audience': ('target', 'target', 'Target / audience'),
    'messaging type': ('messaging_type', 'messaging type', 'Messaging type'),
    'call to action': ('cta', 'call to action', 'Call to action'),
    'tactic/classification': ('tactic', 'tactic', 'Tactic / classification'),
    'business objective': ('objective', 'business objective', 'Business objective'),
    'country': ('country', 'country', 'Country'),
    'segment': ('segment', 'segment', 'Segment'),
    'code (m)': ('code_m', 'code (m)', 'Code (machine)'),
    'hardcoded values': ('hardcoded', 'hardcoded values', 'Hardcoded values'),
    # added to the sheet in November 2026 (content MDM / journey metadata)
    'metadata_status': ('metadata_status', 'metadata_status', 'Metadata status'),
    'VVPM Status': ('vvpm_status', 'vvpm_status', 'VVPM status'),
    'use_case': ('use_case', 'use_case', 'Use case'),
    'audience_id': ('audience_id', 'audience_id', 'Audience ID'),
    'tactic_name': ('tactic_name', 'tactic_name', 'Tactic name'),
    'expiration_date': ('expiration_date', 'expiration_date', 'Expiration date'),
    'asset_url': ('asset_url', 'asset_url', 'Asset URL'),
    'source_file_date': ('source_file_date', 'source_file_date', 'Source file date'),
    'last_modified_date': ('last_modified_date', 'last_modified_date', 'Last modified date'),
    'step_id': ('step_id', 'step_id', 'Step ID'),
    'creative_id': ('creative_id', 'creative_id', 'Creative ID'),
}

ws = openpyxl.load_workbook(SRC).active
rows = list(ws.iter_rows(values_only=True))
# (column, header) for every titled column; a header that appears twice (asset_url) is one field
cols = [(c, str(h).strip()) for c, h in enumerate(rows[0]) if h is not None and str(h).strip()]
unknown = sorted({h for _, h in cols if h not in FIELDS})
if unknown:
    sys.exit(f'Unmapped headers (add them to FIELDS): {unknown}')

out, by_key = [], {}
for col, h in cols:
    key, abbr, name = FIELDS[h]
    entry = by_key.get(key)
    if entry is None:
        entry = {'key': key, 'abbreviation': abbr, 'label': name, 'sheetHeader': h, 'values': [], 'valueAbbr': {}}
        by_key[key] = entry
        out.append(entry)
    seen = {v.lower() for v in entry['values']}
    values = entry['values']
    for r in rows[1:]:
        v = r[col] if col < len(r) else None
        if v is None or str(v).strip() == '':
            continue
        v = str(v).strip()
        if v.lower() in seen:
            continue
        seen.add(v.lower())
        values.append(v)


# ---- merge the v2 values sheet -----------------------------------------------------------------------
# header in v2 -> (key, abbreviation, display name); a key already present gains the new values
V2_FIELDS = {
    'AD ENVIRONMENT': ('ad_env', 'ad_env', 'Ad environment'),
    'AD SIZE/DIMENSION': ('ad_size', 'ad size', 'Ad size / dimension'),
    'AssetID/Veeva': ('aset_id', 'aset_id', 'Asset ID'),
    'BUY/RATE TYPE': ('buy_type', 'buy_type', 'Buy / rate type'),
    'CALL TO ACTION': ('cta', 'call to action', 'Call to action'),
    'CHANNEL': ('chnl', 'chnl', 'Channel / medium'),
    'COUNTRY': ('country', 'country', 'Country'),
    'CREATIVE TYPE': ('creative_type', 'creative_type', 'Creative type'),
    'Data Provider': ('data_provider', 'data_provider', 'Data provider'),
    'DELIVERY LOCATION': ('delivery_location', 'delivery_location', 'Delivery location'),
    'DEVICE TYPE': ('devc_nm', 'devc_nm', 'Device name'),
    'DIMENSIONS': ('aset_siz', 'aset_siz', 'Asset size'),
    'DSP': ('dsp', 'dsp', 'DSP'),
    'ENGINE': ('engine', 'engine', 'Search engine'),
    'FORMAT/PLACEMENT': ('format_placement', 'format_placement', 'Format / placement'),
    'GEO': ('geo', 'geo', 'Geo'),
    'INDICATION': ('indc', 'indc', 'Indication'),
    'Inventory Provider': ('inventory_provider', 'inventory_provider', 'Inventory provider'),
    'JOURNEY STAGE / TARGET PRIORITY': ('journey_stage', 'journey_stage', 'Journey stage / target priority'),
    'LANGUAGE': ('language', 'language', 'Language'),
    'LOCAL/NATIONAL': ('local_national', 'local_national', 'Local / national'),
    'MATCH TYPE': ('match_type', 'match_type', 'Match type'),
    'MEDIUM': ('medium', 'medium', 'Medium'),
    'UTM MEDIUM': ('medium', 'medium', 'Medium'),
    'MESSAGING TYPE': ('messaging_type', 'messaging type', 'Messaging type'),
    'NBA/DCO': ('nba_dco', 'nba_dco', 'NBA / DCO'),
    'OBJECTIVE': ('objective', 'business objective', 'Business objective'),
    'Other Segment Identifier': ('segment', 'segment', 'Segment'),
    'PACKAGE TYPE- PLC': ('package_type', 'package_type', 'Package type'),
    'PLATFORM': ('platform', 'platform', 'Platform'),
    'Strategic Imperative': ('strategic_imperative', 'strategic_imperative', 'Strategic imperative'),
    'PRODUCT CODE': ('brd', 'brd', 'Product code'),
    'SEARCH TACTICS': ('search_tactics', 'search_tactics', 'Search tactics'),
    'SERVED BY': ('served_by', 'served_by', 'Served by'),
    'SITE/PUBLISHER': ('src', 'src', 'Source / platform'),
    'SOURCE (PUBLISHER)': ('src', 'src', 'Source / platform'),
    'TACTIC/CLASSIFICATION': ('tactic', 'tactic', 'Tactic / classification'),
    'TACTIC TYPE': ('tactic_type', 'tactic_type', 'Tactic type'),
    'TARGET': ('target', 'target', 'Target / audience'),
    'TARGETING TYPE': ('targeting_type', 'targeting_type', 'Targeting type'),
    'THERAPEUTIC AREA': ('ta', 'ta', 'Therapeutic area'),
    'TOPIC (C)': ('topic', 'topic', 'Topic'),
    'SUB_TOPIC (C)': ('sub_topic', 'sub_topic', 'Subtopic'),
    'VIDEO LENGTH': ('video_length', 'video_length', 'Video length'),
    'VIDEO SKIPPABLE': ('video_skippable', 'video_skippable', 'Video skippable'),
    'YEAR': ('year', 'year', 'Year'),
    'LINE OF THERAPY': ('line_of_therapy', 'line_of_therapy', 'Line of therapy'),
    'SEGMENT NAME': ('segment_name', 'segmentname', 'Segment name'),
    'CAMPAIGN TYPE': ('alrt_typ', 'alrt_typ', 'Campaign type / alert type'),
    'SUB-CHANNEL': ('sub_chnl', 'sub_chnl', 'Sub-channel'),
    'VENDOR CHANNEL': ('vendor_channel', 'vendor_channel', 'Vendor channel'),
    'TACTIC NAME': ('tactic_name', 'tactic_name', 'Tactic name'),
    'USE CASE': ('use_case', 'use_case', 'Use case'),
    'AUDIENCE ID': ('audience_id', 'audience_id', 'Audience ID'),
    'ASSET TYPE': ('asset_type', 'asset_type', 'Asset type'),
    'KEY MESSAGE': ('key_message', 'key_message', 'Key message'),
    'ACTIVITY NAME': ('act_nm', 'act_nm', 'Activity name'),
    'ACTIVITY TYPE': ('act_typ', 'act_typ', 'Activity type'),
    'CALL TYPE': ('call_type', 'call_type', 'Call type'),
    'UTM SOURCE': ('utm_source', 'utm_source', 'UTM source'),
    'VVPM STATUS': ('vvpm_status', 'vvpm_status', 'VVPM status'),
    'METADATA STATUS': ('metadata_status', 'metadata_status', 'Metadata status'),
}
# headers that only title a section of the sheet
V2_SKIP = {'KITE-SPECIFIC DIMENSIONS (not in ZS)'}


def clean(v):
    """A sheet value, or None for a blank or a note such as "(same list as AC03 Medium)"."""
    if v is None:
        return None
    v = str(v).strip()
    if v.endswith('.0') and v[:-2].isdigit():
        v = v[:-2]
    if not v or (v.startswith('(') and v.endswith(')')):
        return None
    return v


ws2 = openpyxl.load_workbook(SRC_V2, data_only=True).active
rows2 = list(ws2.iter_rows(values_only=True))
hdr2 = rows2[1]
unknown2 = []
c = 0
while c < len(hdr2):
    h = hdr2[c]
    if h is None or not str(h).strip():
        c += 1
        continue
    h = str(h).strip()
    has_abbr = c + 1 < len(hdr2) and str(hdr2[c + 1] or '').strip().upper() == 'ABBR'
    if h in V2_SKIP:
        c += 2 if has_abbr else 1
        continue
    if h not in V2_FIELDS:
        unknown2.append(h)
        c += 2 if has_abbr else 1
        continue
    key, abbr, name = V2_FIELDS[h]
    entry = by_key.get(key)
    if entry is None:
        entry = {'key': key, 'abbreviation': abbr, 'label': name, 'sheetHeader': h, 'values': [], 'valueAbbr': {}}
        by_key[key] = entry
        out.append(entry)
    seen = {x.lower(): x for x in entry['values']}
    for r in rows2[2:]:
        v = clean(r[c] if c < len(r) else None)
        if v is None:
            continue
        a = clean(r[c + 1] if has_abbr and c + 1 < len(r) else None)
        hit = seen.get(v.lower())
        if hit is None:
            entry['values'].append(v)
            seen[v.lower()] = v
            hit = v
        if a and hit not in entry['valueAbbr']:
            entry['valueAbbr'][hit] = a
    c += 2 if has_abbr else 1
if unknown2:
    sys.exit(f'Unmapped v2 headers (add them to V2_FIELDS): {unknown2}')

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('// GENERATED by scripts/gen_kite_dictionary.py from Kite_Dictionary.xlsx + Kite_Dictionary_Values_v2.xlsx; do not edit by hand.\n')
    f.write('// One entry per field of the Kite dictionary, with the attribute values listed under it in the sheet.\n\n')
    f.write('export interface SeedField {\n  key: string;\n  abbreviation: string;\n  label: string;\n  sheetHeader: string;\n  values: string[];\n  /** the abbreviation of a value, when the sheet gives one */\n  valueAbbr?: Record<string, string>;\n}\n\n')
    f.write('export const KITE_DICTIONARY_SEED: SeedField[] = ' + json.dumps(out, indent=2, ensure_ascii=False) + ';\n')

print(f'{len(out)} fields, {sum(len(x["values"]) for x in out)} attribute values -> {OUT}')
