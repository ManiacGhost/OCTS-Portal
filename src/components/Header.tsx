import React, { useState } from 'react';
import { usePersona } from '../context/PersonaContext';
import { LoginModal } from './LoginModal';
import { TaxonomyTooltip, TAXONOMY_TOOLTIPS } from './common/TaxonomyTooltip';
import {
  Download,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentPersona } = usePersona();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center font-extrabold text-white text-lg tracking-wider shadow-sm shrink-0 border border-rose-500/40">
              O
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Omnichannel Commercial Taxonomy Hub
                </span>
                <span className="text-[10px] uppercase tracking-widest text-rose-300 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/80">
                  OCTS Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Enterprise Master Taxonomy Source of Truth • Topic & Subtopic Governance Engine
              </p>
            </div>
          </div>

          {/* Right Actions: User Profile Switcher & Export CSV directly beside it */}
          <div className="flex items-center gap-3">
            
            {/* User Login / Switch Button */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 px-3.5 py-1.5 rounded-xl transition-all shadow-sm text-left group"
              title="Click to switch active user persona"
            >
              <div className={`w-7 h-7 rounded-lg ${currentPersona?.avatarBg || 'bg-rose-600'} flex items-center justify-center font-bold text-xs text-white shadow-inner shrink-0`}>
                {currentPersona?.name.charAt(0)}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-1">
                  {currentPersona?.name}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-400 capitalize font-medium">
                  {currentPersona?.roleTitle}
                </div>
              </div>
            </button>

            {/* Export CSV Option right beside User Name, equipped with TaxonomyTooltip */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <a
                href="/api/export/csv?type=campaigns"
                download
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm border border-rose-500/30"
                title="Download active campaign taxonomy CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>

              <TaxonomyTooltip
                fieldName="Export Campaign CSV"
                taxonomyCode="CSV"
                description="Downloads complete omnichannel campaign taxonomy records, Topic & Subtopic codes, UTM strings, and agency owners formatted for Veeva CRM & SFMC."
                purpose="Used by agency planners & marketers for offline media plans, audits, and CRM uploads."
                position="bottom-left"
              />
            </div>

          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

