import { DIMENSION_CATEGORY } from './dimensionCategories';
import { KITE_CHANNELS, kiteSubChannels, kiteDimensionsFor } from './kiteTaxonomy';

export type DimGroupKey = 'core' | 'exec';

export interface DimGroupMeta {
  key: DimGroupKey;
  label: string;
  /** one-line explanation shown beside the heading */
  hint: string;
}

/** Display order: Core on top, then Execution / Engagement. */
export const DIM_GROUPS: DimGroupMeta[] = [
  { key: 'core', label: 'Core fields', hint: 'what the content is' },
  { key: 'exec', label: 'Execution / Engagement fields', hint: 'how it ran and how people engaged' },
];

/**
 * Fields the categorisation sheet (`Dimension_Categorization-v1.xlsx`) doesn't list, placed by us
 * using the sheet's own logic — Core = what the content *is* (brand/product, asset & creative
 * identity, subject line, template, deck); Execution/Engagement = how it ran and what happened
 * (campaign/placement/inventory, audience & recipient, sales-org, activity and email events, device,
 * dates and pipeline). These are OUR calls, not the client's — confirm with them.
 */
const INFERRED_CATEGORY: Record<string, DimGroupKey> = {
  // Core — content
  prod_nm: 'core', // product name, like brd
  email_subj: 'core', // like subj_ln
  apv_email_tmpl: 'core', // which approved template the content is
  deck_id: 'core', // parent visual aid — a content identifier, like aset_id
  slide_count: 'core', // content spec, like aset_size
  // Execution / Engagement — everything else we place
  endemic: 'exec', // placement inventory type
  audn_nm: 'exec', // audience name, like audn_id
  hcp_veeva_id: 'exec', // HCP identifier, like npi
  sls_frc_nm: 'exec',
  terr_id: 'exec',
  terr_nm: 'exec',
  region_id: 'exec',
  region_nm: 'exec',
  area_id: 'exec',
  area_nm: 'exec',
  rep_id: 'exec',
  rep_nm: 'exec',
  trans_dttime: 'exec', // like trans_id
  email_stat: 'exec',
  email_sent: 'exec',
  email_opened: 'exec',
  email_last_open_dt: 'exec',
  email_clicked: 'exec',
  email_last_clicked_dt: 'exec',
  valid_cnsnt_exist: 'exec',
  devc_type: 'exec', // like devc_nm
  bus_mth_strt_dt: 'exec', // reporting calendar, like execution_date
  bus_wk_end_dt: 'exec',
  sgtn_id: 'exec', // like suggestion_id
};

/** Tailwind classes per group: heading row, heading text, chip, and the chip's small code.
 *  Core is navy, Execution / Engagement a neutral graphite — colour on the chips themselves is
 *  reserved for common vs unique (see REACH_STYLE). */
export const DIM_GROUP_STYLE: Record<DimGroupKey, { row: string; text: string; chip: string; code: string; btn: string; btnActive: string }> = {
  core: {
    row: 'bg-navy-100/70 border-l-4 border-navy-600',
    text: 'text-navy-900',
    chip: 'text-navy-800 bg-navy-50 border-navy-200',
    code: 'text-navy-400',
    btn: 'text-navy-600 hover:text-navy-800 border-navy-300 hover:border-navy-500',
    btnActive: 'text-white bg-navy-600 border-navy-600',
  },
  exec: {
    row: 'bg-slate-100 border-l-4 border-slate-500',
    text: 'text-slate-800',
    chip: 'text-slate-700 bg-slate-50 border-slate-200',
    code: 'text-slate-400',
    btn: 'text-slate-600 hover:text-slate-800 border-slate-300 hover:border-slate-500',
    btnActive: 'text-white bg-slate-600 border-slate-600',
  },
};

export type DimReach = 'common' | 'unique';

/** Common = the field exists on EVERY channel / sub-channel; unique = on exactly one. Fields in
 *  between (some channels, not all) get no highlight. Navy for common (the portal's own colour),
 *  amber for unique so the two read apart at a glance. */
export const REACH_STYLE: Record<DimReach, { label: string; hint: string; chip: string; code: string; dot: string }> = {
  common: {
    label: 'On every channel',
    hint: 'available on every channel',
    chip: 'text-navy-800 bg-navy-50 border-navy-300',
    code: 'text-navy-400',
    dot: 'bg-navy-600',
  },
  unique: {
    label: 'On one channel only',
    hint: 'available on a single channel only',
    chip: 'text-amber-900 bg-amber-50 border-amber-400',
    code: 'text-amber-600',
    dot: 'bg-amber-500',
  },
};

// how many channel / sub-channel scopes each field is available on
const SCOPE_COUNT: Record<string, number> = {};
KITE_CHANNELS.forEach(ch => {
  const subs = kiteSubChannels(ch);
  (subs.length ? subs : ['']).forEach(s =>
    kiteDimensionsFor(ch, s).forEach(d => (SCOPE_COUNT[d.code] = (SCOPE_COUNT[d.code] || 0) + 1))
  );
});
const SCOPE_TOTAL = KITE_CHANNELS.reduce((n, ch) => n + Math.max(1, kiteSubChannels(ch).length), 0);
/** 'common' | 'unique', or null for a field on some channels but not all (shown unhighlighted). */
export const reachOf = (code: string): DimReach | null => {
  const n = SCOPE_COUNT[code] || 0;
  return n === SCOPE_TOTAL ? 'common' : n === 1 ? 'unique' : null;
};

/** Chip / code-pill classes for a field: its reach colour, or the neutral style when it has none. */
export const reachChipClass = (code: string, neutral: string) => {
  const r = reachOf(code);
  return r ? REACH_STYLE[r].chip : neutral;
};
export const reachCodeClass = (code: string, neutral: string) => {
  const r = reachOf(code);
  return r ? REACH_STYLE[r].code : neutral;
};

/** The sheet's call first, then ours; anything still unknown (a field added later) lands in
 *  Execution / Engagement, the larger group. */
export const dimGroupOf = (code: string): DimGroupKey =>
  DIMENSION_CATEGORY[code]?.group ?? INFERRED_CATEGORY[code] ?? 'exec';

/** Splits dimensions into the groups above (empty groups omitted), keeping each group's own order. */
export function groupDims<T extends { code: string }>(dims: T[]): { meta: DimGroupMeta; items: T[] }[] {
  return DIM_GROUPS.map(meta => ({ meta, items: dims.filter(d => dimGroupOf(d.code) === meta.key) })).filter(
    g => g.items.length > 0
  );
}

/** A–Z by display label (a copy; the input is untouched). */
export const byLabel = <T extends { label: string }>(dims: T[]): T[] =>
  [...dims].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
