import React from 'react';
import { Database } from 'lucide-react';
import { FieldMappingTable, MappedField } from '../components/common/FieldMappingTable';

/** The Content MDM fields, as defined in the client's sheet, each mapped to its dictionary field. */
const FIELDS: MappedField[] = [
  { field: 'vault_asset_id', text: 'FDA-approved asset code from PromoMats (join key).', dictKey: 'aset_id', example: 'US-YES-00248' },
  { field: 'vault_global_id', text: 'Version-agnostic global asset ID.', dictKey: 'global_id', example: '4075_660750' },
  { field: 'name', text: 'Asset name in VVPM.', dictKey: 'asset_name', addLabel: 'Asset name', example: 'Yescarta - www-banner - US-YES-00248' },
  { field: 'topic', text: 'Primary content topic.', dictKey: 'topic', example: 'Efficacy' },
  { field: 'subtopic', text: 'Secondary topic.', dictKey: 'sub_topic', example: 'Overall Survival' },
  { field: 'indication', text: 'Approved indication (e.g. LBCL, MCL).', dictKey: 'indc', example: '2L LBCL (multi-value, e.g. 2L LBCL, 3L LBCL)' },
  { field: 'brand', text: 'Product (Yescarta / Tecartus).', dictKey: 'brd', example: 'Yescarta' },
  { field: 'status', text: 'VVPM status of the asset.', dictKey: 'vvpm_status', example: 'Approved for Use' },
  { field: 'metadata_status', text: 'Active / Inactive flag NBA filters on.', dictKey: 'metadata_status', example: 'Active' },
  { field: 'use_case', text: 'Treater / Referrer / Bispecific journey split.', dictKey: 'use_case', example: 'MVP-1' },
  { field: 'audience_id', text: 'DeepIntent NPI target audience segment.', dictKey: 'audience_id', example: '41104' },
  {
    field: 'utm_source',
    text: 'Platform that delivered the asset (deepintent, medscape, relevate-health, sfmc, veeva-crm, equals5, impiricus, doximity, OpenEvidence, BioPharm).',
    dictKey: 'utm_source',
    example: 'deepintent',
  },
  { field: 'utm_medium', text: 'Channel type (display / email).', dictKey: 'utm_medium', example: 'display' },
  { field: 'tactic_name', text: "Tactic label for NBA's weekly DeepIntent alert table.", dictKey: 'tactic_name', example: 'kite-bispecifics-audience (or ID 40931)' },
  { field: 'vendor_channel', text: 'Delivery channel/vendor label.', dictKey: 'vendor_channel', addLabel: 'Vendor channel', example: 'Email - Veeva' },
  { field: 'expiration_date', text: 'Asset expiry date.', dictKey: 'expiration_date', example: '2027-08-01' },
  { field: 'asset_url', text: 'Direct VVPM link to the asset.', dictKey: 'asset_url' },
  { field: 'source_file_date', text: 'Date of the Campaign Metadata extract used.', dictKey: 'source_file_date', example: '20260924' },
  { field: 'last_modified_date', text: 'Date the asset record was last changed.', dictKey: 'last_modified_date' },
  { field: 'nba_flag', text: 'Whether the asset is used by NBA.', dictKey: 'nba_flag', addLabel: 'NBA flag', example: 'Yes' },
];

export const ContentMdmPage: React.FC = () => (
  <div className="space-y-5">
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        <Database />
        Content MDM
      </h1>
      <p>Latest content metadata directly from VVPM: every field the content master holds, and the dictionary field behind it.</p>
    </div>
    <FieldMappingTable rows={FIELDS} textHeading="Definition" />
  </div>
);
