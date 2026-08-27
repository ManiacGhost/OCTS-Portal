import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
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
  INITIAL_CONNECTORS,
  INITIAL_AUDIT_LOGS,
} from './src/data/mockData.js';
import { CampaignTaxonomy, KeyMessageCategory, KeyMessageSubcategory, SystemAuditLog, AgencyPartner, UserPersona } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

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
let connectors = [...INITIAL_CONNECTORS];
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
    system: 'OCTS (Omnichannel Commercial Taxonomy & Governance Suite)',
    client: 'Global Commercial Operations',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// Personas & Access Control
app.get('/api/personas', (req: Request, res: Response) => {
  res.json({
    personas,
    currentPersonaId
  });
});

app.post('/api/personas/switch', (req: Request, res: Response) => {
  const { personaId } = req.body;
  const targetPersona = personas.find(p => p.id === personaId);
  if (!targetPersona) {
    return res.status(404).json({ error: 'Persona not found' });
  }
  currentPersonaId = personaId;
  addAuditLog(targetPersona.name, targetPersona.role, 'PERSONA_SWITCHED', targetPersona.roleTitle, `User switched view to ${targetPersona.name} (${targetPersona.roleTitle})`);
  res.json({ success: true, currentPersona: targetPersona });
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
    it: { bg: 'bg-amber-600', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
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
    organization: organization || (role === 'agency' ? 'Partner Agency' : 'Global Commercial Operations'),
    avatarBg: style.bg,
    badgeColor: style.badge,
    description: description || `Configured ${role} persona for enterprise commercial operations.`,
    status: 'active',
    assignedBrands: assignedBrands || ['Trodelvy®'],
    assignedTherapeuticAreas: assignedTherapeuticAreas || ['Oncology'],
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
    assignedBrands: assignedBrands || ['Biktarvy®'],
    assignedTherapeuticAreas: assignedTherapeuticAreas || ['Virology / HIV'],
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

  const generatedTaxonomyString = `COMM_${regionCode}_${taCode}_${brandCode}_${qtr}_${audCode}_${chanCode}_${kmCode}_${randNum}`;

  const newCampaign: CampaignTaxonomy = {
    id: `cmp-${Date.now()}`,
    campaignName: body.campaignName || 'Untitled Commercial Campaign',
    campaignCode: body.campaignCode || generatedTaxonomyString,
    therapeuticAreaId: body.therapeuticAreaId,
    brandId: body.brandId,
    keyMessageCategoryId: body.keyMessageCategoryId,
    keyMessageSubcategoryId: body.keyMessageSubcategoryId,
    channelId: body.channelId,
    format: body.format || 'Digital Asset',
    targetAudience: body.targetAudience || 'HCPs',
    region: body.region || 'US Commercial',
    quarter: body.quarter || '2026-Q3',
    agencyOwner: curPersona?.role === 'agency' ? curPersona.organization : (body.agencyOwner || 'Publicis Media'),
    marketerOwner: body.marketerOwner || 'Dr. Marcus Vance',
    status: body.status || 'submitted',
    complianceScore: Math.floor(95 + Math.random() * 5),
    taxonomyString: generatedTaxonomyString,
    utmSource: chan?.downstreamPlatform.toLowerCase().replace(/ /g, '_') || 'veeva_crm',
    utmMedium: body.format ? body.format.toLowerCase().replace(/ /g, '_') : 'approved_email',
    utmCampaign: `${brand?.name.toLowerCase().split(' ')[0] || 'brand'}_${body.quarter || '2026q3'}`,
    utmContent: `${kmSub?.code.toLowerCase() || 'km'}_${audCode.toLowerCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: body.notes || 'Created via Agency Taxonomy Builder'
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

  if (text.includes('survival') || text.includes('os') || text.includes('pfs') || text.includes('efficacy') || text.includes('viral') || text.includes('cure') || text.includes('trial')) {
    predictions.push({
      category: 'Efficacy & Clinical Outcomes',
      subcategory: 'Overall Survival (OS) Superiority (KM-EFF-01)',
      keyMessageCode: 'KM-EFF-01',
      confidence: 0.96,
      matchedKeywords: ['survival', 'clinical trial', 'statistically significant', 'efficacy'],
      suggestedTags: ['OS_Gain', 'TNBC_Efficacy', 'Phase3_Data'],
      reasoning: 'Creative copy contains explicit clinical endpoint terms (OS, trial endpoints, efficacy gains).'
    });
  }

  if (text.includes('copay') || text.includes('$0') || text.includes('assistance') || text.includes('coverage') || text.includes('access') || text.includes('insurance') || text.includes('savings')) {
    predictions.push({
      category: 'Access, Co-Pay & Coverage',
      subcategory: '$0 Co-Pay Savings Card Program (KM-ACC-01)',
      keyMessageCode: 'KM-ACC-01',
      confidence: 0.94,
      matchedKeywords: ['$0 copay', 'savings card', 'advancing access', 'commercial insurance'],
      suggestedTags: ['Copay_Card', 'Patient_Assistance', 'Zero_Cost'],
      reasoning: 'Copy emphasizes financial reimbursement, patient co-pay cards, and access support.'
    });
  }

  if (text.includes('daily') || text.includes('pill') || text.includes('injection') || text.includes('dose') || text.includes('subcutaneous') || text.includes('6-month') || text.includes('infusion')) {
    predictions.push({
      category: 'Dosing, Administration & Adherence',
      subcategory: 'Once-Daily Single-Tablet Regimen / Long Acting (KM-DOS-01)',
      keyMessageCode: 'KM-DOS-01',
      confidence: 0.91,
      matchedKeywords: ['once daily', 'subcutaneous', '6-month dosing', 'pill size'],
      suggestedTags: ['Once_Daily_STR', 'Long_Acting', 'SubQ_Infusion'],
      reasoning: 'Copy contains regimen frequency and administration methodology details.'
    });
  }

  if (text.includes('safety') || text.includes('tolerability') || text.includes('side effect') || text.includes('renal') || text.includes('bone') || text.includes('neutropenia')) {
    predictions.push({
      category: 'Safety, Tolerability & Black Box',
      subcategory: 'Renal & Bone Safety Profile (KM-SAF-01)',
      keyMessageCode: 'KM-SAF-01',
      confidence: 0.89,
      matchedKeywords: ['egfr stability', 'tolerability profile', 'lab monitoring'],
      suggestedTags: ['Safety_Profile', 'eGFR_Stable', 'Low_Toxicity'],
      reasoning: 'Matches safety monitoring, adverse event management, and laboratory endpoints.'
    });
  }

  // Fallback if no keywords matched
  if (predictions.length === 0) {
    predictions.push({
      category: 'Efficacy & Clinical Outcomes',
      subcategory: 'Rapid & Durable Viral Suppression (KM-EFF-02)',
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

// IT Connectors & Schema API
app.get('/api/connectors', (req: Request, res: Response) => {
  res.json({ connectors });
});

app.post('/api/connectors/:id/sync', (req: Request, res: Response) => {
  const { id } = req.params;
  const connector = connectors.find(c => c.id === id);
  if (connector) {
    connector.status = 'connected';
    connector.lastSync = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  }
  const curPersona = personas.find(p => p.id === currentPersonaId);
  addAuditLog(curPersona?.name || 'IT Admin', curPersona?.role || 'it', 'CONNECTOR_SYNCED', connector?.name || id, 'Manual sync triggered from OCTS IT Dashboard.');
  res.json({ success: true, connector });
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

// ---------------------- FRONTEND VITE INTEGRATION ----------------------
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OCTS Backend] Omnichannel Commercial Taxonomy & Governance Suite server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
