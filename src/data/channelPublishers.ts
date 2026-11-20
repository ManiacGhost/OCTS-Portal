import { CHANNEL_MAPPING, ChannelMappingRow } from './channelMappingSeed';

/**
 * The client's channel / sub-channel / publisher mapping (Kite_Channel_Subchannel_Publisher_Mapping_v1.xlsx).
 * A tactic picks a channel, then one of that channel's sub-channels, then one of the publishers that deliver
 * that sub-channel, so a tactic never pairs a channel, sub-channel and publisher that do not go together.
 * Names are matched to the dictionary's values whatever their case or spacing, and shown in the dictionary's
 * own spelling.
 */

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '');
const same = (a: string, b: string) => norm(a) === norm(b);

const rowsOf = (channel: string, subChannel?: string): ChannelMappingRow[] =>
  CHANNEL_MAPPING.filter(r => same(r.channel, channel) && (subChannel === undefined || same(r.subChannel, subChannel)));

/** In the dictionary's spelling when the dictionary has the value, else as the mapping writes it. */
const spell = (v: string, dictionary: string[]) => dictionary.find(d => same(d, v)) || v;

/** The sub-channels of a channel. `mapped` is false for a channel the mapping does not list. */
export function subChannelsFor(channel: string, dictionarySubChannels: string[]): { mapped: boolean; available: string[] } {
  const rows = rowsOf(channel);
  return { mapped: rows.length > 0, available: [...new Set(rows.map(r => spell(r.subChannel, dictionarySubChannels)))] };
}

/**
 * The publishers that deliver a channel's sub-channel (or, before a sub-channel is chosen, the whole channel).
 * `auto` is true when the mapping fixes the publisher (owned and field channels): it is filled in, not picked.
 */
export function publishersFor(
  channel: string,
  subChannel: string,
  dictionarySources: string[]
): { mapped: boolean; available: string[]; auto: boolean; channelType: string } {
  const rows = rowsOf(channel, subChannel || undefined);
  const available = [...new Set(rows.map(r => spell(r.publisher, dictionarySources)))];
  return {
    mapped: rowsOf(channel).length > 0,
    available,
    auto: rows.length > 0 && rows.every(r => r.publisherRequired === 'auto') && available.length === 1,
    channelType: rows[0]?.channelType || '',
  };
}
