import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Layers, Inbox, X, Copy, Check } from 'lucide-react';
import { usePersona } from '../../context/PersonaContext';
import { CampaignTaxonomy } from '../../types';

export type CampaignStatusFilter = 'all' | 'draft' | 'submitted' | 'approved' | 'rejected';

const FILTERS: { key: CampaignStatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'submitted', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  submitted: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-slate-700 text-white border-slate-700',
};

export function matchesStatus(c: CampaignTaxonomy, f: CampaignStatusFilter): boolean {
  if (f === 'all') return true;
  if (f === 'approved') return c.status === 'approved' || c.status === 'active';
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

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-0.5">
    <h4 className="text-xs font-extrabold text-slate-900 pt-2">{title}</h4>
    <div>{children}</div>
  </div>
);

const CampaignDetailModal: React.FC<{ campaign: CampaignTaxonomy; onClose: () => void }> = ({ campaign: c, onClose }) => {
  const { brands, therapeuticAreas, keyMessages, channels } = usePersona();
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
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl"
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
                {c.status}
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

          <Section title="Identity">
            <Row label="Campaign ID" mono>{c.id}</Row>
            <Row label="Campaign code" mono>{c.campaignCode}</Row>
            <Row label="Status">{c.status}</Row>
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

          {c.formulaInputs && Object.keys(c.formulaInputs).length > 0 && (
            <Section title="Formula inputs">
              {Object.entries(c.formulaInputs).map(([k, v]) => (
                <Row key={k} label={k} mono>{v}</Row>
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
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

interface Props {
  campaigns: CampaignTaxonomy[];
  statusFilter: CampaignStatusFilter;
  onStatusFilterChange: (f: CampaignStatusFilter) => void;
}

export const CampaignsByChannel: React.FC<Props> = ({ campaigns, statusFilter, onStatusFilterChange }) => {
  const { channels, brands } = usePersona();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [detail, setDetail] = useState<CampaignTaxonomy | null>(null);
  const [pickedChannel, setPickedChannel] = useState<string>(''); // '' = auto, 'all', or a channel id

  const visible = campaigns.filter(c => matchesStatus(c, statusFilter));
  const brandName = (id: string) => brands.find(b => b.id === id)?.name?.split(' ')[0] || id || '—';

  const known = new Set(channels.map(c => c.id));
  const groups: { id: string; name: string; code: string; items: CampaignTaxonomy[] }[] = channels.map(ch => ({
    id: ch.id,
    name: ch.name,
    code: ch.code,
    items: visible.filter(c => c.channelId === ch.id),
  }));
  const orphans = visible.filter(c => !known.has(c.channelId));
  if (orphans.length) groups.push({ id: '__other', name: 'Other / Unassigned Channel', code: '—', items: orphans });
  const nonEmpty = groups.filter(g => g.items.length > 0);

  // One channel at a time: default to the first channel that has campaigns.
  const activeChannel = pickedChannel || nonEmpty[0]?.id || 'all';
  const shown = activeChannel === 'all' ? nonEmpty : nonEmpty.filter(g => g.id === activeChannel);

  // Status-pill counts are scoped to the selected channel.
  const channelScoped = activeChannel === 'all' ? campaigns : campaigns.filter(c => c.channelId === activeChannel);

  return (
    <div className="space-y-4">
      {/* Channel + status pickers */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Channel</label>
          <select
            value={activeChannel}
            onChange={e => setPickedChannel(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-navy-500 shadow-sm"
          >
            <option value="all">All channels ({visible.length})</option>
            {channels.map(ch => {
              const n = visible.filter(c => c.channelId === ch.id).length;
              return (
                <option key={ch.id} value={ch.id}>
                  {ch.name} ({n})
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(f => {
            const count = channelScoped.filter(c => matchesStatus(c, f.key)).length;
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => onStatusFilterChange(f.key)}
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

      {shown.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-400">
          <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          No campaigns in this view.
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(group => {
            const isCollapsed = collapsed[group.id];
            const formats = Array.from(new Set(group.items.map(c => c.subChannel || c.format || 'Unspecified')));
            return (
              <div key={group.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setCollapsed(p => ({ ...p, [group.id]: !p[group.id] }))}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <Layers className="w-4 h-4 text-navy-600 shrink-0" />
                    <span className="font-bold text-slate-900 text-sm truncate">{group.name}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      {group.code}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    {group.items.length} campaign{group.items.length === 1 ? '' : 's'}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {formats.map(fmt => {
                      const rows = group.items.filter(c => (c.subChannel || c.format || 'Unspecified') === fmt);
                      return (
                        <div key={fmt} className="p-3 space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-navy-400" />
                            {fmt}
                            <span className="text-slate-300">· {rows.length}</span>
                          </div>
                          {rows.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setDetail(c)}
                              title="View full campaign details"
                              className="w-full flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-left hover:border-navy-300 hover:bg-white transition"
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
                                <span className="text-[10px] font-mono text-slate-500">{c.complianceScore}%</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                    STATUS_BADGE[c.status] || STATUS_BADGE.draft
                                  }`}
                                >
                                  {c.status}
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {detail && <CampaignDetailModal campaign={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};
