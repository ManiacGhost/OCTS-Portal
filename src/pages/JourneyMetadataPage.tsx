import React from 'react';
import { FileText } from 'lucide-react';
import { FieldMappingTable, MappedField } from '../components/common/FieldMappingTable';

/** The journey metadata fields, from the client's sheet: where each comes from, its rule, and the dictionary field behind it. */
const FIELDS: MappedField[] = [
  {
    field: 'vault_asset_id',
    source: 'VVPM - document_number__v',
    text: 'Join key only. OE joins to Content MDM on this to pull every content attribute (brand, topic, subtopic, status, indication, etc.). Direct passthrough - same value as Content MDM.',
    dictKey: 'aset_id',
    example: 'US-YES-00248',
  },
  {
    field: 'step_id',
    source: 'Campaign Metadata',
    text: "Exact journey step the asset fires at (e.g. UC3-31A). Pure journey construct - nothing to do with content. Not an NBA field (Jatin, 5-Nov: 'NBA does not use a step ID'). No VVPM equivalent.",
    dictKey: 'step_id',
    example: 'UC1-15 (also UC2-18, UC3-31A)',
  },
  {
    field: 'tactic_id',
    source: 'Campaign Metadata',
    text: 'Journey input trigger for Medscape/Relevate tactics (e.g. 61249). Vendor transaction data, not a content attribute.',
    dictKey: 'journey_tactic_id',
    example: '61249 (also 126715, 2431)',
    addLabel: 'Journey tactic ID',
  },
  {
    field: 'platform',
    source: 'Campaign Metadata',
    text: 'Delivery platform label (e.g. DeepIntent Orchestrate, Veeva CRM, SFMC). OE-facing; NBA uses utm_source in Content MDM instead.',
    dictKey: 'platform',
    example: 'DeepIntent Orchestrate (also SFMC, Veeva CRM, Relevate Health)',
  },
  {
    field: 'creative_id',
    source: 'Campaign Metadata / DeepIntent',
    text: 'DeepIntent ad creative ID (e.g. 309320). OE=Yes in the Metadata_Optimise matrix, but Jatin flagged it as an unconfirmed NBA candidate, not settled OE-only. Confirm scope with Jatin before KMDH builds.',
    dictKey: 'creative_id',
    example: '152926',
  },
];

export const JourneyMetadataPage: React.FC = () => (
  <div className="space-y-5">
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        <FileText />
        Journey Metadata
      </h1>
      <p>The data leveraged across channels to follow each audience journey, where each field comes from and the rule that governs it.</p>
    </div>
    <FieldMappingTable rows={FIELDS} textHeading="Business rule / mapping" showSource />
  </div>
);
