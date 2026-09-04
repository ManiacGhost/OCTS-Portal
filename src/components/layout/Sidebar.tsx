import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { homePathFor } from '../../auth/home';
import { navItemsForRole } from './nav';

interface SidebarProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ variant = 'desktop', onNavigate }) => {
  const { user } = useAuth();
  if (!user) return null;

  const items = navItemsForRole(user.role);

  if (variant === 'mobile') {
    return (
      <nav className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-slate-200 bg-white md:hidden">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isActive ? 'bg-navy-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 shrink-0 border-r border-slate-200 bg-white">
      <div className="px-5 py-5 border-b border-slate-100">
        <Link to={homePathFor(user.role)} className="flex items-center gap-2.5 group" title="Home">
          <div className="w-8 h-8 rounded-xl bg-navy-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
            O
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-slate-900 tracking-tight group-hover:text-navy-700 transition">Omnia</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">DCTM</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-navy-50 text-navy-800 border border-navy-200'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
        Digital Content Taxonomy &amp; Metadata
      </div>
    </aside>
  );
};
