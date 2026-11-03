import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PersonaProvider } from './context/PersonaContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { useAuth } from './auth/AuthContext';
import { homePathFor } from './auth/home';
import { LoginPage } from './pages/LoginPage';
import { LauncherPage } from './pages/LauncherPage';
import { OverviewPage } from './pages/OverviewPage';
import { DictionaryPage } from './pages/DictionaryPage';
import { AutoTaggingPage } from './pages/AutoTaggingPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { AUTOTAG_ENABLED } from './data/autoTagModel';
import { TagStrategyPage } from './pages/TagStrategyPage';
import { ContentMdmPage } from './pages/ContentMdmPage';
import { UtmGeneratorPage } from './pages/UtmGeneratorPage';
import { HelpPage } from './pages/HelpPage';
import { AgencyDashboard } from './components/dashboards/AgencyDashboard';
import { MarketerDashboard } from './components/dashboards/MarketerDashboard';
import { AnalyticsDashboard } from './components/dashboards/AnalyticsDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { UserRole } from './types';

const RoleRoute: React.FC<{ roles: UserRole[]; children: React.ReactNode }> = ({ roles, children }) => (
  <ProtectedRoute roles={roles}>{children}</ProtectedRoute>
);

const RoleHomeRedirect: React.FC = () => {
  const { user } = useAuth();
  return <Navigate to={homePathFor(user?.role)} replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <PersonaProvider>
              <Outlet />
            </PersonaProvider>
          </ProtectedRoute>
        }
      >
        {/* Full-screen launcher — no shell */}
        <Route path="/" element={<LauncherPage />} />

        {/* Everything else lives inside the sidebar shell */}
        <Route element={<AppShell />}>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route
            path="/autotag"
            element={
              <RoleRoute roles={['agency', 'marketer', 'analytics']}>
                {AUTOTAG_ENABLED ? <AutoTaggingPage /> : <ComingSoonPage title="Content Tagging" />}
              </RoleRoute>
            }
          />
          <Route
            path="/tagging-strategy"
            element={<RoleRoute roles={['agency', 'marketer', 'analytics']}><TagStrategyPage /></RoleRoute>}
          />
          <Route
            path="/brand-strategy"
            element={<RoleRoute roles={['agency', 'marketer', 'analytics']}><TagStrategyPage variant="brand" /></RoleRoute>}
          />
          <Route
            path="/content-mdm"
            element={<RoleRoute roles={['agency', 'marketer', 'analytics']}><ContentMdmPage /></RoleRoute>}
          />
          <Route
            path="/utm"
            element={<RoleRoute roles={['agency', 'marketer', 'analytics']}><UtmGeneratorPage /></RoleRoute>}
          />
          <Route
            path="/help"
            element={<RoleRoute roles={['agency', 'marketer', 'analytics']}><HelpPage /></RoleRoute>}
          />
          <Route path="/campaigns/new" element={<RoleRoute roles={['agency']}><AgencyDashboard /></RoleRoute>} />
          <Route path="/campaigns" element={<Navigate to="/overview" replace />} />
          <Route path="/approvals" element={<RoleRoute roles={['marketer']}><MarketerDashboard /></RoleRoute>} />
          <Route path="/compliance" element={<RoleRoute roles={['analytics']}><AnalyticsDashboard /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute roles={['superadmin']}><SuperAdminDashboard /></RoleRoute>} />
          <Route path="*" element={<RoleHomeRedirect />} />
        </Route>
      </Route>

      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
  );
}
