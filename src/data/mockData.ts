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
  ProgramOverview,
} from '../types';

export const INITIAL_AGENCIES: AgencyPartner[] = [
  {
    id: 'agency-omnicom',
    name: 'Omnicom Health Group',
    code: 'OMC',
    contactEmail: 'biopharma.team@omnicomhealth.com',
    primaryContact: 'Rachel Adams',
    assignedBrands: ['Trodelvy®', 'Sunlenca®'],
    assignedTherapeuticAreas: ['Oncology', 'Virology / HIV'],
    status: 'active',
    regionScope: 'US & Global Commercial',
    activeUsersCount: 18,
    campaignsCount: 14,
    complianceScore: 99.2,
    onboardedDate: '2025-01-15'
  },
  {
    id: 'agency-publicis',
    name: 'Publicis Health & Media',
    code: 'PUB',
    contactEmail: 'sarah.chen@havas.com',
    primaryContact: 'Sarah Chen',
    assignedBrands: ['Biktarvy®', 'Descovy®'],
    assignedTherapeuticAreas: ['Virology / HIV'],
    status: 'active',
    regionScope: 'US Commercial',
    activeUsersCount: 24,
    campaignsCount: 22,
    complianceScore: 98.7,
    onboardedDate: '2025-02-01'
  },
  {
    id: 'agency-ipg',
    name: 'IPG Health Network',
    code: 'IPG',
    contactEmail: 'biopharma.lead@ipghealth.com',
    primaryContact: 'Jason Miller',
    assignedBrands: ['Descovy®', 'Veklury®'],
    assignedTherapeuticAreas: ['Virology / HIV', 'Liver Diseases'],
    status: 'active',
    regionScope: 'US Commercial',
    activeUsersCount: 12,
    campaignsCount: 18,
    complianceScore: 97.8,
    onboardedDate: '2025-03-10'
  },
  {
    id: 'agency-havas',
    name: 'Havas Health & You',
    code: 'HAV',
    contactEmail: 'campaigns@havashealth.com',
    primaryContact: 'Sarah Chen',
    assignedBrands: ['Sunlenca®', 'Trodelvy®'],
    assignedTherapeuticAreas: ['Virology / HIV', 'Oncology'],
    status: 'active',
    regionScope: 'US & EU Commercial',
    activeUsersCount: 15,
    campaignsCount: 12,
    complianceScore: 96.5,
    onboardedDate: '2025-04-05'
  },
  {
    id: 'agency-wpp',
    name: 'WPP Health & Wellness',
    code: 'WPP',
    contactEmail: 'biopharma.account@wpphealth.com',
    primaryContact: 'Michael Chang',
    assignedBrands: ['Veklury®', 'Epclusa®'],
    assignedTherapeuticAreas: ['Liver Diseases'],
    status: 'active',
    regionScope: 'Global Commercial',
    activeUsersCount: 9,
    campaignsCount: 10,
    complianceScore: 98.0,
    onboardedDate: '2025-05-12'
  }
];

