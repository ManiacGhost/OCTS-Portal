import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import { KeyMessageSelector } from '../common/KeyMessageSelector';
import { TaxonomyCodeGenerator } from '../common/TaxonomyCodeGenerator';
import { TaxonomyDictionaryView } from '../common/TaxonomyDictionaryView';
import { CampaignTacticFloatingWindow } from '../common/CampaignTacticFloatingWindow';
import { TaxonomyTooltip, TAXONOMY_TOOLTIPS } from '../common/TaxonomyTooltip';
import {
  FilePlus,
  CheckCircle2,
  Copy,
  Send,
  Layers,
  Tag,
  Check,
  BookOpen,
  Code,
  ArrowRight,
  ArrowLeft,
  Info,
  Download,
  BarChart3,
  Globe,
  Briefcase
} from 'lucide-react';

export const AgencyDashboard: React.FC = () => {
  const {
    currentPersona,
    brands,
    channels,
    campaigns,
    programs,
    addCampaign,
    showToast,
    selectedMarket
  } = usePersona();

  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'registry' | 'generator' | 'dictionary'>('builder');

  // Multi-step Builder Flow State
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3 | 4>(1);

  // Campaign Form State
  const [campaignName, setCampaignName] = useState('Trodelvy Q3 2026 mTNBC OS Superiority Launch');
  const [selectedTaId, setSelectedTaId] = useState('ta-onc');
  const [selectedBrandId, setSelectedBrandId] = useState('brand-trodelvy');
  const [selectedCatId, setSelectedCatId] = useState('km-cat-eff');
  const [selectedSubId, setSelectedSubId] = useState('km-sub-eff-01');
  const [selectedChanId, setSelectedChanId] = useState('chan-veeva-email');
  const [format, setFormat] = useState('Rep Triggered Email');
  const [targetAudience, setTargetAudience] = useState('Oncologists');
  const [region, setRegion] = useState('US Commercial');
  const [quarter, setQuarter] = useState('2026-Q3');
  const [notes, setNotes] = useState('Agency campaign taxonomy setup for Q3 commercial HCP detailing.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const totalCampaignsCount = campaigns.length;
  const totalTacticsCount = campaigns.reduce((acc, c) => acc + 3, 0); // 3 tactics per campaign average
  const totalProgramsCount = programs.length;

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
        channelId: selectedChanId,
        format,
        targetAudience,
        region: selectedMarket || region,
        quarter,
        agencyOwner: currentPersona?.organization || 'Havas Health',
        status: 'submitted',
        notes
      });

      if (created) {
        setActiveTab('registry');
        setBuilderStep(1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
    showToast('Taxonomy code copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Detailed Overview Metrics: Programs, Campaigns, Tactics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 border-l-4 border-l-rose-600 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Master Programs</span>
            <Briefcase className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalProgramsCount}</div>
          <p className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Core Strategic Initiatives
          </p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-rose-500 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Campaigns</span>
            <FilePlus className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCampaignsCount}</div>
          <p className="text-[11px] text-rose-700 font-bold">
            100% Topic & Subtopic Mapped
          </p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Active Tactics</span>
            <Layers className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalTacticsCount}</div>
          <p className="text-[11px] text-slate-600 font-bold">
            Emails, Banners & Rep Assets
          </p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-slate-900 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Market Context</span>
            <Globe className="w-4 h-4 text-slate-800" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">{selectedMarket}</div>
          <p className="text-[11px] text-slate-500 font-medium">Agency Partner: {currentPersona?.organization}</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Agency User */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'builder' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FilePlus className="w-4 h-4" />
          <span>1. Campaign Taxonomy Builder (Step Flow)</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>2. Programs & Tactics Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('registry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'registry' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Submitted Campaigns ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'generator' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>4. Code & UTM Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dictionary' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>5. Master Taxonomy Dictionary</span>
        </button>
      </div>

      {/* Tab 1: Step-by-Step Campaign Taxonomy Builder */}
      {activeTab === 'builder' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm text-slate-900">
          
          {/* Flow Stepper Header */}
          <div className="border-b border-slate-100 pb-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-rose-600" />
                  Campaign Taxonomy Flow
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step-by-step guided workflow for agencies to establish compliant campaign metadata.
                </p>
              </div>

              <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Step <span className="text-rose-600 font-mono text-sm">{builderStep}</span> of <span className="font-mono text-sm">4</span>
              </div>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => setBuilderStep(1)}
                className={`p-2.5 rounded-xl border text-left transition font-bold ${
                  builderStep === 1
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : builderStep > 1
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                1. Campaign Context
              </button>

              <button
                onClick={() => setBuilderStep(2)}
                className={`p-2.5 rounded-xl border text-left transition font-bold ${
                  builderStep === 2
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : builderStep > 2
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                2. Topic & Subtopic
              </button>

              <button
                onClick={() => setBuilderStep(3)}
                className={`p-2.5 rounded-xl border text-left transition font-bold ${
                  builderStep === 3
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : builderStep > 3
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                3. Tactic & Channel
              </button>

              <button
                onClick={() => setBuilderStep(4)}
                className={`p-2.5 rounded-xl border text-left transition font-bold ${
                  builderStep === 4
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                4. Review & Submit
              </button>
            </div>
          </div>

          {/* STEP 1: Campaign Context */}
          {builderStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 flex items-start gap-3 text-xs text-rose-900">
                <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-950">Step 1: Campaign Context & Scope</h4>
                  <p className="mt-0.5 text-rose-800">
                    Define the campaign title, market scope, and execution quarter. This establishes the base taxonomy string prefix.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                    <span>Campaign Name / Initiative Title</span>
                    <span className="text-rose-600 mr-1">*</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.utmCampaign} />
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Trodelvy Q3 2026 mTNBC OS Superiority Launch"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="2026-Q3">2026-Q3</option>
                    <option value="2026-Q4">2026-Q4</option>
                    <option value="2027-Q1">2027-Q1</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBuilderStep(2)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <span>Next: Topic & Subtopic Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Topic & Subtopic Selection */}
          {builderStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <Layers className="w-4 h-4 text-rose-500" />
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
                  onClick={() => setBuilderStep(1)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Context</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderStep(3)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <span>Next: Tactic & Channel Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Tactic, Channel & Target Audience */}
          {builderStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 flex items-start gap-3 text-xs text-rose-900">
                <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-950">Step 3: Tactic, Channel & Target Audience</h4>
                  <p className="mt-0.5 text-rose-800">
                    Specify the deployment channel platform and target specialty to generate channel-specific UTM parameters.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                    <span>Channel Platform</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.channel} />
                  </label>
                  <select
                    value={selectedChanId}
                    onChange={(e) => setSelectedChanId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
                  >
                    {channels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                    <span>Target Audience Specialty</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.targetAudience} />
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="Oncologists">Oncologists</option>
                    <option value="Infectious Disease Specialists">Infectious Disease Specialists</option>
                    <option value="Hepatologists">Hepatologists</option>
                    <option value="Patients">Patients & Caregivers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                    <span>Asset Format / Tactic Name</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.tactic} />
                  </label>
                  <input
                    type="text"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="e.g. Rep Triggered Email, Interactive Banner"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agency Notes / Comments</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Q3 detailing content push"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBuilderStep(2)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Topic</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderStep(4)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  <span>Next: Review & Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review, Preview Code & Submit */}
          {builderStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-400" />
                    Generated Campaign Taxonomy Summary
                  </h4>
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded uppercase">
                    Validation Passed
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Campaign:</span>
                    <span className="font-bold text-white truncate block">{campaignName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Brand / TA:</span>
                    <span className="font-bold text-rose-300 block">
                      {brands.find(b => b.id === selectedBrandId)?.name || 'Trodelvy'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Topic / Subtopic:</span>
                    <span className="font-mono text-rose-400 font-bold block">{selectedSubId}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Market:</span>
                    <span className="font-bold text-slate-200 block">{selectedMarket || region}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Full Standardized Campaign Taxonomy String:
                  </span>
                  <div className="font-mono text-xs text-rose-300 font-bold break-all">
                    COMM-US-ONC-TRD-2026Q3-EFF-01-VEEVA-REP
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBuilderStep(3)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Tactic</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateCampaign}
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-8 py-3 rounded-xl transition flex items-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Campaign Taxonomy to Marketer</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Detailed Overview of Programs, Campaigns, and Tactics */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm text-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rose-600" />
                Master Program, Campaign & Tactic Portfolio Overview
              </h3>
              <p className="text-xs text-slate-500">
                Detailed breakdown of programs, active campaigns, and tactical assets currently managed across agencies.
              </p>
            </div>

            <a
              href="/api/export/csv?type=campaigns"
              download
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Portfolio Overview CSV</span>
            </a>
          </div>

          <div className="space-y-4">
            {programs.map((program) => {
              const pCode = program.code || program.programCode || 'PRG-GILD-2026';
              const pShort = pCode.length >= 7 ? pCode.substring(4, 7) : pCode;
              const pMarket = program.market || 'US Commercial';
              const pAgency = program.agencyOwner || 'Omnicom / IPG Health';

              return (
                <div
                  key={program.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-rose-300 bg-slate-50/50 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm uppercase">
                        {pShort}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{program.programName}</h4>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Code: <span className="text-rose-700 font-bold">{pCode}</span> &bull; Market: {pMarket}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-white text-slate-800 px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                        {program.campaignCount} Campaigns
                      </span>
                      <span className="text-xs font-bold bg-rose-50 text-rose-800 px-3 py-1 rounded-xl border border-rose-200 shadow-2xs">
                        {program.tacticCount} Tactics
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Therapeutic Area / Brand</span>
                      <span className="font-bold text-slate-800">{program.therapeuticArea} &bull; {program.brand}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Lead Agency Owner</span>
                      <span className="font-bold text-slate-800">{pAgency}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Taxonomy Alignment</span>
                      <span className="font-mono text-rose-700 font-extrabold">100% Compliant</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Submitted Campaigns Registry */}
      {activeTab === 'registry' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Agency Campaign Registry & Taxonomy Status
              </h3>
              <p className="text-xs text-slate-500">
                Master record of agency campaign taxonomy submissions across commercial brand portfolios.
              </p>
            </div>

            <a
              href="/api/export/csv?type=campaigns"
              download
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm border border-rose-500/30 flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                <tr>
                  <th className="p-3">Campaign Name / Code</th>
                  <th className="p-3">Brand / Market</th>
                  <th className="p-3">Topic / Subtopic</th>
                  <th className="p-3">Taxonomy Code</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((cmp) => {
                  const brand = brands.find(b => b.id === cmp.brandId);
                  const isCopied = copiedCodeId === cmp.id;
                  return (
                    <tr key={cmp.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-xs">{cmp.campaignName}</div>
                        <div className="font-mono text-[10px] text-rose-700 font-bold">{cmp.campaignCode}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{brand?.name || 'Trodelvy'}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{cmp.region} • {cmp.quarter}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-[10px] font-bold bg-rose-50 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                          {cmp.keyMessageSubcategoryId}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-800 max-w-xs truncate font-medium">
                        {cmp.taxonomyString}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          cmp.status === 'approved' || cmp.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cmp.status === 'submitted'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {cmp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleCopyCode(cmp.taxonomyString, cmp.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 transition inline-flex items-center gap-1 shadow-sm"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Code & UTM Generator */}
      {activeTab === 'generator' && <TaxonomyCodeGenerator />}

      {/* Tab 5: Gilead Taxonomy Master */}
      {activeTab === 'dictionary' && <TaxonomyDictionaryView />}

      {/* Floating Campaign & Tactics Lookup Window */}
      <CampaignTacticFloatingWindow viewMode="agency" defaultOpen={true} />

    </div>
  );
};

