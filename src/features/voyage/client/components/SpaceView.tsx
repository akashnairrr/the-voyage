'use client';

import { useEffect, useRef } from 'react';

import { MILESTONES } from '../../domain/milestones';
import { milestonePoints, positionForPoints } from '../../domain/progression';
import { prefersReducedMotion } from '../use-tweened-number';

// A side-on view of the flight. Voyager sits left of centre facing right;
// stars stream past in three parallax layers. The faster `points` changes,
// the faster the stars move and the longer their streaks, so a big answer
// feels like a big jump. The Sun shrinks behind you as distance grows,
// Jupiter and Saturn fly past when you cross them, and the sky changes
// colour at the termination shock and heliopause.

interface Star {
  x: number;
  y: number;
  r: number;
  twinkle: number;
}

interface Body {
  kind: 'jupiter' | 'saturn' | 'shock' | 'heliopause' | 'flash';
  x: number;
  age: number;
}

const LAYERS = [
  { count: 110, speed: 6, size: 0.7, alpha: 0.45 },
  { count: 60, speed: 16, size: 1.1, alpha: 0.7 },
  { count: 26, speed: 40, size: 1.6, alpha: 0.95 },
];

const FLYBYS: Record<string, Body['kind']> = {
  jupiter: 'jupiter',
  saturn: 'saturn',
  'termination-shock': 'shock',
  heliopause: 'heliopause',
  'light-day': 'flash',
};

/** Sky colour by distance: navy inside the heliosphere, warmer in the heliosheath, near-black outside. */
function skyColour(au: number): [number, number, number] {
  const stops: [number, [number, number, number]][] = [
    [0, [10, 16, 38]],
    [80, [8, 12, 30]],
    [94, [26, 12, 34]],
    [118, [22, 10, 30]],
    [125, [4, 4, 12]],
    [999, [4, 4, 12]],
  ];
  for (let i = 1; i < stops.length; i++) {
    const [a, ca] = stops[i - 1];
    const [b, cb] = stops[i];
    if (au <= b) {
      const t = (au - a) / (b - a);
      return [0, 1, 2].map((k) => Math.round(ca[k] + (cb[k] - ca[k]) * t)) as [number, number, number];
    }
  }
  return stops[stops.length - 1][1];
}

