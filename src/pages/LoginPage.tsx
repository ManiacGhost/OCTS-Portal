import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { homePathFor } from '../auth/home';
import { DUMMY_CREDENTIALS, UserCredentials } from '../data/credentials';

/**
 * Original line-art of digital promotional channels (email, push, paid search,
 * social, display/video, broadcast, alerts, analytics) wired into one network.
 * Hand-drawn here — not derived from any third-party asset — and rendered greyed
 * out behind the brand panel.
 */
const ChannelsBackdrop: React.FC = () => (
  <div className="absolute inset-0" aria-hidden="true">
    <svg
      viewBox="0 0 480 760"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full text-slate-300 opacity-[0.12]"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* each icon drawn in a 0 0 100 100 box */}
        <g id="ch-email">
          <rect x="12" y="24" width="76" height="52" rx="6" />
          <path d="M14 30l36 26 36-26" />
        </g>
        <g id="ch-phone">
          <rect x="30" y="10" width="40" height="80" rx="8" />
          <line x1="44" y1="80" x2="56" y2="80" />
          <circle cx="66" cy="22" r="5" fill="currentColor" stroke="none" />
        </g>
        <g id="ch-cursor">
          <path d="M34 26l8 46 10-18 18-5z" />
          <path d="M20 20l7 7M18 36h9M36 18v9" />
        </g>
        <g id="ch-chat">
          <path d="M16 22h68a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H44L26 82V64h-10a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6z" />
          <circle cx="36" cy="44" r="4" fill="currentColor" stroke="none" />
          <circle cx="50" cy="44" r="4" fill="currentColor" stroke="none" />
          <circle cx="64" cy="44" r="4" fill="currentColor" stroke="none" />
        </g>
        <g id="ch-display">
          <rect x="12" y="18" width="76" height="50" rx="6" />
          <path d="M42 32l20 11-20 11z" fill="currentColor" stroke="none" />
          <line x1="34" y1="82" x2="66" y2="82" />
          <line x1="50" y1="68" x2="50" y2="82" />
        </g>
        <g id="ch-megaphone">
          <path d="M18 44v14l12 3 6 20h9l-5-18 28 10V26z" />
          <path d="M80 34c9 4 9 24 0 28" />
        </g>
        <g id="ch-bell">
          <path d="M50 14a20 20 0 0 1 20 20v16l8 12H22l8-12V34a20 20 0 0 1 20-20z" />
          <path d="M42 74a8 8 0 0 0 16 0" />
        </g>
        <g id="ch-search">
          <circle cx="44" cy="44" r="22" />
          <line x1="60" y1="60" x2="84" y2="84" />
        </g>
        <g id="ch-bars">
          <line x1="16" y1="84" x2="88" y2="84" />
          <line x1="26" y1="84" x2="26" y2="56" />
          <line x1="44" y1="84" x2="44" y2="40" />
          <line x1="62" y1="84" x2="62" y2="50" />
          <line x1="80" y1="84" x2="80" y2="28" />
        </g>
        <g id="ch-at">
          <circle cx="50" cy="50" r="15" />
          <path d="M65 50c0 11 13 11 13 -1a28 28 0 1 0-11 22" />
        </g>
      </defs>

      {/* connective network */}
      <g opacity="0.55">
        <path d="M88 96 L272 74 M272 74 L392 150 M120 232 L272 74 M120 232 L252 366 M252 366 L338 300 M252 366 L392 400 M120 470 L252 366 M320 512 L252 366 M88 604 L120 470 M272 632 L320 512 M392 660 L272 632 M180 700 L120 470 M60 342 L120 232" />
        {[
          [88, 96], [272, 74], [392, 150], [120, 232], [252, 366], [338, 300],
          [392, 400], [60, 342], [120, 470], [320, 512], [88, 604], [272, 632],
          [392, 660], [180, 700],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.5" fill="currentColor" stroke="none" />
        ))}
      </g>

      {/* channel glyphs */}
      <use href="#ch-email" transform="translate(40 46) scale(0.9)" />
      <use href="#ch-search" transform="translate(228 30) scale(0.85)" />
      <use href="#ch-display" transform="translate(346 104) scale(0.9)" />
      <use href="#ch-chat" transform="translate(72 184) scale(0.95)" />
      <use href="#ch-at" transform="translate(20 296) scale(0.85)" />
      <use href="#ch-megaphone" transform="translate(196 318) scale(0.95)" />
      <use href="#ch-bars" transform="translate(292 250) scale(0.9)" />
      <use href="#ch-phone" transform="translate(300 340) scale(0.85)" />
      <use href="#ch-bell" transform="translate(76 420) scale(0.85)" />
      <use href="#ch-cursor" transform="translate(276 460) scale(0.95)" />
      <use href="#ch-email" transform="translate(36 556) scale(0.8)" />
      <use href="#ch-phone" transform="translate(232 584) scale(0.8)" />
      <use href="#ch-chat" transform="translate(346 612) scale(0.8)" />
      <use href="#ch-search" transform="translate(140 656) scale(0.8)" />
    </svg>
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
      <div className="relative hidden lg:flex flex-col justify-between bg-slate-800 text-white p-12 overflow-hidden">
        {/* Greyed-out decorative backdrop — original line art of digital promotional channels */}
        <ChannelsBackdrop />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/60 to-slate-900/90" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-navy-600 flex items-center justify-center font-extrabold text-xl shadow-md">
            O
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">Omnia</div>
            <div className="text-[11px] text-navy-300 font-bold uppercase tracking-widest">
              Digital Content Taxonomy &amp; Metadata
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <h1 className="text-3xl font-extrabold leading-tight">
            One source of truth for omnichannel content taxonomy &amp; metadata.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Build compliant campaign taxonomy, map topics &amp; subtopics, and keep every
            downstream engine aligned — governed by role.
          </p>
        </div>

        <div className="relative z-10 text-[11px] text-slate-500 font-mono">v2.4 • Global Commercial Operations</div>
      </div>

      {/* Login panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-navy-600 text-white flex items-center justify-center font-extrabold text-lg">
              O
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">Omnia</div>
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
              <span>Demo roles — one-click sign in</span>
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
                    {cred.role}
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
