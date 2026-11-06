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
  Link,
  ListChecks,
  FilePlus,
  LayoutList,
  LucideIcon,
} from 'lucide-react';
import { UserRole } from '../../types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  /** sub-items: when present the item is a dropdown group (its own `to` is only the fallback link) */
  children?: NavItem[];
}

const LAUNCHER_ROLES: UserRole[] = ['agency', 'marketer', 'analytics'];

/** Mirrors the landing-page tiles: the four components of the tagging & taxonomy model, then the rest. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/tagging-strategy', label: 'Brand Tagging Strategy (Summary)', icon: LayoutList, roles: LAUNCHER_ROLES },
  // dropdown: the campaign listing, the creation flow (agencies) and the UTM Generator
  {
    to: '/overview',
    label: 'Campaign Management (GA)',
    icon: Link2,
    roles: ['agency', 'marketer', 'analytics', 'superadmin'],
    children: [
      { to: '/overview', label: 'Campaign Listing', icon: ListChecks, roles: ['agency', 'marketer', 'analytics', 'superadmin'] },
      { to: '/campaigns/new', label: 'Campaign Creation', icon: FilePlus, roles: ['agency'] },
      { to: '/utm', label: 'UTM Generator', icon: Link, roles: LAUNCHER_ROLES },
    ],
  },
  { to: '/autotag', label: 'Content Tagging/Mapping', icon: Tags, roles: LAUNCHER_ROLES },
  { to: '/content-mdm', label: 'Content MDM', icon: Database, roles: LAUNCHER_ROLES },
  { to: '/content-metadata', label: 'Journey Metadata', icon: FileText, roles: LAUNCHER_ROLES },
  { to: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['marketer'] },
  { to: '/compliance', label: 'Compliance', icon: BarChart3, roles: ['analytics'] },
  { to: '/admin', label: 'Administration', icon: ShieldAlert, roles: ['superadmin'] },
  { to: '/dictionary', label: 'Dictionary', icon: BookOpen, roles: ['agency', 'marketer', 'analytics', 'superadmin'] },
  { to: '/help', label: 'Help', icon: LifeBuoy, roles: LAUNCHER_ROLES },
];

export function navItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter(item => item.roles.includes(role)).map(item =>
    item.children ? { ...item, children: item.children.filter(c => c.roles.includes(role)) } : item
  );
}
