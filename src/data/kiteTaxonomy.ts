/**
 * Kite-specific taxonomy model (replaces the generic dimension catalogue on the
 * Tagging Strategy screen and in the Code & UTM Generator).
 *
 * Channels: Digital, Social, Email — nothing else.
 *   Digital sub-channels: 3P Email, 3P SMS, Display
 *   Social / Email: no sub-channels
 *
 * Dimensions come from the C360 taxonomy sheet (image 2). Each C360 source
 * (image 1) marks every dimension present (Y) or absent (N). A channel /
 * sub-channel shows the union of the dimensions present across its sources.
 */

import { PUBLISHER_DIMENSIONS } from './publisherDimensions';

export interface KiteDimension {
  code: string;
  label: string;
  captures: string;
}

/** The full C360 field list (taxonomy sheet header row). */
export const KITE_DIMENSIONS: KiteDimension[] = [
  { code: 'src', label: 'Source', captures: 'Delivery source / vendor' },
  { code: 'brd', label: 'Brand', captures: 'Promoted brand' },
  { code: 'cpgn', label: 'Campaign', captures: 'Campaign name' },
  { code: 'cpgn_id', label: 'Campaign ID', captures: 'Campaign identifier' },
  { code: 'tact_id', label: 'Tactic ID', captures: 'Tactic identifier' },
  { code: 'tact_nm', label: 'Tactic name', captures: 'Tactic name' },
  { code: 'plact_nm', label: 'Placement name', captures: 'Placement name' },
  { code: 'creative_id', label: 'Creative ID', captures: 'Creative identifier' },
  { code: 'creative_nm', label: 'Creative name', captures: 'Creative name' },
  { code: 'audn_id', label: 'Audience ID', captures: 'Audience identifier' },
  { code: 'audn_nm', label: 'Audience name', captures: 'Audience name' },
  { code: 'aset_id', label: 'Asset ID', captures: 'Asset identifier' },
  { code: 'global_id', label: 'Global ID', captures: 'Global content ID' },
  { code: 'suggestion_id', label: 'Suggestion ID', captures: 'AI suggestion identifier' },
  { code: 'topic', label: 'Topic', captures: 'Content topic' },
  { code: 'sub_topic', label: 'Sub-topic', captures: 'Content sub-topic' },
  { code: 'indc', label: 'Indication', captures: 'Indication' },
  { code: 'chnl', label: 'Channel', captures: 'Channel' },
  { code: 'sub_chnl', label: 'Sub-channel', captures: 'Sub-channel' },
  { code: 'email', label: 'Email', captures: 'Recipient email' },
  { code: 'subj_ln', label: 'Subject line', captures: 'Email subject line' },
  { code: 'url', label: 'URL', captures: 'Landing / click URL' },
  { code: 'devc_nm', label: 'Device name', captures: 'Device' },
  // Impiricus (3P SMS) source-specific fields — extracted from the Impiricus feed spec.
  { code: 'pulse_name', label: 'Pulse name', captures: 'Impiricus tactic identifier string' },
  { code: 'vault_asset_id', label: 'Vault asset ID', captures: 'Veeva Vault asset id' },
  { code: 'npi', label: 'NPI', captures: 'HCP national provider identifier' },
  // IVA (field / CLM) source-specific fields.
  { code: 'slide_count', label: 'Slide count', captures: 'Slides in the deck' },
  { code: 'deck_id', label: 'Deck ID', captures: 'Parent visual-aid id' },
  // Fields from 'Channel-publisher based Dimensions.xlsx' (see publisherDimensions.ts). The sheet has no
  // definitions, so labels are expanded from the abbreviated codes. STILL TO CONFIRM WITH THE CLIENT:
  // eid, asel_cd, sgtn_id (cryptic); the rest are best-effort reads.
  { code: 'eid', label: 'EID', captures: 'Publisher-sheet identifier' },
  { code: 'act_nm', label: 'Activity name', captures: 'Activity name' },
  { code: 'act_dt', label: 'Activity date', captures: 'Activity date' },
  { code: 'act_typ', label: 'Activity type', captures: 'Activity type' },
  { code: 'act_cnt', label: 'Activity count', captures: 'Number of activities' },
  { code: 'alrt_typ', label: 'Alert type', captures: 'Alert type' },
  { code: 'ta', label: 'Therapeutic area', captures: 'Therapeutic area' },
  { code: 'trans_id', label: 'Transaction ID', captures: 'Transaction identifier' },
  { code: 'trans_dttime', label: 'Transaction date-time', captures: 'Transaction date and time' },
  { code: 'execution_date', label: 'Execution date', captures: 'Date the activity ran' },
  { code: 'execution_cycle_id', label: 'Execution cycle ID', captures: 'Execution cycle identifier' },
  { code: 'plact_id', label: 'Placement ID', captures: 'Placement identifier' },
  { code: 'pkg_id', label: 'Package ID', captures: 'Package identifier' },
  { code: 'pkg_nm', label: 'Package name', captures: 'Package name' },
  { code: 'ptnr_id', label: 'Partner ID', captures: 'Partner identifier' },
  { code: 'asel_cd', label: 'ASEL code', captures: 'Publisher-sheet code' },
  { code: 'aset_nm', label: 'Asset name', captures: 'Asset name' },
  { code: 'aset_size', label: 'Asset size', captures: 'Asset size' },
  { code: 'endemic', label: 'Endemic', captures: 'Whether the placement is endemic inventory' },
  { code: 'ad_grp_id', label: 'Ad group ID', captures: 'Ad group identifier' },
  { code: 'ad_grp_nm', label: 'Ad group name', captures: 'Ad group name' },
  { code: 'ad_bnr_nm', label: 'Ad banner name', captures: 'Ad banner name' },
  { code: 'page_desc', label: 'Page description', captures: 'Page description' },
  { code: 'chnl_cd', label: 'Channel code', captures: 'Channel code' },
  { code: 'metric_cd', label: 'Metric code', captures: 'Metric code' },
  { code: 'devc_type', label: 'Device type', captures: 'Device type' },
  { code: 'hcp_veeva_id', label: 'HCP Veeva ID', captures: 'HCP identifier in Veeva' },
  { code: 'prod_nm', label: 'Product name', captures: 'Product name' },
  { code: 'sls_frc_nm', label: 'Sales force name', captures: 'Sales force name' },
  { code: 'terr_id', label: 'Territory ID', captures: 'Territory identifier' },
  { code: 'terr_nm', label: 'Territory name', captures: 'Territory name' },
  { code: 'region_id', label: 'Region ID', captures: 'Region identifier' },
  { code: 'region_nm', label: 'Region name', captures: 'Region name' },
  { code: 'area_id', label: 'Area ID', captures: 'Area identifier' },
  { code: 'area_nm', label: 'Area name', captures: 'Area name' },
  { code: 'rep_id', label: 'Rep ID', captures: 'Sales rep identifier' },
  { code: 'rep_nm', label: 'Rep name', captures: 'Sales rep name' },
  { code: 'sgtn_id', label: 'SGTN ID', captures: 'Suggestion-related identifier' },
  { code: 'email_stat', label: 'Email status', captures: 'Email delivery status' },
  { code: 'email_sent', label: 'Email sent', captures: 'Email sent' },
  { code: 'email_opened', label: 'Email opened', captures: 'Email opened' },
  { code: 'email_last_open_dt', label: 'Email last opened date', captures: 'Date the email was last opened' },
  { code: 'email_clicked', label: 'Email clicked', captures: 'Email clicked' },
  { code: 'email_last_clicked_dt', label: 'Email last clicked date', captures: 'Date the email was last clicked' },
  { code: 'email_subj', label: 'Email subject', captures: 'Email subject' },
  { code: 'apv_email_tmpl', label: 'Approved email template', captures: 'Approved email template' },
  { code: 'valid_cnsnt_exist', label: 'Valid consent exists', captures: 'Whether valid consent exists' },
  { code: 'bus_mth_strt_dt', label: 'Business month start date', captures: 'Business month start date' },
  { code: 'bus_wk_end_dt', label: 'Business week end date', captures: 'Business week end date' },
];

