'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer, useState } from 'react';

import { jumpBetween, milestonesCrossed } from '../../domain/progression';
import type { AnswerResult, Round, VoyageRecord, VoyageSetup } from '../../domain/types';
import { submitAnswer } from '../api';
import { gameReducer, initialGameState } from '../game-state';
import { store } from '../storage';
import { jumpDuration, useTweenedNumber } from '../use-tweened-number';
import { FlightDeck, type JumpPopup } from './FlightDeck';
import { FlightLog } from './JourneyTrack';
import { FeedbackCard, PromptCard } from './PromptCard';
import { ResultsView } from './ResultsView';

type Phase = { name: 'loading' } | { name: 'playing' } | { name: 'results'; record: VoyageRecord };

export function VoyageGame({ setup }: { setup: VoyageSetup }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ name: 'loading' });
  const [game, dispatch] = useReducer(gameReducer, setup.prompts.length, initialGameState);
  const [popup, setPopup] = useState<JumpPopup | null>(null);

  // The spacecraft's on-screen position chases the real score.
  const shownPoints = useTweenedNumber(game.totalPoints);

  // Runs in the browser only: localStorage isn't available during server rendering.
  useEffect(() => {
    store.getPlayerId();
    const played = setup.mode === 'daily' ? store.getDaily(setup.dayKey) : null;
    setPhase(played ? { name: 'results', record: played } : { name: 'playing' });
  }, [setup.mode, setup.dayKey]);

  // Save and show results once the last answer is in.
  useEffect(() => {
    if (game.status !== 'finished' || phase.name !== 'playing') return;
    const record: VoyageRecord = {
      dayKey: setup.dayKey,
      missionDay: setup.missionDay,
      mode: setup.mode,
      totalPoints: game.totalPoints,
      rounds: game.rounds,
      finishedAt: new Date().toISOString(),
    };
    store.saveVoyage(record);
    setPhase({ name: 'results', record });
  }, [game, phase.name, setup]);

  const prompt = setup.prompts[game.index];

  const resolve = (result: AnswerResult, misses: string[]) => {
    const round: Round = { ...result, promptText: prompt.text, misses };
    if (round.points > 0) {
      const jump = jumpBetween(game.totalPoints, game.totalPoints + round.points);
      setPopup({ ...jump, id: Date.now() });
    }
    dispatch({ type: 'resolved', round });
  };

  const check = (input: string, secondsLeft: number) =>
    submitAnswer({ promptId: prompt.id, input, timedOut: false, secondsLeft });

  const timeout = async (misses: string[]) => {
    try {
      resolve(await submitAnswer({ promptId: prompt.id, input: '', timedOut: true, secondsLeft: 0 }), misses);
    } catch {
      resolve(
        {
          promptId: prompt.id,
          input: '',
          matchedName: null,
          tier: null,
          fuzzy: false,
          timedOut: true,
          points: 0,
          label: 'Network error',
          rarer: [],
        },
        misses,
      );
    }
  };

  if (phase.name === 'loading') return <main className="page" />;

  if (phase.name === 'results') {
    return (
      <main className="page">
        <ResultsView
          record={phase.record}
          actions={
            setup.mode === 'practice' ? (
              <button className="btn" onClick={() => router.refresh()}>
                Fly again
              </button>
            ) : (
              <Link className="btn" href="/voyage/practice">
                Practice voyage
              </Link>
            )
          }
        />
      </main>
    );
  }

  const lastRound = game.rounds[game.index];
  const pointsBefore = game.totalPoints - (lastRound?.points ?? 0);

  return (
    <main className="page page--wide">
      <div className="voyage__top">
        <span className="mission-day">
          {setup.mode === 'daily' ? `Mission Day ${setup.missionDay.toLocaleString('en-US')}` : 'Practice voyage'}
        </span>
        <span className="points">{Math.round(shownPoints)} pts</span>
      </div>

      <FlightDeck points={shownPoints} jump={popup} />

      <div className="voyage__body">
        {game.status === 'playing' && (
          <PromptCard
            key={game.index}
            prompt={prompt}
            number={game.index + 1}
            total={setup.prompts.length}
            check={check}
            onLock={resolve}
            onTimeout={timeout}
          />
        )}
        {game.status === 'reviewing' && lastRound && (
          <FeedbackCard
            round={lastRound}
            jump={jumpBetween(pointsBefore, game.totalPoints)}
            crossed={milestonesCrossed(pointsBefore, game.totalPoints)}
            arrivalDelayMs={jumpDuration(lastRound.points) * 0.8}
            isLast={game.index === setup.prompts.length - 1}
            onNext={() => dispatch({ type: 'next' })}
          />
        )}
        <aside>
          <FlightLog points={shownPoints} />
        </aside>
      </div>
    </main>
  );
}
