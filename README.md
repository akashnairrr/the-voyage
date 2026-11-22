# The Voyage

A daily rare-answer trivia game. Your points fly Voyager 1 along its real
journey, from launch in 1977 to one light-day from Earth in November 2026.

This is the pilot: game loop, placeholder scoring, milestone progression,
answer checking and guest saves in the browser. No user accounts or database
yet, and no art.

The site is a static export hosted on GitHub Pages. Every push to `main` runs
`.github/workflows/pages.yml`, which tests, builds and deploys `out/`. Because
there is no server, the question bank ships to the browser: answers are
readable in devtools.

## Getting started

Requires Node 20.9+ and pnpm (`corepack enable` or `npm i -g pnpm`). Installing
with npm or yarn is blocked on purpose.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # unit tests (Node test runner via tsx)
pnpm typecheck
pnpm build        # static site in out/
```

## How a voyage works

1. 8 prompts ("transmissions"), 30 seconds each. Every prompt has many valid answers.
2. The browser matches what the player typed (forgiving case, accents and
   small typos) and scores it by rarity.
3. Points move the spacecraft along the journey. Crossing a milestone shows its story.
4. 800 points reaches one light-day from Earth. The final score is placed on
   Voyager 1's timeline with a mission date, distance and signal delay.

| Route | What it is |
| ----- | ---------- |
| `/` | Home: today's Mission Day, start or view today's voyage, the journey |
| `/voyage/daily` | Today's voyage: same 8 prompts for everyone, resets 00:00 UTC, one play per day |
| `/voyage/practice` | Random prompts, unlimited |
| `/log` | Voyages flown on this device |

## Project structure

Code is grouped by feature, and each feature is split by where it runs.
New features (accounts, leaderboards, friends) get their own folder under
`src/features/`.

```
src/
  app/                              routing only: pages, layout
    page.tsx                        home
    voyage/[mode]/page.tsx          one static page per mode; the game builds the voyage in the browser
    log/page.tsx
  features/voyage/
    domain/        shared by server and client, no secrets
      config.ts          tuning: prompts per voyage, timer, journeyPoints, rarity tiers
      milestones.ts      Voyager 1 milestones (date, distance, track position)
      progression.ts     points -> position on the journey
      calendar.ts        UTC day key, Mission Day
      types.ts           shapes passed between server and client
    server/        game logic and question bank; runs in the browser in the static build
      prompts.ts         question bank with answers, aliases, rarity tiers
      matching.ts        typed text -> valid answer
      scoring.ts         PLACEHOLDER scoring: replace with the real metric
      voyage-service.ts  createVoyage, checkAnswer, request validation
    client/        browser code
      components/        VoyageGame, PromptCard, ResultsView, JourneyTrack, ...
      game-state.ts      voyage state machine (reducer)
      api.ts             submitAnswer: checks answers locally (swap for a fetch when there's a server)
      storage.ts         GameStore interface + localStorage implementation
      use-countdown.ts
docs/milestones.md                  milestone research and the points mapping
```

## Where to change things

| You want to… | Edit |
| ------------ | ---- |
| Change the scoring metric | `server/scoring.ts` and `RARITY_TIERS` in `domain/config.ts` |
| Make the journey easier or harder | `journeyPoints` in `domain/config.ts` |
| Change voyage length or timer | `promptsPerVoyage`, `secondsPerPrompt` in `domain/config.ts` |
| Move a milestone on the track | its `at` value in `domain/milestones.ts` |
| Add questions | `server/prompts.ts` |

## Next steps for the backend

- **Accounts and saves:** write an `ApiStore` implementing `GameStore` in
  `client/storage.ts` and swap it in. The UI only talks to that interface.
- **Question bank in a database:** `voyage-service.ts` is the only code that
  reads `PROMPTS`. Point it at the database instead.
- **Real rarity:** log every answer and compute tiers from how often each one
  is given, instead of the hand-estimated tiers.
- **Hide the answers again:** move to a host with a server (e.g. Vercel), drop
  `output: 'export'` in `next.config.ts`, and restore a `POST` answer route
  that `client/api.ts` calls.
- **Server-side voyage sessions:** nothing stops a player from faking
  `timedOut` or replaying the daily voyage by clearing browser storage. Issue a
  voyage session ID on start and track answers and timing against it.
