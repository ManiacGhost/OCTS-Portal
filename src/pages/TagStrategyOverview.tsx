import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Target, CheckCircle2, CircleDot, Circle, Layers, LayoutGrid, Tag, X } from 'lucide-react';
import { useBrandStrategy } from '../data/brandStrategyStore';
import { KITE_CHANNELS, kiteSubChannels, kiteDimensionsFor, kiteDimensionByCode } from '../data/kiteTaxonomy';
import { kbqsForScope, KbqStatus, ScopedKbq, KBQ_ENABLED } from '../data/kbqKpiMap';
import { dimGroupOf, DIM_GROUP_STYLE, reachChipClass, reachCodeClass } from '../data/dimensionGroups';
import { ReachLegend } from '../components/common/ReachLegend';

interface Scope {
  channel: string;
  sub: string;
  label: string;
}

const SCOPES: Scope[] = KITE_CHANNELS.flatMap(ch => {
  const subs = kiteSubChannels(ch);
  return subs.length
    ? subs.map(s => ({ channel: ch as string, sub: s, label: `${ch} → ${s}` }))
    : [{ channel: ch as string, sub: '', label: ch as string }];
});

const STATUS: Record<KbqStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  covered: { label: 'Covered', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  partial: { label: 'Partial', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: CircleDot },
  none: { label: 'Not tagged', cls: 'bg-slate-100 text-slate-500 border-slate-200', Icon: Circle },
};

interface Row {
  scope: Scope;
  status: KbqStatus;
  dims: string[];
  tagged: string[];
}
interface Entry {
  kbq: ScopedKbq;
  rows: Row[];
}

interface Props {
  brandId: string;
}

/** Read-only, KBQ-led overview: for each business question, which dimensions this brand has
 *  tagged on every channel it applies to. No channel pickers — every channel is shown at once. */
