import React, { useState } from 'react';
import { usePersona } from '../../context/PersonaContext';
import { TaxonomyTooltip, TAXONOMY_TOOLTIPS } from './TaxonomyTooltip';
import { LoginModal } from '../LoginModal';
import {
  Globe,
  User,
  Download,
  MapPin,
  ChevronDown,
  Info,
  Layers,
  Sparkles,
  X,
  Building,
  ShieldCheck,
  Check
} from 'lucide-react';

interface MarketScopeNavbarProps {
  cardTitle?: string;
  onExportCsv?: () => void;
}

export const MarketScopeNavbar: React.FC<MarketScopeNavbarProps> = ({
  cardTitle = 'Commercial Campaign & Taxonomy Control Center',
  onExportCsv
}) => {
  const {
    currentPersona,
    selectedMarket,
    setSelectedMarket,
  } = usePersona();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showExportDetails, setShowExportDetails] = useState(false);

  const marketDetails: Record<string, { label: string; desc: string; currency: string; regulator: string; focus: string; coords: { cx: number; cy: number; r: number }[] }> = {
    'US Commercial': {
      label: 'United States Commercial Market',
      desc: 'US Commercial healthcare provider and patient omnichannel campaigns governed by FDA advertising guidelines, Veeva CRM US, and SFMC journey triggers.',
      currency: 'USD ($)',
      regulator: 'FDA (OPDP Compliance)',
      focus: 'Oncology (Trodelvy®) & Virology (Biktarvy®, Descovy®)',
      coords: [{ cx: 160, cy: 110, r: 32 }] // North America
    },
    'EU Commercial': {
      label: 'European Union Commercial Market',
      desc: 'EU-wide multi-lingual omnichannel deployment covering UK, Germany, France, Italy, Spain under EMA regulations and GDPR privacy laws.',
      currency: 'EUR (€) / GBP (£)',
      regulator: 'EMA (European Medicines Agency)',
      focus: 'Pan-European HCP Portal & Multi-Country MLR',
      coords: [{ cx: 370, cy: 100, r: 28 }] // Europe
    },
    'Global': {
      label: 'Global Enterprise Master Scope',
      desc: 'Core enterprise master taxonomy definitions applicable across all international affiliates, shared dictionaries, and central Veeva Vault.',
      currency: 'Multi-Currency Standard',
      regulator: 'Global Regulatory Standard',
      focus: 'Master Topic & Subtopic Taxonomy Dictionaries',
      coords: [
        { cx: 160, cy: 110, r: 24 },
        { cx: 370, cy: 100, r: 24 },
        { cx: 520, cy: 140, r: 24 },
        { cx: 220, cy: 210, r: 24 }
      ]
    },
    'JPAC': {
      label: 'Japan & Asia Pacific (JPAC)',
      desc: 'Japan, Australia, South Korea, and Southeast Asia commercial scope aligned with PMDA guidelines and localized LINE/WeChat/email integrations.',
      currency: 'JPY (¥) / AUD ($)',
      regulator: 'PMDA (Japan) & TGA (Australia)',
      focus: 'Cell Therapy & Hepatitis SVR Initiatives',
      coords: [{ cx: 520, cy: 140, r: 35 }] // Asia Pacific / Japan
    },
    'LATAM': {
      label: 'Latin America Commercial Market',
      desc: 'Brazil, Mexico, Colombia, and Argentina commercial market scope under ANVISA and local health authority compliance frameworks.',
      currency: 'BRL (R$) / MXN ($)',
      regulator: 'ANVISA & LATAM Ministry of Health',
      focus: 'HIV Prevention Access & Liver Antiviral Expansion',
      coords: [{ cx: 220, cy: 210, r: 28 }] // Latin America
    }
  };

  const currentMarketInfo = marketDetails[selectedMarket] || marketDetails['US Commercial'];

  return (
    <>
      {/* Classical Top Navbar just above card window */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md text-white space-y-3">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Active Persona Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 p-2 sm:px-3 sm:py-1.5 rounded-xl transition text-left group"
              title="Click to change active user persona"
            >
              <div className={`w-8 h-8 rounded-lg ${currentPersona?.avatarBg || 'bg-rose-600'} flex items-center justify-center font-bold text-xs text-white shadow-inner shrink-0`}>
                {currentPersona?.name.charAt(0)}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                  <span>{currentPersona?.name}</span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 font-mono px-1.5 py-0.2 rounded border border-rose-800 font-bold uppercase">
                    {currentPersona?.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                  {currentPersona?.roleTitle} • {currentPersona?.company}
                </div>
              </div>
            </button>

            <div className="hidden sm:block border-l border-slate-800 h-8"></div>

            <div className="hidden md:block">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{cardTitle}</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-normal">
                Active Governance Mode: <strong className="text-slate-200">{currentPersona?.roleTitle}</strong>
              </p>
            </div>
          </div>

          {/* Right Controls: Market Scopes Dropdown, Map Toggle & Export CSV Button */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Market Scopes Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Globe className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider hidden sm:inline">Scope:</span>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="bg-slate-900 text-white font-bold text-xs rounded-lg px-2 py-0.5 border border-slate-700 focus:outline-none focus:border-rose-500"
              >
                <option value="US Commercial">US Commercial</option>
                <option value="EU Commercial">EU Commercial</option>
                <option value="Global">Global Enterprise</option>
                <option value="JPAC">Asia Pacific (JPAC)</option>
                <option value="LATAM">LATAM</option>
              </select>
              <TaxonomyTooltip {...TAXONOMY_TOOLTIPS.region} />
            </div>

            {/* Map Area Button */}
            <button
              onClick={() => setShowMapModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition border border-slate-700 flex items-center gap-1.5 shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Market Map</span>
            </button>

            {/* Export CSV Button */}
            <div className="relative">
              <a
                href="/api/export/csv?type=campaigns"
                download
                onClick={onExportCsv}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm border border-rose-500/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* Market Scope Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 text-white border border-slate-700 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-600 text-white rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{currentMarketInfo.label}</h3>
                  <p className="text-xs text-slate-400">Target Market Region & Omnichannel Alignment Scope</p>
                </div>
              </div>

              <button
                onClick={() => setShowMapModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive World Map Area */}
            <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-hidden text-center space-y-2">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Highlighted Market Region: {selectedMarket}</span>
              </div>

              {/* Styled World Map SVG with Region Highlighting */}
              <svg
                viewBox="0 0 650 300"
                className="w-full h-48 sm:h-56 mx-auto object-contain text-slate-800"
                fill="currentColor"
              >
                {/* World Continents simplified path silhouettes */}
                {/* North America */}
                <path d="M 80 50 Q 140 40 190 70 Q 200 120 150 150 Q 100 140 80 100 Z" className="fill-slate-800 stroke-slate-700 stroke-1" />
                {/* South America */}
                <path d="M 180 160 Q 220 170 230 220 Q 200 270 170 230 Z" className="fill-slate-800 stroke-slate-700 stroke-1" />
                {/* Europe */}
                <path d="M 330 60 Q 390 50 410 90 Q 370 120 340 100 Z" className="fill-slate-800 stroke-slate-700 stroke-1" />
                {/* Africa */}
                <path d="M 330 120 Q 390 120 390 190 Q 350 230 320 170 Z" className="fill-slate-800 stroke-slate-700 stroke-1" />
                {/* Asia / JPAC */}
                <path d="M 420 50 Q 560 40 580 120 Q 500 170 430 110 Z" className="fill-slate-800 stroke-slate-700 stroke-1" />
                {/* Australia */}
                <path d="M 520 200 Q 580 200 570 250 Q 510 250 520 200 Z" className="fill-slate-800 stroke-slate-700 stroke-1" />

                {/* Highlighted Target Market Region Rings & Glowing Circles */}
                {currentMarketInfo.coords.map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.cx} cy={pt.cy} r={pt.r + 12} className="fill-rose-600/20 animate-pulse" />
                    <circle cx={pt.cx} cy={pt.cy} r={pt.r} className="fill-rose-600/40 stroke-rose-400 stroke-2" />
                    <circle cx={pt.cx} cy={pt.cy} r={6} className="fill-white shadow-lg" />
                  </g>
                ))}
              </svg>

              <p className="text-xs text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
                {currentMarketInfo.desc}
              </p>
            </div>

            {/* Scope Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Currency Standard</span>
                <span className="font-bold text-rose-300 text-xs mt-0.5 block">{currentMarketInfo.currency}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Regulatory Authority</span>
                <span className="font-bold text-slate-200 text-xs mt-0.5 block">{currentMarketInfo.regulator}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Omnichannel Focus</span>
                <span className="font-bold text-emerald-300 text-xs mt-0.5 block">{currentMarketInfo.focus}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowMapModal(false)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Apply Market Scope
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};