export const KITE_CHANNELS = ['Digital', 'Social', 'Search', 'Email', 'IVA'] as const;
export type KiteChannel = (typeof KITE_CHANNELS)[number];

export const KITE_SUBCHANNELS: Record<KiteChannel, string[]> = {
  Digital: ['3P Email', '3P SMS', 'Display'],
  Social: [],
  Search: [],
  Email: [],
  IVA: [],
};

export const KITE_MEDIUM: Record<KiteChannel, string> = {
  Digital: 'digital',
  Social: 'social',
  Search: 'search',
  Email: 'email',
  IVA: 'field',
};

/** C360 sources feeding each channel / sub-channel (image 1). */
export const KITE_SOURCES: Record<string, string[]> = {
  'Digital/3P Email': ['Medscape', 'ReachMD'],
  'Digital/3P SMS': ['Impiricus'],
  'Digital/Display': ['DeepIntent', 'Medscape', 'Open Evidence', 'ReachMD', 'Relevate Health'],
  Social: ['Equals5'],
  Search: ['Google Ads'],
  Email: ['SFMC', 'Relevate Health'],
  IVA: ['Veeva CLM'],
};

// ---------------------------------------------------------------------------
// Dimension presence per source (C360 taxonomy sheet). Y = present, N = absent.
// Column order after `src` (22 C360 cols; any trailing args default to N):
//   brd cpgn cpgn_id tact_id tact_nm plact_nm creative_id creative_nm
//   audn_id audn_nm aset_id global_id suggestion_id topic sub_topic indc
//   chnl sub_chnl email subj_ln url devc_nm
//   [then Impiricus extras: pulse_name vault_asset_id npi]
// ---------------------------------------------------------------------------
const Y = true;
const N = false;
type PresenceRow = Record<string, boolean>;

