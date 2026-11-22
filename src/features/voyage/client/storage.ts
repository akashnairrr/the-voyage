// Persistence behind an interface. The pilot keeps guest data in the browser's
// localStorage. When user accounts arrive, write an ApiStore with the same
// methods (backed by your backend) and swap it in at the bottom of this file.

import type { VoyageRecord } from '../domain/types';

export interface GameStore {
  /** Anonymous player ID (guest play, no account). */
  getPlayerId(): string;
  saveVoyage(record: VoyageRecord): void;
  getDaily(dayKey: string): VoyageRecord | null;
  getHistory(): VoyageRecord[];
}

const KEY = { player: 'voyage.playerId', history: 'voyage.history' };
const MAX_HISTORY = 100;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): the game still works, it just won't remember.
  }
}

export class LocalStore implements GameStore {
  getPlayerId(): string {
    let id = read<string | null>(KEY.player, null);
    if (!id) {
      id = crypto.randomUUID();
      write(KEY.player, id);
    }
    return id;
  }

  saveVoyage(record: VoyageRecord): void {
    write(KEY.history, [record, ...this.getHistory()].slice(0, MAX_HISTORY));
  }

  getDaily(dayKey: string): VoyageRecord | null {
    return this.getHistory().find((r) => r.mode === 'daily' && r.dayKey === dayKey) ?? null;
  }

  getHistory(): VoyageRecord[] {
    return read<VoyageRecord[]>(KEY.history, []);
  }
}

export const store: GameStore = new LocalStore();
