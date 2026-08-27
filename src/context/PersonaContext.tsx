import React, { createContext, useContext, useState, useEffect } from 'react';
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
import * as api from '../services/api';
import { INITIAL_PROGRAMS } from '../data/mockData';

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface PersonaContextType {
  // Directory (read-only list used by SuperAdmin + Overview counts)
  personas: UserPersona[];
  refreshPersonas: () => Promise<void>;

  isLoading: boolean;

  // Agencies & User Management (SuperAdmin)
  agencies: AgencyPartner[];
  refreshAgencies: () => Promise<void>;
  onboardAgency: (data: Partial<AgencyPartner>) => Promise<boolean>;
  editAgency: (id: string, updates: Partial<AgencyPartner>) => Promise<boolean>;
  removeAgency: (id: string) => Promise<boolean>;

  createUser: (data: Partial<UserPersona>) => Promise<boolean>;
  editUser: (id: string, updates: Partial<UserPersona>) => Promise<boolean>;
  removeUser: (id: string) => Promise<boolean>;

  // Market Selection
  selectedMarket: string;
  setSelectedMarket: (market: string) => void;

  // Taxonomy Master & Programs
  therapeuticAreas: TherapeuticArea[];
  brands: Brand[];
  keyMessages: KeyMessageCategory[];
  channels: ChannelTaxonomy[];
  programs: ProgramOverview[];
  refreshTaxonomy: () => Promise<void>;

  // Campaigns
  campaigns: CampaignTaxonomy[];
  refreshCampaigns: () => Promise<void>;
  addCampaign: (campaignData: Partial<CampaignTaxonomy>) => Promise<CampaignTaxonomy | null>;
  changeCampaignStatus: (id: string, status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active', notes?: string) => Promise<boolean>;

  // Analytics
  analytics: AnalyticsSummary | null;
  refreshAnalytics: () => Promise<void>;

  // Audit trail
  auditLogs: SystemAuditLog[];
  refreshAuditLogs: () => Promise<void>;

  // Toasts
  toasts: NotificationToast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personas, setPersonas] = useState<UserPersona[]>([]);
  const [agencies, setAgencies] = useState<AgencyPartner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMarket, setSelectedMarket] = useState<string>('US Commercial');

  const [therapeuticAreas, setTherapeuticAreas] = useState<TherapeuticArea[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [keyMessages, setKeyMessages] = useState<KeyMessageCategory[]>([]);
  const [channels, setChannels] = useState<ChannelTaxonomy[]>([]);
  const [programs] = useState<ProgramOverview[]>(INITIAL_PROGRAMS);

  const [campaigns, setCampaigns] = useState<CampaignTaxonomy[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);

  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshAgencies = async () => {
    try {
      const data = await api.fetchAgencies();
      setAgencies(data.agencies || []);
    } catch (err) {
      console.error('Failed to fetch agencies:', err);
    }
  };

  const refreshPersonas = async () => {
    try {
      const data = await api.fetchPersonas();
      setPersonas(data.personas || []);
    } catch (err) {
      console.error('Failed to fetch personas:', err);
    }
  };

  const refreshAuditLogs = async () => {
    try {
      const data = await api.fetchAuditLogs();
      setAuditLogs(data.auditLogs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [pData, agencyData, taxData, campData, anaData, logData] = await Promise.all([
        api.fetchPersonas(),
        api.fetchAgencies(),
        api.fetchTaxonomyMaster(),
        api.fetchCampaigns(),
        api.fetchAnalytics(),
        api.fetchAuditLogs(),
      ]);

      setPersonas(pData.personas);
      setAgencies(agencyData.agencies || []);
      setTherapeuticAreas(taxData.therapeuticAreas);
      setBrands(taxData.brands);
      setKeyMessages(taxData.keyMessages);
      setChannels(taxData.channels);
      setCampaigns(campData.campaigns);
      setAnalytics(anaData.analytics);
      setAuditLogs(logData.auditLogs);
    } catch (err) {
      console.error('Failed to initialize Omnia data:', err);
      showToast('Error connecting to the Omnia taxonomy backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshTaxonomy = async () => {
    const taxData = await api.fetchTaxonomyMaster();
    setTherapeuticAreas(taxData.therapeuticAreas);
    setBrands(taxData.brands);
    setKeyMessages(taxData.keyMessages);
    setChannels(taxData.channels);
  };

  const refreshCampaigns = async () => {
    const campData = await api.fetchCampaigns();
    setCampaigns(campData.campaigns);
  };

  const refreshAnalytics = async () => {
    const anaData = await api.fetchAnalytics();
    setAnalytics(anaData.analytics);
  };

  const addCampaign = async (campaignData: Partial<CampaignTaxonomy>): Promise<CampaignTaxonomy | null> => {
    try {
      const res = await api.createCampaign(campaignData);
      if (res.success && res.campaign) {
        showToast(`Campaign Taxonomy "${res.campaign.campaignName}" created successfully!`, 'success');
        await refreshCampaigns();
        await refreshAnalytics();
        await refreshAuditLogs();
        return res.campaign;
      }
      return null;
    } catch (err) {
      showToast('Error creating campaign taxonomy.', 'error');
      return null;
    }
  };

  const changeCampaignStatus = async (
    id: string,
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active',
    notes?: string
  ): Promise<boolean> => {
    try {
      const res = await api.updateCampaignStatus(id, status, notes);
      if (res.success) {
        showToast(`Campaign status updated to ${status.toUpperCase()}`, 'success');
        await refreshCampaigns();
        await refreshAnalytics();
        await refreshAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to update campaign status.', 'error');
      return false;
    }
  };

  const onboardAgency = async (data: Partial<AgencyPartner>): Promise<boolean> => {
    try {
      const res = await api.createAgency(data);
      if (res.success) {
        setAgencies(res.agencies);
        showToast(`Agency "${res.agency.name}" onboarded successfully!`, 'success');
        await refreshAnalytics();
        await refreshAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to onboard agency.', 'error');
      return false;
    }
  };

  const editAgency = async (id: string, updates: Partial<AgencyPartner>): Promise<boolean> => {
    try {
      const res = await api.updateAgency(id, updates);
      if (res.success) {
        setAgencies(res.agencies);
        showToast(`Agency updated successfully.`, 'success');
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to update agency.', 'error');
      return false;
    }
  };

  const removeAgency = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteAgency(id);
      if (res.success) {
        setAgencies(res.agencies);
        showToast('Agency removed from active roster.', 'info');
        await refreshAnalytics();
        await refreshAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to remove agency.', 'error');
      return false;
    }
  };

  const createUser = async (data: Partial<UserPersona>): Promise<boolean> => {
    try {
      const res = await api.createUserPersona(data);
      if (res.success) {
        setPersonas(res.personas);
        showToast(`User "${res.persona.name}" created successfully as ${res.persona.role.toUpperCase()}!`, 'success');
        await refreshAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to create user.', 'error');
      return false;
    }
  };

  const editUser = async (id: string, updates: Partial<UserPersona>): Promise<boolean> => {
    try {
      const res = await api.updateUserPersona(id, updates);
      if (res.success) {
        setPersonas(res.personas);
        showToast('User profile updated.', 'success');
        await refreshAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to update user profile.', 'error');
      return false;
    }
  };

  const removeUser = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteUserPersona(id);
      if (res.success) {
        setPersonas(res.personas);
        showToast('User removed.', 'info');
        await refreshAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to remove user.', 'error');
      return false;
    }
  };

  return (
    <PersonaContext.Provider
      value={{
        personas,
        refreshPersonas,

        isLoading,

        agencies,
        refreshAgencies,
        onboardAgency,
        editAgency,
        removeAgency,
        createUser,
        editUser,
        removeUser,

        selectedMarket,
        setSelectedMarket,

        therapeuticAreas,
        brands,
        keyMessages,
        channels,
        programs,
        refreshTaxonomy,

        campaigns,
        refreshCampaigns,
        addCampaign,
        changeCampaignStatus,

        analytics,
        refreshAnalytics,

        auditLogs,
        refreshAuditLogs,

        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};