export const INITIAL_PERSONAS: UserPersona[] = [
  {
    id: 'persona-agency',
    name: 'Sarah Chen',
    email: 'sarah.chen@havas.com',
    role: 'agency',
    roleTitle: 'Omnichannel Campaign & Tagging Lead',
    department: 'Campaign Ops',
    organization: 'Havas Health & Publicis Media',
    avatarBg: 'bg-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Responsible for configuring agency campaign taxonomy, standardized tracking codes, content tagging, and submitting validated campaigns.',
    status: 'active',
    assignedBrands: ['Biktarvy®', 'Sunlenca®', 'Trodelvy®'],
    assignedTherapeuticAreas: ['Virology / HIV', 'Oncology'],
    primaryTasks: [
      'Build campaign taxonomy & standardized UTM codes',
      'Run AI AutoTagging on creative briefs & ad copy',
      'Validate metadata compliance before submission',
      'Generate tracking sheets for ad ops deployment'
    ],
    permissions: ['campaign:create', 'campaign:edit_draft', 'autotag:run', 'taxonomy:view', 'export:agency_sheet']
  },
  {
    id: 'persona-marketer',
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@biopharma-enterprise.com',
    role: 'marketer',
    roleTitle: 'Senior Brand Director, Oncology',
    department: 'Commercial Strategy',
    organization: 'Global Commercial Operations',
    avatarBg: 'bg-blue-600',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Governs brand message alignment, reviews and approves agency taxonomy submissions, and monitors key message coverage across channels.',
    status: 'active',
    assignedBrands: ['Trodelvy®', 'Yescarta®'],
    assignedTherapeuticAreas: ['Oncology', 'Cell Therapy (Kite Pharma)'],
    primaryTasks: [
      'Review & approve agency taxonomy submissions',
      'Map campaign goals to Key Message Categories',
      'Monitor brand message share across HCP & Patient channels',
      'Ensure brand positioning consistency across assets'
    ],
    permissions: ['campaign:review', 'campaign:approve', 'keymessage:map', 'taxonomy:view', 'analytics:brand_view']
  },
  {
    id: 'persona-analytics',
    name: 'Elena Rostova',
    email: 'elena.rostova@biopharma-enterprise.com',
    role: 'analytics',
    roleTitle: 'Omnichannel Data & Compliance Lead',
    department: 'Global Commercial Analytics',
    organization: 'Global Commercial Operations',
    avatarBg: 'bg-purple-600',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Monitors global taxonomy compliance score, auditing metadata drift across Veeva CRM, SFMC, and Adobe, and generating data integrity reports.',
    status: 'active',
    assignedBrands: ['All Enterprise Brands'],
    assignedTherapeuticAreas: ['Global Scope'],
    primaryTasks: [
      'Monitor global taxonomy compliance health scores',
      'Audit metadata errors across Veeva, SFMC, and Adobe',
      'Audit AutoTag prediction accuracy metrics',
      'Export master taxonomy reports for cross-channel attribution'
    ],
    permissions: ['analytics:view_all', 'discrepancy:resolve', 'export:master_taxonomy', 'autotag:audit', 'taxonomy:view']
  },
  {
    id: 'persona-superadmin',
    name: 'Alexis Thorne',
    email: 'alexis.thorne@biopharma-enterprise.com',
    role: 'superadmin',
    roleTitle: 'Master Taxonomy Governance Director',
    department: 'Global Commercial Operations',
    organization: 'Global Commercial Operations',
    avatarBg: 'bg-slate-800',
    badgeColor: 'bg-slate-200 text-slate-900 border-slate-300',
    description: 'Unrestricted master authority to edit master taxonomy dictionary, manage role-based permissions, and inspect system audit trails.',
    status: 'active',
    primaryTasks: [
      'Manage Master Taxonomy Dictionary (TAs, Brands, Key Messages)',
      'Edit role-based permission matrices & persona configs',
      'Inspect global system audit trails & user actions',
      'Emulate any persona for troubleshooting'
    ],
    permissions: ['*']
  }
];

export const INITIAL_THERAPEUTIC_AREAS: TherapeuticArea[] = [
  {
    id: 'ta-onc',
    code: 'ONC',
    name: 'Oncology',
    description: 'Solid tumors, Triple-Negative Breast Cancer (TNBC), Urothelial Carcinoma',
    brands: ['brand-trodelvy', 'brand-sunlenca']
  },
  {
    id: 'ta-hiv',
    code: 'HIV',
    name: 'Virology / HIV',
    description: 'HIV-1 treatment & prevention, long-acting regimens',
    brands: ['brand-biktarvy', 'brand-descovy', 'brand-genvoya']
  },
  {
    id: 'ta-liv',
    code: 'LIV',
    name: 'Liver Diseases',
    description: 'Hepatitis C (HCV), Hepatitis B (HBV), COVID-19 Antiviral',
    brands: ['brand-veklury', 'brand-epclusa', 'brand-harvoni']
  },
  {
    id: 'ta-inf',
    code: 'INF',
    name: 'Inflammatory & Respiratory',
    description: 'Rheumatoid Arthritis, Ulcerative Colitis, Fibrotic Diseases',
    brands: ['brand-jyseleca']
  },
  {
    id: 'ta-cel',
    code: 'CEL',
    name: 'Cell Therapy (Kite Pharma)',
    description: 'CAR-T cell therapies for Diffuse Large B-cell Lymphoma (DLBCL) & Mantle Cell',
    brands: ['brand-yescarta', 'brand-tecartus']
  }
];

