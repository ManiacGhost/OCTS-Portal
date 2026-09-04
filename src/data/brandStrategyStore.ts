import { useSyncExternalStore } from 'react';

/**
 * Brand tagging strategy, persisted to localStorage (no backend):
 *  - which taggable dimensions a brand uses per channel / sub-channel
 *  - per-dimension overrides: renamed label, edited "captures", and a default value
 *
 * Selected & edited on the Tagging Strategy screen; consumed by the Campaign
 * Builder's Code & UTM Generator. A module-level store so both stay in sync.
 */

const LS_SELECT = 'omnia.brandStrategy.v1';
const LS_EDITS = 'omnia.dimensionEdits.v1';

type SelectionMap = Record<string, string[]>; // strategyKey -> selected dimension names

export interface DimEdit {
  name?: string;
  captures?: string;
  defaultValue?: string;
}
type EditMap = Record<string, DimEdit>; // editKey -> overrides

function loadJSON<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

let selections: SelectionMap = loadJSON(LS_SELECT, {});
let edits: EditMap = loadJSON(LS_EDITS, {});
let snapshot = { selections, edits };
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(LS_SELECT, JSON.stringify(selections));
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(LS_EDITS, JSON.stringify(edits));
  } catch {
    /* ignore */
  }
}
function commit() {
  snapshot = { selections, edits };
  listeners.forEach(l => l());
}

export function strategyKey(brandId: string, channel: string, subChannel: string): string {
  return `${brandId}::${channel}::${subChannel || '-'}`;
}
function editKey(brandId: string, channel: string, subChannel: string, dimName: string): string {
  return `${strategyKey(brandId, channel, subChannel)}::${dimName}`;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_SELECT) selections = loadJSON(LS_SELECT, {});
    if (e.key === LS_EDITS) edits = loadJSON(LS_EDITS, {});
    if (e.key === LS_SELECT || e.key === LS_EDITS) commit();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}
function getSnapshot() {
  return snapshot;
}

// ---- selection ----
export function getSelectedDimensions(brandId: string, channel: string, subChannel: string): string[] {
  return selections[strategyKey(brandId, channel, subChannel)] || [];
}
export function setSelectedDimensions(brandId: string, channel: string, subChannel: string, names: string[]) {
  selections = { ...selections, [strategyKey(brandId, channel, subChannel)]: names };
  persist();
  commit();
}
export function toggleDimension(brandId: string, channel: string, subChannel: string, name: string) {
  const current = getSelectedDimensions(brandId, channel, subChannel);
  setSelectedDimensions(
    brandId,
    channel,
    subChannel,
    current.includes(name) ? current.filter(n => n !== name) : [...current, name],
  );
}

// ---- per-dimension edits ----
export function getDimEdit(brandId: string, channel: string, subChannel: string, dimName: string): DimEdit {
  return edits[editKey(brandId, channel, subChannel, dimName)] || {};
}
export function setDimEdit(
  brandId: string,
  channel: string,
  subChannel: string,
  dimName: string,
  patch: DimEdit,
) {
  const k = editKey(brandId, channel, subChannel, dimName);
  const merged: DimEdit = { ...(edits[k] || {}), ...patch };
  (Object.keys(merged) as (keyof DimEdit)[]).forEach(kk => {
    if (merged[kk] === undefined || merged[kk] === '') delete merged[kk];
  });
  const next: EditMap = { ...edits };
  if (Object.keys(merged).length > 0) next[k] = merged;
  else delete next[k];
  edits = next;
  persist();
  commit();
}

export function useBrandStrategy() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    getSelected: (b: string, c: string, s: string): string[] => snap.selections[strategyKey(b, c, s)] || [],
    isSelected: (b: string, c: string, s: string, n: string): boolean =>
      (snap.selections[strategyKey(b, c, s)] || []).includes(n),
    toggle: toggleDimension,
    setSelected: setSelectedDimensions,
    getEdit: (b: string, c: string, s: string, n: string): DimEdit =>
      snap.edits[editKey(b, c, s, n)] || {},
    setEdit: setDimEdit,
  };
}
