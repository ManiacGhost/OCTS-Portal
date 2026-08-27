import React, { useState } from 'react';
import { usePersona } from '../context/PersonaContext';
import { DUMMY_CREDENTIALS, UserCredentials } from '../data/credentials';
import { TaxonomyTooltip } from './common/TaxonomyTooltip';
import { LogIn, Lock, Mail, X, Key } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const roleDescriptions: Record<string, { desc: string; purpose: string }> = {
  agency: {
    desc: 'Agency Partner / Content Creator responsible for generating standard enterprise campaign taxonomy codes, topic tags, and tracking URLs for agency media deliverables.',
    purpose: 'Drafting new campaign codes, selecting Topics/Subtopics, and generating UTM tracking URLs.'
  },
  marketer: {
    desc: 'Brand Marketer responsible for reviewing agency campaign taxonomy submissions, validating Topic & Subtopic alignments, and giving MLR/Brand approvals.',
    purpose: 'Approving or rejecting submitted campaign taxonomies and managing brand message matrix alignment.'
  },
  analytics: {
    desc: 'Commercial Data Analyst & Governance Lead monitoring omnichannel taxonomy compliance, UTM accuracy, and Veeva CRM performance metrics.',
    purpose: 'Auditing taxonomy compliance, resolving UTM discrepancies, and exporting governance analytics.'
  },
  superadmin: {
    desc: 'Master Taxonomy Administrator with full CRUD authority to manage Therapeutic Areas, Brands, Topics, Subtopics, and master dictionaries.',
    purpose: 'Editing master taxonomy dictionaries, creating new Topics/Subtopics, and managing system configurations.'
  }
};

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { switchPersona, showToast } = usePersona();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const matched = DUMMY_CREDENTIALS.find(
      c => (c.email || '').toLowerCase() === (email || '').trim().toLowerCase() && c.password === password
    );

    if (matched) {
      await switchPersona(matched.personaId);
      showToast(`Welcome back, ${matched.name}! Logged in as ${matched.roleTitle}`, 'success');
      onClose();
    } else {
      setErrorMsg('Invalid email or password. Please use the dummy credentials listed below.');
    }
  };

  const handleQuickLogin = async (cred: UserCredentials) => {
    setEmail(cred.email);
    setPassword(cred.password);
    await switchPersona(cred.personaId);
    showToast(`Logged in as ${cred.name} (${cred.roleTitle})`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Gilead Pinkish Red branding */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center font-extrabold text-white text-xl shadow-md">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                  Gilead Omnichannel Taxonomy Solution
                </span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-white">
                User Sign In & Persona Switcher
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-slate-900">
          
          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <LogIn className="w-4 h-4 text-rose-600" />
              Sign In with Account Credentials
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah.chen@havas.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. agency123"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Taxonomy Hub</span>
            </button>
          </form>

          {/* Quick Demo Persona Profiles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-rose-600" />
                  Select Demo Persona (1-Click Login)
                </h3>
                <p className="text-xs text-slate-500">
                  Select any commercial role below to test role-based dashboards & permission rules.
                </p>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                Dummy Credentials
              </span>
            </div>

            <div className="space-y-2">
              {DUMMY_CREDENTIALS.map((cred) => {
                const roleInfo = roleDescriptions[cred.role] || {
                  desc: 'Commercial governance persona.',
                  purpose: 'Accessing role-specific dashboards and tools.'
                };

                return (
                  <div
                    key={cred.personaId}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-rose-400 bg-white hover:bg-rose-50/40 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${cred.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm`}>
                        {cred.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{cred.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${cred.badgeColor}`}>
                            {cred.roleTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-700 font-semibold">{cred.email}</span> &bull; pass: <code className="bg-slate-100 text-rose-700 font-bold px-1 py-0.2 rounded font-mono text-[10px]">{cred.password}</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <TaxonomyTooltip
                        fieldName={`${cred.roleTitle} Role`}
                        taxonomyCode={cred.role.toUpperCase()}
                        description={roleInfo.desc}
                        purpose={roleInfo.purpose}
                        position="bottom-left"
                      />

                      <button
                        onClick={() => handleQuickLogin(cred)}
                        className="shrink-0 bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
                      >
                        Login as {cred.role.toUpperCase()}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
          Dummy credentials are also available in <code className="font-mono font-bold text-slate-800">/src/data/credentials.ts</code>
        </div>

      </div>
    </div>
  );
};
