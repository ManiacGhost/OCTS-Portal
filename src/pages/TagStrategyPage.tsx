import React, { useEffect, useState } from 'react';
import { Route, Tag, Target, CheckCircle2, CircleDot, Circle, Layers } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import { useBrandStrategy } from '../data/brandStrategyStore';
import {
  KITE_CHANNELS,
  kiteSubChannels,
  kiteDimensionsFor,
  kiteSourcesFor,
  isPublisherScope,
  INCLUDE_PORTAL_FIELDS,
} from '../data/kiteTaxonomy';
import { kbqsForScope, KbqStatus, KbqScope, KBQ_ENABLED } from '../data/kbqKpiMap';
import { TagStrategyOverview } from './TagStrategyOverview';
import { byLabel, groupDims, DIM_GROUP_STYLE, DimGroupKey, REACH_STYLE, reachOf, reachChipClass } from '../data/dimensionGroups';
import { ReachLegend } from '../components/common/ReachLegend';

const VALUE_INPUT =
  'w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-navy-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none transition';
const SCOPE_SELECT =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-navy-500 focus:bg-white';

const SectionLabel: React.FC<{ n: string; text: string }> = ({ n, text }) => (
  <div className="flex items-center gap-2">
    <span className="w-5 h-5 rounded-full bg-navy-600 text-white text-[10px] font-extrabold flex items-center justify-center">{n}</span>
    <span className="text-[11px] font-extrabold text-navy-800 uppercase tracking-wider">{text}</span>
    <span className="flex-1 h-px bg-navy-200" />
  </div>
);

