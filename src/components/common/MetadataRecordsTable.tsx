import React, { useMemo, useRef, useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useDictionary } from '../../data/kiteDictionary';
import { Pagination, usePaged, useFitRows } from './Pagination';

/**
 * A table of records for a metadata layer (Content MDM, Journey Metadata): one column per field, every value
 * taken from that field's attributes in the dictionary (Kite_Dictionary + Kite_Dictionary_Values_v2). Fields the
 * dictionary has no values for are filled by a rule (dates, names built from other fields).
 */

/** What a column knows about the record being built. */
export interface RecordContext {
  index: number;
  /** a stable pick from a field's dictionary values for this record (`salt` varies picks between columns) */
  pick: (dictKey: string, salt?: string) => string;
  /** values already chosen for this record, by field */
  row: Record<string, string>;
}

export interface RecordColumn {
  field: string;
  /** shown as the header's tooltip */
  definition: string;
  /** the dictionary field the values come from */
  dictKey?: string;
  /** a value worked out from the record when the dictionary has none for the field */
  derive?: (ctx: RecordContext) => string;
  /** wide text (URLs) is shortened in the cell */
  truncate?: boolean;
}

const hash = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return h >>> 0;
};

// catch-all values that make a poor example; used only when a field has nothing else
const FILLER = new Set(['unknown', 'not applicable', 'na', 'n/a', 'all', 'tactic_name']);

const TH = 'px-3 py-2.5 text-left text-[10px] font-semibold text-navy-800 uppercase tracking-wider whitespace-nowrap';

