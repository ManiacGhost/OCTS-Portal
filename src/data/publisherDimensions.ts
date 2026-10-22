/**
 * Per-publisher dimension lists, generated from 'src/Channel-publisher based Dimensions.xlsx'
 * by scripts/gen_publisher_dimensions.py — do not edit by hand; re-run the script instead.
 *
 * Keyed by scope (`channel` or `channel/sub-channel`, matching KITE_SOURCES keys) then by
 * publisher. IVA and Search are deliberately not in the sheet and keep their existing model.
 */
export const PUBLISHER_DIMENSIONS: Record<string, Record<string, string[]>> = {
  'Digital/3P Email': {
    'Biopharm': ['eid', 'brd', 'src', 'chnl', 'tact_id', 'tact_nm', 'cpgn_id', 'cpgn', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'creative_id', 'creative_nm', 'subj_ln', 'url', 'devc_nm', 'asel_cd', 'act_cnt', 'npi', 'alrt_typ', 'act_typ', 'pkg_id', 'pkg_nm', 'plact_id', 'plact_nm', 'execution_date', 'execution_cycle_id'],
    'Medscape': ['eid', 'brd', 'src', 'chnl', 'tact_id', 'tact_nm', 'cpgn_id', 'cpgn', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'creative_id', 'creative_nm', 'subj_ln', 'devc_nm', 'aset_id', 'act_cnt', 'npi', 'sub_chnl', 'alrt_typ', 'topic', 'sub_topic', 'act_typ', 'ptnr_id', 'plact_id', 'plact_nm', 'execution_date', 'execution_cycle_id'],
    'Onclive': ['eid', 'brd', 'src', 'chnl', 'tact_nm', 'act_nm', 'act_dt', 'ta', 'indc', 'url', 'devc_nm', 'npi', 'alrt_typ', 'execution_date', 'execution_cycle_id'],
    'ReachMD': ['eid', 'brd', 'src', 'chnl', 'tact_id', 'cpgn', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'devc_nm', 'aset_id', 'npi', 'sub_chnl', 'alrt_typ', 'plact_nm', 'execution_date', 'execution_cycle_id'],
  },
  'Digital/Display': {
    'Biopharm': ['eid', 'brd', 'src', 'chnl', 'tact_id', 'cpgn_id', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'creative_id', 'creative_nm', 'url', 'devc_nm', 'aset_id', 'act_cnt', 'npi', 'alrt_typ', 'act_typ', 'pkg_id', 'pkg_nm', 'plact_id', 'plact_nm', 'execution_date', 'execution_cycle_id'],
    'DeepIntent': ['eid', 'brd', 'src', 'chnl', 'tact_nm', 'cpgn_id', 'act_nm', 'act_dt', 'ta', 'indc', 'url', 'devc_nm', 'npi', 'alrt_typ', 'audn_id', 'plact_id', 'aset_nm', 'aset_size', 'endemic', 'ad_grp_id', 'ad_grp_nm', 'ad_bnr_nm', 'execution_date', 'execution_cycle_id'],
    'Doximity': ['eid', 'brd', 'src', 'chnl', 'tact_nm', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'devc_nm', 'npi', 'alrt_typ', 'execution_date', 'execution_cycle_id'],
    'JCO': ['eid', 'brd', 'src', 'chnl', 'tact_nm', 'cpgn', 'act_nm', 'act_dt', 'ta', 'indc', 'devc_nm', 'aset_id', 'npi', 'alrt_typ', 'execution_date', 'execution_cycle_id'],
    'Medscape': ['eid', 'brd', 'src', 'chnl', 'tact_id', 'tact_nm', 'cpgn_id', 'cpgn', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'creative_id', 'creative_nm', 'url', 'devc_nm', 'aset_id', 'act_cnt', 'npi', 'sub_chnl', 'alrt_typ', 'topic', 'sub_topic', 'act_typ', 'ptnr_id', 'plact_id', 'plact_nm', 'page_desc', 'execution_date', 'execution_cycle_id'],
    'Onclive': ['eid', 'brd', 'src', 'chnl', 'tact_nm', 'act_nm', 'act_dt', 'ta', 'indc', 'url', 'devc_nm', 'npi', 'alrt_typ', 'execution_date', 'execution_cycle_id'],
    'Open Evidence': ['eid', 'brd', 'src', 'chnl', 'tact_nm', 'cpgn_id', 'cpgn', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'creative_nm', 'devc_nm', 'aset_id', 'act_cnt', 'npi', 'alrt_typ', 'act_typ', 'plact_id', 'plact_nm', 'execution_date', 'execution_cycle_id'],
    'ReachMD': ['eid', 'brd', 'src', 'chnl', 'tact_id', 'tact_nm', 'cpgn', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'devc_nm', 'aset_id', 'npi', 'sub_chnl', 'alrt_typ', 'topic', 'sub_topic', 'plact_nm', 'execution_date', 'execution_cycle_id'],
    'Relevate Health': ['eid', 'brd', 'src', 'chnl', 'tact_id', 'tact_nm', 'cpgn_id', 'cpgn', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'creative_id', 'devc_nm', 'aset_id', 'act_cnt', 'npi', 'sub_chnl', 'alrt_typ', 'act_typ', 'ptnr_id', 'pkg_id', 'plact_id', 'plact_nm', 'chnl_cd', 'aset_size', 'metric_cd', 'execution_date', 'execution_cycle_id'],
  },
  'Digital/3P SMS': {
    'Impiricus': ['eid', 'brd', 'src', 'chnl', 'tact_id', 'tact_nm', 'cpgn_id', 'cpgn', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'creative_nm', 'devc_nm', 'aset_id', 'global_id', 'suggestion_id', 'act_cnt', 'npi', 'alrt_typ', 'act_typ', 'plact_nm', 'execution_date', 'execution_cycle_id'],
  },
  'Email': {
    'SFMC': ['eid', 'brd', 'src', 'chnl', 'act_nm', 'act_dt', 'ta', 'indc', 'trans_id', 'subj_ln', 'url', 'devc_nm', 'aset_id', 'global_id', 'suggestion_id', 'email', 'npi', 'alrt_typ', 'topic', 'sub_topic', 'execution_date', 'execution_cycle_id'],
    'RTE': ['eid', 'npi', 'hcp_veeva_id', 'ta', 'prod_nm', 'indc', 'sls_frc_nm', 'chnl', 'trans_id', 'trans_dttime', 'terr_id', 'terr_nm', 'region_id', 'region_nm', 'area_id', 'area_nm', 'rep_id', 'rep_nm', 'email_stat', 'email_sent', 'email_opened', 'email_last_open_dt', 'email_clicked', 'email_last_clicked_dt', 'apv_email_tmpl', 'email_subj', 'valid_cnsnt_exist', 'url', 'devc_type', 'bus_mth_strt_dt', 'bus_wk_end_dt', 'alrt_typ', 'sgtn_id', 'topic', 'sub_topic', 'aset_id', 'execution_date', 'execution_cycle_id'],
  },
  'Social': {
    'Equals5': ['eid', 'brd', 'src', 'chnl', 'tact_nm', 'cpgn', 'act_nm', 'ta', 'indc', 'trans_id', 'creative_nm', 'devc_nm', 'aset_id', 'act_cnt', 'npi', 'sub_chnl', 'alrt_typ', 'act_typ', 'plact_nm', 'execution_date', 'execution_cycle_id'],
  },
};
