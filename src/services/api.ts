import {
  UserPersona,
  AgencyPartner,
  TherapeuticArea,
  Brand,
  KeyMessageCategory,
  ChannelTaxonomy,
  CampaignTaxonomy,
  AnalyticsSummary,
  SystemAuditLog,
  AutoTagResult
} from '../types';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchPersonas(): Promise<{ personas: UserPersona[]; currentPersonaId: string }> {
  const res = await fetch('/api/personas');
  return res.json();
}

/** Parse a JSON response; if the body isn't JSON (e.g. an HTML error page from a
 *  misconfigured host), return a readable error instead of throwing. */
async function readJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      error: res.ok
        ? 'The server returned an unexpected (non-JSON) response.'
        : `Auth service error ${res.status} ${res.statusText}. The API may not be deployed.`,
    };
  }
}

export async function loginRequest(email: string, password: string): Promise<{ success?: boolean; user?: UserPersona; error?: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return readJson(res);
}

export async function pinSession(personaId: string): Promise<{ success?: boolean; user?: UserPersona; error?: string }> {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaId })
  });
  return readJson(res);
}

export async function createUserPersona(data: Partial<UserPersona>): Promise<{ success: boolean; persona: UserPersona; personas: UserPersona[] }> {
  const res = await fetch('/api/personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateUserPersona(id: string, updates: Partial<UserPersona>): Promise<{ success: boolean; persona: UserPersona; personas: UserPersona[] }> {
  const res = await fetch(`/api/personas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteUserPersona(id: string): Promise<{ success: boolean; personas: UserPersona[] }> {
  const res = await fetch(`/api/personas/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function fetchAgencies(): Promise<{ agencies: AgencyPartner[] }> {
  const res = await fetch('/api/agencies');
  return res.json();
}

export async function createAgency(data: Partial<AgencyPartner>): Promise<{ success: boolean; agency: AgencyPartner; agencies: AgencyPartner[] }> {
  const res = await fetch('/api/agencies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateAgency(id: string, updates: Partial<AgencyPartner>): Promise<{ success: boolean; agency: AgencyPartner; agencies: AgencyPartner[] }> {
  const res = await fetch(`/api/agencies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteAgency(id: string): Promise<{ success: boolean; agencies: AgencyPartner[] }> {
  const res = await fetch(`/api/agencies/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function fetchTaxonomyMaster(): Promise<{
  therapeuticAreas: TherapeuticArea[];
  brands: Brand[];
  keyMessages: KeyMessageCategory[];
  channels: ChannelTaxonomy[];
}> {
  const res = await fetch('/api/taxonomy/all');
  return res.json();
}

export async function addKeyMessageSubcategory(data: {
  categoryId: string;
  categoryName?: string;
  subcategoryName: string;
  subcategoryCode?: string;
  description?: string;
  targetAudience?: string[];
}) {
  const res = await fetch('/api/taxonomy/keymessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchCampaigns(params?: { status?: string; agency?: string }): Promise<{ campaigns: CampaignTaxonomy[] }> {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/campaigns${query ? `?${query}` : ''}`);
  return res.json();
}

export async function createCampaign(campaignData: Partial<CampaignTaxonomy>): Promise<{ success: boolean; campaign: CampaignTaxonomy }> {
  const res = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaignData)
  });
  return res.json();
}

export async function updateCampaignStatus(id: string, status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active', notes?: string) {
  const res = await fetch(`/api/campaigns/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  return res.json();
}

export async function runAutoTagging(data: {
  creativeText: string;
  assetName?: string;
  targetAudience?: string;
  therapeuticAreaId?: string;
}): Promise<{
  success: boolean;
  analyzedLength: number;
  predictions: AutoTagResult[];
  recommendedTaxonomyCode: string;
}> {
  const res = await fetch('/api/autotag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchAnalytics(): Promise<{ analytics: AnalyticsSummary }> {
  const res = await fetch('/api/analytics');
  return res.json();
}

export async function resolveDiscrepancy(id: string) {
  const res = await fetch('/api/analytics/discrepancy/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  return res.json();
}

export async function fetchAuditLogs(): Promise<{ auditLogs: SystemAuditLog[] }> {
  const res = await fetch('/api/audit-logs');
  return res.json();
}
