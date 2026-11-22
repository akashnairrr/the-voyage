'use client';

import { useState, type ReactNode } from 'react';

import { MAX_POINTS_PER_VOYAGE } from '../../domain/config';
import { formatAu, formatMissionDate } from '../../domain/format';
import { journeyPercent, positionForPoints } from '../../domain/progression';
import type { Round, VoyageRecord } from '../../domain/types';
import { useTweenedNumber } from '../use-tweened-number';
import { FlightDeck } from './FlightDeck';
import { FlightLog } from './JourneyTrack';

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
  // Replay the whole flight from launch when the results open.
  const replay = useTweenedNumber(record.totalPoints, { from: 0, duration: () => 4200 });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText(record));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="results">
      <p className="mission-day">
        Mission Day {record.missionDay.toLocaleString('en-US')}
        {record.mode === 'practice' && ' · practice'}
      </p>
      <h1>
        {record.totalPoints} <small>/ {MAX_POINTS_PER_VOYAGE} pts</small>
      </h1>
      <p className="journey-percent">
        You reached <strong>{journeyPercent(record.totalPoints)}%</strong> of the journey made by Voyager 1
      </p>
      <p className="tagline">
        {pos.complete
          ? `You flew past one light-day: ${formatAu(pos.au)} out, somewhere in ${formatMissionDate(pos.date)}.`
          : `You reached “${pos.current.title}”. Voyager 1 was here in ${formatMissionDate(pos.date)}.`}
      </p>

      <FlightDeck points={replay} />

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
        <span className={round.tier ? `tier tier-${round.tier}` : 'tier tier-miss'}>{shown}</span>
        <span>{round.label}</span>
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
