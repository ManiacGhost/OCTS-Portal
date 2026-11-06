import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Code, Copy, Check, Link2, Layers } from 'lucide-react';
import { usePersona } from '../../context/PersonaContext';
import { CAMPAIGN_FORMULA } from '../../data/taxonomyFormulas';
import { KITE_MEDIUM, KiteChannel } from '../../data/kiteTaxonomy';
import { hasTactic, isApproved, tacticStatusOf, statusLabel, tacticCode } from '../../data/approvalStatus';
import { VaultCombobox } from './VaultCombobox';
import { VaultItem } from '../../data/assetVault';
import { CampaignTaxonomy } from '../../types';

/** Old campaign channelType → Kite channel. */
const KITE_CHANNEL_OF: Record<string, KiteChannel> = {
  Digital: 'Digital',
  Social: 'Social',
  Search: 'Search',
  SFMC: 'Email',
  Email: 'Email',
  IVA: 'IVA',
  Website: 'Website',
};

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
      {children || <span className="text-slate-300">—</span>}
    </div>
  </div>
);

const tacticTitle = (t: CampaignTaxonomy): string =>
  `${tacticCode(t)} — ` + [
    [t.channelType || 'Tactic', t.subChannel].filter(Boolean).join(' · '),
    t.tactic?.publisher || 'Publisher not set',
  ].join(' · ') + (t.tactic?.placement ? ` — ${t.tactic.placement}` : '');

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

  // approved tactics of approved campaigns (plus the one we were sent here with)
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
  const ts = tactic ? tacticStatusOf(tactic) : undefined;

  const trackingUrl = useMemo(() => {
    if (!tactic || !campaign) return '';
    const brandCode = brand?.code || 'brand';
    const medium = KITE_MEDIUM[(KITE_CHANNEL_OF[tactic.channelType || ''] || 'Digital') as KiteChannel] || 'digital';
    const params: [string, string][] = [
      ['utm_source', slug(tactic.tactic?.publisher || tactic.channelType)],
      ['utm_medium', slug(tactic.subChannel || medium)],
      ['utm_campaign', slug(campaign.utmCampaign || campaign.campaignName)],
      ['utm_content', slug(tactic.assetId || tactic.tactic?.targetAudience)],
      ['campaign_id', campaign.id],
      ['tactic_id', tacticCode(tactic)],
    ];
    const landing = tactic.tactic?.landingPageUrl?.trim();
    try {
      const u = new URL(landing && /^https?:\/\//i.test(landing) ? landing : `https://hcp.kitepharma.com/${slug(brandCode)}`);
      params.forEach(([k, v]) => u.searchParams.set(k, v));
      return u.toString();
    } catch {
      return `https://hcp.kitepharma.com/${slug(brandCode)}?` + params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    }
  }, [tactic, campaign, brand]);

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
            <span className="font-mono text-[11px] text-navy-700 break-all">{campaign.campaignCode}</span>
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
            No approved tactics yet. A tactic appears here once it and its campaign are approved.
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
            <Row label="Channel">{tactic.channelType}</Row>
            <Row label="Sub-channel">{tactic.subChannel}</Row>
            <Row label="Publisher / Platform">{tactic.tactic?.publisher}</Row>
            <Row label="Placement">{tactic.tactic?.placement}</Row>
            <Row label="Creative / Asset ID" mono>{tactic.assetId}</Row>
            <Row label="Target audience">{tactic.tactic?.targetAudience}</Row>
            <Row label="Landing page URL" mono>{tactic.tactic?.landingPageUrl}</Row>
            <Row label="Start – end">{tactic.tactic ? `${tactic.tactic.startDate} → ${tactic.tactic.endDate}` : ''}</Row>
            <Row label="Tactic status">{ts ? statusLabel(ts) : ''}</Row>
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
