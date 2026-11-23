'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { MAX_POINTS_PER_VOYAGE } from '../../domain/config';
import { formatAu, formatMissionDate } from '../../domain/format';
import { journeyPercent, positionForPoints } from '../../domain/progression';
import type { Round, VoyageRecord } from '../../domain/types';
import { gradeFor, lookFor, moodFor } from '../tier-style';
import { useTweenedNumber } from '../use-tweened-number';
import { FlightDeck, type JumpPopup } from './FlightDeck';
import { FlightLog } from './JourneyTrack';
import { SignalStrip } from './SignalStrip';

const REPLAY_MS = 4200;

const TIER_EMOJI: Record<number, string> = { 1: '⚪', 2: '🟢', 3: '🔵', 4: '🟣', 5: '🟠', 6: '🟡' };

export function shareText(record: VoyageRecord): string {
  const pos = positionForPoints(record.totalPoints);
  const grid = record.rounds.map((r) => (r.tier ? TIER_EMOJI[r.tier] : '⚫')).join('');
  return [
    `The Voyage · Mission Day ${record.missionDay}${record.mode === 'practice' ? ' (practice)' : ''}`,
    grid,
    `${record.totalPoints} pts · ${pos.complete ? 'Beyond one light-day' : `Reached: ${pos.current.title}`}`,
  ].join('\n');
}

export function ResultsView({ record, actions }: { record: VoyageRecord; actions?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const pos = positionForPoints(record.totalPoints);
  const percent = journeyPercent(record.totalPoints);
  const grade = gradeFor(percent);
  const mood = moodFor(record.rounds.map((r) => r.tier));
  // Replay the whole flight from launch when the results open...
  const replay = useTweenedNumber(record.totalPoints, { from: 0, duration: () => REPLAY_MS });
  // ...then celebrate as loudly as the grade deserves.
  const [celebration, setCelebration] = useState<JumpPopup | null>(null);
  useEffect(() => {
    const id = setTimeout(
      () => setCelebration({ points: 0, au: 0, km: 0, days: 0, tier: grade.tier, id: Date.now() }),
      REPLAY_MS + 150,
    );
    return () => clearTimeout(id);
  }, [grade.tier]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText(record));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`results grade--${grade.id} tier-${grade.tier}`}>
      {grade.tier >= 5 && <Confetti tier={grade.tier} />}
      <p className="mission-day">
        Mission Day {record.missionDay.toLocaleString('en-US')}
        {record.mode === 'practice' && ' · practice'}
      </p>
      <p className="grade">{grade.title}</p>
      <h1 className="results__score">
        {record.totalPoints} <small>/ {MAX_POINTS_PER_VOYAGE} pts</small>
      </h1>
      <p className="journey-percent">
        You reached <strong>{percent}%</strong> of the journey made by Voyager 1
      </p>
      <p className="grade__line">{grade.line}</p>
      <SignalStrip rounds={record.rounds} total={record.rounds.length} current={-1} />
      <p className="tagline">
        {pos.complete
          ? `You flew past one light-day: ${formatAu(pos.au)} out, somewhere in ${formatMissionDate(pos.date)}.`
          : `You reached “${pos.current.title}”. Voyager 1 was here in ${formatMissionDate(pos.date)}.`}
      </p>

      <FlightDeck points={replay} jump={celebration} mood={mood} />

      <div className="actions">
        <button className="btn btn--primary" onClick={copy}>
          {copied ? 'Copied!' : 'Copy result'}
        </button>
        {actions}
      </div>

      <h2>Transmissions</h2>
      <ul className="round-list">
        {record.rounds.map((r) => (
          <RoundRow key={r.promptId} round={r} />
        ))}
      </ul>

      <h2>Flight log</h2>
      <FlightLog points={record.totalPoints} expandCurrent />
    </div>
  );
}

function RoundRow({ round }: { round: Round }) {
  let shown = round.input;
  if (round.matchedName) shown = round.matchedName;
  else if (round.timedOut || !round.input) shown = 'No answer';

  return (
    <li>
      <div className="round-list__prompt">{round.promptText}</div>
      <div className="round-list__answer">
        <span className={`tier tier-${round.tier ?? 0}`}>{shown}</span>
        <span className={`round-list__label tier-${round.tier ?? 0}`}>
          {round.points > 0 ? `${lookFor(round.tier).cheer} +${round.points}` : round.label}
        </span>
      </div>
      {(round.misses ?? []).length > 0 && (
        <div className="round-list__rarer">
          Wrong first: {round.misses.join(', ')}
        </div>
      )}
      {round.rarer.length > 0 && <div className="round-list__rarer">Rarer: {round.rarer.join(', ')}</div>}
    </li>
  );
}

/** Falling pixel confetti for the best grades. */
function Confetti({ tier }: { tier: number }) {
  const colours = lookFor(tier).sparks;
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: tier === 6 ? 36 : 18 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: colours[i % colours.length],
            animationDelay: `${(i % 9) * 0.35 + REPLAY_MS / 1000}s`,
            animationDuration: `${2.4 + (i % 5) * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}
