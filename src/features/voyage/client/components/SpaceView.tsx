'use client';

import { useEffect, useRef } from 'react';

import { MILESTONES } from '../../domain/milestones';
import { milestonePoints, positionForPoints, regionFor } from '../../domain/progression';
import { lookFor, PALETTE } from '../tier-style';
import { prefersReducedMotion } from '../use-tweened-number';

// 8-bit side view of the flight, drawn at 320×100 real pixels and scaled up
// by CSS with `image-rendering: pixelated`. Everything is placed on whole
// pixels, so it stays crisp and chunky at any size.
//
// - Stars stream past in three layers. The faster the score is climbing, the
//   faster they go and the longer their streaks (warp).
// - Each answer fires a `burst` sized by its tier: a grey puff for an obvious
//   answer, up to a rainbow explosion, screen flash and sparkles for a
//   Golden Record answer. A miss sputters smoke and static.
// - The Sun shrinks behind you, Jupiter and Saturn fly past, the termination
//   shock and heliopause sweep by as walls, and the sky changes per region.

export const SKY_W = 320;
export const SKY_H = 100;

export interface Burst {
  /** 0 = miss, 1..6 = rarity tier. */
  tier: number;
  /** Changes on every answer so the same tier can fire twice in a row. */
  id: number;
}

// Voyager 1, side on: magnetometer boom, the big dish, the bus with the
// Golden Record, and the two lower booms. 2× scale on screen.
const VOYAGER = [
  'G.....................',
  '.G....................',
  '..G....WWWWWWWW.......',
  '...G.WWWWWWWWWWWW.....',
  '....GWSSSSSSSSSSSW....',
  '.....WWSSSSSSSSWW.....',
  '.......WWWWWWWW.......',
  '..........SS..........',
  '.........GSSG.........',
  '........GSSYSG........',
  '.......G.GSSG.G.......',
  '......G........G......',
  '.....SS.........SS....',
  '.....GG.........GG....',
];
const SPRITE_COLOURS: Record<string, string> = {
  G: PALETTE.grey,
  S: PALETTE.silver,
  W: PALETTE.white,
  Y: PALETTE.yellow,
};
const SPRITE_SCALE = 2;
const SHIP_X = 92;
const SHIP_TOP = 26;
/** Centre of the bus (where the Golden Record sits), in sky pixels. */
const BUS_X = SHIP_X + 22;
const BUS_Y = SHIP_TOP + 19;

interface Star {
  x: number;
  y: number;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  colour: string;
  size: number;
}
interface Sparkle {
  x: number;
  y: number;
  life: number;
  colour: string;
}
interface Body {
  kind: 'jupiter' | 'saturn' | 'shock' | 'heliopause';
  x: number;
}

const LAYERS = [
  { count: 70, speed: 4, colour: PALETTE.grey },
  { count: 40, speed: 10, colour: PALETTE.silver },
  { count: 18, speed: 22, colour: PALETTE.white },
];

const FLYBY_FOR: Record<string, Body['kind']> = {
  jupiter: 'jupiter',
  saturn: 'saturn',
  'termination-shock': 'shock',
  heliopause: 'heliopause',
};

const SKY = { heliosphere: '#111a3e', heliosheath: PALETTE.plum, interstellar: PALETTE.void } as const;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

function disc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, colourForRow: (dy: number) => string) {
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy));
    ctx.fillStyle = colourForRow(dy);
    ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
  }
}

/** A ring of checkerboard pixels: the classic 8-bit glow. */
function ditherRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, inner: number, outer: number, colour: string) {
  ctx.fillStyle = colour;
  for (let dy = -outer; dy <= outer; dy++) {
    const y = cy + dy;
    if (y < 0 || y >= SKY_H) continue;
    for (let dx = -outer; dx <= outer; dx++) {
      const x = cx + dx;
      if (x < 0 || x >= SKY_W || (x + y) % 2) continue;
      const d2 = dx * dx + dy * dy;
      if (d2 > inner * inner && d2 <= outer * outer) ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawSprite(ctx: CanvasRenderingContext2D, x: number, y: number) {
  VOYAGER.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const c = SPRITE_COLOURS[row[rx]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x + rx * SPRITE_SCALE, y + ry * SPRITE_SCALE, SPRITE_SCALE, SPRITE_SCALE);
    }
  });
}

