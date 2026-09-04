import { MediaChannelType } from '../types';

/**
 * The taxonomy tagging strategy: which dimensions (fields) can be tagged on an
 * asset, and how that set changes by channel and sub-channel.
 *
 * This is a static catalogue — a reference of every taggable field, not values.
 * Composition for a selected sub-channel:
 *   CORE_DIMENSIONS  +  CHANNEL_DIMENSIONS[channel]  +  SUBCHANNEL_DIMENSIONS[channel][subChannel]
 */

export type DimensionType = 'Controlled' | 'Free text' | 'Number' | 'ID' | 'Date' | 'Boolean' | 'URL';

export interface Dimension {
  name: string;
  /** what the field captures */
  captures: string;
  type: DimensionType;
  /** example value, or a preview of the controlled vocabulary */
  example: string;
}

/** Carried by every tagged asset, on any channel. */
export const CORE_DIMENSIONS: Dimension[] = [
  { name: 'Brand', captures: 'Promoted product', type: 'Controlled', example: 'Yescarta® (YES), Tecartus® (TEC)' },
  { name: 'Indication', captures: 'Specific cancer type', type: 'Controlled', example: 'LBCL, FL, MCL, B-ALL' },
  { name: 'Therapeutic area', captures: 'TA roll-up', type: 'Controlled', example: 'CAR-T (CART)' },
  { name: 'Topic', captures: 'Key-message category', type: 'Controlled', example: 'Efficacy, Safety, Access, Logistics, QoL' },
  { name: 'Sub-topic', captures: 'Key-message subcategory', type: 'Controlled', example: 'ORR, CRS grading, ATC referral…' },
  { name: 'Target audience', captures: 'Who the asset addresses', type: 'Controlled', example: 'HCP, Patient, Caregiver, Payer' },
  { name: 'Messaging type', captures: 'Branding level', type: 'Controlled', example: 'Branded, Unbranded, Disease Awareness, Payer' },
  { name: 'Market', captures: 'Country / region', type: 'Controlled', example: 'US, CA, GB, DE, FR, Global' },
  { name: 'Language', captures: 'Asset language', type: 'Controlled', example: 'en-US, es-US, fr-CA' },
  { name: 'Campaign year', captures: 'Planning year', type: 'Number', example: '2026' },
  { name: 'MLR / approval code', captures: 'Regulatory job code', type: 'ID', example: 'US-YES-2026-0042' },
  { name: 'Approval status', captures: 'Review state', type: 'Controlled', example: 'Approved, In MLR, Expired' },
];

