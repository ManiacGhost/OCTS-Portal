export interface UserCredentials {
  email: string;
  password: string;
  personaId: string;
  role: 'agency' | 'marketer' | 'analytics' | 'superadmin';
  name: string;
  roleTitle: string;
  organization: string;
  badgeColor: string;
  avatarBg: string;
  description: string;
}

export const DUMMY_CREDENTIALS: UserCredentials[] = [
  {
    email: 'sarah.chen@havas.com',
    password: 'agency123',
    personaId: 'persona-agency',
    role: 'agency',
    name: 'Sarah Chen',
    roleTitle: 'Omnichannel Campaign & Tagging Lead',
    organization: 'Klick Health',
    badgeColor: 'bg-navy-100 text-navy-800 border-navy-200',
    avatarBg: 'bg-navy-600',
    description: 'Builds Yescarta & Tecartus taxonomy strings from the approved Kite formulas and submits validated campaigns.'
  },
  {
    email: 'marcus.vance@biopharma-enterprise.com',
    password: 'marketer123',
    personaId: 'persona-marketer',
    role: 'marketer',
    name: 'Dr. Marcus Vance',
    roleTitle: 'Senior Brand Director, Cell Therapy',
    organization: 'Kite Pharma, a Gilead Company',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    avatarBg: 'bg-blue-600',
    description: 'Manages agencies and their taxonomy, and reviews/approves every agency campaign submission for Yescarta & Tecartus.'
  },
  {
    email: 'elena.rostova@biopharma-enterprise.com',
    password: 'analytics123',
    personaId: 'persona-analytics',
    role: 'analytics',
    name: 'Elena Rostova',
    roleTitle: 'Omnichannel Data & Compliance Lead',
    organization: 'Kite Pharma, a Gilead Company',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    avatarBg: 'bg-purple-600',
    description: 'Monitors taxonomy compliance and audits metadata drift across Digital, Social, Search and SFMC.'
  },
  {
    email: 'alexis.thorne@biopharma-enterprise.com',
    password: 'admin123',
    personaId: 'persona-superadmin',
    role: 'superadmin',
    name: 'Alexis Thorne',
    roleTitle: 'Master Taxonomy Governance Director',
    organization: 'Kite Pharma, a Gilead Company',
    badgeColor: 'bg-slate-200 text-slate-900 border-slate-300',
    avatarBg: 'bg-slate-800',
    description: 'Unrestricted master authority to edit the taxonomy master dictionary and inspect system audit trails.'
  }
];
