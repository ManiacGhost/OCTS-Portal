import { BrandLogo } from '../components/common/BrandLogo';
import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Route, BookOpen, Link2, Tags, Database, FileText, ArrowRight, LogOut, LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { usePersona } from '../context/PersonaContext';

interface Tile {
  to: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  soon?: boolean;
}

/** The four components of Kite's content tagging & taxonomy model then Dictionary. */
const TILES: Tile[] = [
  { to: '/tagging-strategy', label: 'Brand Tagging Strategy', icon: Route, desc: 'Review and Edit Channel-wise tagging strategy' },
  { to: '/overview', label: 'Campaign Management (GA)', icon: Link2, desc: 'Create campaigns with the approved taxonomy formula, then generate the UTMs that identify every link to the brand website.' },
  { to: '/autotag', label: 'Content Tagging/Mapping', icon: Tags, desc: 'Tagging assets in VVPM using Content Metadata, so all content in flight has the right info for tracking.', soon: true },
  { to: '/content-mdm', label: 'Content MDM', icon: Database, desc: 'Establishes and governs the standardized business information and taxonomy that content metadata refers to.' },
  { to: '/content-metadata', label: 'Journey Metadata', icon: FileText, desc: 'Attributes that help understand what type of content an audience is engaging with — Topic, Subtopic, Key Message and more.' },
  { to: '/dictionary', label: 'Dictionary', icon: BookOpen, desc: 'The Kite Digital Taxonomy — approved values and abbreviations, in one shared language.' },
];

/**
 * Original line-art of drug / molecular imagery — hexagonal molecule chains,
 * a fused ring system, capsules, a DNA double helix and CAR-T cells.
 * Hand-drawn here (not derived from any third-party asset) and rendered faintly
 * behind the hero band.
 */
const PharmaBackdrop: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    {/* soft highlights */}
    <div className="absolute -top-40 -right-24 w-[640px] h-[640px] rounded-full bg-navy-300/25 blur-3xl" />
    <div className="absolute -bottom-48 -left-32 w-[520px] h-[520px] rounded-full bg-navy-500/25 blur-3xl" />

    <svg
      viewBox="0 0 1200 460"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full text-white opacity-[0.09]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <g id="pb-hex">
          <polygon points="26,0 13,22.5 -13,22.5 -26,0 -13,-22.5 13,-22.5" />
        </g>
        <g id="pb-pill">
          <rect x="-34" y="-13" width="68" height="26" rx="13" />
          <line x1="0" y1="-13" x2="0" y2="13" />
        </g>
        <g id="pb-cell">
          <circle cx="0" cy="0" r="34" />
          <circle cx="7" cy="-5" r="12" />
          <path d="M-34 0 l-9 0 M34 0 l9 0 M0 -34 l0 -9 M0 34 l0 9 M24 -24 l6 -6 M-24 24 l-6 6 M24 24 l6 6 M-24 -24 l-6 -6" />
        </g>
      </defs>

      {/* hexagon molecule cluster — top left */}
      <use href="#pb-hex" transform="translate(120 96)" />
      <use href="#pb-hex" transform="translate(172 126)" />
      <use href="#pb-hex" transform="translate(120 156)" />
      <line x1="146" y1="66" x2="146" y2="40" />
      <circle cx="146" cy="36" r="4" fill="currentColor" stroke="none" />
      <line x1="198" y1="126" x2="228" y2="126" />
      <circle cx="232" cy="126" r="4" fill="currentColor" stroke="none" />

      {/* fused ring system — centre */}
      <use href="#pb-hex" transform="translate(548 250) scale(1.2)" />
      <use href="#pb-hex" transform="translate(602 250) scale(1.2)" />
      <use href="#pb-hex" transform="translate(656 250) scale(1.2)" />
      <line x1="656" y1="220" x2="686" y2="196" />
      <circle cx="690" cy="192" r="4" fill="currentColor" stroke="none" />

      {/* capsules */}
      <use href="#pb-pill" transform="translate(330 372) rotate(18)" />
      <use href="#pb-pill" transform="translate(792 96) rotate(-14)" />
      <use href="#pb-pill" transform="translate(214 316) rotate(46)" />

      {/* CAR-T cells */}
      <use href="#pb-cell" transform="translate(432 118)" />
      <use href="#pb-cell" transform="translate(900 322) scale(0.78)" />

      {/* DNA double helix — right */}
      <path d="M1010 20 C 1078 90, 942 150, 1010 220 S 1078 350, 1010 440" />
      <path d="M1082 20 C 1014 90, 1150 150, 1082 220 S 1014 350, 1082 440" />
      <line x1="1018" y1="56" x2="1074" y2="56" />
      <line x1="1010" y1="96" x2="1082" y2="96" />
      <line x1="1014" y1="140" x2="1078" y2="140" />
      <line x1="1010" y1="188" x2="1082" y2="188" />
      <line x1="1018" y1="240" x2="1074" y2="240" />
      <line x1="1010" y1="292" x2="1082" y2="292" />
      <line x1="1014" y1="344" x2="1078" y2="344" />
      <line x1="1010" y1="396" x2="1082" y2="396" />

      {/* scattered nodes */}
      <circle cx="700" cy="80" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="380" cy="230" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="860" cy="150" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="520" cy="400" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="300" cy="60" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  </div>
);

