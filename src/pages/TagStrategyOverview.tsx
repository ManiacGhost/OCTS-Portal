import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Target, CheckCircle2, CircleDot, Circle, Layers, LayoutGrid, Tag, X, Plus, Pencil, Check, Search } from 'lucide-react';
import { useBrandStrategy } from '../data/brandStrategyStore';
import { KITE_CHANNELS, kiteSubChannels, kiteDimensionsFor, kiteDimensionByCode } from '../data/kiteTaxonomy';
import { kbqsForScope, KbqStatus, ScopedKbq, KBQ_ENABLED } from '../data/kbqKpiMap';
import { byLabel, DimGroupKey, dimGroupOf, DIM_GROUP_STYLE, reachChipClass, reachCodeClass, REACH_STYLE } from '../data/dimensionGroups';
import { fuzzyFilter } from '../components/common/fuzzy';
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

/** Channel / sub-channel labels each dimension is available on (for the hover tile). */
const CHANNELS_BY_CODE: Record<string, string[]> = {};
SCOPES.forEach(sc =>
  kiteDimensionsFor(sc.channel, sc.sub).forEach(d => (CHANNELS_BY_CODE[d.code] ||= []).push(sc.label))
);
const channelsWith = (code: string) => CHANNELS_BY_CODE[code] || [];

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
  ga: 'GA tags',
  content: 'Content tags',
};

type GroupKey = DimGroupKey;
interface Popover {
  rowKey: string;
  group: GroupKey;
  top: number;
  left: number;
}
const POP_W = 520; // px
const POP_H = 320; // px, max height — used to decide whether to flip above the button

/** Plain read-only overview (used while the KBQ layer is switched off): for the chosen brand,
 *  which dimensions are tagged on each channel / sub-channel, split into GA and Content tags. One small inline button per channel opens a floating tile listing every available
 *  dimension in the same two groups, with the already-tagged ones greyed out. View only. */
