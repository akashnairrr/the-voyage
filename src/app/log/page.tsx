import type { Metadata } from 'next';

import { VoyageHistory } from '@/features/voyage/client/components/VoyageHistory';

export const metadata: Metadata = { title: 'Mission log · The Voyage' };

export default function LogPage() {
  return (
    <main className="page">
      <h1>Mission log</h1>
      <p className="tagline">Voyages flown on this device.</p>
      <VoyageHistory />
    </main>
  );
}
