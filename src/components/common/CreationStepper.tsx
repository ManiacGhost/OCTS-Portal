import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Campaign creation' },
  { n: 2, label: 'Tactic creation' },
  { n: 3, label: 'UTM generation' },
] as const;

/**
 * The three stages of the creation flow. Stages after the campaign are only reachable once a
 * campaign exists (`campaignId`), so they're clickable then.
 */
export const CreationStepper: React.FC<{ current: 1 | 2 | 3; campaignId?: string }> = ({ current, campaignId }) => {
  const navigate = useNavigate();
  const go = (n: number) => {
    if (!campaignId) return;
    if (n === 2) navigate(`/campaigns/${campaignId}/tactic`);
    if (n === 3) navigate(`/utm?tactic=${campaignId}`);
  };
  return (
    <ol className="grid grid-cols-3 gap-2 text-xs" aria-label="Creation steps">
      {STEPS.map(s => {
        const done = s.n < current;
        const active = s.n === current;
        const clickable = !!campaignId && s.n > 1 && !active;
        return (
          <li key={s.n}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => go(s.n)}
              aria-current={active ? 'step' : undefined}
              className={`w-full p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                active
                  ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                  : done
                  ? 'bg-navy-50 text-navy-800 border-navy-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              } ${clickable ? 'hover:border-navy-300 cursor-pointer' : 'cursor-default'}`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 ${
                  active ? 'bg-white/20' : done ? 'bg-navy-600 text-white' : 'bg-slate-200'
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : s.n}
              </span>
              {s.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
};