const PlainOverview: React.FC<Props> = ({ brandId }) => {
  const bs = useBrandStrategy();
  const [pop, setPop] = useState<Popover | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ code: string; label: string; top: number; left: number } | null>(null);
  const rows = SCOPES.map(scope => {
    const dims = byLabel(kiteDimensionsFor(scope.channel, scope.sub));
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
      onMouseEnter={e => {
        const r = e.currentTarget.getBoundingClientRect();
        const left = Math.max(8, Math.min(r.left, window.innerWidth - 248));
        setHover({ code: d.code, label: d.label, top: r.bottom + 6, left });
      }}
      onMouseLeave={() => setHover(null)}
      className={`inline-flex items-center gap-1 text-[11px] font-bold border rounded-lg px-2 py-0.5 cursor-default ${cls}`}
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
        <table className="w-full table-fixed text-left text-xs">
          {/* fixed layout + explicit widths: columns never shift with the number of chips */}
          <colgroup>
            <col className="w-44" />
            <col className="w-28" />
            <col />
            <col />
          </colgroup>
          <thead className="bg-slate-50/60 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Tagged dimensions</th>
              {(['ga', 'content'] as GroupKey[]).map(k => (
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
                {(['ga', 'content'] as GroupKey[]).map(k => {
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

      {hover && (
        <div
          role="tooltip"
          style={{ position: 'fixed', top: hover.top, left: hover.left, width: 240 }}
          className="z-[60] pointer-events-none bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="px-3 py-2 bg-navy-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
            {hover.label} <span className="font-mono font-medium opacity-70 normal-case">{hover.code}</span>
          </div>
          <div className="px-3 py-2 text-[11px] text-slate-700 space-y-1">
            <div className="text-[10px] text-slate-400">
              Available on {channelsWith(hover.code).length} of {SCOPES.length} channels
            </div>
            {channelsWith(hover.code).map(l => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-navy-500" />
                {l}
              </div>
            ))}
          </div>
        </div>
      )}

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
            Greyed out = already tagged · navy = multi channel · amber = single channel. View only.
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Overview as the client's "Tagging and Taxonomy - Current State Assessment" table: what is tagged
 * under each of the four components (GA Tagging, Content Tagging, Content MDM, Content Metadata),
 * per channel, with the tags involved.
 * Static reference content (the client's own table, minus the Development team and Housed in
 * columns). Set LANDSCAPE_OVERVIEW to false to bring back the per-brand tagged-dimensions view.
 */
export const LANDSCAPE_OVERVIEW = true;

interface LandscapeTag {
  label: string;
}
interface LandscapeRow {
  channel: string;
  tags: LandscapeTag[];
  /** shown instead of / after the tags */
  note?: string;
}

const t = (label: string): LandscapeTag => ({ label });

// GA Tagging carries the UTM tags: source, medium, campaign (SFMC email also carries term).
const UTM_TAGS = [t('Source'), t('Medium'), t('Campaign')];
/** Extra tags that can be added to a GA Tagging row from the edit-mode picker. */
const GA_EXTRA_TAGS: string[] = [];
/** Tags that exist only on one channel row (never offered elsewhere). */
const ONLY_ON: Record<string, string> = { Term: 'SFMC (email)' };
/** Tags that must never be offered on a given channel row. */
const NOT_ON: Record<string, string[]> = {
  'Website - Pages & HVAs': ['Topic', 'Subtopic', 'Key Message'],
};

const LANDSCAPE: { category: string; group: 'ga' | 'content'; rows: LandscapeRow[] }[] = [
  {
    category: 'GA Tagging',
    group: 'ga',
    rows: [
      { channel: 'SFMC (email)', tags: [...UTM_TAGS, t('Term')] },
      { channel: 'RTE', tags: UTM_TAGS },
      { channel: 'Paid Media (Medscape/DeepIntent)', tags: UTM_TAGS },
      { channel: 'Paid Search', tags: UTM_TAGS },
      { channel: 'Social (Equals5)', tags: UTM_TAGS },
    ],
  },
  {
    category: 'Content Tagging',
    group: 'content',
    rows: [
      {
        channel: 'IVA',
        tags: [t('DocId'), t('Name'), t('Type'), t('Key Message'), t('Topic'), t('Subtopic')],
      },
      {
        channel: 'Website - Pages & HVAs',
        tags: [],
        note: 'Pages & HVAs are currently not mapped to topic, subtopic or key message',
      },
      {
        channel: 'Other Assets (banners, emails, white papers)',
        tags: [t('Topic'), t('Subtopic'), t('Use case')],
      },
    ],
  },
  {
    category: 'Content MDM',
    group: 'content',
    rows: [
      {
        channel: '-',
        tags: [
          t('Vault asset ID'),
          t('Vault global ID'),
          t('Topic'),
          t('Subtopic'),
          t('Indication'),
        ],
      },
    ],
  },
  {
    category: 'Content Metadata',
    group: 'content',
    rows: [
      {
        channel: '-',
        tags: [t('Step ID'), t('Tactic ID'), t('Creative ID'), t('Audience ID')],
      },
    ],
  },
];

// a tag listed on more than one channel row is multi channel; on exactly one row, single channel
const TAG_ROWS: Record<string, number> = {};
LANDSCAPE.forEach(g => g.rows.forEach(r => r.tags.forEach(tag => (TAG_ROWS[tag.label] = (TAG_ROWS[tag.label] || 0) + 1))));

const rowKey = (category: string, channel: string) => `${category}|${channel}`;
const STORE_KEY = 'tagging360.landscape.tags.v2';

/** Every tag a row of this group could show (what the "+" picker offers). */
function poolFor(group: 'ga' | 'content', category: string, channel: string): string[] {
  const set = new Set<string>();
  LANDSCAPE.filter(g => g.category === category).forEach(g =>
    g.rows.forEach(r => r.tags.forEach(x => set.add(x.label)))
  );
  if (group === 'ga') GA_EXTRA_TAGS.forEach(x => set.add(x));
  return Array.from(set).filter(l => (!ONLY_ON[l] || ONLY_ON[l] === channel) && !(NOT_ON[channel] || []).includes(l));
}

const loadTags = (): Record<string, string[]> => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const out: Record<string, string[]> = {};
  LANDSCAPE.forEach(g => g.rows.forEach(r => (out[rowKey(g.category, r.channel)] = r.tags.map(x => x.label))));
  return out;
};

const AddTagsPicker: React.FC<{
  anchor: { top: number; left: number };
  options: string[];
  onAdd: (labels: string[]) => void;
  onClose: () => void;
}> = ({ anchor, options, onAdd, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);
  const results = fuzzyFilter<string>(options, q, o => o);
  const toggle = (o: string) => setPicked(p => (p.includes(o) ? p.filter(x => x !== o) : [...p, o]));
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Add tags"
      style={{ position: 'fixed', top: anchor.top, left: anchor.left, width: 260 }}
      className="z-50 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="p-2 border-b border-slate-100 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search tags…"
          className="w-full text-xs focus:outline-none"
        />
      </div>
      <div className="max-h-52 overflow-y-auto py-1">
        {options.length === 0 && <p className="px-3 py-2 text-[11px] text-slate-400">All tags are already added.</p>}
        {options.length > 0 && results.length === 0 && <p className="px-3 py-2 text-[11px] text-slate-400">No match.</p>}
        {results.map(({ item }) => (
          <label key={item} className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" checked={picked.includes(item)} onChange={() => toggle(item)} className="accent-navy-600" />
            {item}
          </label>
        ))}
      </div>
      <div className="p-2 border-t border-slate-100 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-2.5 py-1 text-[11px] font-bold text-slate-500 rounded-lg hover:bg-slate-50">
          Cancel
        </button>
        <button
          type="button"
          disabled={picked.length === 0}
          onClick={() => {
            onAdd(picked);
            onClose();
          }}
          className="px-2.5 py-1 text-[11px] font-bold text-white bg-navy-600 rounded-lg disabled:opacity-40"
        >
          Add{picked.length ? ` (${picked.length})` : ''}
        </button>
      </div>
    </div>
  );
};

const LandscapeOverview: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [tagsByRow, setTagsByRow] = useState<Record<string, string[]>>(loadTags);
  const [picker, setPicker] = useState<{ key: string; group: 'ga' | 'content'; category: string; channel: string; top: number; left: number } | null>(null);

  const update = (next: Record<string, string[]>) => {
    setTagsByRow(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  const remove = (key: string, label: string) => update({ ...tagsByRow, [key]: (tagsByRow[key] || []).filter(x => x !== label) });
  const add = (key: string, labels: string[]) => {
    const cur = tagsByRow[key] || [];
    update({ ...tagsByRow, [key]: [...cur, ...labels.filter(l => !cur.includes(l))] });
  };

  // a tag on more than one channel row is multi channel; on exactly one row, single channel (live)
  const reach: Record<string, number> = {};
  (Object.values(tagsByRow) as string[][]).forEach(list => list.forEach(l => (reach[l] = (reach[l] || 0) + 1)));

  const pickerOptions = picker
    ? poolFor(picker.group, picker.category, picker.channel).filter(o => !(tagsByRow[picker.key] || []).includes(o))
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ReachLegend className="px-1" />
        <button
          type="button"
          onClick={() => {
            setEditing(e => !e);
            setPicker(null);
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition ${
            editing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-navy-600 text-white hover:bg-navy-700'
          }`}
        >
          {editing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          {editing ? 'Done' : 'Edit strategy'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed text-left text-xs border-collapse">
          <colgroup>
            <col className="w-36" />
            <col className="w-60" />
            <col />
          </colgroup>
          <thead className="bg-navy-700 text-white text-[11px] font-bold">
            <tr>
              <th className="px-4 py-3 text-center border border-slate-300">Category</th>
              <th className="px-4 py-3 text-center border border-slate-300">Channel</th>
              <th className="px-4 py-3 text-center border border-slate-300">Tags</th>
            </tr>
          </thead>
          <tbody>
            {LANDSCAPE.map(group =>
              group.rows.map((r, i) => {
                const key = rowKey(group.category, r.channel);
                const tags = tagsByRow[key] || [];
                return (
                  <tr key={key}>
                    {i === 0 && (
                      <td
                        rowSpan={group.rows.length}
                        className="bg-slate-50 font-bold text-slate-800 text-[11px] align-middle px-4 border border-slate-300"
                      >
                        {group.category}
                      </td>
                    )}
                    <td className="px-4 py-3.5 bg-slate-50 font-bold text-slate-800 text-[11px] align-middle border border-slate-300">
                      {r.channel}
                    </td>
                    <td className="px-4 py-3.5 align-middle border border-slate-300">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tags.map(label => {
                          const rs = REACH_STYLE[reach[label] > 1 ? 'common' : 'unique'];
                          return (
                            <span
                              key={label}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold border rounded-lg px-2 py-0.5 ${rs.chip}`}
                            >
                              {label}
                              {editing && (
                                <button
                                  type="button"
                                  aria-label={`Remove ${label}`}
                                  onClick={() => remove(key, label)}
                                  className="rounded hover:bg-black/10 p-0.5 -mr-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          );
                        })}
                        {editing && (
                          <button
                            type="button"
                            aria-label={`Add tags to ${r.channel}`}
                            onClick={e => {
                              const b = e.currentTarget.getBoundingClientRect();
                              const left = Math.max(8, Math.min(b.left, window.innerWidth - 268));
                              const top = b.bottom + 6 + 300 > window.innerHeight ? Math.max(8, b.top - 306) : b.bottom + 6;
                              setPicker(
                                picker?.key === key ? null : { key, group: group.group, category: group.category, channel: r.channel, top, left }
                              );
                            }}
                            className="inline-flex items-center justify-center w-6 h-6 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-navy-500 hover:text-navy-600 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {r.note && tags.length === 0 && !editing && (
                          <span className="text-[11px] text-slate-500 italic">{r.note}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {picker && (
        <AddTagsPicker
          key={picker.key}
          anchor={picker}
          options={pickerOptions}
          onAdd={labels => add(picker.key, labels)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
};

/** 'summary' = the brand-independent current-state table; 'brand' = the per-brand tagged-tags view. */
export const TagStrategyOverview: React.FC<Props & { variant?: 'summary' | 'brand' }> = ({ variant = 'summary', ...props }) =>
  KBQ_ENABLED ? (
    <KbqOverview {...props} />
  ) : variant === 'summary' && LANDSCAPE_OVERVIEW ? (
    <LandscapeOverview />
  ) : (
    <PlainOverview {...props} />
  );

