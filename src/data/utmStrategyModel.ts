import { Brand, CampaignTaxonomy, ChannelTaxonomy, KeyMessageCategory, MediaChannelType, TherapeuticArea } from '../types';
import { MEDIUMS, MESSAGING_TYPES, SUB_CHANNELS } from './taxonomyFormulas';

/**
 * Deterministic client-side stand-in for the "tagging strategy" model.
 * Given a brand + one of its channels it reads that channel's campaign
 * journey and proposes pre-filled UTM parameters, with a short rationale
 * and confidence per field. No network call.
 */

const slug = (v: string | undefined | null): string =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'na';

function seedOf(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0;
  return s;
}

function mode<T>(arr: (T | undefined)[]): T | undefined {
  const counts = new Map<T, number>();
  let best: T | undefined;
  let bestN = 0;
  for (const x of arr) {
    if (x === undefined || x === null || x === ('' as unknown as T)) continue;
    const n = (counts.get(x) || 0) + 1;
    counts.set(x, n);
    if (n > bestN) {
      bestN = n;
      best = x;
    }
  }
  return best;
}

export interface BrandChannel {
  channel: ChannelTaxonomy;
  campaignCount: number;
  /** Sub-channels this brand actually runs on the channel. */
  subChannels: string[];
}

/** Channels a brand has at least one campaign on, newest data wins. */
export function channelsForBrand(
  brandId: string,
  campaigns: CampaignTaxonomy[],
  channels: ChannelTaxonomy[],
): BrandChannel[] {
  const byChannel = new Map<string, CampaignTaxonomy[]>();
  for (const c of campaigns) {
    if (c.brandId !== brandId) continue;
    const list = byChannel.get(c.channelId) || [];
    list.push(c);
    byChannel.set(c.channelId, list);
  }
  return channels
    .filter(ch => byChannel.has(ch.id))
    .map(ch => {
      const list = byChannel.get(ch.id)!;
      const subChannels = Array.from(
        new Set(list.map(c => c.subChannel || c.format).filter(Boolean) as string[]),
      );
      return { channel: ch, campaignCount: list.length, subChannels };
    });
}

