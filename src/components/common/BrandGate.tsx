import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { usePersona } from '../../context/PersonaContext';
import { BrandLogo } from './BrandLogo';

/**
 * The brand picker. It floats over the page right after sign-in (before the landing tiles) until the
 * user picks one of the brands the admin allocated to them, and opens again from "Change brand".
 * Everything in the portal then runs for that brand only.
 */
export const BrandGate: React.FC = () => {
  const { user, logout } = useAuth();
  const { isLoading, allowedBrands, activeBrand, setActiveBrand, brandPickerOpen, setBrandPickerOpen } = usePersona();
  const navigate = useNavigate();

  // admins work across brands; one allocated brand is selected automatically
  if (!user || user.role === 'superadmin' || isLoading) return null;
  if (!activeBrand && allowedBrands.length === 1) return null;
  const mustChoose = !activeBrand;
  if (!mustChoose && !brandPickerOpen) return null;

  const choose = (id: string) => {
    const changing = !!activeBrand && activeBrand.id !== id;
    setActiveBrand(id);
    setBrandPickerOpen(false);
    // a page for the previous brand's campaign wouldn't make sense any more — start from the tiles
    if (changing) navigate('/');
  };

  const signOut = () => {
    setBrandPickerOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      className="fixed inset-0 z-[150] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your brand"
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {!mustChoose && (
          <button
            type="button"
            onClick={() => setBrandPickerOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {mustChoose ? `Welcome ${user.name.split(' ')[0]} — choose your brand` : 'Change brand'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {allowedBrands.length === 0
              ? 'No brands have been allocated to your account yet.'
              : 'The whole portal — campaigns, tactics, approvals and tagging — will show this brand only. You can switch any time from the top bar.'}
          </p>
        </div>

        {allowedBrands.length === 0 ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-600">Please ask your administrator to give you access to a brand.</p>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 text-xs font-bold text-navy-700 bg-white hover:bg-navy-50 border border-navy-200 rounded-xl px-4 py-2.5 transition"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        ) : (
          <div className={`grid gap-3 ${allowedBrands.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {allowedBrands.map(b => {
              const current = activeBrand?.id === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => choose(b.id)}
                  aria-pressed={current}
                  className={`group text-left rounded-2xl border p-5 transition flex flex-col items-center gap-3 ${
                    current
                      ? 'border-navy-500 ring-2 ring-navy-500/30 bg-navy-50/40'
                      : 'border-slate-200 hover:border-navy-300 hover:shadow-md bg-white'
                  }`}
                >
                  <div className="h-14 flex items-center justify-center text-slate-800">
                    <BrandLogo brand={b} size="lg" />
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] text-slate-500 leading-snug">{b.name.replace(/^[^ ]+ ?/, '')}</div>
                    {b.indication && <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{b.indication}</div>}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      current ? 'bg-navy-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-navy-600 group-hover:text-white'
                    }`}
                  >
                    {current ? 'Current brand' : 'Work in this brand'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
