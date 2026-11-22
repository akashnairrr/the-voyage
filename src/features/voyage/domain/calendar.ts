import { GAME_CONFIG } from './config';

/**
 * The daily voyage rolls over at 00:00 UTC, so every player worldwide gets the
 * same set on the same "day" (05:30 in India).
 */
export function dayKeyFor(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Days since Voyager 1 launched — the daily puzzle number. */
export function missionDayFor(dayKey: string): number {
  const ms = Date.parse(`${dayKey}T00:00:00Z`) - Date.parse(`${GAME_CONFIG.launchDate}T00:00:00Z`);
  return Math.floor(ms / 86_400_000);
}