export type UtmKey = 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term';
export const UTM_KEYS: UtmKey[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export interface UtmField {
  key: UtmKey;
  label: string;
  value: string;
  rationale: string;
  confidence: number; // 0.75–0.99
}

export interface UtmStrategy {
  analysis: string;
  baseUrl: string;
  fields: UtmField[];
  signals: string[];
  confidence: number;
  basisCount: number;
}

export function utmStrategyFor(
  brand: Brand,
  channel: ChannelTaxonomy,
  subChannel: string | null,
  campaigns: CampaignTaxonomy[],
  keyMessages: KeyMessageCategory[],
): UtmStrategy {
  const basis = campaigns.filter(
    c =>
      c.brandId === brand.id &&
      c.channelId === channel.id &&
      (!subChannel || (c.subChannel || c.format) === subChannel),
  );

  const seed = seedOf(brand.id + channel.id + (subChannel || ''));
  const cf = (lo: number, k: number) => Math.round((lo + ((seed >> k) % 10) / 100) * 100) / 100;

  const brandWord = brand.name.split(/[ (]/)[0];
  const brandSlug = slug(brandWord);
  const year = mode(basis.map(c => (c.quarter || '2026-Q3').slice(0, 4))) || '2026';
  const audienceRaw = mode(basis.map(c => c.targetAudience)) || 'HCP';
  const audience = slug(audienceRaw);
  const leadFormat =
    subChannel || mode(basis.map(c => c.subChannel || c.format)) || channel.formats[0] || channel.name;

  const subsOf = (t: KeyMessageCategory | undefined) =>
    (t?.subtopics || t?.subcategories || []) as { id: string; code: string; name: string }[];
  const topic =
    keyMessages.find(k => k.id === mode(basis.map(c => c.keyMessageCategoryId))) || keyMessages[0];
  const subtopic =
    subsOf(topic).find(s => s.id === mode(basis.map(c => c.keyMessageSubcategoryId))) || subsOf(topic)[0];
  const topicCode = slug((subtopic?.code || topic?.code || 'eff').replace(/^km[-_]?/i, ''));
  const indication = slug(mode(basis.map(c => c.formulaInputs?.indication)) || 'lbcl');

  const priorSource = mode(basis.map(c => c.utmSource));
  const priorMedium = mode(basis.map(c => c.utmMedium));
  const priorCampaign = mode(basis.map(c => c.utmCampaign));
  const priorContent = mode(basis.map(c => c.utmContent));

  const isSearch = channel.name.toLowerCase().includes('search');
  const isPatient = audience.includes('patient') || audience.includes('caregiver');

  const source = slug(priorSource || channel.downstreamPlatform);
  const medium = slug(priorMedium || leadFormat);
  const campaignVal = slug(priorCampaign || `${brandSlug}_${indication}_${topicCode}_${year}`);
  const content = slug(priorContent || `${topicCode}_${audience}`);
  const term = isSearch ? slug(`${brandWord} ${indication} car t therapy`) : 'na';
  const baseUrl = `https://${isPatient ? 'www' : 'hcp'}.kitepharma.com/${slug(brand.code)}`;

  const nC = basis.length;
  const plural = nC === 1 ? 'campaign' : 'campaigns';
  const analysis =
    `${brandWord} runs ${nC} ${plural} on ${channel.name}${subChannel ? ` → ${subChannel}` : ''}. ` +
    `The journey skews ${audienceRaw}, anchored on ${topic?.name || 'Efficacy'}` +
    `${leadFormat ? ` with ${leadFormat} as the lead format` : ''}. ` +
    `These tags mirror that pattern — edit any field before you copy.`;

  const signals = [
    `${nC} ${plural}`,
    audienceRaw,
    topic?.name || 'Efficacy',
    ...(subChannel ? [subChannel] : leadFormat ? [String(leadFormat)] : []),
  ];

  const fields: UtmField[] = [
    {
      key: 'utm_source',
      label: 'Campaign Source',
      value: source,
      rationale: priorSource
        ? `Matches the source on ${nC} existing ${channel.name} ${plural}.`
        : `Derived from the ${channel.name} downstream platform (${channel.downstreamPlatform}).`,
      confidence: cf(0.89, 1),
    },
    {
      key: 'utm_medium',
      label: 'Campaign Medium',
      value: medium,
      rationale: `Lead format on this journey is ${leadFormat}.`,
      confidence: cf(0.86, 3),
    },
    {
      key: 'utm_campaign',
      label: 'Campaign Name',
      value: campaignVal,
      rationale: `${brandWord} · ${indication.toUpperCase()} · ${topic?.name || 'Efficacy'} · ${year}.`,
      confidence: cf(0.82, 5),
    },
    {
      key: 'utm_content',
      label: 'Campaign Content',
      value: content,
      rationale: `Dominant subtopic (${subtopic?.name || topic?.name || 'ORR'}) for a ${audienceRaw} audience.`,
      confidence: cf(0.8, 7),
    },
    {
      key: 'utm_term',
      label: 'Campaign Term',
      value: term,
      rationale: isSearch
        ? 'Keyword theme for paid search — refine to your ad-group terms.'
        : 'Only used for paid search; left as “na”.',
      confidence: isSearch ? cf(0.76, 9) : 0.99,
    },
  ];

  const confidence = fields.reduce((s, f) => s + f.confidence, 0) / fields.length;

  return { analysis, baseUrl, fields, signals, confidence, basisCount: nC };
}

export function buildTrackingUrl(baseUrl: string, values: Record<string, string>): string {
  const qs = UTM_KEYS.filter(k => values[k] && values[k] !== 'na')
    .map(k => `${k}=${encodeURIComponent(values[k])}`)
    .join('&');
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

// ---- channel journey + recipient (brand + channel scoped) ------------------

export interface Recipient {
  key: string;
  eId: string;
  name: string;
  role: 'HCP' | 'Patient';
  specialty?: string;
  segment: string;
  decile: number;
  territory: string;
  consent: 'Opted in' | 'Pending' | 'Opted out';
}

export interface JourneyStep {
  step: number;
  date: string;
  channel: string;
  subChannel: string;
  tactic: string;
  outcome: 'Clicked' | 'Opened' | 'Attended' | 'Downloaded' | 'No response';
}

const pick = <T,>(arr: T[], n: number): T => arr[Math.abs(Math.trunc(n)) % arr.length];

const FIRST = ['Ava', 'Marcus', 'Priya', 'Daniel', 'Elena', 'Noah', 'Sofia', 'Liam', 'Hannah', 'Omar'];
const LAST = ['Bennett', 'Okafor', 'Nguyen', 'Rosenthal', 'Alvarez', 'Kapoor', 'Larsson', 'Mensah', 'Voss', 'Cohen'];
const SPECIALTY = ['Hematologist-Oncologist', 'Transplant Physician', 'Cell Therapy Coordinator', 'Community Oncologist', 'Malignant Hematology'];
const SEGMENT = ['High Adopter', 'Emerging Referrer', 'Guarded Adopter', 'Non-Referrer', 'Advocate'];
const TERRITORY = ['NE-1 Boston', 'MW-3 Chicago', 'SE-2 Atlanta', 'W-4 Los Angeles', 'SC-1 Houston', 'MA-2 Philadelphia'];
const CONSENT: Recipient['consent'][] = ['Opted in', 'Opted in', 'Pending', 'Opted out'];
const PATIENT_COHORTS = ['Newly-diagnosed LBCL', 'Relapsed after 1L', 'Caregiver-supported', 'Rural / travel-barrier', 'Bridging-therapy stage'];

const FOLLOW_UPS: { channel: string; subChannel: string; tactic: string }[] = [
  { channel: 'Digital', subChannel: 'Programmatic Display', tactic: 'Retargeted display — data recap unit' },
  { channel: 'SFMC', subChannel: 'Triggered Send', tactic: 'Rep-triggered email — clinical deep dive' },
  { channel: 'Digital', subChannel: 'Online Video (OLV)', tactic: 'Congress highlights OLV — 30s' },
  { channel: 'Social', subChannel: 'LinkedIn', tactic: 'Peer-perspective thought-leader post' },
  { channel: 'SFMC', subChannel: 'Journey Builder', tactic: 'Webinar invite — CRS / ICANS management' },
];
const OUTCOMES: JourneyStep['outcome'][] = ['Clicked', 'Opened', 'Downloaded', 'Attended', 'No response'];

function basisFor(
  brand: Brand,
  channel: ChannelTaxonomy,
  subChannel: string | null,
  campaigns: CampaignTaxonomy[],
): CampaignTaxonomy[] {
  return campaigns.filter(
    c =>
      c.brandId === brand.id &&
      c.channelId === channel.id &&
      (!subChannel || (c.subChannel || c.format) === subChannel),
  );
}

export function recipientsForBrandChannel(
  brand: Brand,
  channel: ChannelTaxonomy,
  subChannel: string | null,
  campaigns: CampaignTaxonomy[],
): Recipient[] {
  const basis = basisFor(brand, channel, subChannel, campaigns);
  const seed = seedOf(`r${brand.id}${channel.id}${subChannel || ''}`);
  const isPatient = /patient|caregiver/i.test(mode(basis.map(c => c.targetAudience)) || 'HCP');
  const count = 4 + (seed % 3); // 4–6

  return Array.from({ length: count }, (_, i) => {
    const s = seed + i * 97;
    if (isPatient) {
      return {
        key: `${brand.id}-${channel.id}-r${i}`,
        eId: `PC-${1000 + ((s * 7) % 9000)}`,
        name: pick(PATIENT_COHORTS, s),
        role: 'Patient' as const,
        segment: pick(['High-intent', 'Researching', 'Newly aware', 'Caregiver-led'], s),
        decile: 1 + (s % 10),
        territory: pick(TERRITORY, s),
        consent: pick(CONSENT, s),
      };
    }
    return {
      key: `${brand.id}-${channel.id}-r${i}`,
      eId: `E-${1000000 + ((s * 13) % 9000000)}`,
      name: `Dr. ${pick(FIRST, s)} ${pick(LAST, s >> 2)}`,
      role: 'HCP' as const,
      specialty: pick(SPECIALTY, s),
      segment: pick(SEGMENT, s),
      decile: 1 + (s % 10),
      territory: pick(TERRITORY, s),
      consent: pick(CONSENT, s),
    };
  });
}

export function journeyForBrandChannel(
  brand: Brand,
  channel: ChannelTaxonomy,
  subChannel: string | null,
  campaigns: CampaignTaxonomy[],
  keyMessages: KeyMessageCategory[],
  recipientKey?: string,
): JourneyStep[] {
  const basis = basisFor(brand, channel, subChannel, campaigns);
  const seed = seedOf(`j${brand.id}${channel.id}${subChannel || ''}${recipientKey || ''}`);
  const topic =
    keyMessages.find(k => k.id === mode(basis.map(c => c.keyMessageCategoryId))) || keyMessages[0];
  const leadFormat =
    subChannel || mode(basis.map(c => c.subChannel || c.format)) || channel.formats[0] || channel.name;

  const stepCount = 3 + (seed % 3); // 3–5
  const start = new Date(2026, 5, 3 + (seed % 20));
  const steps: JourneyStep[] = [];
  for (let i = 0; i < stepCount; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * (6 + (seed % 5)));
    const src =
      i === 0
        ? {
            channel: channel.name,
            subChannel: String(leadFormat),
            tactic: `${leadFormat} — ${(topic?.name || 'efficacy').toLowerCase()} intro`,
          }
        : pick(FOLLOW_UPS, seed + i * 3);
    steps.push({
      step: i + 1,
      date: d.toISOString().slice(0, 10),
      channel: src.channel,
      subChannel: src.subChannel,
      tactic: src.tactic,
      outcome: i === stepCount - 1 && seed % 4 === 0 ? 'No response' : pick(OUTCOMES, seed + i * 3),
    });
  }
  return steps;
}

// ---- Campaign Builder field defaults, auto-populated from the journey -------

export interface CampaignDefaults {
  channelType: MediaChannelType;
  subChannel: string;
  country: string;
  messagingType: string;
  target: string;
  indication: string;
  quarter: string;
  year: string;
  region: string;
  taId: string;
  taCode: string;
  productCode: string;
  subChannelMeta: Record<string, string>;
  topicName: string;
  topicCode: string;
  subtopicName: string;
  subtopicCode: string;
  basisCount: number;
}

const TA_CODE: Record<string, string> = { 'ta-cart': 'CART', 'ta-hem': 'HEM', 'ta-onc': 'ONC' };

export function campaignDefaultsFor(
  brand: Brand,
  channel: ChannelTaxonomy,
  subChannel: string | null,
  campaigns: CampaignTaxonomy[],
  therapeuticAreas: TherapeuticArea[],
  keyMessages: KeyMessageCategory[],
): CampaignDefaults {
  const basis = basisFor(brand, channel, subChannel, campaigns);
  const channelType = (channel.name as MediaChannelType) || 'Social';
  const subs = SUB_CHANNELS[channelType] || [];
  const sub =
    subChannel || mode(basis.map(c => c.subChannel || c.format)) || subs[0] || channel.name;

  const fi = (k: string) => mode(basis.map(c => c.formulaInputs?.[k]));
  const quarter = mode(basis.map(c => c.quarter)) || '2026-Q3';
  const region = mode(basis.map(c => c.region)) || 'US Commercial';

  const taId = mode(basis.map(c => c.therapeuticAreaId)) || brand.therapeuticAreaId || 'ta-cart';
  const ta = therapeuticAreas.find(t => t.id === taId);

  const subsOf = (t: KeyMessageCategory | undefined) =>
    (t?.subtopics || t?.subcategories || []) as { id: string; code: string; name: string }[];
  const topic =
    keyMessages.find(k => k.id === mode(basis.map(c => c.keyMessageCategoryId))) || keyMessages[0];
  const subtopic =
    subsOf(topic).find(s => s.id === mode(basis.map(c => c.keyMessageSubcategoryId))) || subsOf(topic)[0];

  // Sub-channel extra fields we can pre-fill from an existing campaign's inputs.
  const subChannelMeta: Record<string, string> = {};
  const sample = basis.find(c => (c.subChannel || c.format) === sub) || basis[0];
  if (sample?.formulaInputs) {
    for (const [k, v] of Object.entries(sample.formulaInputs)) {
      if (!['country', 'medium', 'product', 'messagingType', 'ta', 'target', 'indication', 'platform', 'year', 'code'].includes(k)) {
        subChannelMeta[k] = v;
      }
    }
  }

  return {
    channelType,
    subChannel: String(sub),
    country: fi('country') || 'US',
    messagingType: fi('messagingType') || MESSAGING_TYPES[0],
    target: fi('target') || mode(basis.map(c => c.targetAudience)) || 'HCP',
    indication: fi('indication') || 'LBCL',
    quarter,
    year: quarter.slice(0, 4) || '2026',
    region,
    taId,
    taCode: ta?.code || TA_CODE[taId] || 'CART',
    productCode: brand.code || 'YES',
    subChannelMeta,
    topicName: topic?.name || 'Efficacy & Durable Response',
    topicCode: topic?.code || 'km-cat-eff',
    subtopicName: subtopic?.name || 'Overall Response Rate (ORR)',
    subtopicCode: subtopic?.code || 'KM-EFF-01',
    basisCount: basis.length,
  };
}

export { MEDIUMS };
