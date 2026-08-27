import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { DUMMY_CREDENTIALS, UserCredentials } from '../data/credentials';

export const LoginPage: React.FC = () => {
  const { user, isHydrating, isAuthenticating, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const redirectTo = (location.state as { from?: string } | null)?.from || '/overview';

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-7 h-7 animate-spin text-rose-600" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const submit = async (mail: string, pass: string) => {
    setErrorMsg('');
    const res = await login(mail, pass);
    if (res.ok) {
      navigate(redirectTo, { replace: true });
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
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-12">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center font-extrabold text-xl shadow-md">
            O
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">Omnia</div>
            <div className="text-[11px] text-rose-300 font-bold uppercase tracking-widest">
              Digital Content Taxonomy &amp; Metadata
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-extrabold leading-tight">
            One source of truth for omnichannel content taxonomy &amp; metadata.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Build compliant campaign taxonomy, map topics &amp; subtopics, and keep every
            downstream engine aligned — governed by role.
          </p>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">v2.4 • Global Commercial Operations</div>
      </div>

      {/* Login panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-extrabold text-lg">
              O
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">Omnia</div>
              <div className="text-[10px] text-rose-600 font-bold uppercase tracking-widest">DCTM</div>
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
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isAuthenticating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Sign in</span>
            </button>
          </form>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Key className="w-3.5 h-3.5 text-rose-600" />
              <span>Demo roles — one-click sign in</span>
            </div>
            <div className="grid gap-2">
              {DUMMY_CREDENTIALS.map(cred => (
                <button
                  key={cred.personaId}
                  onClick={() => handleQuickLogin(cred)}
                  disabled={isAuthenticating}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-rose-400 hover:bg-rose-50/40 transition text-left disabled:opacity-60"
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg shrink-0">
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
