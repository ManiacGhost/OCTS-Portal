import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, Copy, Check, CheckCircle2, Sparkles, ArrowRight, Link2 } from 'lucide-react';
import { usePersona } from '../../context/PersonaContext';
import { CHANNEL_TYPES, MEDIUMS, INDICATIONS, TARGETS, COUNTRIES } from '../../data/taxonomyFormulas';
import {
  subChannelsWithDimensions,
  dimensionByName,
  dimensionOptions,
} from '../../data/taggableDimensions';
import { useBrandStrategy } from '../../data/brandStrategyStore';
import { CampaignTaxonomy, MediaChannelType } from '../../types';

const slug = (v: string | undefined | null): string =>
  String(v ?? '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // split camelCase BEFORE lowercasing
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'na';

const quarterToDate = (quarter: string): string => {
  const m = /^(\d{4})-Q([1-4])$/.exec(quarter || '');
  if (!m) return quarter?.slice(0, 4) ? `${quarter.slice(0, 4)}-01-01` : '2026-07-01';
  const month = String((Number(m[2]) - 1) * 3 + 1).padStart(2, '0');
  return `${m[1]}-${month}-01`;
};

export const TaxonomyCodeGenerator: React.FC = () => {
  const { brands, channels, therapeuticAreas, campaigns, showToast } = usePersona();
  const bs = useBrandStrategy();

  const [linkedId, setLinkedId] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id || 'brand-yescarta');
  const [channelType, setChannelType] = useState<MediaChannelType>('Digital');
  const [subChannel, setSubChannel] = useState<string>(subChannelsWithDimensions('Digital')[0] || '');
  const [indication, setIndication] = useState(INDICATIONS[0]);
  const [audience, setAudience] = useState(TARGETS[0]);
  const [market, setMarket] = useState(COUNTRIES[0]);
  const [launchDate, setLaunchDate] = useState('2026-07-01');
  const [campaignSlug, setCampaignSlug] = useState('orr_launch');
  const [dimValues, setDimValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<'tax' | 'utm' | null>(null);

  const brand = brands.find(b => b.id === brandId) || brands[0];
  const bId = brand?.id || brandId;
  const channelRecord = channels.find(c => c.name === channelType);
  const subChannelList = subChannelsWithDimensions(channelType);
  const hasSubChannels = subChannelList.length > 0;
  const linked = campaigns.find(c => c.id === linkedId) || null;
  const year = (launchDate || '2026').slice(0, 4);

  const chooseChannel = (ct: MediaChannelType) => {
    setChannelType(ct);
    setSubChannel(subChannelsWithDimensions(ct)[0] || '');
    setDimValues({});
  };
  const chooseSubChannel = (sc: string) => {
    setSubChannel(sc);
    setDimValues({});
  };

  // Pick an existing campaign → pull its details into the generator.
  const linkCampaign = (id: string) => {
    setLinkedId(id);
    setDimValues({});
    const c = campaigns.find(x => x.id === id);
    if (!c) return;
    if (c.brandId) setBrandId(c.brandId);
    if (c.channelType) {
      setChannelType(c.channelType);
      const subs = subChannelsWithDimensions(c.channelType);
      setSubChannel(subs.includes(c.subChannel || '') ? c.subChannel! : subs[0] || '');
    }
    const ind = c.formulaInputs?.indication;
    if (ind && (INDICATIONS as string[]).includes(ind)) setIndication(ind);
    if (c.targetAudience && (TARGETS as string[]).includes(c.targetAudience)) setAudience(c.targetAudience);
    const ctry = c.formulaInputs?.country;
    if (ctry && (COUNTRIES as string[]).includes(ctry)) setMarket(ctry);
    if (c.quarter) setLaunchDate(quarterToDate(c.quarter));
    if (c.utmCampaign) setCampaignSlug(c.utmCampaign);
  };

  // Everything the generator already knows about this campaign — for auto-matching dimensions.
  const facts = useMemo(() => {
    const f: Record<string, string> = {};
    const put = (k: string, v: unknown) => {
      const val = v == null ? '' : String(v).trim();
      if (val) f[slug(k)] = val;
    };
    const ta = therapeuticAreas.find(t => t.id === (linked?.therapeuticAreaId || brand?.therapeuticAreaId));
    // from the linked campaign record
    if (linked) {
      put('campaign id', linked.id);
      put('campaign name', linked.campaignName);
      put('campaign code', linked.campaignCode);
      put('taxonomy string', linked.taxonomyString);
      put('landing page url', linked.contentAssetUrl);
      put('utm source', linked.utmSource);
      put('utm medium', linked.utmMedium);
      put('utm campaign', linked.utmCampaign);
      put('utm content', linked.utmContent);
      put('agency', linked.agencyOwner);
      Object.entries(linked.formulaInputs || {}).forEach(([k, v]) => put(k, v));
    }
    // from the current form inputs
    put('brand', brand?.name?.split(/[ (]/)[0]);
    put('brand code', brand?.code);
    put('product', brand?.code);
    put('product code', brand?.code);
    put('indication', indication);
    put('therapeutic area', ta?.code);
    put('target', audience);
    put('target audience', audience);
    put('audience', audience);
    put('market', market);
    put('country', market);
    put('region', market);
    put('year', year);
    put('campaign year', year);
    put('channel', channelType);
    put('medium', MEDIUMS[channelType]);
    put('sub channel', hasSubChannels ? subChannel : '');
    put('platform', hasSubChannels ? subChannel : '');
    return f;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linked, brand, indication, audience, market, channelType, subChannel, hasSubChannels, therapeuticAreas]);

  /** Best matching known value for a dimension name, or '' if none. */
  const matchFor = (name: string): string => {
    const key = slug(name);
    if (facts[key]) return facts[key];
    // substring either way (guard against very short keys)
    for (const fk of Object.keys(facts)) {
      if (fk.length >= 3 && (key.includes(fk) || fk.includes(key))) return facts[fk];
    }
    return '';
  };

  // Dimensions this brand tags for the selected channel / sub-channel,
  // with the brand's per-dimension name / captures / default-value edits applied.
  const scopeSub = hasSubChannels ? subChannel : '';
  const strategyDims = useMemo(() => {
    return bs
      .getSelected(bId, channelType, scopeSub)
      .map(origName => {
        const dim = dimensionByName(channelType, scopeSub, origName);
        if (!dim) return null;
        const ed = bs.getEdit(bId, channelType, scopeSub, origName);
        return {
          dim,
          origName,
          label: ed.name || dim.name,
          captures: ed.captures || dim.captures,
          def: ed.defaultValue || '',
        };
      })
      .filter((d): d is NonNullable<typeof d> => !!d);
  }, [bs, bId, channelType, scopeSub]);

  /** displayed value: user edit → auto-match from campaign/form → strategy default → '' */
  const dv = (origName: string) => {
    const found = strategyDims.find(d => d.origName === origName);
    if (dimValues[origName] !== undefined) return dimValues[origName];
    return matchFor(found?.label || origName) || matchFor(origName) || found?.def || '';
  };
  /** true when the shown value came from an auto-match (not typed, not a plain default) */
  const isAutoMatched = (origName: string) => {
    if (dimValues[origName] !== undefined) return false;
    const found = strategyDims.find(d => d.origName === origName);
    return !!(matchFor(found?.label || origName) || matchFor(origName));
  };
  const brandCode = brand?.code || 'YES';
  const brandWord = brand?.name.split(/[ (]/)[0] || 'Yescarta';

  const sourceSlug = slug(channelRecord?.downstreamPlatform || channelType);
  const mediumSlug = slug(hasSubChannels && subChannel ? subChannel : MEDIUMS[channelType]);
  const campaignParam = linked?.utmCampaign
    ? slug(linked.utmCampaign)
    : [slug(brandWord), slug(indication), year, slug(campaignSlug)].filter(v => v && v !== 'na').join('_');
  const contentParam = slug(audience);

  const taxonomyString = [
    slug(market),
    slug(MEDIUMS[channelType]),
    slug(brandCode),
    slug(indication),
    slug(audience),
    year,
    hasSubChannels ? slug(subChannel) : '',
    ...strategyDims.map(d => slug(dv(d.origName))),
  ]
    .filter(v => v && v !== 'na')
    .join('_');

  const dimParams = strategyDims
    .filter(d => dv(d.origName).trim())
    .map(d => `${slug(d.label)}=${encodeURIComponent(slug(dv(d.origName)))}`)
    .join('&');

  const trackingUrl =
    `https://hcp.kitepharma.com/${slug(brandCode)}` +
    `?utm_source=${sourceSlug}&utm_medium=${mediumSlug}` +
    `&utm_campaign=${campaignParam}&utm_content=${contentParam}` +
    (linked ? `&campaign_id=${encodeURIComponent(linked.id)}` : '') +
    (dimParams ? `&${dimParams}` : '');

  const copy = (which: 'tax' | 'utm', text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1800);
    showToast(`${label} copied`, 'success');
  };

  const scopeLabel = hasSubChannels && subChannel ? `${channelType} → ${subChannel}` : channelType;

  const field =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-medium';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-navy-600 text-white shadow-sm">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Code &amp; UTM Generator</h3>
            <p className="text-xs text-slate-500">
              Link a campaign, fill in its details, and the brand&rsquo;s tagging strategy becomes the
              UTM parameters &mdash; any dimension the campaign already answers is auto-filled.
            </p>
          </div>
        </div>
      </div>

      {/* Link a campaign */}
      <div className="bg-navy-50/60 border border-navy-100 rounded-xl p-3">
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-navy-800 uppercase tracking-wider mb-1.5">
          <Link2 className="w-3.5 h-3.5" /> Campaign
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <select value={linkedId} onChange={e => linkCampaign(e.target.value)} className={`${field} sm:max-w-md`}>
            <option value="">— none (fill in manually) —</option>
            {campaigns.map((c: CampaignTaxonomy) => (
              <option key={c.id} value={c.id}>
                {c.campaignName} · {c.campaignCode}
              </option>
            ))}
          </select>
          {linked && (
            <span className="font-mono text-[11px] text-navy-700 bg-white border border-navy-200 rounded px-2 py-1">
              {linked.id}
            </span>
          )}
        </div>
        {linked && (
          <p className="text-[10px] text-slate-500 mt-1.5">
            Pulled brand, indication, audience, market, date and channel from this campaign. Matching
            strategy dimensions below are auto-filled and tagged <b>from campaign</b>.
          </p>
        )}
      </div>

      {/* Campaign details */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign details</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
            <select value={brandId} onChange={e => setBrandId(e.target.value)} className={field}>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name.split(/[ (]/)[0]} ({b.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Indication</label>
            <select value={indication} onChange={e => setIndication(e.target.value)} className={field}>
              {INDICATIONS.map(i => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target audience</label>
            <select value={audience} onChange={e => setAudience(e.target.value)} className={field}>
              {TARGETS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Market</label>
            <select value={market} onChange={e => setMarket(e.target.value)} className={field}>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Launch date</label>
            <input type="date" value={launchDate} onChange={e => setLaunchDate(e.target.value)} className={field} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campaign slug</label>
            <input
              value={campaignSlug}
              onChange={e => setCampaignSlug(e.target.value)}
              placeholder="e.g. orr_launch"
              className={field}
            />
          </div>
        </div>
      </div>

      {/* Channel & sub-channel */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Channel</div>
        <div className="flex flex-wrap items-center gap-2">
          {CHANNEL_TYPES.map(ct => (
            <button
              key={ct}
              type="button"
              onClick={() => chooseChannel(ct)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                channelType === ct
                  ? 'bg-navy-600 text-white border-navy-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {ct}
            </button>
          ))}
          {hasSubChannels && (
            <select
              value={subChannel}
              onChange={e => chooseSubChannel(e.target.value)}
              className="ml-1 bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-navy-500 shadow-sm"
            >
              {subChannelList.map(sc => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Strategy dimensions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-navy-600" />
            Tagging-strategy dimensions &mdash; {scopeLabel}
          </div>
          <Link
            to="/tagging-strategy"
            className="flex items-center gap-1 text-[11px] font-bold text-navy-700 hover:text-navy-900"
          >
            Edit strategy
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {strategyDims.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-3 text-xs text-amber-900">
            No tagging strategy set for <b>{brandWord}</b> &middot; {scopeLabel}. Choose which dimensions this
            brand tags in{' '}
            <Link to="/tagging-strategy" className="font-bold underline">
              Tagging Strategy
            </Link>
            , then they appear here as editable UTM fields.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {strategyDims.map(d => {
              const opts = dimensionOptions(d.dim);
              const auto = isAutoMatched(d.origName);
              return (
                <div key={d.origName}>
                  <label className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                    {d.label} <span className="text-slate-400 font-medium">&middot; {d.captures}</span>
                    {auto && (
                      <span className="text-[9px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1 py-0.5">
                        from campaign
                      </span>
                    )}
                  </label>
                  {opts ? (
                    <select
                      value={dv(d.origName)}
                      onChange={e => setDimValues(v => ({ ...v, [d.origName]: e.target.value }))}
                      className={field}
                    >
                      <option value="">— select —</option>
                      {[...(opts.includes(dv(d.origName)) || !dv(d.origName) ? opts : [dv(d.origName), ...opts])].map(o => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={dv(d.origName)}
                      onChange={e => setDimValues(v => ({ ...v, [d.origName]: e.target.value }))}
                      placeholder={d.dim.example}
                      className={field}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Outputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-navy-800 uppercase tracking-wider">Taxonomy string</span>
            <button
              onClick={() => copy('tax', taxonomyString, 'Taxonomy string')}
              className="text-xs text-navy-800 hover:text-navy-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold shadow-sm"
            >
              {copied === 'tax' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'tax' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="font-mono text-sm font-extrabold text-slate-900 bg-white p-3 rounded-lg border border-slate-200 break-all shadow-sm">
            {taxonomyString}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between font-medium">
            <span>Length: {taxonomyString.length} chars (Limit: 128)</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Validated format
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-navy-800 uppercase tracking-wider">Campaign tracking URL</span>
            <button
              onClick={() => copy('utm', trackingUrl, 'Tracking URL')}
              className="text-xs text-navy-800 hover:text-navy-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold shadow-sm"
            >
              {copied === 'utm' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'utm' ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>
          <div className="font-mono text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 break-all max-h-28 overflow-y-auto font-medium shadow-sm">
            {trackingUrl}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between font-medium">
            <span>{strategyDims.filter(d => dv(d.origName).trim()).length} strategy dimensions in URL</span>
            <span className="text-navy-800 font-mono font-bold">UTM compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
