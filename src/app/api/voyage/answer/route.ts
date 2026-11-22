// POST /api/voyage/answer
// Body: { promptId, input, timedOut, secondsLeft } -> AnswerResult
// The browser never sees the answer list; it sends what the player typed and
// gets back the verdict, the points and (after answering) some rarer answers.

import { checkAnswer, parseAnswerRequest } from '@/features/voyage/server';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseAnswerRequest(body);
  if (typeof parsed === 'string') return Response.json({ error: parsed }, { status: 400 });

  const result = checkAnswer(parsed);
  if (!result) return Response.json({ error: 'Unknown prompt' }, { status: 404 });

  return Response.json(result);
}
