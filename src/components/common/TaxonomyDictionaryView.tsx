import React, { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { TAXONOMY_DICTIONARY, DICTIONARY_HEADERS } from '../../data/taxonomyDictionary';

export const TaxonomyDictionaryView: React.FC = () => {
  const [header, setHeader] = useState<string>(DICTIONARY_HEADERS[0] || '');
  const [query, setQuery] = useState('');

  const entries = TAXONOMY_DICTIONARY[header] || [];
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      q
        ? entries.filter(e => e.v.toLowerCase().includes(q) || e.a.toLowerCase().includes(q))
        : entries,
    [entries, q],
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-navy-600" />
          Taxonomy Dictionary
        </h1>
        <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
          Every controlled-vocabulary field from the Kite / Evoke taxonomy sheet. Pick a field to
          browse its approved values and abbreviations.
        </p>
      </div>

      {/* Field picker + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Field</label>
          <select
            value={header}
            onChange={e => {
              setHeader(e.target.value);
              setQuery('');
            }}
            className="w-full bg-white border border-slate-300 text-slate-900 font-bold text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-navy-500 shadow-sm"
          >
            {DICTIONARY_HEADERS.map(h => (
              <option key={h} value={h}>
                {h} ({TAXONOMY_DICTIONARY[h].length})
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${header || 'values'}…`}
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-navy-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        <b className="text-slate-800 font-extrabold">{filtered.length}</b>
        {q && <span> of {entries.length}</span>} value{filtered.length === 1 ? '' : 's'} in{' '}
        <b className="text-slate-800">{header}</b>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">No values match &ldquo;{query}&rdquo;.</div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full table-fixed text-left text-xs">
              <thead className="bg-navy-600 text-white/90 uppercase text-[10px] font-bold tracking-widest sticky top-0">
                <tr>
                  <th className="p-3 w-1/2">Value</th>
                  <th className="p-3 w-1/2">Abbreviation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e, i) => (
                  <tr key={`${e.v}-${e.a}-${i}`} className="hover:bg-slate-50/70">
                    <td className="p-3 font-medium text-slate-900 border-r border-slate-100 break-words">{e.v}</td>
                    <td className="p-3 break-words">
                      {e.a ? (
                        <span className="font-mono text-[11px] font-bold text-navy-700 bg-navy-50 border border-navy-200 rounded px-1.5 py-0.5">
                          {e.a}
                        </span>
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
