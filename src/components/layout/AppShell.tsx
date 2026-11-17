import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Globe, ArrowLeftRight, Bell } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { homePathFor } from '../../auth/home';
import { usePersona } from '../../context/PersonaContext';
import { NotificationToastContainer } from '../common/NotificationToast';
import { Sidebar } from './Sidebar';
import { BrandLogo } from '../common/BrandLogo';
import { useNotifications } from '../../data/kiteDictionary';
import { roleLabel } from '../../auth/permissions';

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedMarket, activeBrand, allowedBrands, setBrandPickerOpen } = usePersona();
  const navigate = useNavigate();
  const { unread } = useNotifications(user ? { name: user.name, role: user.role } : null);

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
    // a fixed-height app frame: the footer stays at the bottom of the screen and only the page content scrolls
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900">
     <div className="flex flex-1 min-h-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top bar: a floating rounded bar, like the sidebar */}
        <header data-shell="header" className="relative z-30 shrink-0 px-3 sm:px-4 pt-3">
          <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-2.5">
              <Link to={homePathFor(user.role)} className="flex items-center gap-2 lg:hidden" title="Home">
                <img src="/logo-full.png" alt="Tagging360" className="h-11 w-auto" />
              </Link>

              {/* where you are working: the market and the brand, as one compact context bar */}
              <div className="flex items-center min-w-0 h-12 bg-slate-50/80 border border-slate-200 rounded-xl">
                <div className="hidden lg:flex items-center gap-2.5 px-4 h-full">
                  <Globe className="w-4 h-4 text-navy-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Market</span>
                  <span className="text-sm font-bold text-slate-800 whitespace-nowrap">{selectedMarket}</span>
                </div>

                {activeBrand && (
                  <div className="flex items-center gap-3 pl-4 pr-1.5 h-full lg:border-l border-slate-200">
                    <span className="hidden sm:inline text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Brand</span>
                    <span className="flex items-center" title={activeBrand.name}>
                      <BrandLogo brand={activeBrand} size="md" />
                    </span>
                    {allowedBrands.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBrandPickerOpen(true)}
                        title="Change brand"
                        className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 bg-white hover:bg-navy-600 hover:text-white border border-slate-200 hover:border-navy-600 rounded-lg px-2.5 py-1.5 shadow-sm transition"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Switch</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dictionary?tab=notifications')}
                  title={unread > 0 ? `${unread} new notification${unread === 1 ? '' : 's'}` : 'Notifications'}
                  aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
                  className="relative p-2.5 rounded-xl text-slate-600 hover:text-navy-700 hover:bg-slate-50 transition"
                >
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(o => !o)}
                    className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 pl-1.5 pr-3 py-1.5 rounded-xl transition text-left"
                  >
                    <div className={`w-9 h-9 rounded-lg ${user.avatarBg || 'bg-navy-600'} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block leading-tight">
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500">{roleLabel(user.role)}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-40">
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
            </div>

            <Sidebar variant="mobile" />
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto">
          <div data-shell="content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <Outlet />
          </div>
        </main>

      </div>
     </div>

      <footer data-shell="footer" className="shrink-0 bg-slate-900 text-slate-400 text-xs py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-navy-400" />
            <span className="font-wordmark font-semibold text-white">Tagging360</span>
            <span>· Digital Content Taxonomy &amp; Metadata (DCTM)</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">v2.4</span>
        </div>
      </footer>
      <NotificationToastContainer />
    </div>
  );
};
