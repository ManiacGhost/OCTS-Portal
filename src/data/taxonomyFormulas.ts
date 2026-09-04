/**
 * Approved Kite / Gilead taxonomy formulas — Campaign Name level.
 * Source: "Kite taxonomy formula.xlsx" (approved). Placement + Creative levels
 * are defined in the sheet but not yet built into the portal.
 *
 * Field-kind suffixes used in the source formulas:
 *   (c) controlled vocabulary   (v) variable / asset-derived
 *   (m) machine-generated code   (f) free text
 */

import { MediaChannelType } from '../types';
export type { MediaChannelType };

export const CHANNEL_TYPES: MediaChannelType[] = ['Digital', 'Social', 'Search', 'SFMC', 'IVA'];

export type TokenKind = 'c' | 'v' | 'm' | 'f';

/** How a token's value is resolved in the builder. */
export type TokenSource =
  | 'input' // planner picks it
  | 'channel' // = MEDIUMS[channel]
  | 'brand' // = brand.code
  | 'ta' // = therapeutic area code
  | 'subChannel' // = selected sub-channel (the `platform` token)
  | 'year' // = year from the campaign quarter
  | 'code'; // machine-generated suffix

export interface FormulaToken {
  key: string;
  label: string;
  kind: TokenKind;
  source: TokenSource;
  /** options when kind === 'c' and source === 'input' */
  options?: string[];
}

// ---- controlled vocabularies -------------------------------------------------

export const COUNTRIES = ['US', 'CA', 'GB', 'DE', 'FR', 'Global'];
export const MESSAGING_TYPES = ['Branded', 'Unbranded', 'Disease Awareness', 'Payer'];
export const TARGETS = ['HCP', 'Patient', 'Caregiver', 'Payer'];
/** Indication is "Cancer" — captured at the specific CAR-T level. */
export const INDICATIONS = ['LBCL', 'FL', 'MCL', 'B-ALL'];

export const MEDIUMS: Record<MediaChannelType, string> = {
  Digital: 'Display',
  Social: 'Social',
  Search: 'Search',
  SFMC: 'Email',
  IVA: 'Field',
};

// ---- Campaign-level formula, per channel -----------------------------------

const COUNTRY: FormulaToken = { key: 'country', label: 'Country', kind: 'c', source: 'input', options: COUNTRIES };
const MEDIUM: FormulaToken = { key: 'medium', label: 'Medium', kind: 'c', source: 'channel' };
const PRODUCT: FormulaToken = { key: 'product', label: 'Product code', kind: 'c', source: 'brand' };
const TA: FormulaToken = { key: 'ta', label: 'Therapeutic area', kind: 'c', source: 'ta' };
const TARGET: FormulaToken = { key: 'target', label: 'Target', kind: 'c', source: 'input', options: TARGETS };
const INDICATION: FormulaToken = { key: 'indication', label: 'Indication', kind: 'c', source: 'input', options: INDICATIONS };
const YEAR: FormulaToken = { key: 'year', label: 'Year', kind: 'c', source: 'year' };
const CODE: FormulaToken = { key: 'code', label: 'Code', kind: 'm', source: 'code' };

export const CAMPAIGN_FORMULA: Record<MediaChannelType, FormulaToken[]> = {
  // country _ medium _ product code _ messaging type _ therapeutic area _ target _ indication _ year _ Code
  Digital: [
    COUNTRY,
    MEDIUM,
    PRODUCT,
    { key: 'messagingType', label: 'Messaging type', kind: 'c', source: 'input', options: MESSAGING_TYPES },
    TA,
    TARGET,
    INDICATION,
    YEAR,
    CODE,
  ],
  // country _ medium _ product code _ therapeutic area _ target _ indication _ platform _ year _ Code
  Social: [COUNTRY, MEDIUM, PRODUCT, TA, TARGET, INDICATION, { key: 'platform', label: 'Platform', kind: 'c', source: 'subChannel' }, YEAR, CODE],
  Search: [COUNTRY, MEDIUM, PRODUCT, TA, TARGET, INDICATION, { key: 'platform', label: 'Platform', kind: 'c', source: 'subChannel' }, YEAR, CODE],
  SFMC: [COUNTRY, MEDIUM, PRODUCT, TA, TARGET, INDICATION, { key: 'platform', label: 'Platform', kind: 'c', source: 'subChannel' }, YEAR, CODE],
  // TODO: replace with the client's approved IVA Campaign Name formula — mirrors Social for now.
  IVA: [COUNTRY, MEDIUM, PRODUCT, TA, TARGET, INDICATION, { key: 'platform', label: 'Deck type', kind: 'c', source: 'subChannel' }, YEAR, CODE],
};

