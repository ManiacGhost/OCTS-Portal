import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isHydrating } = useAuth();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <RefreshCw className="w-7 h-7 animate-spin text-rose-600" />
        <p className="text-xs font-semibold text-slate-500">Restoring your session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/overview" replace />;
  }

  return <>{children}</>;
};
