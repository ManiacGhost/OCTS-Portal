import { useMemo, useSyncExternalStore } from 'react';
import { KITE_DICTIONARY_SEED } from './kiteDictionarySeed';
import type { MediaChannelType } from '../types';

/**
 * The Kite dictionary: every field, its attributes (allowed values), its abbreviation, its business
 * owner and who last changed it. Changes go through an approval process and leave an audit trail.
 *
 *  - The fields and attribute values come from Kite_Dictionary.xlsx (see kiteDictionarySeed.ts).
 *  - Fields the campaign / tactic / UTM flows use that are not in the sheet (free text, system
 *    generated or derived) are listed too, so the table covers everything those flows capture.
 *  - The campaign and tactic forms read their dropdown options from here, so a value only exists in
 *    a form once it has been approved in the dictionary.
 */

export type DictUse = 'campaign' | 'tactic' | 'utm';
export type FieldKind = 'dictionary' | 'free' | 'system' | 'derived';

export interface DictAttribute {
  value: string;
  /** the attribute's own abbreviation; the field's abbreviation applies when it has none */
  abbreviation?: string;
  /** the attribute's own business owner; the field's owner applies when it has none */
  owner?: string;
  updatedBy: string;
  updatedAt: string;
  /** what the attribute means */
  definition?: string;
  /** an example value */
  example?: string;
  /** the values of other dictionary fields that go with this attribute: field key -> attribute value */
  links?: Record<string, string>;
}

export interface DictField {
  key: string;
  /** the short code used in tagging, e.g. brd, chnl, sub_chnl */
  abbreviation: string;
  label: string;
  kind: FieldKind;
  usedIn: DictUse[];
  /** business owner of the field and its attributes */
  owner: string;
  updatedBy: string;
  updatedAt: string;
  attributes: DictAttribute[];
  note?: string;
}

export type ChangeType = 'add_field' | 'add_value' | 'update_value' | 'remove_value' | 'update_owner';
export type ChangeStatus = 'pending' | 'approved' | 'rejected';

/** An attribute of a field being added, with its own details. */
export interface NewAttribute {
  value: string;
  abbreviation?: string;
  owner?: string;
}

/** A new field with its attributes, as asked for by a user. */
export interface NewField {
  label: string;
  abbreviation: string;
  owner: string;
  usedIn: DictUse[];
  attributes: NewAttribute[];
}

export interface DictChange {
  id: string;
  fieldKey: string;
  type: ChangeType;
  /** the attribute being added, renamed or removed */
  value?: string;
  /** the new name when renaming */
  newValue?: string;
  /** the attribute's abbreviation / business owner (when adding or editing an attribute) */
  abbreviation?: string;
  attrOwner?: string;
  /** the new business owner */
  owner?: string;
  /** the field being added (add_field) */
  field?: NewField;
  reason?: string;
  status: ChangeStatus;
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comment?: string;
}

export interface DictLogEntry {
  id: string;
  ts: string;
  fieldKey: string;
  fieldLabel: string;
  attribute?: string;
  /** what happened */
  action: string;
  /** who made (requested) the change */
  by: string;
  /** who approved it */
  approvedBy?: string;
  detail: string;
}

/** Who a notification goes to. */
export type RecipientKind = 'owner' | 'agency' | 'brand' | 'requester';

export interface DictNotification {
  id: string;
  ts: string;
  fieldKey: string;
  fieldLabel: string;
  /** e.g. Field added, Change approved */
  event: string;
  message: string;
  /** who it was sent to, as shown to the reader */
  recipients: { kind: RecipientKind; label: string }[];
  /** the portal users who see it in their notifications: by role, or by name */
  audienceRoles: string[];
  audienceNames: string[];
  /** names of the users who have read it */
  readBy: string[];
}

interface DictState {
  fields: DictField[];
  changes: DictChange[];
  log: DictLogEntry[];
  notifications: DictNotification[];
}

// ---------------------------------------------------------------------------------------------
// seed
// ---------------------------------------------------------------------------------------------

