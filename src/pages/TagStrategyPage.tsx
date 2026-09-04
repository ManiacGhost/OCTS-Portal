import React, { useMemo, useState } from 'react';
import {
  Route,
  Sparkles,
  Copy,
  Check,
  Link as LinkIcon,
  RotateCcw,
  Wand2,
  User,
  Code,
} from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import {
  channelsForBrand,
  utmStrategyFor,
  buildTrackingUrl,
  recipientsForBrandChannel,
  journeyForBrandChannel,
  campaignDefaultsFor,
  UtmKey,
} from '../data/utmStrategyModel';
import {
  CAMPAIGN_FORMULA,
  SUB_CHANNEL_FIELDS,
  buildCampaignTaxonomy,
  formulaTemplate,
  generateCode,
  COUNTRIES,
  MESSAGING_TYPES,
  TARGETS,
  INDICATIONS,
  MEDIUMS,
} from '../data/taxonomyFormulas';

const OUTCOME_BADGE: Record<string, string> = {
  Clicked: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Attended: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Downloaded: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Opened: 'bg-slate-100 text-slate-700 border-slate-200',
  'No response': 'bg-amber-100 text-amber-800 border-amber-200',
};
const CONSENT_BADGE: Record<string, string> = {
  'Opted in': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  'Opted out': 'bg-slate-200 text-slate-700 border-slate-300',
};

const AiBadge: React.FC<{ edited: boolean; conf?: number }> = ({ edited, conf }) =>
  edited ? (
    <span className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded px-1 py-0.5">edited</span>
  ) : (
    <span className="text-[9px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1 py-0.5 flex items-center gap-0.5">
      <Sparkles className="w-2.5 h-2.5" /> AI{conf !== undefined ? ` · ${conf}%` : ''}
    </span>
  );

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-3 gap-3 py-2 border-b border-slate-100 last:border-0">
    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
    <div className="col-span-2 text-xs text-slate-900 font-medium">{children}</div>
  </div>
);

