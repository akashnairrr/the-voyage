// Central tuning knobs for the pilot. Change numbers here, not in the logic.

export const GAME_CONFIG = {
  /** Prompts per voyage (Krillion-style daily run). */
  promptsPerVoyage: 8,
  /** How each voyage is built, played in this order: a gentle start, a hard finish. */
  voyageMix: { easy: 3, medium: 3, hard: 2 },
  /** Seconds the player has to answer each prompt. */
  secondsPerPrompt: 30,
  /**
   * Points needed to reach the final milestone (Voyager 1 at one light-day).
   * Milestones are placed as fractions of this number (see milestones.ts),
   * so changing the scoring metric only means re-tuning this one value.
   */
  journeyPoints: 800,
  /** Voyager 1 launch date — used for the "Mission Day" counter. */
  launchDate: '1977-09-05',
} as const;

/**
 * Placeholder rarity tiers. Each valid answer in the question bank carries a
 * tier (1 = everyone says it, 6 = almost nobody does). scoring.ts turns a
 * tier into points. Swap the metric later without touching the question bank.
 */
export const RARITY_TIERS = [
  { tier: 1, name: 'Launchpad', points: 10 },
  { tier: 2, name: 'Low Orbit', points: 25 },
  { tier: 3, name: 'Moonshot', points: 40 },
  { tier: 4, name: 'Ring Runner', points: 60 },
  { tier: 5, name: 'Deep Space', points: 80 },
  { tier: 6, name: 'Golden Record', points: 100 },
] as const;

export type Tier = (typeof RARITY_TIERS)[number]['tier'];

export const MAX_POINTS_PER_PROMPT = Math.max(...RARITY_TIERS.map((t) => t.points));
export const MAX_POINTS_PER_VOYAGE = MAX_POINTS_PER_PROMPT * GAME_CONFIG.promptsPerVoyage;
