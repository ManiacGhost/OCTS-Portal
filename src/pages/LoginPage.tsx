import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { homePathFor } from '../auth/home';
import { DUMMY_CREDENTIALS, UserCredentials } from '../data/credentials';
import { roleLabel } from '../auth/permissions';

/**
 * The sign-in backdrop: the portal's own parts — campaign & UTM tagging, content tagging, content MDM,
 * journey metadata and the dictionary — each an orbit of the one shared taxonomy at the centre. Signals flow
 * in from each part, tags flow back out, and each part's own assets circle it. No words: it sits behind the
 * headline. Original line art, drawn here.
 */
const HUB = { x: 320, y: 450 };
const RADIUS = 235;
// two tags travel in along each spoke; half of them carry a dictionary code (null = a plain green tag)
const PILLARS: { glyph: string; angle: number; tags: [string | null, string | null] }[] = [
  { glyph: 'pl-link', angle: -90, tags: ['src', null] }, // campaign management (GA / UTM)
  { glyph: 'pl-tag', angle: -18, tags: [null, 'chnl'] }, // content tagging / mapping
  { glyph: 'pl-db', angle: 54, tags: ['brd', null] }, // content MDM
  { glyph: 'pl-route', angle: 126, tags: [null, 'indc'] }, // journey metadata
  { glyph: 'pl-book', angle: 198, tags: ['src', null] }, // dictionary
];
const at = (angle: number, r = RADIUS, c = HUB) => ({
  x: c.x + r * Math.cos((angle * Math.PI) / 180),
  y: c.y + r * Math.sin((angle * Math.PI) / 180),
});

