import type { UserRole } from '../types';

/** Roles that build campaigns and tactics: create, edit, clone, delete, add tactics. */
export const AUTHOR_ROLES: UserRole[] = ['agency', 'marketer'];
export const canAuthor = (role?: UserRole | null) => !!role && AUTHOR_ROLES.includes(role);

/** The marketer is the approver: what they create or change is approved straight away, with no review step. */
export const selfApproves = (role?: UserRole | null) => role === 'marketer';

/** How each role is named on screen. */
export const ROLE_LABEL: Record<UserRole, string> = {
  agency: 'Agency',
  marketer: 'Marketer/Admin',
  analytics: 'Analytics',
  superadmin: 'Super admin',
};
export const roleLabel = (role?: UserRole | null) => (role ? ROLE_LABEL[role] ?? role : '');
