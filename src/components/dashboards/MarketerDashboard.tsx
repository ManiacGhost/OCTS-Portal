import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import { KeyMessageSelector } from '../common/KeyMessageSelector';
import { TaxonomyDictionaryView } from '../common/TaxonomyDictionaryView';
import { CampaignTacticFloatingWindow } from '../common/CampaignTacticFloatingWindow';
import { TaxonomyTooltip, TAXONOMY_TOOLTIPS } from '../common/TaxonomyTooltip';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  BarChart2,
  Tag,
  ShieldCheck,
  Check,
  X,
  Eye,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
  Briefcase
} from 'lucide-react';

export const MarketerDashboard: React.FC = () => {
  const {
    currentPersona,
    campaigns,
    brands,
    keyMessages,
    changeCampaignStatus,
    showToast,
    programs
  } = usePersona();

  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'approvals' | 'matrix' | 'dictionary'>('approvals');

  const pendingCampaigns = campaigns.filter(c => c.status === 'submitted');
  const approvedCampaigns = campaigns.filter(c => c.status === 'approved' || c.status === 'active');

  const handleApprove = async (id: string) => {
    const notes = reviewNotes[id] || 'Approved for enterprise commercial deployment.';
    const ok = await changeCampaignStatus(id, 'approved', notes);
    if (ok) {
      showToast('Campaign taxonomy approved!', 'success');
    }
  };

  const handleReject = async (id: string) => {
    const notes = reviewNotes[id] || 'Rejected. Please review Topic & Subtopic code alignment.';
    const ok = await changeCampaignStatus(id, 'rejected', notes);
    if (ok) {
      showToast('Campaign taxonomy returned to agency for edits.', 'info');
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Marketer KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 border-l-4 border-l-amber-500 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{pendingCampaigns.length}</div>
          <p className="text-[11px] text-amber-700 font-bold">Action Required</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-rose-600 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Approved Campaigns</span>
            <CheckCircle2 className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{approvedCampaigns.length}</div>
          <p className="text-[11px] text-rose-700 font-bold">Ready for SFMC & Veeva</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-rose-500 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Master Programs</span>
            <Briefcase className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{programs?.length || 5} Active</div>
          <p className="text-[11px] text-rose-700 font-bold">Oncology & Virology Scope</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Topic SOV Share</span>
            <BarChart2 className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">40.8%</div>
          <p className="text-[11px] text-slate-500 font-medium">Top Topic: Efficacy & OS</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'approvals' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Agency Submissions Queue ({pendingCampaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'matrix' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Topic Strategy Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dictionary' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Taxonomy Master Browse</span>
        </button>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === 'approvals' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                Marketer Campaign Taxonomy Approval Queue
              </h3>
              <p className="text-xs text-slate-500">
                Review taxonomy codes submitted by agencies to ensure Topic & Subtopic accuracy.
              </p>
            </div>
          </div>

          {pendingCampaigns.length === 0 ? (
            <div className="p-8 text-center text-slate-600 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-rose-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900">All Agency Submissions Reviewed!</div>
              <p className="text-xs text-slate-500">There are currently no pending campaign taxonomy approvals in your queue.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCampaigns.map((cmp) => {
                const brand = brands.find(b => b.id === cmp.brandId);
                const kmCat = keyMessages.find(k => k.id === cmp.keyMessageCategoryId);
                const kmSub = kmCat?.subcategories.find(s => s.id === cmp.keyMessageSubcategoryId);

                return (
                  <div
                    key={cmp.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            PENDING MARKETER REVIEW
                          </span>
                          <span className="text-xs text-slate-500 font-mono font-bold">{cmp.campaignCode}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{cmp.campaignName}</h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleReject(cmp.id)}
                          className="bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-rose-200 transition flex items-center gap-1.5 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject & Return</span>
                        </button>

                        <button
                          onClick={() => handleApprove(cmp.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Taxonomy</span>
                        </button>
                      </div>
                    </div>

                    {/* Campaign Metadata Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Agency Owner:</span>
                        <span className="font-bold text-slate-800">{cmp.agencyOwner}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Brand / Indication:</span>
                        <span className="font-bold text-slate-800">{brand?.name || 'Trodelvy'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Region & Quarter:</span>
                        <span className="font-bold text-slate-800">{cmp.region} • {cmp.quarter}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Compliance Score:</span>
                        <span className="font-mono text-rose-700 font-extrabold">{cmp.complianceScore}%</span>
                      </div>
                    </div>

                    {/* Topic & Subtopic Mapping */}
                    <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-rose-900 font-bold flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-rose-700" />
                          Topic & Subtopic Alignment:
                        </span>
                        <span className="font-mono text-rose-800 font-bold bg-white px-2 py-0.5 rounded border border-rose-200">
                          {kmCat?.code} / {kmSub?.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-900 font-bold">
                        {kmSub?.name || 'Overall Survival (OS) Superiority'}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {kmSub?.description}
                      </p>
                    </div>

                    {/* Standardized String Preview */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Standardized Taxonomy Code String:
                      </label>
                      <div className="font-mono text-xs font-bold text-white bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-all">
                        {cmp.taxonomyString}
                      </div>
                    </div>

                    {/* Reviewer Note Input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Add reviewer notes for agency..."
                        value={reviewNotes[cmp.id] || ''}
                        onChange={(e) => setReviewNotes({ ...reviewNotes, [cmp.id]: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Strategy Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-rose-600" />
                Brand Topic Coverage Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Monitors message distribution across campaigns to prevent topic fatigue or coverage gaps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyMessages.map((km) => (
              <div key={km.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                    {km.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{km.subcategories.length} Subtopics</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{km.name}</h4>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>Campaign Share:</span>
                    <span className="font-bold text-slate-900">35% of total campaigns</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <strong className="text-slate-900">Active Subtopics:</strong>
                  {km.subcategories.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-600">
                      <span>• {sub.name}</span>
                      <span className="font-mono text-rose-700 font-bold">{sub.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dictionary Browse */}
      {activeTab === 'dictionary' && <TaxonomyDictionaryView />}

      {/* Floating Campaign & Approved Taxonomy Submissions Window */}
      <CampaignTacticFloatingWindow viewMode="marketer" defaultOpen={true} />

    </div>
  );
};

