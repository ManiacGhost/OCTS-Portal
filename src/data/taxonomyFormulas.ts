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

export const CHANNEL_TYPES: MediaChannelType[] = ['Digital', 'Social', 'Email'];

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
  Email: 'Email',
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
  // country _ medium _ product code _ messaging type _ therapeutic area _ target _ indication _ sub-channel _ year _ Code
  Digital: [
    COUNTRY,
    MEDIUM,
    PRODUCT,
    { key: 'messagingType', label: 'Messaging type', kind: 'c', source: 'input', options: MESSAGING_TYPES },
    TA,
    TARGET,
    INDICATION,
    { key: 'platform', label: 'Sub-channel', kind: 'c', source: 'subChannel' },
    YEAR,
    CODE,
  ],
  // country _ medium _ product code _ therapeutic area _ target _ indication _ year _ Code
  Social: [COUNTRY, MEDIUM, PRODUCT, TA, TARGET, INDICATION, YEAR, CODE],
  Email: [COUNTRY, MEDIUM, PRODUCT, TA, TARGET, INDICATION, YEAR, CODE],
};

/** Human-readable formula template shown in the breakdown panel. */
export function formulaTemplate(channel: MediaChannelType): string {
  return CAMPAIGN_FORMULA[channel].map(t => `${t.label} (${t.kind})`).join(' _ ');
}

// ---- sub-channels & their extra fields -------------------------------------

export const SUB_CHANNELS: Record<MediaChannelType, string[]> = {
  Digital: ['3P Email', '3P SMS', 'Display'],
  Social: [],
  Email: [],
};

export interface ExtraField {
  key: string;
  label: string;
  options?: string[];
  placeholder?: string;
}

export const SUB_CHANNEL_FIELDS: Record<MediaChannelType, Record<string, ExtraField[]>> = {
  Digital: {
    '3P Email': [
      { key: 'vendor', label: 'Vendor', options: ['Medscape', 'ReachMD'] },
      { key: 'subjLine', label: 'Subject line', placeholder: 'e.g. See the 2-year data' },
    ],
    '3P SMS': [
      { key: 'vendor', label: 'Vendor', options: ['Impiricus'] },
      { key: 'shortCode', label: 'Short code', placeholder: 'e.g. 55512' },
    ],
    Display: [
      { key: 'vendor', label: 'Vendor', options: ['DeepIntent', 'Medscape', 'Open Evidence', 'ReachMD', 'Relevate Health'] },
      { key: 'adSize', label: 'Ad size', options: ['300x250', '728x90', '160x600', '970x250', '1x1'] },
    ],
  },
  Social: {},
  Email: {},
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
