// Turns what the player typed into a valid answer (or null).
// Forgiving on case, accents, punctuation, a leading "the", and small typos.

import type { Answer, Prompt } from './prompts';

export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/['’`.]/g, '') // "Barnard's" -> "barnards", "J.S." -> "js"
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^the /, '');
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/** Typos allowed for a word of this length. Short names must be exact. */
function allowedTypos(length: number): number {
  if (length < 5) return 0;
  if (length < 9) return 1;
  return 2;
}

export interface MatchResult {
  answer: Answer;
  /** True when it only matched thanks to typo tolerance. */
  fuzzy: boolean;
}

export function matchAnswer(prompt: Prompt, input: string): MatchResult | null {
  const guess = normalize(input);
  if (!guess) return null;

  let best: { answer: Answer; distance: number } | null = null;

  for (const answer of prompt.answers) {
    for (const form of [answer.name, ...answer.aliases]) {
      const target = normalize(form);
      if (target === guess) return { answer, fuzzy: false };
      const d = levenshtein(guess, target);
      if (d <= allowedTypos(target.length) && (!best || d < best.distance)) {
        best = { answer, distance: d };
      }
    }
  }

  return best ? { answer: best.answer, fuzzy: true } : null;
}
