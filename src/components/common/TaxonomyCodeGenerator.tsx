import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Code, Copy, Check, Link2, Layers } from 'lucide-react';
import { usePersona } from '../../context/PersonaContext';
import { CAMPAIGN_FORMULA } from '../../data/taxonomyFormulas';
import { hasTactic, isApproved, tacticStatusOf, tacticCode, campaignIdOf, channelLabel } from '../../data/approvalStatus';
import { VaultCombobox } from './VaultCombobox';
import { VaultItem } from '../../data/assetVault';
import { CampaignTaxonomy } from '../../types';

const hashOf = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return h >>> 0;
};

/**
 * The content ID for utm_content, system generated like the campaign ID: us (the market) + ct + year + month +
 * a number, e.g. usct202608201. The month is the tactic's; the number comes from its tactic ID, so it never changes.
 */
const contentIdOf = (t: CampaignTaxonomy): string => {
  const d = new Date(t.createdAt || t.tactic?.startDate || Date.now());
  const when = isNaN(d.getTime()) ? new Date() : d;
  const digits = (tacticCode(t).match(/\d+/g) || []).join('');
  const n = digits ? Number(digits.slice(-3)) || 1 : (hashOf(t.id) % 999) + 1;
  return `usct${when.getFullYear()}${String(when.getMonth() + 1).padStart(2, '0')}${String(n).padStart(3, '0')}`;
};

/** A sample user ID for utm_term (the sending platform puts each recipient's own ID here), e.g. u40718263. */
const sampleUserIdOf = (t: CampaignTaxonomy): string => `u${String(hashOf(`user|${t.id}`) % 100000000).padStart(8, '0')}`;

const slug = (v: string | undefined | null): string =>
  String(v ?? '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // split camelCase BEFORE lowercasing
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'na';

const Row: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div className="grid grid-cols-3 gap-3 py-2 border-b border-slate-100 last:border-0">
    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
    <div className={`col-span-2 text-xs text-slate-900 break-words ${mono ? 'font-mono' : 'font-medium'}`}>
      {children || <span className="text-slate-300">-</span>}
    </div>
  </div>
);

const tacticTitle = (t: CampaignTaxonomy): string =>
  `${tacticCode(t)}: ` + [
    [channelLabel(t) || 'Tactic', t.subChannel].filter(Boolean).join(' · '),
    t.tactic?.publisher || 'Publisher not set',
  ].join(' · ') + (t.tactic?.placement ? ` · ${t.tactic.placement}` : '');

/**
 * Tactic-based UTM generator: pick a tactic, see its campaign and its own details, and build the
 * tracking link from the tactic.
 */
