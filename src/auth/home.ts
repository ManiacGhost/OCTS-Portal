import { UserRole } from '../types';

/**
 * Where a role lands after sign-in. Superadmin goes straight to the dashboard;
 * every other role first sees the full-screen tile launcher at `/`.
 */
export function homePathFor(role: UserRole | undefined): string {
  return role === 'superadmin' ? '/overview' : '/';
}
