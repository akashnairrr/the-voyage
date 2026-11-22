// Maps a points total to a position on Voyager 1's journey.

import { GAME_CONFIG } from './config';
import { AU_PER_YEAR_CRUISE, MILESTONES, type Milestone } from './milestones';

const KM_PER_AU = 149_597_870.7;
const LIGHT_MINUTES_PER_AU = 8.316746;
const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;

export interface JourneyPosition {
  points: number;
  /** 0–1 along the track; >1 means past the last milestone. */
  progress: number;
  /** Last milestone reached (always defined: launch is at 0). */
  current: Milestone;
  /** Next milestone, or null once the journey is complete. */
  next: Milestone | null;
  /** Points still needed for `next`. */
  pointsToNext: number;
  /** Interpolated mission state. */
  au: number;
  km: number;
  lightMinutes: number;
  date: Date;
  complete: boolean;
}

/** Points required to reach a milestone. */
export function milestonePoints(m: Milestone, journeyPoints: number = GAME_CONFIG.journeyPoints): number {
  return Math.round(m.at * journeyPoints);
}

export function positionForPoints(
  points: number,
  journeyPoints: number = GAME_CONFIG.journeyPoints,
  milestones: Milestone[] = MILESTONES,
): JourneyPosition {
  const safePoints = Math.max(0, points);
  const progress = safePoints / journeyPoints;

  let i = 0;
  while (i + 1 < milestones.length && milestones[i + 1].at <= progress) i++;
  const current = milestones[i];
  const next = milestones[i + 1] ?? null;

  let au: number;
  let dateMs: number;
  const t0 = Date.parse(current.date);

  if (next) {
    // Linear interpolation inside the segment.
    const f = (progress - current.at) / (next.at - current.at);
    au = current.au + f * (next.au - current.au);
    dateMs = t0 + f * (Date.parse(next.date) - t0);
  } else {
    // Past the end: keep cruising at Voyager 1's real speed. Each extra
    // "segment's worth" of points is treated as one more year of flight.
    const lastSegment = current.at - milestones[i - 1].at;
    const extraYears = (progress - current.at) / lastSegment;
    au = current.au + extraYears * AU_PER_YEAR_CRUISE;
    dateMs = t0 + extraYears * MS_PER_YEAR;
  }

  return {
    points: safePoints,
    progress,
    current,
    next,
    pointsToNext: next ? Math.max(0, Math.ceil(milestonePoints(next, journeyPoints) - safePoints)) : 0,
    au,
    km: au * KM_PER_AU,
    lightMinutes: au * LIGHT_MINUTES_PER_AU,
    date: new Date(dateMs),
    complete: next === null,
  };
}

/**
 * Share of Voyager 1's journey (launch to one light-day) covered by a score,
 * as a whole percentage. Rounded down so 100% only shows when the journey is
 * actually complete; capped at 100.
 */
export function journeyPercent(points: number, journeyPoints: number = GAME_CONFIG.journeyPoints): number {
  return Math.min(100, Math.floor((Math.max(0, points) / journeyPoints) * 100));
}

/** Milestones newly passed when going from `before` to `after` points. */
export function milestonesCrossed(
  before: number,
  after: number,
  journeyPoints: number = GAME_CONFIG.journeyPoints,
): Milestone[] {
  return MILESTONES.filter((m) => {
    const p = milestonePoints(m, journeyPoints);
    return p > before && p <= after;
  });
}

export interface Jump {
  points: number;
  au: number;
  km: number;
  /** Mission time covered by the jump, in days. */
  days: number;
}

/** How far one answer moved the spacecraft. */
export function jumpBetween(before: number, after: number): Jump {
  const a = positionForPoints(before);
  const b = positionForPoints(after);
  return {
    points: after - before,
    au: b.au - a.au,
    km: b.km - a.km,
    days: (b.date.getTime() - a.date.getTime()) / 86_400_000,
  };
}

export type Region = 'heliosphere' | 'heliosheath' | 'interstellar';

/** Termination shock and heliopause distances, from the milestones. */
const TERMINATION_SHOCK_AU = MILESTONES.find((m) => m.id === 'termination-shock')!.au;
const HELIOPAUSE_AU = MILESTONES.find((m) => m.id === 'heliopause')!.au;

export function regionFor(au: number): Region {
  if (au >= HELIOPAUSE_AU) return 'interstellar';
  if (au >= TERMINATION_SHOCK_AU) return 'heliosheath';
  return 'heliosphere';
}

export const REGION_LABEL: Record<Region, string> = {
  heliosphere: "Inside the Sun's bubble",
  heliosheath: 'Heliosheath',
  interstellar: 'Interstellar space',
};
