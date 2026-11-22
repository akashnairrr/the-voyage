import { MILESTONES } from '../../domain/milestones';
import { formatAu, formatKm, formatLightTime, formatLongDate, formatMissionDate } from '../../domain/format';
import { milestonePoints, positionForPoints } from '../../domain/progression';

/** Horizontal progress bar with milestone ticks and the spacecraft marker. */
export function JourneyBar({ points }: { points: number }) {
  const pos = positionForPoints(points);
  const pct = Math.min(pos.progress, 1) * 100;
  return (
    <div className="journey-bar" aria-label={`Journey ${pct.toFixed(0)}% complete`}>
      <div className="journey-bar__fill" style={{ width: `${pct}%` }} />
      {MILESTONES.map((m) => (
        <span
          key={m.id}
          className={`journey-bar__tick ${pos.progress >= m.at ? 'is-reached' : ''}`}
          style={{ left: `${m.at * 100}%` }}
          title={m.title}
        />
      ))}
      <span className="journey-bar__ship" style={{ left: `${pct}%` }}>
        ▲
      </span>
    </div>
  );
}

/** Live mission readout for a points total. */
export function Telemetry({ points }: { points: number }) {
  const pos = positionForPoints(points);
  return (
    <dl className="telemetry">
      <div>
        <dt>Mission date</dt>
        <dd>{formatMissionDate(pos.date)}</dd>
      </div>
      <div>
        <dt>Distance</dt>
        <dd>
          {formatAu(pos.au)} <small>· {formatKm(pos.km)}</small>
        </dd>
      </div>
      <div>
        <dt>Signal delay</dt>
        <dd>{formatLightTime(pos.lightMinutes)}</dd>
      </div>
      <div>
        <dt>Next</dt>
        <dd>{pos.next ? `${pos.next.title} in ${pos.pointsToNext} pts` : 'Beyond the known journey'}</dd>
      </div>
    </dl>
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
