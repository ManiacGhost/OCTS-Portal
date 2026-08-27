import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Code2,
  Database,
  Terminal,
  Activity,
  Zap,
  Globe,
  Shield,
  Check
} from 'lucide-react';

export const ITDashboard: React.FC = () => {
  const {
    connectors,
    auditLogs,
    triggerSync,
    showToast
  } = usePersona();

  const [activeTab, setActiveTab] = useState<'connectors' | 'schema' | 'logs'>('connectors');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleManualSync = async (id: string) => {
    setSyncingId(id);
    try {
      await triggerSync(id);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* IT KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 border-l-4 border-l-rose-600 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Connected Enterprise APIs</span>
            <Database className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{connectors.length} Platforms</div>
          <p className="text-[11px] text-rose-700 font-bold">Veeva • SFMC • Adobe • Doximity</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-rose-500 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Synced Fields</span>
            <Code2 className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">125 Fields</div>
          <p className="text-[11px] text-rose-700 font-bold">Realtime Webhook Sync</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-slate-600 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Validation Rules</span>
            <Sliders className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">14 Active</div>
          <p className="text-[11px] text-slate-500 font-medium">Character & Format Enforced</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>System Health</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">100% Operational</div>
          <p className="text-[11px] text-slate-500 font-medium">0 Outages in 90 Days</p>
        </div>
      </div>

      {/* IT Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('connectors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'connectors' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Enterprise Connectors & API Endpoints</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'schema' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Field Schema & Rules Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logs' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>API Webhook Sync Logs</span>
        </button>
      </div>

      {/* Tab 1: Connectors */}
      {activeTab === 'connectors' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-600" />
                Downstream Enterprise API Connectors
              </h3>
              <p className="text-xs text-slate-500">
                Maintains bidirectional taxonomy synchronization between Master Taxonomy and commercial engines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectors.map((conn) => (
              <div key={conn.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h4 className="font-bold text-sm text-slate-900">{conn.name}</h4>
                  </div>
                  <span className="text-[10px] bg-white border border-slate-200 font-mono text-rose-800 px-2 py-0.5 rounded font-bold">
                    {conn.type}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 truncate font-medium">
                  {conn.endpointUrl}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Synced Fields: <strong className="text-slate-900">{conn.syncedFieldsCount}</strong></span>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">Last Sync: {conn.lastSync}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {conn.schemaRules.map((rule, idx) => (
                      <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                        {rule}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleManualSync(conn.id)}
                    disabled={syncingId === conn.id}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingId === conn.id ? 'animate-spin' : ''}`} />
                    <span>Sync API</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Field Schema */}
      {activeTab === 'schema' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-rose-600" />
                Field Schema Validation Rules Engine
              </h3>
              <p className="text-xs text-slate-500">
                Enforces character length, character encoding, and required Topic/Subtopic metadata across commercial systems.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Veeva Vault Promomats Rule #01: Max_UTM_Length_255</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-600">
                Restricts standard campaign taxonomy string to &le; 128 characters to prevent truncation in Veeva CRM Approved Email links.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">SFMC Data Extension Rule #02: Topic_Subtopic_Required</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-600">
                Ensures all SFMC journey emails contain a validated Subtopic Code prefix in <code className="text-rose-800 font-mono font-bold">utm_content</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: API Sync Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-rose-600" />
                API Webhook & Audit Event Stream
              </h3>
              <p className="text-xs text-slate-500">Live system audit trail of taxonomy changes and connector syncs.</p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-2 max-h-80 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="border-b border-slate-800 pb-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>[{log.timestamp}]</span>
                  <span className="text-rose-400 font-bold">{log.action}</span>
                </div>
                <div className="text-white mt-0.5">
                  User: <strong>{log.user}</strong> ({log.role}) &bull; Target: <span className="text-rose-300">{log.target}</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

