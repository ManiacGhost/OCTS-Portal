import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import { TaxonomyDictionaryView } from '../common/TaxonomyDictionaryView';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Check,
  RefreshCw,
  PieChart,
  ShieldAlert,
  Zap,
  Briefcase
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const {
    analytics,
    refreshAnalytics,
    showToast,
    programs
  } = usePersona();

  const [activeTab, setActiveTab] = useState<'compliance' | 'discrepancies' | 'exports'>('compliance');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      const res = await fetch('/api/analytics/discrepancy/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Discrepancy marked as resolved!', 'success');
        await refreshAnalytics();
      }
    } finally {
      setResolvingId(null);
    }
  };

  if (!analytics) return null;

  return (
    <div className="space-y-6 text-slate-900">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Compliance</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitor taxonomy compliance across downstream engines, audit discrepancies, and export governance data.
        </p>
      </div>

      {/* Analytics Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'compliance' ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Platform Compliance & Topic Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('discrepancies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'discrepancies' ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Discrepancy Auditor ({analytics.recentDiscrepancies.filter(d => !d.resolved).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'exports' ? 'bg-navy-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Taxonomy Data Export Center</span>
        </button>
      </div>

      {/* Tab 1: Platform Compliance */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Platform Health Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-navy-600" />
                    Compliance Rate by Downstream Engine
                  </h3>
                  <p className="text-xs text-slate-500">Veeva CRM, SFMC, Adobe, and Paid Search integrity.</p>
                </div>
              </div>

              <div className="space-y-3">
                {analytics.taxonomyErrorsByPlatform.map((plat, i) => (
                  <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{plat.platform}</span>
                      <span className="font-mono text-navy-700 font-extrabold">{plat.compliancePct}% Compliance</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-navy-600 h-full rounded-full"
                        style={{ width: `${plat.compliancePct}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 font-medium">
                      <span>Flagged Errors: {plat.errorCount}</span>
                      <span className="text-slate-400 font-mono">Synced Realtime</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Share Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-navy-600" />
                    Topic Share Coverage
                  </h3>
                  <p className="text-xs text-slate-500">Share of total omnichannel campaign volume by Topic Strategy.</p>
                </div>
              </div>

              <div className="space-y-3">
                {analytics.keyMessageCoverage.map((km, i) => (
                  <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{km.categoryName}</span>
                      <span className="font-mono text-navy-800 font-bold">{km.sharePct}% ({km.campaignCount} campaigns)</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-navy-600 h-full rounded-full"
                        style={{ width: `${km.sharePct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Agency Compliance Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Agency Taxonomy Compliance Scorecard</h3>
                <p className="text-xs text-slate-500">Evaluates media agencies on taxonomy adherence and metadata accuracy.</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="p-3">Agency Name</th>
                    <th className="p-3">Campaigns Submitted</th>
                    <th className="p-3">Taxonomy Compliance Score</th>
                    <th className="p-3">Flagged Errors</th>
                    <th className="p-3">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.agencyComplianceLeaderboard.map((ag, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">{ag.agencyName}</td>
                      <td className="p-3 font-mono font-medium">{ag.campaignsSubmitted}</td>
                      <td className="p-3 font-mono text-navy-700 font-extrabold">{ag.complianceScore}%</td>
                      <td className="p-3 font-mono text-amber-700 font-bold">{ag.flaggedErrors}</td>
                      <td className="p-3">
                        <span className="text-[10px] bg-navy-50 text-navy-700 font-bold px-2 py-0.5 rounded border border-navy-200 uppercase tracking-wider">
                          PASSED AUDIT
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Discrepancy Auditor */}
      {activeTab === 'discrepancies' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Metadata & Taxonomy Discrepancy Auditor
              </h3>
              <p className="text-xs text-slate-500">
                Identifies metadata drift between Master Commercial Taxonomy and downstream engines (Veeva, SFMC, Adobe).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.recentDiscrepancies.map((disc) => (
              <div
                key={disc.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  disc.resolved
                    ? 'bg-slate-50 border-slate-200 text-slate-500 opacity-75'
                    : 'bg-amber-50/70 border-amber-200 text-slate-900'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      {disc.campaignCode}
                    </span>
                    <span className="text-xs font-bold text-slate-800">Platform: {disc.platform}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-bold">
                    {disc.issueType}
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Detected: {disc.detectedAt}
                  </div>
                </div>

                <div className="shrink-0">
                  {disc.resolved ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      <Check className="w-4 h-4" /> Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolve(disc.id)}
                      disabled={resolvingId === disc.id}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      {resolvingId === disc.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Resolve Discrepancy</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Export Center */}
      {activeTab === 'exports' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-navy-600" />
                Master Taxonomy Data Export Center
              </h3>
              <p className="text-xs text-slate-500">
                Export complete master taxonomy dictionaries, Topic/Subtopic structures, and campaign metadata tracking sheets for media planning.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Campaign Taxonomy Export (CSV)</h4>
              <p className="text-xs text-slate-500">
                <strong>Description:</strong> Downloads standard campaign taxonomy strings, Topic & Subtopic codes, UTM source/medium parameters, agency owners, and compliance scores formatted for media planning sheets and Veeva CRM imports.
              </p>
              <a
                href="/api/export/csv?type=campaigns"
                download
                className="inline-flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Campaign Taxonomy CSV</span>
              </a>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Master Topic & Subtopic Dictionary (CSV)</h4>
              <p className="text-xs text-slate-500">
                <strong>Description:</strong> Downloads all Therapeutic Areas, Brands, Topic codes, and Subtopic codes used as the master taxonomy source of truth.
              </p>
              <a
                href="/api/export/csv?type=keymessages"
                download
                className="inline-flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Topic & Subtopic Dictionary CSV</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

