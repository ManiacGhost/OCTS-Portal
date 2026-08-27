import React from 'react';
import { PersonaProvider, usePersona } from './context/PersonaContext';
import { Header } from './components/Header';
import { RoleGuideBanner } from './components/RoleGuideBanner';
import { AgencyDashboard } from './components/dashboards/AgencyDashboard';
import { MarketerDashboard } from './components/dashboards/MarketerDashboard';
import { AnalyticsDashboard } from './components/dashboards/AnalyticsDashboard';
import { ITDashboard } from './components/dashboards/ITDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { NotificationToastContainer } from './components/common/NotificationToast';
import { RefreshCw } from 'lucide-react';

const DashboardRouter: React.FC = () => {
  const { activeRole, isLoading } = usePersona();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-600">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        <div className="text-sm font-bold text-slate-900">Loading Gilead Omnichannel & Taxonomy Hub...</div>
        <p className="text-xs text-slate-500">Initializing Master Key Message Dictionary & Persona Rules</p>
      </div>
    );
  }

  switch (activeRole) {
    case 'agency':
      return <AgencyDashboard />;
    case 'marketer':
      return <MarketerDashboard />;
    case 'analytics':
      return <AnalyticsDashboard />;
    case 'it':
      return <ITDashboard />;
    case 'superadmin':
      return <SuperAdminDashboard />;
    default:
      return <AgencyDashboard />;
  }
};

export default function App() {
  return (
    <PersonaProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500 selection:text-white flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <Header />

          {/* Role Context Banner */}
          <RoleGuideBanner />

          {/* Main Dashboard Container */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardRouter />
          </main>
        </div>

        {/* Gilead Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 px-4 mt-16">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
              <span className="font-semibold text-white">Gilead Sciences Inc. • G-TOTS Portal</span>
              <span className="text-slate-400">— Omnichannel Campaign & Taxonomy Governance Engine</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Veeva CRM & SFMC Validated</span>
              <span>•</span>
              <a href="/api/export/csv?type=keymessages" download className="hover:text-teal-300 transition">
                Export Master Key Messages
              </a>
              <span>•</span>
              <span className="text-teal-400 font-mono">v2.4 Geometric Balance</span>
            </div>
          </div>
        </footer>

        {/* Toast Notification Container */}
        <NotificationToastContainer />

      </div>
    </PersonaProvider>
  );
}
