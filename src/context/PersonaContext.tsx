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
  ConnectorConfig,
  SystemAuditLog,
  UserRole,
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
  personas: UserPersona[];
  currentPersona: UserPersona | null;
  isLoading: boolean;
  activeRole: UserRole;
  switchPersona: (personaId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;

  // Agencies & User Management
  agencies: AgencyPartner[];
  refreshAgencies: () => Promise<void>;
  refreshPersonas: () => Promise<void>;
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

  // IT Connectors & Audit
  connectors: ConnectorConfig[];
  auditLogs: SystemAuditLog[];
  refreshITData: () => Promise<void>;
  triggerSync: (connectorId: string) => Promise<void>;

  // Toasts
  toasts: NotificationToast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Active View Tab inside role dashboard
  activeViewTab: string;
  setActiveViewTab: (tab: string) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personas, setPersonas] = useState<UserPersona[]>([]);
  const [agencies, setAgencies] = useState<AgencyPartner[]>([]);
  const [currentPersona, setCurrentPersona] = useState<UserPersona | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMarket, setSelectedMarket] = useState<string>('US Commercial');

  const [therapeuticAreas, setTherapeuticAreas] = useState<TherapeuticArea[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [keyMessages, setKeyMessages] = useState<KeyMessageCategory[]>([]);
  const [channels, setChannels] = useState<ChannelTaxonomy[]>([]);
  const [programs, setPrograms] = useState<ProgramOverview[]>(INITIAL_PROGRAMS);

  const [campaigns, setCampaigns] = useState<CampaignTaxonomy[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);

  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [activeViewTab, setActiveViewTab] = useState<string>('dashboard');

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

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const pData = await api.fetchPersonas();
      setPersonas(pData.personas);
      const active = pData.personas.find(p => p.id === pData.currentPersonaId) || pData.personas[0];
      setCurrentPersona(active);

      const agencyData = await api.fetchAgencies();
      setAgencies(agencyData.agencies || []);

      const taxData = await api.fetchTaxonomyMaster();
      setTherapeuticAreas(taxData.therapeuticAreas);
      setBrands(taxData.brands);
      setKeyMessages(taxData.keyMessages);
      setChannels(taxData.channels);

      const campData = await api.fetchCampaigns();
      setCampaigns(campData.campaigns);

      const anaData = await api.fetchAnalytics();
      setAnalytics(anaData.analytics);

      const connData = await api.fetchConnectors();
      setConnectors(connData.connectors);

      const logData = await api.fetchAuditLogs();
      setAuditLogs(logData.auditLogs);
    } catch (err) {
      console.error('Failed to initialize OCTS data:', err);
      showToast('Error connecting to OCTS taxonomy backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSwitchPersona = async (personaId: string) => {
    try {
      const res = await api.switchPersona(personaId);
      if (res.success) {
        setCurrentPersona(res.currentPersona);
        setActiveViewTab('dashboard'); // reset tab on role switch
        showToast(`Switched persona to ${res.currentPersona.name} (${res.currentPersona.roleTitle})`, 'info');
        refreshITData();
      }
    } catch (err) {
      showToast('Failed to switch persona.', 'error');
    }
  };

  const hasPermission = (perm: string): boolean => {
    if (!currentPersona) return false;
    if (currentPersona.permissions.includes('*')) return true;
    return currentPersona.permissions.includes(perm);
  };

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

  const refreshITData = async () => {
    const connData = await api.fetchConnectors();
    setConnectors(connData.connectors);
    const logData = await api.fetchAuditLogs();
    setAuditLogs(logData.auditLogs);
  };

  const addCampaign = async (campaignData: Partial<CampaignTaxonomy>): Promise<CampaignTaxonomy | null> => {
    try {
      const res = await api.createCampaign(campaignData);
      if (res.success && res.campaign) {
        showToast(`Campaign Taxonomy "${res.campaign.campaignName}" created successfully!`, 'success');
        await refreshCampaigns();
        await refreshAnalytics();
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
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to update campaign status.', 'error');
      return false;
    }
  };

  const triggerSync = async (connectorId: string) => {
    try {
      const res = await api.syncConnector(connectorId);
      if (res.success) {
        showToast(`Connector ${res.connector.name} synced successfully!`, 'success');
        await refreshITData();
      }
    } catch (err) {
      showToast('Connector sync failed.', 'error');
    }
  };

  const onboardAgency = async (data: Partial<AgencyPartner>): Promise<boolean> => {
    try {
      const res = await api.createAgency(data);
      if (res.success) {
        setAgencies(res.agencies);
        showToast(`Agency "${res.agency.name}" onboarded successfully!`, 'success');
        await refreshAnalytics();
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
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to remove user.', 'error');
      return false;
    }
  };

  const activeRole: UserRole = currentPersona?.role || 'agency';

  return (
    <PersonaContext.Provider
      value={{
        personas,
        currentPersona,
        isLoading,
        activeRole,
        switchPersona: handleSwitchPersona,
        hasPermission,

        agencies,
        refreshAgencies,
        refreshPersonas,
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

        connectors,
        auditLogs,
        refreshITData,
        triggerSync,

        toasts,
        showToast,
        removeToast,

        activeViewTab,
        setActiveViewTab,
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
