/**
 * collisionDetection — broadphase + narrowphase queries for orb vs entities.
 *
 * Pure logic. No Pixi, no ECS direct access. Callers pass raw arrays of
 * { x, y, r, id } and receive hit results keyed by id.
 */

import { orbIntersectsSphere, sphereHitNormal, type Vec2Like, type OrbState } from './orbPhysics';

export interface Circle {
  id: number;
  x: number;
  y: number;
  r: number;
}

export interface CircleHit {
  id: number;
  normal: Vec2Like;
}

/** First circle hit by the orb this tick, or null. */
export function firstCircleHit(
  orb: OrbState,
  orbR: number,
  circles: readonly Circle[],
): CircleHit | null {
  for (const c of circles) {
    if (orbIntersectsSphere(orb, orbR, c, c.r)) {
      return { id: c.id, normal: sphereHitNormal(orb, c) };
    }
  }
  return null;
}

/** True if the orb has passed through a vertical wall at x=boundX. */
export function hitsVerticalWall(orb: OrbState, orbR: number, boundX: number, side: 'left' | 'right'): boolean {
  if (side === 'left') return orb.x - orbR <= boundX;
  return orb.x + orbR >= boundX;
}

/** True if the orb has passed through a horizontal ceiling at y=boundY. */
export function hitsHorizontalWall(orb: OrbState, orbR: number, boundY: number): boolean {
  return orb.y - orbR <= boundY;
}

/** True if the orb has dropped below the play area floor. */
export function belowFloor(orb: OrbState, floorY: number): boolean {
  return orb.y > floorY;
}
