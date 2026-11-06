import { useSyncExternalStore } from 'react';

/**
 * The brand the signed-in user is working in. The whole portal is scoped to it. It's remembered for
 * the current sign-in (so a reload keeps it) and cleared on sign-out, so the next sign-in asks again.
 * Stored with the persona id so one user's choice is never applied to another.
 */

const LS_KEY = 'tagging360.activeBrand.v1';

interface Stored {
  personaId: string;
  brandId: string;
}

function load(): Stored | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Stored;
    return p && p.personaId && p.brandId ? p : null;
  } catch {
    return null;
  }
}

let current: Stored | null = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(l => l());
}

export function setActiveBrandFor(personaId: string, brandId: string) {
  current = { personaId, brandId };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(current));
  } catch {
    /* storage unavailable — the choice just won't survive a reload */
  }
  emit();
}

export function clearActiveBrand() {
  current = null;
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_KEY) {
      current = load();
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

const snapshot = () => current;

/** The stored brand id for this user, or '' when they haven't picked one this sign-in. */
export function useActiveBrandId(personaId: string | undefined): string {
  const stored = useSyncExternalStore(subscribe, snapshot, () => null);
  return personaId && stored && stored.personaId === personaId ? stored.brandId : '';
}
