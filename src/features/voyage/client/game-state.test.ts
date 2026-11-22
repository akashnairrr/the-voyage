import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Round } from '../domain/types';
import { gameReducer, initialGameState } from './game-state';

const round = (points: number, misses: string[] = []): Round => ({
  promptId: 'p',
  promptText: 'P',
  input: 'x',
  matchedName: points ? 'X' : null,
  tier: points ? 1 : null,
  fuzzy: false,
  timedOut: !points,
  points,
  label: '',
  rarer: [],
  misses,
});

test('a full voyage runs playing -> reviewing -> ... -> finished', () => {
  let s = initialGameState(8);
  for (let i = 0; i < 8; i++) {
    s = gameReducer(s, { type: 'resolved', round: round(50, ['wrong']) });
    assert.equal(s.status, 'reviewing');
    s = gameReducer(s, { type: 'next' });
  }
  assert.equal(s.status, 'finished');
  assert.equal(s.totalPoints, 400);
  assert.equal(s.rounds[0].misses.length, 1);
});

test('a round can only lock once: a late timeout after a correct answer is ignored', () => {
  const locked = gameReducer(initialGameState(8), { type: 'resolved', round: round(80) });
  assert.equal(gameReducer(locked, { type: 'resolved', round: round(0) }), locked);
});

test('next is ignored while still playing', () => {
  const s = initialGameState(8);
  assert.equal(gameReducer(s, { type: 'next' }), s);
});