// Placeholder people/teams for the business owner and last updater of the initial dictionary, until the
// real ones are supplied. Picked per field / attribute by a stable hash, so they don't change between loads.
const OWNER_POOL = ['Data Strategy Team', 'Paid Media Team', 'IT Operations', 'Brand Analytics', 'Content Operations', 'Data Governance'];
// earlier snapshots may hold the first spellings of these, with question marks
const LEGACY_NAMES: Record<string, string> = {
  'Kienan / Evoke': 'Data Strategy Team',
  'Evoke / Paid Media': 'Paid Media Team',
  'Gilead IT': 'IT Operations',
  'Kienan / TBD': 'Brand Analytics',
  'Kienan / TBD?': 'Brand Analytics',
  Evoke: 'Content Operations',
  'Evoke / ?': 'Content Operations',
  GDDI: 'Data Governance',
  'GDDI?': 'Data Governance',
};
const clean = (v: string) => LEGACY_NAMES[v] ?? v;
// FNV-1a with a final mix, so every pick for one field is independent of the others
const hash = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return h >>> 0;
};
const pick = (seed: string): string => OWNER_POOL[hash(seed) % OWNER_POOL.length];
/** A date between 2025-07-01 and the day the dictionary was loaded (2026-11-13), at a working hour. */
const LOAD_DAY = Date.UTC(2026, 10, 13);
const randomDate = (seed: string): string => {
  const h = hash(seed);
  const daysBack = h % 500;
  const hour = 8 + ((h >>> 9) % 10);
  const minute = (h >>> 14) % 60;
  return new Date(LOAD_DAY - daysBack * 86400000 + hour * 3600000 + minute * 60000).toISOString();
};
// what earlier snapshots used for every field — replaced with the picks above when still untouched
const OLD_DEFAULT_OWNER = 'Kite Digital Data Strategy';
const OLD_INITIAL_BY = 'Initial load (Kite Dictionary)';
const INITIAL_AT = '2026-11-13T00:00:00.000Z'; // what earlier snapshots used for every date

/** Where each field of the sheet is used by the campaign / tactic / UTM flows. */
const USAGE: Record<string, DictUse[]> = {
  country: ['campaign'],
  ta: ['campaign'],
  brd: ['campaign'],
  indc: ['campaign'],
  messaging_type: ['campaign'],
  target: ['campaign', 'tactic'],
  segment: ['campaign'],
  alrt_typ: ['campaign'],
  objective: ['campaign'],
  src: ['tactic', 'utm'],
  chnl: ['tactic', 'utm'],
  sub_chnl: ['tactic', 'utm'],
  aset_id: ['tactic', 'utm'],
};

/** Fields the flows capture that the sheet does not list (free text, system generated or derived). */
const EXTRAS: { key: string; abbreviation: string; label: string; kind: FieldKind; usedIn: DictUse[]; note: string }[] = [
  { key: 'campaign_id', abbreviation: 'cpgn_id', label: 'Campaign ID', kind: 'system', usedIn: ['campaign', 'utm'], note: 'System-generated: cp + year + month + running number for the month, e.g. cp202602001' },
  { key: 'campaign_name', abbreviation: 'cpgn_nm', label: 'Campaign name', kind: 'free', usedIn: ['campaign'], note: 'Free text' },
  { key: 'segment_name', abbreviation: 'segmentname', label: 'Segment name', kind: 'free', usedIn: ['campaign'], note: 'Free text (part of the Campaign Name formula)' },
  { key: 'segment_value', abbreviation: 'segmentvalue', label: 'Segment value', kind: 'free', usedIn: ['campaign'], note: 'Free text (part of the Campaign Name formula)' },
  { key: 'campaign_dates', abbreviation: 'cpgn_dt', label: 'Campaign dates', kind: 'free', usedIn: ['campaign'], note: 'Year and month for always-on, or a start and end date. Not part of the formula' },
  { key: 'tactic_id', abbreviation: 'tact_id', label: 'Tactic ID', kind: 'system', usedIn: ['tactic', 'utm'], note: 'System-generated, e.g. TACT-2026-0201' },
  { key: 'placement', abbreviation: 'plact_nm', label: 'Placement', kind: 'free', usedIn: ['tactic'], note: 'Free text' },
  { key: 'landing_url', abbreviation: 'url', label: 'Landing page URL', kind: 'free', usedIn: ['tactic', 'utm'], note: 'Free text: the base of the tracking link' },
  { key: 'tactic_dates', abbreviation: 'tact_dt', label: 'Tactic start / end dates', kind: 'free', usedIn: ['tactic'], note: 'Free text (dates)' },
  { key: 'utm_medium', abbreviation: 'utm_medium', label: 'utm_medium', kind: 'derived', usedIn: ['utm'], note: 'Derived from the tactic channel (chnl)' },
  { key: 'utm_campaign', abbreviation: 'utm_campaign', label: 'utm_campaign', kind: 'derived', usedIn: ['utm'], note: 'Derived from the Campaign ID' },
  { key: 'utm_term', abbreviation: 'utm_term', label: 'utm_term', kind: 'derived', usedIn: ['utm'], note: 'The user ID (not the user name), e.g. u40718263: the sending platform fills in the ID of each recipient' },
  { key: 'utm_content', abbreviation: 'utm_content', label: 'utm_content', kind: 'derived', usedIn: ['utm'], note: 'System-generated content ID: us + ct + year + month + a number, e.g. usct202608201' },
];

