import {
  CheckSquare,
  BarChart3,
  BookOpen,
  ShieldAlert,
  Tags,
  Database,
  FileText,
  LifeBuoy,
  Link2,
  LayoutList,
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

/** Mirrors the landing-page tiles: the four components of the tagging & taxonomy model, then the rest. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/tagging-strategy', label: 'Summary', icon: LayoutList, roles: LAUNCHER_ROLES },
  { to: '/utm', label: 'GA Tagging', icon: Link2, roles: LAUNCHER_ROLES },
  { to: '/autotag', label: 'Content Tagging', icon: Tags, roles: LAUNCHER_ROLES },
  { to: '/content-mdm', label: 'Content MDM', icon: Database, roles: LAUNCHER_ROLES },
  { to: '/overview', label: 'Content Metadata', icon: FileText, roles: ['agency', 'marketer', 'analytics', 'superadmin'] },
  { to: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['marketer'] },
  { to: '/compliance', label: 'Compliance', icon: BarChart3, roles: ['analytics'] },
  { to: '/admin', label: 'Administration', icon: ShieldAlert, roles: ['superadmin'] },
  { to: '/dictionary', label: 'Dictionary', icon: BookOpen, roles: ['agency', 'marketer', 'analytics', 'superadmin'] },
  { to: '/help', label: 'Help', icon: LifeBuoy, roles: LAUNCHER_ROLES },
];

export function navItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter(item => item.roles.includes(role));
}
