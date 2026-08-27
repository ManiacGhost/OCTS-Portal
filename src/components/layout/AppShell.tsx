import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { usePersona } from '../../context/PersonaContext';
import { NotificationToastContainer } from '../common/NotificationToast';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedMarket } = usePersona();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-extrabold text-xs">
                O
              </div>
              <span className="font-extrabold tracking-tight">Omnia</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Market scope:</span>
              <span className="text-slate-800">{selectedMarket}</span>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 pl-2 pr-3 py-1.5 rounded-xl transition text-left"
              >
                <div className={`w-7 h-7 rounded-lg ${user.avatarBg || 'bg-rose-600'} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-40">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-sm font-bold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.roleTitle}</div>
                    <div className="text-[11px] text-slate-400">{user.organization}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <Sidebar variant="mobile" />
        </header>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>

        <footer className="bg-slate-900 text-slate-400 text-xs py-5 px-4 mt-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="font-semibold text-white">Omnia</span>
              <span>— Digital Content Taxonomy &amp; Metadata (DCTM)</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">v2.4</span>
          </div>
        </footer>
      </div>

      <NotificationToastContainer />
    </div>
  );
};
