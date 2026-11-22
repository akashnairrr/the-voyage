// Client-side voyage state machine. Pure, so it's unit-tested without React.
//
//   playing --resolved--> reviewing --next--> playing | finished
//
// While "playing", the player can guess as many times as they like; wrong
// guesses live in the PromptCard. "resolved" fires once: on the first correct
// answer or when the 30 seconds run out.

import type { Round } from '../domain/types';

export interface GameState {
  status: 'playing' | 'reviewing' | 'finished';
  index: number;
  promptCount: number;
  rounds: Round[];
  totalPoints: number;
}

export type GameAction = { type: 'resolved'; round: Round } | { type: 'next' };

export function initialGameState(promptCount: number): GameState {
  return { status: 'playing', index: 0, promptCount, rounds: [], totalPoints: 0 };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'resolved':
      if (state.status !== 'playing') return state;
      return {
        ...state,
        status: 'reviewing',
        rounds: [...state.rounds, action.round],
        totalPoints: state.totalPoints + action.round.points,
      };
    case 'next': {
      if (state.status !== 'reviewing') return state;
      const index = state.index + 1;
      return index >= state.promptCount ? { ...state, status: 'finished' } : { ...state, index, status: 'playing' };
    }
  }
}
