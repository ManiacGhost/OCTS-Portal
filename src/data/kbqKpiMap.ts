/**
 * Key Business Questions (KBQs) ↔ KPIs ↔ C360 tagging dimensions.
 *
 * Client feedback (Tagging Strategy screen): dimensions shouldn't just be a checklist —
 * each one should trace to the business question it lets analytics answer, and the KPI
 * that question is measured by. This is that mapping, keyed off `KiteDimension.code`
 * (see `kiteTaxonomy.ts`).
 *
 * A KBQ can optionally be scoped to specific channels (`channels`); omit it to apply
 * everywhere. `requiredDimensions` are the dimension codes analytics needs tagged to
 * actually answer the question — coverage is computed against whichever of those codes
 * exist in the current channel/sub-channel scope (a KBQ needing a code that scope doesn't
 * carry is simply not shown there).
 */

import { KiteChannel } from './kiteTaxonomy';

export interface KbqDefinition {
  id: string;
  question: string;
  kpis: string[];
  requiredDimensions: string[];
  channels?: KiteChannel[];
}

export const KBQ_LIBRARY: KbqDefinition[] = [
  {
    id: 'kbq-content-performance',
    question: 'Which topics & subtopics drive the strongest HCP/patient engagement?',
    kpis: ['Engagement rate by topic', 'Click-through rate'],
    requiredDimensions: ['topic', 'sub_topic'],
  },
  {
    id: 'kbq-channel-mix',
    question: 'Which channel and sub-channel combinations deliver the best ROI per brand?',
    kpis: ['Cost per engagement', 'Channel ROI'],
    requiredDimensions: ['brd', 'chnl', 'sub_chnl'],
  },
  {
    id: 'kbq-audience-reach',
    question: 'Are we reaching the intended audience segments at the right depth?',
    kpis: ['Audience match rate', 'Reach by segment'],
    requiredDimensions: ['audn_id', 'audn_nm'],
  },
  {
    id: 'kbq-creative-effectiveness',
    question: 'Which creatives and placements are driving the most conversions?',
    kpis: ['Conversion rate by creative', 'CTR by placement'],
    requiredDimensions: ['creative_id', 'plact_nm'],
  },
  {
    id: 'kbq-campaign-attribution',
    question: 'Can engagement be attributed back to a specific campaign and tactic?',
    kpis: ['Campaign attribution accuracy', 'Multi-touch attribution coverage'],
    requiredDimensions: ['cpgn_id', 'tact_id'],
  },
  {
    id: 'kbq-indication-coverage',
    question: 'Is content coverage balanced across indications?',
    kpis: ['Share of voice by indication'],
    requiredDimensions: ['indc'],
  },
  {
    id: 'kbq-asset-traceability',
    question: 'Is every live asset traceable to an approved, MLR-reviewed source?',
    kpis: ['Asset compliance rate', 'Vault traceability'],
    requiredDimensions: ['aset_id', 'global_id'],
  },
  {
    id: 'kbq-email-performance',
    question: 'Which subject lines and sends are moving open & click rates?',
    kpis: ['Open rate by subject line', 'Email CTR'],
    requiredDimensions: ['subj_ln', 'email'],
    channels: ['Email', 'Digital'],
  },
  {
    id: 'kbq-search-efficiency',
    question: 'Which paid-search terms and tactics are most cost-efficient?',
    kpis: ['Cost per click by tactic', 'Search conversion rate'],
    requiredDimensions: ['tact_id', 'url'],
    channels: ['Search'],
  },
  {
    id: 'kbq-field-deck-usage',
    question: 'Which IVA slides are reps actually presenting, and how often?',
    kpis: ['Slide utilization rate', 'Deck completion rate'],
    requiredDimensions: ['deck_id', 'slide_count'],
    channels: ['IVA'],
  },
  {
    id: 'kbq-hcp-identification',
    question: 'Can engagement be tied back to an individual HCP for field follow-up?',
    kpis: ['NPI match rate', 'HCP-level engagement'],
    requiredDimensions: ['npi'],
    channels: ['IVA', 'Digital'],
  },
  {
    id: 'kbq-suggestion-adoption',
    question: 'How often do reps/HCPs act on an AI-suggested next-best content asset?',
    kpis: ['AI suggestion adoption rate'],
    requiredDimensions: ['suggestion_id'],
  },
];

export type KbqStatus = 'covered' | 'partial' | 'none';

export interface ScopedKbq extends KbqDefinition {
  /** requiredDimensions narrowed to codes that actually exist in this scope */
  applicableDimensions: string[];
  status: KbqStatus;
}

/**
 * KBQs relevant to a channel/sub-channel scope, with coverage computed against the
 * currently-selected (ticked) dimension codes for that scope.
 */
export function kbqsForScope(
  channel: string,
  scopeDimCodes: string[],
  selectedCodes: string[],
): ScopedKbq[] {
  return KBQ_LIBRARY.map(kbq => {
    if (kbq.channels && !kbq.channels.includes(channel as KiteChannel)) return null;
    const applicableDimensions = kbq.requiredDimensions.filter(c => scopeDimCodes.includes(c));
    if (applicableDimensions.length === 0) return null;
    const coveredCount = applicableDimensions.filter(c => selectedCodes.includes(c)).length;
    const status: KbqStatus =
      coveredCount === applicableDimensions.length ? 'covered' : coveredCount > 0 ? 'partial' : 'none';
    return { ...kbq, applicableDimensions, status };
  }).filter((k): k is ScopedKbq => !!k);
}
