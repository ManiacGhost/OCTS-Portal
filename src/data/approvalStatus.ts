import { CampaignTaxonomy } from '../types';

/**
 * Only the campaign (its taxonomy formula) is approved by the marketer. Tactics need no approval: a tactic
 * can be added once its campaign is approved, and is ready to use as soon as it is saved.
 */

type Status = CampaignTaxonomy['status'];

export const isApproved = (s?: string) => s === 'approved' || s === 'active';

/** Does this campaign have a tactic at all? (Older records carry channel details without a `tactic`.) */
export function hasTactic(c: CampaignTaxonomy): boolean {
  return !!(c.tactic || c.channelType);
}

/** The tactic's own ID (falls back to the record id when none was assigned). */
export const tacticCode = (c: CampaignTaxonomy): string => c.tacticId || c.id;

/** A saved tactic is always ready ("approved"): tactics have no approval step. Undefined when there is no tactic yet. */
export function tacticStatusOf(c: CampaignTaxonomy): Status | undefined {
  return hasTactic(c) ? 'approved' : undefined;
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

/** The parts of this campaign currently waiting for the marketer (only ever the campaign itself). */
export function pendingParts(c: CampaignTaxonomy): ApprovalPart[] {
  return c.status === 'submitted' ? ['campaign'] : [];
}

/** Ready to be sent to the marketer: a draft or rejected campaign. */
export function canSubmit(c: CampaignTaxonomy): boolean {
  return c.status === 'draft' || c.status === 'rejected';
}

/** The system-generated campaign ID (falls back to the record id for anything created before IDs existed). */
export const campaignIdOf = (c: CampaignTaxonomy): string => c.campaignId || c.id;

/** The campaign's dates as YYYY-MM-DD. Older records only have them inside the formula's date token. */
export function campaignDates(c: CampaignTaxonomy): { start: string; end: string } {
  if (c.startDate) return { start: c.startDate, end: c.endDate || c.startDate };
  const m = /^(\d{4})(\d{2})-(\d{4})(\d{2})$/.exec(c.formulaInputs?.date || '');
  if (!m) return { start: '', end: '' };
  const last = new Date(Number(m[3]), Number(m[4]), 0).getDate();
  return { start: `${m[1]}-${m[2]}-01`, end: `${m[3]}-${m[4]}-${String(last).padStart(2, '0')}` };
}

/** The channel to show for a tactic: the dictionary channel, or the portal category on older records. */
export const channelLabel = (c: CampaignTaxonomy): string => c.tactic?.channel || c.channelType || '';
