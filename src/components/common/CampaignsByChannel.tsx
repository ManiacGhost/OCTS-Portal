import React, { useEffect, useState } from 'react';
import { ChevronRight, Inbox, X, Copy, Check, Link2, CopyPlus, Pencil, Search, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { usePersona } from '../../context/PersonaContext';
import { CampaignTaxonomy } from '../../types';
import { CAMPAIGN_FORMULA } from '../../data/taxonomyFormulas';
import { fuzzyFilter } from './fuzzy';
import { tacticStatusOf, visibleTacticStatus, hasTactic, isApproved, statusLabel } from '../../data/approvalStatus';
import { ConfirmDialog } from './ConfirmDialog';
import { CampaignFlag, TacticFlag, STATUS_BADGE } from './StatusFlags';

export type CampaignStatusFilter = 'all' | 'draft' | 'submitted' | 'approved' | 'rejected' | 'notactic';

const FILTERS: { key: CampaignStatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'submitted', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'notactic', label: 'No tactic' },
];


/**
 * A campaign matches a status by its own approval status: an approved campaign is "Approved" even
 * while one of its tactics is pending or rejected.
 */
export function matchesStatus(c: CampaignTaxonomy, f: CampaignStatusFilter): boolean {
  if (f === 'all') return true;
  // a rejected campaign belongs under Rejected, even if it never got a tactic
  if (f === 'notactic') return !hasTactic(c) && c.status !== 'rejected';
  if (f === 'approved') return isApproved(c.status);
  return c.status === f;
}

// ---------------------------------------------------------------------------
// Detail modal — shows every field of a campaign
// ---------------------------------------------------------------------------

const Row: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div className="grid grid-cols-3 gap-3 py-2 border-b border-slate-100 last:border-0">
    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
    <div className={`col-span-2 text-xs text-slate-900 break-words ${mono ? 'font-mono' : 'font-medium'}`}>
      {children ?? <span className="text-slate-300">—</span>}
    </div>
  </div>
);

const Section: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <div className="space-y-0.5">
    <div className="flex items-center gap-3 pt-2">
      <h4 className="text-xs font-extrabold text-slate-900">{title}</h4>
      {action}
    </div>
    <div>{children}</div>
  </div>
);

