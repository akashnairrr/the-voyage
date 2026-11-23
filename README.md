# The Voyage

A daily rare-answer trivia game. Your points fly Voyager 1 along its real
journey, from launch in 1977 to one light-day from Earth in November 2026.

This is the pilot: game loop, placeholder scoring, milestone progression,
answer checking and guest saves in the browser, and 8-bit pixel-art visuals.
No user accounts or database yet.

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

1. 8 prompts ("transmissions"), 30 seconds each: 3 easy, 3 medium, then 2 hard.
   Every prompt has many valid answers.
2. Unlimited guesses until time runs out. The browser matches what the player
   typed (forgiving case, accents, plurals and small typos); the first correct
   answer locks in and scores by rarity.
3. Points move the spacecraft along the journey. Crossing a milestone shows its story.
   Rarer answers make bigger, brighter jumps (see "Visuals" below).
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
      prompts.ts         question bank: answers ranked common -> rare; tiers come from the order
      matching.ts        typed text -> valid answer
      scoring.ts         PLACEHOLDER scoring: replace with the real metric
      voyage-service.ts  createVoyage, checkAnswer, request validation
    client/        browser code
      components/        VoyageGame, PromptCard, ResultsView, FlightDeck, SpaceView (8-bit canvas), ...
      tier-style.ts      palette, per-tier colours/cheers/intensity, voyage mood and final grades
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
| Add questions | `server/prompts.ts`: list answers from most common to rarest |
| Make an answer score more or less | move it later or earlier in its prompt's list |
| Change the easy/medium/hard mix | `voyageMix` in `domain/config.ts` |
| Change how loud each tier looks | `TIER_LOOKS` in `client/tier-style.ts` |

## Question balance

Each prompt lists its answers from most common to rarest. Only the last answer
(the last two for lists of 15 or more) scores the top 100 points; every other
answer is split evenly across the other five tiers (10, 25, 40, 60, 80). A test
enforces this, so a new prompt can't accidentally have ten "Golden Record"
answers.

## Visuals

The space view (`SpaceView.tsx`) is drawn at 320×100 real pixels and scaled up
with `image-rendering: pixelated`. How each answer looks is driven by its tier:

| Tier | Cheer | What happens |
| ---- | ----- | ------------ |
| miss | Signal lost | smoke, static, the craft sags |
| 1 | Obvious… | grey puff, small dull "+10", card desaturated |
| 2–3 | Not bad / Nice! | green or blue flame and sparks |
| 4 | Great! | purple sparks, screen shake |
| 5 | Brilliant! | orange explosion, sparkles, flash, glowing card |
| 6 | LEGENDARY! | rainbow warp streaks, big explosion, white flash, rainbow text |

The top bar shows one coloured block per answer. The score and the viewport frame
take the voyage's average tier: grey when it's going badly, gold and pulsing
when it's going well. The results screen grades the voyage from "Stuck near
home" (grey, desaturated) to "Legendary voyage" (rainbow, confetti).

Fonts are Press Start 2P and VT323 via `next/font/google`. They download at
build time and ship with the static site.

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
