import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
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
} from './src/data/mockData';
import { DUMMY_CREDENTIALS } from './src/data/credentials';
import { CampaignTaxonomy, KeyMessageCategory, KeyMessageSubcategory, SystemAuditLog, AgencyPartner, UserPersona } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// On Vercel, the catch-all function at api/[...path].ts may receive the request
// path with the leading `/api` already stripped. Re-add it so the routes below
// (all declared as `/api/...`) match in every environment.
if (process.env.VERCEL) {
  app.use((req, _res, next) => {
    if (req.url !== '/api' && !req.url.startsWith('/api/')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
    }
    next();
  });
}

// In-memory Database State initialized with mockData
let personas: UserPersona[] = [...INITIAL_PERSONAS];
let agencies: AgencyPartner[] = [...INITIAL_AGENCIES];
let currentPersonaId = 'persona-agency';
let therapeuticAreas = [...INITIAL_THERAPEUTIC_AREAS];
let brands = [...INITIAL_BRANDS];
let keyMessages = [...INITIAL_KEY_MESSAGES];
let channels = [...INITIAL_CHANNELS];
let campaigns: CampaignTaxonomy[] = [...INITIAL_CAMPAIGNS];
let analytics = { ...INITIAL_ANALYTICS };
let auditLogs: SystemAuditLog[] = [...INITIAL_AUDIT_LOGS];

function addAuditLog(user: string, role: any, action: string, target: string, details: string) {
  const newLog: SystemAuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    user,
    role,
    action,
    target,
    details
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 100) auditLogs.pop();
}

// ---------------------- API ROUTES ----------------------

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Omnia — Digital Content Taxonomy & Metadata (DCTM)',
    client: 'Global Commercial Operations',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// Authentication (dummy, credential-list backed)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cred = DUMMY_CREDENTIALS.find(
    c => c.email.toLowerCase() === String(email || '').trim().toLowerCase() && c.password === password
  );
  if (!cred) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const persona = personas.find(p => p.id === cred.personaId);
  if (!persona) {
    return res.status(404).json({ error: 'Linked persona not found.' });
  }
  currentPersonaId = persona.id;
  addAuditLog(persona.name, persona.role, 'USER_LOGIN', persona.roleTitle, `${persona.name} signed in as ${persona.roleTitle}`);
  res.json({ success: true, user: persona });
});

// Re-pin the server-side persona from a persisted client session (no password needed)
app.post('/api/auth/session', (req: Request, res: Response) => {
  const { personaId } = req.body;
  const persona = personas.find(p => p.id === personaId);
  if (!persona) {
    return res.status(404).json({ error: 'Session persona not found.' });
  }
  currentPersonaId = persona.id;
  res.json({ success: true, user: persona });
});

// Personas & Access Control
app.get('/api/personas', (req: Request, res: Response) => {
  res.json({
    personas,
    currentPersonaId
  });
});

// Create User / Persona (SuperAdmin Action)
app.post('/api/personas', (req: Request, res: Response) => {
  const {
    name,
    email,
    role,
    roleTitle,
    department,
    organization,
    description,
    primaryTasks,
    permissions,
    assignedBrands,
    assignedTherapeuticAreas
  } = req.body;

  const curPersona = personas.find(p => p.id === currentPersonaId);
  if (curPersona?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only SuperAdmin can manage users and personas.' });
  }

  if (!name || !role) {
    return res.status(400).json({ error: 'User name and role are required.' });
  }

  const roleStyles: Record<string, { bg: string; badge: string }> = {
    agency: { bg: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    marketer: { bg: 'bg-blue-600', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
    analytics: { bg: 'bg-purple-600', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
    superadmin: { bg: 'bg-slate-800', badge: 'bg-slate-200 text-slate-900 border-slate-300' }
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
      'Export commercial compliance metrics'
    ],
    permissions: permissions && permissions.length > 0 ? permissions : [
      role === 'marketer' ? 'campaign:review' : role === 'analytics' ? 'analytics:view_all' : 'campaign:create',
      'taxonomy:view'
    ]
  };

  personas.push(newPersona);
  addAuditLog(curPersona.name, curPersona.role, 'USER_CREATED', newPersona.name, `Created new ${role.toUpperCase()} user: ${newPersona.name} (${newPersona.email})`);

  res.json({ success: true, persona: newPersona, personas });
});

// Update User / Persona
app.put('/api/personas/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const curPersona = personas.find(p => p.id === currentPersonaId);

  if (curPersona?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only SuperAdmin can update user profiles.' });
  }

  const targetIndex = personas.findIndex(p => p.id === id);
  if (targetIndex === -1) {
    return res.status(404).json({ error: 'User persona not found.' });
  }

  personas[targetIndex] = {
    ...personas[targetIndex],
    ...updates
  };

  addAuditLog(curPersona.name, curPersona.role, 'USER_UPDATED', personas[targetIndex].name, `Updated user profile for ${personas[targetIndex].name}`);

  res.json({ success: true, persona: personas[targetIndex], personas });
});

// Delete / Deactivate User
app.delete('/api/personas/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const curPersona = personas.find(p => p.id === currentPersonaId);

  if (curPersona?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only SuperAdmin can remove users.' });
  }

  if (id === currentPersonaId) {
    return res.status(400).json({ error: 'Cannot delete the currently active persona.' });
  }

  const target = personas.find(p => p.id === id);
  if (target) {
    personas = personas.filter(p => p.id !== id);
    addAuditLog(curPersona.name, curPersona.role, 'USER_REMOVED', target.name, `Removed user persona ${target.name} (${target.roleTitle})`);
  }

  res.json({ success: true, personas });
});