const TacticItem: React.FC<{
  t: CampaignTaxonomy;
  isAgency: boolean;
  canUtm: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onUtm: () => void;
}> = ({ t, isAgency, canUtm, onDelete, onEdit, onUtm }) => {
  const [open, setOpen] = useState(false);
  const status = tacticStatusOf(t);
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-center gap-2 text-left"
        >
          <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">
              <span className="text-navy-700">{t.channelType || '—'}</span>
              {t.subChannel && <span className="text-slate-500 font-semibold"> · {t.subChannel}</span>}
              <span className="text-slate-400 font-normal"> · </span>
              {t.tactic?.publisher || 'Publisher not set'}
              {t.tactic?.placement && <span className="text-slate-500 font-medium"> — {t.tactic.placement}</span>}
            </div>
            {t.assetId && <div className="text-[10px] font-mono text-slate-500 truncate">{t.assetId}</div>}
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {status && <TacticFlag status={status} />}
          {isAgency && (status === 'submitted' || status === 'draft') && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg px-2 py-1 transition"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
          {isAgency && (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 transition"
            >
              <Pencil className="w-3 h-3" /> Edit tactic
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="bg-white border-t border-slate-200 px-4 py-1">
          <Row label="Channel">{t.channelType}</Row>
          <Row label="Sub-channel">{t.subChannel}</Row>
          <Row label="Publisher / Platform">{t.tactic?.publisher}</Row>
          <Row label="Placement">{t.tactic?.placement}</Row>
          <Row label="Creative / Asset ID" mono>{t.assetId}</Row>
          <Row label="Target audience">{t.tactic?.targetAudience}</Row>
          <Row label="Landing page URL" mono>{t.tactic?.landingPageUrl}</Row>
          <Row label="Start – end">{t.tactic ? `${t.tactic.startDate} → ${t.tactic.endDate}` : undefined}</Row>
          <Row label="Tactic status">{status ? statusLabel(status) : undefined}</Row>
          {status === 'rejected' && (
            <div className="my-2 bg-red-50 border border-red-200 rounded-xl p-3 space-y-1 text-xs text-red-900">
              <div className="font-extrabold">Marketer feedback</div>
              <p>{t.reviewNotes?.tactic || 'No comment was left.'}</p>
            </div>
          )}
          {canUtm && isApproved(status) && (
            <div className="flex justify-end py-2.5">
              <button
                type="button"
                onClick={onUtm}
                className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-lg px-3.5 py-1.5 transition shadow-sm"
              >
                <Link2 className="w-3.5 h-3.5" /> Open with UTM Generator
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const STATUS_BADGE_CLASS = STATUS_BADGE;

export const CampaignDetailModal: React.FC<{
  campaign: CampaignTaxonomy;
  onClose: () => void;
  /** Campaign mode: show only the creation fields and these tactics (one row per tactic). */
  tactics?: CampaignTaxonomy[];
}> = ({ campaign: c, onClose, tactics }) => {
  const { brands, therapeuticAreas, keyMessages, channels, deleteCampaign, deleteTactic } = usePersona();
  const [confirmDel, setConfirmDel] = useState<null | { kind: 'campaign' } | { kind: 'tactic'; t: CampaignTaxonomy }>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const brand = brands.find(b => b.id === c.brandId);
  const ta = therapeuticAreas.find(t => t.id === c.therapeuticAreaId);
  const topic = keyMessages.find(k => k.id === c.keyMessageCategoryId);
  const subs = topic?.subtopics || topic?.subcategories || [];
  const subtopic = subs.find(s => s.id === c.keyMessageSubcategoryId);
  const channel = channels.find(ch => ch.id === c.channelId);

  const copy = () => {
    navigator.clipboard?.writeText(c.taxonomyString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  STATUS_BADGE[c.status] || STATUS_BADGE.draft
                }`}
              >
                {statusLabel(c.status)}
              </span>
              <span className="text-[11px] font-mono text-slate-500">{c.complianceScore}% compliant</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-1 truncate">{c.campaignName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Taxonomy string */}
          <div className="bg-slate-900 rounded-xl p-3 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Campaign Name taxonomy string</span>
            <div className="flex items-start justify-between gap-2">
              <code className="text-xs font-mono font-bold text-navy-300 break-all">{c.taxonomyString}</code>
              <button
                onClick={copy}
                className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-2 py-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {c.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1.5 text-xs text-red-900">
              <div className="font-extrabold">Marketer feedback</div>
              <p>{c.reviewNotes?.campaign || c.notes || 'No comment was left.'}</p>
            </div>
          )}

          {tactics && (
            <>
              <Section title="Campaign details">
                <Row label="Product">{brand ? `${brand.name} (${brand.code})` : c.brandId}</Row>
                {CAMPAIGN_FORMULA.filter(t => t.source !== 'brand').map(t => (
                  <Row key={t.key} label={t.label} mono>{c.formulaInputs?.[t.key] || undefined}</Row>
                ))}
              </Section>

              {isApproved(c.status) && (
              <Section
                title={`Tactics (${tactics.length})`}
                action={
                  user?.role === 'agency' && isApproved(c.status) && (
                    <button
                      type="button"
                      onClick={() => navigate(`/campaigns/${c.id}/tactic${hasTactic(c) ? '?new=1' : ''}`)}
                      className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 transition"
                    >
                      <Plus className="w-3 h-3" /> Add tactic
                    </button>
                  )
                }
              >
                {tactics.length === 0 ? (
                  <div className="py-2 text-xs text-slate-500">No tactics have been created for this campaign yet.</div>
                ) : (
                  <div className="space-y-2 pt-2">
                    {tactics.map(t => (
                      <TacticItem
                        key={t.id}
                        t={t}
                        isAgency={user?.role === 'agency'}
                        canUtm={!!user && user.role !== 'superadmin'}
                        onUtm={() => navigate(`/utm?campaign=${t.id}`)}
                        onDelete={() => setConfirmDel({ kind: 'tactic', t })}
                        onEdit={() => navigate(`/campaigns/${t.id}/tactic`)}
                      />
                    ))}
                  </div>
                )}
              </Section>
              )}
            </>
          )}

          {!tactics && (
            <>
          <Section title="Identity">
            <Row label="Campaign ID" mono>{c.id}</Row>
            <Row label="Campaign code" mono>{c.campaignCode}</Row>
            <Row label="Campaign status">{statusLabel(c.status)}</Row>
            {visibleTacticStatus(c) && <Row label="Tactic status">{statusLabel(visibleTacticStatus(c))}</Row>}
            <Row label="Compliance">{c.complianceScore}%</Row>
          </Section>

          <Section title="Classification">
            <Row label="Brand">{brand ? brand.name : c.brandId}</Row>
            <Row label="Indication (brand)">{brand?.indication}</Row>
            <Row label="Therapeutic area">{ta ? `${ta.name} (${ta.code})` : c.therapeuticAreaId}</Row>
            <Row label="Topic">{topic ? `${topic.name} (${topic.code})` : c.keyMessageCategoryId}</Row>
            <Row label="Subtopic">{subtopic ? `${subtopic.name} (${subtopic.code})` : c.keyMessageSubcategoryId}</Row>
          </Section>

          <Section title="Channel">
            <Row label="Channel">{channel ? `${channel.name} (${channel.code})` : c.channelId}</Row>
            <Row label="Channel type">{c.channelType}</Row>
            <Row label="Sub-channel">{c.subChannel}</Row>
            <Row label="Format">{c.format}</Row>
          </Section>

          {c.tactic && (
            <Section title="Tactic">
                            <Row label="Publisher / Platform">{c.tactic.publisher}</Row>
              <Row label="Placement">{c.tactic.placement}</Row>
              <Row label="Creative / Asset ID" mono>{c.assetId}</Row>
              <Row label="Target audience">{c.tactic.targetAudience}</Row>
              <Row label="Landing page URL" mono>{c.tactic.landingPageUrl}</Row>
              <Row label="Start – end">{c.tactic.startDate} → {c.tactic.endDate}</Row>
            </Section>
          )}

          {c.formulaInputs && Object.keys(c.formulaInputs).length > 0 && (
            <Section title="Formula inputs">
              {Object.entries(c.formulaInputs).map(([k, v]) => (
                <Row key={k} label={CAMPAIGN_FORMULA.find(t => t.key === k)?.label ?? k} mono>{v}</Row>
              ))}
            </Section>
          )}

          <Section title="Targeting & scope">
            <Row label="Target audience">{c.targetAudience}</Row>
            <Row label="Region">{c.region}</Row>
            <Row label="Quarter">{c.quarter}</Row>
          </Section>

          <Section title="UTM parameters">
            <Row label="utm_source" mono>{c.utmSource}</Row>
            <Row label="utm_medium" mono>{c.utmMedium}</Row>
            <Row label="utm_campaign" mono>{c.utmCampaign}</Row>
            <Row label="utm_content" mono>{c.utmContent}</Row>
          </Section>

          <Section title="Ownership & dates">
            <Row label="Agency owner">{c.agencyOwner}</Row>
            <Row label="Marketer owner">{c.marketerOwner}</Row>
            <Row label="Created">{c.createdAt}</Row>
            <Row label="Updated">{c.updatedAt}</Row>
          </Section>

          {c.notes && (
            <Section title="Notes">
              <p className="text-xs text-slate-700 py-2">{c.notes}</p>
            </Section>
          )}
            </>
          )}
        </div>

        {/* Actions */}
        {user && user.role !== 'superadmin' && (
          <div className="flex flex-wrap items-center justify-end gap-2 p-4 border-t border-slate-100">
            {user.role === 'agency' && (
              <>
                {(c.status === 'submitted' || c.status === 'draft') && (
                  <button
                    type="button"
                    onClick={() => setConfirmDel({ kind: 'campaign' })}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 transition mr-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete campaign
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/campaigns/${c.id}/edit`)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 transition"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit campaign
                </button>
                {!tactics && (
                <button
                  type="button"
                  onClick={() => navigate(`/campaigns/${c.id}/tactic`)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 transition"
                >
                  <Pencil className="w-3.5 h-3.5" /> {hasTactic(c) ? 'Edit tactic' : 'Add tactic'}
                </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/campaigns/new?clone=${c.id}`)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 transition"
                >
                  <CopyPlus className="w-3.5 h-3.5" /> Clone
                </button>
              </>
            )}
            {!tactics && (
            <button
              type="button"
              onClick={() => navigate(`/utm?campaign=${c.id}`)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-lg px-3.5 py-1.5 transition shadow-sm"
            >
              <Link2 className="w-3.5 h-3.5" /> Open with UTM Generator
            </button>
            )}
          </div>
        )}
      </div>
      {confirmDel && (
        <ConfirmDialog
          title={confirmDel.kind === 'campaign' ? 'Delete this campaign?' : 'Delete this tactic?'}
          message={
            confirmDel.kind === 'campaign'
              ? c.status === 'draft'
                ? 'This draft will be removed, along with any tactic on it. This cannot be undone.'
                : 'This campaign is pending approval. Deleting it also removes its tactic. This cannot be undone.'
              : 'This tactic has not been approved yet. Deleting it cannot be undone.'
          }
          confirmLabel="Delete"
          busy={deleting}
          onCancel={() => setConfirmDel(null)}
          onConfirm={async () => {
            setDeleting(true);
            const ok =
              confirmDel.kind === 'campaign'
                ? await deleteCampaign(c.id)
                : await deleteTactic(confirmDel.t.id, confirmDel.t.id !== c.id);
            setDeleting(false);
            setConfirmDel(null);
            if (ok && (confirmDel.kind === 'campaign' || tactics === undefined)) onClose();
          }}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------

interface Props {
  campaigns: CampaignTaxonomy[];
  statusFilter: CampaignStatusFilter;
  onStatusFilterChange: (f: CampaignStatusFilter) => void;
}

/**
 * The campaign listing. Campaigns don't depend on a channel (the formula has none), so this is one
 * flat list, newest first, with a fuzzy search box and status pills. Channel filtering lives in the
 * tactic listing.
 */
export const CampaignList: React.FC<Props> = ({ campaigns: allRecords, statusFilter, onStatusFilterChange }) => {
  // extra-tactic records are tactics, not campaigns
  const campaigns = allRecords.filter(c => !c.parentCampaignId);
  const { brands } = usePersona();
  const { user } = useAuth();
  const navigate = useNavigate();
  // the UTM Generator is open to agencies, marketers and analytics
  const canUtm = !!user && user.role !== 'superadmin';
  // agencies build campaigns: they can add / edit a tactic and clone a campaign
  const isAgency = user?.role === 'agency';
  const [detail, setDetail] = useState<CampaignTaxonomy | null>(null);
  const [query, setQuery] = useState('');

  const brandName = (id: string) => brands.find(b => b.id === id)?.name?.split(' ')[0] || id || '—';
  // most recently created or changed first, so an edited campaign jumps to the top
  const byNewest = (a: CampaignTaxonomy, b: CampaignTaxonomy) =>
    (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '');

  const searchText = (c: CampaignTaxonomy) =>
    [brandName(c.brandId), c.campaignName, c.taxonomyString, c.region, c.quarter, c.status, c.agencyOwner,
      ...Object.values(c.formulaInputs || {})].join(' ');

  // A tactic belongs to exactly one campaign: the campaign's own tactic, plus any extra tactic records
  // that point back to it. Campaigns that merely share a formula never share tactics.
  const tacticsOf = (c: CampaignTaxonomy) =>
    allRecords.filter(x => hasTactic(x) && (x.id === c.id || x.parentCampaignId === c.id));
  const tacticCount = (c: CampaignTaxonomy) => tacticsOf(c).length;

  const byStatus = campaigns.filter(c => matchesStatus(c, statusFilter)).sort(byNewest);
  // with a query, best match first; without one, newest first
  const visible = query.trim()
    ? fuzzyFilter(byStatus, query, searchText, true).map(r => r.item)
    : byStatus;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search campaigns…"
            aria-label="Search campaigns"
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-navy-500 shadow-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(f => {
            const count = campaigns.filter(c => matchesStatus(c, f.key)).length;
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => onStatusFilterChange(f.key)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  active
                    ? 'bg-navy-600 text-white border-navy-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 ${active ? 'text-navy-100' : 'text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-400">
          <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          {query.trim() ? `No campaigns match “${query.trim()}”.` : 'No campaigns in this view.'}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 space-y-2">
          {visible.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl pr-2 hover:border-navy-300 hover:bg-white transition"
            >
              <button
                type="button"
                onClick={() => setDetail(c)}
                title="View full campaign details"
                className="flex-1 min-w-0 flex items-center justify-between gap-3 px-3 py-2 text-left"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {brandName(c.brandId)} <span className="text-slate-400 font-normal">·</span> {c.campaignName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    {c.campaignCode} · {c.region} · {c.quarter}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CampaignFlag status={c.status} plain />
                  {isApproved(c.status) && <span
                    title="Tactics created for this campaign"
                    className="text-[9px] leading-4 font-bold px-1.5 py-px rounded-full border border-slate-200 bg-white text-slate-600 uppercase tracking-wide whitespace-nowrap"
                  >
                    {tacticCount(c)} {tacticCount(c) === 1 ? 'tactic' : 'tactics'}
                  </span>}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </button>
              {isAgency && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/campaigns/${c.id}/edit`)}
                    title="Edit this campaign"
                    aria-label={`Edit campaign ${c.campaignName}`}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 transition"
                  >
                    <Pencil className="w-3 h-3" />
                    <span className="hidden md:inline">Edit campaign</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/campaigns/new?clone=${c.id}`)}
                    title="Clone this campaign (tactics are not copied)"
                    aria-label={`Clone ${c.campaignName}`}
                    className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-navy-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                  >
                    <CopyPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {detail && <CampaignDetailModal
          campaign={detail}
          onClose={() => setDetail(null)}
          tactics={tacticsOf(detail).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))}
        />}
    </div>
  );
};
