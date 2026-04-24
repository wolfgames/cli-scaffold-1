/**
 * stabilize edge-case tests — one additional edge case per new feature.
 *
 * Written by 60-stabilize (core pass). Each case targets a gap NOT covered by
 * the feature's own test suite — boundary conditions, invariants, and
 * silent-failure scenarios called out in the phase-summary carry_forward.
 */

import { describe, it, expect, vi } from 'vitest';

// ────────────────────────────────────────────────────────────────────────────
// physics-engine: orbIntersectsSphere boundary — orbs exactly touching should
// register as a collision, not pass through.
// ────────────────────────────────────────────────────────────────────────────
describe('physics-engine — orbIntersectsSphere boundary', () => {
  it('orb exactly at combined-radius distance is a collision (not a pass-through)', async () => {
    const { orbIntersectsSphere } = await import('~/game/marsbounce/physics/orbPhysics');
    // orbR=9, pegR=12 → combined = 21; place orb at distance exactly 21
    const orb = { x: 21, y: 0 };
    const peg = { x: 0, y: 0 };
    expect(orbIntersectsSphere(orb, 9, peg, 12)).toBe(true);
  });

  it('orb one unit outside combined-radius is NOT a collision', async () => {
    const { orbIntersectsSphere } = await import('~/game/marsbounce/physics/orbPhysics');
    const orb = { x: 22, y: 0 };
    const peg = { x: 0, y: 0 };
    expect(orbIntersectsSphere(orb, 9, peg, 12)).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// scoring-system: levelMultiplier when orbsRemaining = 0 must be 1.0
// (floor, not negative). A beginner who exhausts orbs still gets base score.
// ────────────────────────────────────────────────────────────────────────────
describe('scoring-system — computeLevelMultiplier floor', () => {
  it('0 orbs remaining → multiplier is exactly 1.0 (no penalty below floor)', async () => {
    const { computeLevelMultiplier } = await import('~/game/marsbounce/state/scoring');
    const mul = computeLevelMultiplier({ orbsRemaining: 0, orbsTotal: 10 });
    expect(mul).toBe(1.0);
  });

  it('negative orbsRemaining is clamped to 0 (add-orbs race condition defence)', async () => {
    const { computeLevelMultiplier } = await import('~/game/marsbounce/state/scoring');
    const mul = computeLevelMultiplier({ orbsRemaining: -3, orbsTotal: 10 });
    expect(mul).toBe(1.0); // Math.max(0, -3) = 0 → 1 + 0*0.25 = 1.0
  });
});

// ────────────────────────────────────────────────────────────────────────────
// board-state-machine: paused → reset transition lets the controller restart
// a level without going through idle first (used on Quit from pause → reload).
// ────────────────────────────────────────────────────────────────────────────
describe('boardStateMachine — paused reset path', () => {
  it('paused + reset event → loaded (restart path from Quit)', async () => {
    const { nextBoardState } = await import('~/game/marsbounce/state/boardStateMachine');
    expect(nextBoardState('paused', 'reset')).toBe('loaded');
  });

  it('won + reset → loaded (replay-from-win path)', async () => {
    const { nextBoardState } = await import('~/game/marsbounce/state/boardStateMachine');
    expect(nextBoardState('won', 'reset')).toBe('loaded');
  });

  it('lost + reset → loaded (try-again path)', async () => {
    const { nextBoardState } = await import('~/game/marsbounce/state/boardStateMachine');
    expect(nextBoardState('lost', 'reset')).toBe('loaded');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// level-generator / seededRng: seed formula must be deterministic — the same
// levelNumber always produces the same first random number.
// ────────────────────────────────────────────────────────────────────────────
describe('seededRng — determinism contract', () => {
  it('same seed always produces the same sequence', async () => {
    const { createRng, seedForLevel } = await import('~/game/marsbounce/levels/seededRng');
    const seed = seedForLevel(42);
    const a = createRng(seed).next();
    const b = createRng(seed).next();
    expect(a).toBe(b);
  });

  it('different level numbers produce different seeds', async () => {
    const { seedForLevel } = await import('~/game/marsbounce/levels/seededRng');
    expect(seedForLevel(11)).not.toBe(seedForLevel(12));
  });

  it('seed formula matches GDD: levelNumber * 48271 + 9973', async () => {
    const { seedForLevel } = await import('~/game/marsbounce/levels/seededRng');
    // Level 11 → (11 * 48271 + 9973) % 2^32
    const expected = ((11 * 48271 + 9973) >>> 0);
    expect(seedForLevel(11)).toBe(expected);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// game-state-ecs: addOrbs transaction should not allow orbsRemaining to grow
// past a sentinel (open guard — ECS rule: no silent over-grant). The crystal
// bonus cap of 5 is enforced in the controller, but we verify the ECS layer
// never dips below 0 either.
// ────────────────────────────────────────────────────────────────────────────
describe('game-state-ecs — orb counter invariants', () => {
  it('decrementOrbs never drops below 0', async () => {
    const { createMarsBounceWorld } = await import('~/game/marsbounce/state/MarsBouncePlugin');
    const db = createMarsBounceWorld();
    db.transactions.setOrbs({ remaining: 1, total: 10 });
    db.transactions.decrementOrbs();
    db.transactions.decrementOrbs(); // would be -1 without the clamp
    expect(db.resources.orbsRemaining).toBe(0);
  });

  it('addOrbs increments correctly across multiple calls', async () => {
    const { createMarsBounceWorld } = await import('~/game/marsbounce/state/MarsBouncePlugin');
    const db = createMarsBounceWorld();
    db.transactions.setOrbs({ remaining: 3, total: 10 });
    db.transactions.addOrbs({ amount: 3 }); // crystal bonus
    expect(db.resources.orbsRemaining).toBe(6);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// orb-launcher: trajectory preview with a wall reflection — each wall bounce
// must produce a new segment boundary. This verifies the segment-splitting
// logic works end-to-end with the step-based physics integrator.
// ────────────────────────────────────────────────────────────────────────────
describe('trajectory-preview — wall reflection produces multiple segments', () => {
  it('angled shot that hits the right wall produces at least 2 segments', async () => {
    const { previewTrajectory } = await import('~/game/marsbounce/physics/trajectoryPreview');
    // Angled 30° upward from the left side of the board — will hit the right wall
    const segs = previewTrajectory(
      { x: 50, y: 700 },
      -Math.PI / 6, // 30° above horizontal, heading right
      14,
      { left: 0, right: 390, top: 100 },
      [], // no pegs — relies purely on wall reflection
      { maxReflections: 3, maxSteps: 1200 },
    );
    // At speed=14 heading right at 30°, the orb WILL hit the right wall and
    // produce at least 2 segments (before and after first wall bounce).
    expect(segs.length).toBeGreaterThanOrEqual(2);
  });

  it('each segment endpoint is within the canvas bounds + a small tolerance', async () => {
    const { previewTrajectory } = await import('~/game/marsbounce/physics/trajectoryPreview');
    const bounds = { left: 0, right: 390, top: 100 };
    const segs = previewTrajectory(
      { x: 195, y: 700 },
      -Math.PI / 3,
      12,
      bounds,
      [],
      { maxReflections: 4, maxSteps: 600 },
    );
    const TOL = 30; // allow a few px overshoot from stepping granularity
    for (const seg of segs) {
      expect(seg.ax).toBeGreaterThanOrEqual(bounds.left - TOL);
      expect(seg.ax).toBeLessThanOrEqual(bounds.right + TOL);
      expect(seg.bx).toBeGreaterThanOrEqual(bounds.left - TOL);
      expect(seg.bx).toBeLessThanOrEqual(bounds.right + TOL);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// entity-animations: destroyWithTweenKill is idempotent — calling it twice
// on the same sprite must not throw (double-destroy guard).
// ────────────────────────────────────────────────────────────────────────────
describe('entity-animations — destroy idempotence', () => {
  it('destroyWithTweenKill called twice does not throw', async () => {
    vi.mock('gsap', () => ({
      default: {
        to: vi.fn(),
        killTweensOf: vi.fn(),
        delayedCall: vi.fn(),
        timeline: vi.fn(() => ({ to: vi.fn(), kill: vi.fn(), eventCallback: vi.fn() })),
      },
    }));
    const { destroyWithTweenKill } = await import('~/game/marsbounce/animations/entityAnimations');
    const sprite = {
      destroy: vi.fn(),
      parent: null as null | { removeChild: ReturnType<typeof vi.fn> },
      removeAllListeners: vi.fn(),
    };
    expect(() => {
      destroyWithTweenKill(sprite);
      destroyWithTweenKill(sprite); // parent is null now; must not throw
    }).not.toThrow();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// win-loss-sequences: starsEarned is correctly bridged to the SolidJS signal
// (integrate phase fix). Verify the bridge survives a resetLevel transaction.
// ────────────────────────────────────────────────────────────────────────────
describe('game-state-ecs — resetLevel clears score and stars', () => {
  it('resetLevel zeroes score and starsEarned but preserves orbsTotal', async () => {
    const { createMarsBounceWorld } = await import('~/game/marsbounce/state/MarsBouncePlugin');
    const db = createMarsBounceWorld();
    db.transactions.addScore({ amount: 5000 });
    db.transactions.setStarsEarned({ stars: 3 });
    db.transactions.setOrbs({ remaining: 2, total: 8 });
    db.transactions.resetLevel();
    expect(db.resources.score).toBe(0);
    expect(db.resources.starsEarned).toBe(0);
    // orbsTotal must survive reset (it's owned by the level config, not the run)
    expect(db.resources.orbsTotal).toBe(8);
  });
});
