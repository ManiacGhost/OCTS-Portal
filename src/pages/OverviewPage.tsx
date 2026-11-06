import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Activity, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { usePersona } from '../context/PersonaContext';
import { TacticList } from '../components/common/TacticList';
import { hasTactic, isApproved } from '../data/approvalStatus';
import {
  CampaignList,
  CampaignStatusFilter,
  matchesStatus,
} from '../components/common/CampaignsByChannel';

interface Stat {
  label: string;
  value: string | number;
  hint?: string;
  /** When set, clicking the tile filters the campaign list below to this status. */
  filter?: CampaignStatusFilter;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLoading, campaigns, analytics, agencies, personas, keyMessages, auditLogs } = usePersona();

  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>('all');
  const [listTab, setListTab] = useState<'campaigns' | 'tactics'>('campaigns');

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="w-7 h-7 animate-spin text-navy-600" />
        <p className="text-xs font-semibold">Loading your overview…</p>
      </div>
    );
  }

  // extra-tactic records are tactics, not campaigns
  const topLevel = campaigns.filter(c => !c.parentCampaignId);
  const countFor = (f: CampaignStatusFilter) => topLevel.filter(c => matchesStatus(c, f)).length;

  let stats: Stat[] = [];
  switch (user.role) {
    case 'agency':
      stats = [
        { label: 'All my campaigns', value: topLevel.length, hint: 'Everything I have created', filter: 'all' },
        { label: 'Pending review', value: countFor('submitted'), hint: "Waiting for Brand's action", filter: 'submitted' },
        { label: 'Approved', value: countFor('approved'), hint: 'Ready to run', filter: 'approved' },
        { label: 'Rejected', value: countFor('rejected'), hint: 'Sent back to me', filter: 'rejected' },
        { label: 'Drafts', value: countFor('draft'), hint: 'Not submitted yet', filter: 'draft' },
      ];
      break;
    case 'marketer':
      stats = [
        { label: 'All campaigns', value: topLevel.length, hint: 'Across every agency', filter: 'all' },
        { label: 'Awaiting my approval', value: countFor('submitted'), hint: 'Action needed', filter: 'submitted' },
        { label: 'Approved', value: countFor('approved'), hint: 'Signed off', filter: 'approved' },
        { label: 'Rejected', value: countFor('rejected'), hint: 'Sent back to agency', filter: 'rejected' },
      ];
      break;
    case 'analytics':
      stats = [
        { label: 'All campaigns', value: topLevel.length, hint: 'Across every agency', filter: 'all' },
        { label: 'Overall compliance', value: analytics ? `${analytics.overallComplianceRate}%` : '—', hint: 'Target > 95%' },
        { label: 'Open discrepancies', value: analytics ? analytics.recentDiscrepancies.filter(d => !d.resolved).length : 0, hint: 'Needs resolution' },
        { label: 'Active agencies', value: analytics?.activeAgencies ?? agencies.length, hint: 'Partner agencies' },
      ];
      break;
    case 'superadmin':
      stats = [
        { label: 'All campaigns', value: topLevel.length, hint: 'Across every agency', filter: 'all' },
        { label: 'Partner agencies', value: agencies.length, hint: 'Onboarded' },
        { label: 'Marketers', value: personas.filter(p => p.role === 'marketer').length, hint: 'Brand approvers' },
        { label: 'Master topics', value: keyMessages.length, hint: 'Taxonomy categories' },
      ];
      break;
  }

  const activity = auditLogs.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting()}, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            <span className="capitalize font-semibold text-slate-700">{user.roleTitle}</span>
            <span className="text-slate-400"> · {user.organization}</span>
          </p>
        </div>
        {user.role === 'agency' && (
          <button
            type="button"
            onClick={() => navigate('/campaigns/new')}
            className="shrink-0 flex items-center gap-2 text-sm font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-xl px-4 py-2.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create campaign
          </button>
        )}
      </div>

      {/* Headline stats — clickable ones filter the list below */}
      <div className={`grid grid-cols-2 gap-4 ${stats.length > 5 ? 'lg:grid-cols-6' : stats.length > 4 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {stats.map(s => {
          const clickable = !!s.filter;
          const active = clickable && statusFilter === s.filter;
          return (
            <button
              key={s.label}
              type="button"
              disabled={!clickable}
              onClick={() => {
                if (s.filter) {
                  setStatusFilter(s.filter);
                  setListTab('campaigns');
                }
              }}
              className={`text-left bg-white border rounded-2xl p-5 shadow-sm transition ${
                active
                  ? 'border-navy-500 ring-2 ring-navy-500/30'
                  : clickable
                  ? 'border-slate-200 hover:border-navy-300 cursor-pointer'
                  : 'border-slate-200 cursor-default'
              }`}
            >
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</div>
              <div className={`text-3xl font-extrabold tracking-tight mt-1 ${s.filter === 'rejected' ? 'text-red-600' : 'text-slate-900'}`}>{s.value}</div>
              {s.hint && <div className="text-[11px] text-slate-400 font-medium mt-1">{s.hint}</div>}
              {clickable && (
                <div className={`text-[10px] font-bold mt-2 ${active ? 'text-navy-600' : 'text-slate-300'}`}>
                  {active ? 'Showing below' : 'Click to view'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Campaign listing / tactic listing */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-200" role="tablist" aria-label="Listing">
          {([
            ['campaigns', `Campaigns (${topLevel.length})`],
            ['tactics', `Tactics (${campaigns.filter(c => hasTactic(c) && isApproved(c.status)).length})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={listTab === key}
              onClick={() => setListTab(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                listTab === key ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {listTab === 'campaigns' ? (
          <CampaignList campaigns={campaigns} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />
        ) : (
          <TacticList campaigns={campaigns} />
        )}
      </div>

      {/* Recent activity — superadmin only */}
      {user.role === 'superadmin' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-slate-400" />
            Recent activity
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm">
            {activity.length === 0 && <div className="p-4 text-xs text-slate-400">No recent activity.</div>}
            {activity.map(log => (
              <div key={log.id} className="p-3.5 space-y-0.5">
                <div className="text-[11px] font-mono font-bold text-navy-700">{log.action}</div>
                <div className="text-xs text-slate-700">{log.details}</div>
                <div className="text-[10px] text-slate-400 font-mono">{log.user} · {log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
