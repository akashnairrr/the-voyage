// Voyager 1's journey, launch to one light-day.
//
// `at`  — where the milestone sits on the game track, as a fraction (0–1) of
//         GAME_CONFIG.journeyPoints. This is a DESIGN choice, not physics:
//         early milestones are close together so new players feel progress,
//         the late interstellar ones are spread out and hard to reach.
// `date` — real mission date (ISO).
// `au`   — approximate distance from the Sun in astronomical units at that
//          date (≈ distance from Earth once you're past Saturn).
//
// Between milestones, progression.ts interpolates date and distance, so a
// player's score always maps to a real-ish point on the journey.

export interface Milestone {
  id: string;
  title: string;
  date: string;
  au: number;
  at: number;
  blurb: string;
}

export const MILESTONES: Milestone[] = [
  {
    id: 'launch',
    title: 'Launch',
    date: '1977-09-05',
    au: 1.0,
    at: 0,
    blurb:
      'Voyager 1 lifts off from Cape Canaveral on a Titan IIIE-Centaur rocket, sixteen days after its twin.',
  },
  {
    id: 'earth-moon',
    title: 'Earth and Moon in one frame',
    date: '1977-09-18',
    au: 1.05,
    at: 0.04,
    blurb:
      'From about 11.7 million km away, Voyager 1 takes the first single photo showing Earth and the Moon together.',
  },
  {
    id: 'jupiter',
    title: 'Jupiter flyby',
    date: '1979-03-05',
    au: 5.2,
    at: 0.15,
    blurb:
      'Closest approach to Jupiter. Discovers active volcanoes on Io, the first seen beyond Earth, and a faint ring around the planet.',
  },
  {
    id: 'saturn',
    title: 'Saturn and Titan',
    date: '1980-11-12',
    au: 9.5,
    at: 0.27,
    blurb:
      "Closest approach to Saturn after a close pass of Titan and its thick haze. Saturn's gravity flings Voyager 1 up and out of the planets' plane for good.",
  },
  {
    id: 'pale-blue-dot',
    title: 'The Pale Blue Dot',
    date: '1990-02-14',
    au: 40.5,
    at: 0.38,
    blurb:
      'At Carl Sagan\'s urging, Voyager 1 turns around and photographs the "Family Portrait" of the planets, including Earth as a pale blue dot. Minutes later its cameras are switched off forever.',
  },
  {
    id: 'farthest',
    title: 'Farthest human-made object',
    date: '1998-02-17',
    au: 69.4,
    at: 0.48,
    blurb:
      'Voyager 1 overtakes Pioneer 10 and becomes the most distant object humans have ever made. It has held the record ever since.',
  },
  {
    id: 'termination-shock',
    title: 'Termination shock',
    date: '2004-12-16',
    au: 94,
    at: 0.58,
    blurb:
      'The solar wind abruptly slows from supersonic speed. Voyager 1 enters the heliosheath, the turbulent outer layer of the Sun\'s bubble.',
  },
  {
    id: 'heliopause',
    title: 'Interstellar space',
    date: '2012-08-25',
    au: 121.6,
    at: 0.7,
    blurb:
      'Voyager 1 crosses the heliopause and becomes the first spacecraft in interstellar space. NASA confirms it a year later from plasma-wave data.',
  },
  {
    id: 'thrusters',
    title: 'Thrusters revived',
    date: '2017-11-28',
    au: 141,
    at: 0.78,
    blurb:
      'Engineers fire trajectory-correction thrusters unused for 37 years. They work, buying the mission extra years of pointing at Earth.',
  },
  {
    id: 'glitch',
    title: 'Back from the garble',
    date: '2024-04-20',
    au: 163.5,
    at: 0.86,
    blurb:
      'After five months of unreadable data caused by a failed memory chip, engineers move code around the damaged section and Voyager 1 talks sense again.',
  },
  {
    id: 'power',
    title: 'Running on fumes',
    date: '2026-04-17',
    au: 171,
    at: 0.93,
    blurb:
      'To save power, the Low-energy Charged Particles instrument is switched off. Voyager 1 is down to two working science instruments.',
  },
  {
    id: 'light-day',
    title: 'One light-day from Earth',
    date: '2026-11-18',
    au: 173.14,
    at: 1,
    blurb:
      'Voyager 1 becomes the first human-made object one light-day from Earth: a signal now takes 24 hours each way.',
  },
];

/** Speed past Saturn, used to extrapolate "beyond the journey" bonus distance. */
export const AU_PER_YEAR_CRUISE = 3.57;