/** The headline of the history entry once a change has been approved. */
const ACTION_OF: Record<ChangeType, string> = {
  add_field: 'New field added',
  add_value: 'New attribute added',
  update_value: 'Attribute updated',
  remove_value: 'Attribute removed',
  update_owner: 'Business owner changed',
};

/** The headline while the change is still only a request. */
const REQUEST_OF: Record<ChangeType, string> = {
  add_field: 'New field requested',
  add_value: 'New attribute requested',
  update_value: 'Attribute update requested',
  remove_value: 'Attribute removal requested',
  update_owner: 'Business owner change requested',
};

// ---- history of the initial dictionary --------------------------------------------------------
// About half of the fields come with a short history, so the audit log isn't empty from day one. It is
// generated from the fields' own data (their attributes' dates and updaters) with the same stable hash,
// so what the history says always matches the "last updated" columns.

const APPROVERS = ['Marcus Vance', 'Alexis Thorne'];
const HOUR = 3600000;

function seedHistory(fields: DictField[]): { fields: DictField[]; log: DictLogEntry[] } {
  const log: DictLogEntry[] = [];
  const out = fields.map(f => {
    if (hash(`hist|${f.key}`) % 2 !== 0) return f; // the other half starts without history
    const entries: DictLogEntry[] = [];
    let latestBy = f.updatedBy;
    let latestAt = f.updatedAt;
    const add = (kind: ChangeType, detail: string, attribute: string | undefined, by: string, approvedBy: string, ts: number, tag: string) => {
      const requestedAt = new Date(ts - (3 + (hash(`rq|${tag}`) % 38)) * HOUR).toISOString();
      entries.push({ id: `dlog-seed-${f.key}-${tag}-r`, ts: requestedAt, fieldKey: f.key, fieldLabel: f.label, attribute, action: REQUEST_OF[kind], by, detail: `${detail} Waiting for approval.` });
      entries.push({ id: `dlog-seed-${f.key}-${tag}-a`, ts: new Date(ts).toISOString(), fieldKey: f.key, fieldLabel: f.label, attribute, action: ACTION_OF[kind], by, approvedBy, detail: `${detail} Requested by ${by}, approved by ${approvedBy}.` });
    };

    let oldest = Infinity;
    if (f.attributes.length > 0) {
      // the most recently updated attribute first (so the field's "last updated" matches), then one more
      const sorted = [...f.attributes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const chosen = [sorted[0]];
      if (sorted.length > 1 && hash(`h2|${f.key}`) % 3 !== 0) chosen.push(sorted[1 + (hash(`h3|${f.key}`) % (sorted.length - 1))]);
      chosen.forEach((a, i) => {
        const ts = new Date(a.updatedAt).getTime();
        oldest = Math.min(oldest, ts);
        add('add_value', describeChange({ type: 'add_value', value: a.value }, f.label), a.value, a.updatedBy, APPROVERS[hash(`ap|${f.key}|${a.value}`) % APPROVERS.length], ts, `v${i}`);
      });
      latestBy = sorted[0].updatedBy;
      latestAt = sorted[0].updatedAt;
    }
    // some fields (and every field without attributes) also had their business owner set
    if (f.attributes.length === 0 || hash(`ho|${f.key}`) % 3 === 0) {
      const base = Number.isFinite(oldest) ? oldest : new Date(f.updatedAt).getTime();
      const ts = base - (Number.isFinite(oldest) ? 20 + (hash(`hd|${f.key}`) % 100) : 0) * 86400000;
      const by = pick(`hob|${f.key}`);
      add('update_owner', describeChange({ type: 'update_owner', owner: f.owner }, f.label, [pick(`prevown|${f.key}`), pick(`prevown2|${f.key}`)].find(o => o !== f.owner)), undefined, by, APPROVERS[hash(`hoa|${f.key}`) % APPROVERS.length], ts, 'own');
      if (f.attributes.length === 0) {
        latestBy = by;
        latestAt = new Date(ts).toISOString();
      }
    }
    log.push(...entries);
    return { ...f, updatedBy: latestBy, updatedAt: latestAt };
  });
  log.sort((a, b) => b.ts.localeCompare(a.ts));
  return { fields: out, log };
}

function seedState(): DictState {
  const fields: DictField[] = KITE_DICTIONARY_SEED.map(f => {
    const attributes = f.values.map(v => ({ value: v, updatedBy: pick(`by|${f.key}|${v}`), updatedAt: randomDate(`at|${f.key}|${v}`) }));
    // a field was last updated when its most recently updated attribute was
    const latest = attributes.map(a => a.updatedAt).sort().pop() || randomDate(`at|${f.key}`);
    return {
      key: f.key,
      abbreviation: f.abbreviation,
      label: f.label,
      kind: 'dictionary' as const,
      usedIn: USAGE[f.key] || [],
      owner: pick(`owner|${f.key}`),
      updatedBy: pick(`by|${f.key}`),
      updatedAt: latest,
      attributes,
    };
  });
  EXTRAS.forEach(e =>
    fields.push({
      key: e.key,
      abbreviation: e.abbreviation,
      label: e.label,
      kind: e.kind,
      usedIn: e.usedIn,
      owner: pick(`owner|${e.key}`),
      updatedBy: pick(`by|${e.key}`),
      updatedAt: randomDate(`at|${e.key}`),
      attributes: [],
      note: e.note,
    })
  );
  const seeded = seedHistory(fields);
  return { fields: seeded.fields, changes: [], log: seeded.log, notifications: [] };
}

// ---------------------------------------------------------------------------------------------
// store
// ---------------------------------------------------------------------------------------------

const LS_KEY = 'tagging360.dictionary.v1';

function load(): DictState {
  const seed = seedState();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seed;
    // people are named without titles now ("Dr. Marcus Vance" → "Marcus Vance")
    const stored = JSON.parse(raw.replace(/Dr\. Marcus Vance/g, 'Marcus Vance')) as DictState;
    if (!stored || !Array.isArray(stored.fields)) return seed;
    // a field added to the seed after this snapshot was saved still has to show up
    const have = new Set(stored.fields.map(f => f.key));
    const seedBy = new Map(seed.fields.map(f => [f.key, f]));
    // fields that real users have changed keep their own details; the rest follow the seeded history
    const touched = new Set((stored.log || []).filter(l => !l.id.startsWith('dlog-seed-')).map(l => l.fieldKey));
    // derived / system / free-text fields that are no longer part of the portal (e.g. utm_source) drop out;
    // fields users added themselves are kept
    const current = stored.fields.filter(f => !f.key.startsWith('pld_') && (seedBy.has(f.key) || f.kind === 'dictionary'));
    // fields nobody has touched yet pick up the current initial owner / updater
    const refreshed = current.map(f => {
      const sf = seedBy.get(f.key);
      if (!sf) return f;
      return {
        ...f,
        label: sf.label,
        note: f.kind === 'dictionary' ? f.note : sf.note,
        usedIn: sf.usedIn,
        owner: f.owner === OLD_DEFAULT_OWNER ? sf.owner : clean(f.owner),
        updatedBy: touched.has(f.key) ? clean(f.updatedBy) : sf.updatedBy,
        updatedAt: touched.has(f.key) ? f.updatedAt : sf.updatedAt,
        attributes: f.attributes.map(a => {
          const sa = sf.attributes.find(x => x.value === a.value);
          const next = a.updatedBy === OLD_INITIAL_BY && sa ? { ...a, updatedBy: sa.updatedBy } : { ...a, updatedBy: clean(a.updatedBy), owner: a.owner ? clean(a.owner) : a.owner };
          return a.updatedAt === INITIAL_AT && sa ? { ...next, updatedAt: sa.updatedAt } : next;
        }),
      };
    });
    return {
      fields: [...refreshed, ...seed.fields.filter(f => !have.has(f.key))],
      changes: (stored.changes || []).filter(c => !c.fieldKey.startsWith('pld_')),
      // the seeded history is (re)added in front of whatever real activity has been logged since
      log: [...(stored.log || []).filter(l => !l.id.startsWith('dlog-seed-')), ...seed.log].sort((a, b) => b.ts.localeCompare(a.ts)),
      notifications: stored.notifications || [],
    };
  } catch {
    return seed;
  }
}