// Agencies Onboarding & Management API
app.get('/api/agencies', (req: Request, res: Response) => {
  res.json({ agencies });
});

app.post('/api/agencies', (req: Request, res: Response) => {
  const {
    name,
    code,
    contactEmail,
    primaryContact,
    assignedBrands,
    assignedTherapeuticAreas,
    regionScope
  } = req.body;

  const curPersona = personas.find(p => p.id === currentPersonaId);
  if (curPersona?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only SuperAdmin can onboard new agencies.' });
  }

  if (!name || !code) {
    return res.status(400).json({ error: 'Agency name and code are required.' });
  }

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
    onboardedDate: new Date().toISOString().split('T')[0]
  };

  agencies.unshift(newAgency);
  analytics.activeAgencies = agencies.filter(a => a.status === 'active').length;

  addAuditLog(curPersona.name, curPersona.role, 'AGENCY_ONBOARDED', newAgency.name, `Onboarded new partner agency ${newAgency.name} (${newAgency.code})`);

  res.json({ success: true, agency: newAgency, agencies });
});

app.put('/api/agencies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const curPersona = personas.find(p => p.id === currentPersonaId);

  if (curPersona?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only SuperAdmin can update agencies.' });
  }

  const idx = agencies.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Agency not found.' });
  }

  agencies[idx] = {
    ...agencies[idx],
    ...updates
  };

  addAuditLog(curPersona.name, curPersona.role, 'AGENCY_UPDATED', agencies[idx].name, `Updated agency profile for ${agencies[idx].name}`);

  res.json({ success: true, agency: agencies[idx], agencies });
});

app.delete('/api/agencies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const curPersona = personas.find(p => p.id === currentPersonaId);

  if (curPersona?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only SuperAdmin can delete agencies.' });
  }

  const agency = agencies.find(a => a.id === id);
  if (agency) {
    agencies = agencies.filter(a => a.id !== id);
    analytics.activeAgencies = agencies.filter(a => a.status === 'active').length;
    addAuditLog(curPersona.name, curPersona.role, 'AGENCY_REMOVED', agency.name, `Removed agency ${agency.name}`);
  }

  res.json({ success: true, agencies });
});

// Master Taxonomy Dictionary
app.get('/api/taxonomy/all', (req: Request, res: Response) => {
  res.json({
    therapeuticAreas,
    brands,
    keyMessages,
    channels
  });
});

app.post('/api/taxonomy/keymessage', (req: Request, res: Response) => {
  const { categoryId, categoryName, subcategoryName, subcategoryCode, description, targetAudience } = req.body;
  const curPersona = personas.find(p => p.id === currentPersonaId);

  // Permission check
  if (curPersona?.role !== 'superadmin' && curPersona?.role !== 'marketer') {
    return res.status(403).json({ error: 'Only Super Admin or Marketers can add/edit Key Message categories.' });
  }

  let cat = keyMessages.find(k => k.id === categoryId);
  if (!cat) {
    // Create new category if not existing
    const catName = categoryName || 'New Topic';
    const newCatId = `km-cat-${Date.now()}`;
    cat = {
      id: newCatId,
      code: catName.substring(0, 3).toUpperCase(),
      name: catName,
      description: description || 'New Category',
      subtopics: [],
      subcategories: []
    };
    keyMessages.push(cat);
  }

  const newSubId = `km-sub-${Date.now()}`;
  const subList = cat.subtopics || cat.subcategories || [];
  const newSub: KeyMessageSubcategory = {
    id: newSubId,
    code: subcategoryCode || `KM-${cat.code}-${subList.length + 1}`,
    name: subcategoryName,
    description: description || 'New Subcategory Definition',
    status: 'active',
    targetAudience: targetAudience || ['HCPs']
  };

  if (cat.subtopics) cat.subtopics.push(newSub);
  if (cat.subcategories) cat.subcategories.push(newSub);

  addAuditLog(curPersona.name, curPersona.role, 'KEY_MESSAGE_ADDED', newSub.code, `Added Subcategory ${newSub.name} under ${cat.name}`);
  res.json({ success: true, category: cat, subcategory: newSub, keyMessages });
});

