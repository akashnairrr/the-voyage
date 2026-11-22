import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dayKeyFor, missionDayFor } from './calendar';
import { GAME_CONFIG, MAX_POINTS_PER_VOYAGE } from './config';
import { MILESTONES } from './milestones';
import { formatSpan } from './format';
import { journeyPercent, jumpBetween, milestonePoints, milestonesCrossed, positionForPoints, regionFor } from './progression';

const J = GAME_CONFIG.journeyPoints;

test('milestones are ordered by track position, date and distance', () => {
  for (let i = 1; i < MILESTONES.length; i++) {
    const [a, b] = [MILESTONES[i - 1], MILESTONES[i]];
    assert.ok(b.at > a.at, `${b.id} track position`);
    assert.ok(Date.parse(b.date) > Date.parse(a.date), `${b.id} date`);
    assert.ok(b.au > a.au, `${b.id} distance`);
  }
  assert.equal(MILESTONES[0].at, 0);
  assert.equal(MILESTONES[MILESTONES.length - 1].at, 1);
});

test('the final milestone needs exactly journeyPoints', () => {
  assert.equal(milestonePoints(MILESTONES[MILESTONES.length - 1]), J);
});

test('progression: endpoints and interpolation', () => {
  assert.equal(positionForPoints(0).current.id, 'launch');

  const end = positionForPoints(J);
  assert.equal(end.current.id, 'light-day');
  assert.ok(end.complete);
  assert.ok(Math.abs(end.lightMinutes - 1440) < 1, 'one light-day ≈ 1440 light-minutes');

  // Halfway between Jupiter (0.15) and Saturn (0.27).
  const mid = positionForPoints(0.21 * J);
  assert.equal(mid.current.id, 'jupiter');
  assert.equal(mid.next?.id, 'saturn');
  assert.ok(Math.abs(mid.au - (5.2 + 9.5) / 2) < 0.01);

  const beyond = positionForPoints(J + 100);
  assert.ok(beyond.au > end.au && beyond.date > end.date);
});

test('a perfect voyage reaches the end of the journey', () => {
  assert.ok(MAX_POINTS_PER_VOYAGE >= J);
  assert.ok(positionForPoints(MAX_POINTS_PER_VOYAGE).complete);
});

test('milestonesCrossed reports the milestones passed by one answer', () => {
  const jupiter = Math.round(0.15 * J);
  assert.deepEqual(milestonesCrossed(jupiter - 1, jupiter).map((m) => m.id), ['jupiter']);
  assert.deepEqual(milestonesCrossed(jupiter, jupiter + 1), []);
});

test('calendar: UTC day key and mission day', () => {
  assert.equal(dayKeyFor(new Date('2026-11-22T23:30:00Z')), '2026-11-22');
  assert.equal(missionDayFor('1977-09-05'), 0);
  assert.equal(missionDayFor('1977-09-06'), 1);
});

test('journeyPercent rounds down and caps at 100', () => {
  assert.equal(journeyPercent(0), 0);
  assert.equal(journeyPercent(J / 2), 50);
  assert.equal(journeyPercent(J - 1), 99, 'never shows 100% short of the end');
  assert.equal(journeyPercent(J), 100);
  assert.equal(journeyPercent(J * 2), 100);
});

test('jumpBetween measures distance and mission time covered', () => {
  const jupiter = Math.round(0.15 * J);
  const saturn = Math.round(0.27 * J);
  const jump = jumpBetween(jupiter, saturn);
  assert.equal(jump.points, saturn - jupiter);
  assert.ok(Math.abs(jump.au - (9.5 - 5.2)) < 0.01);
  assert.ok(jump.days > 600 && jump.days < 640, 'Mar 1979 to Nov 1980');
});

test('regionFor follows the termination shock and heliopause', () => {
  assert.equal(regionFor(50), 'heliosphere');
  assert.equal(regionFor(100), 'heliosheath');
  assert.equal(regionFor(150), 'interstellar');
});

test('formatSpan', () => {
  assert.equal(formatSpan(12), '12 days');
  assert.equal(formatSpan(120), '4 mo');
  assert.equal(formatSpan(365.25 * 6 + 61), '6 yr 2 mo');
});
