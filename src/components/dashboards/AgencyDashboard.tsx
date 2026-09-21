import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersona } from '../../context/PersonaContext';
import { useAuth } from '../../auth/AuthContext';
import { KeyMessageSelector } from '../common/KeyMessageSelector';
import { TaxonomyTooltip, TAXONOMY_TOOLTIPS } from '../common/TaxonomyTooltip';
import {
  CHANNEL_TYPES,
  CAMPAIGN_FORMULA,
  SUB_CHANNELS,
  SUB_CHANNEL_FIELDS,
  MEDIUMS,
  COUNTRIES,
  MESSAGING_TYPES,
  TARGETS,
  INDICATIONS,
  buildCampaignTaxonomy,
  formulaTemplate,
  generateCode,
  MediaChannelType,
} from '../../data/taxonomyFormulas';

const CHANNEL_ID: Record<MediaChannelType, string> = {
  Digital: 'chan-digital',
  Social: 'chan-social',
  Search: 'chan-search',
  Email: 'chan-email',
  IVA: 'chan-iva',
};

const KIND_LABEL: Record<string, string> = { c: 'controlled', v: 'variable', m: 'machine', f: 'free text' };
import { FilePlus, CheckCircle2, Send, Layers, Code, ArrowRight, ArrowLeft, Info, Hash } from 'lucide-react';