function row(...vals: boolean[]): PresenceRow {
  const codes = KITE_DIMENSIONS.slice(1).map(d => d.code); // skip 'src' (always present)
  const r: PresenceRow = { src: Y };
  codes.forEach((c, i) => (r[c] = vals[i] ?? N));
  return r;
}

export const KITE_SOURCE_PRESENCE: Record<string, PresenceRow> = {
  //                  brd cpgn cpgn_id tact_id tact_nm plact_nm cr_id cr_nm audn_id audn_nm aset_id global_id sugg_id topic sub_topic indc chnl sub_chnl email subj_ln url devc
  // Evoke agency spec (2026-09) confirms SFMC captures Audience — flipped audn_id/audn_nm to Y.
  SFMC:              row(Y,  N,   N,      N,      N,      N,       N,    N,    Y,      Y,      Y,      Y,        Y,      Y,    Y,        Y,   Y,   N,       Y,    Y,      Y,  Y),
  // Evoke agency spec (2026-09) confirms "Paid Media" captures Audience, Campaign, Tactic,
  // Topic/Subtopic and Creative — flipped whichever of those were still N below (Digital,
  // Social, Search are all "Paid Media" in that spec). Comments mark each flipped cell.
  //                  brd cpgn cpgn_id …                                                          chnl sub_chnl …                 | pulse vault npi
  Impiricus:         row(Y,  Y,   Y,      Y,      Y,      N,       Y,    Y,    Y,      Y,      N,      N,        N,      Y,    Y,        N,   Y,   Y,       N,    N,      N,  N,   Y,    Y,    Y), // +tact_id/nm, +creative_id/nm, +audn_id/nm, +topic/sub_topic
  ReachMD:           row(Y,  Y,   N,      N,      Y,      Y,       N,    N,    N,      N,      Y,      N,        N,      Y,    Y,        Y,   Y,   Y,       N,    N,      N,  Y),
  'Open Evidence':   row(Y,  Y,   Y,      N,      Y,      Y,       N,    Y,    N,      N,      Y,      N,        N,      N,    N,        Y,   Y,   N,       N,    N,      N,  Y),
  Medscape:          row(Y,  Y,   Y,      Y,      Y,      Y,       Y,    Y,    Y,      Y,      Y,      N,        N,      N,    N,        Y,   Y,   Y,       N,    Y,      Y,  Y), // +audn_id/nm
  Equals5:           row(Y,  Y,   Y,      Y,      Y,      Y,       Y,    Y,    Y,      Y,      Y,      N,        N,      Y,    Y,        Y,   Y,   Y,       N,    N,      N,  Y), // +cpgn_id, +tact_id, +creative_id, +audn_id/nm, +topic/sub_topic
  'Relevate Health': row(Y,  Y,   Y,      Y,      Y,      Y,       Y,    N,    N,      N,      Y,      N,        N,      N,    N,        Y,   Y,   Y,       N,    N,      Y,  Y),
  DeepIntent:        row(Y,  Y,   Y,      N,      Y,      Y,       N,    N,    Y,      N,      Y,      Y,        Y,      N,    N,        Y,   Y,   N,       N,    N,      Y,  Y),
  //                  brd cpgn cpgn_id …                                        aset global …  topic sub_top indc chnl sub_chnl …    url dev
  'Google Ads':      row(Y,  Y,   Y,      Y,      Y,      N,       Y,    Y,    Y,      Y,      Y,      Y,        N,      Y,    Y,        Y,   Y,   N,       N,    N,      Y,  Y), // +tact_id/nm, +audn_id/nm
  //                  brd cpgn cpgn_id …                                        aset global …  topic sub_top indc chnl sub_chnl …    url … | (impiricus N) | slide deck
  'Veeva CLM':        row(Y,  Y,   Y,      N,      N,      N,       N,    N,    N,      N,      Y,      Y,        N,      Y,    Y,        Y,   Y,   N,       N,    N,      Y,  N,   N,    N,    N,  Y,    Y),
};

