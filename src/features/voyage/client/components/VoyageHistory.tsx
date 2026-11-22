'use client';

import { useEffect, useState } from 'react';

import { formatLongDate } from '../../domain/format';
import { positionForPoints } from '../../domain/progression';
import type { VoyageRecord } from '../../domain/types';
import { store } from '../storage';

export function VoyageHistory() {
  const [history, setHistory] = useState<VoyageRecord[] | null>(null);

  useEffect(() => setHistory(store.getHistory()), []);

  if (history === null) return null;
  if (history.length === 0) return <p className="tagline">No voyages yet. Your finished voyages will show up here.</p>;

  return (
    <ul className="round-list">
      {history.map((r) => (
        <li key={r.finishedAt}>
          <div className="round-list__prompt">
            {r.mode === 'daily' ? `Mission Day ${r.missionDay.toLocaleString('en-US')}` : 'Practice'} ·{' '}
            {formatLongDate(r.dayKey)}
          </div>
          <div className="round-list__answer">
            <strong>{r.totalPoints} pts</strong>
            <span>{positionForPoints(r.totalPoints).current.title}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
