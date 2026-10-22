import React from 'react';
import { REACH_STYLE, DimReach } from '../../data/dimensionGroups';

/** Key for the common / unique colouring of dimensions. */
export const ReachLegend: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 ${className}`}>
    {(['common', 'unique'] as DimReach[]).map(k => (
      <span key={k} className="inline-flex items-center gap-1.5" title={REACH_STYLE[k].hint}>
        <span className={`w-2.5 h-2.5 rounded-full ${REACH_STYLE[k].dot}`} />
        <b className="text-slate-700">{REACH_STYLE[k].label}</b>
      </span>
    ))}
  </div>
);
