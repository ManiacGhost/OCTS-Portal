import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

/** A small "are you sure?" pop-up. Escape or the backdrop cancels. */
export const ConfirmDialog: React.FC<{
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, confirmLabel, cancelLabel = 'Cancel', busy, onConfirm, onCancel }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="bg-navy-600 hover:bg-navy-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
