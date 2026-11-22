// Game service. The question bank lives only here; the UI calls these functions
// and only uses PublicPrompts and AnswerResults. It runs in the browser for the
// static GitHub Pages build, so answers are readable in the bundle.

import { dayKeyFor, missionDayFor } from '../domain/calendar';
import { GAME_CONFIG } from '../domain/config';
import { hashString, seededRandom, shuffle } from '../domain/random';
import type { AnswerRequest, AnswerResult, Mode, PublicPrompt, VoyageSetup } from '../domain/types';
import { matchAnswer } from './matching';
import { PROMPTS, type Prompt } from './prompts';
import { scoreAnswer } from './scoring';

const MAX_INPUT_LENGTH = 100;

export function pickPrompts(mode: Mode, dayKey: string, count: number = GAME_CONFIG.promptsPerVoyage): Prompt[] {
  const rand = mode === 'daily' ? seededRandom(hashString(`the-voyage:${dayKey}`)) : Math.random;
  return shuffle(PROMPTS, rand).slice(0, Math.min(count, PROMPTS.length));
}

const toPublic = (p: Prompt): PublicPrompt => ({ id: p.id, text: p.text });

export function createVoyage(mode: Mode, now: Date = new Date()): VoyageSetup {
  const dayKey = dayKeyFor(now);
  return {
    id: mode === 'daily' ? `daily-${dayKey}` : `practice-${crypto.randomUUID()}`,
    mode,
    dayKey,
    missionDay: missionDayFor(dayKey),
    prompts: pickPrompts(mode, dayKey).map(toPublic),
  };
}

export function rarerAnswers(prompt: Prompt, tier: number | null, matchedName: string | null, limit = 3): string[] {
  return prompt.answers
    .filter((a) => a.tier > (tier ?? 0) && a.name !== matchedName)
    .sort((x, y) => y.tier - x.tier)
    .slice(0, limit)
    .map((a) => a.name);
}

/** Checks and scores one answer. Returns null when the prompt id is unknown. */
export function checkAnswer(req: AnswerRequest): AnswerResult | null {
  const prompt = PROMPTS.find((p) => p.id === req.promptId);
  if (!prompt) return null;

  const input = req.timedOut ? '' : req.input.slice(0, MAX_INPUT_LENGTH);
  const match = input.trim() ? matchAnswer(prompt, input) : null;
  const score = scoreAnswer(match, {
    secondsLeft: Math.max(0, Math.min(req.secondsLeft, GAME_CONFIG.secondsPerPrompt)),
    secondsTotal: GAME_CONFIG.secondsPerPrompt,
  });

  const matchedName = match?.answer.name ?? null;
  const tier = match?.answer.tier ?? null;
  return {
    promptId: prompt.id,
    input,
    matchedName,
    tier,
    fuzzy: match?.fuzzy ?? false,
    timedOut: req.timedOut,
    points: score.points,
    label: req.timedOut ? 'Out of time' : score.label,
    // A wrong guess leaves the round open, so reveal nothing until it's over.
    rarer: matchedName || req.timedOut ? rarerAnswers(prompt, tier, matchedName) : [],
  };
}

/** Validates an untrusted JSON body. Returns an error message or the request. */
export function parseAnswerRequest(body: unknown): AnswerRequest | string {
  if (typeof body !== 'object' || body === null) return 'Body must be a JSON object';
  const b = body as Record<string, unknown>;
  if (typeof b.promptId !== 'string' || !b.promptId) return 'promptId is required';
  if (typeof b.input !== 'string') return 'input must be a string';
  if (typeof b.timedOut !== 'boolean') return 'timedOut must be a boolean';
  if (typeof b.secondsLeft !== 'number' || !Number.isFinite(b.secondsLeft)) return 'secondsLeft must be a number';
  return { promptId: b.promptId, input: b.input, timedOut: b.timedOut, secondsLeft: b.secondsLeft };
}
