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

// The allowed values of every dropdown field live in the Kite dictionary (kiteDictionary.ts) — the
// forms read them from there, so nothing is hardcoded here.

// ---- Campaign Name formula (same for every channel) ----------------------------
//
//   country_TA_productcode_indication_messagingtype_audience_segmentname_segmentvalue_campaigntype_objective
//
// Channel is deliberately NOT part of it, and neither is a machine code (client: "Channel removed —
// same campaign formula across channels … Code excluded"). Segment is split into name + value so a
// delimiter inside the value can't break the string. The campaign dates are captured on the campaign
// itself and are deliberately NOT part of the formula.

export const CAMPAIGN_FORMULA: FormulaToken[] = [
  { key: 'country', name: 'country', label: 'Country', kind: 'c', source: 'input' },
  { key: 'ta', name: 'TA', label: 'Therapeutic area', kind: 'c', source: 'ta' },
  { key: 'product', name: 'productcode', label: 'Product code', kind: 'c', source: 'brand' },
  { key: 'indication', name: 'indication', label: 'Indication', kind: 'c', source: 'input' },
  { key: 'messagingType', name: 'messagingtype', label: 'Messaging type', kind: 'c', source: 'input' },
  { key: 'audience', name: 'audience', label: 'Audience', kind: 'c', source: 'input' },
  { key: 'segmentName', name: 'segmentname', label: 'Segment name', kind: 'f', source: 'input' },
  { key: 'segmentValue', name: 'segmentvalue', label: 'Segment value', kind: 'f', source: 'input' },
  { key: 'campaignType', name: 'campaigntype', label: 'Campaign type', kind: 'c', source: 'input' },
  { key: 'objective', name: 'objective', label: 'Objective', kind: 'c', source: 'input' },
];

/** The formula as the client writes it: country_TA_productcode_…_objective (no date — dates are campaign details) */
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
