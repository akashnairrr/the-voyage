import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { VoyageGame } from '@/features/voyage/client/components/VoyageGame';
import { isMode } from '@/features/voyage/domain/types';
import { createVoyage } from '@/features/voyage/server';

// Daily prompts change every day and practice prompts on every visit.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ mode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mode } = await params;
  return { title: mode === 'practice' ? 'Practice voyage · The Voyage' : "Today's voyage · The Voyage" };
}

export default async function VoyagePage({ params }: Props) {
  const { mode } = await params;
  if (!isMode(mode)) notFound();

  const setup = createVoyage(mode);
  return <VoyageGame key={setup.id} setup={setup} />;
}
