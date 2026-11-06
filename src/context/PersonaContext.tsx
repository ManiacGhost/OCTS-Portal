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
import { useAuth } from '../auth/AuthContext';
import { useActiveBrandId, setActiveBrandFor } from '../data/activeBrandStore';
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
  /** Brands this user may work in (all of them for an admin). */
  brands: Brand[];
  allowedBrands: Brand[];
  /** The brand the portal is currently scoped to; null until the user has picked one. */
  activeBrand: Brand | null;
  setActiveBrand: (brandId: string) => void;
  brandPickerOpen: boolean;
  setBrandPickerOpen: (open: boolean) => void;
  keyMessages: KeyMessageCategory[];
  channels: ChannelTaxonomy[];
  programs: ProgramOverview[];
  refreshTaxonomy: () => Promise<void>;

  // Campaigns
  campaigns: CampaignTaxonomy[];
  refreshCampaigns: () => Promise<void>;
  addCampaign: (campaignData: Partial<CampaignTaxonomy>) => Promise<CampaignTaxonomy | null>;
  changeCampaignStatus: (id: string, status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active', notes?: string) => Promise<boolean>;
  saveTactic: (id: string, data: Parameters<typeof api.saveTactic>[1]) => Promise<CampaignTaxonomy | null>;
  deleteCampaign: (id: string) => Promise<boolean>;
  deleteTactic: (id: string, removeRecord: boolean) => Promise<boolean>;
  submitForApproval: (id: string) => Promise<boolean>;
  editCampaign: (id: string, patch: Parameters<typeof api.updateCampaign>[1]) => Promise<CampaignTaxonomy | null>;
  reviewCampaign: (id: string, scope: ('campaign' | 'tactic')[], status: 'approved' | 'rejected', notes?: string) => Promise<boolean>;

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
  const [allBrands, setBrands] = useState<Brand[]>([]);
  const [keyMessages, setKeyMessages] = useState<KeyMessageCategory[]>([]);
  const [channels, setChannels] = useState<ChannelTaxonomy[]>([]);
  const [programs] = useState<ProgramOverview[]>(INITIAL_PROGRAMS);

  const [allCampaigns, setCampaigns] = useState<CampaignTaxonomy[]>([]);
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);
  const { user } = useAuth();
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
      console.error('Failed to initialize Tagging360 data:', err);
      showToast('Error connecting to the Tagging360 taxonomy backend.', 'error');
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

  const refreshAfterWrite = async () => {
    await refreshCampaigns();
    await refreshAnalytics();
    await refreshAuditLogs();
  };

  const saveTactic = async (id: string, data: Parameters<typeof api.saveTactic>[1]): Promise<CampaignTaxonomy | null> => {
    try {
      const res = await api.saveTactic(id, data);
      await refreshAfterWrite();
      return res.campaign;
    } catch {
      showToast('Failed to save the tactic.', 'error');
      return null;
    }
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    try {
      await api.deleteCampaign(id);
      await refreshAfterWrite();
      showToast('Campaign deleted.', 'success');
      return true;
    } catch {
      showToast('Failed to delete the campaign.', 'error');
      return false;
    }
  };

  const deleteTactic = async (id: string, removeRecord: boolean): Promise<boolean> => {
    try {
      await api.deleteTactic(id, removeRecord);
      await refreshAfterWrite();
      showToast('Tactic deleted.', 'success');
      return true;
    } catch {
      showToast('Failed to delete the tactic.', 'error');
      return false;
    }
  };

  const editCampaign = async (id: string, patch: Parameters<typeof api.updateCampaign>[1]): Promise<CampaignTaxonomy | null> => {
    try {
      const res = await api.updateCampaign(id, patch);
      await refreshAfterWrite();
      return res.campaign;
    } catch {
      showToast('Failed to save the campaign.', 'error');
      return null;
    }
  };

  const submitForApproval = async (id: string): Promise<boolean> => {
    try {
      await api.submitForApproval(id);
      await refreshAfterWrite();
      return true;
    } catch {
      showToast('Failed to submit for approval.', 'error');
      return false;
    }
  };

  const reviewCampaign = async (
    id: string,
    scope: ('campaign' | 'tactic')[],
    status: 'approved' | 'rejected',
    notes?: string
  ): Promise<boolean> => {
    try {
      await api.reviewCampaign(id, scope, status, notes);
      await refreshAfterWrite();
      return true;
    } catch {
      showToast('Failed to record the decision.', 'error');
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

  // ---- brand scope (role-based access) ----
  // The admin allocates brands to each user (`assignedBrands`, by brand name). Everyone but an admin
  // only ever sees those brands, and the portal runs for the one they have picked.
  const isAdmin = user?.role === 'superadmin';
  const assigned = (personas.find(p => p.id === user?.id) || user)?.assignedBrands || [];
  const allowedBrands: Brand[] =
    !user || isAdmin
      ? allBrands
      : assigned.some(n => /^all\b/i.test(n))
      ? allBrands
      : allBrands.filter(b =>
          assigned.some(n => b.id === n || b.code === n || b.name.toLowerCase().startsWith(n.trim().toLowerCase()))
        );
  const storedBrandId = useActiveBrandId(user?.id);
  const activeBrand = isAdmin ? null : allowedBrands.find(b => b.id === storedBrandId) || null;
  const setActiveBrand = (brandId: string) => {
    if (user) setActiveBrandFor(user.id, brandId);
  };
  // a user with just one brand has nothing to choose
  useEffect(() => {
    if (user && !isAdmin && !activeBrand && allowedBrands.length === 1) setActiveBrandFor(user.id, allowedBrands[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAdmin, activeBrand?.id, allowedBrands.length]);

  const brands = allowedBrands;
  // campaigns are scoped to the active brand (an admin sees everything)
  const campaigns = isAdmin ? allCampaigns : activeBrand ? allCampaigns.filter(c => c.brandId === activeBrand.id) : [];

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
        allowedBrands,
        activeBrand,
        setActiveBrand,
        brandPickerOpen,
        setBrandPickerOpen,
        keyMessages,
        channels,
        programs,
        refreshTaxonomy,

        campaigns,
        refreshCampaigns,
        addCampaign,
        saveTactic,
        deleteCampaign,
        deleteTactic,
        submitForApproval,
        editCampaign,
        reviewCampaign,
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
