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
            element={<RoleRoute roles={['agency', 'marketer', 'analytics']}><AutoTaggingPage /></RoleRoute>}
          />
          <Route
            path="/help"
            element={<RoleRoute roles={['agency', 'marketer', 'analytics']}><HelpPage /></RoleRoute>}
          />
          <Route path="/campaigns" element={<RoleRoute roles={['agency']}><AgencyDashboard /></RoleRoute>} />
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
