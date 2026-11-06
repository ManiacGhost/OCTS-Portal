import { CampaignTaxonomy } from '../types';

/**
 * A campaign is approved in two parts: the campaign itself (its taxonomy formula) and its tactic
 * (channel, publisher, placement, …). They're tracked separately. A tactic only comes up for the
 * marketer once its campaign is approved.
 */

type Status = CampaignTaxonomy['status'];

export const isApproved = (s?: string) => s === 'approved' || s === 'active';

/** Does this campaign have a tactic at all? (Older records carry channel details without a `tactic`.) */
export function hasTactic(c: CampaignTaxonomy): boolean {
  return !!(c.tactic || c.channelType);
}

/** The tactic's own ID (falls back to the record id when none was assigned). */
export const tacticCode = (c: CampaignTaxonomy): string => c.tacticId || c.id;

/** The tactic's own approval status, or undefined when the campaign has no tactic yet. */
export function tacticStatusOf(c: CampaignTaxonomy): Status | undefined {
  if (!hasTactic(c)) return undefined;
  return c.tacticStatus ?? c.status;
}

/**
 * The tactic status that is shown in flags and queues. It's hidden while its campaign hasn't been
 * approved — unless the tactic itself is already approved (e.g. the campaign was edited and is back
 * in review while its tactic is unchanged and still approved).
 */
export function visibleTacticStatus(c: CampaignTaxonomy): Status | undefined {
  const t = tacticStatusOf(c);
  if (!t) return undefined;
  return isApproved(c.status) || isApproved(t) ? t : undefined;
}

/** Wording for a status flag. */
export function statusLabel(s: string | undefined): string {
  switch (s) {
    case 'submitted':
      return 'pending approval';
    case 'active':
      return 'approved';
    default:
      return s || '';
  }
}

export type ApprovalPart = 'campaign' | 'tactic';

/** The parts of this campaign currently waiting for the marketer. */
export function pendingParts(c: CampaignTaxonomy): ApprovalPart[] {
  const parts: ApprovalPart[] = [];
  if (c.status === 'submitted') parts.push('campaign');
  // the tactic is reviewed only after its campaign is approved
  if (isApproved(c.status) && tacticStatusOf(c) === 'submitted') parts.push('tactic');
  return parts;
}

/** Ready to be sent to the marketer: has a tactic and still has a draft / rejected part. */
export function canSubmit(c: CampaignTaxonomy): boolean {
  if (!hasTactic(c)) return false;
  const ts = tacticStatusOf(c);
  const open = (s?: Status) => s === 'draft' || s === 'rejected';
  return open(c.status) || open(ts);
}
