import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDictionary, ADDED_FIELDS } from '../../data/kiteDictionary';
import { Pagination, usePaged, useFitRows } from './Pagination';

/** A field of a metadata layer (Content MDM, Journey Metadata) and the dictionary field it maps to. */
export interface MappedField {
  field: string;
  /** where the value comes from (shown only when the table has a Source column) */
  source?: string;
  /** the definition, or the business rule / mapping */
  text: string;
  /** key of the dictionary field it maps to */
  dictKey: string;
  /** review state from the source sheet's legend, when it has one */
  review?: 'open' | 'ready';
}

type DictStatus = 'in' | 'added' | 'missing';
const DICT: Record<DictStatus, { label: string; chip: string; dot: string }> = {
  in: { label: 'In dictionary', chip: 'bg-navy-50 text-navy-700 border-navy-200', dot: 'bg-navy-500' },
  added: { label: 'Added to dictionary', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  missing: { label: 'Not in dictionary', chip: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};
const REVIEW: Record<'open' | 'ready', { label: string; row: string; dot: string }> = {
  open: { label: 'Open item: needs confirmation / action before build', row: 'bg-amber-50/70', dot: 'bg-amber-400' },
  ready: { label: 'Ready / confirmed', row: '', dot: 'bg-emerald-400' },
};

const TH = 'px-4 py-2.5 text-left text-[10px] font-semibold text-navy-800 uppercase tracking-wider';

export const FieldMappingTable: React.FC<{ rows: MappedField[]; textHeading: string; showSource?: boolean }> = ({ rows, textHeading, showSource = false }) => {
  const dict = useDictionary();
  const mapped = rows.map(r => {
    const d = dict.fields.find(x => x.key === r.dictKey);
    const status: DictStatus = !d ? 'missing' : ADDED_FIELDS[r.dictKey] ? 'added' : 'in';
    return { ...r, d, status };
  });
  const hasReview = rows.some(r => r.review);
  // as many rows a page as fit on the screen, so the page itself never scrolls
  const listRef = useRef<HTMLDivElement>(null);
  const pageSize = useFitRows(listRef, 8);
  const paged = usePaged<(typeof mapped)[number]>(mapped, pageSize, rows.length);

  return (
    <div className="space-y-3">
      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-600">
        {(['in', 'added'] as DictStatus[]).map(s => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${DICT[s].dot}`} />
            {DICT[s].label}
          </span>
        ))}
        {hasReview &&
          (['open', 'ready'] as const).map(s => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${REVIEW[s].dot}`} />
              {REVIEW[s].label}
            </span>
          ))}
      </div>

      <div ref={listRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse">
            <thead className="bg-navy-100 border-b border-navy-200">
              <tr>
                <th className={`${TH} w-52`}>Field</th>
                {showSource && <th className={`${TH} w-56`}>Source</th>}
                <th className={TH}>{textHeading}</th>
                <th className={`${TH} w-52`}>Dictionary</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map(r => (
                <tr key={r.field} data-row className={`border-b border-slate-100 last:border-0 align-top hover:bg-navy-50/30 ${r.review ? REVIEW[r.review].row : ''}`}>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {r.review && <span className={`w-2 h-2 rounded-sm shrink-0 ${REVIEW[r.review].dot}`} title={REVIEW[r.review].label} />}
                      <span className="font-mono text-[13px] font-semibold text-navy-700">{r.field}</span>
                    </span>
                  </td>
                  {showSource && <td className="px-4 py-3 text-[13px] text-slate-700">{r.source}</td>}
                  <td className="px-4 py-3 text-[13px] leading-relaxed text-slate-600">{r.text}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold border rounded-full px-2.5 py-0.5 ${DICT[r.status].chip}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${DICT[r.status].dot}`} />
                      {DICT[r.status].label}
                    </span>
                    {r.d && (
                      <Link to="/dictionary" className="block mt-1.5 text-[11px] text-slate-500 hover:text-navy-700">
                        {r.d.label} <span className="font-mono text-navy-600">({r.d.abbreviation})</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination {...paged} noun="fields" onPage={paged.setPage} />
    </div>
  );
};
