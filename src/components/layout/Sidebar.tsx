import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { homePathFor } from '../../auth/home';
import { navItemsForRole, NavItem } from './nav';

interface SidebarProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

/** The icon sits in a small rounded tile that fills with the brand colour when its page is open. */
const IconTile: React.FC<{ icon: NavItem['icon']; active: boolean }> = ({ icon: Icon, active }) => (
  <span
    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
      active ? 'bg-navy-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-navy-700'
    }`}
  >
    <Icon className="w-4 h-4" />
  </span>
);

const itemCls = (active: boolean) =>
  `group flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-semibold transition ${
    active ? 'bg-navy-50 text-navy-800' : 'text-slate-600 hover:bg-slate-50 hover:text-navy-700'
  }`;

const isUnder = (pathname: string, to: string) => pathname === to || pathname.startsWith(to + '/');
const groupOf = (items: NavItem[], pathname: string) =>
  items.find(i => i.children?.some(c => isUnder(pathname, c.to)))?.label ?? null;

/** A nav item with sub-items: a toggle row that expands to show them, each with its description. The main
 *  row stays the strongest element (filled icon, darker band); the open sub-page is marked more quietly. */
const NavGroup: React.FC<{ item: NavItem; expanded: boolean; onToggle: () => void }> = ({ item, expanded, onToggle }) => {
  const { pathname } = useLocation();
  const children = item.children || [];
  const childActive = children.some(c => isUnder(pathname, c.to));

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`group flex w-full items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-bold transition ${
          childActive ? 'bg-navy-100 text-navy-900' : expanded ? 'bg-slate-50 text-navy-800' : 'text-slate-600 hover:bg-slate-50 hover:text-navy-700'
        }`}
      >
        <IconTile icon={item.icon} active={childActive} />
        <span className="flex-1 text-left leading-snug">{item.label}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${childActive ? 'text-navy-700' : 'text-slate-400'} ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-1.5 mb-1 ml-7 pl-3 border-l-2 border-navy-100 space-y-1">
          {children.map(({ to, label, description }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `relative block rounded-lg px-3 py-2 transition ${
                  isActive ? 'bg-white text-navy-800 ring-1 ring-navy-200' : 'text-slate-500 hover:bg-slate-50 hover:text-navy-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* a short bar on the guide line marks the open sub-page */}
                  {isActive && <span className="absolute -left-[14px] top-2 bottom-2 w-[3px] rounded-full bg-navy-600" />}
                  <span className={`block text-[13px] leading-snug ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                  {description && <span className="block text-[11px] leading-snug mt-0.5 text-slate-400">{description}</span>}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ variant = 'desktop', onNavigate }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const items = user ? navItemsForRole(user.role) : [];
  // only one main section is open at a time; going to a page opens the section it belongs to
  const [openGroup, setOpenGroup] = useState<string | null>(() => groupOf(items, pathname));
  const current = groupOf(items, pathname);
  useEffect(() => setOpenGroup(current), [current, pathname]);
  if (!user) return null;

  if (variant === 'mobile') {
    // a horizontal strip has no room for dropdowns: show a group's children inline instead
    const flat = items.flatMap(item => (item.children ? item.children : [item]));
    return (
      <nav className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-t border-slate-100 lg:hidden">
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
    // a floating rounded card, inset from the window edge
    <aside className="hidden lg:block lg:w-80 shrink-0 p-3 pr-0 min-h-0">
      <div className="flex flex-col h-full bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <Link to={homePathFor(user.role)} className="flex items-center justify-center" title="Home">
            <img src="/logo-full.png" alt="Tagging360 (DCTM)" className="h-20 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5" aria-label="Main">
          {items.map(item =>
            item.children ? (
              <NavGroup
                key={item.label}
                item={item}
                expanded={openGroup === item.label}
                onToggle={() => setOpenGroup(g => (g === item.label ? null : item.label))}
              />
            ) : (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => itemCls(isActive)}>
                {({ isActive }) => (
                  <>
                    <IconTile icon={item.icon} active={isActive} />
                    <span className="leading-snug">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        <div className="px-6 py-4 border-t border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Digital Content Taxonomy &amp; Metadata
        </div>
      </div>
    </aside>
  );
};
