import type { AnswerRequest, AnswerResult } from '../domain/types';
import { checkAnswer } from '../server';

// Checks in the browser: GitHub Pages has no server. Async so a real API can drop back in.
export async function submitAnswer(req: AnswerRequest): Promise<AnswerResult> {
  const result = checkAnswer(req);
  if (!result) throw new Error(`Unknown prompt ${req.promptId}`);
  return result;
}
