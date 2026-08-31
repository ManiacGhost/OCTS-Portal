import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import { TaxonomyTooltip, TAXONOMY_TOOLTIPS } from './TaxonomyTooltip';
import { CampaignTaxonomy } from '../../types';
import {
  Layers,
  Search,
  Maximize2,
  Minimize2,
  X,
  Tag,
} from 'lucide-react';

interface CampaignTacticFloatingWindowProps {
  viewMode?: 'agency' | 'marketer' | 'analytics';
  defaultOpen?: boolean;
}

type StatusFilter = 'all' | CampaignTaxonomy['status'];

const STATUS_FILTERS: StatusFilter[] = ['all', 'draft', 'submitted', 'approved', 'rejected', 'active'];

const STATUS_BADGE: Record<CampaignTaxonomy['status'], string> = {
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  submitted: 'bg-amber-100 text-amber-800 border-amber-300',
  rejected: 'bg-rose-100 text-rose-800 border-rose-300',
  draft: 'bg-slate-200 text-slate-700 border-slate-300',
};

export const CampaignTacticFloatingWindow: React.FC<CampaignTacticFloatingWindowProps> = ({
  viewMode = 'agency',
  defaultOpen = false,
}) => {
  const { campaigns, keyMessages, brands, channels, therapeuticAreas } = usePersona();

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const brandNameFor = (brandId: string) => brands.find(b => b.id === brandId)?.name || brandId || '—';

  const q = searchQuery.trim().toLowerCase();
  const filteredCampaigns = campaigns.filter(cmp => {
    const statusMatch = statusFilter === 'all' || cmp.status === statusFilter;
    if (!statusMatch) return false;
    if (!q) return true;
    return (
      cmp.campaignName.toLowerCase().includes(q) ||
      cmp.campaignCode.toLowerCase().includes(q) ||
      brandNameFor(cmp.brandId).toLowerCase().includes(q) ||
      (cmp.agencyOwner || '').toLowerCase().includes(q) ||
      (cmp.taxonomyString || '').toLowerCase().includes(q) ||
      (cmp.region || '').toLowerCase().includes(q)
    );
  });

  // Fall back to the first match when the previously selected campaign is filtered out.
  const selectedCampaign =
    filteredCampaigns.find(c => c.id === selectedCampaignId) || filteredCampaigns[0];

  const kmCat = keyMessages.find(k => k.id === selectedCampaign?.keyMessageCategoryId);
  const subList = kmCat?.subtopics || kmCat?.subcategories || [];
  const kmSub = subList.find(s => s.id === selectedCampaign?.keyMessageSubcategoryId);
  const selectedBrandName = selectedCampaign ? brandNameFor(selectedCampaign.brandId) : '';
  const selectedTaCode = therapeuticAreas.find(t => t.id === selectedCampaign?.therapeuticAreaId)?.code || '—';
  const selectedChannelName =
    channels.find(c => c.id === selectedCampaign?.channelId)?.name || 'Omnichannel';

  // Representative tactics derived from the selected campaign's real metadata.
  const tacticStatus = ((): string => {
    switch (selectedCampaign?.status) {
      case 'approved':
      case 'active':
        return 'Live';
      case 'submitted':
        return 'In Review';
      case 'rejected':
        return 'Returned to Agency';
      default:
        return 'Draft';
    }
  })();
  const tacticStatusBadge =
    tacticStatus === 'Live'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : tacticStatus === 'In Review'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : tacticStatus === 'Returned to Agency'
      ? 'bg-rose-100 text-rose-800 border-rose-300'
      : 'bg-slate-200 text-slate-700 border-slate-300';

  const shortBrand = selectedBrandName.split(' ')[0] || 'Campaign';
  const baseUtmContent = selectedCampaign?.utmContent || `${(kmSub?.code || 'km').toLowerCase()}_hcp`;
  const campaignTactics = selectedCampaign
    ? [
        {
          id: 'tac-01',
          code: `${selectedCampaign.campaignCode}-T01`,
          name: `${shortBrand} HCP Interactive Detailer`,
          format: selectedCampaign.format || 'Veeva eDetailer',
          channel: selectedChannelName,
          targetAudience: selectedCampaign.targetAudience,
          utmContent: `${baseUtmContent}_detailer`,
        },
        {
          id: 'tac-02',
          code: `${selectedCampaign.campaignCode}-T02`,
          name: `${shortBrand} Email Journey — Touch 1`,
          format: 'Responsive HTML Email',
          channel: selectedChannelName,
          targetAudience: selectedCampaign.targetAudience,
          utmContent: `${baseUtmContent}_email_t1`,
        },
        {
          id: 'tac-03',
          code: `${selectedCampaign.campaignCode}-T03`,
          name: `${shortBrand} Display Banner 300x250`,
          format: 'HTML5 Animated Banner',
          channel: selectedChannelName,
          targetAudience: selectedCampaign.targetAudience,
          utmContent: `${baseUtmContent}_display`,
        },
      ]
    : [];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[110] bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl border border-rose-400 flex items-center gap-2.5 transition-all hover:scale-105"
      >
        <div className="p-1 bg-white/20 rounded-lg">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="text-xs font-extrabold leading-tight">Campaign &amp; Tactics Explorer</div>
          <div className="text-[10px] text-rose-100 font-medium">Filter campaigns &amp; review tactics</div>
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-[110] transition-all duration-300 shadow-2xl rounded-2xl border border-slate-200 bg-white text-slate-900 ${
        isMinimized
          ? 'bottom-6 right-6 w-80'
          : 'bottom-6 right-6 w-full max-w-xl md:max-w-2xl max-h-[85vh] flex flex-col'
      }`}
    >
      {/* Header Bar */}
      <div className="bg-slate-900 p-3.5 rounded-t-2xl border-b border-slate-800 flex items-center justify-between shrink-0 text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-600 text-white rounded-xl shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Campaign &amp; Tactics Lookup</span>
              {viewMode === 'marketer' && (
                <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-mono border border-rose-800">
                  Marketer View
                </span>
              )}
              {viewMode === 'analytics' && (
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-800">
                  Analytics View
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">
              Filter by status or search, then inspect tactical assets and UTM structures.
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

      {isMinimized ? (
        <div className="p-3 text-xs text-slate-700 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <span className="font-semibold text-slate-900 truncate">
            {selectedCampaign?.campaignCode || 'No campaign selected'}
          </span>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-rose-600 hover:underline text-[11px] font-bold shrink-0 ml-2"
          >
            Expand ({campaignTactics.length})
          </button>
        </div>
      ) : (
        <div className="p-4 pb-16 overflow-y-auto space-y-4 flex-1 text-xs bg-white rounded-b-2xl">
          {/* Controls: Status filter, Search, Campaign picker */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 shadow-sm capitalize"
                >
                  {STATUS_FILTERS.map(s => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'All statuses' : s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center">
                  <span>Search</span>
                  <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.brand} position="bottom-left" />
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Code, name, brand, agency, region…"
                    className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-rose-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center">
                <span>Campaign ({filteredCampaigns.length} match{filteredCampaigns.length === 1 ? '' : 'es'})</span>
                <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.utmCampaign} position="bottom-right" />
              </label>
              <select
                value={selectedCampaign?.id || ''}
                onChange={e => setSelectedCampaignId(e.target.value)}
                disabled={filteredCampaigns.length === 0}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 shadow-sm disabled:opacity-50"
              >
                {filteredCampaigns.length === 0 && <option value="">No campaigns match this filter</option>}
                {filteredCampaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.campaignCode} · {brandNameFor(c.brandId).split(' ')[0]} — {c.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCampaign ? (
            <>
              {/* Selected Campaign Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-800 text-sm bg-rose-100 px-2.5 py-0.5 rounded border border-rose-200">
                        {selectedCampaign.campaignCode}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border ${STATUS_BADGE[selectedCampaign.status]}`}
                      >
                        {selectedCampaign.status === 'approved' ? '✓ Approved' : selectedCampaign.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{selectedCampaign.campaignName}</h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Compliance Score</span>
                    <span className="font-mono text-emerald-600 font-extrabold text-base">
                      {selectedCampaign.complianceScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block flex items-center">
                      <span>Brand &amp; TA</span>
                      <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.brand} position="bottom-right" />
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedBrandName.split(' ')[0]} · {selectedTaCode}
                    </span>
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
                    <span className="font-mono font-bold text-rose-600">{kmCat?.code || '—'}</span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block flex items-center">
                      <span>Subtopic Code</span>
                      <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.subtopic} position="bottom-left" />
                    </span>
                    <span className="font-mono font-bold text-rose-700">{kmSub?.code || '—'}</span>
                  </div>
                </div>

                {/* UTM Tracking String Preview */}
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center">
                    <span>Standard Campaign Tracking String</span>
                    <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.utmSource} position="bottom-right" />
                  </span>
                  <code className="text-[10px] font-mono text-emerald-300 block truncate selection:bg-rose-600 selection:text-white">
                    tax_code={selectedCampaign.taxonomyString}&amp;utm_source={selectedCampaign.utmSource}&amp;utm_medium={selectedCampaign.utmMedium}&amp;utm_campaign={selectedCampaign.utmCampaign}&amp;utm_content={selectedCampaign.utmContent}
                  </code>
                </div>
              </div>

              {/* Tactics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tactics in this Campaign</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-mono border border-rose-200 font-bold">
                      {campaignTactics.length}
                    </span>
                  </h4>
                  <span className="text-[10px] text-slate-500">Status follows the campaign</span>
                </div>

                <div className="space-y-2">
                  {campaignTactics.map(tac => (
                    <div
                      key={tac.id}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-rose-700">{tac.code}</span>
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                              {tac.format}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-xs mt-1">{tac.name}</h5>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${tacticStatusBadge}`}
                        >
                          {tacticStatus}
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
            </>
          ) : (
            <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No campaigns match
              {statusFilter !== 'all' ? ` status “${statusFilter}”` : ''}
              {q ? ` and “${searchQuery.trim()}”` : ''}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
