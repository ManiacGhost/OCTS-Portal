import React, { useEffect, useState } from 'react';
import { Route, Tag, ArrowRight, Target, CheckCircle2, CircleDot, Circle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePersona } from '../context/PersonaContext';
import { useBrandStrategy } from '../data/brandStrategyStore';
import {
  KITE_CHANNELS,
  kiteSubChannels,
  kiteDimensionsFor,
  kiteSourcesFor,
} from '../data/kiteTaxonomy';
import { kbqsForScope, KbqStatus, KbqScope } from '../data/kbqKpiMap';

const VALUE_INPUT =
  'w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-navy-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none transition';
const SCOPE_SELECT =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-navy-500 focus:bg-white';

export const TagStrategyPage: React.FC = () => {
  const { brands } = usePersona();
  const bs = useBrandStrategy();

  const [brandId, setBrandId] = useState<string>(brands[0]?.id || '');
  const [channel, setChannel] = useState<string>('Digital');
  const [subChannel, setSubChannel] = useState<string>(kiteSubChannels('Digital')[0] || '');
  const [kbqId, setKbqId] = useState<string>('');

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

  const dims = kiteDimensionsFor(channel, scopeSub);
  const sources = kiteSourcesFor(channel, scopeSub);
  const scopeLabel = hasSubChannels && subChannel ? `${channel} → ${subChannel}` : channel;

  const selected = bs.getSelected(bId, channel, scopeSub);
  const selectedCount = selected.length;
  const codes = dims.map(d => d.code);
  const chosen = codes.filter(c => selected.includes(c)).length;
  const allOn = chosen === codes.length && codes.length > 0;

  const toggle = (code: string) => bs.toggle(bId, channel, scopeSub, code);
  const setAll = (on: boolean) => {
    const set = new Set(selected);
    codes.forEach(c => (on ? set.add(c) : set.delete(c)));
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
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Route className="w-5 h-5 text-navy-600" />
          Tagging Strategy
        </h1>
      </div>

      {/* Scope — brand, channel and sub-channel, all as plain dropdowns */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5">
        <div className={`grid grid-cols-1 ${hasSubChannels ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
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
        </div>
      </div>

      {/* Business questions & KPIs this strategy answers */}
      {kbqs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Target className="w-4 h-4 text-navy-600 shrink-0" />
              <span className="font-bold text-slate-800">Business questions &amp; KPIs</span>
              <span className="text-slate-400">for <b className="text-slate-700 font-bold">{scopeLabel}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                {kbqCoveredCount} Covered
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200">
                <CircleDot className="w-3 h-3" />
                {kbqPartialCount} Partial
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 bg-slate-100 text-slate-500 border-slate-200">
                <Circle className="w-3 h-3" />
                {kbqNoneCount} Not tagged
              </span>
            </div>
          </div>

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
      )}

      {/* Dimensions for the scope */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Tag className="w-4 h-4 text-navy-600" />
            <span>
              <b className="text-slate-800">{selectedCount}</b> of {dims.length} dimensions in the strategy for{' '}
              <b className="text-slate-800">{scopeLabel}</b>
              {sources.length > 0 && (
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
          <Link
            to="/campaigns"
            className="flex items-center gap-1 text-[11px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded-lg px-2.5 py-1.5 hover:bg-navy-100 transition"
          >
            Use in Code &amp; UTM Generator
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {dims.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              No dimensions defined for this scope.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        title={allOn ? 'Clear all' : 'Select all'}
                        ref={el => {
                          if (el) el.indeterminate = chosen > 0 && !allOn;
                        }}
                        checked={allOn}
                        onChange={() => setAll(!allOn)}
                        className="w-3.5 h-3.5 accent-navy-600 cursor-pointer"
                      />
                    </th>
                    <th className="p-3 w-28">Code</th>
                    <th className="p-3 w-56">Dimension</th>
                    <th className="p-3">Captures</th>
                    <th className="p-3">Default value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dims.map(d => {
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
                        <td className="p-3 font-mono text-[11px] text-slate-400">{d.code}</td>
                        <td className="p-3 font-bold text-slate-900">
                          {ed.name ?? d.label}
                          {kbqCountFor(d.code) > 0 && (
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
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