export const INITIAL_BRANDS: Brand[] = [
  { id: 'brand-trodelvy', code: 'TRD', name: 'Trodelvy® (sacituzumab govitecan-hziy)', therapeuticAreaId: 'ta-onc', indication: 'mTNBC / HR+/HER2- Metastatic Breast Cancer' },
  { id: 'brand-biktarvy', code: 'BIK', name: 'Biktarvy® (bictegravir/FTC/TAF)', therapeuticAreaId: 'ta-hiv', indication: 'HIV-1 First-Line Complete Regimen' },
  { id: 'brand-descovy', code: 'DES', name: 'Descovy® for PrEP (emtricitabine/TAF)', therapeuticAreaId: 'ta-hiv', indication: 'HIV-1 Pre-Exposure Prophylaxis' },
  { id: 'brand-sunlenca', code: 'SUN', name: 'Sunlenca® (lenacapavir)', therapeuticAreaId: 'ta-hiv', indication: 'Multi-Drug Resistant HIV-1 / Long-Acting' },
  { id: 'brand-veklury', code: 'VEK', name: 'Veklury® (remdesivir)', therapeuticAreaId: 'ta-liv', indication: 'COVID-19 Inpatient & Outpatient Antiviral' },
  { id: 'brand-epclusa', code: 'EPC', name: 'Epclusa® (sofosbuvir/velpatasvir)', therapeuticAreaId: 'ta-liv', indication: 'Pan-Genotypic Chronic Hepatitis C' },
  { id: 'brand-yescarta', code: 'YES', name: 'Yescarta® (axicabtagene ciloleucel)', therapeuticAreaId: 'ta-cel', indication: 'Relapsed/Refractory Large B-Cell Lymphoma' }
];

export const INITIAL_PROGRAMS: ProgramOverview[] = [
  {
    id: 'prog-01',
    programName: 'Trodelvy mTNBC & HR+/HER2- Commercial Launch Program',
    programCode: 'PRG-ONC-TRD-2026',
    code: 'PRG-ONC-TRD-2026',
    agencyOwner: 'Omnicom Health Group',
    market: 'US Commercial',
    therapeuticArea: 'Oncology',
    brand: 'Trodelvy®',
    campaignCount: 14,
    tacticCount: 42,
    status: 'Active Commercial',
    description: 'Comprehensive HCP and Patient omnichannel program focusing on Overall Survival superiority in pre-treated mTNBC.'
  },
  {
    id: 'prog-02',
    programName: 'Biktarvy First-Line HIV Suppression & Retention Program',
    programCode: 'PRG-HIV-BIK-2026',
    code: 'PRG-HIV-BIK-2026',
    agencyOwner: 'Publicis Health',
    market: 'US Commercial',
    therapeuticArea: 'Virology / HIV',
    brand: 'Biktarvy®',
    campaignCount: 22,
    tacticCount: 68,
    status: 'Active Commercial',
    description: 'Rapid start and 5-year long-term viral suppression messaging for treatment-naive and switch patients.'
  },
  {
    id: 'prog-03',
    programName: 'Descovy for PrEP $0 Copay & Equity Access Initiative',
    programCode: 'PRG-HIV-DES-2026',
    code: 'PRG-HIV-DES-2026',
    agencyOwner: 'IPG Health',
    market: 'US Commercial',
    therapeuticArea: 'Virology / HIV',
    brand: 'Descovy®',
    campaignCount: 18,
    tacticCount: 54,
    status: 'Active Commercial',
    description: 'Targeted search, social, and point-of-care digital campaign expanding PrEP awareness and zero co-pay cards.'
  },
  {
    id: 'prog-04',
    programName: 'Sunlenca Twice-Yearly Long-Acting SubQ Regimen Program',
    programCode: 'PRG-HIV-SUN-2026',
    code: 'PRG-HIV-SUN-2026',
    agencyOwner: 'Havas Health & You',
    market: 'US Commercial',
    therapeuticArea: 'Virology / HIV',
    brand: 'Sunlenca®',
    campaignCount: 8,
    tacticCount: 24,
    status: 'Rollout Phase',
    description: 'Education for HIV specialists on subcutaneous administration protocols for heavily treatment-experienced adults.'
  },
  {
    id: 'prog-05',
    programName: 'Veklury Global Inpatient & Outpatient Antiviral Program',
    programCode: 'PRG-LIV-VEK-2026',
    code: 'PRG-LIV-VEK-2026',
    agencyOwner: 'WPP Health',
    market: 'Global Commercial',
    therapeuticArea: 'Liver / Antiviral',
    brand: 'Veklury®',
    campaignCount: 10,
    tacticCount: 30,
    status: 'Maintenance',
    description: 'Hospital EHR integration, infusion center guidelines, and early treatment protocols for high-risk patients.'
  }
];

