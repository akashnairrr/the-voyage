'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { VoyageRecord } from '../../domain/types';
import { store } from '../storage';

/** Home-page call to action: start today's voyage, or view it if already flown. */
export function DailyStatus({ dayKey }: { dayKey: string }) {
  const [played, setPlayed] = useState<VoyageRecord | null>(null);

  useEffect(() => setPlayed(store.getDaily(dayKey)), [dayKey]);

  return (
    <Link className="btn btn--primary" href="/voyage/daily">
      {played ? `Today's log · ${played.totalPoints} pts` : "Start today's voyage"}
    </Link>
  );
}