export const AgencyDashboard: React.FC = () => {
  const { brands, addCampaign, showToast, selectedMarket } = usePersona();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Multi-step Builder Flow State
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Asset & Tactic — the starting point of every campaign flow, captured before context.
  const [assetId, setAssetId] = useState('');
  const [tacticId, setTacticId] = useState('');

  // Campaign Form State
  const [campaignName, setCampaignName] = useState('Yescarta 2L LBCL — ORR HCP Meta');
  const [selectedTaId, setSelectedTaId] = useState('ta-cart');
  const [selectedBrandId, setSelectedBrandId] = useState('brand-yescarta');
  const [selectedCatId, setSelectedCatId] = useState('km-cat-eff');
  const [selectedSubId, setSelectedSubId] = useState('km-sub-eff-01');
  const [quarter, setQuarter] = useState('2026-Q3');
  const [region, setRegion] = useState('US Commercial');
  const [notes, setNotes] = useState('Built from the approved Social Campaign Name formula.');

  // Approved-formula channel state
  const [channelType, setChannelType] = useState<MediaChannelType>('Digital');
  const [subChannel, setSubChannel] = useState<string>(SUB_CHANNELS.Digital[0] || '');
  const [country, setCountry] = useState('US');
  const [messagingType, setMessagingType] = useState(MESSAGING_TYPES[0]);
  const [target, setTarget] = useState('HCP');
  const [indication, setIndication] = useState(INDICATIONS[0]);
  const [platform, setPlatform] = useState('');
  const [subChannelMeta, setSubChannelMeta] = useState<Record<string, string>>({});

  const platformOptions =
    (CAMPAIGN_FORMULA[channelType].find(t => t.key === 'platform')?.options) || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stable machine `Code (m)` token for this builder session.
  const machineCode = useMemo(() => generateCode(), []);

  const selectedBrand = brands.find(b => b.id === selectedBrandId);
  const yearToken = (quarter.split('-')[0] || '2026');

  const chooseChannel = (ch: MediaChannelType) => {
    setChannelType(ch);
    setSubChannel(SUB_CHANNELS[ch][0] || '');
    setSubChannelMeta({});
    setPlatform((CAMPAIGN_FORMULA[ch].find(t => t.key === 'platform')?.options || [])[0] || '');
  };
  const chooseSubChannel = (sc: string) => {
    setSubChannel(sc);
    setSubChannelMeta({});
  };

  // Resolve every formula token to a value.
  const formulaInputs: Record<string, string> = {
    country,
    medium: MEDIUMS[channelType],
    product: selectedBrand?.code || 'YES',
    messagingType,
    ta: selectedTaId === 'ta-cart' ? 'CART' : (selectedTaId === 'ta-hem' ? 'HEM' : 'ONC'),
    target,
    indication,
    platform: platformOptions.length ? platform : subChannel,
    year: yearToken,
    code: machineCode,
    // Mirror the flow's starting point into the matching C360 dimension codes so they
    // auto-populate the Tagging Strategy / Code & UTM Generator (see kiteTaxonomy.ts).
    aset_id: assetId,
    tact_id: tacticId,
    ...subChannelMeta,
  };

  const assetTacticReady = assetId.trim().length > 0 && tacticId.trim().length > 0;

  const built = buildCampaignTaxonomy(channelType, formulaInputs);
  const extraFields = SUB_CHANNEL_FIELDS[channelType][subChannel] || [];

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName) {
      showToast('Please provide a campaign name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addCampaign({
        campaignName,
        therapeuticAreaId: selectedTaId,
        brandId: selectedBrandId,
        keyMessageCategoryId: selectedCatId,
        keyMessageSubcategoryId: selectedSubId,
        channelId: CHANNEL_ID[channelType],
        channelType,
        subChannel,
        assetId,
        tacticId,
        format: subChannel,
        formulaInputs,
        campaignCode: built.string,
        taxonomyString: built.string,
        targetAudience: target,
        region: selectedMarket || region,
        quarter,
        agencyOwner: user?.organization || 'Klick Health',
        status: 'submitted',
        notes
      });

      if (created) {
        setBuilderStep(1);
        navigate('/overview');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">New Campaign</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Build compliant campaign taxonomy and submit for marketer approval
            &mdash; {selectedMarket} &middot; {user?.organization}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/overview')}
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-navy-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Campaigns
        </button>
      </div>

      {/* Step-by-Step Campaign Taxonomy Builder */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm text-slate-900">
          
          {/* Flow Stepper Header */}
          <div className="border-b border-slate-100 pb-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-navy-600" />
                  Campaign Taxonomy Flow
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step-by-step guided workflow for agencies to establish compliant campaign metadata.
                </p>
              </div>

              <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Step <span className="text-navy-600 font-mono text-sm">{builderStep}</span> of <span className="font-mono text-sm">5</span>
              </div>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="grid grid-cols-5 gap-2 text-xs">
              <button
                onClick={() => setBuilderStep(1)}
                className={`p-2.5 rounded-xl border text-left transition font-bold ${
                  builderStep === 1
                    ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                    : builderStep > 1
                    ? 'bg-navy-50 text-navy-800 border-navy-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                1. Asset &amp; Tactic
              </button>

              <button
                onClick={() => setBuilderStep(2)}
                className={`p-2.5 rounded-xl border text-left transition font-bold ${
                  builderStep === 2
                    ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                    : builderStep > 2
                    ? 'bg-navy-50 text-navy-800 border-navy-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                2. Campaign Context
              </button>

              <button
                onClick={() => setBuilderStep(3)}
                className={`p-2.5 rounded-xl border text-left transition font-bold ${
                  builderStep === 3
                    ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                    : builderStep > 3
                    ? 'bg-navy-50 text-navy-800 border-navy-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                3. Topic & Subtopic
              </button>

              <button
                onClick={() => setBuilderStep(4)}
                className={`p-2.5 rounded-xl border text-left transition font-bold ${
                  builderStep === 4
                    ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                    : builderStep > 4
                    ? 'bg-navy-50 text-navy-800 border-navy-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                4. Channel & Formula
              </button>

              <button
                onClick={() => setBuilderStep(5)}
                className={`p-2.5 rounded-xl border text-left transition font-bold ${
                  builderStep === 5
                    ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                5. Review & Submit
              </button>
            </div>
          </div>

          {/* Asset & Tactic recap — stays visible once past step 1 so the flow's anchor is never lost */}
          {builderStep > 1 && (assetId || tacticId) && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] -mt-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Anchored to:</span>
              <span className="font-mono font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-2 py-0.5">
                Asset {assetId || '—'}
              </span>
              <span className="font-mono font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-2 py-0.5">
                Tactic {tacticId || '—'}
              </span>
              <button
                type="button"
                onClick={() => setBuilderStep(1)}
                className="text-navy-600 hover:text-navy-800 font-bold underline underline-offset-2"
              >
                edit
              </button>
            </div>
          )}

          {/* STEP 1: Asset & Tactic */}
          {builderStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-navy-50/60 p-4 rounded-2xl border border-navy-100 flex items-start gap-3 text-xs text-navy-900">
                <Hash className="w-5 h-5 text-navy-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-navy-950">Step 1: Asset &amp; Tactic</h4>
                  <p className="mt-0.5 text-navy-800">
                    Every campaign flow starts here: the promotional asset being run, and the tactic
                    it&rsquo;s running under. Everything else in this builder &mdash; context, topic,
                    channel &mdash; is scoped to this asset + tactic pair.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                    <span>Asset ID</span>
                    <span className="text-navy-600 mr-1">*</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.assetId} />
                  </label>
                  <input
                    type="text"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    placeholder="e.g. VV-ASET-48213"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-mono font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    The ID of the promotional asset (e.g. a Veeva Vault creative ID) this campaign is built around.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                    <span>Tactic ID</span>
                    <span className="text-navy-600 mr-1">*</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.tacticId} />
                  </label>
                  <input
                    type="text"
                    value={tacticId}
                    onChange={(e) => setTacticId(e.target.value)}
                    placeholder="e.g. TACT-2026-0091"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-mono font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    The tactic this asset is being promoted under (media plan line item / CRM tactic code).
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBuilderStep(2)}
                  disabled={!assetTacticReady}
                  title={assetTacticReady ? undefined : 'Enter both an Asset ID and a Tactic ID to continue'}
                  className="bg-navy-600 hover:bg-navy-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <span>Next: Campaign Context</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Campaign Context */}
          {builderStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-navy-50/60 p-4 rounded-2xl border border-navy-100 flex items-start gap-3 text-xs text-navy-900">
                <Info className="w-5 h-5 text-navy-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-navy-950">Step 2: Campaign Context & Scope</h4>
                  <p className="mt-0.5 text-navy-800">
                    Define the campaign title, market scope, and execution quarter. This establishes the base taxonomy string prefix.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                    <span>Campaign Name / Initiative Title</span>
                    <span className="text-navy-600 mr-1">*</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.utmCampaign} />
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Yescarta 2L LBCL — ORR HCP Meta"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                    <span>Market Scope</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.region} />
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-medium"
                  >
                    <option value="US Commercial">US Commercial</option>
                    <option value="EU Commercial">EU Commercial</option>
                    <option value="Global">Global</option>
                    <option value="JPAC">Asia Pacific (JPAC)</option>
                    <option value="LATAM">LATAM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                    <span>Target Quarter</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.quarter} />
                  </label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-medium"
                  >
                    <option value="2026-Q3">2026-Q3</option>
                    <option value="2026-Q4">2026-Q4</option>
                    <option value="2027-Q1">2027-Q1</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBuilderStep(1)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Asset &amp; Tactic</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderStep(3)}
                  className="bg-navy-600 hover:bg-navy-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <span>Next: Topic & Subtopic Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Topic & Subtopic Selection */}
          {builderStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-navy-400 font-bold text-xs">
                  <Layers className="w-4 h-4 text-navy-500" />
                  <span>Topic & Subtopic Classification Rules</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Topic & Subtopic Classification:</strong> In enterprise commercial architecture, Key Message Categories and Subcategories are mapped to <strong>Topics</strong> and <strong>Subtopics</strong>. This classification is mandatory because it governs automated content tagging in Veeva Vault Promomats, Salesforce Marketing Cloud journey triggers, and omnichannel performance measurement.
                </p>
              </div>

              <KeyMessageSelector
                selectedCategoryId={selectedCatId}
                selectedSubcategoryId={selectedSubId}
                onCategoryChange={setSelectedCatId}
                onSubcategoryChange={setSelectedSubId}
                selectedTaId={selectedTaId}
                selectedBrandId={selectedBrandId}
                onTaChange={setSelectedTaId}
                onBrandChange={setSelectedBrandId}
              />

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBuilderStep(2)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Context</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderStep(4)}
                  className="bg-navy-600 hover:bg-navy-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <span>Next: Channel & Formula</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Channel & Approved Taxonomy Formula */}
          {builderStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-navy-50/60 p-4 rounded-2xl border border-navy-100 flex items-start gap-3 text-xs text-navy-900">
                <Info className="w-5 h-5 text-navy-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-navy-950">Step 4: Channel &amp; Approved Taxonomy Formula</h4>
                  <p className="mt-0.5 text-navy-800">
                    Pick the promotional channel and sub-channel. The approved Kite Campaign Name
                    formula for that channel is applied below &mdash; you fill the highlighted fields,
                    everything else is filled automatically.
                  </p>
                </div>
              </div>

              {/* Channel */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Promotional channel</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CHANNEL_TYPES.map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => chooseChannel(ch)}
                      className={`p-3 rounded-xl border text-sm font-bold transition ${
                        channelType === ch
                          ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-channel (Digital only) */}
              {SUB_CHANNELS[channelType].length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Sub-channel
                    <span className="text-slate-400 font-normal"> — sets the <span className="font-mono">platform</span> token &amp; its own fields</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUB_CHANNELS[channelType].map(sc => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => chooseSubChannel(sc)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                          subChannel === sc
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Core formula fields the planner fills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CAMPAIGN_FORMULA[channelType]
                  .filter(t => t.source === 'input')
                  .map(t => {
                    const map: Record<string, { value: string; set: (v: string) => void; options: string[] }> = {
                      country: { value: country, set: setCountry, options: COUNTRIES },
                      messagingType: { value: messagingType, set: setMessagingType, options: MESSAGING_TYPES },
                      target: { value: target, set: setTarget, options: TARGETS },
                      indication: { value: indication, set: setIndication, options: INDICATIONS },
                      platform: { value: platform, set: setPlatform, options: t.options || platformOptions },
                    };
                    const ctl = map[t.key];
                    if (!ctl) return null;
                    return (
                      <div key={t.key}>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.label} <span className="text-navy-500">*</span>
                          {t.key === 'indication' && <span className="text-slate-400 font-normal"> (Cancer — specific type)</span>}
                        </label>
                        <select
                          value={ctl.value}
                          onChange={e => ctl.set(e.target.value)}
                          className="w-full bg-white border border-navy-200 ring-1 ring-navy-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-navy-500 font-medium"
                        >
                          {ctl.options.map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
              </div>

              {/* Sub-channel-specific fields */}
              {extraFields.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    {subChannel} — sub-channel details
                    <span className="text-slate-400 font-normal"> (captured for the placement level)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {extraFields.map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{f.label}</label>
                        {f.options ? (
                          <select
                            value={subChannelMeta[f.key] || ''}
                            onChange={e => setSubChannelMeta(m => ({ ...m, [f.key]: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-navy-500 font-medium"
                          >
                            <option value="">— select —</option>
                            {f.options.map(o => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={subChannelMeta[f.key] || ''}
                            onChange={e => setSubChannelMeta(m => ({ ...m, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-navy-500 font-medium"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-filled tokens */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Auto-filled from your earlier choices</label>
                <div className="flex flex-wrap gap-2">
                  {CAMPAIGN_FORMULA[channelType]
                    .filter(t => t.source !== 'input')
                    .map(t => (
                      <span key={t.key} className="text-[11px] bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                        <span className="text-slate-400">{t.label}:</span>{' '}
                        <span className="font-mono font-bold text-slate-900">{formulaInputs[t.key] || '—'}</span>
                      </span>
                    ))}
                </div>
              </div>

              {/* Live formula breakdown */}
              <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-2 text-navy-400 font-bold text-xs">
                  <Code className="w-4 h-4" />
                  <span>Approved {channelType} Campaign Name formula</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 break-words">{formulaTemplate(channelType)}</div>
                <div className="text-[10px] text-slate-500">
                  (c) controlled &nbsp;·&nbsp; (v) variable &nbsp;·&nbsp; (m) machine &nbsp;·&nbsp; (f) free text
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-1">
                  {built.tokens.map((tok, i) => (
                    <div key={tok.key} className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500 w-5 text-right">{i + 1}.</span>
                      <span className="text-slate-400 w-40 shrink-0">{tok.label} <span className="text-slate-600">({KIND_LABEL[tok.kind]})</span></span>
                      <span className="font-mono font-bold text-emerald-300 truncate">{tok.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Campaign Name taxonomy string</span>
                  <div className="font-mono text-xs text-navy-300 font-bold break-all">{built.string}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agency notes / comments</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 2L LBCL awareness push"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBuilderStep(3)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Topic</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderStep(5)}
                  className="bg-navy-600 hover:bg-navy-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <span>Next: Review & Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Review, Preview Code & Submit */}
          {builderStep === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-navy-400" />
                    Generated Campaign Taxonomy Summary
                  </h4>
                  <span className="text-[10px] bg-navy-600 text-white font-bold px-2 py-0.5 rounded uppercase">
                    Validation Passed
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Asset ID:</span>
                    <span className="font-mono font-bold text-white truncate block">{assetId || '—'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Tactic ID:</span>
                    <span className="font-mono font-bold text-white truncate block">{tacticId || '—'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Campaign:</span>
                    <span className="font-bold text-white truncate block">{campaignName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Brand / TA:</span>
                    <span className="font-bold text-navy-300 block">
                      {selectedBrand?.name || 'Yescarta®'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Channel / Sub-channel:</span>
                    <span className="font-bold text-slate-200 block">{channelType} · {subChannel}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Topic / Subtopic:</span>
                    <span className="font-mono text-navy-400 font-bold block">{selectedSubId}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Campaign Name taxonomy string (approved {channelType} formula):
                  </span>
                  <div className="font-mono text-xs text-navy-300 font-bold break-all">
                    {built.string}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBuilderStep(4)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Channel</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateCampaign}
                  disabled={isSubmitting}
                  className="bg-navy-600 hover:bg-navy-700 text-white font-bold text-xs px-8 py-3 rounded-xl transition flex items-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Campaign Taxonomy to Marketer</span>
                </button>
              </div>
            </div>
          )}

        </div>
    </div>
  );
};

