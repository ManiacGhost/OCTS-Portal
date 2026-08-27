import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PersonaProvider } from './context/PersonaContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { DictionaryPage } from './pages/DictionaryPage';
import { AgencyDashboard } from './components/dashboards/AgencyDashboard';
import { MarketerDashboard } from './components/dashboards/MarketerDashboard';
import { AnalyticsDashboard } from './components/dashboards/AnalyticsDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { UserRole } from './types';

const RoleRoute: React.FC<{ roles: UserRole[]; children: React.ReactNode }> = ({ roles, children }) => (
  <ProtectedRoute roles={roles}>{children}</ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <PersonaProvider>
              <AppShell />
            </PersonaProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/dictionary" element={<DictionaryPage />} />
        <Route path="/campaigns" element={<RoleRoute roles={['agency']}><AgencyDashboard /></RoleRoute>} />
        <Route path="/approvals" element={<RoleRoute roles={['marketer']}><MarketerDashboard /></RoleRoute>} />
        <Route path="/compliance" element={<RoleRoute roles={['analytics']}><AnalyticsDashboard /></RoleRoute>} />
        <Route path="/admin" element={<RoleRoute roles={['superadmin']}><SuperAdminDashboard /></RoleRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
