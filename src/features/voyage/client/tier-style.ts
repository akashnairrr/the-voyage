// How good an answer (or a whole voyage) looks and feels. The canvas and the
// CSS both read from here, so the colours and excitement stay in step.

/** 8-bit palette (PICO-8 inspired). */
export const PALETTE = {
  black: '#000000',
  ink: '#0b0e24',
  navy: '#1d2b53',
  plum: '#2a1238',
  void: '#05040d',
  grey: '#5f574f',
  silver: '#c2c3c7',
  white: '#fff1e8',
  red: '#ff004d',
  orange: '#ffa300',
  yellow: '#ffec27',
  green: '#00e436',
  blue: '#29adff',
  purple: '#a95cff',
  pink: '#ff77a8',
  peach: '#ffccaa',
  brown: '#ab5236',
  tan: '#e4b77a',
} as const;

export interface TierLook {
  /** 0 = miss / out of time, 1..6 = rarity tier. */
  tier: number;
  colour: string;
  /** Shouted in the feedback card. Dull for low tiers, loud for high ones. */
  cheer: string;
  /** 0..1: drives particles, flame length, shake and flash. */
  intensity: number;
  /** Extra colours for particles and streaks. */
  sparks: string[];
}

export const TIER_LOOKS: TierLook[] = [
  { tier: 0, colour: PALETTE.grey, cheer: 'Signal lost', intensity: 0, sparks: [PALETTE.grey] },
  { tier: 1, colour: PALETTE.silver, cheer: 'Obvious…', intensity: 0.1, sparks: [PALETTE.grey, PALETTE.silver] },
  { tier: 2, colour: PALETTE.green, cheer: 'Not bad', intensity: 0.3, sparks: [PALETTE.green, PALETTE.white] },
  { tier: 3, colour: PALETTE.blue, cheer: 'Nice!', intensity: 0.5, sparks: [PALETTE.blue, PALETTE.white, PALETTE.green] },
  { tier: 4, colour: PALETTE.purple, cheer: 'Great!', intensity: 0.68, sparks: [PALETTE.purple, PALETTE.pink, PALETTE.blue] },
  {
    tier: 5,
    colour: PALETTE.orange,
    cheer: 'Brilliant!',
    intensity: 0.85,
    sparks: [PALETTE.orange, PALETTE.yellow, PALETTE.pink, PALETTE.white],
  },
  {
    tier: 6,
    colour: PALETTE.yellow,
    cheer: 'LEGENDARY!',
    intensity: 1,
    sparks: [PALETTE.yellow, PALETTE.orange, PALETTE.white, PALETTE.pink, PALETTE.blue, PALETTE.green],
  },
];

export const lookFor = (tier: number | null | undefined): TierLook => TIER_LOOKS[tier ?? 0] ?? TIER_LOOKS[0];

/** Overall mood of a voyage so far, from the average tier of answered rounds (misses count as 0). */
export function moodFor(tiers: (number | null)[]): number {
  if (tiers.length === 0) return 0;
  const avg = tiers.reduce<number>((sum, t) => sum + (t ?? 0), 0) / tiers.length;
  return Math.round(avg);
}

export interface Grade {
  id: 'stalled' | 'cruising' | 'explorer' | 'interstellar' | 'veteran' | 'legend';
  title: string;
  line: string;
  /** Tier whose look the grade borrows (colours, celebration size). */
  tier: number;
}

/** Final grade from how far along the journey the voyage got. */
export function gradeFor(percent: number): Grade {
  if (percent >= 95)
    return { id: 'legend', title: 'Legendary voyage', line: 'You went the whole way. Voyager would be proud.', tier: 6 };
  if (percent >= 75)
    return { id: 'veteran', title: 'Voyager veteran', line: 'Deep in interstellar space. Outstanding run.', tier: 5 };
  if (percent >= 55)
    return { id: 'interstellar', title: 'Interstellar traveller', line: 'You broke out of the Sun’s bubble.', tier: 4 };
  if (percent >= 35)
    return { id: 'explorer', title: 'Deep space explorer', line: 'Past the planets and still going.', tier: 3 };
  if (percent >= 15)
    return { id: 'cruising', title: 'Steady cruise', line: 'A solid trip. Rarer answers fly you farther.', tier: 2 };
  return { id: 'stalled', title: 'Stuck near home', line: 'The obvious answers barely left the launchpad.', tier: 1 };
}