export const INITIAL_KEY_MESSAGES: KeyMessageCategory[] = [
  {
    id: 'km-cat-eff',
    code: 'EFF',
    name: 'Efficacy & Clinical Outcomes',
    description: 'Clinical trial endpoints, survival outcomes, viral suppression rates, and response durability.',
    subtopics: [
      { id: 'km-sub-eff-01', code: 'KM-EFF-01', name: 'Overall Survival (OS) Superiority', description: 'Demonstrated statistically significant OS gain vs standard chemotherapy.', status: 'active', targetAudience: ['Oncologists', 'HCPs'] },
      { id: 'km-sub-eff-02', code: 'KM-EFF-02', name: 'Rapid & Durable Viral Suppression', description: 'Sustained undetectable viral load at Week 48 and Week 96 in treatment-naive adults.', status: 'active', targetAudience: ['Infectious Disease Specialists', 'HCPs'] },
      { id: 'km-sub-eff-03', code: 'KM-EFF-03', name: 'Progression-Free Survival (PFS)', description: 'Significant prolongation of median PFS in late-stage setting.', status: 'active', targetAudience: ['Oncologists'] },
      { id: 'km-sub-eff-04', code: 'KM-EFF-04', name: 'Pan-Genotypic HCV Cure Rate', description: '>98% SVR12 sustained virologic response across all genotypes.', status: 'active', targetAudience: ['Hepatologists', 'Gastroenterologists'] }
    ],
    subcategories: [
      { id: 'km-sub-eff-01', code: 'KM-EFF-01', name: 'Overall Survival (OS) Superiority', description: 'Demonstrated statistically significant OS gain vs standard chemotherapy.', status: 'active', targetAudience: ['Oncologists', 'HCPs'] },
      { id: 'km-sub-eff-02', code: 'KM-EFF-02', name: 'Rapid & Durable Viral Suppression', description: 'Sustained undetectable viral load at Week 48 and Week 96 in treatment-naive adults.', status: 'active', targetAudience: ['Infectious Disease Specialists', 'HCPs'] },
      { id: 'km-sub-eff-03', code: 'KM-EFF-03', name: 'Progression-Free Survival (PFS)', description: 'Significant prolongation of median PFS in late-stage setting.', status: 'active', targetAudience: ['Oncologists'] },
      { id: 'km-sub-eff-04', code: 'KM-EFF-04', name: 'Pan-Genotypic HCV Cure Rate', description: '>98% SVR12 sustained virologic response across all genotypes.', status: 'active', targetAudience: ['Hepatologists', 'Gastroenterologists'] }
    ]
  },
  {
    id: 'km-cat-saf',
    code: 'SAF',
    name: 'Safety, Tolerability & Black Box',
    description: 'Adverse event profiles, toxicity management, renal/bone lab monitoring, and black box warnings.',
    subtopics: [
      { id: 'km-sub-saf-01', code: 'KM-SAF-01', name: 'Renal & Bone Safety Profile', description: 'Proven eGFR stability and bone mineral density preservation over 5-year trials.', status: 'active', targetAudience: ['HCPs', 'HIV Specialists'] },
      { id: 'km-sub-saf-02', code: 'KM-SAF-02', name: 'Neutropenia & Diarrhea Protocol', description: 'Proactive dose modification and G-CSF supportive guidelines.', status: 'active', targetAudience: ['Oncology Nurses', 'HCPs'] },
      { id: 'km-sub-saf-03', code: 'KM-SAF-03', name: 'Cytokine Release Syndrome (CRS) Guidance', description: 'Kite CAR-T Tocilizumab protocol and REMS safety requirements.', status: 'active', targetAudience: ['Cell Therapy Centers', 'Oncologists'] }
    ],
    subcategories: [
      { id: 'km-sub-saf-01', code: 'KM-SAF-01', name: 'Renal & Bone Safety Profile', description: 'Proven eGFR stability and bone mineral density preservation over 5-year trials.', status: 'active', targetAudience: ['HCPs', 'HIV Specialists'] },
      { id: 'km-sub-saf-02', code: 'KM-SAF-02', name: 'Neutropenia & Diarrhea Protocol', description: 'Proactive dose modification and G-CSF supportive guidelines.', status: 'active', targetAudience: ['Oncology Nurses', 'HCPs'] },
      { id: 'km-sub-saf-03', code: 'KM-SAF-03', name: 'Cytokine Release Syndrome (CRS) Guidance', description: 'Kite CAR-T Tocilizumab protocol and REMS safety requirements.', status: 'active', targetAudience: ['Cell Therapy Centers', 'Oncologists'] }
    ]
  },
  {
    id: 'km-cat-dos',
    code: 'DOS',
    name: 'Dosing, Administration & Adherence',
    description: 'Dosing regimens, pill burden reduction, subcutaneous administration, and storage requirements.',
    subtopics: [
      { id: 'km-sub-dos-01', code: 'KM-DOS-01', name: 'Once-Daily Single-Tablet Regimen (STR)', description: 'Small pill size, simple daily dosing with or without food.', status: 'active', targetAudience: ['HCPs', 'Patients'] },
      { id: 'km-sub-dos-02', code: 'KM-DOS-02', name: 'Every 6-Month Subcutaneous Dose', description: 'Twice-yearly long-acting administration administered by healthcare provider.', status: 'active', targetAudience: ['HIV Specialists', 'Patients'] },
      { id: 'km-sub-dos-03', code: 'KM-DOS-03', name: 'Day 1 and Day 8 Infusion Schedule', description: '21-day treatment cycle intravenous infusion protocol.', status: 'active', targetAudience: ['Oncology Infusion Centers'] }
    ],
    subcategories: [
      { id: 'km-sub-dos-01', code: 'KM-DOS-01', name: 'Once-Daily Single-Tablet Regimen (STR)', description: 'Small pill size, simple daily dosing with or without food.', status: 'active', targetAudience: ['HCPs', 'Patients'] },
      { id: 'km-sub-dos-02', code: 'KM-DOS-02', name: 'Every 6-Month Subcutaneous Dose', description: 'Twice-yearly long-acting administration administered by healthcare provider.', status: 'active', targetAudience: ['HIV Specialists', 'Patients'] },
      { id: 'km-sub-dos-03', code: 'KM-DOS-03', name: 'Day 1 and Day 8 Infusion Schedule', description: '21-day treatment cycle intravenous infusion protocol.', status: 'active', targetAudience: ['Oncology Infusion Centers'] }
    ]
  },
  {
    id: 'km-cat-qol',
    code: 'QOL',
    name: 'Patient Quality of Life & Burden',
    description: 'Patient-reported health outcomes, emotional peace of mind, daily routine preservation.',
    subtopics: [
      { id: 'km-sub-qol-01', code: 'KM-QOL-01', name: 'Daily Pill Anxiety Reduction', description: 'Empowering patients to maintain an active, unburdened lifestyle.', status: 'active', targetAudience: ['Patients', 'Caregivers'] },
      { id: 'km-sub-qol-02', code: 'KM-QOL-02', name: 'Preserved Functional Independence', description: 'Minimal disruption to work and routine during therapy cycles.', status: 'active', targetAudience: ['Patients'] }
    ],
    subcategories: [
      { id: 'km-sub-qol-01', code: 'KM-QOL-01', name: 'Daily Pill Anxiety Reduction', description: 'Empowering patients to maintain an active, unburdened lifestyle.', status: 'active', targetAudience: ['Patients', 'Caregivers'] },
      { id: 'km-sub-qol-02', code: 'KM-QOL-02', name: 'Preserved Functional Independence', description: 'Minimal disruption to work and routine during therapy cycles.', status: 'active', targetAudience: ['Patients'] }
    ]
  },
  {
    id: 'km-cat-acc',
    code: 'ACC',
    name: 'Access, Co-Pay & Coverage',
    description: 'Enterprise patient assistance solutions, $0 co-pay card, prior authorization forms, and insurance coverage.',
    subtopics: [
      { id: 'km-sub-acc-01', code: 'KM-ACC-01', name: '$0 Co-Pay Savings Card Program', description: 'Eligible commercially insured patients pay as little as $0 per prescription.', status: 'active', targetAudience: ['Patients', 'Navigators', 'Pharmacists'] },
      { id: 'km-sub-acc-02', code: 'KM-ACC-02', name: 'Comprehensive Patient Access® Support', description: 'Comprehensive insurance verification, appeal letters, and co-pay navigation.', status: 'active', targetAudience: ['Office Managers', 'Case Workers'] }
    ],
    subcategories: [
      { id: 'km-sub-acc-01', code: 'KM-ACC-01', name: '$0 Co-Pay Savings Card Program', description: 'Eligible commercially insured patients pay as little as $0 per prescription.', status: 'active', targetAudience: ['Patients', 'Navigators', 'Pharmacists'] },
      { id: 'km-sub-acc-02', code: 'KM-ACC-02', name: 'Comprehensive Patient Access® Support', description: 'Comprehensive insurance verification, appeal letters, and co-pay navigation.', status: 'active', targetAudience: ['Office Managers', 'Case Workers'] }
    ]
  }
];


