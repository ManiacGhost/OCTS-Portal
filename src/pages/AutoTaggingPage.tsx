import React, { useMemo, useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, MessageSquarePlus, ChevronDown, ChevronRight, Inbox } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import { slidesForCampaign, SlideTag } from '../data/autoTagModel';
import { CampaignTaxonomy } from '../types';

interface Feedback {
  vote?: 'up' | 'down';
  comment?: string;
}

/** Auto-tagging runs on IVA decks only. */
function isAutoTaggable(c: CampaignTaxonomy): boolean {
  return c.channelType === 'IVA';
}

const STATUS_STYLE: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  rejected: 'bg-slate-700 text-white border-slate-700',
};

const AiCell: React.FC<{ value: string; code?: string; conf: number }> = ({ value, code, conf }) => (
  <div>
    <span className="font-bold text-slate-900">{value}</span>
    <div className="flex items-center gap-1.5 mt-1">
      {code && (
        <span className="font-mono text-[10px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1 py-0.5">
          {code}
        </span>
      )}
      <span className="text-[10px] font-mono text-slate-400">{Math.round(conf * 100)}%</span>
    </div>
  </div>
);

export const AutoTaggingPage: React.FC = () => {
  const { campaigns, brands, keyMessages, showToast } = usePersona();

  const [feedback, setFeedback] = useState<Record<string, Feedback>>({}); // keyed by slideId
  const [expanded, setExpanded] = useState<Record<string, boolean>>({}); // keyed by campaign.id
  const [commentOpen, setCommentOpen] = useState<string | null>(null); // slideId

  const brandOf = (id: string) => brands.find(b => b.id === id);
  const topicOf = (id: string) => keyMessages.find(k => k.id === id)?.name || '—';

  const rows = useMemo(() => {
    return campaigns
      .filter(isAutoTaggable)
      .map(c => ({
        campaign: c,
        slides: slidesForCampaign(c, keyMessages, brands, {
          brandName: (brandOf(c.brandId)?.name || '').split(' ')[0],
          channelName: 'IVA',
          subChannel: 'IVA',
        }),
      }))
      .sort((a, b) => a.campaign.campaignName.localeCompare(b.campaign.campaignName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns, keyMessages, brands]);

  const allSlides = rows.flatMap(r => r.slides);
  const avgConfidence = allSlides.length
    ? Math.round((allSlides.reduce((s, sl) => s + sl.confidence, 0) / allSlides.length) * 100)
    : 0;
  const feedbackCount = allSlides.filter(sl => feedback[sl.slideId]?.vote || feedback[sl.slideId]?.comment).length;

  const recordFeedback = (id: string, patch: Feedback) => {
    setFeedback(prev => {
      const had = prev[id]?.vote || prev[id]?.comment;
      const next = { ...prev, [id]: { ...prev[id], ...patch } };
      if (!had) showToast('Thanks — feedback recorded for the model.', 'success');
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-navy-600" />
          Auto Tagging
        </h1>
        <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
          Expand an IVA deck to see the AI model&rsquo;s <b>slide-level tags</b> &mdash; brand, indication,
          Topic and Subtopic per slide, each with its own confidence. Other channels are tagged manually in
          the Campaign Builder. Leave feedback per slide to help improve the model.
        </p>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
        <span><b className="text-slate-800 font-extrabold">{rows.length}</b> decks</span>
        <span className="text-slate-300">·</span>
        <span><b className="text-slate-800 font-extrabold">{allSlides.length}</b> slides analysed</span>
        <span className="text-slate-300">·</span>
        <span><b className="text-slate-800 font-extrabold">{avgConfidence}%</b> avg confidence</span>
        <span className="text-slate-300">·</span>
        <span><b className="text-slate-800 font-extrabold">{feedbackCount}</b> of {allSlides.length} slides with feedback</span>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-400">
          <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          No IVA decks in this view.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                <tr>
                  <th className="p-3 w-6" />
                  <th className="p-3">Deck</th>
                  <th className="p-3">Key message</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Quarter</th>
                  <th className="p-3 w-40">Slides reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(({ campaign: c, slides }) => {
                  const isOpen = !!expanded[c.id];
                  const reviewed = slides.filter(sl => feedback[sl.slideId]?.vote || feedback[sl.slideId]?.comment).length;
                  return (
                    <React.Fragment key={c.id}>
                      {/* Collapsed row — campaign details + review progress */}
                      <tr
                        className="hover:bg-slate-50/70 align-top cursor-pointer"
                        onClick={() => setExpanded(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                      >
                        <td className="p-3">
                          <span className="text-slate-400">
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{c.campaignName}</div>
                          <div className="font-mono text-[10px] text-slate-400">{c.campaignCode}</div>
                        </td>
                        <td className="p-3 text-slate-700">{topicOf(c.keyMessageCategoryId)}</td>
                        <td className="p-3">
                          {c.status && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wide border rounded-full px-2 py-0.5 ${
                                STATUS_STYLE[c.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {c.status}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{c.quarter}</td>
                        <td className="p-3">
                          <span className={`font-bold ${reviewed === slides.length ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {reviewed}
                          </span>
                          <span className="text-slate-400 font-medium"> / {slides.length} slides</span>
                        </td>
                      </tr>

                      {/* Expanded — slide-level AI tags */}
                      {isOpen && (
                        <tr className="bg-slate-50/60">
                          <td />
                          <td colSpan={5} className="p-3">
                            <div className="rounded-xl border border-navy-200 bg-white overflow-x-auto shadow-inner">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-navy-600 text-white/90 uppercase text-[10px] font-bold tracking-widest">
                                  <tr>
                                    <th className="p-2.5 w-10">Slide</th>
                                    <th className="p-2.5 w-[22%]">Title</th>
                                    <th className="p-2.5">AI Brand</th>
                                    <th className="p-2.5">AI Indication</th>
                                    <th className="p-2.5">AI Topic</th>
                                    <th className="p-2.5">AI Subtopic</th>
                                    <th className="p-2.5 w-24">Confidence</th>
                                    <th className="p-2.5">Feedback</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {slides.map((s: SlideTag) => {
                                    const fb = feedback[s.slideId] || {};
                                    const conf = Math.round(s.confidence * 100);
                                    return (
                                      <tr key={s.slideId} className="hover:bg-slate-50/70 align-top">
                                        <td className="p-2.5">
                                          <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                                            {String(s.slideNo).padStart(2, '0')}
                                          </span>
                                        </td>
                                        <td className="p-2.5 font-bold text-slate-900">{s.title}</td>
                                        <td className="p-2.5">
                                          <AiCell value={s.brandName.split(' ')[0]} code={s.brandCode} conf={s.brandConfidence} />
                                        </td>
                                        <td className="p-2.5">
                                          <AiCell value={s.indication} conf={s.indicationConfidence} />
                                        </td>
                                        <td className="p-2.5">
                                          <span className="font-bold text-slate-900">{s.topicName}</span>
                                          <span className="font-mono text-[10px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1.5 py-0.5 inline-block mt-1">
                                            {s.topicCode}
                                          </span>
                                        </td>
                                        <td className="p-2.5">
                                          <div className="font-medium text-slate-800">{s.subtopicName}</div>
                                          <span className="font-mono text-[10px] text-slate-500">{s.subtopicCode}</span>
                                        </td>
                                        <td className="p-2.5">
                                          <div className="font-mono font-extrabold text-slate-900">{conf}%</div>
                                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                                            <div className="h-full rounded-full bg-navy-500" style={{ width: `${conf}%` }} title={`AI confidence ${conf}%`} />
                                          </div>
                                        </td>
                                        <td className="p-2.5">
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => recordFeedback(s.slideId, { vote: fb.vote === 'up' ? undefined : 'up' })}
                                              className={`p-1.5 rounded-lg border transition ${
                                                fb.vote === 'up'
                                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                                  : 'border-slate-200 text-slate-400 hover:text-slate-700'
                                              }`}
                                              title="Good tag"
                                            >
                                              <ThumbsUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => recordFeedback(s.slideId, { vote: fb.vote === 'down' ? undefined : 'down' })}
                                              className={`p-1.5 rounded-lg border transition ${
                                                fb.vote === 'down'
                                                  ? 'bg-navy-50 border-navy-300 text-navy-700'
                                                  : 'border-slate-200 text-slate-400 hover:text-slate-700'
                                              }`}
                                              title="Wrong tag"
                                            >
                                              <ThumbsDown className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => setCommentOpen(commentOpen === s.slideId ? null : s.slideId)}
                                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 transition"
                                              title="Add a comment"
                                            >
                                              <MessageSquarePlus className="w-3.5 h-3.5" />
                                            </button>
                                            {(fb.vote || fb.comment) && (
                                              <span className="text-[10px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded-full px-2 py-0.5">
                                                Recorded
                                              </span>
                                            )}
                                          </div>
                                          {commentOpen === s.slideId && (
                                            <textarea
                                              autoFocus
                                              rows={2}
                                              defaultValue={fb.comment || ''}
                                              onBlur={e => {
                                                const v = e.target.value.trim();
                                                recordFeedback(s.slideId, { comment: v || undefined });
                                                setCommentOpen(null);
                                              }}
                                              placeholder="What should the model have done differently?"
                                              className="mt-2 w-56 bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-900 focus:outline-none focus:border-navy-500"
                                            />
                                          )}
                                          {fb.comment && commentOpen !== s.slideId && (
                                            <p className="text-[10px] text-slate-500 mt-1.5 max-w-56">
                                              <span className="font-bold">Note:</span> {fb.comment}
                                            </p>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
