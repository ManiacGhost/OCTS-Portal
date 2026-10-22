/**
 * Core vs Execution/Engagement split of the dimensions, generated from
 * 'src/Dimension_Categorization-v1.xlsx' by scripts/gen_dimension_categories.py — don't hand-edit.
 *
 *   core  = the sheet's 'Content' category (sub-types Core, Spec)
 *   exec  = the sheet's 'Execution/Eng' category (sub-types Execution, Engagement)
 * Fields the sheet doesn't list are simply absent here (the UI shows them as 'Other').
 */
export type DimensionGroup = 'core' | 'exec';

export const DIMENSION_CATEGORY: Record<string, { group: DimensionGroup; subType: string }> = {
  brd: { group: 'core', subType: 'Core' },
  ta: { group: 'core', subType: 'Core' },
  indc: { group: 'core', subType: 'Core' },
  aset_id: { group: 'core', subType: 'Core' },
  aset_nm: { group: 'core', subType: 'Core' },
  global_id: { group: 'core', subType: 'Core' },
  creative_id: { group: 'core', subType: 'Core' },
  creative_nm: { group: 'core', subType: 'Core' },
  ad_bnr_nm: { group: 'core', subType: 'Core' },
  topic: { group: 'core', subType: 'Core' },
  sub_topic: { group: 'core', subType: 'Core' },
  subj_ln: { group: 'core', subType: 'Core' },
  sub_ln: { group: 'core', subType: 'Core' },
  url: { group: 'core', subType: 'Core' },
  aset_size: { group: 'core', subType: 'Spec' },
  src: { group: 'exec', subType: 'Execution' },
  chnl: { group: 'exec', subType: 'Execution' },
  sub_chnl: { group: 'exec', subType: 'Execution' },
  chnl_cd: { group: 'exec', subType: 'Execution' },
  cpgn: { group: 'exec', subType: 'Execution' },
  cpgn_id: { group: 'exec', subType: 'Execution' },
  tact_id: { group: 'exec', subType: 'Execution' },
  tact_nm: { group: 'exec', subType: 'Execution' },
  plact_id: { group: 'exec', subType: 'Execution' },
  plact_nm: { group: 'exec', subType: 'Execution' },
  ad_grp_id: { group: 'exec', subType: 'Execution' },
  ad_grp_nm: { group: 'exec', subType: 'Execution' },
  pkg_id: { group: 'exec', subType: 'Execution' },
  pkg_nm: { group: 'exec', subType: 'Execution' },
  ptnr_id: { group: 'exec', subType: 'Execution' },
  audn_id: { group: 'exec', subType: 'Execution' },
  banner: { group: 'exec', subType: 'Execution' },
  alrt_typ: { group: 'exec', subType: 'Execution' },
  asel_cd: { group: 'exec', subType: 'Execution' },
  execution_date: { group: 'exec', subType: 'Execution' },
  execution_cycle_id: { group: 'exec', subType: 'Execution' },
  eid: { group: 'exec', subType: 'Engagement' },
  act_nm: { group: 'exec', subType: 'Engagement' },
  act_dt: { group: 'exec', subType: 'Engagement' },
  act_cnt: { group: 'exec', subType: 'Engagement' },
  act_typ: { group: 'exec', subType: 'Engagement' },
  devc_nm: { group: 'exec', subType: 'Engagement' },
  npi: { group: 'exec', subType: 'Engagement' },
  email: { group: 'exec', subType: 'Engagement' },
  page_desc: { group: 'exec', subType: 'Engagement' },
  metric_cd: { group: 'exec', subType: 'Engagement' },
  trans_id: { group: 'exec', subType: 'Engagement' },
  suggestion_id: { group: 'exec', subType: 'Engagement' },
};