// Campaigns Management
app.get('/api/campaigns', (req: Request, res: Response) => {
  const { status, agency } = req.query;
  let filtered = [...campaigns];
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }
  if (agency) {
    filtered = filtered.filter(c => c.agencyOwner.toLowerCase().includes(String(agency).toLowerCase()));
  }
  res.json({ campaigns: filtered });
});

app.post('/api/campaigns', (req: Request, res: Response) => {
  const body = req.body;
  const curPersona = personas.find(p => p.id === currentPersonaId);

  // Generate standardized Taxonomy String
  const ta = therapeuticAreas.find(t => t.id === body.therapeuticAreaId);
  const brand = brands.find(b => b.id === body.brandId);
  const kmCat = keyMessages.find(k => k.id === body.keyMessageCategoryId);
  const kmSubList = kmCat?.subtopics || kmCat?.subcategories || [];
  const kmSub = kmSubList.find(s => s.id === body.keyMessageSubcategoryId);
  const chan = channels.find(c => c.id === body.channelId);

  const regionCode = body.region ? (body.region.includes('US') ? 'US' : 'EU') : 'US';
  const taCode = ta?.code || 'GEN';
  const brandCode = brand?.code || 'BRD';
  const qtr = body.quarter ? body.quarter.replace('-', '') : '2026Q3';
  const audCode = body.targetAudience ? (body.targetAudience.toLowerCase().includes('patient') ? 'PAT' : 'HCP') : 'HCP';
  const chanCode = chan?.code.replace('-', '_') || 'DIG_WEB';
  const kmCode = kmSub?.code.replace('KM-', '').replace('-', '') || 'KM01';
  const randNum = Math.floor(100 + Math.random() * 900);

  const fallbackTaxonomyString = `COMM_${regionCode}_${taCode}_${brandCode}_${qtr}_${audCode}_${chanCode}_${kmCode}_${randNum}`;
  // The Campaign Builder assembles the string from the approved channel formula
  // client-side and sends it; only fall back to the old generator if it didn't.
  const taxonomyString = body.taxonomyString || fallbackTaxonomyString;

  const newCampaign: CampaignTaxonomy = {
    id: `cmp-${Date.now()}`,
    campaignName: body.campaignName || 'Untitled Commercial Campaign',
    campaignCode: body.campaignCode || taxonomyString,
    therapeuticAreaId: body.therapeuticAreaId,
    brandId: body.brandId,
    keyMessageCategoryId: body.keyMessageCategoryId,
    keyMessageSubcategoryId: body.keyMessageSubcategoryId,
    channelId: body.channelId,
    channelType: body.channelType,
    subChannel: body.subChannel,
    formulaInputs: body.formulaInputs,
    format: body.format || body.subChannel || 'Digital Asset',
    targetAudience: body.targetAudience || 'HCP',
    region: body.region || 'US Commercial',
    quarter: body.quarter || '2026-Q3',
    agencyOwner: curPersona?.role === 'agency' ? curPersona.organization : (body.agencyOwner || 'Klick Health'),
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
    notes: body.notes || 'Created via the Campaign Builder'
  };

  campaigns.unshift(newCampaign);
  analytics.totalCampaigns += 1;

  addAuditLog(curPersona?.name || 'User', curPersona?.role || 'agency', 'CAMPAIGN_TAXONOMY_CREATED', newCampaign.campaignCode, `Created campaign taxonomy ${newCampaign.campaignName} (${newCampaign.taxonomyString})`);

  res.json({ success: true, campaign: newCampaign });
});

app.post('/api/campaigns/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const curPersona = personas.find(p => p.id === currentPersonaId);

  const campaign = campaigns.find(c => c.id === id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  campaign.status = status;
  campaign.updatedAt = new Date().toISOString();
  if (notes) campaign.notes = notes;

  addAuditLog(curPersona?.name || 'User', curPersona?.role || 'marketer', `CAMPAIGN_${status.toUpperCase()}`, campaign.campaignCode, `Status updated to ${status}. Notes: ${notes || 'N/A'}`);

  res.json({ success: true, campaign });
});

