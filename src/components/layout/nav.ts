import { LayoutDashboard, FilePlus2, CheckSquare, BarChart3, BookOpen, ShieldAlert, LucideIcon } from 'lucide-react';
import { UserRole } from '../../types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard, roles: ['agency', 'marketer', 'analytics', 'superadmin'] },
  { to: '/campaigns', label: 'Campaign Builder', icon: FilePlus2, roles: ['agency'] },
  { to: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['marketer'] },
  { to: '/compliance', label: 'Compliance', icon: BarChart3, roles: ['analytics'] },
  { to: '/admin', label: 'Administration', icon: ShieldAlert, roles: ['superadmin'] },
  { to: '/dictionary', label: 'Taxonomy Dictionary', icon: BookOpen, roles: ['agency', 'marketer', 'analytics', 'superadmin'] },
];

export function navItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter(item => item.roles.includes(role));
}
