import React, { useRef } from 'react';
import { IVA_SLIDES } from '../data/ivaSeed';
import { Pagination, usePaged, useFitRows } from '../components/common/Pagination';
import { Presentation, MousePointerClick, Lock } from 'lucide-react';

/**
 * IVA and HVA tagging: each slide of the Yescarta HCP IVA, from the client's tagging sheet, with the topic and
 * subtopic it carries (locked: they come from the approved content metadata) and its status. The IVA table adds
 * the key message and CRM value; the HVA table adds the page the content lives on.
 */
interface SlideRow {
  document: string;
  element: string;
  topic: string;
  subtopic: string;
  keyMessage: string;
  crmValue: string;
  pageUrl: string;
  status: 'approved' | 'pending';
}

const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// every slide carries a CRM value (filled in where the sheet left it blank); 2L EFS Subgroup Analysis is still pending review
const ROWS: SlideRow[] = IVA_SLIDES.map(sl => ({
  document: sl.document,
  element: sl.title,
  topic: sl.topic,
  subtopic: sl.subtopic,
  keyMessage: sl.keyMessage,
  crmValue: sl.crmValue,
  pageUrl: `https://www.yescartahcp.com/iva/${slug(sl.title)}`,
  status: !sl.crmValue || sl.document === 'VV-133132' ? 'pending' : 'approved',
}));

const STATUS: Record<SlideRow['status'], string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
};

const TH = 'px-3 py-2.5 text-left text-[10px] font-semibold text-navy-800 uppercase tracking-wider whitespace-nowrap';
// long words (e.g. "Identification/unmet") wrap inside their own cell instead of running into the next one
const TD = 'px-3 py-2.5 text-[12px] [overflow-wrap:anywhere]';

const LockedChip: React.FC<{ value: string }> = ({ value }) => (
  <span className="inline-flex max-w-full items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5" title={value}>
    <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
    <span className="truncate">{value}</span>
  </span>
);

const LockedHead: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center gap-1">
    {label} <Lock className="w-2.5 h-2.5 text-amber-500" />
  </span>
);

/** A column of the table: its header, width (none = takes the rest) and cell. */
interface Col {
  head: React.ReactNode;
  width?: string;
  cell: (r: SlideRow) => React.ReactNode;
  cls?: string;
}

const DOCUMENT: Col = { head: 'Document', width: 'w-[6.5rem]', cls: 'font-mono text-[11px] text-slate-500', cell: r => r.document };
const ELEMENT: Col = { head: 'Element (slide)', cls: 'font-semibold text-slate-900 leading-snug', cell: r => r.element };
const TOPIC: Col = { head: <LockedHead label="Topic" />, width: 'w-[12rem]', cell: r => <LockedChip value={r.topic} /> };
const SUBTOPIC: Col = { head: <LockedHead label="Subtopic" />, width: 'w-[12rem]', cell: r => <LockedChip value={r.subtopic} /> };
const KEY_MESSAGE: Col = { head: 'Key message', width: 'w-[12rem]', cls: 'text-slate-700 leading-snug', cell: r => r.keyMessage };
const CRM: Col = { head: 'CRM value', cls: 'text-slate-700 leading-snug', cell: r => r.crmValue };
const PAGE_URL: Col = {
  head: 'Page URL',
  cell: r => (
    <a
      href={r.pageUrl}
      target="_blank"
      rel="noreferrer"
      title={r.pageUrl}
      className="block break-all leading-snug text-[11px] font-mono text-navy-600 hover:text-navy-800 hover:underline"
    >
      {r.pageUrl.replace(/^https?:\/\//, '')}
    </a>
  ),
};
const STATUS_COL: Col = {
  head: 'Status',
  width: 'w-[6.5rem]',
  cell: r => <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ${STATUS[r.status]}`}>{r.status}</span>,
};

const SlideTable: React.FC<{ columns: Col[]; minWidth: string; noun: string }> = ({ columns, minWidth, noun }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const pageSize = useFitRows(listRef, 8);
  const paged = usePaged<SlideRow>(ROWS, pageSize, ROWS.length);
  return (
    <>
      <div ref={listRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* fixed column widths: text wraps inside its column instead of stretching the table */}
          <table className={`w-full ${minWidth} table-fixed border-collapse`}>
            <colgroup>
              {columns.map((c, i) => (
                <col key={i} className={c.width} />
              ))}
            </colgroup>
            <thead className="bg-navy-100 border-b border-navy-200">
              <tr>
                {columns.map((c, i) => (
                  <th key={i} className={TH}>
                    {c.head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.items.map(r => (
                <tr key={r.document} data-row className="border-b border-slate-100 last:border-0 align-middle hover:bg-navy-50/40">
                  {columns.map((c, i) => (
                    <td key={i} className={`${TD} ${c.cls || ''}`}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination {...paged} noun={noun} onPage={paged.setPage} />
    </>
  );
};

export const IvaPage: React.FC = () => (
  <div className="space-y-5">
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        <Presentation />
        IVA
      </h1>
      <p>Yescarta HCP IVA, slide by slide: topic and subtopic (locked, from the approved content metadata), key message and CRM value, and its status.</p>
    </div>
    <SlideTable columns={[DOCUMENT, ELEMENT, TOPIC, SUBTOPIC, KEY_MESSAGE, CRM, STATUS_COL]} minWidth="min-w-[64rem]" noun="slides" />
  </div>
);

export const HvaPage: React.FC = () => (
  <div className="space-y-5">
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        <MousePointerClick />
        HVA
      </h1>
      <p>Yescarta HCP content, element by element: topic and subtopic (locked, from the approved content metadata), the page it lives on, and its status.</p>
    </div>
    <SlideTable columns={[DOCUMENT, ELEMENT, TOPIC, SUBTOPIC, PAGE_URL, STATUS_COL]} minWidth="min-w-[60rem]" noun="elements" />
  </div>
);