// ---------------------------------------------------------------------------

export function kiteSubChannels(channel: string): string[] {
  return KITE_SUBCHANNELS[channel as KiteChannel] || [];
}

/**
 * Whether publisher-sheet scopes also show fields the portal used to add per publisher (the old
 * KITE_SOURCE_PRESENCE rows) on top of the sheet's own list. OFF: the client wants the sheet's real
 * dimensions only. Flip to `true` to bring the portal-added fields (and their purple tags) back.
 */
export const INCLUDE_PORTAL_FIELDS = false;

const scopeKey = (channel: string, subChannel: string) => (subChannel ? `${channel}/${subChannel}` : channel);

/** True when this scope is driven by the publisher sheet (3P Email, 3P SMS, Display, Email, Social).
 *  IVA and Search keep the original source model and have no per-publisher view. */
export function isPublisherScope(channel: string, subChannel: string): boolean {
  return !!PUBLISHER_DIMENSIONS[scopeKey(channel, subChannel)];
}

/** Publishers / sources for a scope — the sheet's publishers where it has them. */
export function kiteSourcesFor(channel: string, subChannel: string): string[] {
  const key = scopeKey(channel, subChannel);
  return PUBLISHER_DIMENSIONS[key] ? Object.keys(PUBLISHER_DIMENSIONS[key]) : KITE_SOURCES[key] || [];
}

export interface KiteScopedDimension extends KiteDimension {
  /** publishers / sources in this scope that carry the dimension (sheet + portal) */
  sources: string[];
  /** publishers that list it in the publisher sheet */
  sheetSources: string[];
  /** publishers that carry it only because the portal model adds it (not in the sheet) */
  portalSources: string[];
}

/**
 * Dimensions present for a channel / sub-channel = union across its publishers (or just `publisher`
 * when given).
 *
 * Publisher-sheet scopes: a publisher carries a dimension if the sheet lists it, in the sheet's own
 * order; dimensions the portal model adds for that publisher (KITE_SOURCE_PRESENCE) but the sheet
 * doesn't list follow, flagged via `portalSources`. Other scopes (IVA, Search): the original
 * source-presence logic, unchanged.
 */
export function kiteDimensionsFor(channel: string, subChannel: string, publisher?: string): KiteScopedDimension[] {
  const key = scopeKey(channel, subChannel);
  const sheet = PUBLISHER_DIMENSIONS[key];
  const pubs = publisher ? [publisher] : kiteSourcesFor(channel, subChannel);

  if (!sheet) {
    return KITE_DIMENSIONS.map(d => {
      const present = pubs.filter(p => KITE_SOURCE_PRESENCE[p]?.[d.code]);
      return present.length ? { ...d, sources: present, sheetSources: present, portalSources: [] } : null;
    }).filter((d): d is KiteScopedDimension => !!d);
  }

  // sheet order: first-seen across the chosen publishers
  const order: string[] = [];
  pubs.forEach(p => (sheet[p] || []).forEach(c => !order.includes(c) && order.push(c)));
  // portal-added codes (not in any chosen publisher's sheet list), in portal order
  if (INCLUDE_PORTAL_FIELDS) {
    KITE_DIMENSIONS.forEach(d => {
      if (!order.includes(d.code) && pubs.some(p => KITE_SOURCE_PRESENCE[p]?.[d.code])) order.push(d.code);
    });
  }

  return order
    .map(code => {
      const def = kiteDimensionByCode(code);
      if (!def) return null;
      const sheetSources = pubs.filter(p => (sheet[p] || []).includes(code));
      const portalSources = INCLUDE_PORTAL_FIELDS
        ? pubs.filter(p => !sheetSources.includes(p) && KITE_SOURCE_PRESENCE[p]?.[code])
        : [];
      return { ...def, sources: [...sheetSources, ...portalSources], sheetSources, portalSources };
    })
    .filter((d): d is KiteScopedDimension => !!d);
}

export function kiteDimensionByCode(code: string): KiteDimension | undefined {
  return KITE_DIMENSIONS.find(d => d.code === code || d.label === code);
}