/** Adds to every sub-channel of the channel. */
export const CHANNEL_DIMENSIONS: Record<MediaChannelType, Dimension[]> = {
  Digital: [
    { name: 'Placement ID', captures: 'Ad-server / DSP placement', type: 'ID', example: 'PL-88213' },
    { name: 'Ad unit / size', captures: 'Slot dimensions', type: 'Controlled', example: '300×250, 728×90, 970×250, 1×1' },
    { name: 'Creative format', captures: 'Asset format', type: 'Controlled', example: 'Static, Animated, Rich media, Video' },
    { name: 'Creative version', captures: 'Iteration / variant', type: 'Free text', example: 'v3, A, B' },
    { name: 'Device', captures: 'Target device', type: 'Controlled', example: 'Desktop, Mobile, Tablet, CTV' },
    { name: 'Ad environment', captures: 'Where it serves', type: 'Controlled', example: 'Web, In-App, CTV' },
    { name: 'Landing page URL', captures: 'Click destination', type: 'URL', example: 'https://hcp.kitepharma.com/yes' },
    { name: 'Flight start / end', captures: 'Live window', type: 'Date', example: '2026-06-01 – 2026-08-31' },
  ],
  Social: [
    { name: 'Ad set ID', captures: 'Platform ad-set / group', type: 'ID', example: 'AS-40192' },
    { name: 'Creative format', captures: 'Asset format', type: 'Controlled', example: 'Single image, Carousel, Video, Document' },
    { name: 'Objective', captures: 'Campaign objective', type: 'Controlled', example: 'Awareness, Traffic, Engagement, Lead gen' },
    { name: 'Optimization goal', captures: 'Delivery optimisation', type: 'Controlled', example: 'Reach, Link clicks, LPV, Conversions' },
    { name: 'Audience definition', captures: 'Targeting basis', type: 'Free text', example: 'HCP specialty list, lookalike 1%' },
    { name: 'Organic vs paid', captures: 'Distribution type', type: 'Controlled', example: 'Organic, Paid, Boosted' },
    { name: 'Post ID', captures: 'Native post reference', type: 'ID', example: 'PN-77310' },
    { name: 'Landing page URL', captures: 'Click destination', type: 'URL', example: 'https://hcp.kitepharma.com/yes' },
  ],
  Search: [
    { name: 'Account', captures: 'Ad account', type: 'Free text', example: 'Kite-HCP-US' },
    { name: 'Campaign', captures: 'Search campaign', type: 'Free text', example: 'YES_LBCL_Branded' },
    { name: 'Ad group', captures: 'Keyword grouping', type: 'Free text', example: 'ORR / efficacy' },
    { name: 'Match type', captures: 'Keyword match', type: 'Controlled', example: 'Exact, Phrase, Broad' },
    { name: 'Keyword theme', captures: 'Intent cluster', type: 'Free text', example: 'car t therapy lbcl' },
    { name: 'Ad copy variant', captures: 'RSA / ETA variant', type: 'Free text', example: 'A, B, RSA-1' },
    { name: 'Landing page URL', captures: 'Click destination', type: 'URL', example: 'https://hcp.kitepharma.com/yes/efficacy' },
  ],
  SFMC: [
    { name: 'Automation type', captures: 'Send mechanism', type: 'Controlled', example: 'Triggered send, Journey Builder, Batch / Blast' },
    { name: 'Send classification', captures: 'CAN-SPAM class', type: 'Controlled', example: 'Commercial, Transactional' },
    { name: 'Data extension / audience', captures: 'Recipient list', type: 'Free text', example: 'DE_HCP_Cell_Therapy_Opt-in' },
    { name: 'Trigger event', captures: 'What fires a triggered send', type: 'Controlled', example: 'Form Fill, Rep Request, Milestone, Re-engagement' },
    { name: 'Journey / automation ID', captures: 'Parent automation', type: 'ID', example: 'JB-2261' },
    { name: 'Entry source', captures: 'How contacts enter a journey', type: 'Controlled', example: 'Data Extension, API Event, CloudPage, Salesforce Object' },
    { name: 'Subject line variant', captures: 'A/B subject', type: 'Free text', example: 'A, B' },
    { name: 'Preheader', captures: 'Inbox preview text', type: 'Free text', example: '“See the 2-year data”' },
    { name: 'From name', captures: 'Sender identity', type: 'Free text', example: 'Kite Medical' },
    { name: 'Send time', captures: 'Scheduled send', type: 'Date', example: '2026-06-12 09:00 ET' },
    { name: 'A/B split %', captures: 'Test allocation for a blast', type: 'Number', example: '50 / 50' },
    { name: 'Suppression list', captures: 'Do-not-send set', type: 'Free text', example: 'Global unsub, HCP opt-out' },
  ],
  IVA: [
    { name: 'Deck ID', captures: 'Parent visual-aid ID', type: 'ID', example: 'CLM-YES-CVA-014' },
    { name: 'Deck title', captures: 'Visual-aid name', type: 'Free text', example: 'Yescarta 2L LBCL Core Visual Aid' },
    { name: 'Total slide count', captures: 'Slides in the deck', type: 'Number', example: '17' },
    { name: 'Slide number', captures: 'Position in the deck', type: 'Number', example: '4' },
    { name: 'Slide ID', captures: 'Unique slide reference', type: 'ID', example: 'CLM-YES-CVA-014-S04' },
    { name: 'Slide title', captures: 'On-slide heading', type: 'Free text', example: 'Primary endpoint — ORR' },
    { name: 'Slide type', captures: 'Slide role', type: 'Controlled', example: 'Title, MOA, Efficacy data, Safety, Dosing, ISI, Reference, CTA' },
    { name: 'Content module ID', captures: 'Reusable module used', type: 'ID', example: 'MOD-ISI-US-v6' },
    { name: 'CLM system', captures: 'Delivery platform', type: 'Controlled', example: 'Veeva CLM, IQVIA OCE, Custom' },
    { name: 'Interactive elements', captures: 'On-slide interactions', type: 'Controlled', example: 'Pop-up, Animation, Video, ISI scroll, None' },
    { name: 'Reference / citation IDs', captures: 'Linked references', type: 'ID', example: 'REF-118, REF-204' },
    { name: 'Speaker notes present', captures: 'Rep talking points', type: 'Boolean', example: 'Yes / No' },
    { name: 'Version', captures: 'Slide iteration', type: 'Free text', example: 'v2.1' },
    { name: 'Last MLR date', captures: 'Most recent approval', type: 'Date', example: '2026-05-19' },
    { name: 'Expiration date', captures: 'Use-by date', type: 'Date', example: '2027-05-19' },
    { name: 'Detail priority', captures: 'Sales-call priority', type: 'Controlled', example: 'Primary, Secondary, Reference only' },
  ],
};

