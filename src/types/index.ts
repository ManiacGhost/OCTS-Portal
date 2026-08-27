export type UserRole = 'agency' | 'marketer' | 'analytics' | 'it' | 'superadmin';

export interface UserPersona {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  organization: string;
  avatarBg: string;
  badgeColor: string;
  description: string;
  primaryTasks: string[];
  permissions: string[];
  status?: 'active' | 'inactive' | 'suspended';
  assignedBrands?: string[];
  assignedTherapeuticAreas?: string[];
  createdAt?: string;
}

export interface AgencyPartner {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  primaryContact: string;
  assignedBrands: string[];
  assignedTherapeuticAreas: string[];
  status: 'active' | 'pending' | 'suspended';
  regionScope: string;
  activeUsersCount: number;
  campaignsCount: number;
  complianceScore: number;
  onboardedDate: string;
}

export interface TherapeuticArea {
  id: string;
  code: string;
  name: string;
  description: string;
  brands: string[];
}

export interface Brand {
  id: string;
  code: string;
  name: string;
  therapeuticAreaId: string;
  indication: string;
}

// Master Commercial Taxonomy Terminology: Topic & Subtopic Classification
export interface Topic {
  id: string;
  code: string;
  name: string;
  description: string;
  subtopics: Subtopic[];
  subcategories: Subtopic[]; // Alias for backward compatibility
}

export interface Subtopic {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'active' | 'deprecated' | 'draft';
  targetAudience: string[];
}

export interface AutoTagResult {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryCode: string;
  subcategoryName: string;
  confidenceScore: number;
  matchedKeywords: string[];
  suggestedTaxonomyString: string;
}

// Backward compatibility aliases
export type KeyMessageCategory = Topic;
export type KeyMessageSubcategory = Subtopic;

export interface ChannelTaxonomy {
  id: string;
  code: string;
  name: string;
  formats: string[];
  downstreamPlatform: 'Veeva CRM' | 'SFMC' | 'Adobe Experience Manager' | 'Google/Doximity' | 'EHR Network';
}

export interface ProgramOverview {
  id: string;
  programName: string;
  programCode: string;
  code?: string;
  agencyOwner?: string;
  market?: string;
  therapeuticArea: string;
  brand: string;
  campaignCount: number;
  tacticCount: number;
  status: string;
  description: string;
}

export interface CampaignTaxonomy {
  id: string;
  campaignName: string;
  campaignCode: string;
  therapeuticAreaId: string;
  brandId: string;
  keyMessageCategoryId: string; // Topic ID
  keyMessageSubcategoryId: string; // Subtopic ID
  channelId: string;
  format: string;
  targetAudience: string;
  region: string;
  quarter: string;
  agencyOwner: string;
  marketerOwner: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active';
  complianceScore: number;
  taxonomyString: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  contentAssetUrl?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface AnalyticsSummary {
  totalPrograms: number;
  totalCampaigns: number;
  totalTactics: number;
  activeAgencies: number;
  overallComplianceRate: number; // percentage e.g. 98.4
  autoTagAccuracyRate: number;
  taxonomyErrorsByPlatform: {
    platform: string;
    errorCount: number;
    compliancePct: number;
  }[];
  keyMessageCoverage: {
    categoryName: string; // Topic Name
    campaignCount: number;
    sharePct: number;
  }[];
  agencyComplianceLeaderboard: {
    agencyName: string;
    campaignsSubmitted: number;
    complianceScore: number;
    flaggedErrors: number;
  }[];
  recentDiscrepancies: {
    id: string;
    campaignCode: string;
    platform: string;
    issueType: string;
    detectedAt: string;
    severity: 'critical' | 'warning' | 'info';
    resolved: boolean;
  }[];
}

export interface ConnectorConfig {
  id: string;
  name: string;
  type: 'Veeva' | 'SFMC' | 'Adobe' | 'Doximity';
  status: 'connected' | 'error' | 'syncing' | 'disabled';
  lastSync: string;
  endpointUrl: string;
  syncedFieldsCount: number;
  schemaRules: string[];
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  target: string;
  details: string;
}

