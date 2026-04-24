/**
 * polish — orb trail, planet oscillation, HUD score pop.
 *
 * Particle cap: 80 concurrent (guardrail). Pool-and-recycle pattern avoids
 * per-frame allocation.
 */

import gsap from 'gsap';

export const MAX_TRAIL_PARTICLES = 80;

interface Particle {
  x: number;
  y: number;
  life: number;
}

export interface OrbTrail {
  emit: (pt: { x: number; y: number }) => void;
  activeCount: () => number;
  step: (dt: number) => void;
  clear: () => void;
}

export function createOrbTrail(): OrbTrail {
  // Pre-allocated pool.
  const pool: Particle[] = Array.from({ length: MAX_TRAIL_PARTICLES }, () => ({
    x: 0,
    y: 0,
    life: 0,
  }));
  let head = 0;
  let active = 0;

  return {
    emit(pt) {
      const p = pool[head];
      p.x = pt.x;
      p.y = pt.y;
      p.life = 1.0;
      head = (head + 1) % MAX_TRAIL_PARTICLES;
      if (active < MAX_TRAIL_PARTICLES) active++;
    },
    activeCount: () => active,
    step(dt) {
      // Decay life; we do not allocate per tick.
      let stillActive = 0;
      for (const p of pool) {
        if (p.life > 0) {
          p.life -= dt * 0.05;
          if (p.life > 0) stillActive++;
        }
      }
      active = stillActive;
    },
    clear() {
      for (const p of pool) p.life = 0;
      active = 0;
    },
  };
}

export interface OscillationControl {
  pause: () => void;
  resume: () => void;
  kill: () => void;
}

/** Slow horizontal yoyo on the planet sprite. */
export function startPlanetOscillation(
  sprite: { x: number },
  opts: { range: number; speed: number },
): OscillationControl {
  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  tl.to(sprite, { x: sprite.x + opts.range, duration: Math.max(0.1, 1 / opts.speed) });
  return {
    pause: () => tl.pause?.(),
    resume: () => tl.resume?.(),
    kill: () => tl.kill?.(),
  };
}

/** HUD text pop — scale 1.15 → 1.0 in 100ms. */
export function hudPop(node: { scale?: { set?: (n: number) => void } }): void {
  // Caller passes the Pixi Text.scale (object with `.set`). GSAP to() handles
  // the tween via the pixi plugin or via direct scale.x/y mutation.
  gsap.to(node, {
    pixi: { scale: 1.15 },
    duration: 0.05,
    yoyo: true,
    repeat: 1,
    ease: 'power2.out',
    overwrite: 'auto',
  });
}