export const TagStrategyPage: React.FC = () => {
  const { brands } = usePersona();
  const bs = useBrandStrategy();

  const [brandId, setBrandId] = useState<string>(brands[0]?.id || '');
  const [channel, setChannel] = useState<string>('Digital');
  const [subChannel, setSubChannel] = useState<string>(kiteSubChannels('Digital')[0] || '');
  const [kbqId, setKbqId] = useState<string>('');
  // '' = all publishers; otherwise show just that publisher's dimensions (publisher-sheet scopes only)
  const [publisher, setPublisher] = useState<string>('');
  // which dimension group the table shows (GA / Content) — switched from the bar above the column names
  const [dimTab, setDimTab] = useState<DimGroupKey>('ga');
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const brand = brands.find(b => b.id === brandId) || brands[0];
  const bId = brand?.id || brandId;

  const subChannelList = kiteSubChannels(channel);
  const hasSubChannels = subChannelList.length > 0;
  const scopeSub = hasSubChannels ? subChannel : '';

  const pickBrand = (id: string) => setBrandId(id);
  const pickChannel = (c: string) => {
    setChannel(c);
    setSubChannel(kiteSubChannels(c)[0] || '');
  };

  // Ensure a valid sub-channel whenever the channel changes.
  useEffect(() => {
    const subs = kiteSubChannels(channel);
    if (subs.length && !subs.includes(subChannel)) setSubChannel(subs[0]);
    if (!subs.length && subChannel) setSubChannel('');
  }, [channel, subChannel]);

  const showPublisher = isPublisherScope(channel, scopeSub);
  const sources = kiteSourcesFor(channel, scopeSub);
  // derived, so a stale pick (after changing channel / sub-channel) quietly falls back to All
  const activePublisher = showPublisher && sources.includes(publisher) ? publisher : '';
  const dims = byLabel(kiteDimensionsFor(channel, scopeSub, activePublisher || undefined));
  const scopeLabel = hasSubChannels && subChannel ? `${channel} → ${subChannel}` : channel;

  const selected = bs.getSelected(bId, channel, scopeSub);
  const selectedCount = selected.length;
  const codes = dims.map(d => d.code);
  const chosen = codes.filter(c => selected.includes(c)).length;
  const allOn = chosen === codes.length && codes.length > 0;
  const groups = groupDims(dims);
  const activeGroup = groups.find(g => g.meta.key === dimTab) ?? groups[0];
  const viewCodes = activeGroup ? activeGroup.items.map(d => d.code) : [];
  const viewChosen = viewCodes.filter(c => selected.includes(c)).length;
  const viewAllOn = viewChosen === viewCodes.length && viewCodes.length > 0;

  const toggle = (code: string) => bs.toggle(bId, channel, scopeSub, code);
  const setAll = (on: boolean) => {
    const set = new Set(selected);
    viewCodes.forEach(c => (on ? set.add(c) : set.delete(c)));
    bs.setSelected(bId, channel, scopeSub, Array.from(set));
  };
  const editDim = (code: string, patch: { name?: string; captures?: string; defaultValue?: string }) =>
    bs.setEdit(bId, channel, scopeSub, code, patch);

  const kbqs = kbqsForScope(channel, codes, selected);
  const kbqCoveredCount = kbqs.filter(k => k.status === 'covered').length;
  const kbqPartialCount = kbqs.filter(k => k.status === 'partial').length;
  const kbqNoneCount = kbqs.filter(k => k.status === 'none').length;
  const kbqCountFor = (code: string) => kbqs.filter(k => k.applicableDimensions.includes(code)).length;

  // Core KBQs are asked the same way regardless of channel; channel KBQs only make sense for
  // the channel(s) they're scoped to. Group them separately (per client feedback) rather than
  // mixing them into one flat list.
  const coreKbqs = kbqs.filter(k => k.scope === 'core');
  const channelKbqs = kbqs.filter(k => k.scope === 'channel');

  const STATUS_STYLE: Record<KbqStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
    covered: { label: 'Covered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    partial: { label: 'Partial', className: 'bg-amber-50 text-amber-700 border-amber-200', Icon: CircleDot },
    none: { label: 'Not tagged', className: 'bg-slate-100 text-slate-500 border-slate-200', Icon: Circle },
  };
  const SCOPE_STYLE: Record<KbqScope, { label: string; className: string }> = {
    core: { label: 'Core · every channel', className: 'bg-navy-50 text-navy-700 border-navy-200' },
    channel: { label: `${channel}-specific`, className: 'bg-purple-50 text-purple-700 border-purple-200' },
  };
  // Native <option> elements can't take Tailwind classes, so colour status with an emoji dot
  // instead — matching the legend's emerald / amber / slate scheme as closely as text allows.
  const STATUS_PREFIX: Record<KbqStatus, string> = { covered: '🟢', partial: '🟡', none: '⚪' };

  // Keep the picked KBQ valid as the channel/sub-channel scope (and its KBQ list) changes.
  useEffect(() => {
    if (!kbqs.some(k => k.id === kbqId)) setKbqId(kbqs[0]?.id || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, scopeSub]);

  const activeKbq = kbqs.find(k => k.id === kbqId) || kbqs[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Route className="w-5 h-5 text-navy-600" />
          Tagging Strategy
        </h1>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm mt-3">
          {(
            [
              ['view', 'Overview (read-only)'],
              ['edit', 'Edit strategy'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                mode === m ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'view' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Brand</span>
            {brands.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => pickBrand(b.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  b.id === bId
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {b.name.split(/[ (]/)[0]} ({b.code})
              </button>
            ))}
          </div>
          <TagStrategyOverview brandId={bId} />
        </>
      )}

      {mode === 'edit' && (
      <>

      {/* Scope — brand, channel and sub-channel, all as plain dropdowns */}
      <section className="space-y-2">
      <SectionLabel n="1" text="Choose scope" />
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5">
        <div
          className={`grid grid-cols-1 ${
            ({ 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' } as Record<number, string>)[
              2 + (hasSubChannels ? 1 : 0) + (showPublisher ? 1 : 0)
            ]
          } gap-3`}
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Brand</label>
            <select value={brandId} onChange={e => pickBrand(e.target.value)} className={SCOPE_SELECT}>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name.split(/[ (]/)[0]} ({b.code})
                </option>
              ))}
              
            </select>
            {brand?.indication && <p className="text-[10px] text-slate-400 mt-1">{brand.indication}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Channel</label>
            <select value={channel} onChange={e => pickChannel(e.target.value)} className={SCOPE_SELECT}>
              {KITE_CHANNELS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {hasSubChannels && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sub-channel in {channel}
              </label>
              <select value={subChannel} onChange={e => setSubChannel(e.target.value)} className={SCOPE_SELECT}>
                {subChannelList.map(sc => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showPublisher && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Publisher</label>
              <select value={activePublisher} onChange={e => setPublisher(e.target.value)} className={SCOPE_SELECT}>
                <option value="">All publishers ({sources.length})</option>
                {sources.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      </section>

      {/* Business questions & KPIs this strategy answers */}
      {KBQ_ENABLED && kbqs.length > 0 && (
        <section className="space-y-2">
        <SectionLabel n="2" text="Business questions & KPIs" />
        <div className="bg-white border-2 border-navy-300 rounded-2xl shadow-lg ring-4 ring-navy-100/60 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-navy-600 text-white px-4 py-3">
            <div className="flex items-center gap-2 text-xs">
              <Target className="w-4 h-4 shrink-0" />
              <span className="font-extrabold">Business questions &amp; KPIs</span>
              <span className="text-navy-100">for <b className="text-white font-bold">{scopeLabel}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 bg-white text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                {kbqCoveredCount} Covered
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 bg-white text-amber-700 border-amber-200">
                <CircleDot className="w-3 h-3" />
                {kbqPartialCount} Partial
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 bg-white text-slate-600 border-slate-200">
                <Circle className="w-3 h-3" />
                {kbqNoneCount} Not tagged
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3 bg-navy-50/30">
          <div className={`grid grid-cols-1 ${channelKbqs.length > 0 ? 'sm:grid-cols-2' : ''} gap-3`}>
            <div className="rounded-xl border-2 border-navy-200 bg-navy-50/50 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-navy-500 shrink-0" />
                <span className="text-[10px] font-extrabold text-navy-800 uppercase tracking-wider">
                  Cross-channel questions
                </span>
                <span className="text-[10px] font-bold text-navy-400">({coreKbqs.length})</span>
              </div>
              <select
                value={activeKbq?.scope === 'core' ? activeKbq.id : ''}
                onChange={e => e.target.value && setKbqId(e.target.value)}
                className="w-full bg-white border border-navy-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-navy-500"
              >
                <option value="" disabled>— select a question —</option>
                {coreKbqs.map(kbq => (
                  <option key={kbq.id} value={kbq.id}>
                    {STATUS_PREFIX[kbq.status]} {kbq.question}
                  </option>
                ))}
              </select>
            </div>

            {channelKbqs.length > 0 && (
              <div className="rounded-xl border-2 border-purple-200 bg-purple-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider">
                    {channel}-specific questions
                  </span>
                  <span className="text-[10px] font-bold text-purple-400">({channelKbqs.length})</span>
                </div>
                <select
                  value={activeKbq?.scope === 'channel' ? activeKbq.id : ''}
                  onChange={e => e.target.value && setKbqId(e.target.value)}
                  className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="" disabled>— select a question —</option>
                  {channelKbqs.map(kbq => (
                    <option key={kbq.id} value={kbq.id}>
                      {STATUS_PREFIX[kbq.status]} {kbq.question}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeKbq &&
            (() => {
              const { label, className, Icon } = STATUS_STYLE[activeKbq.status];
              const scopeStyle = SCOPE_STYLE[activeKbq.scope];
              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-3.5 py-2.5 bg-slate-50/60 border-b border-slate-200">
                    <p className="text-xs font-bold text-slate-900">{activeKbq.question}</p>
                  </div>
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 w-28 shrink-0 text-[10px] font-bold text-slate-500 uppercase tracking-wider align-middle">
                          Status
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 ${className}`}>
                            <Icon className="w-3 h-3" />
                            {label}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider align-middle">
                          Scope
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 ${scopeStyle.className}`}>
                            <Layers className="w-3 h-3" />
                            {scopeStyle.label}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider align-middle">
                          KPI
                        </td>
                        <td className="p-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {activeKbq.kpis.map(kpi => (
                              <span
                                key={kpi}
                                className="text-[10px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1.5 py-0.5"
                              >
                                {kpi}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider align-middle">
                          Dimensions
                        </td>
                        <td className="p-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {activeKbq.applicableDimensions.map(code => {
                              const tagged = selected.includes(code);
                              return (
                                <span
                                  key={code}
                                  className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 border ${
                                    tagged
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  {code}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
        </section>
      )}

      {/* Dimensions for the scope */}
      <section className="space-y-2">
      <SectionLabel n={KBQ_ENABLED ? '3' : '2'} text="Dimensions" />
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Tag className="w-4 h-4 text-navy-600" />
            <span>
              <b className="text-slate-800">{chosen}</b> of {dims.length} dimensions in the strategy for{' '}
              <b className="text-slate-800">{scopeLabel}</b>
              {activePublisher && (
                <span className="text-slate-400">
                  {' '}&nbsp;·&nbsp; publisher: <b className="text-slate-700">{activePublisher}</b>{' '}
                  <button type="button" onClick={() => setPublisher('')} className="font-bold text-navy-600 hover:text-navy-800 underline underline-offset-2">
                    show all
                  </button>
                </span>
              )}
              {!activePublisher && sources.length > 0 && (
                <span className="text-slate-400">
                  {' '}&nbsp;·&nbsp; publishers:{' '}
                  {sources.map((s, i) => (
                    <React.Fragment key={s}>
                      {i > 0 && ', '}
                      <b className="text-slate-700">{s}</b>
                    </React.Fragment>
                  ))}
                </span>
              )}
            </span>
          </div>
        </div>

        {showPublisher && INCLUDE_PORTAL_FIELDS && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-navy-100 border border-navy-300" /> in the publisher sheet
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-50 border border-dashed border-purple-400" /> portal field, not in the sheet
            </span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {dims.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              No dimensions defined for this scope.
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-slate-50/60 border-b border-slate-200">
              {groups.map(g => {
                const st = DIM_GROUP_STYLE[g.meta.key];
                const on = activeGroup?.meta.key === g.meta.key;
                const tagged = g.items.filter(d => selected.includes(d.code)).length;
                return (
                  <button
                    key={g.meta.key}
                    type="button"
                    onClick={() => setDimTab(g.meta.key)}
                    className={`text-left rounded-xl px-3.5 py-2.5 transition ${st.row} ${st.text} ${
                      on ? 'shadow-md ring-2 ring-offset-1 ring-slate-300' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold uppercase tracking-wider">
                      {g.meta.label} <span className="opacity-70">({g.items.length})</span>
                    </div>
                    <div className="text-[11px] opacity-80">
                      {g.meta.hint} · <b>{tagged}</b> tagged
                    </div>
                  </button>
                );
              })}
            </div>
            <ReachLegend className="px-3 py-2 border-b border-slate-100" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        title={viewAllOn ? 'Clear all' : 'Select all'}
                        ref={el => {
                          if (el) el.indeterminate = viewChosen > 0 && !viewAllOn;
                        }}
                        checked={viewAllOn}
                        onChange={() => setAll(!viewAllOn)}
                        className="w-3.5 h-3.5 accent-navy-600 cursor-pointer"
                      />
                    </th>
                    <th className="p-3 w-28">Code</th>
                    <th className="p-3 w-56">Dimension</th>
                    <th className="p-3">Captures</th>
                    <th className="p-3">Publishers</th>
                    <th className="p-3">Default value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeGroup ? [activeGroup] : []).map(g => (
                  <React.Fragment key={g.meta.key}>
                  {g.items.map(d => {
                    const on = selected.includes(d.code);
                    const ed = bs.getEdit(bId, channel, scopeSub, d.code);
                    return (
                      <tr key={d.code} className={`align-top ${on ? 'bg-navy-50/50' : ''}`}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(d.code)}
                            className="w-3.5 h-3.5 accent-navy-600 cursor-pointer mt-1"
                          />
                        </td>
                        <td className="p-3">
                          <span
                            title={reachOf(d.code) ? REACH_STYLE[reachOf(d.code)!].label : undefined}
                            className={`inline-block font-mono text-[11px] font-medium border rounded px-1.5 py-0.5 ${reachChipClass(d.code, 'text-slate-500 bg-slate-50 border-slate-200')}`}
                          >
                            {d.code}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {ed.name ?? d.label}
                          {KBQ_ENABLED && kbqCountFor(d.code) > 0 && (
                            <span
                              title={`Feeds ${kbqCountFor(d.code)} business question${kbqCountFor(d.code) > 1 ? 's' : ''}`}
                              className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1 py-0.5 align-middle"
                            >
                              <Target className="w-2.5 h-2.5" />
                              {kbqCountFor(d.code)}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{ed.captures ?? d.captures}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {d.sheetSources.map(p => (
                              <span key={p} className="text-[10px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1.5 py-0.5">
                                {p}
                              </span>
                            ))}
                            {d.portalSources.map(p => (
                              <span
                                key={p}
                                title="Added by the portal — not in the publisher sheet"
                                className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-dashed border-purple-400 rounded px-1.5 py-0.5"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            value={ed.defaultValue ?? ''}
                            placeholder="—"
                            onChange={e => editDim(d.code, { defaultValue: e.target.value })}
                            className={VALUE_INPUT}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>
      </section>
      </>
      )}

    </div>
  );
};
