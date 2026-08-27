import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import { TaxonomyTooltip, TAXONOMY_TOOLTIPS } from './TaxonomyTooltip';
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  FileText,
  Tag,
  Share2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building,
  Target
} from 'lucide-react';

interface CampaignTacticFloatingWindowProps {
  viewMode?: 'agency' | 'marketer' | 'analytics';
  defaultOpen?: boolean;
}

export const CampaignTacticFloatingWindow: React.FC<CampaignTacticFloatingWindowProps> = ({
  viewMode = 'agency',
  defaultOpen = false
}) => {
  const { campaigns, keyMessages, brands, channels, programs } = usePersona();

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Filter campaigns based on mode if needed (e.g. marketer shows approved first, agency shows all)
  const filteredCampaigns = campaigns.filter(cmp => {
    const q = (searchQuery || '').toLowerCase();
    const searchMatch = 
      (cmp.name || '').toLowerCase().includes(q) ||
      (cmp.code || '').toLowerCase().includes(q) ||
      (cmp.brandName || '').toLowerCase().includes(q) ||
      (cmp.agencyOwner || '').toLowerCase().includes(q);

    if (viewMode === 'marketer') {
      // Show approved campaigns or all for review
      return searchMatch;
    }
    return searchMatch;
  });

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  // Helper to resolve topic / subtopic
  const kmCat = keyMessages.find(k => k.id === selectedCampaign?.keyMessageCategoryId);
  const subList = kmCat?.subtopics || kmCat?.subcategories || [];
  const kmSub = subList.find(s => s.id === selectedCampaign?.keyMessageSubcategoryId);

  // Generate sample tactics for selected campaign if campaign has tactics or mock them
  const campaignTactics = [
    {
      id: 'tac-01',
      code: `${selectedCampaign?.code || 'CMP-COMM'}-TAC-01`,
      name: `${selectedCampaign?.brandName || 'Trodelvy'} HCP Interactive Detailer Deck`,
      format: 'Veeva eDetailer (12 Slides)',
      channel: 'Veeva CRM Field Force',
      targetAudience: 'Oncologists & Specialists',
      status: 'Approved & Deployed',
      utmContent: `${kmSub?.code || 'KM-EFF-01'}_hcp_detailer`,
      compliance: '100% Compliant'
    },
    {
      id: 'tac-02',
      code: `${selectedCampaign?.code || 'CMP-COMM'}-TAC-02`,
      name: `${selectedCampaign?.brandName || 'Trodelvy'} SFMC Email Journey Touch 1`,
      format: 'SFMC Responsive HTML Email',
      channel: 'Direct Email (SFMC)',
      targetAudience: 'Registered HCP Portal Users',
      status: 'Approved & Live',
      utmContent: `${kmSub?.code || 'KM-EFF-01'}_sfmc_email_t1`,
      compliance: '100% Compliant'
    },
    {
      id: 'tac-03',
      code: `${selectedCampaign?.code || 'CMP-COMM'}-TAC-03`,
      name: `${selectedCampaign?.brandName || 'Trodelvy'} Display Banner 300x250 & 728x90`,
      format: 'HTML5 Animated Banner',
      channel: 'Digital Display Ads',
      targetAudience: 'HCP Medical Journals',
      status: 'In Review',
      utmContent: `${kmSub?.code || 'KM-EFF-01'}_display_300x250`,
      compliance: '98% Compliant'
    },
    {
      id: 'tac-04',
      code: `${selectedCampaign?.code || 'CMP-COMM'}-TAC-04`,
      name: `${selectedCampaign?.brandName || 'Trodelvy'} Patient Copay Support Guide`,
      format: 'Interactive PDF & Mobile Web',
      channel: 'Patient Portal',
      targetAudience: 'Patients & Navigators',
      status: 'Approved & Live',
      utmContent: `${kmSub?.code || 'KM-EFF-01'}_copay_guide`,
      compliance: '100% Compliant'
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[110] bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl border border-rose-400 flex items-center gap-2.5 transition-all hover:scale-105 animate-bounce-short"
      >
        <div className="p-1 bg-white/20 rounded-lg">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="text-xs font-extrabold leading-tight">Campaign & Tactics Explorer</div>
          <div className="text-[10px] text-rose-100 font-medium">
            {viewMode === 'marketer' ? 'Approved Submissions Lookup' : 'Select Campaign Code & Review Tactics'}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed z-[110] transition-all duration-300 shadow-2xl rounded-2xl border border-slate-200 bg-white text-slate-900 ${
      isMinimized 
        ? 'bottom-6 right-6 w-80' 
        : 'bottom-6 right-6 w-full max-w-xl md:max-w-2xl max-h-[85vh] flex flex-col'
    }`}>
      {/* Header Bar */}
      <div className="bg-slate-900 p-3.5 rounded-t-2xl border-b border-slate-800 flex items-center justify-between shrink-0 text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-600 text-white rounded-xl shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Campaign & Tactics Lookup</span>
              {viewMode === 'marketer' && (
                <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-mono border border-rose-800">
                  Marketer Approval View
                </span>
              )}
              {viewMode === 'analytics' && (
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-800">
                  Analytics & Coverage
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">
              Select campaign code to inspect tactical assets, UTM structures, and taxonomy compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title={isMinimized ? 'Expand Floating Window' : 'Minimize Floating Window'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-900/60 rounded-lg transition"
            title="Close Window"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Minimized view body */}
      {isMinimized ? (
        <div className="p-3 text-xs text-slate-700 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <span className="font-semibold text-slate-900 truncate">{selectedCampaign?.code}</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-rose-600 hover:underline text-[11px] font-bold"
          >
            Expand Tactics ({campaignTactics.length})
          </button>
        </div>
      ) : (
        <div className="p-4 pb-16 overflow-y-auto space-y-4 flex-1 text-xs bg-white rounded-b-2xl">
          
          {/* Controls: Search & Select Campaign Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center">
                <span>Select Campaign Code</span>
                <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.utmCampaign} position="bottom-right" />
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 shadow-sm"
              >
                {filteredCampaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} ({c.brandName}) — {c.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center">
                <span>Search Campaign / Brand</span>
                <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.brand} position="bottom-left" />
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by code, brand, agency..."
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-rose-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Selected Campaign Summary Card */}
          {selectedCampaign ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-800 text-sm bg-rose-100 px-2.5 py-0.5 rounded border border-rose-200">
                      {selectedCampaign.code}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                      selectedCampaign.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : selectedCampaign.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-200 text-slate-700 border border-slate-300'
                    }`}>
                      {selectedCampaign.status === 'approved' ? '✓ Approved' : selectedCampaign.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{selectedCampaign.name}</h4>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Compliance Score</span>
                  <span className="font-mono text-emerald-600 font-extrabold text-base">
                    {selectedCampaign.complianceScore}%
                  </span>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block flex items-center">
                    <span>Brand & TA</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.brand} position="bottom-right" />
                  </span>
                  <span className="font-bold text-slate-800">{selectedCampaign.brandName}</span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block flex items-center">
                    <span>Agency Owner</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.agencyOwner} position="bottom-left" />
                  </span>
                  <span className="font-bold text-slate-800 truncate block">{selectedCampaign.agencyOwner}</span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block flex items-center">
                    <span>Topic</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.topic} position="bottom-left" />
                  </span>
                  <span className="font-mono font-bold text-rose-600">{kmCat?.code || 'EFF'}</span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block flex items-center">
                    <span>Subtopic Code</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.subtopic} position="bottom-left" />
                  </span>
                  <span className="font-mono font-bold text-rose-700">{kmSub?.code || 'KM-EFF-01'}</span>
                </div>
              </div>

              {/* UTM Tracking String Preview */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center">
                  <span>Standard Campaign Tracking String (Governance Rule)</span>
                  <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.utmSource} position="bottom-right" />
                </span>
                <code className="text-[10px] font-mono text-emerald-300 block truncate selection:bg-rose-600 selection:text-white">
                  tax_code={selectedCampaign?.code || 'COMM_TAX'}&utm_source=veeva_crm&utm_medium=crm_detailer&utm_campaign={(selectedCampaign?.brandName || 'brand').toLowerCase()}_q1_launch
                </code>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No matching campaign found.
            </div>
          )}

          {/* Tactics Present in Selected Campaign */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-600" />
                <span>Tactics Present in Campaign</span>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-mono border border-rose-200 font-bold">
                  {campaignTactics.length} Tactics
                </span>
                <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.tactic} position="bottom-right" />
              </h4>

              <span className="text-[10px] text-slate-500">Veeva Vault & SFMC Aligned</span>
            </div>

            <div className="space-y-2">
              {campaignTactics.map((tac) => (
                <div
                  key={tac.id}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-rose-700">
                          {tac.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                          {tac.format}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mt-1">{tac.name}</h5>
                    </div>

                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                      {tac.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] pt-1 border-t border-slate-200 text-slate-500">
                    <div>
                      <strong className="text-slate-700">Channel:</strong> {tac.channel}
                    </div>
                    <div>
                      <strong className="text-slate-700">Target:</strong> {tac.targetAudience}
                    </div>
                    <div className="font-mono text-emerald-700 font-bold">
                      <strong>UTM Content:</strong> {tac.utmContent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
