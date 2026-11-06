/**
 * Asset IDs and Tactic IDs offered in the Campaign Builder's first step.
 *
 * PLACEHOLDER DATA. These will be synced into the portal's database from the client's asset vault
 * (Veeva Vault for assets, the media plan / CRM for tactics) and re-fetched on every update; until
 * that sync exists the lists below stand in for it. Swap `ASSET_VAULT` / `TACTIC_VAULT` for a fetch
 * and the dropdowns keep working — they only need `id` (the value stored) and `name` (the label).
 */

export interface VaultItem {
  id: string;
  name: string;
  /** shown as a hint in the option label */
  detail?: string;
}

export const ASSET_VAULT: VaultItem[] = [
  { id: 'VV-ASET-48213', name: 'Yescarta 2L LBCL — ORR HCP banner', detail: '300x250' },
  { id: 'VV-ASET-48214', name: 'Yescarta 2L LBCL — ORR HCP banner', detail: '728x90' },
  { id: 'VV-ASET-48390', name: 'Yescarta CRS & ICANS management — email', detail: 'HTML' },
  { id: 'VV-ASET-48552', name: 'Yescarta ATC referral pathway — landing page', detail: 'Web' },
  { id: 'VV-ASET-49107', name: 'Tecartus R/R MCL — efficacy visual aid', detail: 'IVA deck' },
  { id: 'VV-ASET-49121', name: 'Tecartus R/R MCL — safety visual aid', detail: 'IVA deck' },
  { id: 'VV-ASET-49880', name: 'Kite CAR-T treatment journey — patient video', detail: 'Video 60s' },
  { id: 'VV-ASET-50244', name: 'Yescarta paid search — brand & efficacy ad copy', detail: 'RSA' },
];

export const TACTIC_VAULT: VaultItem[] = [
  { id: 'TACT-2026-0091', name: 'Programmatic display — HCP awareness', detail: 'Q3 2026' },
  { id: 'TACT-2026-0092', name: '3P email — HCP efficacy push', detail: 'Q3 2026' },
  { id: 'TACT-2026-0107', name: 'Paid social — LinkedIn HCP', detail: 'Q3 2026' },
  { id: 'TACT-2026-0118', name: 'Paid search — branded terms', detail: 'Always on' },
  { id: 'TACT-2026-0123', name: 'SFMC journey — ATC referral nurture', detail: 'Always on' },
  { id: 'TACT-2026-0140', name: 'Field — IVA rep call deck rollout', detail: 'Q4 2026' },
  { id: 'TACT-2026-0155', name: 'Website — HCP hub refresh', detail: 'Q4 2026' },
];

/** "VV-ASET-48213 — Yescarta 2L LBCL — ORR HCP banner (300x250)" */
export const vaultLabel = (v: VaultItem): string => `${v.id} — ${v.name}${v.detail ? ` (${v.detail})` : ''}`;
