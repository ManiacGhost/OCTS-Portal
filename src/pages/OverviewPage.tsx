import React, { useState } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { usePersona } from '../context/PersonaContext';
import {
  CampaignsByChannel,
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
  const { isLoading, campaigns, analytics, agencies, personas, keyMessages, auditLogs } = usePersona();

  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>('all');

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="w-7 h-7 animate-spin text-navy-600" />
        <p className="text-xs font-semibold">Loading your overview…</p>
      </div>
    );
  }

  const countFor = (f: CampaignStatusFilter) => campaigns.filter(c => matchesStatus(c, f)).length;

  let stats: Stat[] = [];
  switch (user.role) {
    case 'agency':
      stats = [
        { label: 'All my campaigns', value: campaigns.length, hint: 'Everything I have created', filter: 'all' },
        { label: 'Pending review', value: countFor('submitted'), hint: 'Waiting on the marketer', filter: 'submitted' },
        { label: 'Approved', value: countFor('approved'), hint: 'Ready to run', filter: 'approved' },
        { label: 'Drafts', value: countFor('draft'), hint: 'Not submitted yet', filter: 'draft' },
      ];
      break;
    case 'marketer':
      stats = [
        { label: 'All campaigns', value: campaigns.length, hint: 'Across every agency', filter: 'all' },
        { label: 'Awaiting my approval', value: countFor('submitted'), hint: 'Action needed', filter: 'submitted' },
        { label: 'Approved', value: countFor('approved'), hint: 'Signed off', filter: 'approved' },
        { label: 'Rejected', value: countFor('rejected'), hint: 'Sent back to agency', filter: 'rejected' },
      ];
      break;
    case 'analytics':
      stats = [
        { label: 'All campaigns', value: campaigns.length, hint: 'Across every agency', filter: 'all' },
        { label: 'Overall compliance', value: analytics ? `${analytics.overallComplianceRate}%` : '—', hint: 'Target > 95%' },
        { label: 'Open discrepancies', value: analytics ? analytics.recentDiscrepancies.filter(d => !d.resolved).length : 0, hint: 'Needs resolution' },
        { label: 'Active agencies', value: analytics?.activeAgencies ?? agencies.length, hint: 'Partner agencies' },
      ];
      break;
    case 'superadmin':
      stats = [
        { label: 'All campaigns', value: campaigns.length, hint: 'Across every agency', filter: 'all' },
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
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {greeting()}, {user.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          <span className="capitalize font-semibold text-slate-700">{user.roleTitle}</span>
          <span className="text-slate-400"> · {user.organization}</span>
        </p>
      </div>

      {/* Headline stats — clickable ones filter the list below */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const clickable = !!s.filter;
          const active = clickable && statusFilter === s.filter;
          return (
            <button
              key={s.label}
              type="button"
              disabled={!clickable}
              onClick={() => s.filter && setStatusFilter(s.filter)}
              className={`text-left bg-white border rounded-2xl p-5 shadow-sm transition ${
                active
                  ? 'border-navy-500 ring-2 ring-navy-500/30'
                  : clickable
                  ? 'border-slate-200 hover:border-navy-300 cursor-pointer'
                  : 'border-slate-200 cursor-default'
              }`}
            >
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{s.value}</div>
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

      {/* Campaigns grouped by promotional channel → sub-channel */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Campaigns by promotional channel</h2>
        <CampaignsByChannel
          campaigns={campaigns}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
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
