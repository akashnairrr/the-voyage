import type { CSSProperties } from 'react';

import { MILESTONES } from '../../domain/milestones';
import { formatLongDate } from '../../domain/format';
import { milestonePoints, positionForPoints } from '../../domain/progression';

const SEGMENTS = 40;

/** Chunky segmented progress bar, milestone notches above, the craft riding the front. */
export function JourneyBar({ points }: { points: number }) {
  const pos = positionForPoints(points);
  const pct = Math.min(pos.progress, 1) * 100;
  const lit = Math.floor((pct / 100) * SEGMENTS);
  return (
    <div className="journey-bar" role="progressbar" aria-valuenow={Math.floor(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="journey-bar__track">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={`journey-bar__seg ${i < lit ? 'is-lit' : ''}`} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
      {MILESTONES.map((m) => (
        <span
          key={m.id}
          className={`journey-bar__notch ${pos.progress >= m.at ? 'is-reached' : ''}`}
          style={{ left: `${m.at * 100}%` }}
          title={m.title}
        />
      ))}
      <span className="journey-bar__ship" style={{ left: `${pct}%` }}>
        ▶
      </span>
    </div>
  );
}

/** Vertical flight log of every milestone, lit up as the player passes it. */
export function FlightLog({ points, expandCurrent = false }: { points: number; expandCurrent?: boolean }) {
  const pos = positionForPoints(points);
  return (
    <ol className="flight-log">
      {MILESTONES.map((m) => {
        const reached = pos.progress >= m.at;
        const isCurrent = m.id === pos.current.id;
        return (
          <li key={m.id} className={`${reached ? 'is-reached' : ''} ${isCurrent ? 'is-current' : ''}`}>
            <div className="flight-log__row">
              <span className="flight-log__dot" />
              <span className="flight-log__title">{m.title}</span>
              <span className="flight-log__meta">
                {formatLongDate(m.date)} · {milestonePoints(m)} pts
              </span>
            </div>
            {isCurrent && expandCurrent && <p className="flight-log__blurb">{m.blurb}</p>}
          </li>
        );
      })}
    </ol>
  );
}
