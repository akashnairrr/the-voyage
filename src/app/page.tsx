import Link from 'next/link';

import { DailyStatus, MissionDay } from '@/features/voyage/client/components/DailyStatus';
import { FlightLog } from '@/features/voyage/client/components/JourneyTrack';
import { SpaceView } from '@/features/voyage/client/components/SpaceView';
import { GAME_CONFIG, RARITY_TIERS } from '@/features/voyage/domain/config';

export default function HomePage() {
  return (
    <main className="page">
      <MissionDay />
      <h1>The Voyage</h1>
      <p className="tagline">Fly Voyager 1 from launch to one light-day. Rare answers take you farther.</p>

      <div className="space-view space-view--hero">
        <SpaceView points={0} />
      </div>

      <div className="actions">
        <DailyStatus />
        <Link className="btn" href="/voyage/practice">
          Practice voyage
        </Link>
      </div>

      <h2>How it works</h2>
      <ul className="how">
        <li>
          {GAME_CONFIG.promptsPerVoyage} transmissions, {GAME_CONFIG.secondsPerPrompt} seconds each, from easy to hard.
          Every prompt has many right answers.
        </li>
        <li>Guess as often as you like. Your first right answer locks in, so aim for a rare one.</li>
        <li>The rarer the answer, the more points and the bigger the jump. Run out of time and you drift.</li>
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
