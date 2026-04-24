/**
 * trajectoryPreview — raycasting simulation tests.
 */

import { describe, it, expect } from 'vitest';
import { previewTrajectory } from '~/game/marsbounce/physics/trajectoryPreview';

describe('trajectoryPreview — raycasting', () => {
  it('player begins dragging from launcher → returns line segments', () => {
    const segments = previewTrajectory(
      { x: 195, y: 700 }, // launch origin (bottom-center of 390x844)
      -Math.PI / 3, // 60° upward
      10, // speed
      { left: 0, right: 390, top: 100 },
      [], // no pegs
      { maxReflections: 4, maxSteps: 400 },
    );

    // At least 1 segment (until wall hit or max steps)
    expect(segments.length).toBeGreaterThan(0);
    expect(segments[0]).toMatchObject({
      ax: expect.any(Number),
      ay: expect.any(Number),
      bx: expect.any(Number),
      by: expect.any(Number),
    });
  });

  it('trajectory caps at maxReflections', () => {
    const segments = previewTrajectory(
      { x: 195, y: 700 },
      -Math.PI / 3,
      15,
      { left: 0, right: 390, top: 100 },
      [],
      { maxReflections: 2, maxSteps: 2000 },
    );
    expect(segments.length).toBeLessThanOrEqual(3); // up to (maxReflections+1) segments
  });

  it('returns empty when speed is zero', () => {
    const segments = previewTrajectory(
      { x: 195, y: 700 },
      -Math.PI / 3,
      0,
      { left: 0, right: 390, top: 100 },
      [],
      { maxReflections: 4, maxSteps: 400 },
    );
    expect(segments.length).toBe(0);
  });
});
