import React, { useMemo, useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, MessageSquarePlus, Inbox, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import { slidesForCampaign, SlideTag } from '../data/autoTagModel';
import { CampaignTaxonomy } from '../types';

interface Feedback {
  vote?: 'up' | 'down';
  comment?: string;
}

/** Auto-tagging only runs on content assets: IVA slides and website pages. */
function isAutoTaggable(c: CampaignTaxonomy): boolean {
  return c.channelType === 'IVA' || (c.channelType === 'Digital' && c.subChannel === 'Website Pages');
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'iva', label: 'IVA' },
  { key: 'website', label: 'Website Pages' },
] as const;
type FilterKey = (typeof FILTERS)[number]['key'];

function inFilter(c: CampaignTaxonomy, f: FilterKey): boolean {
  if (f === 'all') return true;
  if (f === 'iva') return c.channelType === 'IVA';
  return c.channelType === 'Digital'; // website
}

/** Slides shown per page inside an asset card. */
const PAGE_SIZE = 5;

const STATUS_STYLE: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  'pending-approval': 'bg-amber-50 text-amber-700 border-amber-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  rejected: 'bg-slate-700 text-white border-slate-700',
};

const AiCell: React.FC<{ label: string; value: string; code?: string; differs: boolean; conf: number }> = ({
  label,
  value,
  code,
  differs,
  conf,
}) => (
  <div>
    <div className="flex items-center gap-1.5">
      {differs && (
        <span
          className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
          title={`AI-inferred ${label} differs from the recorded value`}
        />
      )}
      <span className="font-bold text-slate-900">{value}</span>
    </div>
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
  const { campaigns, channels, brands, keyMessages, showToast } = usePersona();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [commentOpen, setCommentOpen] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [pageOf, setPageOf] = useState<Record<string, number>>({});

  const channelName = (id: string) => channels.find(c => c.id === id)?.name || 'Other';
  const brandName = (id: string) => brands.find(b => b.id === id)?.name || id;

  const assets = useMemo(() => {
    return campaigns
      .filter(isAutoTaggable)
      .map(c => ({
        campaign: c,
        slides: slidesForCampaign(c, keyMessages, brands, {
          brandName: brandName(c.brandId).split(' ')[0],
          channelName: channelName(c.channelId),
          subChannel: c.subChannel || c.format || '—',
        }),
      }))
      .sort((a, b) => (a.campaign.subChannel || '').localeCompare(b.campaign.subChannel || ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns, keyMessages, channels, brands]);

  const visible = assets.filter(a => inFilter(a.campaign, filter));

  const allSlides = visible.flatMap(a => a.slides);
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
          The AI model tags <b>every slide of an IVA deck</b> and <b>every website page</b> &mdash; inferring the
          brand, indication, Topic and Subtopic for each slide from its content and the surrounding channel journey.
          Other channels are tagged manually in the Campaign Builder. Leave feedback per slide to help improve the model.
        </p>
      </div>

      {/* Summary + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
          <span>
            <b className="text-slate-800 font-extrabold">{visible.length}</b> assets
          </span>
          <span className="text-slate-300">·</span>
          <span>
            <b className="text-slate-800 font-extrabold">{allSlides.length}</b> slides analysed
          </span>
          <span className="text-slate-300">·</span>
          <span>
            <b className="text-slate-800 font-extrabold">{avgConfidence}%</b> avg confidence
          </span>
          <span className="text-slate-300">·</span>
          <span>
            <b className="text-slate-800 font-extrabold">{feedbackCount}</b> of {allSlides.length} slides with feedback
          </span>
        </div>

        <div className="sm:ml-auto flex flex-wrap items-center gap-2">
          {FILTERS.map(f => {
            const count = assets.filter(a => inFilter(a.campaign, f.key)).length;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  active
                    ? 'bg-navy-600 text-white border-navy-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 ${active ? 'text-navy-100' : 'text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-400">
          <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          No content assets in this view.
        </div>
      ) : (
        <div className="space-y-5">
          {visible.map(({ campaign: c, slides }, i) => {
            // First asset opens by default; the rest start closed. An explicit toggle wins.
            const isCollapsed = collapsed[c.id] ?? i !== 0;
            const withFeedback = slides.filter(sl => feedback[sl.slideId]?.vote || feedback[sl.slideId]?.comment).length;
            const pageCount = Math.ceil(slides.length / PAGE_SIZE);
            const page = Math.min(pageOf[c.id] || 0, pageCount - 1);
            const pageSlides = pageCount > 1 ? slides.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) : slides;
            const goPage = (p: number) => setPageOf(prev => ({ ...prev, [c.id]: Math.max(0, Math.min(pageCount - 1, p)) }));
            return (
            <section
              key={c.id}
              className={`rounded-2xl overflow-hidden transition ${
                isCollapsed
                  ? 'bg-white border border-slate-200 shadow-sm'
                  : 'bg-white border-l-4 border border-l-navy-500 border-navy-200 shadow-lg ring-1 ring-navy-100'
              }`}
            >
              {/* Compact asset header — campaign id, asset id + a couple of fields */}
              <header
                className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 border-b ${
                  isCollapsed ? 'border-slate-200 bg-slate-50/70' : 'border-navy-200 bg-navy-50/70'
                }`}
              >
                <button
                  onClick={() => setCollapsed(prev => ({ ...prev, [c.id]: !(prev[c.id] ?? i !== 0) }))}
                  className={`shrink-0 w-6 h-6 grid place-items-center rounded-lg border transition ${
                    isCollapsed
                      ? 'border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                      : 'border-navy-300 bg-white text-navy-600'
                  }`}
                  title={isCollapsed ? 'Expand slides' : 'Collapse slides'}
                  aria-expanded={!isCollapsed}
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <Layers className={`w-4 h-4 shrink-0 ${isCollapsed ? 'text-slate-400' : 'text-navy-500'}`} />
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-900 text-sm truncate">{c.campaignName}</div>
                  <div className="font-mono text-[10px] text-slate-400">{c.id}</div>
                </div>
                <span className="font-mono text-[11px] text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                  {c.campaignCode}
                </span>
                <span className="text-[11px] text-slate-500">
                  {channelName(c.channelId)} · {c.subChannel || c.format}
                </span>
                {c.status && (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide border rounded-full px-2 py-0.5 ${
                      STATUS_STYLE[c.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {c.status.replace(/-/g, ' ')}
                  </span>
                )}
                <span
                  className={`sm:ml-auto text-[11px] font-bold rounded-full px-2 py-0.5 border ${
                    isCollapsed
                      ? 'text-slate-500 bg-white border-slate-200'
                      : 'text-navy-700 bg-white border-navy-300'
                  }`}
                >
                  {slides.length} slides
                  {withFeedback > 0 && <span className="font-medium opacity-70"> · {withFeedback} with feedback</span>}
                </span>
              </header>

              {!isCollapsed && (
              <div className="p-3 bg-navy-50/40">
              <div className="overflow-x-auto rounded-xl border border-navy-200 bg-white shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-[26%]">Slide</th>
                      <th className="p-3">AI Brand</th>
                      <th className="p-3">AI Indication</th>
                      <th className="p-3">AI Topic</th>
                      <th className="p-3">AI Subtopic</th>
                      <th className="p-3 w-24">Confidence</th>
                      <th className="p-3">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageSlides.map((s: SlideTag) => {
                      const fb = feedback[s.slideId] || {};
                      const conf = Math.round(s.confidence * 100);
                      return (
                        <tr key={s.slideId} className="hover:bg-slate-50/70 align-top">
                          <td className="p-3">
                            <div className="flex items-start gap-2">
                              <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                                {String(s.slideNo).padStart(2, '0')}
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900">{s.title}</div>
                                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{s.reason}</p>
                                {s.signals.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {s.signals.map(sig => (
                                      <span
                                        key={sig}
                                        className="text-[10px] font-mono bg-white border border-slate-200 text-slate-500 rounded px-1.5 py-0.5"
                                      >
                                        “{sig}”
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <AiCell
                              label="brand"
                              value={s.brandName.split(' ')[0]}
                              code={s.brandCode}
                              differs={s.brandDiffers}
                              conf={s.brandConfidence}
                            />
                          </td>
                          <td className="p-3">
                            <AiCell
                              label="indication"
                              value={s.indication}
                              differs={s.indicationDiffers}
                              conf={s.indicationConfidence}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {s.differsFromRecorded && (
                                <span
                                  className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                                  title="Differs from the recorded topic — review"
                                />
                              )}
                              <span className="font-bold text-slate-900">{s.topicName}</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1.5 py-0.5 inline-block mt-1">
                              {s.topicCode}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800">{s.subtopicName}</div>
                            <span className="font-mono text-[10px] text-slate-500">{s.subtopicCode}</span>
                          </td>
                          <td className="p-3">
                            <div className="font-mono font-extrabold text-slate-900">{conf}%</div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  conf >= 90 ? 'bg-emerald-500' : conf >= 84 ? 'bg-amber-500' : 'bg-navy-500'
                                }`}
                                style={{ width: `${conf}%` }}
                              />
                            </div>
                          </td>
                          <td className="p-3">
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

                {pageCount > 1 && (
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-navy-200 bg-navy-50/50 text-xs">
                    <span className="text-slate-500">
                      Slides <b className="text-slate-700">{page * PAGE_SIZE + 1}</b>–
                      <b className="text-slate-700">{Math.min(slides.length, (page + 1) * PAGE_SIZE)}</b> of{' '}
                      <b className="text-slate-700">{slides.length}</b>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => goPage(page - 1)}
                        disabled={page === 0}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>
                      {Array.from({ length: pageCount }, (_, p) => (
                        <button
                          key={p}
                          onClick={() => goPage(p)}
                          className={`w-7 h-7 rounded-lg border text-[11px] font-bold transition ${
                            p === page
                              ? 'bg-navy-600 text-white border-navy-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {p + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => goPage(page + 1)}
                        disabled={page === pageCount - 1}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </div>
              )}
            </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