function drawPlanet(ctx: CanvasRenderingContext2D, kind: 'jupiter' | 'saturn', cx: number, cy: number) {
  const r = kind === 'jupiter' ? 24 : 18;
  const bands =
    kind === 'jupiter'
      ? [PALETTE.peach, PALETTE.tan, PALETTE.brown, PALETTE.tan, PALETTE.peach, PALETTE.brown, PALETTE.tan]
      : [PALETTE.peach, PALETTE.tan, PALETTE.peach, PALETTE.tan, PALETTE.peach];
  const ring = (front: boolean) => {
    ctx.fillStyle = PALETTE.tan;
    for (let a = front ? 0 : Math.PI; a < (front ? Math.PI : Math.PI * 2); a += 0.02) {
      const x = Math.round(cx + Math.cos(a) * r * 1.9);
      const y = Math.round(cy + Math.sin(a) * r * 0.32);
      ctx.fillRect(x, y, 2, 1);
    }
  };
  if (kind === 'saturn') ring(false);
  disc(ctx, cx, cy, r, (dy) => bands[Math.floor(((dy + r) / (2 * r + 1)) * bands.length)]);
  // Night side: checkerboard shading on the right third of the disc only.
  ctx.fillStyle = PALETTE.ink;
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy));
    for (let x = cx + Math.floor(dx * 0.35); x <= cx + dx; x++) {
      if ((x + cy + dy) % 2 === 0 || x > cx + dx * 0.8) ctx.fillRect(x, cy + dy, 1, 1);
    }
  }
  if (kind === 'jupiter') {
    ctx.fillStyle = PALETTE.red;
    ctx.fillRect(cx + 4, cy + 7, 7, 3);
    ctx.fillRect(cx + 5, cy + 6, 5, 5);
  } else {
    ring(true);
  }
}