/** Human-readable formula template shown in the breakdown panel. */
export function formulaTemplate(channel: MediaChannelType): string {
  return CAMPAIGN_FORMULA[channel].map(t => `${t.label} (${t.kind})`).join(' _ ');
}

// ---- sub-channels & their extra fields -------------------------------------

export const SUB_CHANNELS: Record<MediaChannelType, string[]> = {
  Digital: ['Programmatic Display', 'Online Video (OLV)', 'Native', 'High-Impact', 'Website Pages'],
  Social: ['Meta', 'TikTok', 'LinkedIn', 'Reddit'],
  Search: ['Google Ads', 'Microsoft Ads (Bing)'],
  SFMC: ['Triggered Send', 'Journey Builder', 'Batch / Blast'],
  IVA: ['Core Visual Aid', 'Follow-Up Deck', 'Objection Handler', 'Disease State Deck'],
};

export interface ExtraField {
  key: string;
  label: string;
  options?: string[];
  placeholder?: string;
}

export const SUB_CHANNEL_FIELDS: Record<MediaChannelType, Record<string, ExtraField[]>> = {
  Digital: {
    'Programmatic Display': [
      { key: 'dsp', label: 'DSP', options: ['DV360', 'The Trade Desk', 'Amazon DSP', 'Yahoo DSP'] },
      { key: 'adEnvironment', label: 'Ad environment', options: ['Web', 'In-App', 'CTV'] },
    ],
    'Online Video (OLV)': [
      { key: 'videoLength', label: 'Video length', options: [':06', ':15', ':30', ':60'] },
      { key: 'skippable', label: 'Skippable', options: ['Yes', 'No'] },
    ],
    Native: [
      { key: 'contentProvider', label: 'Content provider', options: ['Outbrain', 'Taboola', 'Nativo'] },
      { key: 'headlineVariant', label: 'Headline variant', placeholder: 'e.g. A / B / C' },
    ],
    'High-Impact': [
      { key: 'unitType', label: 'Unit type', options: ['Interscroller', 'Adhesion', 'Pushdown', 'Rich Media'] },
      { key: 'vendor', label: 'Vendor', placeholder: 'e.g. GumGum, Kargo' },
    ],
    'Website Pages': [
      { key: 'pageTemplate', label: 'Page template', options: ['Landing', 'Article', 'ISI / PI', 'Resource hub'] },
      { key: 'cms', label: 'CMS / platform', options: ['AEM', 'Sitecore', 'Contentful', 'WordPress VIP'] },
    ],
  },
  Social: {
    Meta: [
      { key: 'placementSurface', label: 'Placement surface', options: ['Feed', 'Reels', 'Stories', 'Marketplace'] },
      { key: 'optimizationGoal', label: 'Optimization goal', options: ['Reach', 'Link Clicks', 'Landing Page Views', 'Conversions'] },
    ],
    TikTok: [
      { key: 'adObjective', label: 'Ad objective', options: ['In-Feed', 'TopView', 'Spark Ads', 'Branded Effect'] },
      { key: 'soundOn', label: 'Sound-on required', options: ['Yes', 'No'] },
    ],
    LinkedIn: [
      { key: 'adFormat', label: 'Ad format', options: ['Single Image', 'Carousel', 'Document', 'Conversation', 'Thought Leader'] },
      { key: 'audienceType', label: 'Audience type', options: ['Job Title', 'Skills', 'Company List', 'Member Groups'] },
    ],
    Reddit: [
      { key: 'subredditTargeting', label: 'Subreddit targeting', placeholder: 'e.g. r/leukemia, r/lymphoma' },
      { key: 'commentModeration', label: 'Comment moderation', options: ['On', 'Off'] },
    ],
  },
  Search: {
    'Google Ads': [
      { key: 'matchType', label: 'Match type', options: ['Exact', 'Phrase', 'Broad'] },
      { key: 'network', label: 'Network', options: ['Search', 'Search Partners', 'Display'] },
    ],
    'Microsoft Ads (Bing)': [
      { key: 'matchType', label: 'Match type', options: ['Exact', 'Phrase', 'Broad'] },
      { key: 'importSource', label: 'Import source', options: ['Google Import', 'Native'] },
    ],
  },
  SFMC: {
    'Triggered Send': [
      { key: 'triggerEvent', label: 'Trigger event', options: ['Form Fill', 'Rep Request', 'Milestone', 'Re-engagement'] },
      { key: 'sendClassification', label: 'Send classification', options: ['Commercial', 'Transactional'] },
    ],
    'Journey Builder': [
      { key: 'entrySource', label: 'Journey entry source', options: ['Data Extension', 'API Event', 'CloudPage', 'Salesforce Object'] },
      { key: 'waitLogic', label: 'Wait-step logic', placeholder: 'e.g. 3 days, then branch on open' },
    ],
    'Batch / Blast': [
      { key: 'sendClassification', label: 'Send classification', options: ['Commercial', 'Transactional'] },
      { key: 'suppressionList', label: 'Suppression list', placeholder: 'e.g. global unsub, HCP opt-out' },
    ],
  },
  IVA: {
    'Core Visual Aid': [
      { key: 'slideCount', label: 'Slide count', placeholder: 'e.g. 12' },
      { key: 'clmSystem', label: 'CLM system', options: ['Veeva CLM', 'IQVIA OCE', 'Custom'] },
    ],
    'Follow-Up Deck': [
      { key: 'slideCount', label: 'Slide count', placeholder: 'e.g. 6' },
      { key: 'triggerContext', label: 'Trigger context', options: ['Post-detail', 'Rep-requested', 'Congress follow-up'] },
    ],
    'Objection Handler': [
      { key: 'objectionTheme', label: 'Objection theme', options: ['Safety', 'Access', 'Logistics', 'Efficacy vs SOC'] },
      { key: 'mlrCode', label: 'MLR / approval code', placeholder: 'e.g. US-YES-2026-0042' },
    ],
    'Disease State Deck': [
      { key: 'branded', label: 'Branded', options: ['Unbranded', 'Branded'] },
      { key: 'detailPriority', label: 'Detail priority', options: ['Primary', 'Secondary', 'Reference only'] },
    ],
  },
};

// ---- assembler ------------------------------------------------------------

export function normalizeToken(v: string | undefined | null): string {
  return String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'na';
}

export interface BuiltToken {
  key: string;
  label: string;
  kind: TokenKind;
  raw: string;
  value: string;
}

/**
 * Assemble the Campaign Name taxonomy string from resolved inputs.
 * `inputs` is keyed by token key (country, medium, product, ta, target,
 * indication, messagingType, platform, year, code) with already-resolved values.
 */
export function buildCampaignTaxonomy(
  channel: MediaChannelType,
  inputs: Record<string, string>,
): { tokens: BuiltToken[]; string: string } {
  const tokens: BuiltToken[] = CAMPAIGN_FORMULA[channel].map(t => {
    const raw = inputs[t.key] ?? '';
    return { key: t.key, label: t.label, kind: t.kind, raw, value: normalizeToken(raw) };
  });
  return { tokens, string: tokens.map(t => t.value).join('_') };
}

/** Short machine code for the `Code (m)` token. */
export function generateCode(): string {
  return Math.random().toString(36).slice(2, 6);
}
