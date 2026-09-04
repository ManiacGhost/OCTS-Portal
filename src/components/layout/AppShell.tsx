import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { homePathFor } from '../../auth/home';
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
            <Link to={homePathFor(user.role)} className="flex items-center gap-2 md:hidden" title="Home">
              <div className="w-7 h-7 rounded-lg bg-navy-600 text-white flex items-center justify-center font-extrabold text-xs">
                O
              </div>
              <span className="font-extrabold tracking-tight">Omnia</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Market scope:</span>
              <span className="text-slate-800">{selectedMarket}</span>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 pl-2.5 pr-3.5 py-2 rounded-xl transition text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${user.avatarBg || 'bg-navy-600'} text-white flex items-center justify-center font-bold text-base shrink-0`}>
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-40">
                  <div className="flex items-center gap-3.5 px-5 py-4 border-b border-slate-100">
                    <div className={`w-12 h-12 rounded-xl ${user.avatarBg || 'bg-navy-600'} text-white flex items-center justify-center font-bold text-lg shrink-0`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-extrabold text-slate-900 truncate">{user.name}</div>
                      <div className="text-sm text-slate-600 truncate">{user.roleTitle}</div>
                      <div className="text-xs text-slate-400 truncate">{user.organization}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-base font-semibold text-navy-700 hover:bg-navy-50 transition"
                  >
                    <LogOut className="w-5 h-5" />
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
              <div className="w-2 h-2 rounded-full bg-navy-400" />
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
