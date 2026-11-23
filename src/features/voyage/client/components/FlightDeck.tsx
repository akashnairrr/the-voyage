'use client';

import { useEffect, useRef, useState } from 'react';

import { formatAu, formatLightTime, formatMissionDate } from '../../domain/format';
import { MILESTONES } from '../../domain/milestones';
import { milestonePoints, positionForPoints, REGION_LABEL, regionFor, type Jump } from '../../domain/progression';
import { lookFor } from '../tier-style';
import { JourneyBar } from './JourneyTrack';
import { SpaceView, type Burst } from './SpaceView';

export interface JumpPopup extends Jump {
  /** 0 = miss, 1..6 = tier. Sets the colour and how loud the pop-up is. */
  tier: number;
  /** Changes on every answer so the animation replays. */
  id: number;
}

interface FlightDeckProps {
  /** Animated (tweened) points: every readout here follows it frame by frame. */
  points: number;
  jump?: JumpPopup | null;
  /** Overall mood (0..6) tints the deck: dull when it's going badly, bright when it's going well. */
  mood?: number;
}

/** The 8-bit space viewport, its HUD, and the journey bar. */
export function FlightDeck({ points, jump, mood = 0 }: FlightDeckProps) {
  const pos = positionForPoints(points);
  const burst: Burst | null = jump ? { tier: jump.tier, id: jump.id } : null;

  // Announce milestones as the spacecraft actually reaches them.
  const [banner, setBanner] = useState<{ title: string; id: number } | null>(null);
  const prev = useRef(points);
  useEffect(() => {
    const crossed = MILESTONES.filter(
      (m) => m.at > 0 && prev.current < milestonePoints(m) && points >= milestonePoints(m),
    );
    prev.current = points;
    if (crossed.length) setBanner({ title: crossed[crossed.length - 1].title, id: Date.now() });
  }, [points]);

  const look = jump ? lookFor(jump.tier) : null;

  return (
    <div className={`flight-deck mood-${mood}`}>
      <div className="space-view">
        <SpaceView points={points} burst={burst} />

        <div className="hud hud--tl">
          <span className="hud__label">{REGION_LABEL[regionFor(pos.au)]}</span>
          <span className="hud__sub">{formatMissionDate(pos.date)}</span>
        </div>
        <div className="hud hud--tr">
          <span className="hud__big">{formatAu(pos.au)}</span>
          <span className="hud__sub">{formatLightTime(pos.lightMinutes)}</span>
        </div>

        {banner && (
          <div key={banner.id} className="hud-banner">
            ★ {banner.title} ★
          </div>
        )}

        {/* A celebration burst (results screen) has no points to announce. */}
        {jump && look && (jump.points > 0 || jump.tier === 0) && (
          <div key={jump.id} className={`jump-popup tier-${jump.tier}`} aria-live="polite">
            <span className="jump-popup__cheer">{look.cheer}</span>
            <span className="jump-popup__points">{jump.points > 0 ? `+${jump.points}` : '+0'}</span>
            {jump.points > 0 && <span className="jump-popup__au">+{formatAu(jump.au)}</span>}
          </div>
        )}
      </div>

      <div className="deck-footer">
        <JourneyBar points={points} />
        <span className="deck-footer__next">
          {pos.next ? `Next: ${pos.next.title} · ${pos.pointsToNext} pts` : 'Beyond the known journey'}
        </span>
      </div>
    </div>
  );
}
