import React from 'react';
import { usePersona } from '../context/PersonaContext';
import {
  FileCode,
  CheckCircle2,
  BarChart3,
  Cpu,
  ShieldAlert,
  ArrowRight,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export const RoleGuideBanner: React.FC = () => {
  const { currentPersona, switchPersona, personas } = usePersona();

  if (!currentPersona) return null;

  const roleIcons = {
    agency: <FileCode className="w-4 h-4 text-emerald-400" />,
    marketer: <CheckCircle2 className="w-4 h-4 text-teal-400" />,
    analytics: <BarChart3 className="w-4 h-4 text-cyan-400" />,
    it: <Cpu className="w-4 h-4 text-amber-400" />,
    superadmin: <ShieldAlert className="w-4 h-4 text-slate-200" />
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 text-white px-4 sm:px-6 lg:px-8 py-3 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left Role Context */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5 sm:mt-0">
            {roleIcons[currentPersona.role]}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
                Active Persona:
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                {currentPersona.name}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${currentPersona.badgeColor}`}>
                {currentPersona.roleTitle}
              </span>
              <span className="text-xs text-slate-400 font-medium">({currentPersona.organization})</span>
            </div>

            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
              {currentPersona.description}
            </p>
          </div>
        </div>

        {/* Right Role Switcher Pills */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <span className="text-[11px] text-slate-400 font-medium hidden lg:inline">Role View:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {personas.map((p) => {
              const isActive = p.id === currentPersona.id;
              return (
                <button
                  key={p.id}
                  onClick={() => switchPersona(p.id)}
                  title={`Switch to ${p.name} (${p.roleTitle})`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="capitalize">{p.role}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
