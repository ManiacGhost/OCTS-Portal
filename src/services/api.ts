/**
 * Client-side data layer — this app runs entirely statically now (no Express/serverless
 * backend at runtime; `server.ts` + `api/*.ts` remain for local dev only, see server.ts).
 *
 * Every function below keeps the exact name/signature/return-shape the old `fetch('/api/...')`
 * version had, so every consumer (`PersonaContext.tsx`, `AuthContext.tsx`, dashboards) needed
 * zero changes beyond the two places that bypassed this module with a raw `fetch()` — those were
 * switched to call the matching function here instead (see `SuperAdminDashboard.tsx`,
 * `AnalyticsDashboard.tsx`).
 *
 * State lives in a module-level store seeded from `mockData.ts`, persisted to `localStorage` so
 * campaigns/personas/etc. created in a session survive a reload (a real backend will replace all
 * of this later — every function here is a drop-in target for a real fetch call).
 */
import {
  UserPersona,
  AgencyPartner,
  TherapeuticArea,
  Brand,
  KeyMessageCategory,
  KeyMessageSubcategory,
  ChannelTaxonomy,
  CampaignTaxonomy,
  AnalyticsSummary,
  SystemAuditLog,
  AutoTagResult,
} from '../types';
import {
  INITIAL_PERSONAS,
  INITIAL_AGENCIES,
  INITIAL_THERAPEUTIC_AREAS,
  INITIAL_BRANDS,
  INITIAL_KEY_MESSAGES,
  INITIAL_CHANNELS,
  INITIAL_CAMPAIGNS,
  INITIAL_ANALYTICS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { DUMMY_CREDENTIALS } from '../data/credentials';

const STORE_KEY = 'tagging360.localdb.v1';

interface LocalStore {
  personas: UserPersona[];
  agencies: AgencyPartner[];
  currentPersonaId: string;
  therapeuticAreas: TherapeuticArea[];
  brands: Brand[];
  keyMessages: KeyMessageCategory[];
  channels: ChannelTaxonomy[];
  campaigns: CampaignTaxonomy[];
  analytics: AnalyticsSummary;
  auditLogs: SystemAuditLog[];
}

function seedStore(): LocalStore {
  return {
    personas: [...INITIAL_PERSONAS],
    agencies: [...INITIAL_AGENCIES],
    currentPersonaId: 'persona-agency',
    therapeuticAreas: [...INITIAL_THERAPEUTIC_AREAS],
    brands: [...INITIAL_BRANDS],
    keyMessages: [...INITIAL_KEY_MESSAGES],
    channels: [...INITIAL_CHANNELS],
    campaigns: [...INITIAL_CAMPAIGNS],
    analytics: { ...INITIAL_ANALYTICS },
    auditLogs: [...INITIAL_AUDIT_LOGS],
  };
}

function loadStore(): LocalStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return seedStore();
    const parsed = JSON.parse(raw);
    // Merge onto a fresh seed so a field added later (e.g. a new mock campaign) isn't lost
    // just because an older snapshot is sitting in someone's browser.
    return { ...seedStore(), ...parsed };
  } catch {
    return seedStore();
  }
}

const db: LocalStore = loadStore();

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable (private browsing, quota) — state just won't survive a reload */
  }
}

function addAuditLog(user: string, role: string, action: string, target: string, details: string) {
  const newLog: SystemAuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    user,
    role: role as SystemAuditLog['role'],
    action,
    target,
    details,
  };
  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 100) db.auditLogs.pop();
}

function currentPersona(): UserPersona | undefined {
  return db.personas.find(p => p.id === db.currentPersonaId);
}

/** Triggers a browser download of `text` as a file — the static-site replacement for the old
 *  `<a href="/api/export/csv?...">` links (which needed a server to generate the CSV). */
function downloadText(filename: string, mimeType: string, text: string) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------

export async function fetchHealth() {
  return {
    status: 'ok',
    system: 'Tagging360 — Digital Content Taxonomy & Metadata (DCTM)',
    client: 'Global Commercial Operations',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
  };
}

export async function fetchPersonas(): Promise<{ personas: UserPersona[]; currentPersonaId: string }> {
  return { personas: db.personas, currentPersonaId: db.currentPersonaId };
}

