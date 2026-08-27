import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import { KeyMessageSelector } from '../common/KeyMessageSelector';
import { TaxonomyDictionaryView } from '../common/TaxonomyDictionaryView';
import { UserPersona, AgencyPartner } from '../../types';
import {
  ShieldAlert,
  Plus,
  Users,
  Key,
  Database,
  CheckCircle2,
  Lock,
  Layers,
  Terminal,
  Save,
  Check,
  Briefcase,
  Building2,
  UserPlus,
  UserCheck,
  Search,
  Pencil,
  Trash2,
  XCircle,
  Mail,
  Globe,
  Filter,
  BarChart3,
  Award,
  ChevronRight,
  X
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    personas,
    currentPersona,
    switchPersona,
    keyMessages,
    auditLogs,
    refreshTaxonomy,
    showToast,
    programs,
    agencies,
    onboardAgency,
    editAgency,
    removeAgency,
    createUser,
    editUser,
    removeUser,
    therapeuticAreas,
    brands
  } = usePersona();

  const [activeTab, setActiveTab] = useState<'agencies' | 'marketers' | 'analytics' | 'editor' | 'permissions' | 'audit'>('agencies');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Adding New Subtopic
  const [selectedCatId, setSelectedCatId] = useState('km-cat-eff');
  const [subcategoryName, setSubcategoryName] = useState('Rapid Onset of Sustained Response');
  const [subcategoryCode, setSubcategoryCode] = useState('TOP-EFF-05');
  const [description, setDescription] = useState('Demonstrated rapid viral clearance within 14 days of therapy initiation.');
  const [targetAudience, setTargetAudience] = useState('HCPs');
  const [isSaving, setIsSaving] = useState(false);

  // Agency Modal State
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<AgencyPartner | null>(null);
  const [agencyForm, setAgencyForm] = useState({
    name: '',
    code: '',
    contactEmail: '',
    primaryContact: '',
    regionScope: 'US Commercial',
    assignedBrands: [] as string[],
    assignedTherapeuticAreas: [] as string[]
  });

  // User (Marketer / Analytics) Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalRole, setUserModalRole] = useState<'marketer' | 'analytics' | 'agency'>('marketer');
  const [editingUser, setEditingUser] = useState<UserPersona | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    roleTitle: '',
    department: '',
    organization: 'Gilead Sciences Inc.',
    assignedBrands: [] as string[],
    assignedTherapeuticAreas: [] as string[]
  });

  // Handle Subcategory Add
  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subcategoryName || !subcategoryCode) {
      showToast('Please provide subtopic code and name.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/taxonomy/keymessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCatId,
          subcategoryName,
          subcategoryCode,
          description,
          targetAudience: [targetAudience]
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Subtopic ${subcategoryCode} added to Gilead Master Taxonomy!`, 'success');
        await refreshTaxonomy();
        setSubcategoryName('');
        setSubcategoryCode('');
      }
    } catch (err) {
      showToast('Failed to save topic/subtopic to master taxonomy.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Agency Modal (Create or Edit)
  const handleOpenAgencyModal = (agencyToEdit?: AgencyPartner) => {
    if (agencyToEdit) {
      setEditingAgency(agencyToEdit);
      setAgencyForm({
        name: agencyToEdit.name,
        code: agencyToEdit.code,
        contactEmail: agencyToEdit.contactEmail,
        primaryContact: agencyToEdit.primaryContact,
        regionScope: agencyToEdit.regionScope,
        assignedBrands: agencyToEdit.assignedBrands || [],
        assignedTherapeuticAreas: agencyToEdit.assignedTherapeuticAreas || []
      });
    } else {
      setEditingAgency(null);
      setAgencyForm({
        name: '',
        code: '',
        contactEmail: '',
        primaryContact: '',
        regionScope: 'US Commercial',
        assignedBrands: ['Trodelvy®'],
        assignedTherapeuticAreas: ['Oncology']
      });
    }
    setIsAgencyModalOpen(true);
  };

  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyForm.name || !agencyForm.code) {
      showToast('Agency Name and Code are required.', 'error');
      return;
    }

    if (editingAgency) {
      const success = await editAgency(editingAgency.id, agencyForm);
      if (success) setIsAgencyModalOpen(false);
    } else {
      const success = await onboardAgency(agencyForm);
      if (success) setIsAgencyModalOpen(false);
    }
  };

  // Open User Modal (Create or Edit Marketer/Analytics)
  const handleOpenUserModal = (role: 'marketer' | 'analytics' | 'agency', userToEdit?: UserPersona) => {
    setUserModalRole(role);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserForm({
        name: userToEdit.name,
        email: userToEdit.email || '',
        roleTitle: userToEdit.roleTitle,
        department: userToEdit.department,
        organization: userToEdit.organization || (role === 'agency' ? 'Partner Agency' : 'Gilead Sciences Inc.'),
        assignedBrands: userToEdit.assignedBrands || [],
        assignedTherapeuticAreas: userToEdit.assignedTherapeuticAreas || []
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        roleTitle: role === 'marketer' ? 'Brand Marketing Director' : role === 'analytics' ? 'Omnichannel Analytics Lead' : 'Agency Campaign Manager',
        department: role === 'marketer' ? 'Commercial Strategy' : role === 'analytics' ? 'Global Commercial Analytics' : 'Agency Operations',
        organization: role === 'agency' ? 'Partner Agency' : 'Gilead Sciences Inc.',
        assignedBrands: ['Trodelvy®'],
        assignedTherapeuticAreas: ['Oncology']
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name) {
      showToast('User Full Name is required.', 'error');
      return;
    }

    if (editingUser) {
      const success = await editUser(editingUser.id, {
        ...userForm,
        role: userModalRole
      });
      if (success) setIsUserModalOpen(false);
    } else {
      const success = await createUser({
        ...userForm,
        role: userModalRole
      });
      if (success) setIsUserModalOpen(false);
    }
  };

  const toggleBrandSelection = (brandName: string, isAgency: boolean) => {
    if (isAgency) {
      setAgencyForm(prev => {
        const exists = prev.assignedBrands.includes(brandName);
        return {
          ...prev,
          assignedBrands: exists
            ? prev.assignedBrands.filter(b => b !== brandName)
            : [...prev.assignedBrands, brandName]
        };
      });
    } else {
      setUserForm(prev => {
        const exists = prev.assignedBrands.includes(brandName);
        return {
          ...prev,
          assignedBrands: exists
            ? prev.assignedBrands.filter(b => b !== brandName)
            : [...prev.assignedBrands, brandName]
        };
      });
    }
  };

  const toggleTASelection = (taName: string, isAgency: boolean) => {
    if (isAgency) {
      setAgencyForm(prev => {
        const exists = prev.assignedTherapeuticAreas.includes(taName);
        return {
          ...prev,
          assignedTherapeuticAreas: exists
            ? prev.assignedTherapeuticAreas.filter(t => t !== taName)
            : [...prev.assignedTherapeuticAreas, taName]
        };
      });
    } else {
      setUserForm(prev => {
        const exists = prev.assignedTherapeuticAreas.includes(taName);
        return {
          ...prev,
          assignedTherapeuticAreas: exists
            ? prev.assignedTherapeuticAreas.filter(t => t !== taName)
            : [...prev.assignedTherapeuticAreas, taName]
        };
      });
    }
  };

  const marketersList = personas.filter(p => p.role === 'marketer');
  const analyticsList = personas.filter(p => p.role === 'analytics');

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* SuperAdmin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 border-l-4 border-l-rose-600 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Governance</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">Super Admin</div>
          <p className="text-[11px] text-rose-700 font-bold">Unrestricted Master Access</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Partner Agencies</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{agencies.length} Onboarded</div>
          <p className="text-[11px] text-emerald-700 font-medium">Active Omnichannel Partners</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-blue-600 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Marketers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{marketersList.length} Active</div>
          <p className="text-[11px] text-blue-700 font-medium">Brand Strategy & Approvers</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-purple-600 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Analytics Team</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{analyticsList.length} Leads</div>
          <p className="text-[11px] text-purple-700 font-medium">Data Integrity & Compliance</p>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-slate-700 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Master Topics</span>
            <Layers className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{keyMessages.length} Categories</div>
          <p className="text-[11px] text-rose-700 font-bold">Taxonomy Classification</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('agencies')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'agencies' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Onboard & Manage Agencies</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{agencies.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('marketers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'marketers' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Marketers Directory & Creation</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{marketersList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics Team Directory</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{analyticsList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'editor' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Master Taxonomy Dictionary</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'permissions' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Role Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Global Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Onboard & Manage Agencies */}
      {activeTab === 'agencies' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-rose-600" />
                  Gilead Onboarded Partner Agencies
                </h3>
                <p className="text-xs text-slate-500">
                  Onboard new agency partners, assign brand portfolios, and manage active campaign tagging credentials.
                </p>
              </div>

              <button
                onClick={() => handleOpenAgencyModal()}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Agency</span>
              </button>
            </div>

            {/* Agencies Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="p-3">Agency Name & Code</th>
                    <th className="p-3">Primary Contact & Email</th>
                    <th className="p-3">Region / Scope</th>
                    <th className="p-3">Assigned Brands</th>
                    <th className="p-3 text-center">Compliance</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agencies.map((agency) => (
                    <tr key={agency.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{agency.name}</span>
                          <span className="bg-rose-100 text-rose-800 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold">
                            {agency.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">Onboarded: {agency.onboardedDate}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-900">{agency.primaryContact}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{agency.contactEmail}</span>
                        </div>
                      </td>

                      <td className="p-3 font-medium text-slate-700">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{agency.regionScope}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {agency.assignedBrands.map((brand, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                              {brand}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-center font-bold text-emerald-600">
                        {agency.complianceScore}%
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          agency.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {agency.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenAgencyModal(agency)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Agency"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove agency "${agency.name}"?`)) {
                                removeAgency(agency.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove Agency"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Marketers Directory & Creation */}
      {activeTab === 'marketers' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Gilead Brand Marketers Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Create and manage commercial marketers responsible for approving agency submissions and mapping brand key messages.
                </p>
              </div>

              <button
                onClick={() => handleOpenUserModal('marketer')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Marketer</span>
              </button>
            </div>

            {/* Marketers Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="p-3">Marketer Name & Title</th>
                    <th className="p-3">Email & Department</th>
                    <th className="p-3">Organization</th>
                    <th className="p-3">Assigned Brand Portfolios</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marketersList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-blue-700 font-bold">{m.roleTitle}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-800">{m.email || 'm.vance@gilead.com'}</div>
                        <div className="text-[11px] text-slate-500">{m.department}</div>
                      </td>

                      <td className="p-3 font-medium text-slate-700">{m.organization}</td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(m.assignedBrands || ['Trodelvy®', 'Yescarta®']).map((brand, i) => (
                            <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-medium">
                              {brand}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => switchPersona(m.id)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                          >
                            Emulate
                          </button>
                          <button
                            onClick={() => handleOpenUserModal('marketer', m)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Marketer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove marketer ${m.name}?`)) {
                                removeUser(m.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Marketer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Analytics Team Directory & Creation */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Gilead Analytics & Data Compliance Team
                </h3>
                <p className="text-xs text-slate-500">
                  Manage commercial analytics leads auditing metadata drift across Veeva CRM, SFMC, Adobe, and generating master taxonomy reports.
                </p>
              </div>

              <button
                onClick={() => handleOpenUserModal('analytics')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Analytics Lead</span>
              </button>
            </div>

            {/* Analytics Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="p-3">Analytics Lead</th>
                    <th className="p-3">Email & Department</th>
                    <th className="p-3">Analytics Scope</th>
                    <th className="p-3">Audit Authorities</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analyticsList.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{a.name}</div>
                        <div className="text-[11px] text-purple-700 font-bold">{a.roleTitle}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-800">{a.email || 'e.rostova@gilead.com'}</div>
                        <div className="text-[11px] text-slate-500">{a.department}</div>
                      </td>

                      <td className="p-3 font-medium text-slate-700">{a.organization}</td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {a.permissions.slice(0, 3).map((perm, i) => (
                            <span key={i} className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => switchPersona(a.id)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                          >
                            Emulate
                          </button>
                          <button
                            onClick={() => handleOpenUserModal('analytics', a)}
                            className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit User"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove analytics user ${a.name}?`)) {
                                removeUser(a.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Topic & Subtopic Editor */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Form */}
          <form onSubmit={handleAddSubcategory} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-900">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-600" />
                Add Gilead Subtopic
              </h3>
              <p className="text-xs text-slate-500">
                Directly update Gilead Master Taxonomy definitions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Topic</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
              >
                {keyMessages.map((km) => (
                  <option key={km.id} value={km.id}>
                    {km.name} ({km.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subtopic Code</label>
              <input
                type="text"
                required
                value={subcategoryCode}
                onChange={(e) => setSubcategoryCode(e.target.value)}
                placeholder="e.g. TOP-EFF-05"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-rose-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subtopic Name</label>
              <input
                type="text"
                required
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                placeholder="e.g. Rapid Onset of Sustained Response"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save to Master Taxonomy Dictionary</span>
            </button>
          </form>

          {/* Master Browser */}
          <div className="lg:col-span-2">
            <TaxonomyDictionaryView />
          </div>

        </div>
      )}

      {/* Tab 5: Permission Matrix */}
      {activeTab === 'permissions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-600" />
                GOTS Role & Permission Access Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Persona-based access control rules enforcing dynamic forms, views, and REST API permissions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                <tr>
                  <th className="p-3">User Persona / Role</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Primary Focus & Form Customization</th>
                  <th className="p-3">Granted Permissions</th>
                  <th className="p-3 text-right">Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {personas.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-rose-700 font-bold">{p.roleTitle}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{p.organization}</td>
                    <td className="p-3 text-slate-600 max-w-xs">{p.description}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {p.permissions.slice(0, 3).map((perm, i) => (
                          <span key={i} className="bg-slate-100 border border-slate-200 text-rose-800 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => switchPersona(p.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-rose-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 shadow-sm"
                      >
                        Emulate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: System Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-rose-600" />
                Global Master System Audit Trail
              </h3>
              <p className="text-xs text-slate-500">Recorded log of every user action, taxonomy change, and API call.</p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="border-b border-slate-800 pb-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>[{log.timestamp}]</span>
                  <span className="text-rose-400 font-bold">{log.action}</span>
                </div>
                <div className="text-white mt-0.5">
                  User: <strong>{log.user}</strong> ({log.role}) &bull; Target: <span className="text-rose-300">{log.target}</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agency Modal */}
      {isAgencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingAgency ? 'Edit Agency Profile' : 'Onboard New Agency Partner'}
                </h3>
              </div>
              <button
                onClick={() => setIsAgencyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgency} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agency Name *</label>
                  <input
                    type="text"
                    required
                    value={agencyForm.name}
                    onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                    placeholder="e.g. Omnicom Health Group"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agency Code *</label>
                  <input
                    type="text"
                    required
                    value={agencyForm.code}
                    onChange={(e) => setAgencyForm({ ...agencyForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. OMC"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Contact Person</label>
                  <input
                    type="text"
                    value={agencyForm.primaryContact}
                    onChange={(e) => setAgencyForm({ ...agencyForm, primaryContact: e.target.value })}
                    placeholder="e.g. Sarah Chen"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={agencyForm.contactEmail}
                    onChange={(e) => setAgencyForm({ ...agencyForm, contactEmail: e.target.value })}
                    placeholder="e.g. gilead@agency.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Region Scope</label>
                <select
                  value={agencyForm.regionScope}
                  onChange={(e) => setAgencyForm({ ...agencyForm, regionScope: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                >
                  <option value="US Commercial">US Commercial</option>
                  <option value="Global Commercial">Global Commercial</option>
                  <option value="EU Commercial">EU Commercial</option>
                  <option value="US & Global Commercial">US & Global Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Brands</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-28 overflow-y-auto">
                  {brands.map((b) => {
                    const selected = agencyForm.assignedBrands.includes(b.name);
                    return (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => toggleBrandSelection(b.name, true)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          selected
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAgencyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
                >
                  {editingAgency ? 'Save Changes' : 'Onboard Agency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User (Marketer / Analytics) Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? `Edit ${userModalRole.toUpperCase()} User` : `Create New ${userModalRole.toUpperCase()} User`}
                </h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="e.g. Dr. Marcus Vance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="e.g. m.vance@gilead.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    value={userForm.roleTitle}
                    onChange={(e) => setUserForm({ ...userForm, roleTitle: e.target.value })}
                    placeholder="e.g. Senior Brand Director"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    placeholder="e.g. Commercial Strategy"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization</label>
                <input
                  type="text"
                  value={userForm.organization}
                  onChange={(e) => setUserForm({ ...userForm, organization: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Brands</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-28 overflow-y-auto">
                  {brands.map((b) => {
                    const selected = userForm.assignedBrands.includes(b.name);
                    return (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => toggleBrandSelection(b.name, false)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          selected
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
                >
                  {editingUser ? 'Save User Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};


