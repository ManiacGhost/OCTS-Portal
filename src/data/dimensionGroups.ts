import { KITE_CHANNELS, kiteSubChannels, kiteDimensionsFor } from './kiteTaxonomy';

export type DimGroupKey = 'ga' | 'content';

export interface DimGroupMeta {
  key: DimGroupKey;
  label: string;
  /** one-line explanation shown beside the heading */
  hint: string;
}

/** Display order: GA tags on top, then Content tags. */
export const DIM_GROUPS: DimGroupMeta[] = [
  { key: 'ga', label: 'GA tags', hint: 'the fields analytics reads' },
  { key: 'content', label: 'Content tags', hint: 'everything else that describes the content' },
];

/** The only GA tags: Source, Campaign, Channel, Creative and Tactic (the name fields).
 *  Every other dimension is a Content attribute. */
const GA_CODES = ['src', 'cpgn', 'chnl', 'creative_nm', 'tact_nm'];

/** Tailwind classes per group: heading row, heading text, chip, and the chip's small code.
 *  GA is navy, Content a neutral graphite — colour on the chips themselves is
 *  reserved for common vs unique (see REACH_STYLE). */
export const DIM_GROUP_STYLE: Record<DimGroupKey, { row: string; text: string; chip: string; code: string; btn: string; btnActive: string }> = {
  ga: {
    row: 'bg-navy-100/70 border-l-4 border-navy-600',
    text: 'text-navy-900',
    chip: 'text-navy-800 bg-navy-50 border-navy-200',
    code: 'text-navy-400',
    btn: 'text-navy-600 hover:text-navy-800 border-navy-300 hover:border-navy-500',
    btnActive: 'text-white bg-navy-600 border-navy-600',
  },
  content: {
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
    label: 'Multi channel',
    hint: 'available on every channel',
    chip: 'text-navy-800 bg-navy-50 border-navy-300',
    code: 'text-navy-400',
    dot: 'bg-navy-600',
  },
  unique: {
    label: 'Single channel',
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

export const dimGroupOf = (code: string): DimGroupKey => (GA_CODES.includes(code) ? 'ga' : 'content');

/** Splits dimensions into the groups above (empty groups omitted), keeping each group's own order. */
export function groupDims<T extends { code: string }>(dims: T[]): { meta: DimGroupMeta; items: T[] }[] {
  return DIM_GROUPS.map(meta => ({ meta, items: dims.filter(d => dimGroupOf(d.code) === meta.key) })).filter(
    g => g.items.length > 0
  );
}

/** A–Z by display label (a copy; the input is untouched). */
export const byLabel = <T extends { label: string }>(dims: T[]): T[] =>
  [...dims].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