/** Adds to one specific sub-channel. */
export const SUBCHANNEL_DIMENSIONS: Record<MediaChannelType, Record<string, Dimension[]>> = {
  Digital: {
    'Programmatic Display': [
      { name: 'DSP', captures: 'Buying platform', type: 'Controlled', example: 'DV360, The Trade Desk, Amazon DSP, Yahoo DSP' },
      { name: 'Rich-media vendor', captures: 'Build vendor', type: 'Free text', example: 'GumGum, Kargo, Celtra' },
      { name: 'Deal ID', captures: 'PMP / PG deal', type: 'ID', example: 'DEAL-55012' },
    ],
    'Online Video (OLV)': [
      { name: 'Video length', captures: 'Duration', type: 'Controlled', example: ':06, :15, :30, :60' },
      { name: 'Skippable', captures: 'Skip allowed', type: 'Boolean', example: 'Yes / No' },
      { name: 'Player size', captures: 'Player context', type: 'Controlled', example: 'In-stream, Out-stream, In-banner' },
      { name: 'Sound-on', captures: 'Audio default', type: 'Boolean', example: 'Yes / No' },
    ],
    Native: [
      { name: 'Content provider', captures: 'Native network', type: 'Controlled', example: 'Outbrain, Taboola, Nativo' },
      { name: 'Headline variant', captures: 'Tested headline', type: 'Free text', example: 'A / B / C' },
      { name: 'Thumbnail variant', captures: 'Tested image', type: 'Free text', example: 'A / B' },
    ],
    'High-Impact': [
      { name: 'Unit type', captures: 'High-impact format', type: 'Controlled', example: 'Interscroller, Adhesion, Pushdown, Rich Media' },
      { name: 'Vendor', captures: 'Format vendor', type: 'Free text', example: 'GumGum, Kargo' },
      { name: 'Expandable', captures: 'Expands on interaction', type: 'Boolean', example: 'Yes / No' },
    ],
    'Website Pages': [
      { name: 'Page template', captures: 'Page layout', type: 'Controlled', example: 'Landing, Article, ISI / PI, Resource hub' },
      { name: 'CMS / platform', captures: 'Publishing system', type: 'Controlled', example: 'AEM, Sitecore, Contentful, WordPress VIP' },
      { name: 'Page path', captures: 'URL path', type: 'Free text', example: '/yes/efficacy/orr' },
      { name: 'Gated', captures: 'Behind a form', type: 'Boolean', example: 'Yes / No' },
      { name: 'Form ID', captures: 'Lead-capture form', type: 'ID', example: 'FORM-3391' },
    ],
  },
  Social: {
    Meta: [
      { name: 'Placement surface', captures: 'Where it renders', type: 'Controlled', example: 'Feed, Reels, Stories, Marketplace' },
      { name: 'Optimization goal', captures: 'Delivery goal', type: 'Controlled', example: 'Reach, Link Clicks, LPV, Conversions' },
      { name: 'Instant Experience', captures: 'Canvas post-click', type: 'Boolean', example: 'Yes / No' },
    ],
    TikTok: [
      { name: 'Ad objective', captures: 'Placement product', type: 'Controlled', example: 'In-Feed, TopView, Spark Ads, Branded Effect' },
      { name: 'Sound-on required', captures: 'Audio mandatory', type: 'Boolean', example: 'Yes / No' },
      { name: 'Creator handle', captures: 'Spark-ad source', type: 'Free text', example: '@oncnurse_ed' },
    ],
    LinkedIn: [
      { name: 'Ad format', captures: 'Sponsored format', type: 'Controlled', example: 'Single Image, Carousel, Document, Conversation, Thought Leader' },
      { name: 'Audience type', captures: 'Targeting facet', type: 'Controlled', example: 'Job Title, Skills, Company List, Member Groups' },
      { name: 'Lead-gen form ID', captures: 'Native form', type: 'ID', example: 'LGF-2048' },
    ],
    Reddit: [
      { name: 'Subreddit targeting', captures: 'Community targeting', type: 'Free text', example: 'r/lymphoma, r/leukemia' },
      { name: 'Comment moderation', captures: 'Comments handling', type: 'Controlled', example: 'On, Off' },
      { name: 'Promoted post type', captures: 'Ad product', type: 'Controlled', example: 'Promoted Post, Free-form, Carousel' },
    ],
  },
  Search: {
    'Google Ads': [
      { name: 'Network', captures: 'Serving network', type: 'Controlled', example: 'Search, Search Partners, Display' },
      { name: 'RSA asset group', captures: 'Responsive asset set', type: 'Free text', example: 'RSA-ORR-1' },
      { name: 'Sitelink set', captures: 'Extensions used', type: 'Free text', example: 'ISI, Dosing, Find an ATC' },
    ],
    'Microsoft Ads (Bing)': [
      { name: 'Import source', captures: 'Campaign origin', type: 'Controlled', example: 'Google Import, Native' },
      { name: 'Audience network', captures: 'Audience ads on', type: 'Boolean', example: 'Yes / No' },
    ],
  },
  // SFMC has no sub-channels — every SFMC field lives at the channel level.
  SFMC: {},
  IVA: {
    'Core Visual Aid': [
      { name: 'Detail sequence position', captures: 'Order in the call flow', type: 'Number', example: '1' },
      { name: 'Field-force segment', captures: 'Which reps use it', type: 'Free text', example: 'Cell Therapy specialists' },
      { name: 'Call objective', captures: 'Goal of the detail', type: 'Controlled', example: 'Introduce, Reinforce efficacy, Handle safety, Close' },
    ],
    'Follow-Up Deck': [
      { name: 'Trigger context', captures: 'Why it is shown', type: 'Controlled', example: 'Post-detail, Rep-requested, Congress follow-up' },
      { name: 'Preceding interaction', captures: 'Prior touch it builds on', type: 'Free text', example: 'Core visual aid — efficacy' },
      { name: 'Personalization level', captures: 'How tailored', type: 'Controlled', example: 'Generic, Segment, Named HCP' },
    ],
    'Objection Handler': [
      { name: 'Objection theme', captures: 'Concern addressed', type: 'Controlled', example: 'Safety, Access, Logistics, Efficacy vs SOC' },
      { name: 'Rebuttal evidence type', captures: 'Proof offered', type: 'Controlled', example: 'Pivotal trial, RWE, Guideline, KOL' },
      { name: 'Competitor referenced', captures: 'Comparator named', type: 'Boolean', example: 'Yes / No' },
    ],
    'Disease State Deck': [
      { name: 'Branded', captures: 'Branding level', type: 'Controlled', example: 'Unbranded, Branded' },
      { name: 'Disease-state focus', captures: 'Educational angle', type: 'Free text', example: 'R/R LBCL prognosis' },
      { name: 'Unbranded-to-branded bridge', captures: 'Transitions to product', type: 'Boolean', example: 'Yes / No' },
    ],
  },
};

