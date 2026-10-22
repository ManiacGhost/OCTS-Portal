import { DIMENSION_CATEGORY } from './dimensionCategories';

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

/** Tailwind classes per group: heading row, heading text, chip, and the chip's small code. */
export const DIM_GROUP_STYLE: Record<DimGroupKey, { row: string; text: string; chip: string; code: string }> = {
  core: {
    row: 'bg-navy-100/70 border-l-4 border-navy-600',
    text: 'text-navy-900',
    chip: 'text-navy-800 bg-navy-50 border-navy-200',
    code: 'text-navy-400',
  },
  exec: {
    row: 'bg-sky-50 border-l-4 border-sky-500',
    text: 'text-sky-900',
    chip: 'text-sky-800 bg-sky-50 border-sky-200',
    code: 'text-sky-500',
  },
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
