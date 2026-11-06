/**
 * Small fuzzy matcher for the Asset ID / Tactic ID pickers.
 *
 * The query is split on spaces; EVERY word has to match somewhere in the text, in any order, so
 * "yes banner 300" or "48213" or "t0091" all work. A word matches either as a plain substring
 * (best) or as a subsequence — its characters in order but not necessarily touching ("vva48" finds
 * "VV-ASET-48213") — which is what makes typos-by-omission and abbreviations still find the item.
 */

export interface FuzzyHit {
  /** lower is better */
  score: number;
  /** indexes of `text` to highlight */
  indexes: number[];
}

/** Match a single word against `text` (both already lower-cased). */
function matchWord(word: string, text: string, strict = false): FuzzyHit | null {
  const at = text.indexOf(word);
  if (at !== -1) {
    // substring: earlier, and at a word start, is better
    const wordStart = at === 0 || /[^a-z0-9]/.test(text[at - 1]);
    return {
      score: at + (wordStart ? 0 : 5),
      indexes: Array.from({ length: word.length }, (_, i) => at + i),
    };
  }
  if (strict) return null;
  // subsequence
  const indexes: number[] = [];
  let from = 0;
  for (const ch of word) {
    const i = text.indexOf(ch, from);
    if (i === -1) return null;
    indexes.push(i);
    from = i + 1;
  }
  const spread = indexes[indexes.length - 1] - indexes[0];
  return { score: 100 + spread, indexes };
}

/** Fuzzy-match `query` against `text`; null when any word of the query doesn't match. */
export function fuzzyMatch(query: string, text: string, strict = false): FuzzyHit | null {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = text.toLowerCase();
  if (words.length === 0) return { score: 0, indexes: [] };
  let score = 0;
  const idx = new Set<number>();
  for (const w of words) {
    const hit = matchWord(w, hay, strict);
    if (!hit) return null;
    score += hit.score;
    hit.indexes.forEach(i => idx.add(i));
  }
  return { score, indexes: [...idx].sort((a, b) => a - b) };
}

/** Items that match, best first (original order when the query is empty). */
export function fuzzyFilter<T>(items: T[], query: string, textOf: (item: T) => string, strict = false): { item: T; hit: FuzzyHit }[] {
  const out: { item: T; hit: FuzzyHit; order: number }[] = [];
  items.forEach((item, order) => {
    const hit = fuzzyMatch(query, textOf(item), strict);
    if (hit) out.push({ item, hit, order });
  });
  return out.sort((a, b) => a.hit.score - b.hit.score || a.order - b.order).map(({ item, hit }) => ({ item, hit }));
}
