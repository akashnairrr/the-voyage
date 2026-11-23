'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { GAME_CONFIG } from '../../domain/config';
import { formatAu, formatKm, formatSpan } from '../../domain/format';
import type { Milestone } from '../../domain/milestones';
import type { Jump } from '../../domain/progression';
import type { AnswerResult, PublicPrompt, Round } from '../../domain/types';
import { lookFor } from '../tier-style';
import { useCountdown } from '../use-countdown';

interface PromptCardProps {
  prompt: PublicPrompt;
  number: number;
  total: number;
  /** Asks the server about one guess. */
  check: (input: string, secondsLeft: number) => Promise<AnswerResult>;
  /** First correct answer: the round locks in. */
  onLock: (result: AnswerResult, misses: string[]) => void;
  /** Time ran out without a correct answer. */
  onTimeout: (misses: string[]) => void;
}

const sameGuess = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * One prompt with a countdown. The player can guess as often as they like;
 * wrong guesses shake the input and stay listed, the first correct guess
 * locks the round. Give it a new `key` for each prompt.
 */
export function PromptCard({ prompt, number, total, check, onLock, onTimeout }: PromptCardProps) {
  const [guess, setGuess] = useState('');
  const [misses, setMisses] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [shake, setShake] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const missesRef = useRef<string[]>([]);
  const locked = useRef(false);
  const inFlight = useRef<Promise<void> | null>(null);
  const msLeftRef = useRef(GAME_CONFIG.secondsPerPrompt * 1000);

  const msLeft = useCountdown(GAME_CONFIG.secondsPerPrompt, true, async () => {
    // A guess sent before the buzzer still counts: wait for its verdict.
    if (inFlight.current) await inFlight.current;
    if (locked.current) return;
    locked.current = true;
    onTimeout(missesRef.current);
  });
  msLeftRef.current = msLeft;

  // Keep focus in the input (also after a wrong guess remounts it to replay the shake),
  // without scrolling the page away from the space view.
  useEffect(() => inputRef.current?.focus({ preventScroll: true }), [shake]);

  const reject = (message: string) => {
    setNotice(message);
    setShake((n) => n + 1);
    setGuess('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = guess.trim();
    if (!text || locked.current || inFlight.current || msLeftRef.current <= 0) return;
    if (missesRef.current.some((m) => sameGuess(m, text))) return reject(`Already tried “${text}”`);

    setChecking(true);
    inFlight.current = (async () => {
      try {
        const result = await check(text, msLeftRef.current / 1000);
        if (result.matchedName) {
          if (!locked.current) {
            locked.current = true;
            onLock(result, missesRef.current);
          }
          return;
        }
        missesRef.current = [...missesRef.current, text];
        setMisses(missesRef.current);
        reject(`“${text}” isn't on the list. Keep trying.`);
      } catch {
        setNotice('Transmission failed. Try again.');
      } finally {
        inFlight.current = null;
        setChecking(false);
      }
    })();
  };

  const seconds = Math.ceil(msLeft / 1000);
  const fraction = msLeft / (GAME_CONFIG.secondsPerPrompt * 1000);
  const urgent = seconds <= 10;

  return (
    <section className="card card--prompt">
      <header className="card__header">
        <span>
          Transmission {number}/{total} <span className={`difficulty difficulty--${prompt.difficulty}`}>{prompt.difficulty}</span>
        </span>
        <span className={`countdown ${urgent ? 'is-urgent' : ''}`}>{seconds}s</span>
      </header>
      <div className={`timer ${urgent ? 'is-urgent' : ''}`}>
        <div className="timer__fill" style={{ width: `${fraction * 100}%` }} />
      </div>
      <h2 className="card__prompt">{prompt.text}</h2>
      <p className="card__hint">Guess as many times as you like. Your first right answer locks in, so aim rare.</p>

      <form onSubmit={submit} className="answer-form">
        <input
          key={shake}
          ref={inputRef}
          className={shake ? 'is-wrong' : ''}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Type your answer"
          autoComplete="off"
          spellCheck={false}
          maxLength={100}
          aria-label="Your answer"
        />
        <button type="submit" className="btn" disabled={checking || !guess.trim()}>
          {checking ? 'Checking…' : 'Transmit'}
        </button>
      </form>

      <p className="notice" role="status" aria-live="polite">
        {notice}
      </p>
      {misses.length > 0 && (
        <ul className="misses" aria-label="Wrong guesses">
          {misses.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface FeedbackCardProps {
  round: Round;
  jump: Jump;
  crossed: Milestone[];
  /** Milestone banners appear when the spacecraft gets there. */
  arrivalDelayMs: number;
  isLast: boolean;
  onNext: () => void;
}

export function FeedbackCard({ round, jump, crossed, arrivalDelayMs, isLast, onNext }: FeedbackCardProps) {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => button.current?.focus({ preventScroll: true }), []);

  const ok = round.matchedName !== null;
  const tries = round.misses.length;
  const look = lookFor(round.tier);

  return (
    <section className={`card card--feedback tier-${look.tier}`}>
      <header className="card__header">
        <span>{round.promptText}</span>
      </header>

      <p className="feedback__cheer">{look.cheer}</p>
      <div className="feedback">
        <p className="feedback__answer">
          {ok ? round.matchedName : round.label === 'Network error' ? 'Transmission failed' : 'Out of time'}
          {ok && round.fuzzy && <small> (you typed “{round.input}”)</small>}
        </p>
        <p className="feedback__points">{ok ? `+${round.points}` : '+0'}</p>
        <p className="feedback__tier">{ok ? round.label.split(' · ')[0] : 'No answer locked in'}</p>
      </div>

      {ok ? (
        <dl className="jump">
          <div>
            <dt>Jumped</dt>
            <dd>{formatAu(jump.au)}</dd>
          </div>
          <div>
            <dt>That&apos;s</dt>
            <dd>{formatKm(jump.km)}</dd>
          </div>
          <div>
            <dt>Voyager took</dt>
            <dd>{formatSpan(jump.days)}</dd>
          </div>
        </dl>
      ) : (
        <p className="feedback__stall">The spacecraft drifts. No distance gained.</p>
      )}

      {tries > 0 && (
        <p className="feedback__tries">
          {tries} wrong {tries === 1 ? 'guess' : 'guesses'} first: {round.misses.join(', ')}
        </p>
      )}
      {!ok && round.rarer.length > 0 && <p className="feedback__tries">Valid answers included: {round.rarer.join(', ')}</p>}

      {crossed.map((m, i) => (
        <div key={m.id} className="milestone-banner" style={{ animationDelay: `${arrivalDelayMs + i * 250}ms` }}>
          <strong>Milestone reached: {m.title}</strong>
          <p>{m.blurb}</p>
        </div>
      ))}

      <button ref={button} className="btn btn--primary" onClick={onNext}>
        {isLast ? 'See mission log' : 'Next transmission'}
      </button>
    </section>
  );
}
