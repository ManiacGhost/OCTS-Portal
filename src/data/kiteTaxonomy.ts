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
];

export const KITE_CHANNELS = ['Digital', 'Social', 'Email'] as const;
export type KiteChannel = (typeof KITE_CHANNELS)[number];

export const KITE_SUBCHANNELS: Record<KiteChannel, string[]> = {
  Digital: ['3P Email', '3P SMS', 'Display'],
  Social: [],
  Email: [],
};

export const KITE_MEDIUM: Record<KiteChannel, string> = {
  Digital: 'digital',
  Social: 'social',
  Email: 'email',
};

/** C360 sources feeding each channel / sub-channel (image 1). */
export const KITE_SOURCES: Record<string, string[]> = {
  'Digital/3P Email': ['Medscape', 'ReachMD'],
  'Digital/3P SMS': ['Impiricus'],
  'Digital/Display': ['DeepIntent', 'Medscape', 'Open Evidence', 'ReachMD', 'Relevate Health'],
  Social: ['Equals5'],
  Email: ['SFMC', 'Relevate Health'],
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
  SFMC:              row(Y,  N,   N,      N,      N,      N,       N,    N,    N,      N,      Y,      Y,        Y,      Y,    Y,        Y,   Y,   N,       Y,    Y,      Y,  Y),
  //                  brd cpgn cpgn_id …                                                          chnl sub_chnl …                 | pulse vault npi
  Impiricus:         row(Y,  Y,   Y,      N,      N,      N,       N,    N,    N,      N,      N,      N,        N,      N,    N,        N,   Y,   Y,       N,    N,      N,  N,   Y,    Y,    Y),
  ReachMD:           row(Y,  Y,   N,      N,      Y,      Y,       N,    N,    N,      N,      Y,      N,        N,      Y,    Y,        Y,   Y,   Y,       N,    N,      N,  Y),
  'Open Evidence':   row(Y,  Y,   Y,      N,      Y,      Y,       N,    Y,    N,      N,      Y,      N,        N,      N,    N,        Y,   Y,   N,       N,    N,      N,  Y),
  Medscape:          row(Y,  Y,   Y,      Y,      Y,      Y,       Y,    Y,    N,      N,      Y,      N,        N,      N,    N,        Y,   Y,   Y,       N,    Y,      Y,  Y),
  Equals5:           row(Y,  Y,   N,      N,      Y,      Y,       N,    Y,    N,      N,      Y,      N,        N,      N,    N,        Y,   Y,   Y,       N,    N,      N,  Y),
  'Relevate Health': row(Y,  Y,   Y,      Y,      Y,      Y,       Y,    N,    N,      N,      Y,      N,        N,      N,    N,        Y,   Y,   Y,       N,    N,      Y,  Y),
  DeepIntent:        row(Y,  Y,   Y,      N,      Y,      Y,       N,    N,    Y,      N,      Y,      Y,        Y,      N,    N,        Y,   Y,   N,       N,    N,      Y,  Y),
};

// ---------------------------------------------------------------------------

export function kiteSubChannels(channel: string): string[] {
  return KITE_SUBCHANNELS[channel as KiteChannel] || [];
}

export function kiteSourcesFor(channel: string, subChannel: string): string[] {
  return KITE_SOURCES[subChannel ? `${channel}/${subChannel}` : channel] || [];
}

export interface KiteScopedDimension extends KiteDimension {
  /** sources in this scope where the dimension is present */
  sources: string[];
}

/** Dimensions present for a channel / sub-channel = union across its sources. */
export function kiteDimensionsFor(channel: string, subChannel: string): KiteScopedDimension[] {
  const sources = kiteSourcesFor(channel, subChannel);
  return KITE_DIMENSIONS.map(d => {
    const present = sources.filter(s => KITE_SOURCE_PRESENCE[s]?.[d.code]);
    return present.length ? { ...d, sources: present } : null;
  }).filter((d): d is KiteScopedDimension => !!d);
}

export function kiteDimensionByCode(code: string): KiteDimension | undefined {
  return KITE_DIMENSIONS.find(d => d.code === code || d.label === code);
}