const KbqOverview: React.FC<Props> = ({ brandId }) => {
  const bs = useBrandStrategy();

  const entries = useMemo(() => {
    const map = new Map<string, Entry>();
    SCOPES.forEach(scope => {
      const codes = kiteDimensionsFor(scope.channel, scope.sub).map(d => d.code);
      const selected = bs.getSelected(brandId, scope.channel, scope.sub);
      kbqsForScope(scope.channel, codes, selected).forEach(k => {
        const e = map.get(k.id) || { kbq: k, rows: [] };
        e.rows.push({
          scope,
          status: k.status,
          dims: k.applicableDimensions,
          tagged: k.applicableDimensions.filter(c => selected.includes(c)),
        });
        map.set(k.id, e);
      });
    });
    const all = Array.from(map.values());
    return {
      core: all.filter(e => e.kbq.scope === 'core'),
      channel: all.filter(e => e.kbq.scope === 'channel'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bs, brandId]);

  const all = [...entries.core, ...entries.channel];
  const cells = all.flatMap(e => e.rows);
  const count = (s: KbqStatus) => cells.filter(r => r.status === s).length;

  const renderEntry = (e: Entry) => (
    <div key={e.kbq.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 space-y-1.5">
        <p className="text-sm font-extrabold text-slate-900">{e.kbq.question}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500">KPI:</span>
          {e.kbq.kpis.map(k => (
            <span key={k} className="text-[10px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1.5 py-0.5">
              {k}
            </span>
          ))}
        </div>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/60 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
          <tr>
            <th className="px-4 py-2 w-56">Channel</th>
            <th className="px-4 py-2 w-32">Status</th>
            <th className="px-4 py-2">Dimensions (tagged highlighted)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {e.rows.map(r => {
            const st = STATUS[r.status];
            return (
              <tr key={r.scope.label}>
                <td className="px-4 py-2.5 font-bold text-slate-800">{r.scope.label}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 ${st.cls}`}>
                    <st.Icon className="w-3 h-3" />
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {r.dims.map(c => {
                      const on = r.tagged.includes(c);
                      return (
                        <span
                          key={c}
                          title={kiteDimensionByCode(c)?.label}
                          className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 border ${
                            on
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200 line-through decoration-slate-300'
                          }`}
                        >
                          {c}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-navy-600 text-white rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <Target className="w-4 h-4" />
          <span className="font-extrabold">Business questions &amp; KPIs across every channel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 bg-white text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            {count('covered')} Covered
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 bg-white text-amber-700 border-amber-200">
            <CircleDot className="w-3 h-3" />
            {count('partial')} Partial
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 bg-white text-slate-600 border-slate-200">
            <Circle className="w-3 h-3" />
            {count('none')} Not tagged
          </span>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-navy-600" />
          <span className="text-[11px] font-extrabold text-navy-800 uppercase tracking-wider">
            Cross-channel questions ({entries.core.length})
          </span>
          <span className="flex-1 h-px bg-navy-200" />
        </div>
        {entries.core.map(renderEntry)}
      </section>

      {entries.channel.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider">
              Channel-specific questions ({entries.channel.length})
            </span>
            <span className="flex-1 h-px bg-purple-200" />
          </div>
          {entries.channel.map(renderEntry)}
        </section>
      )}
    </div>
  );
};

/** Overview wording for the two groups (the edit screen calls them "fields"). */
const ATTR_LABEL: Record<string, string> = {
  core: 'Core attributes',
  exec: 'Execution / Engagement attributes',
};

type GroupKey = 'core' | 'exec';
interface Popover {
  rowKey: string;
  group: GroupKey;
  top: number;
  left: number;
}
const POP_W = 520; // px
const POP_H = 320; // px, max height — used to decide whether to flip above the button

/** Plain read-only overview (used while the KBQ layer is switched off): for the chosen brand,
 *  which dimensions are tagged on each channel / sub-channel, split into Core and Execution /
 *  Engagement. One small inline button per channel opens a floating tile listing every available
 *  dimension in the same two groups, with the already-tagged ones greyed out. View only. */
const PlainOverview: React.FC<Props> = ({ brandId }) => {
  const bs = useBrandStrategy();
  const [pop, setPop] = useState<Popover | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const rows = SCOPES.map(scope => {
    const dims = kiteDimensionsFor(scope.channel, scope.sub);
    const selected = bs.getSelected(brandId, scope.channel, scope.sub);
    return { scope, dims, selected, tagged: dims.filter(d => selected.includes(d.code)) };
  });
  const totalTagged = rows.reduce((n, r) => n + r.tagged.length, 0);

  // close the floating tile on Esc, outside click, scroll or resize
  useEffect(() => {
    if (!pop) return;
    const close = () => setPop(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [pop]);

  const openPop = (e: React.MouseEvent<HTMLButtonElement>, rowKey: string, group: GroupKey) => {
    e.stopPropagation();
    if (pop && pop.rowKey === rowKey && pop.group === group) return setPop(null);
    const r = e.currentTarget.getBoundingClientRect();
    const width = Math.min(POP_W, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    // below the button; flip above when there isn't room
    const below = r.bottom + 6;
    const top = below + POP_H > window.innerHeight ? Math.max(8, r.top - POP_H - 6) : below;
    setPop({ rowKey, group, top, left });
  };

  const popRow = pop ? rows.find(r => r.scope.label === pop.rowKey) : undefined;
  const popDims = popRow && pop ? popRow.dims.filter(d => dimGroupOf(d.code) === pop.group) : [];

  // one chip, shared by the table and the tile
  const chip = (d: { code: string; label: string; captures: string }, cls: string, codeCls: string) => (
    <span
      key={d.code}
      title={d.captures}
      className={`inline-flex items-center gap-1 text-[11px] font-bold border rounded-lg px-2 py-0.5 ${cls}`}
    >
      {d.label}
      <span className={`font-mono text-[9px] font-medium ${codeCls}`}>{d.code}</span>
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-navy-600 text-white rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <Tag className="w-4 h-4" />
          <span className="font-extrabold">Tagged dimensions by channel</span>
        </div>
        <span className="text-xs text-navy-100">
          <b className="text-white">{totalTagged}</b> tagged across {rows.length} channels
        </span>
      </div>

      <ReachLegend className="px-1" />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/60 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-48">Channel</th>
              <th className="px-4 py-3 w-28">Tagged dimensions</th>
              {(['core', 'exec'] as GroupKey[]).map(k => (
                <th key={k} className={`px-4 py-3 ${DIM_GROUP_STYLE[k].text}`}>
                  {ATTR_LABEL[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(r => (
              <tr key={r.scope.label} className="align-top">
                <td className="px-4 py-3 font-bold text-slate-900">{r.scope.label}</td>
                <td className="px-4 py-3 text-slate-600">
                  <b className="text-slate-900">{r.tagged.length}</b> of {r.dims.length}
                </td>
                {(['core', 'exec'] as GroupKey[]).map(k => {
                  const st = DIM_GROUP_STYLE[k];
                  const all = r.dims.filter(d => dimGroupOf(d.code) === k);
                  const tagged = r.tagged.filter(d => dimGroupOf(d.code) === k);
                  const active = pop?.rowKey === r.scope.label && pop.group === k;
                  return (
                    <td key={k} className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tagged.length === 0 && <span className="text-slate-400">Nothing tagged yet</span>}
                        {tagged.map(d => chip(d, reachChipClass(d.code, st.chip), reachCodeClass(d.code, st.code)))}
                        <button
                          type="button"
                          onClick={e => openPop(e, r.scope.label, k)}
                          title={`Show all available ${ATTR_LABEL[k].toLowerCase()} (${tagged.length} of ${all.length} tagged)`}
                          aria-label={`Show all available ${ATTR_LABEL[k].toLowerCase()}`}
                          className={`inline-flex items-center justify-center shrink-0 p-0 w-6 h-6 border border-dashed rounded-lg transition ${
                            active ? st.btnActive : st.btn
                          }`}
                        >
                          <LayoutGrid size={14} className="block shrink-0" />
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pop && popRow && (
        <div
          ref={popRef}
          role="dialog"
          aria-label="All available dimensions"
          style={{ position: 'fixed', top: pop.top, left: pop.left, width: Math.min(POP_W, window.innerWidth - 16) }}
          className="z-50 bg-white border border-slate-200 rounded-xl shadow-2xl"
        >
          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-t-xl bg-navy-600 text-white">
            <div className="text-[11px] font-extrabold uppercase tracking-wider">
              {popRow.scope.label} · all available {ATTR_LABEL[pop.group].toLowerCase()}
              <span className="font-bold opacity-70"> ({popDims.length})</span>
            </div>
            <button type="button" aria-label="Close" onClick={() => setPop(null)} className="p-0.5 rounded hover:bg-white/15">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3.5 flex flex-wrap gap-1.5 overflow-y-auto" style={{ maxHeight: POP_H - 90 }}>
            {popDims.map(d =>
              popRow.selected.includes(d.code)
                ? chip(d, 'text-slate-400 bg-slate-100 border-slate-200', 'text-slate-300')
                : chip(d, reachChipClass(d.code, DIM_GROUP_STYLE[pop.group].chip), reachCodeClass(d.code, DIM_GROUP_STYLE[pop.group].code))
            )}
          </div>
          <div className="px-3.5 py-2 border-t border-slate-100 text-[10px] text-slate-400">
            Greyed out = already tagged · navy = on every channel · amber = on one channel only. View only.
          </div>
        </div>
      )}
    </div>
  );
};

export const TagStrategyOverview: React.FC<Props> = props =>
  KBQ_ENABLED ? <KbqOverview {...props} /> : <PlainOverview {...props} />;
