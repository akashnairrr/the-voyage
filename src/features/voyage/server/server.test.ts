import assert from 'node:assert/strict';
import { test } from 'node:test';

import { GAME_CONFIG } from '../domain/config';
import { matchAnswer, normalize } from './matching';
import { PROMPTS } from './prompts';
import { checkAnswer, createVoyage, parseAnswerRequest, pickPrompts } from './voyage-service';

const prompt = (id: string) => PROMPTS.find((p) => p.id === id)!;

test('normalize strips case, accents, punctuation and "the"', () => {
  assert.equal(normalize('  The Pale-Blue Dot! '), 'pale blue dot');
  assert.equal(normalize('Barnard’s Star'), 'barnards star');
  assert.equal(normalize('Bootés'), 'bootes');
});

test('matching: exact, alias, typo, and short names stay strict', () => {
  assert.equal(matchAnswer(prompt('space-agencies'), 'indian space research organisation')?.answer.name, 'ISRO');
  assert.equal(matchAnswer(prompt('saturn-moons'), 'Enceladus')?.fuzzy, false);
  assert.equal(matchAnswer(prompt('saturn-moons'), 'Enceladas')?.answer.name, 'Enceladus');
  assert.equal(matchAnswer(prompt('jupiter-moons'), 'Ia'), null);
  assert.equal(matchAnswer(prompt('jupiter-moons'), 'Titan'), null);
  assert.equal(matchAnswer(prompt('uranus-moons'), 'Titania')?.answer.name, 'Titania');
});

test('question bank: unique answers and enough prompts at every difficulty', () => {
  for (const level of ['easy', 'medium', 'hard'] as const) {
    assert.ok(PROMPTS.filter((p) => p.difficulty === level).length >= GAME_CONFIG.voyageMix[level], level);
  }
  for (const p of PROMPTS) {
    const forms = p.answers.flatMap((a) => [a.name, ...a.aliases].map(normalize));
    assert.equal(new Set(forms).size, forms.length, `duplicate answer or alias in ${p.id}`);
    assert.ok(p.answers.length >= 4, `${p.id} has too few answers`);
  }
});

test('only 1-2 answers per prompt score the max; the rest are spread evenly', () => {
  for (const p of PROMPTS) {
    const top = p.answers.filter((a) => a.tier === 6).length;
    assert.ok(top >= 1 && top <= 2, `${p.id} has ${top} top-tier answers`);
    const rest = p.answers.length - top;
    if (rest < 5) continue;
    const counts = [1, 2, 3, 4, 5].map((t) => p.answers.filter((a) => a.tier === t).length);
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `${p.id} tiers uneven: ${counts}`);
  }
});

test('tiers follow list order: the last answers are the rarest', () => {
  assert.equal(matchAnswer(prompt('planets'), 'Earth')?.answer.tier, 1);
  assert.equal(matchAnswer(prompt('planets'), 'Uranus')?.answer.tier, 6);
});

test('plurals match: "black holes" counts as Black Hole', () => {
  assert.equal(matchAnswer(prompt('space-objects'), 'black holes')?.answer.name, 'Black Hole');
  assert.equal(matchAnswer(prompt('space-objects'), 'comets')?.answer.name, 'Comet');
  assert.equal(matchAnswer(prompt('planets'), 'Mars')?.answer.name, 'Mars');
});

test('a voyage plays easy prompts first and hard ones last', () => {
  const picked = pickPrompts('practice', '2026-11-23');
  assert.equal(picked.length, GAME_CONFIG.promptsPerVoyage);
  const order = { easy: 0, medium: 1, hard: 2 };
  for (let i = 1; i < picked.length; i++) {
    assert.ok(order[picked[i].difficulty] >= order[picked[i - 1].difficulty]);
  }
});

test('daily voyage is the same all day; practice gets a fresh id', () => {
  const a = pickPrompts('daily', '2026-11-22').map((p) => p.id);
  assert.deepEqual(pickPrompts('daily', '2026-11-22').map((p) => p.id), a);
  assert.equal(a.length, GAME_CONFIG.promptsPerVoyage);
  assert.notEqual(createVoyage('practice').id, createVoyage('practice').id);
});

test('the setup sent to the browser contains no answers', () => {
  const setup = createVoyage('daily');
  for (const p of setup.prompts) assert.deepEqual(Object.keys(p).sort(), ['difficulty', 'id', 'text']);
});

test('checkAnswer scores, reveals rarer answers, handles timeouts and unknown prompts', () => {
  const hit = checkAnswer({ promptId: 'voyager-planets', input: 'jupiter', timedOut: false, secondsLeft: 12 })!;
  assert.equal(hit.matchedName, 'Jupiter');
  assert.ok(hit.points > 0);
  assert.ok(hit.rarer.includes('Uranus'));

  const miss = checkAnswer({ promptId: 'voyager-planets', input: 'Mars', timedOut: false, secondsLeft: 5 })!;
  assert.equal(miss.points, 0);
  assert.deepEqual(miss.rarer, [], 'a wrong guess must not reveal answers while the round is open');

  const late = checkAnswer({ promptId: 'voyager-planets', input: 'Uranus', timedOut: true, secondsLeft: 0 })!;
  assert.equal(late.points, 0);
  assert.equal(late.label, 'Out of time');
  assert.ok(late.rarer.length > 0, 'answers are revealed once time is up');

  assert.equal(checkAnswer({ promptId: 'nope', input: 'x', timedOut: false, secondsLeft: 1 }), null);
});

test('parseAnswerRequest rejects bad bodies', () => {
  assert.equal(typeof parseAnswerRequest(null), 'string');
  assert.equal(typeof parseAnswerRequest({ promptId: 'a', input: 1, timedOut: false, secondsLeft: 1 }), 'string');
  assert.equal(typeof parseAnswerRequest({ promptId: 'a', input: 'x', timedOut: false, secondsLeft: Infinity }), 'string');
  assert.deepEqual(parseAnswerRequest({ promptId: 'a', input: 'x', timedOut: false, secondsLeft: 3 }), {
    promptId: 'a',
    input: 'x',
    timedOut: false,
    secondsLeft: 3,
  });
});
