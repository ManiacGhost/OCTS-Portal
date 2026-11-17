import React from 'react';
import { Database } from 'lucide-react';
import { MetadataRecordsTable, RecordColumn, brandOfAsset, dateFor, ymd, pickFrom } from '../components/common/MetadataRecordsTable';

const titleCase = (v: string) => v.charAt(0) + v.slice(1).toLowerCase();

// an asset's indication follows its brand, so a record never pairs Tecartus with a Yescarta indication
const INDICATIONS: Record<string, string[]> = { YESCARTA: ['DLBCL', 'LBCL', 'FL'], TECARTUS: ['MCL', 'ALL'] };

/** The Content MDM record: every field, with values from the dictionary. Hover a header for its definition. */
const COLUMNS: RecordColumn[] = [
  { field: 'vault_asset_id', definition: 'FDA-approved asset code from PromoMats (join key).', dictKey: 'aset_id' },
  { field: 'vault_global_id', definition: 'Version-agnostic global asset ID.', dictKey: 'global_id' },
  {
    field: 'name',
    definition: 'Asset name in VVPM.',
    derive: ({ row, index }) => {
      const brand = brandOfAsset(row.vault_asset_id);
      return `${brand === 'UNBRANDED' ? 'Kite' : titleCase(brand)} - ${pickFrom(`fmt|${index}`, ['www-banner', 'email', 'display', 'brand-alert'])} - ${row.vault_asset_id}`;
    },
  },
  { field: 'brand', definition: 'Product (Yescarta / Tecartus).', derive: ({ row }) => brandOfAsset(row.vault_asset_id) },
  { field: 'topic', definition: 'Primary content topic.', dictKey: 'topic' },
  { field: 'subtopic', definition: 'Secondary topic.', dictKey: 'sub_topic' },
  {
    field: 'indication',
    definition: 'Approved indication (e.g. LBCL, MCL).',
    derive: ({ row, index, pick }) => {
      const list = INDICATIONS[row.brand];
      return list ? pickFrom(`indc|${index}`, list) : pick('indc', 'indication');
    },
  },
  { field: 'status', definition: 'VVPM status of the asset.', dictKey: 'vvpm_status' },
  { field: 'metadata_status', definition: 'Active / Inactive flag NBA filters on.', dictKey: 'metadata_status' },
  { field: 'use_case', definition: 'Treater / Referrer / Bispecific journey split.', dictKey: 'use_case' },
  { field: 'audience_id', definition: 'DeepIntent NPI target audience segment.', dictKey: 'audience_id' },
  { field: 'utm_source', definition: 'Platform that delivered the asset.', dictKey: 'utm_source' },
  { field: 'utm_medium', definition: 'Channel type (display / email).', dictKey: 'medium' },
  { field: 'tactic_name', definition: "Tactic label for NBA's weekly DeepIntent alert table.", dictKey: 'tactic_name' },
  { field: 'vendor_channel', definition: 'Delivery channel/vendor label.', dictKey: 'vendor_channel' },
  { field: 'expiration_date', definition: 'Asset expiry date.', derive: ({ index }) => ymd(dateFor(`exp|${index}`, new Date(2027, 0, 1), 540)) },
  { field: 'asset_url', definition: 'Direct VVPM link to the asset.', dictKey: 'asset_url', truncate: true },
  { field: 'source_file_date', definition: 'Date of the Campaign Metadata extract used.', derive: ({ index }) => ymd(dateFor(`src|${index}`, new Date(2026, 8, 1), 75), '') },
  { field: 'last_modified_date', definition: 'Date the asset record was last changed.', derive: ({ index }) => ymd(dateFor(`mod|${index}`, new Date(2026, 4, 1), 190)) },
  { field: 'nba_flag', definition: 'Whether the asset is used by NBA.', derive: ({ index }) => pickFrom(`nba|${index}`, ['Yes', 'No']) },
];

export const ContentMdmPage: React.FC = () => (
  <div className="space-y-5">
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        <Database />
        Content MDM
      </h1>
      <p>Latest content metadata directly from VVPM: one row per asset, with values from the dictionary. Hover a column for its definition.</p>
    </div>
    <MetadataRecordsTable columns={COLUMNS} count={24} seed="mdm" noun="assets" />
  </div>
);
