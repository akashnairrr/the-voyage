// Shapes shared by the server (API routes, pages) and the client (game UI).

export type Mode = 'daily' | 'practice';

export const MODES: readonly Mode[] = ['daily', 'practice'];

export function isMode(value: string): value is Mode {
  return (MODES as readonly string[]).includes(value);
}

/** What the browser sees of a prompt: never the answers. */
export interface PublicPrompt {
  id: string;
  text: string;
}

/** Everything the client needs to start a voyage. */
export interface VoyageSetup {
  /** Unique per voyage instance (daily: stable for the day; practice: random). */
  id: string;
  mode: Mode;
  dayKey: string;
  missionDay: number;
  prompts: PublicPrompt[];
}

export interface AnswerRequest {
  promptId: string;
  input: string;
  timedOut: boolean;
  secondsLeft: number;
}

/** Server's verdict on one answer. */
export interface AnswerResult {
  promptId: string;
  input: string;
  matchedName: string | null;
  tier: number | null;
  fuzzy: boolean;
  timedOut: boolean;
  points: number;
  label: string;
  /** Rarer valid answers, revealed only after the player has answered. */
  rarer: string[];
}

export interface Round extends AnswerResult {
  promptText: string;
  /** Wrong guesses made before the answer locked in (or time ran out). */
  misses: string[];
}

export interface VoyageRecord {
  dayKey: string;
  missionDay: number;
  mode: Mode;
  totalPoints: number;
  rounds: Round[];
  finishedAt: string;
}
