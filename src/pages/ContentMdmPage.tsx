import React from 'react';
import { Database } from 'lucide-react';
import { FieldMappingTable, MappedField } from '../components/common/FieldMappingTable';

/** The Content MDM fields, as defined in the client's sheet, each mapped to its dictionary field. */
const FIELDS: MappedField[] = [
  { field: 'vault_asset_id', text: 'FDA-approved asset code from PromoMats (join key).', dictKey: 'aset_id' },
  { field: 'vault_global_id', text: 'Version-agnostic global asset ID.', dictKey: 'global_id' },
  { field: 'topic', text: 'Primary content topic.', dictKey: 'topic' },
  { field: 'subtopic', text: 'Secondary topic.', dictKey: 'sub_topic' },
  { field: 'indication', text: 'Approved indication (e.g. LBCL, MCL).', dictKey: 'indc' },
  { field: 'brand', text: 'Product (Yescarta / Tecartus).', dictKey: 'brd' },
  { field: 'metadata_status', text: 'Active / Inactive flag NBA filters on.', dictKey: 'metadata_status' },
  { field: 'use_case', text: 'Treater / Referrer / Bispecific journey split.', dictKey: 'use_case' },
  { field: 'audience_id', text: 'DeepIntent NPI target audience segment.', dictKey: 'audience_id' },
  {
    field: 'utm_source',
    text: 'Platform that delivered the asset (deepintent, medscape, relevate-health, sfmc, veeva-crm, equals5, impiricus, doximity, OpenEvidence, BioPharm).',
    dictKey: 'src',
  },
  { field: 'utm_medium', text: 'Channel type (display / email).', dictKey: 'utm_medium' },
  { field: 'tactic_name', text: "Tactic label for NBA's weekly DeepIntent alert table.", dictKey: 'tactic_name' },
  { field: 'vendor_channel', text: 'Delivery channel/vendor label.', dictKey: 'vendor_channel' },
  { field: 'expiration_date', text: 'Asset expiry date.', dictKey: 'expiration_date' },
  { field: 'asset_url', text: 'Direct VVPM link to the asset.', dictKey: 'asset_url' },
  { field: 'source_file_date', text: 'Date of the Campaign Metadata extract used.', dictKey: 'source_file_date' },
  { field: 'last_modified_date', text: 'Date the asset record was last changed.', dictKey: 'last_modified_date' },
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