export interface DimensionGroup {
  title: string;
  scope: 'Core' | 'Channel' | 'Sub-channel';
  dimensions: Dimension[];
}

/** Sub-channels that carry their own dimension set, for the given channel. */
export function subChannelsWithDimensions(channel: MediaChannelType): string[] {
  return Object.keys(SUBCHANNEL_DIMENSIONS[channel] || {});
}

/** Every dimension selectable for a channel / sub-channel (channel-level + sub-channel-level). */
export function allDimensionsFor(channel: MediaChannelType, subChannel: string): Dimension[] {
  return [
    ...(CHANNEL_DIMENSIONS[channel] || []),
    ...(subChannel ? SUBCHANNEL_DIMENSIONS[channel]?.[subChannel] || [] : []),
  ];
}

export function dimensionByName(
  channel: MediaChannelType,
  subChannel: string,
  name: string,
): Dimension | undefined {
  return allDimensionsFor(channel, subChannel).find(d => d.name === name);
}

/** Options for a controlled/boolean dimension, parsed from its example string. */
export function dimensionOptions(dimension: Dimension): string[] | null {
  if (dimension.type === 'Boolean') return ['Yes', 'No'];
  if (dimension.type === 'Controlled') {
    return dimension.example
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }
  return null;
}

export function dimensionGroupsFor(channel: MediaChannelType, subChannel: string): DimensionGroup[] {
  const groups: DimensionGroup[] = [
    { title: `${channel} — channel dimensions`, scope: 'Channel', dimensions: CHANNEL_DIMENSIONS[channel] || [] },
  ];
  const subDims = subChannel ? SUBCHANNEL_DIMENSIONS[channel]?.[subChannel] : undefined;
  if (subDims && subDims.length > 0) {
    groups.push({
      title: `${channel} → ${subChannel} — sub-channel dimensions`,
      scope: 'Sub-channel',
      dimensions: subDims,
    });
  }
  return groups;
}
