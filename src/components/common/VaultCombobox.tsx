import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { VaultItem, vaultLabel } from '../../data/assetVault';
import { fuzzyFilter } from './fuzzy';

interface Props {
  value: string;
  onChange: (id: string) => void;
  items: VaultItem[];
  placeholder: string;
  /** accessible name for the field */
  ariaLabel: string;
}

/** Text with the fuzzy-matched characters picked out in bold. */
const Highlighted: React.FC<{ text: string; indexes: number[] }> = ({ text, indexes }) => {
  if (indexes.length === 0) return <>{text}</>;
  const on = new Set(indexes);
  return (
    <>
      {Array.from(text).map((ch, i) =>
        on.has(i) ? (
          <b key={i} className="text-navy-700 bg-navy-50 rounded-sm">
            {ch}
          </b>
        ) : (
          <React.Fragment key={i}>{ch}</React.Fragment>
        )
      )}
    </>
  );
};

/**
 * A dropdown you can also type into: opening it lists every item, typing narrows the list with a
 * fuzzy match (see fuzzy.ts) on the ID and the name. Picking an item stores its `id`.
 */
export const VaultCombobox: React.FC<Props> = ({ value, onChange, items, placeholder, ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = items.find(i => i.id === value);
  const results = useMemo(() => fuzzyFilter(items, query, vaultLabel), [items, query]);

  // close on an outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // keep the highlighted row in view while arrowing through a long list
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && results[active]) {
        e.preventDefault();
        pick(results[active].item.id);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          // while open the box shows what's being typed; closed, the chosen item
          value={open ? query : selected ? vaultLabel(selected) : value}
          placeholder={open && selected ? vaultLabel(selected) : placeholder}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={e => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-14 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-mono font-medium placeholder:text-slate-400"
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => pick('')}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Show options"
            onClick={() => setOpen(o => !o)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1"
        >
          {results.length === 0 ? (
            <li className="px-3.5 py-3 text-xs text-slate-400">No match for &ldquo;{query}&rdquo;</li>
          ) : (
            results.map(({ item, hit }, i) => {
              const label = vaultLabel(item);
              return (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={item.id === value}
                  onMouseEnter={() => setActive(i)}
                  // mousedown (not click) so the input keeps focus and the list doesn't close first
                  onMouseDown={e => {
                    e.preventDefault();
                    pick(item.id);
                  }}
                  className={`px-3.5 py-2 text-xs cursor-pointer font-mono ${
                    i === active ? 'bg-navy-50 text-slate-900' : 'text-slate-700'
                  } ${item.id === value ? 'font-bold' : ''}`}
                >
                  <Highlighted text={label} indexes={hit.indexes} />
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