export const MetadataRecordsTable: React.FC<{ columns: RecordColumn[]; count: number; seed: string; noun?: string }> = ({
  columns,
  count,
  seed,
  noun = 'records',
}) => {
  const dict = useDictionary();

  const rows = useMemo(() => {
    const valuesOf = (key: string) => {
      const all = dict.fields.find(f => f.key === key)?.attributes.map(a => a.value) || [];
      const good = all.filter(v => !FILLER.has(v.toLowerCase()));
      return good.length ? good : all;
    };
    return Array.from({ length: count }, (_, index) => {
      const row: Record<string, string> = {};
      // the asset (and so its brand) is shared by both layers, so a journey row joins to the same MDM record
      const pick = (key: string, salt = '') => {
        const vals = valuesOf(key);
        if (!vals.length) return '';
        const s = key === 'aset_id' ? `asset|${index}` : `${seed}|${key}|${salt}|${index}`;
        return vals[hash(s) % vals.length];
      };
      const ctx: RecordContext = { index, pick, row };
      columns.forEach(c => {
        row[c.field] = c.derive ? c.derive(ctx) : c.dictKey ? pick(c.dictKey, c.field) : '';
      });
      return row;
    });
  }, [dict, columns, count, seed]);

  // search across every field, plus one filter per field: a dropdown when the field has few distinct values,
  // a "contains" box otherwise
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const choices = useMemo(() => {
    const out: Record<string, string[] | null> = {};
    columns.forEach(c => {
      const vals = [...new Set<string>(rows.map(r => r[c.field]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
      out[c.field] = vals.length <= 12 && vals.length < rows.length ? vals : null;
    });
    return out;
  }, [rows, columns]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (q && !columns.some(c => (r[c.field] || '').toLowerCase().includes(q))) return false;
      return columns.every(c => {
        const f = (filters[c.field] || '').trim().toLowerCase();
        if (!f) return true;
        const v = (r[c.field] || '').toLowerCase();
        return choices[c.field] ? v === f : v.includes(f);
      });
    });
  }, [rows, columns, query, filters, choices]);
  const active = Object.values(filters).filter((v: string) => v.trim()).length + (query.trim() ? 1 : 0);
  const setFilter = (field: string, v: string) => setFilters(f => ({ ...f, [field]: v }));
  const clearAll = () => {
    setQuery('');
    setFilters({});
  };

  const listRef = useRef<HTMLDivElement>(null);
  const pageSize = useFitRows(listRef, 8);
  const paged = usePaged<Record<string, string>>(shown, pageSize, JSON.stringify([query, filters]));

  const FI = 'w-full min-w-[7rem] h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-normal normal-case tracking-normal text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[16rem] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search all fields in ${noun}…`}
            className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          Filter any column from the row under its name
        </span>
        {active > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 h-8 px-3 rounded-lg text-[12px] font-semibold text-navy-700 bg-navy-50 border border-navy-200 hover:bg-navy-100"
          >
            <X className="w-3.5 h-3.5" />
            Clear {active} filter{active > 1 ? 's' : ''}
          </button>
        )}
      </div>
      <div ref={listRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full border-collapse">
            <thead className="bg-navy-100 border-b border-navy-200">
              <tr>
                {columns.map((c, i) => (
                  <th
                    key={c.field}
                    title={c.definition}
                    className={`${TH} ${i === 0 ? 'sticky left-0 z-10 bg-navy-100 shadow-[1px_0_0_0_rgb(183_200_230)]' : ''}`}
                  >
                    <span className="font-mono normal-case tracking-normal text-[11px]">{c.field}</span>
                  </th>
                ))}
              </tr>
              <tr className="bg-navy-50 border-t border-navy-200">
                {columns.map((c, i) => {
                  const opts = choices[c.field];
                  const v = filters[c.field] || '';
                  const on = v ? 'border-navy-400 ring-1 ring-navy-200' : '';
                  return (
                    <th key={c.field} className={`px-2 py-1.5 ${i === 0 ? 'sticky left-0 z-10 bg-navy-50 shadow-[1px_0_0_0_rgb(183_200_230)]' : ''}`}>
                      {opts ? (
                        <select value={v} onChange={e => setFilter(c.field, e.target.value)} aria-label={`Filter ${c.field}`} className={`${FI} pr-7 max-w-[14rem] truncate ${on}`}>
                          <option value="">All</option>
                          {opts.map(o => (
                            <option key={o} value={o.toLowerCase()}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={v}
                          onChange={e => setFilter(c.field, e.target.value)}
                          placeholder="Contains…"
                          aria-label={`Filter ${c.field}`}
                          className={`${FI} ${on}`}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-[13px] text-slate-500">
                    <span className="sticky left-4">
                      No {noun} match these filters.{' '}
                      <button type="button" onClick={clearAll} className="font-semibold text-navy-600 hover:underline">
                        Clear filters
                      </button>
                    </span>
                  </td>
                </tr>
              )}
              {paged.items.map((r, ri) => (
                <tr key={ri} data-row className="border-b border-slate-100 last:border-0 hover:bg-navy-50/40 group/row">
                  {columns.map((c, i) => (
                    <td
                      key={c.field}
                      className={`px-3 py-2.5 text-[12px] text-slate-700 whitespace-nowrap ${
                        i === 0 ? 'sticky left-0 z-[1] bg-white group-hover/row:bg-navy-50 font-mono font-semibold text-navy-700 shadow-[1px_0_0_0_rgb(226_232_240)]' : ''
                      }`}
                    >
                      {r[c.field] ? (
                        c.truncate ? (
                          <span className="block max-w-[14rem] truncate font-mono text-[11px] text-navy-600" title={r[c.field]}>
                            {r[c.field]}
                          </span>
                        ) : (
                          r[c.field]
                        )
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination {...paged} noun={noun} onPage={paged.setPage} />
    </div>
  );
};

// ---- small helpers the pages use to fill fields the dictionary has no values for ----------------------
export const brandOfAsset = (asset: string): string => {
  const code = asset.split('-')[1]?.toUpperCase();
  return code === 'YES' ? 'YESCARTA' : code === 'TEC' ? 'TECARTUS' : 'UNBRANDED';
};
export const dateFor = (seed: string, from: Date, spanDays: number): Date => new Date(from.getTime() + (hash(seed) % spanDays) * 86400000);
export const ymd = (d: Date, sep = '-') =>
  [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join(sep);
export const pickFrom = <T,>(seed: string, list: T[]): T => list[hash(seed) % list.length];
