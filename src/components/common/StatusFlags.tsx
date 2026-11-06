import React from 'react';
import { CampaignTaxonomy } from '../../types';
import { statusLabel, tacticStatusOf, visibleTacticStatus } from '../../data/approvalStatus';

export const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  submitted: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-300',
};

const pill = 'text-[9px] leading-4 font-bold px-1.5 py-px rounded-full border uppercase tracking-wide whitespace-nowrap';

export const CampaignFlag: React.FC<{ status: string; plain?: boolean }> = ({ status, plain }) => (
  <span title="Campaign approval status" className={`${pill} ${STATUS_BADGE[status] || STATUS_BADGE.draft}`}>
    {plain ? '' : 'Campaign · '}{statusLabel(status)}
  </span>
);

export const TacticFlag: React.FC<{ status: string }> = ({ status }) => (
  <span title="Tactic approval status" className={`${pill} ${STATUS_BADGE[status] || STATUS_BADGE.draft}`}>
    Tactic · {statusLabel(status)}
  </span>
);

/**
 * The campaign flag, and the tactic flag next to it. The tactic flag is left out while the campaign
 * hasn't been approved; a campaign with no tactic at all shows a dashed "No tactic" marker instead.
 */
export const StatusFlags: React.FC<{ campaign: CampaignTaxonomy }> = ({ campaign: c }) => {
  const t = visibleTacticStatus(c);
  return (
    <>
      <CampaignFlag status={c.status} />
      {t ? (
        <TacticFlag status={t} />
      ) : tacticStatusOf(c) ? null : (
        <span className={`${pill} border-dashed border-slate-300 text-slate-400`}>No tactic</span>
      )}
    </>
  );
};