export const INITIAL_CHANNELS: ChannelTaxonomy[] = [
  { id: 'chan-veeva-email', code: 'VEE-EML', name: 'Veeva CRM Approved Email', formats: ['Rep Triggered Email', 'HQ Blast Email', 'Detailing Followup'], downstreamPlatform: 'Veeva CRM' },
  { id: 'chan-sfmc-nurture', code: 'SFM-NUR', name: 'SFMC Nurture Journey', formats: ['Patient Welcome Series', 'HCP Educational Drip', 'Refill Reminder SMS'], downstreamPlatform: 'SFMC' },
  { id: 'chan-aem-portal', code: 'AEM-WEB', name: 'Omnichannel HCP & Patient Web Portal', formats: ['Interactive Banner', 'Downloadable PDF SMR', 'Dosing Calculator', 'Video Player'], downstreamPlatform: 'Adobe Experience Manager' },
  { id: 'chan-paid-digital', code: 'DIG-PAD', name: 'Paid Social & HCP Display', formats: ['LinkedIn HCP Native Ad', 'Doximity DocFeed', 'Google Search Text Ad', 'EHR Banner'], downstreamPlatform: 'Google/Doximity' }
];

export const INITIAL_CAMPAIGNS: CampaignTaxonomy[] = [
  {
    id: 'cmp-101',
    campaignName: 'Trodelvy Q3 2026 mTNBC OS Superiority Launch',
    campaignCode: 'COMM-ONC-TRD-2026Q3-HCP-EFF01',
    therapeuticAreaId: 'ta-onc',
    brandId: 'brand-trodelvy',
    keyMessageCategoryId: 'km-cat-eff',
    keyMessageSubcategoryId: 'km-sub-eff-01',
    channelId: 'chan-veeva-email',
    format: 'Rep Triggered Email',
    targetAudience: 'Oncologists',
    region: 'US Commercial',
    quarter: '2026-Q3',
    agencyOwner: 'Havas Health',
    marketerOwner: 'Dr. Marcus Vance',
    status: 'approved',
    complianceScore: 100,
    taxonomyString: 'COMM_US_ONC_TRD_2026Q3_HCP_VEE_EML_EFF01_101',
    utmSource: 'veeva_crm',
    utmMedium: 'approved_email',
    utmCampaign: 'trodelvy_mtnbc_launch_2026',
    utmContent: 'os_superiority_hero',
    createdAt: '2026-07-15T10:30:00Z',
    updatedAt: '2026-07-18T14:20:00Z',
    notes: 'Approved by Marketer. Passed all Veeva field character limit checks.'
  },
  {
    id: 'cmp-102',
    campaignName: 'Biktarvy Undetectable Undetectable HCP Drip',
    campaignCode: 'COMM-HIV-BIK-2026Q3-HCP-EFF02',
    therapeuticAreaId: 'ta-hiv',
    brandId: 'brand-biktarvy',
    keyMessageCategoryId: 'km-cat-eff',
    keyMessageSubcategoryId: 'km-sub-eff-02',
    channelId: 'chan-sfmc-nurture',
    format: 'HCP Educational Drip',
    targetAudience: 'Infectious Disease Specialists',
    region: 'US Commercial',
    quarter: '2026-Q3',
    agencyOwner: 'Publicis Media',
    marketerOwner: 'Dr. Marcus Vance',
    status: 'submitted',
    complianceScore: 96,
    taxonomyString: 'COMM_US_HIV_BIK_2026Q3_HCP_SFM_NUR_EFF02_102',
    utmSource: 'sfmc',
    utmMedium: 'email',
    utmCampaign: 'biktarvy_viral_suppression_2026',
    utmContent: 'week48_data_card',
    createdAt: '2026-08-01T09:15:00Z',
    updatedAt: '2026-08-01T09:15:00Z',
    notes: 'Submitted by agency. Awaiting Marketer approval.'
  },
  {
    id: 'cmp-103',
    campaignName: 'Descovy PrEP $0 Copay Patient Search Ads',
    campaignCode: 'COMM-HIV-DES-2026Q3-PAT-ACC01',
    therapeuticAreaId: 'ta-hiv',
    brandId: 'brand-descovy',
    keyMessageCategoryId: 'km-cat-acc',
    keyMessageSubcategoryId: 'km-sub-acc-01',
    channelId: 'chan-paid-digital',
    format: 'Google Search Text Ad',
    targetAudience: 'Patients',
    region: 'US Commercial',
    quarter: '2026-Q3',
    agencyOwner: 'Omnicom Health',
    marketerOwner: 'Jennifer Lopez',
    status: 'active',
    complianceScore: 98,
    taxonomyString: 'COMM_US_HIV_DES_2026Q3_PAT_DIG_PAD_ACC01_103',
    utmSource: 'google_search',
    utmMedium: 'cpc',
    utmCampaign: 'descovy_prep_copay_card',
    utmContent: 'zero_copay_benefit',
    createdAt: '2026-06-10T11:00:00Z',
    updatedAt: '2026-06-12T16:00:00Z',
    notes: 'Active live campaign across Google Search & Doximity.'
  },
  {
    id: 'cmp-104',
    campaignName: 'Sunlenca 6-Month SubQ Infusion Guide Banner',
    campaignCode: 'COMM-HIV-SUN-2026Q3-HCP-DOS02',
    therapeuticAreaId: 'ta-hiv',
    brandId: 'brand-sunlenca',
    keyMessageCategoryId: 'km-cat-dos',
    keyMessageSubcategoryId: 'km-sub-dos-02',
    channelId: 'chan-aem-portal',
    format: 'Interactive Banner',
    targetAudience: 'HIV Specialists',
    region: 'Global / EU',
    quarter: '2026-Q3',
    agencyOwner: 'Havas Health',
    marketerOwner: 'Dr. Marcus Vance',
    status: 'draft',
    complianceScore: 88,
    taxonomyString: 'COMM_EU_HIV_SUN_2026Q3_HCP_AEM_WEB_DOS02_104',
    utmSource: 'enterprisemed_portal',
    utmMedium: 'banner',
    utmCampaign: 'sunlenca_long_acting_dosing',
    utmContent: 'subq_injection_demo',
    createdAt: '2026-08-05T14:22:00Z',
    updatedAt: '2026-08-05T14:22:00Z',
    notes: 'Draft in progress. AutoTagging completed.'
  }
];

