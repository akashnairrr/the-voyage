import type { AnswerRequest, AnswerResult } from '../domain/types';

export async function submitAnswer(req: AnswerRequest): Promise<AnswerResult> {
  const res = await fetch('/api/voyage/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Answer check failed (${res.status})`);
  return (await res.json()) as AnswerResult;
}
