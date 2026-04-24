/**
 * orbPhysics — pure physics step/collision tests
 *
 * These are pure-math, deterministic tests. No Pixi, no DOM, no ECS.
 */

import { describe, it, expect } from 'vitest';
import { stepOrb, reflectWall, reflectSphere, GRAVITY } from '~/game/marsbounce/physics/orbPhysics';

describe('orbPhysics — step and collision', () => {
  it('orb launched at 45 degrees with initial velocity', () => {
    // Given: an orb launched at 45 degrees with initial velocity
    const angleRad = -Math.PI / 4; // 45° upward (negative y = up)
    const speed = 10;
    const orb = {
      x: 100,
      y: 100,
      vx: Math.cos(angleRad) * speed,
      vy: Math.sin(angleRad) * speed,
    };

    // Should: stepOrb returns updated position with gravity applied (y increases each tick)
    const before = { ...orb };
    const next = stepOrb(orb, 1);

    expect(next.x).toBeGreaterThan(before.x); // moved right
    // vy should have gained gravity (become less negative, then positive)
    expect(next.vy).toBeGreaterThan(before.vy);
    // The increase must match the gravity constant for a single tick
    expect(next.vy - before.vy).toBeCloseTo(GRAVITY, 5);
  });

  it('orb traveling toward a wall', () => {
    // Given: an orb traveling toward a wall (vertical wall, normal along +x)
    const orb = { x: 10, y: 50, vx: -5, vy: 3 };
    const wallNormal = { x: 1, y: 0 };

    // Should: reflectWall returns velocity with angle of incidence = angle of reflection
    const reflected = reflectWall(orb, wallNormal);

    expect(reflected.vx).toBeCloseTo(5, 5); // sign flipped
    expect(reflected.vy).toBeCloseTo(3, 5); // unchanged tangential component
  });

  it('orb colliding with a sphere (peg) reflects along hit normal', () => {
    // Given: orb moving rightward hitting a peg; normal points leftward (from peg to orb? orb to peg?)
    // Convention: normal points from the peg center to the orb position at impact.
    const orb = { x: 0, y: 0, vx: 5, vy: 0 };
    const hitNormal = { x: -1, y: 0 }; // orb approaching peg from the left — normal faces back at orb

    const reflected = reflectSphere(orb, hitNormal);

    // vx should flip sign
    expect(reflected.vx).toBeCloseTo(-5, 5);
    expect(reflected.vy).toBeCloseTo(0, 5);
  });
});
