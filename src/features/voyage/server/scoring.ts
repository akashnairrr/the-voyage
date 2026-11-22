// PLACEHOLDER SCORING — the one file to replace when the real metric is decided.
//
// Everything else in the game only calls scoreAnswer(), so swapping the metric
// (speed bonus, streaks, live rarity from player data, etc.) happens here.

import { RARITY_TIERS } from '../domain/config';
import type { MatchResult } from './matching';

export interface ScoreContext {
  /** Seconds left on the clock when the answer was submitted. */
  secondsLeft: number;
  secondsTotal: number;
}

export interface ScoreResult {
  points: number;
  tierName: string;
  /** Short label explaining the score, shown to the player. */
  label: string;
}

export function scoreAnswer(match: MatchResult | null, _ctx: ScoreContext): ScoreResult {
  if (!match) return { points: 0, tierName: 'Lost signal', label: 'No valid answer' };

  const tier = RARITY_TIERS.find((t) => t.tier === match.answer.tier)!;
  return { points: tier.points, tierName: tier.name, label: `${tier.name} · +${tier.points}` };
}

export function tierInfo(tier: number) {
  return RARITY_TIERS.find((t) => t.tier === tier)!;
}
