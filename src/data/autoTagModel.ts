import { Brand, CampaignTaxonomy, KeyMessageCategory } from '../types';

/**
 * Lightweight, fully deterministic client-side stand-in for the auto-tagging model.
 * Given a campaign, it "reviews the channel journey" and proposes a Topic + Subtopic
 * (and, for content assets, the brand + indication), a confidence, and a rationale.
 * No network call.
 */
export interface TagSuggestion {
  topicId: string;
  topicCode: string;
  topicName: string;
  subtopicId: string;
  subtopicCode: string;
  subtopicName: string;
  confidence: number; // 0.80–0.98
  reason: string;
  signals: string[];
  differsFromRecorded: boolean;

  // AI-inferred brand + indication (used for IVA slides & website pages)
  brandName: string;
  brandCode: string;
  brandConfidence: number;
  brandDiffers: boolean;
  indication: string;
  indicationConfidence: number;
  indicationDiffers: boolean;
}

const INDICATIONS = ['LBCL', 'FL', 'MCL', 'B-ALL'];

const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'into', 'over', 'across', 'their', 'this', 'that',
  'management', 'response', 'durable', 'centers', 'center', 'access', 'life', 'quality',
]);

function seedOf(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0;
  return s;
}

function signalsFrom(...parts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of parts.join(' ').toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length > 3 && !STOP.has(w) && !seen.has(w)) {
      seen.add(w);
      out.push(w);
      if (out.length === 3) break;
    }
  }
  return out;
}

export function suggestTag(
  campaign: CampaignTaxonomy,
  keyMessages: KeyMessageCategory[],
  brands: Brand[],
  ctx: { brandName: string; channelName: string; subChannel: string },
): TagSuggestion {
  const seed = seedOf(campaign.id);
  const subsOf = (t: KeyMessageCategory) => t.subtopics || t.subcategories || [];

  const recordedIdx = Math.max(
    0,
    keyMessages.findIndex(k => k.id === campaign.keyMessageCategoryId),
  );
  const recordedTopic = keyMessages[recordedIdx] || keyMessages[0];
  const recordedSub =
    subsOf(recordedTopic).find(s => s.id === campaign.keyMessageSubcategoryId) ||
    subsOf(recordedTopic)[0];

  // ~1 in 3 campaigns: the model proposes a different topic — something to review.
  const differs = keyMessages.length > 1 && seed % 3 === 0;

  const topic = differs ? keyMessages[(recordedIdx + 1) % keyMessages.length] : recordedTopic;
  const sub = differs ? subsOf(topic)[seed % Math.max(1, subsOf(topic).length)] : recordedSub;

  const confidence = Math.min(
    0.98,
    differs ? 0.8 + (seed % 9) / 100 : 0.92 + (seed % 7) / 100,
  );

  const signals = signalsFrom(topic.name, sub?.name || '', campaign.campaignName);

  const reason =
    `Tracing the ${ctx.channelName} → ${ctx.subChannel} journey for ${ctx.brandName}, recurring ` +
    `${topic.name.toLowerCase()} signals${signals.length ? ` (${signals.join(', ')})` : ''} across ` +
    `the tactic sequence drive this classification` +
    (differs ? ' — it diverges from the currently recorded topic and is flagged for review.' : '.');

  // AI-inferred brand + indication (content assets don't carry them from a formula).
  const recordedBrand = brands.find(b => b.id === campaign.brandId) || brands[0];
  const brandDiffers = brands.length > 1 && seed % 4 === 0;
  const brandIdx = Math.max(0, brands.findIndex(b => b.id === recordedBrand?.id));
  const brand = brandDiffers ? brands[(brandIdx + 1) % brands.length] : recordedBrand;
  const brandConfidence = Math.min(0.98, brandDiffers ? 0.78 + (seed % 9) / 100 : 0.9 + (seed % 9) / 100);

  const recordedIndication = campaign.formulaInputs?.indication || INDICATIONS[0];
  const indicationDiffers = seed % 5 === 0;
  const indication = indicationDiffers
    ? INDICATIONS[(INDICATIONS.indexOf(recordedIndication) + 1 + (seed % 3)) % INDICATIONS.length]
    : recordedIndication;
  const indicationConfidence = Math.min(0.98, indicationDiffers ? 0.78 + (seed % 8) / 100 : 0.9 + (seed % 8) / 100);

  return {
    topicId: topic.id,
    topicCode: topic.code,
    topicName: topic.name,
    subtopicId: sub?.id || '',
    subtopicCode: sub?.code || '—',
    subtopicName: sub?.name || '—',
    confidence,
    reason,
    signals,
    differsFromRecorded: differs,

    brandName: brand?.name || ctx.brandName,
    brandCode: brand?.code || '—',
    brandConfidence,
    brandDiffers,
    indication,
    indicationConfidence,
    indicationDiffers,
  };
}

// ---- slide-level tagging --------------------------------------------------

/**
 * IVA decks and website pages are tagged slide-by-slide. Each slide gets its
 * own topic / subtopic / brand / indication call from the same model, plus a
 * slide title. Fully deterministic (seeded from the campaign id + slide index).
 */
export interface SlideTag extends TagSuggestion {
  slideId: string;
  slideNo: number;
  title: string;
}

const SLIDE_TITLES = [
  'Title & indication statement',
  'Disease burden in relapsed / refractory disease',
  'Rationale for CAR T-cell therapy',
  'Mechanism of action',
  'Pivotal trial design & patient population',
  'Primary endpoint — objective response rate',
  'Depth & durability of response',
  'Overall & progression-free survival',
  'Key subgroup analyses',
  'Safety overview',
  'CRS — grading & management algorithm',
  'ICANS — monitoring & mitigation',
  'Patient identification & referral timing',
  'Apheresis-to-infusion logistics',
  'Authorized Treatment Center network',
  'Bridging & lymphodepleting chemotherapy',
  'Dosing & administration',
  'Important Safety Information',
  'Access, coding & reimbursement support',
  'Summary & call to action',
];

export function slidesForCampaign(
  campaign: CampaignTaxonomy,
  keyMessages: KeyMessageCategory[],
  brands: Brand[],
  ctx: { brandName: string; channelName: string; subChannel: string },
): SlideTag[] {
  const seed = seedOf(campaign.id);
  // Deck slide count drives how many slides get tagged; fall back to a seeded 5–10.
  const declared = Number(campaign.formulaInputs?.slideCount);
  const count = Number.isFinite(declared) && declared >= 1 ? Math.min(40, Math.round(declared)) : 5 + (seed % 6);
  const offset = seed % SLIDE_TITLES.length;

  return Array.from({ length: count }, (_, i) => {
    const slideNo = i + 1;
    const tag = suggestTag({ ...campaign, id: `${campaign.id}#slide-${slideNo}` }, keyMessages, brands, ctx);
    return {
      ...tag,
      slideId: `${campaign.id}-s${slideNo}`,
      slideNo,
      title: SLIDE_TITLES[(offset + i) % SLIDE_TITLES.length],
    };
  });
}
