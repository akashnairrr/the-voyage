import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Voyage } from '@/features/voyage/client/components/VoyageGame';
import { isMode, MODES } from '@/features/voyage/domain/types';

// Static export: one page per mode, built ahead of time.
export const dynamicParams = false;
export const generateStaticParams = () => MODES.map((mode) => ({ mode }));

type Props = { params: Promise<{ mode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mode } = await params;
  return { title: mode === 'practice' ? 'Practice voyage · The Voyage' : "Today's voyage · The Voyage" };
}

export default async function VoyagePage({ params }: Props) {
  const { mode } = await params;
  if (!isMode(mode)) notFound();

  return <Voyage mode={mode} />;
}