let state: DictState = load();
const listeners = new Set<() => void>();

function commit(next: DictState) {
  state = next;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — changes just won't survive a reload */
  }
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_KEY) {
      state = load();
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export function useDictionary(): DictState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function resetDictionary() {
  commit(seedState());
}

/** Approved attribute values of a field, right now (for code that is not a React component). */
export function dictValues(key: string): string[] {
  return (state.fields.find(f => f.key === key)?.attributes || []).map(a => a.value);
}

/** Approved attribute values of a field; re-renders when the dictionary changes. */
export function useDictValues(key: string): string[] {
  const s = useDictionary();
  return useMemo(() => (s.fields.find(f => f.key === key)?.attributes || []).map(a => a.value), [s, key]);
}

export function usePendingChangeCount(): number {
  const s = useDictionary();
  return s.changes.filter(c => c.status === 'pending').length;
}

// ---------------------------------------------------------------------------------------------
// change requests + approval
// ---------------------------------------------------------------------------------------------

export interface Actor {
  name: string;
  role: string;
}

/** Roles that may approve or reject a change. Nobody approves their own. */
export const APPROVER_ROLES = ['marketer', 'superadmin'];
export const canApprove = (actor: Actor | null | undefined) => !!actor && APPROVER_ROLES.includes(actor.role);

let seq = 0;
const newId = (p: string) => `${p}-${Date.now()}-${++seq}`;
const nowIso = () => new Date().toISOString();
const ci = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export type ProposalInput = Pick<DictChange, 'fieldKey' | 'type' | 'value' | 'newValue' | 'owner' | 'reason' | 'field' | 'abbreviation' | 'attrOwner'>;

/** Roles that may add a field without anyone approving it (the brand). Others need the brand's approval. */
export const DIRECT_ADD_ROLES = ['marketer', 'superadmin'];
export const canAddFieldDirectly = (actor: Actor | null | undefined) => !!actor && DIRECT_ADD_ROLES.includes(actor.role);

const slugKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'field';

/** Business owners already in the dictionary — offered when someone adds a field. */
export const knownOwners = (): string[] => Array.from(new Set(state.fields.map(f => f.owner))).sort();

export function proposeChange(input: ProposalInput, actor: Actor): { ok: boolean; error?: string; applied?: boolean; notified?: string[] } {
  // ---------------------------------------------------------------- a new field
  if (input.type === 'add_field') {
    const nf = input.field;
    if (!nf) return { ok: false, error: 'Enter the field details.' };
    const label = nf.label.trim();
    const abbreviation = nf.abbreviation.trim();
    const owner = nf.owner.trim();
    if (!label) return { ok: false, error: 'Enter the field name.' };
    if (!abbreviation) return { ok: false, error: 'Enter the abbreviation.' };
    if (!owner) return { ok: false, error: 'Enter the business owner.' };
    if (state.fields.some(f => ci(f.label, label))) return { ok: false, error: `A field called “${label}” already exists.` };
    if (state.fields.some(f => ci(f.abbreviation, abbreviation) || ci(f.key, abbreviation)))
      return { ok: false, error: `The abbreviation “${abbreviation}” is already used by another field.` };
    if (state.changes.some(c => c.status === 'pending' && c.type === 'add_field' && (ci(c.field?.label || '', label) || ci(c.field?.abbreviation || '', abbreviation))))
      return { ok: false, error: 'A request to add this field is already waiting for approval.' };
    const seen = new Set<string>();
    const attributes: NewAttribute[] = [];
    for (const a of nf.attributes) {
      const value = a.value.trim();
      if (!value) continue;
      if (seen.has(value.toLowerCase())) return { ok: false, error: `“${value}” is listed twice.` };
      seen.add(value.toLowerCase());
      attributes.push({ value, abbreviation: a.abbreviation?.trim() || undefined, owner: a.owner?.trim() || undefined });
    }
    const clean: NewField = { label, abbreviation, owner, usedIn: nf.usedIn, attributes };
    const ts = nowIso();

    // the brand (marketer / administrator) adds a field directly: no approval, but the agency and the field owner are told
    if (canAddFieldDirectly(actor)) {
      const key = uniqueKey(slugKey(label));
      commit({
        ...state,
        fields: [...state.fields, buildField(key, clean, actor.name, ts)],
        log: [
          {
            id: newId('dlog'),
            ts,
            fieldKey: key,
            fieldLabel: label,
            action: ACTION_OF.add_field,
            by: actor.name,
            approvedBy: 'Not required',
            detail: `${describeChange({ type: 'add_field', field: clean })} Added directly by ${actor.name}; no approval needed.`,
          },
          ...state.log,
        ],
        notifications: [
          notification(key, label, 'Field added', `${actor.name} added the field “${label}” (${abbreviation}) with ${attributes.length} attribute${attributes.length === 1 ? '' : 's'}.`, [
            { kind: 'agency', label: 'Agency (all agency users)' },
            { kind: 'owner', label: `Business owner: ${owner}` },
          ]),
          ...state.notifications,
        ],
      });
      return { ok: true, applied: true, notified: ['the agency', owner] };
    }

    // an agency (or anyone else) asks: the brand has to approve it
    const change: DictChange = {
      id: newId('dchg'),
      fieldKey: `new_${slugKey(label)}`,
      type: 'add_field',
      field: clean,
      reason: (input.reason || '').trim() || undefined,
      status: 'pending',
      requestedBy: actor.name,
      requestedAt: ts,
    };
    commit({
      ...state,
      changes: [change, ...state.changes],
      log: [
        { id: newId('dlog'), ts, fieldKey: change.fieldKey, fieldLabel: label, action: REQUEST_OF.add_field, by: actor.name, detail: `${describeChange(change)} Waiting for the brand's approval.` },
        ...state.log,
      ],
      notifications: [
        notification(change.fieldKey, label, 'Approval needed', `${actor.name} asked to add the field “${label}” (${abbreviation}). It needs the brand's approval.`, [
          { kind: 'brand', label: 'Brand (marketers)' },
        ]),
        ...state.notifications,
      ],
    });
    return { ok: true, notified: ['the brand'] };
  }

  // ---------------------------------------------------------------- a change to an existing field
  const field = state.fields.find(f => f.key === input.fieldKey);
  if (!field) return { ok: false, error: 'That field does not exist.' };
  const value = (input.value || '').trim();
  const newValue = (input.newValue || '').trim();
  const owner = (input.owner || '').trim();
  const abbr = (input.abbreviation || '').trim();
  const attrOwner = (input.attrOwner || '').trim();

  if (input.type === 'add_value') {
    if (!value) return { ok: false, error: 'Enter the new value.' };
    if (field.attributes.some(a => ci(a.value, value))) return { ok: false, error: `“${value}” is already in ${field.label}.` };
  }
  if (input.type === 'update_value') {
    if (!value || !newValue) return { ok: false, error: 'Enter the new value.' };
    const cur = field.attributes.find(a => a.value === value);
    if (value === newValue && abbr === (cur?.abbreviation || '') && attrOwner === (cur?.owner || '')) return { ok: false, error: 'Nothing has changed.' };
    if (field.attributes.some(a => ci(a.value, newValue) && !ci(a.value, value))) return { ok: false, error: `“${newValue}” is already in ${field.label}.` };
  }
  if (input.type === 'remove_value' && !field.attributes.some(a => a.value === value)) {
    return { ok: false, error: 'That value is not in the field.' };
  }
  if (input.type === 'update_owner') {
    if (!owner) return { ok: false, error: 'Enter the business owner.' };
    if (owner === field.owner) return { ok: false, error: 'That is already the business owner.' };
  }
  const dup = state.changes.some(
    c => c.status === 'pending' && c.fieldKey === input.fieldKey && c.type === input.type && (c.value || '') === value && (c.newValue || '') === newValue && (c.owner || '') === owner && (c.abbreviation || '') === abbr && (c.attrOwner || '') === attrOwner
  );
  if (dup) return { ok: false, error: 'The same change is already waiting for approval.' };

  const change: DictChange = {
    id: newId('dchg'),
    fieldKey: input.fieldKey,
    type: input.type,
    value: value || undefined,
    newValue: newValue || undefined,
    owner: owner || undefined,
    abbreviation: abbr || undefined,
    attrOwner: attrOwner || undefined,
    reason: (input.reason || '').trim() || undefined,
    status: 'pending',
    requestedBy: actor.name,
    requestedAt: nowIso(),
  };
  commit({
    ...state,
    changes: [change, ...state.changes],
    log: [
      {
        id: newId('dlog'),
        ts: change.requestedAt,
        fieldKey: field.key,
        fieldLabel: field.label,
        attribute: value || undefined,
        action: REQUEST_OF[change.type],
        by: actor.name,
        detail: `${describeChange(change, field.label, field.owner)} Waiting for approval.`,
      },
      ...state.log,
    ],
  });
  return { ok: true };
}

function uniqueKey(base: string): string {
  let key = base;
  let n = 2;
  while (state.fields.some(f => f.key === key)) key = `${base}_${n++}`;
  return key;
}

function buildField(key: string, nf: NewField, by: string, ts: string): DictField {
  return {
    key,
    abbreviation: nf.abbreviation,
    label: nf.label,
    kind: 'dictionary',
    usedIn: nf.usedIn,
    owner: nf.owner,
    updatedBy: by,
    updatedAt: ts,
    attributes: nf.attributes.map(a => ({ value: a.value, abbreviation: a.abbreviation, owner: a.owner, updatedBy: by, updatedAt: ts })),
    note: 'Added to the dictionary after the initial load. It reaches a form once it is connected to one.',
  };
}

function notification(
  fieldKey: string,
  fieldLabel: string,
  event: string,
  message: string,
  recipients: { kind: RecipientKind; label: string }[],
  requester?: string
): DictNotification {
  const roles = new Set<string>();
  const names = new Set<string>();
  recipients.forEach(r => {
    if (r.kind === 'agency') roles.add('agency');
    // business owners are teams, not accounts: Kite-side users act on their behalf
    if (r.kind === 'owner') ['marketer', 'analytics', 'superadmin'].forEach(x => roles.add(x));
    if (r.kind === 'brand') ['marketer', 'superadmin'].forEach(x => roles.add(x));
    if (r.kind === 'requester' && requester) names.add(requester);
  });
  return { id: newId('dnote'), ts: nowIso(), fieldKey, fieldLabel, event, message, recipients, audienceRoles: [...roles], audienceNames: [...names], readBy: [] };
}

/** A plain sentence saying what a change does. `fieldLabel` / `prevOwner` add context when the caller has them. */
export function describeChange(
  c: Pick<DictChange, 'type'> & Partial<Pick<DictChange, 'value' | 'newValue' | 'owner' | 'field' | 'abbreviation' | 'attrOwner'>>,
  fieldLabel?: string,
  prevOwner?: string
): string {
  const extras = [c.abbreviation ? `abbreviation “${c.abbreviation}”` : '', c.attrOwner ? `owner “${c.attrOwner}”` : ''].filter(Boolean).join(', ');
  const inField = fieldLabel ? ` in the field “${fieldLabel}”` : '';
  switch (c.type) {
    case 'add_field': {
      const attrs = c.field?.attributes || [];
      const list = attrs.length ? `: ${attrs.map(a => a.value).join(', ')}` : '';
      return `New field “${c.field?.label}” (${c.field?.abbreviation}) created with ${attrs.length} attribute${attrs.length === 1 ? '' : 's'}${list}. Business owner: ${c.field?.owner || 'not set'}.`;
    }
    case 'add_value':
      return `New attribute “${c.value}” added${fieldLabel ? ` to the field “${fieldLabel}”` : ''}${extras ? `: ${extras}` : ''}.`;
    case 'update_value':
      return c.value === c.newValue
        ? `Details of the attribute “${c.value}” updated${inField}${extras ? `: now ${extras}` : ''}.`
        : `Attribute “${c.value}” renamed to “${c.newValue}”${inField}${extras ? `: ${extras}` : ''}.`;
    case 'remove_value':
      return `Attribute “${c.value}” removed${fieldLabel ? ` from the field “${fieldLabel}”` : ''}.`;
    case 'update_owner':
      return `Business owner${fieldLabel ? ` of the field “${fieldLabel}”` : ''} changed${prevOwner ? ` from “${prevOwner}”` : ''} to “${c.owner}”.`;
  }
}


export function reviewChange(
  id: string,
  decision: 'approved' | 'rejected',
  reviewer: Actor,
  comment?: string
): { ok: boolean; error?: string; notified?: string[] } {
  const change = state.changes.find(c => c.id === id);
  if (!change || change.status !== 'pending') return { ok: false, error: 'That change is no longer pending.' };
  if (!canApprove(reviewer)) return { ok: false, error: 'You do not have permission to approve dictionary changes.' };
  if (reviewer.name === change.requestedBy) return { ok: false, error: 'You cannot approve your own change.' };
  if (decision === 'rejected' && !(comment || '').trim()) return { ok: false, error: 'Add a comment explaining the rejection.' };

  const ts = nowIso();
  const reviewed: DictChange = { ...change, status: decision, reviewedBy: reviewer.name, reviewedAt: ts, comment: (comment || '').trim() || undefined };
  const isNewField = change.type === 'add_field' && !!change.field;
  const existing = state.fields.find(f => f.key === change.fieldKey);
  let fields = state.fields;
  let fieldKey = change.fieldKey;
  let fieldLabel = isNewField ? change.field!.label : existing?.label || change.fieldKey;
  // the business owner to tell: the owner of the field (the new field's owner when it is being added)
  let owner = isNewField ? change.field!.owner : existing?.owner || '';

  if (decision === 'approved') {
    if (isNewField) {
      fieldKey = uniqueKey(slugKey(change.field!.label));
      // the field is created in the name of whoever asked for it
      fields = [...state.fields, buildField(fieldKey, change.field!, change.requestedBy, ts)];
    } else if (existing) {
      const touched = { updatedBy: change.requestedBy, updatedAt: ts };
      const updated: DictField = { ...existing, ...touched };
      if (change.type === 'add_value') updated.attributes = [...existing.attributes, { value: change.value!, abbreviation: change.abbreviation, owner: change.attrOwner, ...touched }];
      if (change.type === 'update_value') updated.attributes = existing.attributes.map(a => (a.value === change.value ? { ...a, value: change.newValue!, abbreviation: change.abbreviation, owner: change.attrOwner, ...touched } : a));
      if (change.type === 'remove_value') updated.attributes = existing.attributes.filter(a => a.value !== change.value);
      if (change.type === 'update_owner') updated.owner = change.owner!;
      fields = state.fields.map(f => (f.key === existing.key ? updated : f));
      owner = updated.owner;
    }
  }

  const what = describeChange(change, isNewField ? undefined : fieldLabel, existing?.owner).replace(/\.$/, '');
  const verdict = decision === 'approved' ? 'approved' : 'rejected';
  const note = decision === 'approved' ? ACTION_OF[change.type] : `${REQUEST_OF[change.type].replace(/ requested$/, '')} rejected`;
  const recipients: { kind: RecipientKind; label: string }[] = [
    { kind: 'owner', label: `Business owner: ${owner || 'not set'}` },
    { kind: 'requester', label: `Requester: ${change.requestedBy}` },
  ];

  commit({
    fields,
    changes: state.changes.map(c => (c.id === id ? reviewed : c)),
    log: [
      {
        id: newId('dlog'),
        ts,
        fieldKey,
        fieldLabel,
        attribute: change.value || undefined,
        action: note,
        by: change.requestedBy,
        approvedBy: decision === 'approved' ? reviewer.name : undefined,
        detail:
          decision === 'approved'
            ? `${what}. Requested by ${change.requestedBy}, approved by ${reviewer.name}.`
            : `${what}. Requested by ${change.requestedBy}, rejected by ${reviewer.name}: ${reviewed.comment}`,
      },
      ...state.log,
    ],
    notifications: [
      notification(
        fieldKey,
        fieldLabel,
        note,
        `${reviewer.name} ${verdict} the request from ${change.requestedBy}: ${what}.${reviewed.comment ? ` Comment: ${reviewed.comment}` : ''}`,
        recipients,
        change.requestedBy
      ),
      ...state.notifications,
    ],
  });
  return { ok: true, notified: [owner, change.requestedBy].filter(Boolean) };
}

// ---------------------------------------------------------------------------------------------
// notifications
// ---------------------------------------------------------------------------------------------

const addressedTo = (n: DictNotification, user: Actor) => n.audienceRoles.includes(user.role) || n.audienceNames.includes(user.name);

/** The notifications addressed to this user (newest first) and how many they have not read. */
export function useNotifications(user: Actor | null | undefined): { items: DictNotification[]; unread: number } {
  const s = useDictionary();
  return useMemo(() => {
    const items = user ? s.notifications.filter(n => addressedTo(n, user)) : [];
    return { items, unread: user ? items.filter(n => !n.readBy.includes(user.name)).length : 0 };
  }, [s, user?.name, user?.role]);
}

export function markNotificationsRead(user: Actor) {
  if (!state.notifications.some(n => addressedTo(n, user) && !n.readBy.includes(user.name))) return;
  commit({
    ...state,
    notifications: state.notifications.map(n => (addressedTo(n, user) && !n.readBy.includes(user.name) ? { ...n, readBy: [...n.readBy, user.name] } : n)),
  });
}

// ---------------------------------------------------------------------------------------------
// how the flows use the dictionary
// ---------------------------------------------------------------------------------------------

/** The portal's own channel category for a dictionary channel (chnl) value. */
const CHANNEL_TYPE_OF: Record<string, MediaChannelType> = {
  '3P SMS': 'Digital',
  '3P EMAIL': 'Digital',
  EMAIL: 'Email',
  SOCIAL: 'Social',
  DISPLAY: 'Digital',
  RTE: 'Email',
  WEB: 'Website',
};
export const channelTypeOf = (chnl: string): MediaChannelType => CHANNEL_TYPE_OF[chnl.trim().toUpperCase()] || 'Digital';

const CHANNEL_OF_TYPE: Partial<Record<MediaChannelType, string>> = {
  Digital: 'DISPLAY',
  Social: 'SOCIAL',
  Email: 'EMAIL',
  Website: 'WEB',
};
/** Best dictionary channel for an older record that only knows the portal category ('' when unclear). */
export const channelFromType = (t: MediaChannelType | undefined): string => (t ? CHANNEL_OF_TYPE[t] || '' : '');

/** Campaign form field → the dictionary field that supplies its dropdown. */
export const FORMULA_FIELD_KEY: Record<string, string> = {
  country: 'country',
  ta: 'ta',
  product: 'brd',
  indication: 'indc',
  messagingType: 'messaging_type',
  audience: 'target',
  campaignType: 'alrt_typ',
  objective: 'objective',
};

const ALIASES: Record<string, Record<string, string>> = {
  indication: { lbcl: 'DLBCL' },
  campaignType: { specific: 'Marketing led', always_on: 'Always On' },
  product: { yes: 'YESCARTA', tec: 'TECARTUS' },
};

/** Match older saved values (e.g. "LBCL", "Always on", "YES") to the dictionary's spelling. */
export function canonicalizeFormulaInputs(inputs: Record<string, string>): Record<string, string> {
  const out = { ...inputs };
  Object.entries(FORMULA_FIELD_KEY).forEach(([formKey, dictKey]) => {
    const raw = out[formKey];
    if (!raw) return;
    const values = dictValues(dictKey);
    const alias = ALIASES[formKey]?.[raw.trim().toLowerCase()];
    const target = alias || raw;
    const hit = values.find(v => ci(v, target));
    if (hit) out[formKey] = hit;
  });
  return out;
}

/** Is this campaign type the always-on kind (a year/month, rather than a dated range)? */
export const isAlwaysOnType = (campaignType: string) => ci(campaignType, 'Always On');

/** The dictionary's spelling of a brand (Yescarta® → YESCARTA), or the brand code when it isn't listed. */
export function dictBrandValue(brandName: string, fallbackCode: string): string {
  const short = brandName.split(/[ (®™]/)[0];
  return dictValues('brd').find(v => ci(v, short)) || fallbackCode;
}