function drawVoyager(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, warp: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.min(warp, 1) * -0.04);

  // Speed lines behind the craft.
  if (warp > 0.05) {
    ctx.strokeStyle = `rgba(245, 197, 66, ${Math.min(0.5, warp * 0.5)})`;
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) {
      const len = 30 + warp * 120 + Math.abs(i) * -8;
      ctx.beginPath();
      ctx.moveTo(-14 * s, i * 6 * s);
      ctx.lineTo(-14 * s - len, i * 6 * s);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = '#c9cfdb';
  ctx.lineWidth = 1.4 * s;
  // Magnetometer boom (long, thin, up-back).
  ctx.beginPath();
  ctx.moveTo(-4 * s, -4 * s);
  ctx.lineTo(-34 * s, -26 * s);
  ctx.stroke();
  // RTG boom (down-back) with the power source.
  ctx.beginPath();
  ctx.moveTo(-4 * s, 5 * s);
  ctx.lineTo(-20 * s, 18 * s);
  ctx.stroke();
  ctx.fillStyle = '#8b93a5';
  ctx.fillRect(-26 * s, 16 * s, 9 * s, 5 * s);
  // Science boom (forward-down).
  ctx.beginPath();
  ctx.moveTo(4 * s, 5 * s);
  ctx.lineTo(18 * s, 16 * s);
  ctx.stroke();
  ctx.fillStyle = '#a7afc0';
  ctx.fillRect(16 * s, 14 * s, 6 * s, 5 * s);

  // Bus (the ten-sided body).
  ctx.fillStyle = '#9aa3b5';
  ctx.fillRect(-7 * s, -4 * s, 14 * s, 10 * s);
  ctx.fillStyle = '#6f7789';
  ctx.fillRect(-7 * s, 3 * s, 14 * s, 3 * s);

  // High-gain antenna: the big white dish, pointed back toward Earth.
  ctx.fillStyle = '#eef1f6';
  ctx.beginPath();
  ctx.ellipse(-2 * s, -9 * s, 5 * s, 18 * s, Math.PI / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c4cad6';
  ctx.beginPath();
  ctx.ellipse(-2 * s, -7 * s, 3.5 * s, 15 * s, Math.PI / 2, 0, Math.PI);
  ctx.fill();
  // The Golden Record glint.
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.arc(5 * s, 1 * s, 2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlanet(ctx: CanvasRenderingContext2D, kind: 'jupiter' | 'saturn', x: number, y: number, r: number) {
  ctx.save();
  if (kind === 'saturn') {
    ctx.strokeStyle = 'rgba(222, 200, 150, 0.8)';
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 2.1, r * 0.45, -0.25, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
  if (kind === 'jupiter') {
    g.addColorStop(0, '#f3d9b1');
    g.addColorStop(1, '#a8673a');
  } else {
    g.addColorStop(0, '#f6e7bf');
    g.addColorStop(1, '#b5935a');
  }
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // Bands.
  ctx.save();
  ctx.clip();
  ctx.fillStyle = kind === 'jupiter' ? 'rgba(140, 80, 45, 0.45)' : 'rgba(160, 130, 80, 0.3)';
  for (const b of [-0.45, -0.15, 0.2, 0.5]) ctx.fillRect(x - r, y + b * r, r * 2, r * 0.12);
  if (kind === 'jupiter') {
    ctx.fillStyle = 'rgba(190, 80, 50, 0.8)';
    ctx.beginPath();
    ctx.ellipse(x + r * 0.3, y + r * 0.32, r * 0.18, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  if (kind === 'saturn') {
    ctx.strokeStyle = 'rgba(222, 200, 150, 0.9)';
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 2.1, r * 0.45, -0.25, 0, Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

export function SpaceView({ points }: { points: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    let W = 0;
    let H = 0;
    let stars: Star[][] = [];
    const bodies: Body[] = [];

    const seedStars = () => {
      stars = LAYERS.map((layer) =>
        Array.from({ length: Math.round((layer.count * W) / 900) + 4 }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: layer.size * (0.6 + Math.random() * 0.8),
          twinkle: Math.random() * Math.PI * 2,
        })),
      );
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedStars();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let last = performance.now();
    let prevPoints = pointsRef.current;
    let warp = 0; // smoothed 0..~3
    let frame = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = pointsRef.current;

      // Velocity in points/second drives the warp. Smooth it so it eases.
      const velocity = dt > 0 ? Math.max(0, p - prevPoints) / dt : 0;
      const targetWarp = reduced ? 0 : Math.min(3, velocity / 40);
      warp += (targetWarp - warp) * Math.min(1, dt * 6);

      // Spawn flybys for milestones crossed this frame.
      for (const m of MILESTONES) {
        const kind = FLYBYS[m.id];
        const mp = milestonePoints(m);
        if (kind && prevPoints < mp && p >= mp) bodies.push({ kind, x: W + 160, age: 0 });
      }
      prevPoints = p;

      const pos = positionForPoints(p);
      const [r, g, b] = skyColour(pos.au);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, W, H);

      // The Sun, behind us on the left. It shrinks to a bright star as you fly out.
      const sunR = Math.max(2.5, 110 / Math.sqrt(pos.au));
      const sunX = Math.max(26, sunR * 0.5);
      const sunY = H * 0.5;
      const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 4 + 20);
      glow.addColorStop(0, 'rgba(255, 236, 180, 0.9)');
      glow.addColorStop(0.25, 'rgba(255, 200, 90, 0.3)');
      glow.addColorStop(1, 'rgba(255, 180, 60, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff6dc';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Stars: parallax drift, stretched into streaks at warp.
      LAYERS.forEach((layer, li) => {
        const speed = layer.speed * (1 + warp * 28);
        const streak = reduced ? 0 : Math.min(W * 0.4, speed * 0.045 * warp);
        for (const s of stars[li]) {
          s.x -= speed * dt;
          if (s.x < -streak - 4) {
            s.x = W + Math.random() * 40;
            s.y = Math.random() * H;
          }
          const tw = 0.75 + 0.25 * Math.sin(now / 700 + s.twinkle);
          ctx.globalAlpha = layer.alpha * tw;
          if (streak > 1.5) {
            ctx.strokeStyle = '#dfe6ff';
            ctx.lineWidth = s.r;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + streak, s.y);
            ctx.stroke();
          } else {
            ctx.fillStyle = '#e8edff';
            ctx.fillRect(s.x, s.y, s.r, s.r);
          }
        }
      });
      ctx.globalAlpha = 1;

      // Planets and boundaries are big and far away: they drift past slower
      // than the near stars, so there's time to see them even at full warp.
      const bodySpeed = Math.min(W * 0.55, Math.max(140, LAYERS[2].speed * (1 + warp * 28) * 0.6));
      for (let i = bodies.length - 1; i >= 0; i--) {
        const body = bodies[i];
        body.age += dt;
        body.x -= bodySpeed * dt;
        if (body.kind === 'jupiter' || body.kind === 'saturn') {
          const pr = H * (body.kind === 'jupiter' ? 0.32 : 0.26);
          drawPlanet(ctx, body.kind, body.x, H * 0.28, pr);
          ctx.fillStyle = 'rgba(230, 233, 242, 0.85)';
          ctx.font = '600 12px system-ui, sans-serif';
          ctx.fillText(body.kind === 'jupiter' ? 'JUPITER' : 'SATURN', body.x - 24, H * 0.28 + pr + 18);
          if (body.x < -pr * 2.5) bodies.splice(i, 1);
        } else if (body.kind === 'shock' || body.kind === 'heliopause') {
          // A shimmering boundary wall sweeping past.
          const w = 90;
          const colour = body.kind === 'shock' ? '255, 150, 90' : '170, 130, 255';
          const wall = ctx.createLinearGradient(body.x - w, 0, body.x + w, 0);
          wall.addColorStop(0, `rgba(${colour}, 0)`);
          wall.addColorStop(0.5, `rgba(${colour}, 0.35)`);
          wall.addColorStop(1, `rgba(${colour}, 0)`);
          ctx.fillStyle = wall;
          ctx.fillRect(body.x - w, 0, w * 2, H);
          ctx.fillStyle = `rgba(${colour}, 0.9)`;
          ctx.font = '600 12px system-ui, sans-serif';
          ctx.fillText(body.kind === 'shock' ? 'TERMINATION SHOCK' : 'HELIOPAUSE', body.x - 50, 22);
          if (body.x < -w * 2) bodies.splice(i, 1);
        } else {
          // One light-day: a brief golden flash.
          ctx.fillStyle = `rgba(245, 197, 66, ${Math.max(0, 0.45 - body.age * 0.4)})`;
          ctx.fillRect(0, 0, W, H);
          if (body.age > 1.2) bodies.splice(i, 1);
        }
      }

      const bob = reduced ? 0 : Math.sin(now / 900) * 3;
      const shake = reduced ? 0 : (Math.random() - 0.5) * warp * 1.5;
      drawVoyager(ctx, W * 0.34, H * 0.58 + bob + shake, Math.max(1.4, H / 130), warp);

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="space-view__canvas" aria-hidden="true" />;
}
