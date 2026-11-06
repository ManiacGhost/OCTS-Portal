import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import { TaxonomyDictionaryView } from '../common/TaxonomyDictionaryView';
import { pendingParts, ApprovalPart } from '../../data/approvalStatus';
import { CampaignFlag } from '../common/StatusFlags';
import { CampaignTaxonomy } from '../../types';
import {
  CheckCircle2,
  BarChart2,
  ShieldCheck,
  Check,
  X,
  Layers,
  FileText,
  Megaphone,
  ChevronDown,
  ChevronRight,
  Inbox,
} from 'lucide-react';

type Tab = 'approvals' | 'matrix' | 'dictionary';

const Detail: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div className="min-w-0">
    <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">{label}</span>
    <span className={`font-bold text-slate-800 break-words ${mono ? 'font-mono text-[11px]' : ''}`}>
      {children || <span className="text-slate-300">—</span>}
    </span>
  </div>
);

export const MarketerDashboard: React.FC = () => {
  const { campaigns, brands, reviewCampaign, showToast } = usePersona();

  // one note per item AND part, so a campaign's note never bleeds into its tactic's
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [needsComment, setNeedsComment] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Tab>('approvals');
  // which queue the listing shows, driven by the two tiles
  const [queue, setQueue] = useState<ApprovalPart>('campaign');
  // rows opened for review
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const newest = (a: CampaignTaxonomy, b: CampaignTaxonomy) => (b.updatedAt || '').localeCompare(a.updatedAt || '');
  const campaignQueue = campaigns.filter(c => c.status === 'submitted').sort(newest);
  // a tactic is only reviewed once its campaign is approved, so it sits inside that campaign
  const tacticQueue = campaigns.filter(c => pendingParts(c).includes('tactic')).sort(newest);
  const items = queue === 'campaign' ? campaignQueue : tacticQueue;

  const keyOf = (id: string, part: ApprovalPart) => `${id}:${part}`;
  const brandName = (id: string) => brands.find(b => b.id === id)?.name?.split(/[ (]/)[0] || '—';

  const handleApprove = async (id: string, part: ApprovalPart) => {
    const notes = reviewNotes[keyOf(id, part)] || 'Approved for enterprise commercial deployment.';
    if (await reviewCampaign(id, [part], 'approved', notes)) {
      showToast(part === 'campaign' ? 'Campaign approved!' : 'Tactic approved!', 'success');
    }
  };

  const handleReject = async (id: string, part: ApprovalPart) => {
    // a rejection must say why — the agency has nothing to act on otherwise
    const k = keyOf(id, part);
    const notes = (reviewNotes[k] || '').trim();
    if (!notes) {
      setNeedsComment(prev => ({ ...prev, [k]: true }));
      setOpen(prev => ({ ...prev, [k]: true }));
      showToast('Please add a comment explaining the rejection.', 'error');
      setTimeout(() => document.getElementById(`review-note-${k}`)?.focus(), 50);
      return;
    }
    if (await reviewCampaign(id, [part], 'rejected', notes)) {
      showToast(`${part === 'campaign' ? 'Campaign' : 'Tactic'} returned to the agency for edits.`, 'info');
    }
  };

  const tabBtn = (tab: Tab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
        activeTab === tab ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const tile = (part: ApprovalPart, icon: React.ReactNode, title: string, n: number, hint: string) => {
    const active = queue === part;
    return (
      <button
        type="button"
        onClick={() => setQueue(part)}
        aria-pressed={active}
        className={`text-left bg-white border rounded-2xl p-5 shadow-sm transition ${
          active ? 'border-navy-500 ring-2 ring-navy-500/30' : 'border-slate-200 hover:border-navy-300'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          {icon}
          {title}
        </div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{n}</div>
        <div className="text-[11px] text-slate-400 font-medium mt-1">{hint}</div>
      </button>
    );
  };

  /** The expanded review panel for one row: details, note, decision. */
  const reviewPanel = (cmp: CampaignTaxonomy, part: ApprovalPart) => {
    const k = keyOf(cmp.id, part);
    const t = cmp.tactic;
    return (
      <div className="border-t border-slate-200 p-4 space-y-4 bg-white rounded-b-xl">
        {part === 'campaign' ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <Detail label="Agency owner">{cmp.agencyOwner}</Detail>
              <Detail label="Brand / Indication">{`${brandName(cmp.brandId)} · ${cmp.formulaInputs?.indication || ''}`}</Detail>
              <Detail label="Audience / Type">{`${cmp.formulaInputs?.audience || cmp.targetAudience} · ${cmp.formulaInputs?.campaignType || ''}`}</Detail>
              <Detail label="Region & Quarter">{`${cmp.region} • ${cmp.quarter}`}</Detail>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600">Campaign Name taxonomy string</label>
              <div className="font-mono text-xs font-bold text-white bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-all">
                {cmp.taxonomyString}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Its tactic can be reviewed once the campaign is approved.
            </p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <Detail label="Channel">{`${cmp.channelType || ''}${cmp.subChannel ? ' · ' + cmp.subChannel : ''}`}</Detail>
              <Detail label="Publisher / Platform">{t?.publisher}</Detail>
              <Detail label="Placement">{t?.placement}</Detail>
              <Detail label="Creative / Asset ID" mono>{cmp.assetId}</Detail>
              <Detail label="Target audience">{t?.targetAudience || cmp.targetAudience}</Detail>
              <div className="col-span-2">
                <Detail label="Landing page URL" mono>{t?.landingPageUrl}</Detail>
              </div>
              <Detail label="Start – end">{t ? `${t.startDate} → ${t.endDate}` : ''}</Detail>
            </div>
            <p className="text-[11px] text-slate-500">
              Campaign: <span className="font-semibold">{cmp.campaignName}</span> ({cmp.status === 'active' ? 'approved' : cmp.status})
            </p>
          </>
        )}

        <div>
          <input
            id={`review-note-${k}`}
            type="text"
            placeholder="Add reviewer notes for agency (required to reject)..."
            value={reviewNotes[k] || ''}
            onChange={e => {
              setReviewNotes({ ...reviewNotes, [k]: e.target.value });
              if (needsComment[k]) setNeedsComment(prev => ({ ...prev, [k]: false }));
            }}
            aria-invalid={!!needsComment[k]}
            className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium ${
              needsComment[k] ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200 focus:border-navy-500'
            }`}
          />
          {needsComment[k] && (
            <p className="text-[11px] font-bold text-red-600 mt-1">
              A comment is required to reject &mdash; tell the agency what to fix.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-900">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Approvals</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Campaigns and tactics are approved separately — pick a queue, open a row to review it.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        {tabBtn('approvals', <ShieldCheck className="w-4 h-4" />, `Approvals (${campaignQueue.length + tacticQueue.length})`)}
        {tabBtn('matrix', <BarChart2 className="w-4 h-4" />, 'Topic Strategy Matrix')}
        {tabBtn('dictionary', <Layers className="w-4 h-4" />, 'Taxonomy Master Browse')}
      </div>

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {/* One tile per queue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tile('campaign', <Megaphone className="w-4 h-4" />, 'Campaigns to approve', campaignQueue.length, 'Campaign Name taxonomy')}
            {tile('tactic', <FileText className="w-4 h-4" />, 'Tactics to approve', tacticQueue.length, 'Inside approved campaigns')}
          </div>

          {/* Listing for the selected queue */}
          {items.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-navy-600 mx-auto" />
              <div className="font-bold text-slate-900">
                All {queue === 'campaign' ? 'campaigns' : 'tactics'} reviewed!
              </div>
              <p className="text-xs">Nothing is waiting for your approval here.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 space-y-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 pb-1 flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5" />
                {queue === 'campaign' ? 'Campaigns' : 'Tactics'} awaiting approval · {items.length}
              </h3>
              {items.map(cmp => {
                const k = keyOf(cmp.id, queue);
                const isOpen = !!open[k];
                return (
                  <div key={k} className="bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-stretch gap-2 p-1.5">
                      <button
                        type="button"
                        onClick={() => setOpen(p => ({ ...p, [k]: !p[k] }))}
                        aria-expanded={isOpen}
                        className="flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5 text-left rounded-lg hover:bg-white transition"
                      >
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          {queue === 'campaign' ? (
                            <>
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {brandName(cmp.brandId)} <span className="text-slate-400 font-normal">·</span> {cmp.campaignName}
                              </div>
                              <div className="text-[10px] font-mono text-slate-500 truncate">{cmp.taxonomyString}</div>
                            </>
                          ) : (
                            <>
                              <div className="text-xs font-bold text-slate-900 truncate">
                                <span className="text-navy-700">{cmp.channelType}</span>
                                {cmp.subChannel && <span className="text-slate-500 font-semibold"> · {cmp.subChannel}</span>}
                                {cmp.tactic?.publisher && <span> — {cmp.tactic.publisher}</span>}
                                {cmp.tactic?.placement && <span className="text-slate-500 font-medium"> · {cmp.tactic.placement}</span>}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Campaign</span>
                                <span className="text-[11px] font-semibold text-slate-700 truncate">
                                  {brandName(cmp.brandId)} · {cmp.campaignName}
                                </span>
                                <CampaignFlag status={cmp.status} />
                              </div>
                            </>
                          )}
                        </div>
                      </button>
                      <div className="flex items-center gap-2 shrink-0 pr-1">
                        <button
                          onClick={() => handleReject(cmp.id, queue)}
                          className="bg-white hover:bg-navy-50 text-navy-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-navy-200 transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                        <button
                          onClick={() => handleApprove(cmp.id, queue)}
                          className="bg-navy-600 hover:bg-navy-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                      </div>
                    </div>
                    {isOpen && reviewPanel(cmp, queue)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Strategy Matrix */}
      {activeTab === 'matrix' && <TopicMatrix />}

      {/* Dictionary Browse */}
      {activeTab === 'dictionary' && <TaxonomyDictionaryView />}

    </div>
  );
};

const TopicMatrix: React.FC = () => {
  const { keyMessages } = usePersona();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-navy-600" />
            Brand Topic Coverage Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Monitors message distribution across campaigns to prevent topic fatigue or coverage gaps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {keyMessages.map(km => (
          <div key={km.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-navy-800 bg-navy-100 px-2 py-0.5 rounded border border-navy-200">
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
                <div className="bg-navy-600 h-full rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700 space-y-1">
              <strong className="text-slate-900">Active Subtopics:</strong>
              {km.subcategories.map((sub, i) => (
                <div key={i} className="flex items-center justify-between text-slate-600">
                  <span>• {sub.name}</span>
                  <span className="font-mono text-navy-700 font-bold">{sub.code}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