const ChannelsBackdrop: React.FC = () => (
  // softened well back, so it reads as a backdrop behind the headline
  <div className="absolute inset-0" aria-hidden="true">
   <div className="absolute inset-0 opacity-60 blur-[2px]">
    <svg viewBox="0 0 640 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full text-slate-200" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        {/* pillar icons, each drawn in a 0 0 100 100 box */}
        <g id="pl-link" strokeWidth={7}>
          <path d="M42 58a14 14 0 0 0 20 0l14-14a14 14 0 0 0-20-20l-6 6" />
          <path d="M58 42a14 14 0 0 0-20 0L24 56a14 14 0 0 0 20 20l6-6" />
        </g>
        <g id="pl-tag" strokeWidth={7}>
          <path d="M14 50V18a4 4 0 0 1 4-4h32l36 36-36 36z" />
          <circle cx="32" cy="32" r="6" />
        </g>
        <g id="pl-db" strokeWidth={7}>
          <ellipse cx="50" cy="24" rx="30" ry="10" />
          <path d="M20 24v52c0 5.5 13.4 10 30 10s30-4.5 30-10V24" />
          <path d="M20 50c0 5.5 13.4 10 30 10s30-4.5 30-10" />
        </g>
        <g id="pl-route" strokeWidth={7}>
          <circle cx="22" cy="78" r="8" />
          <circle cx="78" cy="22" r="8" />
          <path d="M30 78h30a14 14 0 0 0 0-28H40a14 14 0 0 1 0-28h30" />
        </g>
        <g id="pl-book" strokeWidth={7}>
          <path d="M50 26c-10-8-26-8-36-4v58c10-4 26-4 36 4 10-8 26-8 36-4V22c-10-4-26-4-36 4z" />
          <path d="M50 26v58" />
        </g>
      </defs>

      {/* spokes from every part of the portal to the shared taxonomy */}
      {PILLARS.map(p => {
        const n = at(p.angle);
        return <line key={`s${p.angle}`} className="flow-line" x1={n.x} y1={n.y} x2={HUB.x} y2={HUB.y} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1.5} />;
      })}
      {/* the outer ring that links the parts to each other */}
      <circle cx={HUB.x} cy={HUB.y} r={RADIUS} stroke="currentColor" strokeOpacity={0.1} strokeWidth={1.5} strokeDasharray="2 10" />
      <circle className="svg-box spin-slow" cx={HUB.x} cy={HUB.y} r={RADIUS + 60} stroke="currentColor" strokeOpacity={0.06} strokeWidth={1} strokeDasharray="1 14" />

      {/* signals flowing in */}
      {PILLARS.map((p, i) => {
        const n = at(p.angle);
        return (
          <circle key={`in${p.angle}`} r={3.5} fill="#7dd3fc" opacity={0.85}>
            <animateMotion dur={`${3.6 + (i % 3) * 0.5}s`} begin={`${i * 0.7}s`} repeatCount="indefinite" path={`M${n.x} ${n.y} L${HUB.x} ${HUB.y}`} />
          </circle>
        );
      })}
      {/* green tags travel in from each part alongside its signals, in the same soft focus as the dots */}
      {PILLARS.flatMap((p, i) => {
        const n = at(p.angle);
        return p.tags.map((tag, k) => {
          const begin = `${(i * 1.3 + k * 3.25 + 0.6).toFixed(2)}s`;
          const route = `M${n.x} ${n.y} L${HUB.x} ${HUB.y}`;
          // a price-tag shape: a body with a pointed end and a punched hole; a named tag has a longer body for its text
          const body = tag ? tag.length * 6.8 + 14 : 14;
          const shape = `M${-body / 2 - 6} -8 h${body} l8 8 l-8 8 h${-body} z`;
          return (
            <g key={`tag${p.angle}-${k}`} opacity={0}>
              {/* plain tags turn to point the way they travel; named ones stay level so they can be read */}
              <animateMotion dur="6.5s" begin={begin} repeatCount="indefinite" path={route} {...(tag ? {} : { rotate: 'auto' })} />
              <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.15;0.8;1" dur="6.5s" begin={begin} repeatCount="indefinite" />
              <path d={shape} fill="#065f46" stroke="#34d399" strokeWidth={1.5} strokeLinejoin="round" />
              <circle cx={-body / 2 - 1} cy={0} r={2.2} fill="#16243a" stroke="#34d399" strokeWidth={1} />
              {tag && (
                <text x={4} y={4} textAnchor="middle" fontSize={11} fontWeight={600} fontFamily="JetBrains Mono, monospace" fill="#d1fae5">
                  {tag}
                </text>
              )}
            </g>
          );
        });
      })}
      {/* each part of the portal, with its own items circling it */}
      {PILLARS.map((p, i) => {
        const n = at(p.angle);
        return (
          <g key={`n${p.angle}`}>
            <g className="svg-box spin-slow" style={{ animationDuration: `${18 + i * 4}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}>
              <circle cx={n.x} cy={n.y} r={54} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="3 7" />
              {[0, 120, 240].map(a => {
                const d = at(a + i * 30, 54, n);
                return <circle key={a} cx={d.x} cy={d.y} r={3} fill="currentColor" fillOpacity={0.45} />;
              })}
            </g>
            <circle cx={n.x} cy={n.y} r={32} fill="#16243a" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} />
            <use href={`#${p.glyph}`} transform={`translate(${n.x - 16} ${n.y - 16}) scale(0.32)`} stroke="currentColor" strokeOpacity={0.8} />
          </g>
        );
      })}

      {/* the shared taxonomy at the centre */}
      <circle className="svg-box spin-slow" cx={HUB.x} cy={HUB.y} r={84} stroke="#7dd3fc" strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="6 9" />
      <circle cx={HUB.x} cy={HUB.y} r={60} stroke="#7dd3fc" strokeOpacity={0.45} strokeWidth={1.5}>
        <animate attributeName="r" values="60;72;60" dur="3.4s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.45;0.05;0.45" dur="3.4s" repeatCount="indefinite" />
      </circle>
      <circle cx={HUB.x} cy={HUB.y} r={50} fill="#1d3358" stroke="#7dd3fc" strokeOpacity={0.6} strokeWidth={2} />
      {/* the Tagging360 mark at the heart of the hub, ringed by blue dots: many values, one structure */}
      {[30, 90, 150, 210, 270, 330].map(a => {
        const d = at(a, 25);
        return <circle key={a} cx={d.x} cy={d.y} r={4} fill="#7dd3fc" fillOpacity={0.7} />;
      })}
      <image href="/logo-icon.png" x={HUB.x - 15} y={HUB.y - 15} width={30} height={30} preserveAspectRatio="xMidYMid meet" opacity={0.9} style={{ filter: 'brightness(0) invert(1)' }} />
    </svg>
   </div>
  </div>
);

export const LoginPage: React.FC = () => {
  const { user, isHydrating, isAuthenticating, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-7 h-7 animate-spin text-navy-600" />
      </div>
    );
  }

  // Every sign-in lands on the role's home (launcher for agency/marketer/analytics,
  // /overview for superadmin) — never a deep-linked page.
  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  const submit = async (mail: string, pass: string) => {
    setErrorMsg('');
    const res = await login(mail, pass);
    if (res.ok && res.user) {
      navigate(homePathFor(res.user.role), { replace: true });
    } else {
      setErrorMsg(res.error || 'Login failed.');
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    submit(email.trim(), password);
  };

  const handleQuickLogin = (cred: UserCredentials) => {
    setEmail(cred.email);
    setPassword(cred.password);
    submit(cred.email, cred.password);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-slate-800 text-white p-12 overflow-hidden login-aurora">
        {/* Greyed-out decorative backdrop — original line art of digital promotional channels */}
        <ChannelsBackdrop />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-900/45 to-slate-900/85" />

        <div className="relative z-10 flex items-center gap-3">
          <span className="logo-reveal relative inline-flex">
            <img src="/logo-full.png" alt="Tagging360" className="h-32 w-auto brightness-0 invert drop-shadow-lg" />
            {/* a band of light that sweeps across the mark itself (masked to the logo's shape) */}
            <span className="logo-sheen absolute inset-0" aria-hidden="true" />
          </span>
          <div>
            <div className="text-[11px] text-navy-300 font-bold uppercase tracking-widest">
              Digital Content Taxonomy &amp; Metadata
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <div className="hero-in h-1 w-14 rounded-full bg-gradient-to-r from-sky-300 to-navy-300" style={{ animationDelay: "100ms" }} />
          <h1 className="hero-in font-display text-[2rem] sm:text-4xl font-extrabold leading-[1.15] tracking-tight" style={{ animationDelay: "200ms" }}>
            One source of truth for omnichannel content taxonomy &amp; metadata.
          </h1>
          <p className="hero-in text-[15px] text-slate-300 leading-relaxed" style={{ animationDelay: "350ms" }}>
            Build compliant campaign taxonomy, map topics &amp; subtopics, and keep every
            downstream engine aligned: governed by role.
          </p>
        </div>

        <div className="relative z-10 text-[11px] text-slate-500 font-mono">v2.4 • Global Commercial Operations</div>
      </div>

      {/* Login panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3">
            <img src="/logo-full.png" alt="Tagging360" className="h-16 w-auto" />
            <div>
              <div className="text-[10px] text-navy-600 font-bold uppercase tracking-widest">DCTM</div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Sign in</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Access is role-based. Your role is set at sign-in and can only be changed by signing
              out and signing back in.
            </p>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-navy-50 border border-navy-200 text-navy-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. sarah.chen@havas.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="e.g. agency123"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-navy-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-navy-600 hover:bg-navy-700 disabled:opacity-60 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isAuthenticating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Sign in</span>
            </button>
          </form>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Key className="w-3.5 h-3.5 text-navy-600" />
              <span>Demo roles: one-click sign in</span>
            </div>
            <div className="grid gap-2">
              {DUMMY_CREDENTIALS.map(cred => (
                <button
                  key={cred.personaId}
                  onClick={() => handleQuickLogin(cred)}
                  disabled={isAuthenticating}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-navy-400 hover:bg-navy-50/40 transition text-left disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg ${cred.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                      {cred.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{cred.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{cred.roleTitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-700 bg-navy-50 border border-navy-200 px-2 py-1 rounded-lg shrink-0">
                    {roleLabel(cred.role)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
