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

export const CHANNEL_TYPES: MediaChannelType[] = ['Digital', 'Social', 'Search', 'Email', 'IVA', 'Website'];

export type TokenKind = 'c' | 'v' | 'm' | 'f';

/** How a token's value is resolved in the builder. */
export type TokenSource =
  | 'input' // planner picks it
  | 'brand' // = brand.code
  | 'ta'; // = therapeutic area

export interface FormulaToken {
  key: string;
  /** the token's name exactly as written in the approved formula (e.g. `productcode`) */
  name: string;
  label: string;
  kind: TokenKind;
  source: TokenSource;
  /** options when kind === 'c' and source === 'input' */
  options?: string[];
}

// ---- controlled vocabularies -------------------------------------------------

export const COUNTRIES = ['US', 'CA', 'GB', 'DE', 'FR', 'Global'];
/** Campaign formula: branded / unbranded only. */
export const MESSAGING_TYPES = ['Branded', 'Unbranded'];
/** Campaign formula `audience`: HCP or DTP (confirm HCP / DTP vs DTC with the client). */
export const AUDIENCES = ['HCP', 'DTP'];
/** Used by the UTM generator's audience picker. */
export const TARGETS = ['HCP', 'DTP', 'Patient', 'Caregiver', 'Payer'];
/** Indication is "Cancer" — captured at the specific CAR-T level. */
export const INDICATIONS = ['LBCL', 'FL', 'MCL', 'B-ALL'];
/** `always_on` = ongoing; `specific` = marketing-led, with its own window. */
export const CAMPAIGN_TYPES = ['Always on', 'Specific'];
/** Optional — the field stays in the formula even when left blank. */
export const OBJECTIVES = ['Awareness', 'Referral'];

// ---- Campaign Name formula (same for every channel) ----------------------------
//
//   country_TA_productcode_indication_messagingtype_audience_segmentname_segmentvalue_campaigntype_objective_date
//
// Channel is deliberately NOT part of it, and neither is a machine code (client: "Channel removed —
// same campaign formula across channels … Code excluded"). Segment is split into name + value so a
// delimiter inside the value can't break the string. `date` is always a range, YYYYMM-YYYYMM
// (always_on = Jan–Dec; specific = its own window).

export const CAMPAIGN_FORMULA: FormulaToken[] = [
  { key: 'country', name: 'country', label: 'Country', kind: 'c', source: 'input', options: COUNTRIES },
  { key: 'ta', name: 'TA', label: 'Therapeutic area', kind: 'c', source: 'ta' },
  { key: 'product', name: 'productcode', label: 'Product code', kind: 'c', source: 'brand' },
  { key: 'indication', name: 'indication', label: 'Indication', kind: 'c', source: 'input', options: INDICATIONS },
  { key: 'messagingType', name: 'messagingtype', label: 'Messaging type', kind: 'c', source: 'input', options: MESSAGING_TYPES },
  { key: 'audience', name: 'audience', label: 'Audience', kind: 'c', source: 'input', options: AUDIENCES },
  { key: 'segmentName', name: 'segmentname', label: 'Segment name', kind: 'f', source: 'input' },
  { key: 'segmentValue', name: 'segmentvalue', label: 'Segment value', kind: 'f', source: 'input' },
  { key: 'campaignType', name: 'campaigntype', label: 'Campaign type', kind: 'c', source: 'input', options: CAMPAIGN_TYPES },
  { key: 'objective', name: 'objective', label: 'Objective', kind: 'c', source: 'input', options: OBJECTIVES },
  { key: 'date', name: 'date', label: 'Date', kind: 'v', source: 'input' },
];

/** The formula as the client writes it: country_TA_productcode_…_date */
export const FORMULA_TEMPLATE = CAMPAIGN_FORMULA.map(t => t.name).join('_');

/** Human-readable formula template shown in the breakdown panel. */
export function formulaTemplate(): string {
  return FORMULA_TEMPLATE;
}

// ---- sub-channels & their extra fields -------------------------------------

export const SUB_CHANNELS: Record<MediaChannelType, string[]> = {
  Digital: ['3P Email', '3P SMS', 'Display'],
  Social: [],
  Search: [],
  Email: [],
  IVA: [],
  Website: [],
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
  Search: {},
  Email: {},
  IVA: {},
  Website: {},
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
 * `inputs` is keyed by token key (country, ta, product, indication, messagingType, audience,
 * segmentName, segmentValue, campaignType, objective, date) with already-resolved values.
 * The formula is the same for every channel and carries no channel token.
 */
export function buildCampaignTaxonomy(
  inputs: Record<string, string>,
): { tokens: BuiltToken[]; string: string } {
  const tokens: BuiltToken[] = CAMPAIGN_FORMULA.map(t => {
    const raw = inputs[t.key] ?? '';
    return { key: t.key, label: t.label, kind: t.kind, raw, value: normalizeToken(raw) };
  });
  return { tokens, string: tokens.map(t => t.value).join('_') };
}
