import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { homePathFor } from '../../auth/home';
import { navItemsForRole, NavItem } from './nav';

interface SidebarProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

/** A nav item with sub-items: a toggle row that expands to show them. Opens by itself when the
 *  current page is one of its children. */
const NavGroup: React.FC<{ item: NavItem }> = ({ item }) => {
  const { pathname } = useLocation();
  const children = item.children || [];
  const childActive = children.some(c => pathname === c.to || pathname.startsWith(c.to + '/'));
  const [open, setOpen] = useState(childActive);
  const expanded = open || childActive;
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={expanded}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition border ${
          childActive
            ? 'bg-navy-50 text-navy-800 border-navy-200'
            : 'text-slate-600 hover:bg-slate-100 border-transparent'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-1 ml-5 pl-3 border-l border-slate-200 space-y-0.5">
          {children.map(({ to, label, icon: ChildIcon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition ${
                  isActive ? 'bg-navy-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <ChildIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ variant = 'desktop', onNavigate }) => {
  const { user } = useAuth();
  if (!user) return null;

  const items = navItemsForRole(user.role);

  if (variant === 'mobile') {
    // a horizontal strip has no room for dropdowns: show a group's children inline instead
    const flat = items.flatMap(item => (item.children ? item.children : [item]));
    return (
      <nav className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-slate-200 bg-white md:hidden">
        {flat.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
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
          <img src="/logo-full.png" alt="Tagging360 (DCTM)" className="h-20 w-auto mx-auto" />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(item =>
          item.children ? (
            <NavGroup key={item.label} item={item} />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-navy-50 text-navy-800 border border-navy-200'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="px-5 py-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
        Digital Content Taxonomy &amp; Metadata
      </div>
    </aside>
  );
};
