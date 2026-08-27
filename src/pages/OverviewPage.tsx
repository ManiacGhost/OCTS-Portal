import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { usePersona } from '../context/PersonaContext';
import { navItemsForRole } from '../components/layout/nav';

interface Stat {
  label: string;
  value: string | number;
  hint?: string;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, campaigns, programs, analytics, agencies, personas, keyMessages, auditLogs } = usePersona();

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="w-7 h-7 animate-spin text-rose-600" />
        <p className="text-xs font-semibold">Loading your overview…</p>
      </div>
    );
  }

  const byStatus = (s: string | string[]) => {
    const set = Array.isArray(s) ? s : [s];
    return campaigns.filter(c => set.includes(c.status)).length;
  };

  let stats: Stat[] = [];
  switch (user.role) {
    case 'agency':
      stats = [
        { label: 'My Submissions', value: campaigns.length, hint: 'Total campaign taxonomies' },
        { label: 'Pending Review', value: byStatus('submitted'), hint: 'Awaiting marketer' },
        { label: 'Approved', value: byStatus(['approved', 'active']), hint: 'Ready for deployment' },
        { label: 'Drafts', value: byStatus('draft'), hint: 'Not yet submitted' },
      ];
      break;
    case 'marketer':
      stats = [
        { label: 'Pending Approvals', value: byStatus('submitted'), hint: 'Action required' },
        { label: 'Approved Campaigns', value: byStatus(['approved', 'active']), hint: 'Signed off' },
        { label: 'Active Programs', value: programs.length, hint: 'Strategic initiatives' },
        { label: 'Top Topic Share', value: analytics ? `${analytics.keyMessageCoverage[0]?.sharePct ?? 0}%` : '—', hint: analytics?.keyMessageCoverage[0]?.categoryName },
      ];
      break;
    case 'analytics':
      stats = [
        { label: 'Overall Compliance', value: analytics ? `${analytics.overallComplianceRate}%` : '—', hint: 'Target > 95%' },
        { label: 'Open Discrepancies', value: analytics ? analytics.recentDiscrepancies.filter(d => !d.resolved).length : 0, hint: 'Needs resolution' },
        { label: 'Tracked Campaigns', value: analytics?.totalCampaigns ?? campaigns.length, hint: 'Across all agencies' },
        { label: 'Active Agencies', value: analytics?.activeAgencies ?? agencies.length, hint: 'Partner agencies' },
      ];
      break;
    case 'superadmin':
      stats = [
        { label: 'Partner Agencies', value: agencies.length, hint: 'Onboarded' },
        { label: 'Marketers', value: personas.filter(p => p.role === 'marketer').length, hint: 'Brand approvers' },
        { label: 'Analytics Leads', value: personas.filter(p => p.role === 'analytics').length, hint: 'Data & compliance' },
        { label: 'Master Topics', value: keyMessages.length, hint: 'Taxonomy categories' },
      ];
      break;
  }

  const quickLinks = navItemsForRole(user.role).filter(i => i.to !== '/overview');
  const activity = auditLogs.slice(0, 5);

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

      {/* Headline stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{s.value}</div>
            {s.hint && <div className="text-[11px] text-slate-400 font-medium mt-1">{s.hint}</div>}
          </div>
        ))}
      </div>

      {/* Quick links + activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Jump back in</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-rose-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">{label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-slate-400" />
            Recent activity
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm">
            {activity.length === 0 && (
              <div className="p-4 text-xs text-slate-400">No recent activity.</div>
            )}
            {activity.map(log => (
              <div key={log.id} className="p-3.5 space-y-0.5">
                <div className="text-[11px] font-mono font-bold text-rose-700">{log.action}</div>
                <div className="text-xs text-slate-700">{log.details}</div>
                <div className="text-[10px] text-slate-400 font-mono">{log.user} · {log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
