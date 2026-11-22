'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { dayKeyFor, missionDayFor } from '../../domain/calendar';
import type { VoyageRecord } from '../../domain/types';
import { store } from '../storage';

/** Today's Mission Day. Computed in the browser: the static page doesn't know today's date. */
export function MissionDay() {
  const [day, setDay] = useState<number | null>(null);

  useEffect(() => setDay(missionDayFor(dayKeyFor())), []);

  return <p className="mission-day">{day ? `Mission Day ${day.toLocaleString('en-US')}` : ' '}</p>;
}

/** Home-page call to action: start today's voyage, or view it if already flown. */
export function DailyStatus() {
  const [played, setPlayed] = useState<VoyageRecord | null>(null);

  useEffect(() => setPlayed(store.getDaily(dayKeyFor())), []);

  return (
    <Link className="btn btn--primary" href="/voyage/daily">
      {played ? `Today's log · ${played.totalPoints} pts` : "Start today's voyage"}
    </Link>
  );
}