const Card: React.FC<{ title: string; icon: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  right,
  children,
}) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <span className="text-navy-600">{icon}</span>
        <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
      </div>
      {right}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export const TagStrategyPage: React.FC = () => {
  const { campaigns, channels, brands, keyMessages, therapeuticAreas } = usePersona();

  const [brandId, setBrandId] = useState<string>(brands[0]?.id || '');
  const [channelId, setChannelId] = useState<string>('');
  const [subChannel, setSubChannel] = useState<string>('');
  const [recipientKey, setRecipientKey] = useState<string>('');
  const [utmOverrides, setUtmOverrides] = useState<Partial<Record<UtmKey | 'base', string>>>({});
  const [campOverrides, setCampOverrides] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<'url' | 'qs' | 'tax' | null>(null);

  const machineCode = useMemo(() => generateCode(), []);
  const brand = brands.find(b => b.id === brandId) || brands[0];

  const brandChannels = useMemo(
    () => channelsForBrand(brand?.id || '', campaigns, channels),
    [brand, campaigns, channels],
  );
  const active = brandChannels.find(bc => bc.channel.id === channelId) || null;
  const sub = subChannel || null;

  const resetDownstream = () => {
    setUtmOverrides({});
    setCampOverrides({});
    setRecipientKey('');
  };
  const pickBrand = (id: string) => {
    setBrandId(id);
    setChannelId('');
    setSubChannel('');
    resetDownstream();
  };
  const pickChannel = (id: string) => {
    setChannelId(id);
    setSubChannel('');
    resetDownstream();
  };
  const pickSub = (v: string) => {
    setSubChannel(v);
    resetDownstream();
  };

  const recipients = useMemo(
    () => (brand && active ? recipientsForBrandChannel(brand, active.channel, sub, campaigns) : []),
    [brand, active, sub, campaigns],
  );
  const recipient = recipients.find(r => r.key === recipientKey) || recipients[0];

  const journey = useMemo(
    () =>
      brand && active
        ? journeyForBrandChannel(brand, active.channel, sub, campaigns, keyMessages, recipient?.key)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, active, sub, campaigns, keyMessages, recipient?.key],
  );

  const defaults = useMemo(
    () =>
      brand && active
        ? campaignDefaultsFor(brand, active.channel, sub, campaigns, therapeuticAreas, keyMessages)
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, active, sub, campaigns, therapeuticAreas, keyMessages],
  );

  const strategy = useMemo(
    () => (brand && active ? utmStrategyFor(brand, active.channel, sub, campaigns, keyMessages) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, active, sub, campaigns, keyMessages],
  );

  // --- Campaign Builder fields (auto-populated, editable) -------------------
  const extraFields = defaults ? SUB_CHANNEL_FIELDS[defaults.channelType]?.[defaults.subChannel] || [] : [];
  const campBase: Record<string, string> = defaults
    ? {
        country: defaults.country,
        messagingType: defaults.messagingType,
        target: defaults.target,
        indication: defaults.indication,
        ...defaults.subChannelMeta,
      }
    : {};
  const ccv = (k: string) => campOverrides[k] ?? campBase[k] ?? '';
  const cEdited = (k: string) => campOverrides[k] !== undefined;
  const setCamp = (k: string, v: string) => setCampOverrides(o => ({ ...o, [k]: v }));

  const formulaInputs: Record<string, string> = defaults
    ? {
        country: ccv('country'),
        medium: MEDIUMS[defaults.channelType],
        product: defaults.productCode,
        messagingType: ccv('messagingType'),
        ta: defaults.taCode,
        target: ccv('target'),
        indication: ccv('indication'),
        platform: defaults.subChannel,
        year: defaults.year,
        code: machineCode,
        ...Object.fromEntries(extraFields.map(f => [f.key, ccv(f.key)])),
      }
    : {};
  const built = defaults ? buildCampaignTaxonomy(defaults.channelType, formulaInputs) : null;

  const inputTokens = defaults ? CAMPAIGN_FORMULA[defaults.channelType].filter(t => t.source === 'input') : [];
  const autoTokens = defaults ? CAMPAIGN_FORMULA[defaults.channelType].filter(t => t.source !== 'input') : [];
  const OPTION_MAP: Record<string, string[]> = {
    country: COUNTRIES,
    messagingType: MESSAGING_TYPES,
    target: TARGETS,
    indication: INDICATIONS,
  };

  // --- UTM pane -----------------------------------------------------------
  const uv = (k: UtmKey): string => utmOverrides[k] ?? strategy?.fields.find(f => f.key === k)?.value ?? '';
  const baseValue = utmOverrides.base ?? strategy?.baseUrl ?? '';
  const uEdited = (k: UtmKey | 'base') => utmOverrides[k] !== undefined;
  const allUtm: Record<string, string> = {};
  strategy?.fields.forEach(f => (allUtm[f.key] = uv(f.key)));
  const trackingUrl = buildTrackingUrl(baseValue, allUtm);
  const queryString = trackingUrl.includes('?') ? trackingUrl.slice(trackingUrl.indexOf('?') + 1) : '';

  const doCopy = (which: 'url' | 'qs' | 'tax', text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  const anyUtmEdited = Object.keys(utmOverrides).length > 0;
  const anyCampEdited = Object.keys(campOverrides).length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Route className="w-5 h-5 text-navy-600" />
          Tagging Strategy
        </h1>
        <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
          Pick a brand and one of its channels. The model reads that channel&rsquo;s journey and
          auto-populates the campaign fields and UTM tags &mdash; edit anything before you copy.
        </p>
      </div>

      {/* Step 1 — Brand */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">1 · Brand</div>
        <div className="flex flex-wrap gap-2">
          {brands.map(b => {
            const on = b.id === brand?.id;
            return (
              <button
                key={b.id}
                onClick={() => pickBrand(b.id)}
                className={`text-left rounded-2xl border px-4 py-3 transition ${
                  on
                    ? 'bg-navy-600 text-white border-navy-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm">{b.name.split(/[ (]/)[0]}</span>
                  <span
                    className={`font-mono text-[10px] font-bold rounded px-1 py-0.5 border ${
                      on ? 'bg-white/15 border-white/30 text-white' : 'bg-navy-50 border-navy-200 text-navy-700'
                    }`}
                  >
                    {b.code}
                  </span>
                </div>
                <div className={`text-[11px] mt-0.5 ${on ? 'text-navy-50' : 'text-slate-400'}`}>{b.indication}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — Channel + recipient */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          2 · Channel {brand ? `for ${brand.name.split(/[ (]/)[0]}` : ''}
        </div>
        {brandChannels.length === 0 ? (
          <div className="text-xs text-slate-400 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
            No campaigns recorded for this brand yet.
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {brandChannels.map(bc => {
              const on = bc.channel.id === channelId;
              return (
                <button
                  key={bc.channel.id}
                  onClick={() => pickChannel(bc.channel.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    on
                      ? 'bg-navy-600 text-white border-navy-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {bc.channel.name}
                  <span className={`ml-1.5 ${on ? 'text-navy-100' : 'text-slate-400'}`}>{bc.campaignCount}</span>
                </button>
              );
            })}
            {active && active.subChannels.length > 1 && (
              <select
                value={subChannel}
                onChange={e => pickSub(e.target.value)}
                className="ml-1 bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-navy-500 shadow-sm"
              >
                <option value="">All sub-channels</option>
                {active.subChannels.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
            {active && recipients.length > 0 && (
              <select
                value={recipient?.key || ''}
                onChange={e => setRecipientKey(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-navy-500 shadow-sm"
              >
                {recipients.map(r => (
                  <option key={r.key} value={r.key}>
                    {r.eId} · {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {strategy && defaults && recipient && (
        <div className="space-y-4">
          {/* AI journey analysis — short */}
          <div className="bg-navy-50/60 border border-navy-100 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-navy-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-navy-950 leading-relaxed">{strategy.analysis}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {strategy.signals.map(s => (
                  <span
                    key={s}
                    className="text-[10px] font-bold bg-white border border-navy-200 text-navy-800 rounded-full px-2 py-0.5"
                  >
                    {s}
                  </span>
                ))}
                <span className="text-[10px] font-bold text-slate-500 ml-1">
                  {Math.round(strategy.confidence * 100)}% avg confidence
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Channel journey flowchart */}
            <Card title="Channel journey" icon={<Route className="w-4 h-4" />}>
              <ol className="space-y-3">
                {journey.map(j => (
                  <li key={j.step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-6 h-6 rounded-full bg-navy-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {j.step}
                      </span>
                      {j.step < journey.length && <span className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pb-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{j.date}</span>
                        <span className="text-xs font-bold text-slate-900">
                          {j.channel} &rarr; {j.subChannel}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            OUTCOME_BADGE[j.outcome] || OUTCOME_BADGE.Opened
                          }`}
                        >
                          {j.outcome}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{j.tactic}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            {/* Recipient & key message */}
            <Card title="Recipient & key message" icon={<User className="w-4 h-4" />}>
              <Row label="E_id">
                <span className="font-mono font-bold">{recipient.eId}</span>
              </Row>
              <Row label={recipient.role === 'HCP' ? 'Doctor' : 'Cohort'}>{recipient.name}</Row>
              <Row label="Role">{recipient.role}</Row>
              {recipient.specialty && <Row label="Specialty">{recipient.specialty}</Row>}
              <Row label="Segment">
                {recipient.segment} <span className="text-slate-400">· decile {recipient.decile}</span>
                <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-navy-500 rounded-full" style={{ width: `${recipient.decile * 10}%` }} />
                </div>
              </Row>
              <Row label="Territory">{recipient.territory}</Row>
              <Row label="Consent">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CONSENT_BADGE[recipient.consent]}`}>
                  {recipient.consent}
                </span>
              </Row>
              <Row label="Key message">
                {defaults.topicName}{' '}
                <span className="font-mono text-[10px] text-navy-700 bg-navy-50 border border-navy-200 rounded px-1 py-0.5">
                  {defaults.topicCode.replace(/^km[-_]?/i, '').toUpperCase()}
                </span>
              </Row>
              <Row label="Subtopic">
                {defaults.subtopicName}{' '}
                <span className="font-mono text-[10px] text-slate-500">{defaults.subtopicCode}</span>
              </Row>
            </Card>
          </div>

          {/* Campaign fields — from the Campaign Builder, auto-populated */}
          <Card
            title="Campaign fields"
            icon={<Wand2 className="w-4 h-4" />}
            right={
              anyCampEdited ? (
                <button
                  onClick={() => setCampOverrides({})}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-navy-300 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to AI
                </button>
              ) : undefined
            }
          >
            <p className="text-[11px] text-slate-500 mb-3">
              The approved <b>{defaults.channelType}</b> Campaign Name formula, pre-filled from{' '}
              {defaults.basisCount} campaign{defaults.basisCount === 1 ? '' : 's'} on this journey. Every field is editable.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">Channel</label>
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
                  {defaults.channelType} &rarr; {defaults.subChannel}
                </div>
              </div>
              {inputTokens.map(t => {
                const opts = OPTION_MAP[t.key] || [];
                return (
                  <div key={t.key}>
                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 mb-1">
                      {t.label}
                      <AiBadge edited={cEdited(t.key)} />
                    </label>
                    <select
                      value={ccv(t.key)}
                      onChange={e => setCamp(t.key, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-navy-500"
                    >
                      {(opts.includes(ccv(t.key)) ? opts : [ccv(t.key), ...opts]).map(o => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
              {extraFields.map(f => (
                <div key={f.key}>
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 mb-1">
                    {f.label}
                    <AiBadge edited={cEdited(f.key)} />
                  </label>
                  {f.options ? (
                    <select
                      value={ccv(f.key)}
                      onChange={e => setCamp(f.key, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-navy-500"
                    >
                      <option value="">— select —</option>
                      {f.options.map(o => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={ccv(f.key)}
                      onChange={e => setCamp(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-navy-500"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Auto-filled tokens */}
            <div className="mt-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Auto-filled tokens</div>
              <div className="flex flex-wrap gap-2">
                {autoTokens.map(t => (
                  <span key={t.key} className="text-[11px] bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                    <span className="text-slate-400">{t.label}:</span>{' '}
                    <span className="font-mono font-bold text-slate-900">{formulaInputs[t.key] || '—'}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Built taxonomy string */}
            {built && (
              <div className="mt-4 bg-slate-900 text-white rounded-2xl border border-slate-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-navy-400 font-bold text-xs">
                    <Code className="w-4 h-4" />
                    <span>Campaign Name taxonomy string</span>
                  </div>
                  <button
                    onClick={() => doCopy('tax', built.string)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 hover:bg-slate-700 transition"
                  >
                    {copied === 'tax' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'tax' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-400 break-words">{formulaTemplate(defaults.channelType)}</div>
                <div className="font-mono text-xs text-navy-300 font-bold break-all bg-slate-950 rounded-lg border border-slate-800 p-2.5">
                  {built.string}
                </div>
              </div>
            )}
          </Card>

          {/* UTM parameters — pre-filled */}
          <Card
            title="UTM parameters"
            icon={<LinkIcon className="w-4 h-4" />}
            right={
              anyUtmEdited ? (
                <button
                  onClick={() => setUtmOverrides({})}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-navy-300 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to AI
                </button>
              ) : undefined
            }
          >
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 mb-1">
                  Landing page URL
                  <AiBadge edited={uEdited('base')} />
                </label>
                <input
                  value={baseValue}
                  onChange={e => setUtmOverrides(o => ({ ...o, base: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500"
                />
              </div>

              {strategy.fields.map(f => {
                const isEdited = uEdited(f.key);
                return (
                  <div key={f.key}>
                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 mb-1">
                      <span className="font-mono text-slate-500">{f.key}</span>
                      <span className="text-slate-400 font-medium">· {f.label}</span>
                      <AiBadge edited={isEdited} conf={Math.round(f.confidence * 100)} />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        value={uv(f.key)}
                        onChange={e => setUtmOverrides(o => ({ ...o, [f.key]: e.target.value }))}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500"
                      />
                      {isEdited && (
                        <button
                          onClick={() =>
                            setUtmOverrides(o => {
                              const n = { ...o };
                              delete n[f.key];
                              return n;
                            })
                          }
                          className="text-slate-400 hover:text-navy-600 shrink-0"
                          title="Restore the AI suggestion"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{f.rationale}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Output */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> Tracking URL
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => doCopy('qs', queryString)}
                  disabled={!queryString}
                  className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1 hover:border-navy-300 transition disabled:opacity-40"
                >
                  {copied === 'qs' ? 'Copied' : 'Copy query'}
                </button>
                <button
                  onClick={() => doCopy('url', trackingUrl)}
                  className="flex items-center gap-1 text-[11px] font-bold text-white bg-navy-600 border border-navy-600 rounded-lg px-2.5 py-1 hover:bg-navy-700 transition"
                >
                  {copied === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === 'url' ? 'Copied' : 'Copy URL'}
                </button>
              </div>
            </div>
            <div className="font-mono text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 break-all shadow-sm">
              {trackingUrl}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between font-medium">
              <span>{trackingUrl.length} chars</span>
              <span className="text-emerald-700 font-bold">UTM compliant</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
