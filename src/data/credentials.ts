export interface UserCredentials {
  email: string;
  password: string;
  personaId: string;
  role: 'agency' | 'marketer' | 'analytics' | 'it' | 'superadmin';
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
    organization: 'Havas Health & Publicis Media',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    avatarBg: 'bg-rose-600',
    description: 'Builds campaign taxonomy strings, topic/subtopic mappings, and submits validated campaign tracking codes.'
  },
  {
    email: 'marcus.vance@biopharma-enterprise.com',
    password: 'marketer123',
    personaId: 'persona-marketer',
    role: 'marketer',
    name: 'Dr. Marcus Vance',
    roleTitle: 'Senior Brand Director, Oncology',
    organization: 'Global Commercial Operations',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    avatarBg: 'bg-blue-600',
    description: 'Governs brand message alignment, reviews and approves agency taxonomy submissions, and monitors topic share.'
  },
  {
    email: 'elena.rostova@biopharma-enterprise.com',
    password: 'analytics123',
    personaId: 'persona-analytics',
    role: 'analytics',
    name: 'Elena Rostova',
    roleTitle: 'Omnichannel Data & Compliance Lead',
    organization: 'Global Commercial Operations',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    avatarBg: 'bg-purple-600',
    description: 'Monitors global taxonomy compliance, audits metadata drift across Veeva CRM, SFMC, and Adobe.'
  },
  {
    email: 'david.kim@biopharma-enterprise.com',
    password: 'it123',
    personaId: 'persona-it',
    role: 'it',
    name: 'David Kim',
    roleTitle: 'Enterprise Integration & Data Architect',
    organization: 'Global Commercial Operations',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    avatarBg: 'bg-amber-600',
    description: 'Manages enterprise API connectors for Veeva, SFMC, and Adobe, enforcing field schema validation rules.'
  },
  {
    email: 'alexis.thorne@biopharma-enterprise.com',
    password: 'admin123',
    personaId: 'persona-superadmin',
    role: 'superadmin',
    name: 'Alexis Thorne',
    roleTitle: 'Master Taxonomy Governance Director',
    organization: 'Global Commercial Operations',
    badgeColor: 'bg-slate-200 text-slate-900 border-slate-300',
    avatarBg: 'bg-slate-800',
    description: 'Unrestricted master authority to edit taxonomy master dictionary and inspect system audit trails.'
  }
];