export const LauncherPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedMarket, activeBrand, allowedBrands, setBrandPickerOpen } = usePersona();
  const navigate = useNavigate();

  if (!user) return null;
  if (user.role === 'superadmin') return <Navigate to="/overview" replace />;

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-navy-700 via-navy-600 to-navy-500 text-white overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-white/25 z-10" />
        <PharmaBackdrop />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-14 pb-40">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <img src="/logo-full.png" alt="Tagging360" className="h-20 w-auto brightness-0 invert" />
                <div>
                  <div className="text-[10px] text-navy-100 font-bold uppercase tracking-widest">
                    Digital Content Taxonomy &amp; Metadata
                  </div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-8 leading-tight">
                Welcome {user.name.split(' ')[0]}
              </h1>
              <p className="text-sm text-navy-50 mt-3 leading-relaxed">
                Your role-based workspace for building and governing omnichannel content taxonomy
                across the Kite cell-therapy portfolio.
              </p>
              <p className="text-sm text-navy-200 mt-2">
                Signed in for <span className="text-white font-semibold">{selectedMarket}</span>
                <span className="text-navy-300"> · {user.roleTitle}</span>
              </p>
              {activeBrand && (
                <div className="mt-4 inline-flex items-center gap-3 bg-white rounded-xl pl-3 pr-2 py-2 shadow-md text-slate-900">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</span>
                  <BrandLogo brand={activeBrand} size="md" />
                  {allowedBrands.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setBrandPickerOpen(true)}
                      className="text-[11px] font-bold text-navy-700 bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-lg px-2.5 py-1 transition"
                    >
                      Change brand
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3.5 py-2 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Tiles — pulled up to overlap the hero */}
      <div className="max-w-6xl mx-auto w-full px-6 sm:px-10 -mt-28 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TILES.map(({ to, label, desc, icon: Icon, soon }, i) => (
            <Link
              key={to}
              to={to}
              className="tile-rise group"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div
                className="tile-float h-full bg-white border border-slate-200 rounded-2xl p-4 shadow-lg transition duration-200 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-navy-300"
                style={{ animationDelay: `${i * 1.3}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-navy-50 text-navy-700 border border-navy-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  {soon && (
                    <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                      Coming soon
                    </span>
                  )}
                </div>
                <h2 className="text-base font-extrabold text-slate-900 mt-4">{label}</h2>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{desc}</p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-navy-600 mt-4">
                  Open
                  <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="mt-auto bg-navy-700 text-navy-200 text-xs py-4 px-6 text-center">
        Tagging360 — Digital Content Taxonomy &amp; Metadata (DCTM) · v2.4
      </footer>
    </div>
  );
};
