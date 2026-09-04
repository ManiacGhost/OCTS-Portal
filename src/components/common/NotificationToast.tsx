import React from 'react';
import { usePersona } from '../../context/PersonaContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePersona();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-200 animate-slide-in text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
              : toast.type === 'error'
              ? 'bg-amber-950/90 text-amber-100 border-amber-800'
              : 'bg-slate-900/90 text-slate-100 border-slate-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
          
          <div className="flex-1 pr-2 leading-relaxed">{toast.message}</div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-200 p-0.5 rounded-md hover:bg-slate-800/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
