/**
 * orbPhysics — pure physics for the Mars Bounce orb
 *
 * Guardrails:
 *   - NO Pixi imports (pure logic only)
 *   - NO Math.random — deterministic from inputs
 *   - NO DOM — used from both game loop and headless solver
 *
 * Units are abstract "world" units. Gravity is expressed per integration tick
 * (deltaTime = 1). Callers scale with their own `dt`.
 */

/** Downward gravity applied per unit of deltaTime (positive y = down). */
export const GRAVITY = 0.3;

/** Coefficient of restitution on collisions (1.0 = perfectly elastic). */
export const RESTITUTION = 1.0;

/** Minimum speed — below this an orb is considered "stalled". */
export const MIN_SPEED = 0.05;

export interface OrbState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Vec2Like {
  x: number;
  y: number;
}

/**
 * Advance an orb by `dt` ticks of integration. Returns a fresh state —
 * does not mutate the input.
 */
export function stepOrb(orb: OrbState, dt: number): OrbState {
  const vy = orb.vy + GRAVITY * dt;
  return {
    x: orb.x + orb.vx * dt,
    y: orb.y + vy * dt,
    vx: orb.vx,
    vy,
  };
}

/**
 * Reflect velocity about a wall normal. `normal` must point away from the wall
 * back toward the orb (i.e. out of the solid surface). Returns a fresh state.
 *
 * Formula: v' = v - 2 * (v · n) * n  (where n is unit normal)
 */
export function reflectWall(orb: OrbState, normal: Vec2Like): OrbState {
  const n = normalize(normal);
  const dot = orb.vx * n.x + orb.vy * n.y;
  return {
    x: orb.x,
    y: orb.y,
    vx: (orb.vx - 2 * dot * n.x) * RESTITUTION,
    vy: (orb.vy - 2 * dot * n.y) * RESTITUTION,
  };
}

/**
 * Reflect velocity on sphere collision. `hitNormal` points from the peg center
 * toward the orb position at the moment of impact — same formula as reflectWall
 * for the velocity component, but the name documents the caller's intent.
 */
export function reflectSphere(orb: OrbState, hitNormal: Vec2Like): OrbState {
  return reflectWall(orb, hitNormal);
}

/**
 * Return the hit normal for a sphere (peg) of radius `pegR` centered at
 * `peg` that the orb (radius `orbR`) just touched. Normal points from peg
 * to orb.
 */
export function sphereHitNormal(orb: Vec2Like, peg: Vec2Like): Vec2Like {
  return normalize({ x: orb.x - peg.x, y: orb.y - peg.y });
}

/**
 * Detect whether an orb overlaps a peg given their radii. Used by the
 * collision scan each tick — no state mutations.
 */
export function orbIntersectsSphere(
  orb: Vec2Like,
  orbR: number,
  peg: Vec2Like,
  pegR: number,
): boolean {
  const dx = orb.x - peg.x;
  const dy = orb.y - peg.y;
  const r = orbR + pegR;
  return dx * dx + dy * dy <= r * r;
}

/** Unit-length copy of `v`. Zero vector maps to (0, 0). */
function normalize(v: Vec2Like): Vec2Like {
  const len = Math.hypot(v.x, v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}
