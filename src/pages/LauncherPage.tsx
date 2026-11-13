import { firstName } from '../utils/names';
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
  { to: '/overview', label: 'Campaign Management (GA/UTM)', icon: Link2, desc: 'Create campaigns with the approved taxonomy formula, then generate the UTMs for content trafficking.' },
  { to: '/autotag', label: 'Content Tagging/Mapping', icon: Tags, desc: 'Review tagging of assets/other engagements (Calls, speaker programs, etc.) with content metadata.' },
  { to: '/content-mdm', label: 'Content MDM', icon: Database, desc: 'Latest content metadata directly from VVPM.' },
  { to: '/content-metadata', label: 'Journey Metadata', icon: FileText, desc: 'The data leveraged across channels to follow each audience journey: step, tactic, creative and audience IDs tied to every engagement.' },
  { to: '/dictionary', label: 'Dictionary and Templates', icon: BookOpen, desc: 'The Kite Digital Taxonomy: approved values and abbreviations, in one shared language.' },
];

const HELIX_RUNGS = Array.from({ length: 16 }, (_, i) => i);

/** A DNA double helix that really turns: every rung opens and closes while its two ends swap sides. */
const MovingHelix: React.FC<{ x: number }> = ({ x }) => (
  <svg viewBox="0 0 1200 460" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-white" aria-hidden="true">
    <g transform={`translate(${x} 0)`}>
      {HELIX_RUNGS.map(i => {
        const y = 24 + i * 27;
        const d = `${(-i * 0.5).toFixed(2)}s`;
        return (
          <g key={i} transform={`translate(0 ${y})`}>
            <g className="svg-box helix-rung" style={{ animationDelay: d }}>
              <line x1={-34} x2={34} y1={0} y2={0} stroke="currentColor" strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
            </g>
            <g className="helix-dot" style={{ ['--a' as string]: '34px', animationDelay: d }}>
              <circle className="helix-depth" style={{ animationDelay: d }} r={5.5} fill="currentColor" />
            </g>
            <g className="helix-dot" style={{ ['--a' as string]: '-34px', animationDelay: d }}>
              <circle className="helix-depth" style={{ animationDelay: `${(-i * 0.5 - 2).toFixed(2)}s` }} r={5.5} fill="currentColor" />
            </g>
          </g>
        );
      })}
    </g>
  </svg>
);

/**
 * Original line-art of drug / molecular imagery — hexagonal molecule chains, a fused ring system,
 * capsules, CAR-T cells and a turning DNA helix, all gently moving behind the hero band.
 * Hand-drawn here (not derived from any third-party asset).
 */
const PharmaBackdrop: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    {/* soft highlights that slowly wander */}
    <div className="glow-move absolute -top-40 -right-24 w-[640px] h-[640px] rounded-full bg-navy-300/25 blur-3xl" />
    <div className="glow-move absolute -bottom-48 -left-32 w-[520px] h-[520px] rounded-full bg-sky-300/20 blur-3xl" style={{ animationDelay: '-8s' }} />

    <svg
      viewBox="0 0 1200 460"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full text-white opacity-[0.14]"
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
      <g className="svg-box drift-a">
        <use href="#pb-hex" transform="translate(120 96)" />
        <use href="#pb-hex" transform="translate(172 126)" />
        <use href="#pb-hex" transform="translate(120 156)" />
        <line x1="146" y1="66" x2="146" y2="40" />
        <circle cx="146" cy="36" r="4" fill="currentColor" stroke="none" />
        <line x1="198" y1="126" x2="228" y2="126" />
        <circle cx="232" cy="126" r="4" fill="currentColor" stroke="none" />
      </g>

      {/* fused ring system — centre */}
      <g className="svg-box drift-b">
        <use href="#pb-hex" transform="translate(548 250) scale(1.2)" />
        <use href="#pb-hex" transform="translate(602 250) scale(1.2)" />
        <use href="#pb-hex" transform="translate(656 250) scale(1.2)" />
        <line x1="656" y1="220" x2="686" y2="196" />
        <circle cx="690" cy="192" r="4" fill="currentColor" stroke="none" />
      </g>

      {/* capsules */}
      <g className="svg-box drift-b" style={{ animationDelay: '-3s' }}><use href="#pb-pill" transform="translate(330 372) rotate(18)" /></g>
      <g className="svg-box drift-a" style={{ animationDelay: '-6s' }}><use href="#pb-pill" transform="translate(792 96) rotate(-14)" /></g>
      <g className="svg-box drift-a" style={{ animationDelay: '-9s' }}><use href="#pb-pill" transform="translate(214 316) rotate(46)" /></g>

      {/* CAR-T cells: slowly turning */}
      <g className="svg-box spin-slow"><use href="#pb-cell" transform="translate(432 118)" /></g>
      <g className="svg-box spin-slow" style={{ animationDirection: 'reverse' }}><use href="#pb-cell" transform="translate(900 322) scale(0.78)" /></g>

      {/* scattered nodes that pulse */}
      {[[700, 80], [380, 230], [860, 150], [520, 400], [300, 60], [980, 420], [60, 250]].map(([cx, cy], i) => (
        <circle key={i} className="svg-box pulse-node" style={{ animationDelay: `${i * 0.6}s` }} cx={cx} cy={cy} r={3.5} fill="currentColor" stroke="none" />
      ))}
    </svg>

    <div className="absolute inset-0 opacity-[0.55]"><MovingHelix x={1070} /></div>

    {/* a heartbeat trace running along the bottom of the band */}
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="absolute bottom-28 left-0 w-full h-10 text-white opacity-30">
      <path
        className="ecg-line"
        d="M0 30 H300 l12 0 l10 -22 l16 44 l12 -34 l10 12 H760 l12 0 l10 -22 l16 44 l12 -34 l10 12 H1200"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1400}
      />
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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-sky-50/60 flex flex-col">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-navy-700 via-navy-600 to-navy-500 text-white overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-white/25 z-10" />
        <PharmaBackdrop />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-14 pb-40">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-xl hero-in">
              <div className="flex items-center gap-3">
                <img src="/logo-full.png" alt="Tagging360" className="h-20 w-auto brightness-0 invert drop-shadow-lg" />
                <div>
                  <div className="text-[10px] text-navy-100 font-bold uppercase tracking-widest">
                    Digital Content Taxonomy &amp; Metadata
                  </div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-8 leading-tight hero-in" style={{ animationDelay: "120ms" }}>
                Welcome {firstName(user.name)}
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
                className="tile-float tile-shine relative overflow-hidden h-full bg-white border border-slate-200 rounded-2xl p-4 shadow-lg transition duration-200 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-navy-300"
                style={{ animationDelay: `${i * 1.3}s` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-navy-600 via-sky-400 to-navy-300 opacity-70 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-navy-50 to-sky-50 text-navy-700 border border-navy-100 transition duration-300 group-hover:from-navy-700 group-hover:to-navy-500 group-hover:border-navy-600 group-hover:text-white group-hover:shadow-md group-hover:scale-110 group-hover:-rotate-6">
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
        Tagging360 · Digital Content Taxonomy &amp; Metadata (DCTM) · v2.4
      </footer>
    </div>
  );
};
