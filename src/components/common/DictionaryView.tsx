import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Bell,
  PlusCircle,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  History,
  Info,
  Maximize2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Pagination, usePaged, useFitRows } from './Pagination';
import { usePersona } from '../../context/PersonaContext';
import {
  ChangeType,
  DictChange,
  DictField,
  DictLogEntry,
  DictNotification,
  DictUse,
  NewField,
  canAddFieldDirectly,
  canApprove,
  knownOwners,
  markNotificationsRead,
  useNotifications,
  describeChange,
  proposeChange,
  reviewChange,
  useDictionary,
} from '../../data/kiteDictionary';

type Tab = 'dictionary' | 'pending' | 'notifications';

const USE_LABEL: Record<DictUse, string> = { campaign: 'Campaign', tactic: 'Tactic', utm: 'UTM' };
const USE_CLS: Record<DictUse, string> = {
  campaign: 'bg-navy-50 text-navy-800 border-navy-200',
  tactic: 'bg-teal-50 text-teal-800 border-teal-200',
  utm: 'bg-amber-50 text-amber-800 border-amber-200',
};
const KIND_LABEL: Record<DictField['kind'], string> = {
  dictionary: 'Dictionary',
  free: 'Free text',
  system: 'System-generated',
  derived: 'Derived',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const TH = 'text-left text-[10px] font-bold text-navy-800 uppercase tracking-wider px-3 py-2 whitespace-nowrap';
const TD = 'px-3 py-2 text-xs text-slate-700 align-top';
const ATH = 'text-left text-[10px] font-semibold text-navy-800 uppercase tracking-wider px-3 py-2 whitespace-nowrap';

// owners and teams share the one theme tint: quiet, and the text does the work
const OwnerChip: React.FC<{ name: string }> = ({ name }) => (
  <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-navy-50 text-navy-700 whitespace-nowrap">{name}</span>
);
const UpdaterCell: React.FC<{ name: string }> = ({ name }) => <span className="whitespace-nowrap">{name}</span>;
const INPUT =
  'w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-navy-500 font-medium';

// ---- notifications: what kind of notice it is, and the short version of it ----------------------
type NoteKindId = 'pending' | 'approved' | 'rejected' | 'added';
const NOTE_FILTERS: { id: 'all' | NoteKindId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Needs approval' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'added', label: 'Added directly' },
];
const noteKind = (n: DictNotification): { id: NoteKindId; title: string; icon: typeof Check; cls: string } => {
  if (/rejected the request/.test(n.message)) return { id: 'rejected', title: n.event, icon: X, cls: 'bg-red-50 text-red-600' };
  if (/approved the request/.test(n.message)) return { id: 'approved', title: n.event, icon: Check, cls: 'bg-emerald-50 text-emerald-600' };
  if (/asked to|needs the brand/i.test(n.message) || /approval needed/i.test(n.event)) return { id: 'pending', title: n.event, icon: Clock, cls: 'bg-amber-50 text-amber-600' };
  return { id: 'added', title: n.event, icon: Plus, cls: 'bg-navy-50 text-navy-600' };
};
/** One line with just the change and who decided — the field is shown beside it already. */
const noteSummary = (n: DictNotification): string => {
  const m = n.message.match(/^(.+?) (approved|rejected) the request from (.+?): (.+?)\.(?: Comment: (.*))?$/);
  const strip = (t: string) => t.replace(/ (to|in|from|of) the field “[^”]*”/g, '').trim();
  if (m) {
    const [, reviewer, verdict, , what, comment] = m;
    if (verdict === 'rejected') {
      // the change never happened: name the value, who said no, and why
      const value = what.match(/“[^”]*”/)?.[0] || strip(what);
      return `${value} · rejected by ${reviewer}${comment ? `: ${comment.replace(/\.$/, '')}` : ''}`;
    }
    return `${strip(what)} · approved by ${reviewer}`;
  }
  return strip(n.message);
};
/** Quoted values (attribute names, fields, owners) are what people look for: make them stand out. */
const emphasise = (t: string): React.ReactNode =>
  t.split(/(“[^”]*”)/).map((part, i) =>
    part.startsWith('“') ? (
      <strong key={i} className="font-semibold text-slate-800">
        {part}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
const DAY = 86400000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const relTime = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return 'Just now';
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < DAY && startOfDay(new Date(iso)) === startOfDay(new Date())) return `${Math.floor(ms / 3600000)}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};
const dayGroup = (iso: string): string => {
  const d = startOfDay(new Date(iso));
  const today = startOfDay(new Date());
  if (d === today) return 'Today';
  if (d === today - DAY) return 'Yesterday';
  return 'Earlier';
};


interface Proposal {
  fieldKey: string;
  type: ChangeType;
  value?: string;
}

export const DictionaryView: React.FC<{ initialTab?: Tab; embedded?: boolean; hideHeader?: boolean }> = ({ initialTab = 'dictionary', embedded = false, hideHeader = false }) => {
  const { user } = useAuth();
  const { showToast } = usePersona();
  const dict = useDictionary();
  const actor = user ? { name: user.name, role: user.role } : null;
  const approver = canApprove(actor);

  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [tab, setTab] = useState<Tab>(!embedded && urlTab === 'notifications' ? 'notifications' : initialTab);
  // a link from Content MDM / Journey Metadata (?add=<abbreviation>&label=<name>) opens "Add field" filled in
  const [addingField, setAddingField] = useState(!embedded && !!searchParams.get('add'));
  const addPrefill = { abbreviation: searchParams.get('add') || '', label: searchParams.get('label') || '' };
  const { items: notes, unread } = useNotifications(actor);
  const [query, setQuery] = useState('');
  const [usedFilter, setUsedFilter] = useState<'all' | DictUse>('all');
  // the field whose attributes are open in the full view
  const [viewing, setViewing] = useState<string | null>(null);
  const [attrQuery, setAttrQuery] = useState('');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  // the field whose history is open in the floating window
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const [noteFilter, setNoteFilter] = useState<'all' | NoteKindId>('all');
  const [openNote, setOpenNote] = useState<Record<string, boolean>>({});
  // the notices that were unread when the tab was opened stay marked "new" while it is open
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [needsNote, setNeedsNote] = useState<Record<string, boolean>>({});

  // opening the notifications marks them read for this user
  useEffect(() => {
    if (tab === 'notifications' && actor && unread > 0) {
      setFreshIds(new Set(notes.filter(n => !n.readBy.includes(actor.name)).map(n => n.id)));
      markNotificationsRead(actor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, unread, actor?.name]);

  const shownNotes = notes.filter(n => noteFilter === 'all' || noteKind(n).id === noteFilter);
  const noteGroups = ['Today', 'Yesterday', 'Earlier']
    .map(label => ({ label, items: shownNotes.filter(n => dayGroup(n.ts) === label) }))
    .filter(g => g.items.length > 0);

  const pending = dict.changes.filter(c => c.status === 'pending');
  const decided = dict.changes.filter(c => c.status !== 'pending');
  const pendingOf = (key: string) => pending.filter(c => c.fieldKey === key);
  const fieldLabel = (key: string) => dict.fields.find(f => f.key === key)?.label || key;
  // a request to add a field has no field in the dictionary yet — it carries its own name
  const changeLabel = (c: DictChange) => c.field?.label || fieldLabel(c.fieldKey);
  const changeAbbr = (c: DictChange) => c.field?.abbreviation || dict.fields.find(f => f.key === c.fieldKey)?.abbreviation || '';

  const fields = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dict.fields.filter(f => {
      if (usedFilter !== 'all' && !f.usedIn.includes(usedFilter)) return false;
      if (!q) return true;
      return (
        f.label.toLowerCase().includes(q) ||
        f.abbreviation.toLowerCase().includes(q) ||
        f.owner.toLowerCase().includes(q) ||
        f.attributes.some(a => a.value.toLowerCase().includes(q))
      );
    });
  }, [dict.fields, query, usedFilter]);

  // the field table is paged so the page itself never has to scroll
  // as many fields a page as fit on the screen, so the page itself never scrolls
  const fieldListRef = useRef<HTMLDivElement>(null);
  const dictPageSize = useFitRows(fieldListRef, 8);
  const fieldPage = usePaged<DictField>(fields, dictPageSize, `${query}|${usedFilter}`);

  const openView = (key: string) => {
    setAttrQuery('');
    setViewing(key);
  };
  const vf = viewing ? dict.fields.find(f => f.key === viewing) : undefined;
  const vq = attrQuery.trim().toLowerCase();
  const vAttrs = vf ? vf.attributes.filter(a => !vq || a.value.toLowerCase().includes(vq)) : [];
  const vPend = vf ? pendingOf(vf.key) : [];
  // Escape closes the full view, unless a dialog on top of it is open
  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !proposal && !historyFor && setViewing(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [viewing, proposal, historyFor]);

  const decide = (c: DictChange, decision: 'approved' | 'rejected') => {
    if (!actor) return;
    const note = (rejectNote[c.id] || '').trim();
    if (decision === 'rejected' && !note) {
      setNeedsNote(p => ({ ...p, [c.id]: true }));
      showToast('Please add a comment explaining the rejection.', 'error');
      return;
    }
    const res = reviewChange(c.id, decision, actor, note);
    if (!res.ok) showToast(res.error || 'Could not record the decision.', 'error');
    else {
      const told = res.notified?.length ? ` ${res.notified.join(' and ')} notified.` : '';
      showToast(`${decision === 'approved' ? (c.type === 'add_field' ? 'Field approved and added.' : 'Change approved and applied.') : 'Change rejected.'}${told}`, decision === 'approved' ? 'success' : 'info');
    }
  };

  const tabBtn = (t: Tab, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => setTab(t)}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
        tab === t ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-5 text-slate-900">
      {!embedded && !hideHeader && (
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            <BookOpen />
            Dictionary and Templates
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            The Kite dictionary: every field, its attributes and abbreviation, who owns it and who last changed it. Changes need approval.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        {tabBtn('dictionary', <BookOpen className="w-4 h-4" />, `Dictionary (${dict.fields.length} fields)`)}
        {tabBtn('pending', <ShieldCheck className="w-4 h-4" />, `Pending changes (${pending.length})`)}
        {tabBtn('notifications', <Bell className="w-4 h-4" />, unread > 0 ? `Notifications (${unread} new)` : 'Notifications')}
      </div>

      {/* ======================= DICTIONARY ======================= */}
      {tab === 'dictionary' && (
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search fields, abbreviations, attributes, owners…"
                aria-label="Search the dictionary"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-navy-500 shadow-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by where a field is used">
              {(['all', 'campaign', 'tactic', 'utm'] as const).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUsedFilter(u)}
                  aria-pressed={usedFilter === u}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    usedFilter === u ? 'bg-navy-600 text-white border-navy-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {u === 'all' ? 'All fields' : `Used in ${USE_LABEL[u]}s`}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAddingField(true)}
              className="lg:ml-auto flex items-center gap-1.5 text-xs font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-xl px-4 py-2 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Add field
            </button>
          </div>

          <div ref={fieldListRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-[56rem] border-collapse">
              <thead className="bg-navy-100 border-b border-navy-200">
                <tr>
                  <th className={`${TH} w-8`} />
                  <th className={TH}>Field</th>
                  <th className={TH}>Abbreviation</th>
                  <th className={TH}>Attributes</th>
                  <th className={TH}>Used in</th>
                  <th className={TH}>Business owner</th>
                  <th className={TH}>Last updated by</th>
                  <th className={TH}>Last updated</th>
                  <th className={`${TH} w-10`}><span className="sr-only">History</span></th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-sm text-slate-400">No fields match.</td>
                  </tr>
                )}
                {fieldPage.items.map(f => {
                  const pend = pendingOf(f.key);
                  return (
                    <React.Fragment key={f.key}>
                      <tr
                        className="border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer"
                        data-row
                        onClick={() => openView(f.key)}
                        title={`View ${f.label}`}
                      >
                        <td className={TD}>
                          <button
                            type="button"
                            aria-label={`View ${f.label} attributes`}
                            className="text-slate-400 hover:text-navy-700"
                            onClick={e => {
                              e.stopPropagation();
                              openView(f.key);
                            }}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className={`${TD} font-semibold text-slate-800`}>
                          {f.label}
                          {pend.length > 0 && (
                            <span className="ml-2 text-[9px] font-bold uppercase px-1.5 py-px rounded-full border bg-amber-100 text-amber-800 border-amber-200">
                              {pend.length} pending
                            </span>
                          )}
                          <div className="text-[10px] font-normal text-slate-400">{KIND_LABEL[f.kind]}</div>
                        </td>
                        <td className={`${TD} font-mono font-medium text-navy-600`}>{f.abbreviation}</td>
                        <td className={TD}>
                          {f.kind === 'dictionary' ? (
                            <span className="inline-flex items-center gap-2">
                              {f.attributes.length}
                              <span className="text-[11px] font-semibold text-navy-600 hover:underline">View all</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className={TD}>
                          <div className="flex flex-wrap gap-1">
                            {f.usedIn.length === 0 ? (
                              <span className="text-[10px] text-slate-400">Reference only</span>
                            ) : (
                              f.usedIn.map(u => (
                                <span key={u} className={`text-[9px] font-bold uppercase px-1.5 py-px rounded-full border ${USE_CLS[u]}`}>
                                  {USE_LABEL[u]}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className={TD}><OwnerChip name={f.owner} /></td>
                        <td className={TD}><UpdaterCell name={f.updatedBy} /></td>
                        <td className={`${TD} whitespace-nowrap`}>{fmtDate(f.updatedAt)}</td>
                        <td className={`${TD} text-right`}>
                          <button
                            type="button"
                            title="History"
                            aria-label={`History of ${f.label}`}
                            onClick={e => {
                              e.stopPropagation();
                              setHistoryFor(f.key);
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:text-navy-700 hover:bg-slate-50"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination {...fieldPage} noun="fields" onPage={fieldPage.setPage} />
        </div>
      )}

      {/* ======================= PENDING CHANGES ======================= */}
      {tab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-navy-600" /> Waiting for approval · {pending.length}
            </h3>
            {!approver && (
              <p className="text-[11px] text-slate-500">
                Changes to the dictionary are approved by a marketer or an administrator. You can follow your requests here.
              </p>
            )}
            {pending.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">Nothing is waiting for approval.</p>}
            {pending.map(c => {
              const own = actor?.name === c.requestedBy;
              return (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {changeLabel(c)} <span className="font-mono text-navy-700 font-semibold">({changeAbbr(c)})</span>
                      </div>
                      <div className="text-xs text-slate-700 mt-0.5">{describeChange(c)}</div>
                      {c.field && (
                        <div className="text-[11px] text-slate-500 mt-1 space-y-1">
                          <div>Business owner: <span className="font-semibold text-slate-700">{c.field.owner}</span>{c.field.usedIn.length > 0 && <> · Used in {c.field.usedIn.map(u => USE_LABEL[u]).join(', ')}</>}</div>
                          {c.field.attributes.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                              <table className="w-full border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                    <th className={TH}>Attribute</th>
                                    <th className={TH}>Business owner</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {c.field.attributes.map(a => (
                                    <tr key={a.value} className="border-b border-slate-100 last:border-0">
                                      <td className="px-3 py-1 text-[11px] font-semibold text-slate-800">{a.value}</td>
                                      <td className="px-3 py-1 text-[11px] text-slate-600">{a.owner || c.field!.owner}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                      {c.reason && <div className="text-[11px] text-slate-500 mt-1">Reason: {c.reason}</div>}
                    </div>
                    <div className="text-[11px] text-slate-500 text-right">
                      Requested by <span className="font-bold text-slate-700">{c.requestedBy}</span>
                      <div>{fmtDateTime(c.requestedAt)}</div>
                    </div>
                  </div>
                  {approver && !own && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={rejectNote[c.id] || ''}
                        onChange={e => {
                          setRejectNote(p => ({ ...p, [c.id]: e.target.value }));
                          if (needsNote[c.id]) setNeedsNote(p => ({ ...p, [c.id]: false }));
                        }}
                        placeholder="Reviewer comment (required to reject)…"
                        aria-label="Reviewer comment"
                        aria-invalid={!!needsNote[c.id]}
                        className={`${INPUT} ${needsNote[c.id] ? 'border-red-400 ring-1 ring-red-200' : ''}`}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => decide(c, 'rejected')}
                          className="flex items-center gap-1.5 text-xs font-bold text-navy-700 bg-white hover:bg-navy-50 border border-navy-200 rounded-xl px-3.5 py-1.5 transition"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(c, 'approved')}
                          className="flex items-center gap-1.5 text-xs font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-xl px-4 py-1.5 transition"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                      </div>
                    </div>
                  )}
                  {approver && own && <p className="text-[11px] text-slate-500">You requested this change, so someone else has to approve it.</p>}
                </div>
              );
            })}
          </div>

          {decided.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
              <h3 className="text-sm font-bold text-slate-900 px-4 pt-4">Decided</h3>
              <table className="w-full min-w-[44rem] border-collapse mt-2">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className={TH}>Field</th>
                    <th className={TH}>Change</th>
                    <th className={TH}>Requested by</th>
                    <th className={TH}>Decision</th>
                    <th className={TH}>Decided by</th>
                  </tr>
                </thead>
                <tbody>
                  {decided.map(c => (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0">
                      <td className={`${TD} font-semibold`}>{changeLabel(c)}</td>
                      <td className={TD}>{describeChange(c)}</td>
                      <td className={TD}>{c.requestedBy}</td>
                      <td className={TD}>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-px rounded-full border ${c.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-300'}`}>
                          {c.status}
                        </span>
                        {c.comment && <div className="text-[11px] text-slate-500 mt-1">“{c.comment}”</div>}
                      </td>
                      <td className={TD}>
                        {c.reviewedBy}
                        {c.reviewedAt && <div className="text-[11px] text-slate-400">{fmtDateTime(c.reviewedAt)}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================= NOTIFICATIONS ======================= */}
      {tab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-navy-600" /> Notifications
              <span
                className="text-slate-300 hover:text-slate-500 cursor-help"
                title="Sent when a field is added, and when a change is approved or rejected, to the field's business owner and whoever asked for it. Business owners are teams, so their notices are shown to Kite-side users."
              >
                <Info className="w-3.5 h-3.5" />
              </span>
            </h3>
            {freshIds.size > 0 && (
              <span className="text-[11px] font-bold text-white bg-navy-600 rounded-full px-2 py-0.5">{freshIds.size} new</span>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {NOTE_FILTERS.map(f => {
                const count = f.id === 'all' ? notes.length : notes.filter(n => noteKind(n).id === f.id).length;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setNoteFilter(f.id)}
                    className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition ${
                      noteFilter === f.id ? 'bg-navy-600 text-white border-navy-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f.label} <span className={noteFilter === f.id ? 'text-navy-100' : 'text-slate-400'}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {shownNotes.length === 0 && (
            <div className="py-14 text-center">
              <Bell className="w-8 h-8 text-slate-200 mx-auto" />
              <p className="text-xs text-slate-400 mt-2">{notes.length === 0 ? 'No notifications yet.' : 'Nothing in this filter.'}</p>
            </div>
          )}

          {noteGroups.map(g => (
            <div key={g.label}>
              <div className="px-5 py-2 bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{g.label}</div>
              <ul>
                {g.items.map(n => {
                  const k = noteKind(n);
                  const Icon = k.icon;
                  const isOpen = !!openNote[n.id];
                  const isNew = freshIds.has(n.id);
                  return (
                    <li key={n.id} className={`border-b border-slate-100 last:border-0 ${isNew ? 'bg-navy-50/40' : ''}`}>
                      <button
                        type="button"
                        onClick={() => setOpenNote(p => ({ ...p, [n.id]: !p[n.id] }))}
                        aria-expanded={isOpen}
                        className="w-full text-left flex items-start gap-3 px-5 py-3 hover:bg-slate-50/80 transition"
                      >
                        <span className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${k.cls}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-sm font-bold text-slate-900">{k.title}</span>
                            <span className="text-xs font-semibold text-navy-700 bg-navy-50 rounded-md px-2 py-0.5">{n.fieldLabel}</span>
                            {isNew && <span className="w-2 h-2 rounded-full bg-navy-600" aria-label="New" />}
                          </span>
                          <span className={`block text-xs text-slate-500 mt-1 ${isOpen ? '' : 'truncate'}`}>{emphasise(noteSummary(n))}</span>
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-400 whitespace-nowrap" title={fmtDateTime(n.ts)}>
                            {relTime(n.ts)}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="pl-16 pr-5 pb-4 -mt-1 space-y-2">
                          <p className="text-xs text-slate-700 leading-relaxed">{emphasise(n.message)}</p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sent to</span>
                            {n.recipients.map(rc => (
                              <span key={rc.label} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {rc.label}
                              </span>
                            ))}
                            <span className="text-[10px] text-slate-400 ml-1">· {fmtDateTime(n.ts)}</span>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {vf && (
        <div
          className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${vf.label} attributes`}
          onClick={() => setViewing(null)}
        >
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="min-w-0 flex-1">
                {/* name, with its code and type beside it */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{vf.label}</h3>
                  <span className="font-mono text-sm font-medium text-navy-600">{vf.abbreviation}</span>
                  <span className="text-[11px] font-medium text-slate-400">{KIND_LABEL[vf.kind]} field</span>
                  {vPend.length > 0 && (
                    <span className="self-center text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{vPend.length} pending</span>
                  )}
                </div>

                {/* the facts about the field, each under its own small label */}
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                  <div className="bg-slate-50/70 px-4 py-2.5">
                    <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Used in</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {vf.usedIn.length === 0 ? (
                        <span className="text-sm text-slate-500">Reference only</span>
                      ) : (
                        vf.usedIn.map(u => (
                          <span key={u} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${USE_CLS[u]}`}>
                            {USE_LABEL[u]}
                          </span>
                        ))
                      )}
                    </dd>
                  </div>
                  <div className="bg-slate-50/70 px-4 py-2.5">
                    <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Business owner</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">{vf.owner}</dd>
                  </div>
                  <div className="bg-slate-50/70 px-4 py-2.5">
                    <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last updated</dt>
                    <dd className="mt-1 text-sm text-slate-800">
                      <span className="font-semibold">{vf.updatedBy}</span>
                      <span className="text-slate-400"> · {fmtDate(vf.updatedAt)}</span>
                    </dd>
                  </div>
                </dl>
                {vf.note && <p className="text-[11px] text-slate-500 mt-2.5">{vf.note}</p>}
              </div>
              <button type="button" onClick={() => setViewing(null)} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-navy-50/60 border-b border-navy-100">
              {vf.kind === 'dictionary' && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    type="search"
                    autoFocus
                    value={attrQuery}
                    onChange={e => setAttrQuery(e.target.value)}
                    placeholder={`Search ${vf.attributes.length} attributes…`}
                    aria-label={`Search ${vf.label} attributes`}
                    className="bg-white border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 text-xs font-medium w-72 focus:outline-none focus:border-navy-500"
                  />
                </div>
              )}
              {vf.kind === 'dictionary' && (
                <span className="text-[11px] font-semibold text-navy-700">
                  {vAttrs.length === vf.attributes.length ? `${vAttrs.length} attributes` : `${vAttrs.length} of ${vf.attributes.length} attributes`}
                </span>
              )}
              <div className="ml-auto flex flex-wrap items-center gap-2">
                {vf.kind === 'dictionary' && (
                  <button
                    type="button"
                    onClick={() => setProposal({ fieldKey: vf.key, type: 'add_value' })}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-lg px-3 py-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add attribute
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setProposal({ fieldKey: vf.key, type: 'update_owner' })}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 transition"
                >
                  <UserCog className="w-3.5 h-3.5" /> Change business owner
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFor(vf.key)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 transition"
                >
                  <History className="w-3.5 h-3.5" /> View history
                </button>
              </div>
            </div>

            {vf.kind !== 'dictionary' ? (
              <div className="flex-1 flex items-center justify-center p-10">
                <p className="text-sm text-slate-500 text-center max-w-md">{KIND_LABEL[vf.kind]} field: it has no list of attributes.</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-navy-100 sticky top-0 z-10 border-b border-navy-200">
                    <tr>
                      <th className={ATH}>Attribute</th>
                      {vf.attributes.some(a => a.definition) && <th className={ATH}>Definition</th>}
                      <th className={ATH}>Business owner</th>
                      <th className={ATH}>Last updated by</th>
                      <th className={ATH}>Last updated</th>
                      <th className={`${ATH} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vAttrs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-xs text-slate-400">No attributes match.</td>
                      </tr>
                    )}
                    {vAttrs.map(a => {
                      const aPend = vPend.filter(c => c.value === a.value || c.newValue === a.value);
                      return (
                        <tr key={a.value} className="border-b border-slate-100 last:border-0 hover:bg-navy-50/40 transition-colors">
                          <td className={`${TD} font-medium text-slate-800 break-words`}>
                            {a.value}
                            {aPend.length > 0 && (
                              <span className="ml-2 text-[9px] font-bold uppercase px-1.5 py-px rounded-full bg-amber-100 text-amber-800">change pending</span>
                            )}
                          </td>
                          {vf.attributes.some(x => x.definition) && <td className={`${TD} max-w-md`}>{a.definition || <span className="text-slate-300">-</span>}</td>}
                          <td className={TD}>
                            <OwnerChip name={a.owner || vf.owner} />
                          </td>
                          <td className={TD}>
                            <UpdaterCell name={a.updatedBy} />
                          </td>
                          <td className={`${TD} whitespace-nowrap`}>{fmtDate(a.updatedAt)}</td>
                          <td className={`${TD} text-right whitespace-nowrap`}>
                            <button
                              type="button"
                              title="Propose a new value for this attribute"
                              aria-label={`Edit ${a.value}`}
                              onClick={() => setProposal({ fieldKey: vf.key, type: 'update_value', value: a.value })}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:text-navy-700 hover:bg-slate-50"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              title="Propose removing this attribute"
                              aria-label={`Remove ${a.value}`}
                              onClick={() => setProposal({ fieldKey: vf.key, type: 'remove_value', value: a.value })}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50 ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {historyFor && (
        <HistoryDialog
          field={dict.fields.find(f => f.key === historyFor)}
          entries={dict.log.filter(l => l.fieldKey === historyFor)}
          onClose={() => setHistoryFor(null)}
        />
      )}

      {addingField && actor && (
        <AddFieldDialog
          direct={canAddFieldDirectly(actor)}
          initialLabel={addPrefill.label}
          initialAbbreviation={addPrefill.abbreviation}
          onClose={() => setAddingField(false)}
          onSubmit={(field, reason) => {
            const res = proposeChange({ fieldKey: '', type: 'add_field', field, reason }, actor);
            if (!res.ok) return res.error || 'Could not add the field.';
            showToast(
              res.applied
                ? `Field added. ${res.notified?.join(' and ')} notified.`
                : 'Field submitted for the brand’s approval.',
              'success'
            );
            setAddingField(false);
            if (!res.applied) setTab('pending');
            return null;
          }}
        />
      )}

      {proposal && actor && (
        <ProposalDialog
          proposal={proposal}
          field={dict.fields.find(f => f.key === proposal.fieldKey)!}
          onClose={() => setProposal(null)}
          onSubmit={input => {
            const res = proposeChange({ fieldKey: proposal.fieldKey, type: proposal.type, ...input }, actor);
            if (!res.ok) return res.error || 'Could not submit the change.';
            showToast('Change submitted for approval.', 'success');
            setProposal(null);
            return null;
          }}
        />
      )}
    </div>
  );
};

/** Ask for the details of a change; it is only a request until someone approves it. */
const ProposalDialog: React.FC<{
  proposal: Proposal;
  field: DictField;
  onClose: () => void;
  onSubmit: (input: { value?: string; newValue?: string; owner?: string; reason?: string; abbreviation?: string; attrOwner?: string }) => string | null;
}> = ({ proposal, field, onClose, onSubmit }) => {
  const current = field.attributes.find(a => a.value === proposal.value);
  const [abbreviation, setAbbreviation] = useState(proposal.type === 'update_value' ? current?.abbreviation || '' : '');
  const [attrOwner, setAttrOwner] = useState(proposal.type === 'update_value' ? current?.owner || '' : '');
  const [value, setValue] = useState(proposal.type === 'add_value' ? '' : proposal.value || '');
  const [newValue, setNewValue] = useState(proposal.type === 'update_value' ? proposal.value || '' : '');
  const [owner, setOwner] = useState(field.owner);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const title =
    proposal.type === 'add_value'
      ? `Add an attribute to ${field.label}`
      : proposal.type === 'update_value'
      ? `Change “${proposal.value}” in ${field.label}`
      : proposal.type === 'remove_value'
      ? `Remove “${proposal.value}” from ${field.label}`
      : `Change the business owner of ${field.label}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(onSubmit({ value, newValue, owner, reason, abbreviation, attrOwner }));
  };

  return (
    <div
      className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={e => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4"
      >
        <div>
          <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500 mt-1">This is a request. It is applied once a Marketer/Admin or administrator approves it.</p>
        </div>

        {proposal.type === 'add_value' && (
          <div>
            <label htmlFor="dp-value" className="block text-xs font-bold text-slate-700 mb-1">New attribute value *</label>
            <input id="dp-value" autoFocus value={value} onChange={e => setValue(e.target.value)} className={INPUT} placeholder="e.g. Webinar" />
          </div>
        )}
        {proposal.type === 'update_value' && (
          <div>
            <label htmlFor="dp-new" className="block text-xs font-bold text-slate-700 mb-1">Value *</label>
            <input id="dp-new" autoFocus value={newValue} onChange={e => setNewValue(e.target.value)} className={INPUT} />
          </div>
        )}

        {(proposal.type === 'add_value' || proposal.type === 'update_value') && (
          <div>
            <div>
              <label htmlFor="dp-attr-owner" className="block text-xs font-bold text-slate-700 mb-1">Business owner <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="dp-attr-owner" value={attrOwner} onChange={e => setAttrOwner(e.target.value)} className={INPUT} placeholder={`Same as the field (${field.owner})`} />
            </div>
          </div>
        )}
        {proposal.type === 'update_owner' && (
          <div>
            <label htmlFor="dp-owner" className="block text-xs font-bold text-slate-700 mb-1">Business owner *</label>
            <input id="dp-owner" autoFocus value={owner} onChange={e => setOwner(e.target.value)} className={INPUT} />
          </div>
        )}
        {proposal.type === 'remove_value' && (
          <p className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            Once approved, “{proposal.value}” disappears from the dropdowns that use {field.label}. Campaigns and tactics that already use it keep their value.
          </p>
        )}

        <div>
          <label htmlFor="dp-reason" className="block text-xs font-bold text-slate-700 mb-1">Reason <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="dp-reason" value={reason} onChange={e => setReason(e.target.value)} className={INPUT} placeholder="Why is this needed?" />
        </div>

        {error && <p className="text-[11px] font-bold text-red-600" role="alert">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition">
            Cancel
          </button>
          <button type="submit" className="bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm">
            Submit for approval
          </button>
        </div>
      </form>
    </div>
  );
};

/** Add a whole new field with its attributes. The brand adds directly; anyone else needs the brand's approval. */
const AddFieldDialog: React.FC<{
  direct: boolean;
  initialLabel?: string;
  initialAbbreviation?: string;
  onClose: () => void;
  onSubmit: (field: NewField, reason: string) => string | null;
}> = ({ direct, initialLabel = '', initialAbbreviation = '', onClose, onSubmit }) => {
  const [label, setLabel] = useState(initialLabel);
  const [abbreviation, setAbbreviation] = useState(initialAbbreviation);
  const [owner, setOwner] = useState('');
  const [usedIn, setUsedIn] = useState<DictUse[]>([]);
  // one row per attribute, each with its own details (blank abbreviation / owner = same as the field)
  const [rows, setRows] = useState<{ value: string; abbreviation: string; owner: string }[]>([{ value: '', abbreviation: '', owner: '' }]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const owners = useMemo(() => knownOwners(), []);

  const toggleUse = (u: DictUse) => setUsedIn(p => (p.includes(u) ? p.filter(x => x !== u) : [...p, u]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(onSubmit({ label, abbreviation, owner, usedIn, attributes: rows.map(r => ({ value: r.value, abbreviation: r.abbreviation, owner: r.owner })) }, reason));
  };

  return (
    <div
      className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add a field"
      onClick={onClose}
    >
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Add a field</h3>
          <p className={`text-[11px] mt-1 rounded-lg px-2.5 py-1.5 border ${direct ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            {direct
              ? 'You can add this directly: no approval needed. The agency and the field’s business owner will be notified.'
              : 'This needs the brand’s approval. Once it is approved or rejected, the field’s business owner and you are notified.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="af-label" className="block text-xs font-bold text-slate-700 mb-1">Field name *</label>
            <input id="af-label" autoFocus value={label} onChange={e => setLabel(e.target.value)} className={INPUT} placeholder="e.g. Event type" />
          </div>
          <div>
            <label htmlFor="af-abbr" className="block text-xs font-bold text-slate-700 mb-1">Abbreviation *</label>
            <input id="af-abbr" value={abbreviation} onChange={e => setAbbreviation(e.target.value)} className={`${INPUT} font-mono`} placeholder="e.g. evnt_typ" />
          </div>
        </div>

        <div>
          <label htmlFor="af-owner" className="block text-xs font-bold text-slate-700 mb-1">Business owner *</label>
          <input id="af-owner" list="af-owners" value={owner} onChange={e => setOwner(e.target.value)} className={INPUT} placeholder="Choose or type an owner" />
          <datalist id="af-owners">
            {owners.map(o => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </div>

        <fieldset>
          <legend className="block text-xs font-bold text-slate-700 mb-1">Used in <span className="font-normal text-slate-400">(optional)</span></legend>
          <div className="flex flex-wrap gap-3">
            {(['campaign', 'tactic', 'utm'] as DictUse[]).map(u => (
              <label key={u} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={usedIn.includes(u)} onChange={() => toggleUse(u)} /> {USE_LABEL[u]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="block text-xs font-bold text-slate-700">Attributes <span className="font-normal text-slate-400">(each with its own details)</span></span>
            <button
              type="button"
              onClick={() => setRows(r => [...r, { value: '', abbreviation: '', owner: '' }])}
              className="flex items-center gap-1 text-[11px] font-bold text-navy-700 hover:text-navy-900"
            >
              <Plus className="w-3.5 h-3.5" /> Add attribute
            </button>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1.4fr_1.2fr_2rem] gap-2 bg-slate-50 border-b border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Attribute</span>
              <span>Business owner</span>
              <span />
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1.4fr_1.2fr_2rem] gap-2 px-2.5 py-1.5 items-center">
                  <input
                    aria-label={`Attribute ${i + 1} name`}
                    value={r.value}
                    onChange={e => setRows(rs => rs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    className={INPUT}
                    placeholder={i === 0 ? 'e.g. Webinar' : 'Attribute'}
                  />
                  <input
                    aria-label={`Attribute ${i + 1} business owner`}
                    list="af-owners"
                    value={r.owner}
                    onChange={e => setRows(rs => rs.map((x, j) => (j === i ? { ...x, owner: e.target.value } : x)))}
                    className={INPUT}
                    placeholder={owner || 'Same as field'}
                  />
                  <button
                    type="button"
                    aria-label={`Remove attribute ${i + 1}`}
                    onClick={() => setRows(rs => (rs.length === 1 ? [{ value: '', abbreviation: '', owner: '' }] : rs.filter((_, j) => j !== i)))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Leave the owner blank to use the field's. The last updater and date are filled in when the change is made.</p>
        </div>

        {!direct && (
          <div>
            <label htmlFor="af-reason" className="block text-xs font-bold text-slate-700 mb-1">Reason <span className="font-normal text-slate-400">(optional)</span></label>
            <input id="af-reason" value={reason} onChange={e => setReason(e.target.value)} className={INPUT} placeholder="Why is this field needed?" />
          </div>
        )}

        {error && <p className="text-[11px] font-bold text-red-600" role="alert">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition">
            Cancel
          </button>
          <button type="submit" className="bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm">
            {direct ? 'Add field' : 'Submit for approval'}
          </button>
        </div>
      </form>
    </div>
  );
};

/** The status of a history entry, from what it records. */
const historyStatus = (l: DictLogEntry): { label: string; cls: string } => {
  if (/rejected/i.test(l.action)) return { label: 'Rejected', cls: 'bg-red-50 text-red-700' };
  if (l.approvedBy === 'Not required') return { label: 'Added directly', cls: 'bg-navy-50 text-navy-700' };
  if (l.approvedBy) return { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700' };
  return { label: 'Requested', cls: 'bg-amber-50 text-amber-800' };
};
/** The description without the who / status parts, which have their own columns. */
const historyDetail = (l: DictLogEntry) =>
  l.detail
    .replace(/\s*Requested by [^,]+, approved by .+\.\s*$/, '')
    .replace(/\s*Requested by [^,]+, rejected by ([^:]+):/, ' Reason:')
    .replace(/\s*Waiting for (the brand's )?approval\.\s*$/, '')
    .replace(/\s*Added directly by [^;]+; no approval needed\.\s*$/, '')
    .trim();

/** A small floating window with everything that happened to one field: who changed what, and who approved it. */
const HistoryDialog: React.FC<{ field?: DictField; entries: DictLogEntry[]; onClose: () => void }> = ({ field, entries, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[140] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`History of ${field?.label || 'field'}`}
      onClick={onClose}
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-100">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-navy-600" /> History
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 truncate">
              {field?.label} <span className="font-mono text-navy-700 font-semibold">({field?.abbreviation})</span>
            </p>
            {field && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                Last updated by <span className="font-semibold text-slate-600">{field.updatedBy}</span> · {fmtDate(field.updatedAt)}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-auto">
          {entries.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">Nothing has changed since the dictionary was loaded.</p>
          ) : (
            <table className="w-full min-w-[52rem] border-collapse">
              <thead className="bg-navy-100 sticky top-0 border-b border-navy-200">
                <tr>
                  <th className={ATH}>Date &amp; time</th>
                  <th className={ATH}>Change</th>
                  <th className={ATH}>Details</th>
                  <th className={ATH}>Status</th>
                  <th className={ATH}>Requested by</th>
                  <th className={ATH}>Approved by</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(l => {
                  const st = historyStatus(l);
                  return (
                    <tr key={l.id} className="border-b border-slate-100 last:border-0 align-top hover:bg-navy-50/30">
                      <td className={`${TD} whitespace-nowrap text-slate-500`}>{fmtDateTime(l.ts)}</td>
                      <td className={`${TD} font-semibold text-slate-800 whitespace-nowrap`}>{l.action}</td>
                      <td className={`${TD} text-[11px] leading-snug text-slate-600 min-w-[16rem]`}>{historyDetail(l)}</td>
                      <td className={TD}>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className={`${TD} whitespace-nowrap`}>{l.by}</td>
                      <td className={`${TD} whitespace-nowrap`}>{l.approvedBy && l.approvedBy !== 'Not required' ? l.approvedBy : <span className="text-slate-300">-</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
