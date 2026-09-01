import {
  LayoutDashboard,
  FilePlus2,
  CheckSquare,
  BarChart3,
  BookOpen,
  ShieldAlert,
  Sparkles,
  LifeBuoy,
  LucideIcon,
} from 'lucide-react';
import { UserRole } from '../../types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const LAUNCHER_ROLES: UserRole[] = ['agency', 'marketer', 'analytics'];

export const NAV_ITEMS: NavItem[] = [
  { to: '/overview', label: 'Campaigns', icon: LayoutDashboard, roles: ['agency', 'marketer', 'analytics', 'superadmin'] },
  { to: '/campaigns', label: 'Campaign Builder', icon: FilePlus2, roles: ['agency'] },
  { to: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['marketer'] },
  { to: '/compliance', label: 'Compliance', icon: BarChart3, roles: ['analytics'] },
  { to: '/admin', label: 'Administration', icon: ShieldAlert, roles: ['superadmin'] },
  { to: '/dictionary', label: 'Content Metadata', icon: BookOpen, roles: ['agency', 'marketer', 'analytics', 'superadmin'] },
  { to: '/autotag', label: 'Auto Tagging', icon: Sparkles, roles: LAUNCHER_ROLES },
  { to: '/help', label: 'Help', icon: LifeBuoy, roles: LAUNCHER_ROLES },
];

export function navItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter(item => item.roles.includes(role));
}
