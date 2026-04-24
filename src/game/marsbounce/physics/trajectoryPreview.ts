/**
 * trajectoryPreview — raycasting simulation of the orb path for aim preview.
 *
 * Pure function. Takes the current launch origin, angle, speed, board bounds,
 * and obstacle list; returns an array of line segments approximating the orb's
 * path for up to `maxReflections` bounces.
 *
 * Renderer consumes the segments. No Pixi imports here.
 */

import {
  stepOrb,
  reflectWall,
  reflectSphere,
  orbIntersectsSphere,
  sphereHitNormal,
  type OrbState,
  type Vec2Like,
} from './orbPhysics';

export interface PreviewBounds {
  left: number;
  right: number;
  top: number;
}

export interface PreviewCircle {
  x: number;
  y: number;
  r: number;
}

export interface PreviewOptions {
  maxReflections: number;
  maxSteps: number;
  orbRadius?: number;
  dt?: number;
}

export interface Segment {
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

const DEFAULT_RADIUS = 6;
const DEFAULT_DT = 1;

/** Raycast the orb trajectory and return line segments for each straight run between bounces. */
export function previewTrajectory(
  origin: Vec2Like,
  angleRad: number,
  speed: number,
  bounds: PreviewBounds,
  obstacles: readonly PreviewCircle[],
  opts: PreviewOptions,
): Segment[] {
  if (speed <= 0) return [];

  const dt = opts.dt ?? DEFAULT_DT;
  const r = opts.orbRadius ?? DEFAULT_RADIUS;
  const segments: Segment[] = [];

  let orb: OrbState = {
    x: origin.x,
    y: origin.y,
    vx: Math.cos(angleRad) * speed,
    vy: Math.sin(angleRad) * speed,
  };

  let segStart = { x: orb.x, y: orb.y };
  let reflectionsLeft = opts.maxReflections;

  for (let step = 0; step < opts.maxSteps; step++) {
    const next = stepOrb(orb, dt);

    // Bounds checks — reflect off left / right / top walls.
    let reflected: OrbState | null = null;
    if (next.x - r <= bounds.left) {
      reflected = reflectWall(next, { x: 1, y: 0 });
    } else if (next.x + r >= bounds.right) {
      reflected = reflectWall(next, { x: -1, y: 0 });
    } else if (next.y - r <= bounds.top) {
      reflected = reflectWall(next, { x: 0, y: 1 });
    }

    // Circle obstacles — first hit wins.
    if (!reflected) {
      for (const c of obstacles) {
        if (orbIntersectsSphere(next, r, c, c.r)) {
          const normal = sphereHitNormal(next, c);
          reflected = reflectSphere(next, normal);
          break;
        }
      }
    }

    if (reflected) {
      segments.push({ ax: segStart.x, ay: segStart.y, bx: next.x, by: next.y });
      segStart = { x: next.x, y: next.y };
      orb = reflected;
      reflectionsLeft--;
      if (reflectionsLeft < 0) break;
      continue;
    }

    orb = next;

    // Out-of-bounds bottom — stop.
    if (orb.y > bounds.top + 2000) {
      segments.push({ ax: segStart.x, ay: segStart.y, bx: orb.x, by: orb.y });
      break;
    }
  }

  // Close out an open segment if we hit step cap without bouncing.
  if (segments.length === 0 || segments[segments.length - 1].bx !== orb.x) {
    segments.push({ ax: segStart.x, ay: segStart.y, bx: orb.x, by: orb.y });
  }

  return segments;
}
