/**
 * Which publishers run on which channel, from the client's channel / sub-channel publisher list. A tactic can
 * only pick a publisher that runs on its channel, so a tactic never pairs a channel with a publisher that does
 * not deliver it. Keys are the dictionary's channel values (chnl); names are matched to the dictionary's
 * sources / platforms (src) whatever their case or spacing.
 */
export const CHANNEL_PUBLISHERS: Record<string, string[]> = {
  // Digital
  '3P EMAIL': ['Biopharm', 'Medscape', 'Onclive', 'ReachMD'],
  DISPLAY: ['Biopharm', 'DeepIntent', 'Doximity', 'JCO', 'Medscape', 'Onclive', 'Open Evidence', 'ReachMD', 'Relevate Health'],
  '3P SMS': ['Impiricus'],
  // Email (direct)
  EMAIL: ['RTE', 'SFMC'],
  RTE: ['RTE'],
  // Social
  SOCIAL: ['Equals5'],
};

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * The publishers a channel can use: `available` in the dictionary's own spelling, and `missing` — on the
 * client's list but not yet a value of the dictionary's sources / platforms.
 */
export function publishersFor(channel: string, dictionarySources: string[]): { mapped: boolean; available: string[]; missing: string[] } {
  const list = CHANNEL_PUBLISHERS[channel.trim().toUpperCase()];
  if (!list) return { mapped: false, available: [], missing: [] };
  const available: string[] = [];
  const missing: string[] = [];
  list.forEach(p => {
    const hit = dictionarySources.find(s => norm(s) === norm(p));
    if (hit) available.push(hit);
    else missing.push(p);
  });
  return { mapped: true, available, missing };
}
