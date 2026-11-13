/**
 * The shape of an option in a searchable dropdown (VaultCombobox). The Asset ID options now come
 * from the Kite dictionary (aset_id) — see kiteDictionary.ts.
 */
export interface VaultItem {
  id: string;
  name: string;
  /** shown as a hint in the option label */
  detail?: string;
}

/** "ID — name (detail)", or just the ID when the option has no separate name. */
export const vaultLabel = (v: VaultItem): string =>
  v.name && v.name !== v.id ? `${v.id}: ${v.name}${v.detail ? ` (${v.detail})` : ''}` : v.id;