export async function loginRequest(email: string, password: string): Promise<{ success?: boolean; user?: UserPersona; error?: string }> {
  const cred = DUMMY_CREDENTIALS.find(
    c => c.email.toLowerCase() === String(email || '').trim().toLowerCase() && c.password === password
  );
  if (!cred) {
    return { error: 'Invalid email or password.' };
  }
  const persona = db.personas.find(p => p.id === cred.personaId);
  if (!persona) {
    return { error: 'Linked persona not found.' };
  }
  db.currentPersonaId = persona.id;
  addAuditLog(persona.name, persona.role, 'USER_LOGIN', persona.roleTitle, `${persona.name} signed in as ${persona.roleTitle}`);
  persist();
  return { success: true, user: persona };
}

export async function pinSession(personaId: string): Promise<{ success?: boolean; user?: UserPersona; error?: string }> {
  const persona = db.personas.find(p => p.id === personaId);
  if (!persona) {
    return { error: 'Session persona not found.' };
  }
  db.currentPersonaId = persona.id;
  persist();
  return { success: true, user: persona };
}

export async function createUserPersona(data: Partial<UserPersona>): Promise<{ success: boolean; persona: UserPersona; personas: UserPersona[] }> {
  const { name, email, role, roleTitle, department, organization, description, primaryTasks, permissions, assignedBrands, assignedTherapeuticAreas } = data as any;
  const cur = currentPersona();
  if (cur?.role !== 'superadmin') throw new Error('Only SuperAdmin can manage users and personas.');
  if (!name || !role) throw new Error('User name and role are required.');

  const roleStyles: Record<string, { bg: string; badge: string }> = {
    agency: { bg: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    marketer: { bg: 'bg-blue-600', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
    analytics: { bg: 'bg-purple-600', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
    superadmin: { bg: 'bg-slate-800', badge: 'bg-slate-200 text-slate-900 border-slate-300' },
  };
  const style = roleStyles[role] || roleStyles.marketer;

  const newPersona: UserPersona = {
    id: `persona-${role}-${Date.now()}`,
    name,
    email: email || `${name.toLowerCase().replace(/ /g, '.')}@biopharma-enterprise.com`,
    role,
    roleTitle: roleTitle || `${role.toUpperCase()} Governance Lead`,
    department: department || (role === 'marketer' ? 'Commercial Strategy' : role === 'analytics' ? 'Global Commercial Analytics' : 'Agency Operations'),
    organization: organization || (role === 'agency' ? 'Partner Agency' : 'Kite Pharma, a Gilead Company'),
    avatarBg: style.bg,
    badgeColor: style.badge,
    description: description || `Configured ${role} persona for the Kite cell-therapy commercial operation.`,
    status: 'active',
    assignedBrands: assignedBrands || ['Yescarta®'],
    assignedTherapeuticAreas: assignedTherapeuticAreas || ['Cell Therapy / CAR-T'],
    createdAt: new Date().toISOString(),
    primaryTasks: primaryTasks && primaryTasks.length > 0 ? primaryTasks : [
      `Perform ${role} tasks`,
      'Review campaign taxonomy alignment',
      'Export commercial compliance metrics',
    ],
    permissions: permissions && permissions.length > 0 ? permissions : [
      role === 'marketer' ? 'campaign:review' : role === 'analytics' ? 'analytics:view_all' : 'campaign:create',
      'taxonomy:view',
    ],
  };

  db.personas.push(newPersona);
  addAuditLog(cur.name, cur.role, 'USER_CREATED', newPersona.name, `Created new ${role.toUpperCase()} user: ${newPersona.name} (${newPersona.email})`);
  persist();
  return { success: true, persona: newPersona, personas: db.personas };
}

export async function updateUserPersona(id: string, updates: Partial<UserPersona>): Promise<{ success: boolean; persona: UserPersona; personas: UserPersona[] }> {
  const cur = currentPersona();
  if (cur?.role !== 'superadmin') throw new Error('Only SuperAdmin can update user profiles.');
  const idx = db.personas.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('User persona not found.');

  db.personas[idx] = { ...db.personas[idx], ...updates };
  addAuditLog(cur.name, cur.role, 'USER_UPDATED', db.personas[idx].name, `Updated user profile for ${db.personas[idx].name}`);
  persist();
  return { success: true, persona: db.personas[idx], personas: db.personas };
}

export async function deleteUserPersona(id: string): Promise<{ success: boolean; personas: UserPersona[] }> {
  const cur = currentPersona();
  if (cur?.role !== 'superadmin') throw new Error('Only SuperAdmin can remove users.');
  if (id === db.currentPersonaId) throw new Error('Cannot delete the currently active persona.');

  const target = db.personas.find(p => p.id === id);
  if (target) {
    db.personas = db.personas.filter(p => p.id !== id);
    addAuditLog(cur.name, cur.role, 'USER_REMOVED', target.name, `Removed user persona ${target.name} (${target.roleTitle})`);
    persist();
  }
  return { success: true, personas: db.personas };
}

export async function fetchAgencies(): Promise<{ agencies: AgencyPartner[] }> {
  return { agencies: db.agencies };
}

export async function createAgency(data: Partial<AgencyPartner>): Promise<{ success: boolean; agency: AgencyPartner; agencies: AgencyPartner[] }> {
  const { name, code, contactEmail, primaryContact, assignedBrands, assignedTherapeuticAreas, regionScope } = data;
  const cur = currentPersona();
  if (cur?.role !== 'superadmin') throw new Error('Only SuperAdmin can onboard new agencies.');
  if (!name || !code) throw new Error('Agency name and code are required.');

  const newAgency: AgencyPartner = {
    id: `agency-${Date.now()}`,
    name,
    code: code.toUpperCase(),
    contactEmail: contactEmail || `contact@${name.toLowerCase().replace(/ /g, '')}.com`,
    primaryContact: primaryContact || 'Agency Lead',
    assignedBrands: assignedBrands || ['Yescarta®'],
    assignedTherapeuticAreas: assignedTherapeuticAreas || ['Cell Therapy / CAR-T'],
    status: 'active',
    regionScope: regionScope || 'US Commercial',
    activeUsersCount: 1,
    campaignsCount: 0,
    complianceScore: 100,
    onboardedDate: new Date().toISOString().split('T')[0],
  };

  db.agencies.unshift(newAgency);
  db.analytics.activeAgencies = db.agencies.filter(a => a.status === 'active').length;
  addAuditLog(cur.name, cur.role, 'AGENCY_ONBOARDED', newAgency.name, `Onboarded new partner agency ${newAgency.name} (${newAgency.code})`);
  persist();
  return { success: true, agency: newAgency, agencies: db.agencies };
}

export async function updateAgency(id: string, updates: Partial<AgencyPartner>): Promise<{ success: boolean; agency: AgencyPartner; agencies: AgencyPartner[] }> {
  const cur = currentPersona();
  if (cur?.role !== 'superadmin') throw new Error('Only SuperAdmin can update agencies.');
  const idx = db.agencies.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Agency not found.');

  db.agencies[idx] = { ...db.agencies[idx], ...updates };
  addAuditLog(cur.name, cur.role, 'AGENCY_UPDATED', db.agencies[idx].name, `Updated agency profile for ${db.agencies[idx].name}`);
  persist();
  return { success: true, agency: db.agencies[idx], agencies: db.agencies };
}

export async function deleteAgency(id: string): Promise<{ success: boolean; agencies: AgencyPartner[] }> {
  const cur = currentPersona();
  if (cur?.role !== 'superadmin') throw new Error('Only SuperAdmin can delete agencies.');
  const agency = db.agencies.find(a => a.id === id);
  if (agency) {
    db.agencies = db.agencies.filter(a => a.id !== id);
    db.analytics.activeAgencies = db.agencies.filter(a => a.status === 'active').length;
    addAuditLog(cur.name, cur.role, 'AGENCY_REMOVED', agency.name, `Removed agency ${agency.name}`);
    persist();
  }
  return { success: true, agencies: db.agencies };
}

export async function fetchTaxonomyMaster(): Promise<{
  therapeuticAreas: TherapeuticArea[];
  brands: Brand[];
  keyMessages: KeyMessageCategory[];
  channels: ChannelTaxonomy[];
}> {
  return {
    therapeuticAreas: db.therapeuticAreas,
    brands: db.brands,
    keyMessages: db.keyMessages,
    channels: db.channels,
  };
}

export async function addKeyMessageSubcategory(data: {
  categoryId: string;
  categoryName?: string;
  subcategoryName: string;
  subcategoryCode?: string;
  description?: string;
  targetAudience?: string[];
}) {
  const { categoryId, categoryName, subcategoryName, subcategoryCode, description, targetAudience } = data;
  const cur = currentPersona();
  if (cur?.role !== 'superadmin' && cur?.role !== 'marketer') {
    throw new Error('Only Super Admin or Marketers can add/edit Key Message categories.');
  }

  let cat = db.keyMessages.find(k => k.id === categoryId);
  if (!cat) {
    const catName = categoryName || 'New Topic';
    cat = {
      id: `km-cat-${Date.now()}`,
      code: catName.substring(0, 3).toUpperCase(),
      name: catName,
      description: description || 'New Category',
      subtopics: [],
      subcategories: [],
    };
    db.keyMessages.push(cat);
  }

  const subList = cat.subtopics || cat.subcategories || [];
  const newSub: KeyMessageSubcategory = {
    id: `km-sub-${Date.now()}`,
    code: subcategoryCode || `KM-${cat.code}-${subList.length + 1}`,
    name: subcategoryName,
    description: description || 'New Subcategory Definition',
    status: 'active',
    targetAudience: targetAudience || ['HCPs'],
  };

  if (cat.subtopics) cat.subtopics.push(newSub);
  if (cat.subcategories) cat.subcategories.push(newSub);

  addAuditLog(cur.name, cur.role, 'KEY_MESSAGE_ADDED', newSub.code, `Added Subcategory ${newSub.name} under ${cat.name}`);
  persist();
  return { success: true, category: cat, subcategory: newSub, keyMessages: db.keyMessages };
}

export async function fetchCampaigns(params?: { status?: string; agency?: string }): Promise<{ campaigns: CampaignTaxonomy[] }> {
  let filtered = [...db.campaigns];
  if (params?.status) {
    filtered = filtered.filter(c => c.status === params.status);
  }
  if (params?.agency) {
    filtered = filtered.filter(c => c.agencyOwner.toLowerCase().includes(String(params.agency).toLowerCase()));
  }
  return { campaigns: filtered };
}

export async function createCampaign(body: Partial<CampaignTaxonomy> & Record<string, any>): Promise<{ success: boolean; campaign: CampaignTaxonomy }> {
  const cur = currentPersona();

  const ta = db.therapeuticAreas.find(t => t.id === body.therapeuticAreaId);
  const brand = db.brands.find(b => b.id === body.brandId);
  const kmCat = db.keyMessages.find(k => k.id === body.keyMessageCategoryId);
  const kmSubList = kmCat?.subtopics || kmCat?.subcategories || [];
  const kmSub = kmSubList.find(s => s.id === body.keyMessageSubcategoryId);
  const chan = db.channels.find(c => c.id === body.channelId);

  const regionCode = body.region ? (body.region.includes('US') ? 'US' : 'EU') : 'US';
  const taCode = ta?.code || 'GEN';
  const brandCode = brand?.code || 'BRD';
  const qtr = body.quarter ? body.quarter.replace('-', '') : '2026Q3';
  const audCode = body.targetAudience ? (body.targetAudience.toLowerCase().includes('patient') ? 'PAT' : 'HCP') : 'HCP';
  const chanCode = chan?.code.replace('-', '_') || 'DIG_WEB';
  const kmCode = kmSub?.code.replace('KM-', '').replace('-', '') || 'KM01';
  const randNum = Math.floor(100 + Math.random() * 900);

  const fallbackTaxonomyString = `COMM_${regionCode}_${taCode}_${brandCode}_${qtr}_${audCode}_${chanCode}_${kmCode}_${randNum}`;
  const taxonomyString = body.taxonomyString || fallbackTaxonomyString;

  const newCampaign: CampaignTaxonomy = {
    id: `cmp-${Date.now()}`,
    campaignName: body.campaignName || 'Untitled Commercial Campaign',
    campaignCode: body.campaignCode || taxonomyString,
    therapeuticAreaId: body.therapeuticAreaId || '',
    brandId: body.brandId || '',
    keyMessageCategoryId: body.keyMessageCategoryId || '',
    keyMessageSubcategoryId: body.keyMessageSubcategoryId || '',
    channelId: body.channelId || '',
    channelType: body.channelType,
    subChannel: body.subChannel,
    assetId: body.assetId,
    tacticId: body.tacticId,
    formulaInputs: body.formulaInputs,
    format: body.format || body.subChannel || 'Digital Asset',
    targetAudience: body.targetAudience || 'HCP',
    region: body.region || 'US Commercial',
    quarter: body.quarter || '2026-Q3',
    agencyOwner: cur?.role === 'agency' ? cur.organization : (body.agencyOwner || 'Klick Health'),
    marketerOwner: body.marketerOwner || 'Dr. Marcus Vance',
    status: body.status || 'submitted',
    complianceScore: Math.floor(95 + Math.random() * 5),
    taxonomyString,
    utmSource: (body.subChannel || chan?.name || 'programmatic').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    utmMedium: (chan?.name || body.format || 'display').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    utmCampaign: `${brand?.name.toLowerCase().split(' ')[0] || 'brand'}_${body.quarter || '2026q3'}`,
    utmContent: `${kmSub?.code.toLowerCase() || 'km'}_${audCode.toLowerCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: body.notes || 'Created via the Campaign Builder',
  };

  db.campaigns.unshift(newCampaign);
  db.analytics.totalCampaigns += 1;
  addAuditLog(cur?.name || 'User', cur?.role || 'agency', 'CAMPAIGN_TAXONOMY_CREATED', newCampaign.campaignCode, `Created campaign taxonomy ${newCampaign.campaignName} (${newCampaign.taxonomyString})`);
  persist();
  return { success: true, campaign: newCampaign };
}

export async function updateCampaignStatus(id: string, status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active', notes?: string) {
  const cur = currentPersona();
  const campaign = db.campaigns.find(c => c.id === id);
  if (!campaign) throw new Error('Campaign not found');

  campaign.status = status;
  campaign.updatedAt = new Date().toISOString();
  if (notes) campaign.notes = notes;

  addAuditLog(cur?.name || 'User', cur?.role || 'marketer', `CAMPAIGN_${status.toUpperCase()}`, campaign.campaignCode, `Status updated to ${status}. Notes: ${notes || 'N/A'}`);
  persist();
  return { success: true, campaign };
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
  const { creativeText, assetName } = data;
  if (!creativeText && !assetName) {
    throw new Error('Please provide creative text or asset name for AutoTagging analysis.');
  }

  const text = ((creativeText || '') + ' ' + (assetName || '')).toLowerCase();
  const predictions: any[] = [];

  if (text.includes('response') || text.includes('orr') || text.includes('remission') || text.includes('survival') || text.includes('durable') || text.includes('efficacy') || text.includes('zuma') || text.includes('real-world')) {
    predictions.push({
      category: 'Efficacy & Durable Response',
      subcategory: 'Overall Response Rate (ORR) (KM-EFF-01)',
      keyMessageCode: 'KM-EFF-01',
      confidence: 0.96,
      matchedKeywords: ['overall response rate', 'complete response', 'durable', 'ZUMA trial'],
      suggestedTags: ['ORR', 'Durable_CR', 'CAR_T_Efficacy'],
      reasoning: 'Creative copy contains CAR-T efficacy endpoint terms (ORR, complete response, durability).',
    });
  }
  if (text.includes('atc') || text.includes('authorized treatment center') || text.includes('referral') || text.includes('reimbursement') || text.includes('coverage') || text.includes('access') || text.includes('travel') || text.includes('lodging')) {
    predictions.push({
      category: 'Access & Authorized Treatment Centers',
      subcategory: 'ATC Network & Referral Pathways (KM-ACC-01)',
      keyMessageCode: 'KM-ACC-01',
      confidence: 0.94,
      matchedKeywords: ['authorized treatment center', 'referral pathway', 'site of care', 'travel support'],
      suggestedTags: ['ATC_Network', 'Referral', 'Travel_Support'],
      reasoning: 'Copy emphasizes the treatment-center network, referral pathways, and access support.',
    });
  }
  if (text.includes('apheresis') || text.includes('infusion') || text.includes('manufacturing') || text.includes('bridging') || text.includes('lymphodepletion') || text.includes('conditioning') || text.includes('vein-to-vein')) {
    predictions.push({
      category: 'Treatment Journey & Logistics',
      subcategory: 'Apheresis-to-Infusion Timeline (KM-PROC-01)',
      keyMessageCode: 'KM-PROC-01',
      confidence: 0.91,
      matchedKeywords: ['apheresis', 'vein-to-vein', 'bridging therapy', 'lymphodepletion'],
      suggestedTags: ['Apheresis', 'Turnaround', 'Bridging_Therapy'],
      reasoning: 'Copy contains CAR-T treatment-journey and manufacturing-logistics details.',
    });
  }
  if (text.includes('crs') || text.includes('cytokine') || text.includes('icans') || text.includes('neurotoxicity') || text.includes('tocilizumab') || text.includes('rems') || text.includes('safety')) {
    predictions.push({
      category: 'Safety: CRS & ICANS Management',
      subcategory: 'CRS Grading & Tocilizumab Protocol (KM-SAF-01)',
      keyMessageCode: 'KM-SAF-01',
      confidence: 0.89,
      matchedKeywords: ['cytokine release syndrome', 'ICANS', 'tocilizumab', 'REMS'],
      suggestedTags: ['CRS_Management', 'ICANS', 'REMS'],
      reasoning: 'Matches CAR-T safety monitoring, CRS/ICANS grading, and REMS requirements.',
    });
  }
  if (predictions.length === 0) {
    predictions.push({
      category: 'Efficacy & Durable Response',
      subcategory: 'Complete Response Durability (KM-EFF-02)',
      keyMessageCode: 'KM-EFF-02',
      confidence: 0.78,
      matchedKeywords: ['general brand positioning'],
      suggestedTags: ['General_Brand_Awareness', 'HCP_Education'],
      reasoning: 'Default taxonomy match based on overall HCP commercial copy tone.',
    });
  }

  const cur = currentPersona();
  addAuditLog(cur?.name || 'User', cur?.role || 'agency', 'AUTOTAG_SIMULATION_RUN', assetName || 'Asset Copy', `Ran AutoTag prediction on copy snippet (${predictions.length} key message matches detected)`);
  persist();

  return {
    success: true,
    analyzedLength: text.length,
    predictions,
    recommendedTaxonomyCode: `COMM_AUTO_${predictions[0].keyMessageCode.replace('-', '_')}_${Math.floor(100 + Math.random() * 900)}`,
  };
}

export async function fetchAnalytics(): Promise<{ analytics: AnalyticsSummary }> {
  return { analytics: db.analytics };
}

export async function resolveDiscrepancy(id: string) {
  const item = db.analytics.recentDiscrepancies.find(d => d.id === id);
  if (item) {
    item.resolved = true;
    persist();
  }
  return { success: true, recentDiscrepancies: db.analytics.recentDiscrepancies };
}

export async function fetchAuditLogs(): Promise<{ auditLogs: SystemAuditLog[] }> {
  return { auditLogs: db.auditLogs };
}

/** Client-side CSV generation + download — replaces the old `/api/export/csv` server route. */
export async function exportCsv(type: 'campaigns' | 'keymessages' = 'campaigns') {
  if (type === 'campaigns') {
    let csv = 'Campaign Code,Campaign Name,Therapeutic Area,Brand,Key Message Category,Subcategory,Channel,Format,Status,Compliance Score,Taxonomy String,UTM Source,UTM Medium,UTM Campaign\n';
    db.campaigns.forEach(c => {
      csv += `"${c.campaignCode}","${c.campaignName}","${c.therapeuticAreaId}","${c.brandId}","${c.keyMessageCategoryId}","${c.keyMessageSubcategoryId}","${c.channelId}","${c.format}","${c.status}",${c.complianceScore},"${c.taxonomyString}","${c.utmSource}","${c.utmMedium}","${c.utmCampaign}"\n`;
    });
    downloadText('Omnichannel_Campaign_Taxonomy_Export.csv', 'text/csv', csv);
  } else {
    let csv = 'Category ID,Category Name,Category Code,Subcategory Code,Subcategory Name,Description,Status\n';
    db.keyMessages.forEach(km => {
      const subList = km.subtopics || km.subcategories || [];
      subList.forEach(sub => {
        csv += `"${km.id}","${km.name}","${km.code}","${sub.code}","${sub.name}","${sub.description}","${sub.status}"\n`;
      });
    });
    downloadText('Master_Topic_Taxonomy_Dictionary.csv', 'text/csv', csv);
  }
}
