import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Inbox, Link2, Pencil, Search } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { usePersona } from '../../context/PersonaContext';
import { CampaignTaxonomy } from '../../types';
import { hasTactic, tacticStatusOf, isApproved } from '../../data/approvalStatus';
import { TacticFlag, CampaignFlag } from './StatusFlags';
import { fuzzyFilter } from './fuzzy';
import { CampaignDetailModal } from './CampaignsByChannel';

/**
 * The tactic listing — every campaign that has a tactic, one row per tactic. Tactics are where a
 * channel lives, so this is where the channel filter is. Newest first, with a fuzzy search box.
 */
export const TacticList: React.FC<{ campaigns: CampaignTaxonomy[] }> = ({ campaigns }) => {
  const { channels, brands } = usePersona();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canUtm = !!user && user.role !== 'superadmin';
  const isAgency = user?.role === 'agency';
  const [channel, setChannel] = useState('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<CampaignTaxonomy | null>(null);

  const brandName = (id: string) => brands.find(b => b.id === id)?.name?.split(' ')[0] || id || '—';
  const withTactic = campaigns
    .filter(hasTactic)
    .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));

  const inChannel = channel === 'all' ? withTactic : withTactic.filter(c => c.channelId === channel);
  const searchText = (c: CampaignTaxonomy) =>
    [brandName(c.brandId), c.campaignName, c.channelType, c.subChannel, c.tactic?.publisher, c.tactic?.placement,
      c.assetId, c.tactic?.landingPageUrl, tacticStatusOf(c)].join(' ');
  const visible = query.trim() ? fuzzyFilter(inChannel, query, searchText, true).map(r => r.item) : inChannel;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tactics…"
            aria-label="Search tactics"
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-navy-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="tactic-channel" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Channel</label>
          <select
            id="tactic-channel"
            value={channel}
            onChange={e => setChannel(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-navy-500 shadow-sm"
          >
            <option value="all">All channels ({withTactic.length})</option>
            {channels.map(ch => (
              <option key={ch.id} value={ch.id}>
                {ch.name} ({withTactic.filter(c => c.channelId === ch.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-400">
          <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          {query.trim() ? `No tactics match “${query.trim()}”.` : 'No tactics in this view.'}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 space-y-2">
          {visible.map(c => {
            const ts = tacticStatusOf(c)!;
            return (
              <div key={c.id} className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => setDetail(c)}
                  title="View full details"
                  className="flex-1 min-w-0 flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-left hover:border-navy-300 hover:bg-white transition"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      <span className="text-navy-700">{c.channelType || '—'}</span>
                      {c.subChannel && <span className="text-slate-500 font-semibold"> · {c.subChannel}</span>}
                      <span className="text-slate-400 font-normal"> · </span>
                      {c.tactic?.publisher || 'Publisher not set'}
                      {c.tactic?.placement && <span className="text-slate-500 font-medium"> — {c.tactic.placement}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Campaign</span>
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {brandName(c.brandId)} · {c.campaignName}
                      </span>
                      <CampaignFlag status={c.status} />
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {c.assetId && <span className="font-mono">{c.assetId}</span>}
                      {c.tactic?.startDate && <span>{c.assetId ? ' · ' : ''}{c.tactic.startDate} → {c.tactic.endDate}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* the tactic flag only shows once its campaign is approved (or the tactic already is) */}
                    {isApproved(c.status) || isApproved(ts) ? (
                      <TacticFlag status={ts} />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">awaiting campaign approval</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </button>
                {isAgency && (
                  <button
                    type="button"
                    onClick={() => navigate(`/campaigns/${c.id}/tactic`)}
                    title="Edit this tactic"
                    className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Edit</span>
                  </button>
                )}
                {canUtm && (
                  <button
                    type="button"
                    onClick={() => navigate(`/utm?campaign=${c.id}`)}
                    title="Open in the UTM Generator"
                    className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-navy-700 bg-white hover:bg-navy-50 border border-navy-200 rounded-xl px-3 transition"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">UTM Generator</span>
                  </button>
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
