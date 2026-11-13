import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Splits a list into pages. The page goes back to the first one whenever `resetKey` changes
 * (a new search or filter), and never points past the last page when the list shrinks.
 */
export function usePaged<T>(items: T[], pageSize: number, resetKey: unknown) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [resetKey]);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages);
  const start = (current - 1) * pageSize;
  return {
    page: current,
    pages,
    setPage,
    items: items.slice(start, start + pageSize),
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, items.length),
    total: items.length,
  };
}

/**
 * How many rows of a list fit on the screen without the page scrolling. It measures the page as drawn — the
 * shell's top bar, the page content and the footer (marked `data-shell`), and the rows of the list (marked
 * `data-row`) — and works out how many rows the window has room for. Re-measures when the window is resized.
 */
export function useFitRows(listRef: React.RefObject<HTMLElement | null>, initial: number, min = 3, max = 25): number {
  const [size, setSize] = useState(initial);
  const [tick, setTick] = useState(0);
  // the smallest page size that has overflowed at this window height: never grow back to it, or rows of
  // different heights (wrapping text) would make the size flip back and forth for ever
  const overflowedAt = useRef<{ height: number; size: number }>({ height: 0, size: Infinity });
  useEffect(() => {
    const onResize = () => setTick(t => t + 1);
    window.addEventListener('resize', onResize);
    // the window event is not always fired (zoom, devtools, embedded views), so watch the page's size too
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    ro?.observe(document.documentElement);
    const main = document.querySelector('main');
    if (main) ro?.observe(main);
    return () => {
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
    };
  }, []);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows: HTMLElement[] = Array.from(list.querySelectorAll<HTMLElement>('[data-row]'));
    if (rows.length === 0) return;
    const parts = ['header', 'content', 'footer'].map(k => document.querySelector<HTMLElement>(`[data-shell="${k}"]`));
    if (parts.some(p => !p)) return;
    const natural = parts.reduce((h, p) => h + p!.getBoundingClientRect().height, 0);
    const first = rows[0].getBoundingClientRect();
    const last = rows[rows.length - 1].getBoundingClientRect();
    const span = last.bottom - first.top;
    // a row's share of the list, gaps included
    const perRow = rows.length > 1 ? (span - last.height) / (rows.length - 1) : first.height;
    const overhead = natural - span;
    const h = window.innerHeight;
    if (overflowedAt.current.height !== h) overflowedAt.current = { height: h, size: Infinity };
    if (natural > h + 1) overflowedAt.current.size = Math.min(overflowedAt.current.size, size);
    const fits = Math.floor((h - overhead - last.height) / perRow) + 1;
    const next = Math.max(min, Math.min(max, fits, overflowedAt.current.size - 1));
    if (next !== size) setSize(next);
  });
  void tick;
  return size;
}

/** Page numbers to show: the first, the last, and the ones around the current page. */
const pageList = (page: number, pages: number): (number | '…')[] => {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter(n => n >= 1 && n <= pages));
  const out: (number | '…')[] = [];
  [...keep].sort((a, b) => a - b).forEach((n, i, arr) => {
    if (i > 0 && n - arr[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
};

export const Pagination: React.FC<{
  page: number;
  pages: number;
  from: number;
  to: number;
  total: number;
  noun: string;
  onPage: (p: number) => void;
}> = ({ page, pages, from, to, total, noun, onPage }) => {
  if (total === 0) return null;
  const btn = 'min-w-[2rem] h-8 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
      <span className="text-[11px] text-slate-500">
        Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of <span className="font-semibold text-slate-700">{total}</span> {noun}
      </span>
      {pages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pages">
          <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Previous page" className={`${btn} text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageList(page, pages).map((n, i) =>
            n === '…' ? (
              <span key={`gap${i}`} className="px-1 text-xs text-slate-400">…</span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onPage(n)}
                aria-current={n === page ? 'page' : undefined}
                className={`${btn} ${n === page ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {n}
              </button>
            )
          )}
          <button type="button" onClick={() => onPage(page + 1)} disabled={page === pages} aria-label="Next page" className={`${btn} text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
};
