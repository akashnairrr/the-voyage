'use client';

import { formatAu, formatKm, formatLightTime, formatMissionDate } from '../../domain/format';
import { positionForPoints, REGION_LABEL, regionFor, type Jump } from '../../domain/progression';
import { JourneyBar } from './JourneyTrack';
import { SpaceView } from './SpaceView';

export interface JumpPopup extends Jump {
  /** Changes on every jump so the pop-up animation replays. */
  id: number;
}

interface FlightDeckProps {
  /** Animated (tweened) points: every readout here follows it frame by frame. */
  points: number;
  jump?: JumpPopup | null;
}

/** The space viewport with live telemetry on top and the journey bar below. */
export function FlightDeck({ points, jump }: FlightDeckProps) {
  const pos = positionForPoints(points);

  return (
    <div className="flight-deck">
      <div className="space-view">
        <SpaceView points={points} />

        <div className="hud hud--tl">
          <span className="hud__label">{REGION_LABEL[regionFor(pos.au)]}</span>
          <span className="hud__sub">{formatMissionDate(pos.date)}</span>
        </div>
        <div className="hud hud--tr">
          <span className="hud__big">{formatAu(pos.au)}</span>
          <span className="hud__sub">{formatKm(pos.km)} from the Sun</span>
        </div>
        <div className="hud hud--bl">
          <span className="hud__sub">Signal delay</span>
          <span className="hud__label">{formatLightTime(pos.lightMinutes)}</span>
        </div>
        <div className="hud hud--br">
          <span className="hud__sub">Next</span>
          <span className="hud__label">
            {pos.next ? `${pos.next.title} · ${pos.pointsToNext} pts` : 'Beyond the known journey'}
          </span>
        </div>

        {jump && jump.points > 0 && (
          <div key={jump.id} className="jump-popup" aria-live="polite">
            <span className="jump-popup__points">+{jump.points}</span>
            <span className="jump-popup__au">+{formatAu(jump.au)}</span>
          </div>
        )}
      </div>
      <JourneyBar points={points} />
    </div>
  );
}