export function SpaceView({ points, burst }: { points: number; burst?: Burst | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef(points);
  const burstRef = useRef(burst ?? null);
  pointsRef.current = points;
  burstRef.current = burst ?? null;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const reduced = prefersReducedMotion();

    const stars: Star[][] = LAYERS.map((l) => Array.from({ length: l.count }, () => ({ x: rand(0, SKY_W), y: rand(0, SKY_H) })));
    const particles: Particle[] = [];
    const sparkles: Sparkle[] = [];
    const bodies: Body[] = [];

    let lastBurstId = burstRef.current?.id ?? null;
    let burstTier = 1;
    let flame = 0; // 0..1, decays
    let shake = 0; // seconds left
    let flash = 0; // seconds left
    let flashColour: string = PALETTE.white;
    let staticNoise = 0; // seconds left (miss)
    let warp = 0;
    let prevPoints = pointsRef.current;
    let last = performance.now();
    let frame = 0;

    const fire = (tier: number) => {
      const look = lookFor(tier);
      burstTier = tier;
      if (reduced) return;
      const ox = BUS_X;
      const oy = BUS_Y;
      if (tier === 0) {
        // Sputter: grey smoke drifting back, static on the screen.
        for (let i = 0; i < 14; i++)
          particles.push({ x: ox, y: oy, vx: rand(-40, -10), vy: rand(-8, 8), life: 0, max: rand(0.8, 1.6), colour: pick([PALETTE.grey, PALETTE.silver]), size: 2 });
        staticNoise = 0.45;
        return;
      }
      flame = Math.max(0.15, look.intensity);
      const count = Math.round(4 + look.intensity ** 1.6 * 80);
      for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2);
        const speed = rand(15, 30 + look.intensity * 110);
        particles.push({
          x: ox,
          y: oy,
          vx: Math.cos(a) * speed - 20,
          vy: Math.sin(a) * speed * 0.7,
          life: 0,
          max: rand(0.4, 0.6 + look.intensity * 1.2),
          colour: pick(look.sparks),
          size: tier >= 5 && Math.random() < 0.4 ? 2 : 1,
        });
      }
      if (tier >= 5) {
        for (let i = 0; i < (tier === 6 ? 26 : 10); i++)
          sparkles.push({ x: Math.round(rand(4, SKY_W - 4)), y: Math.round(rand(4, SKY_H - 4)), life: rand(-0.6, 0), colour: pick(look.sparks) });
      }
      if (tier >= 4) shake = 0.25 + look.intensity * 0.3;
      if (tier === 6) {
        flash = 0.22;
        flashColour = PALETTE.white;
      } else if (tier === 5) {
        flash = 0.1;
        flashColour = PALETTE.yellow;
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = pointsRef.current;

      const b = burstRef.current;
      if (b && b.id !== lastBurstId) {
        lastBurstId = b.id;
        fire(b.tier);
      }

      const velocity = dt > 0 ? Math.max(0, p - prevPoints) / dt : 0;
      warp += ((reduced ? 0 : Math.min(3, velocity / 40)) - warp) * Math.min(1, dt * 6);

      for (const m of MILESTONES) {
        const kind = FLYBY_FOR[m.id];
        const mp = milestonePoints(m);
        if (prevPoints < mp && p >= mp) {
          if (kind) bodies.push({ kind, x: SKY_W + 60 });
          if (m.id === 'light-day' && !reduced) {
            flash = 0.6;
            flashColour = PALETTE.yellow;
          }
        }
      }
      prevPoints = p;

      const pos = positionForPoints(p);

      // ---- Sky ----
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = SKY[regionFor(pos.au)];
      ctx.fillRect(0, 0, SKY_W, SKY_H);

      // Screen shake for big answers (whole pixels only).
      if (shake > 0) {
        const amp = Math.ceil(shake * 6);
        ctx.setTransform(1, 0, 0, 1, Math.round(rand(-amp, amp)), Math.round(rand(-amp, amp) / 2));
        shake -= dt;
      }

      // ---- Sun: big at launch, a dot by interstellar space ----
      const sunR = Math.max(1, Math.min(30, Math.round(30 / Math.sqrt(pos.au))));
      const sunX = Math.max(6, Math.round(sunR * 0.4));
      const sunY = 50;
      ditherRing(ctx, sunX, sunY, sunR + 3, sunR + 8, PALETTE.orange);
      ditherRing(ctx, sunX, sunY, sunR, sunR + 3, PALETTE.yellow);
      disc(ctx, sunX, sunY, sunR, () => PALETTE.white);

      // ---- Stars ----
      const nearHot = burstTier >= 4 && warp > 0.25;
      const hot = lookFor(burstTier).sparks;
      LAYERS.forEach((layer, li) => {
        const speed = layer.speed * (1 + warp * 22);
        const streak = reduced ? 0 : Math.min(70, Math.floor(speed * 0.035 * warp));
        stars[li].forEach((s, si) => {
          s.x -= speed * dt;
          if (s.x < -streak - 2) {
            s.x = SKY_W + rand(0, 20);
            s.y = rand(0, SKY_H);
          }
          ctx.fillStyle = li === 2 && nearHot ? hot[si % hot.length] : layer.colour;
          ctx.fillRect(Math.round(s.x), Math.round(s.y), Math.max(1, streak), 1);
        });
      });

      // ---- Flybys ----
      const bodySpeed = Math.min(160, Math.max(30, LAYERS[2].speed * (1 + warp * 22) * 0.45));
      for (let i = bodies.length - 1; i >= 0; i--) {
        const body = bodies[i];
        body.x -= bodySpeed * dt;
        const x = Math.round(body.x);
        if (body.kind === 'jupiter' || body.kind === 'saturn') {
          drawPlanet(ctx, body.kind, x, 30);
        } else {
          const colour = body.kind === 'shock' ? PALETTE.orange : PALETTE.purple;
          for (let col = -6; col <= 6; col++) {
            ctx.fillStyle = colour;
            for (let y = (x + col) & 1; y < SKY_H; y += Math.abs(col) < 2 ? 1 : 2 + Math.abs(col) / 3) ctx.fillRect(x + col, Math.round(y), 1, 1);
          }
        }
        if (body.x < -70) bodies.splice(i, 1);
      }

      // ---- Thruster flame (game licence: the real Voyager has no main engine) ----
      const fx = SHIP_X + 14;
      const fy = BUS_Y - 1;
      const flicker = Math.random() < 0.5 ? 0 : 1;
      if (flame > 0.02 && !reduced) {
        const len = Math.round(2 + flame * 26 + flicker * 2);
        const look = lookFor(burstTier);
        const tail = burstTier >= 5 ? PALETTE.red : burstTier >= 3 ? PALETTE.orange : PALETTE.grey;
        ctx.fillStyle = tail;
        ctx.fillRect(fx - len, fy - 1, len, 3);
        ctx.fillStyle = burstTier >= 2 ? look.colour : PALETTE.silver;
        ctx.fillRect(fx - Math.round(len * 0.65), fy - 1, Math.round(len * 0.65), 3);
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(fx - Math.round(len * 0.3), fy, Math.round(len * 0.3), 1);
        flame = Math.max(0, flame - dt * (0.35 + (1 - flame) * 0.6));
      } else {
        // Idle: a tiny blue pilot light.
        ctx.fillStyle = flicker ? PALETTE.navy : PALETTE.blue;
        ctx.fillRect(fx - 2, fy, 2, 1);
      }

      // ---- The spacecraft ----
      const bob = reduced ? 0 : Math.round(Math.sin(now / 600));
      const sag = staticNoise > 0 ? 2 : 0;
      drawSprite(ctx, SHIP_X, SHIP_TOP + bob + sag);

      // ---- Particles (blink out at the end of life, 8-bit style) ----
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.life += dt;
        if (pt.life >= pt.max) {
          particles.splice(i, 1);
          continue;
        }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vx *= 1 - dt * 1.2;
        pt.vy *= 1 - dt * 1.2;
        if (pt.life > pt.max * 0.7 && Math.floor(now / 60) % 2) continue;
        ctx.fillStyle = pt.colour;
        ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
      }

      // ---- Sparkles: twinkling plus signs for top answers ----
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.life += dt;
        if (s.life > 1.8) {
          sparkles.splice(i, 1);
          continue;
        }
        if (s.life < 0) continue;
        const big = Math.floor(s.life * 8) % 3 === 1;
        ctx.fillStyle = s.colour;
        ctx.fillRect(s.x, s.y, 1, 1);
        if (big) {
          ctx.fillRect(s.x - 1, s.y, 3, 1);
          ctx.fillRect(s.x, s.y - 1, 1, 3);
        }
      }

      // ---- Static for a miss ----
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (staticNoise > 0) {
        staticNoise -= dt;
        for (let i = 0; i < 14; i++) {
          ctx.fillStyle = pick([PALETTE.grey, PALETTE.silver, PALETTE.ink]);
          ctx.fillRect(Math.round(rand(0, SKY_W)), Math.round(rand(0, SKY_H)), Math.round(rand(10, 90)), 1);
        }
      }

      // ---- Flash: solid, then dithered, then gone ----
      if (flash > 0) {
        ctx.fillStyle = flashColour;
        if (flash > 0.12) ctx.fillRect(0, 0, SKY_W, SKY_H);
        else
          for (let y = 0; y < SKY_H; y++)
            for (let x = y % 2; x < SKY_W; x += 2) ctx.fillRect(x, y, 1, 1);
        flash -= dt;
      }

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} width={SKY_W} height={SKY_H} className="space-view__canvas" aria-hidden="true" />;
}