// AutoTag Simulator Engine
app.post('/api/autotag', (req: Request, res: Response) => {
  const { creativeText, assetName, targetAudience, therapeuticAreaId } = req.body;

  if (!creativeText && !assetName) {
    return res.status(400).json({ error: 'Please provide creative text or asset name for AutoTagging analysis.' });
  }

  const text = ((creativeText || '') + ' ' + (assetName || '')).toLowerCase();

  // Keyword matching engine against Master Key Messages
  const predictions = [];

  if (text.includes('response') || text.includes('orr') || text.includes('remission') || text.includes('survival') || text.includes('durable') || text.includes('efficacy') || text.includes('zuma') || text.includes('real-world')) {
    predictions.push({
      category: 'Efficacy & Durable Response',
      subcategory: 'Overall Response Rate (ORR) (KM-EFF-01)',
      keyMessageCode: 'KM-EFF-01',
      confidence: 0.96,
      matchedKeywords: ['overall response rate', 'complete response', 'durable', 'ZUMA trial'],
      suggestedTags: ['ORR', 'Durable_CR', 'CAR_T_Efficacy'],
      reasoning: 'Creative copy contains CAR-T efficacy endpoint terms (ORR, complete response, durability).'
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
      reasoning: 'Copy emphasizes the treatment-center network, referral pathways, and access support.'
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
      reasoning: 'Copy contains CAR-T treatment-journey and manufacturing-logistics details.'
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
      reasoning: 'Matches CAR-T safety monitoring, CRS/ICANS grading, and REMS requirements.'
    });
  }

  // Fallback if no keywords matched
  if (predictions.length === 0) {
    predictions.push({
      category: 'Efficacy & Durable Response',
      subcategory: 'Complete Response Durability (KM-EFF-02)',
      keyMessageCode: 'KM-EFF-02',
      confidence: 0.78,
      matchedKeywords: ['general brand positioning'],
      suggestedTags: ['General_Brand_Awareness', 'HCP_Education'],
      reasoning: 'Default taxonomy match based on overall HCP commercial copy tone.'
    });
  }

  const curPersona = personas.find(p => p.id === currentPersonaId);
  addAuditLog(curPersona?.name || 'User', curPersona?.role || 'agency', 'AUTOTAG_SIMULATION_RUN', assetName || 'Asset Copy', `Ran AutoTag prediction on copy snippet (${predictions.length} key message matches detected)`);

  res.json({
    success: true,
    analyzedLength: text.length,
    predictions,
    recommendedTaxonomyCode: `COMM_AUTO_${predictions[0].keyMessageCode.replace('-', '_')}_${Math.floor(100+Math.random()*900)}`
  });
});

// Analytics & Data Integrity API
app.get('/api/analytics', (req: Request, res: Response) => {
  res.json({ analytics });
});

app.post('/api/analytics/discrepancy/resolve', (req: Request, res: Response) => {
  const { id } = req.body;
  const item = analytics.recentDiscrepancies.find(d => d.id === id);
  if (item) {
    item.resolved = true;
  }
  res.json({ success: true, recentDiscrepancies: analytics.recentDiscrepancies });
});

// Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ auditLogs });
});

// CSV Export Endpoint
app.get('/api/export/csv', (req: Request, res: Response) => {
  const type = req.query.type || 'campaigns';
  if (type === 'campaigns') {
    let csv = 'Campaign Code,Campaign Name,Therapeutic Area,Brand,Key Message Category,Subcategory,Channel,Format,Status,Compliance Score,Taxonomy String,UTM Source,UTM Medium,UTM Campaign\n';
    campaigns.forEach(c => {
      csv += `"${c.campaignCode}","${c.campaignName}","${c.therapeuticAreaId}","${c.brandId}","${c.keyMessageCategoryId}","${c.keyMessageSubcategoryId}","${c.channelId}","${c.format}","${c.status}",${c.complianceScore},"${c.taxonomyString}","${c.utmSource}","${c.utmMedium}","${c.utmCampaign}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Omnichannel_Campaign_Taxonomy_Export.csv"');
    return res.send(csv);
  } else {
    let csv = 'Category ID,Category Name,Category Code,Subcategory Code,Subcategory Name,Description,Status\n';
    keyMessages.forEach(km => {
      const subList = km.subtopics || km.subcategories || [];
      subList.forEach(sub => {
        csv += `"${km.id}","${km.name}","${km.code}","${sub.code}","${sub.name}","${sub.description}","${sub.status}"\n`;
      });
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Master_Topic_Taxonomy_Dictionary.csv"');
    return res.send(csv);
  }
});

// The configured Express app — imported by api/index.ts for Vercel serverless.
export default app;

// ---------------------- LOCAL DEV: FRONTEND VITE INTEGRATION ----------------------
// On Vercel the frontend is served as static assets and this block never runs
// (VERCEL is always set in that environment); locally `npm run dev` runs it.
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || '127.0.0.1';

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Lazy import so the Vercel function bundle never pulls in Vite.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Omnia] Digital Content Taxonomy & Metadata (DCTM) server running at http://${HOST}:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