export const TaxonomyCodeGenerator: React.FC = () => {
  const { brands, campaigns, showToast } = usePersona();
  const [searchParams] = useSearchParams();
  // links from the campaign / tactic screens pass the tactic's record id
  const wantedId = searchParams.get('tactic') || searchParams.get('campaign') || '';

  const [tacticId, setTacticId] = useState('');
  const [copied, setCopied] = useState(false);

  const parentOf = (t: CampaignTaxonomy) => campaigns.find(c => c.id === (t.parentCampaignId ?? t.id)) || t;

  // tactics of approved campaigns (plus the one we were sent here with); tactics need no approval
  const tactics = useMemo(
    () =>
      campaigns.filter(
        t =>
          hasTactic(t) &&
          ((isApproved(tacticStatusOf(t)) && isApproved(parentOf(t).status)) || t.id === wantedId)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [campaigns, wantedId]
  );

  useEffect(() => {
    if (wantedId && tactics.some(t => t.id === wantedId)) setTacticId(wantedId);
  }, [wantedId, tactics]);

  const items: VaultItem[] = tactics.map(t => ({ id: t.id, name: tacticTitle(t), detail: parentOf(t).campaignName }));
  const tactic = tactics.find(t => t.id === tacticId) || null;
  const campaign = tactic ? parentOf(tactic) : null;
  const brand = campaign ? brands.find(b => b.id === campaign.brandId) : undefined;

  // Only four UTM parameters go into the link — more would make the URL too long (client's call).
  const utmParams = useMemo(() => {
    if (!tactic || !campaign) return [];
    return [
      { name: 'utm_medium', value: slug(channelLabel(tactic)), from: 'Channel' },
      { name: 'utm_campaign', value: slug(campaignIdOf(campaign)), from: 'Campaign ID' },
      // utm_term carries the user's ID (not their name); the sending platform puts each recipient's own ID here
      { name: 'utm_term', value: sampleUserIdOf(tactic), from: 'User ID (sample, each recipient gets their own)' },
      { name: 'utm_content', value: contentIdOf(tactic), from: 'Content ID (system generated)' },
    ];
  }, [tactic, campaign]);

  const trackingUrl = useMemo(() => {
    if (!tactic || !campaign) return '';
    const brandCode = brand?.code || 'brand';
    const pairs: [string, string][] = utmParams.map(p => [p.name, p.value]);
    const landing = tactic.tactic?.landingPageUrl?.trim();
    const base = landing && /^https?:\/\//i.test(landing) ? landing : `https://hcp.kitepharma.com/${slug(brandCode)}`;
    const query = pairs.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    try {
      const u = new URL(base);
      const existing = u.search.replace(/^\?/, '');
      u.search = '';
      return `${u.toString()}?${[existing, query].filter(Boolean).join('&')}`;
    } catch {
      return `${base}${base.includes('?') ? '&' : '?'}${query}`;
    }
  }, [tactic, campaign, brand, utmParams]);

  const copy = () => {
    navigator.clipboard?.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    showToast('Tracking URL copied', 'success');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm text-slate-900">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <div className="p-2 rounded-xl bg-navy-600 text-white shadow-sm">
          <Code className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">UTM Generator</h3>
          <p className="text-xs text-slate-500">Pick a tactic and generate its tracking link.</p>
        </div>
      </div>

      {/* Tactic picker — the campaign it belongs to is shown on top once one is picked */}
      <div className="bg-navy-50/60 border border-navy-100 rounded-xl p-3 space-y-2">
        {campaign && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs bg-white border border-navy-200 rounded-lg px-3 py-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign</span>
            <span className="font-bold text-slate-900">{campaign.campaignName}</span>
            <span className="font-mono text-[11px] font-bold text-navy-700">{campaignIdOf(campaign)}</span>
          </div>
        )}
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-navy-800 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" /> Tactic
        </label>
        <VaultCombobox
          value={tacticId}
          onChange={setTacticId}
          items={items}
          ariaLabel="Tactic"
          placeholder="Search tactics by ID, channel, publisher, placement or campaign…"
          labelOf={i => (i.detail ? `${i.name} (${i.detail})` : i.name)}
        />
        {items.length === 0 && (
          <p className="text-[11px] text-slate-500">
            No tactics yet. A tactic appears here once its campaign is approved and the tactic is saved.
          </p>
        )}
      </div>

      {tactic && campaign && (
        <>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 mb-1">Campaign details</h4>
            <Row label="Product">{brand ? `${brand.name} (${brand.code})` : campaign.brandId}</Row>
            {CAMPAIGN_FORMULA.filter(f => f.source !== 'brand').map(f => (
              <Row key={f.key} label={f.label} mono>
                {campaign.formulaInputs?.[f.key]}
              </Row>
            ))}
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-slate-900 mb-1">Tactic details</h4>
            <Row label="Tactic ID" mono>{tacticCode(tactic)}</Row>
            <Row label="Channel">{channelLabel(tactic)}</Row>
            <Row label="Sub-channel">{tactic.subChannel}</Row>
            <Row label="Publisher / Platform">{tactic.tactic?.publisher}</Row>
            <Row label="Placement">{tactic.tactic?.placement}</Row>
            <Row label="Creative / Asset ID" mono>{tactic.assetId}</Row>
            <Row label="Landing page URL" mono>{tactic.tactic?.landingPageUrl}</Row>
            <Row label="Start – end">{tactic.tactic ? `${tactic.tactic.startDate} → ${tactic.tactic.endDate}` : ''}</Row>
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-slate-900 mb-1">UTM parameters</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Parameter</th>
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Value</th>
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Taken from</th>
                  </tr>
                </thead>
                <tbody>
                  {utmParams.map(p => (
                    <tr key={p.name} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-1.5 text-xs font-mono font-bold text-navy-700">{p.name}</td>
                      <td className="px-3 py-1.5 text-xs font-mono text-slate-900 break-all">{p.value}</td>
                      <td className="px-3 py-1.5 text-xs text-slate-500">{p.from}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-navy-800 uppercase tracking-wider">
                <Link2 className="w-3.5 h-3.5" /> Tracking URL
              </span>
              <button
                type="button"
                onClick={copy}
                className="text-xs text-navy-800 hover:text-navy-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 break-all font-medium shadow-sm">
              {trackingUrl}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
