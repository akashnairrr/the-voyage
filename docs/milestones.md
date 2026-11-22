# Voyager 1 milestones and the points mapping

The game follows **Voyager 1**, the farther of the twins. Voyager 2's Uranus
(Jan 1986) and Neptune (Aug 1989) flybys are left out of the main track; they
could become a second "twin" route later.

## Milestones

| # | Milestone | Date | ≈ AU | Track position | Points (at 800) |
|---|-----------|------|------|----------------|-----------------|
| 1 | Launch, Cape Canaveral | 5 Sep 1977 | 1 | 0.00 | 0 |
| 2 | First photo of Earth and Moon together | 18 Sep 1977 | 1 | 0.04 | 32 |
| 3 | Jupiter flyby: Io's volcanoes, Jupiter's ring | 5 Mar 1979 | 5.2 | 0.15 | 120 |
| 4 | Saturn flyby after close pass of Titan | 12 Nov 1980 | 9.5 | 0.27 | 216 |
| 5 | Pale Blue Dot and Family Portrait, cameras off | 14 Feb 1990 | 40.5 | 0.38 | 304 |
| 6 | Passes Pioneer 10: farthest human-made object | 17 Feb 1998 | 69.4 | 0.48 | 384 |
| 7 | Termination shock, enters the heliosheath | 16 Dec 2004 | 94 | 0.58 | 464 |
| 8 | Heliopause: interstellar space | 25 Aug 2012 | 121.6 | 0.70 | 560 |
| 9 | Thrusters unused for 37 years fired again | 28 Nov 2017 | 141 | 0.78 | 624 |
| 10 | Recovers from 5 months of garbled data | 20 Apr 2024 | 163.5 | 0.86 | 688 |
| 11 | LECP switched off, two instruments left | 17 Apr 2026 | 171 | 0.93 | 744 |
| 12 | One light-day from Earth | 18 Nov 2026 | 173.14 | 1.00 | 800 |

Distances are approximate distance from the Sun. Past Saturn they are close to
the distance from Earth.

## How points map to the journey

1. **Track position, not physical distance.** Each milestone has an `at` value
   from 0 to 1. Real distances are very uneven: Jupiter is 5 AU out, the light-day
   is 173 AU. Mapping points straight to distance would put Launch, Jupiter and
   Saturn within the first 6% of the bar. So the bar is paced by story instead.
   Early milestones are close together so every player sees a few in their first
   game. The interstellar ones are spread out and need strong scores.
2. **One number to tune.** `journeyPoints` (currently 800) is the score that
   reaches the light-day. Milestone points = `at × journeyPoints`. If the scoring
   metric changes, re-tune that one value and the milestones follow.
3. **In-between positions.** Between two milestones, the game interpolates date
   and distance linearly. A score of 335 shows "Mar 1993, 51.7 AU, 7h 10m
   signal delay" even though no milestone sits there.
4. **Beyond the end.** Scores above `journeyPoints` keep cruising at Voyager 1's
   real speed (about 3.6 AU a year), landing in the future. With today's
   placeholder scoring 800 is the maximum, so this only matters once the real
   metric adds bonuses.

With the placeholder scoring (10 to 100 points per answer, 8 prompts, 800 max),
reaching the light-day takes a perfect game: every answer in the rarest tier.
A decent game lands somewhere between Saturn and the termination shock. If
that turns out too hard, lower `journeyPoints` or raise the top tier's points.
