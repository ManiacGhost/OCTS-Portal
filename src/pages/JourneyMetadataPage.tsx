import React from 'react';
import { FileText } from 'lucide-react';
import { MetadataRecordsTable, RecordColumn } from '../components/common/MetadataRecordsTable';
import { dictValues } from '../data/kiteDictionary';

/** Journey tactic IDs: the numbers inside the dictionary's tactic names (e.g. "kite-bispecifics-audience / 61249"). */
const journeyTacticIds = (): string[] => [...new Set(dictValues('tactic_name').flatMap(v => v.match(/\d{4,}/g) || []))];

/**
 * The journey metadata record: one row per asset firing at a journey step, values from the dictionary. The
 * vault_asset_id joins to the same asset on the Content MDM page. Hover a header for the field's rule.
 */
const COLUMNS: RecordColumn[] = [
  {
    field: 'vault_asset_id',
    definition: 'Join key only. OE joins to Content MDM on this to pull every content attribute. Direct passthrough - same value as Content MDM.',
    dictKey: 'aset_id',
  },
  {
    field: 'step_id',
    definition: 'Exact journey step the asset fires at (e.g. UC3-31A). Pure journey construct, nothing to do with content. No VVPM equivalent.',
    dictKey: 'step_id',
  },
  {
    field: 'tactic_id',
    definition: 'Journey input trigger for Medscape/Relevate tactics (e.g. 61249). Vendor transaction data, not a content attribute.',
    derive: ({ index }) => {
      const ids = journeyTacticIds();
      return ids.length ? ids[(index * 7 + 3) % ids.length] : '';
    },
  },
  {
    field: 'platform',
    definition: 'Delivery platform label (e.g. DeepIntent Orchestrate, Veeva CRM, SFMC). OE-facing; NBA uses utm_source in Content MDM instead.',
    dictKey: 'platform',
  },
  {
    field: 'creative_id',
    definition: 'DeepIntent ad creative ID (e.g. 309320). Unconfirmed NBA candidate: confirm scope before KMDH builds.',
    dictKey: 'creative_id',
  },
];

export const JourneyMetadataPage: React.FC = () => (
  <div className="space-y-5">
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        <FileText />
        Journey Metadata
      </h1>
      <p>The data leveraged across channels to follow each audience journey: one row per asset at a journey step, with values from the dictionary. Hover a column for its rule.</p>
    </div>
    <MetadataRecordsTable columns={COLUMNS} count={24} seed="journey" noun="journey records" />
  </div>
);
