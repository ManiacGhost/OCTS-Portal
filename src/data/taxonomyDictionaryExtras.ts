/**
 * Dictionary headers for dimensions the portal added beyond the Evoke taxonomy sheet (the Website
 * channel's fields). Kept apart from `taxonomyDictionary.ts` because that file is generated from the
 * sheet and would drop these on regeneration. Values are OURS — confirm with the client.
 *   KEY MESSAGE  -> `key_msg`   (the portal's key-message categories)
 *   PAGE TYPE    -> `page_typ`
 *   SITE SECTION -> `site_sect`
 * `page_nm` (Page name) is free text, so it has no dictionary list.
 */
import type { DictionaryEntry } from './taxonomyDictionary';

export const DICTIONARY_EXTRAS: Record<string, DictionaryEntry[]> = {
  'KEY MESSAGE': [
    { v: 'Efficacy & Durable Response', a: 'EFF' },
    { v: 'Safety: CRS & ICANS Management', a: 'SAF' },
    { v: 'Treatment Journey & Logistics', a: 'PROC' },
    { v: 'Access & Authorized Treatment Centers', a: 'ACC' },
    { v: 'Patient Quality of Life', a: 'QOL' },
  ],
  'PAGE TYPE': [
    { v: 'Home page', a: 'HOME' },
    { v: 'Landing page', a: 'LAND' },
    { v: 'Product page', a: 'PROD' },
    { v: 'Resource page', a: 'RES' },
    { v: 'HCP hub', a: 'HCP' },
    { v: 'Patient hub', a: 'PAT' },
    { v: 'Form / sign-up', a: 'FORM' },
  ],
  'SITE SECTION': [
    { v: 'Efficacy', a: 'EFF' },
    { v: 'Safety', a: 'SAF' },
    { v: 'Dosing & administration', a: 'DOS' },
    { v: 'Access & support', a: 'ACC' },
    { v: 'Resources', a: 'RES' },
    { v: 'About', a: 'ABT' },
  ],
};