export const INITIAL_ANALYTICS: AnalyticsSummary = {
  totalPrograms: 5,
  totalCampaigns: 142,
  totalTactics: 418,
  activeAgencies: 8,
  overallComplianceRate: 98.4,
  autoTagAccuracyRate: 96.2,
  taxonomyErrorsByPlatform: [
    { platform: 'Veeva CRM Approved Email', errorCount: 3, compliancePct: 99.1 },
    { platform: 'Salesforce Marketing Cloud (SFMC)', errorCount: 7, compliancePct: 97.8 },
    { platform: 'Adobe Experience Manager (AEM)', errorCount: 4, compliancePct: 98.2 },
    { platform: 'Google Search & Doximity Display', errorCount: 6, compliancePct: 96.5 }
  ],
  keyMessageCoverage: [
    { categoryName: 'Efficacy & Clinical Outcomes', campaignCount: 58, sharePct: 40.8 },
    { categoryName: 'Access, Co-Pay & Coverage', campaignCount: 34, sharePct: 23.9 },
    { categoryName: 'Dosing & Administration', campaignCount: 26, sharePct: 18.3 },
    { categoryName: 'Safety, Tolerability & Black Box', campaignCount: 16, sharePct: 11.3 },
    { categoryName: 'Patient Quality of Life', campaignCount: 8, sharePct: 5.6 }
  ],
  agencyComplianceLeaderboard: [
    { agencyName: 'Havas Health & YOU', campaignsSubmitted: 48, complianceScore: 99.2, flaggedErrors: 1 },
    { agencyName: 'Publicis Health Media', campaignsSubmitted: 42, complianceScore: 98.5, flaggedErrors: 2 },
    { agencyName: 'Omnicom Health Group', campaignsSubmitted: 31, complianceScore: 97.9, flaggedErrors: 3 },
    { agencyName: 'McCann Health', campaignsSubmitted: 21, complianceScore: 96.8, flaggedErrors: 4 }
  ],
  recentDiscrepancies: [
    {
      id: 'disc-01',
      campaignCode: 'COMM-HIV-DES-2026Q3-PAT-ACC01',
      platform: 'SFMC Nurture Engine',
      issueType: 'Missing Subcategory Code prefix in utm_content parameter',
      detectedAt: '2026-08-06 18:30:00 UTC',
      severity: 'warning',
      resolved: false
    },
    {
      id: 'disc-02',
      campaignCode: 'COMM-ONC-TRD-2026Q2-HCP-EFF01',
      platform: 'Veeva CRM Approved Email',
      issueType: 'Key Message Category ID mismatch between Veeva Vault & OCTS Master',
      detectedAt: '2026-08-05 12:15:00 UTC',
      severity: 'critical',
      resolved: true
    },
    {
      id: 'disc-03',
      campaignCode: 'COMM-LIV-VEK-2026Q3-HCP-DOS01',
      platform: 'Adobe Experience Manager',
      issueType: 'Asset taxonomy string contains non-standard whitespace character',
      detectedAt: '2026-08-04 09:40:00 UTC',
      severity: 'info',
      resolved: true
    }
  ]
};

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  { id: 'log-1', timestamp: '2026-08-07 07:35:12 UTC', user: 'Sarah Chen', role: 'agency', action: 'CAMPAIGN_TAXONOMY_CREATED', target: 'COMM-ONC-TRD-2026Q3-HCP-EFF01', details: 'Generated standardized UTM parameters and running AutoTag analysis.' },
  { id: 'log-2', timestamp: '2026-08-07 06:40:00 UTC', user: 'Dr. Marcus Vance', role: 'marketer', action: 'CAMPAIGN_APPROVED', target: 'COMM-HIV-BIK-2026Q3-HCP-EFF02', details: 'Approved campaign taxonomy submission for US Commercial launch.' },
  { id: 'log-4', timestamp: '2026-08-06 14:00:00 UTC', user: 'Alexis Thorne', role: 'superadmin', action: 'KEYMESSAGE_SUBCATEGORY_ADDED', target: 'KM-DOS-02', details: 'Added new long-acting Subcutaneous dosing subcategory.' }
];
