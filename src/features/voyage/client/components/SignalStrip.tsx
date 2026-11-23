import type { Round } from '../../domain/types';
import { lookFor } from '../tier-style';

/**
 * One block per transmission, lit in the colour of the answer's rarity:
 * grey for obvious, green, blue, purple, orange, gold for legendary,
 * dark for a miss. The current block blinks. A glance shows how the voyage
 * is going.
 */
export function SignalStrip({ rounds, total, current }: { rounds: Round[]; total: number; current: number }) {
  return (
    <ol className="signal-strip" aria-label="Your answers so far">
      {Array.from({ length: total }, (_, i) => {
        const round = rounds[i];
        const state = round ? `tier-${round.tier ?? 0}` : i === current ? 'is-current' : 'is-empty';
        const label = round ? `${i + 1}: ${round.matchedName ?? 'missed'} (${lookFor(round.tier).cheer})` : `${i + 1}: not yet`;
        return <li key={i} className={`signal-strip__cell ${state}`} title={label} aria-label={label} />;
      })}
    </ol>
  );
}
