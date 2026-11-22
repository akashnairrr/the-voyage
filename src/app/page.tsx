import Link from 'next/link';

import { DailyStatus, MissionDay } from '@/features/voyage/client/components/DailyStatus';
import { FlightLog } from '@/features/voyage/client/components/JourneyTrack';
import { GAME_CONFIG, RARITY_TIERS } from '@/features/voyage/domain/config';

export default function HomePage() {
  return (
    <main className="page">
      <MissionDay />
      <h1>The Voyage</h1>
      <p className="tagline">Fly Voyager 1 from launch to one light-day. Rare answers take you farther.</p>

      <div className="actions">
        <DailyStatus />
        <Link className="btn" href="/voyage/practice">
          Practice voyage
        </Link>
      </div>

      <h2>How it works</h2>
      <ul className="how">
        <li>
          {GAME_CONFIG.promptsPerVoyage} transmissions, {GAME_CONFIG.secondsPerPrompt} seconds each. Every prompt has
          many right answers.
        </li>
        <li>The rarer your correct answer, the more points it earns. A wrong answer or no answer earns nothing.</li>
        <li>
          Points move the spacecraft along Voyager 1&apos;s real journey. {GAME_CONFIG.journeyPoints} points reaches
          one light-day from Earth.
        </li>
        <li>Everyone gets the same daily voyage. It resets at 00:00 UTC.</li>
      </ul>
      <div className="tiers">
        {RARITY_TIERS.map((t) => (
          <span key={t.tier} className={`tier tier-${t.tier}`}>
            {t.name} <b>{t.points}</b>
          </span>
        ))}
      </div>

      <h2>The journey</h2>
      <FlightLog points={0} />
    </main>
  );
}
