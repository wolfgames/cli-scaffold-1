/**
 * scoring — multiplicative formula + star rating tests.
 */

import { describe, it, expect } from 'vitest';
import {
  computeShotScore,
  computeLevelMultiplier,
  computeStars,
  RICOCHET_BASE,
  RICOCHET_MULT,
  EGG_HIT_SCORE,
  SINGLE_SHOT_BONUS,
  CRYSTAL_BONUS,
  TWO_STAR_THRESHOLD,
  THREE_STAR_THRESHOLD,
} from '~/game/marsbounce/state/scoring';

describe('scoring — multiplicative formula', () => {
  it('orb hits egg with 1 HP after 2 ricochets', () => {
    // (1 * 200) + (1.4^2 * 50) = 200 + 98 = 298 (before remainingOrbMul/singleShotBonus)
    const shot = computeShotScore({
      eggHpDestroyed: 1,
      ricochetCount: 2,
      targetsHitThisShot: 1,
      crystalsCollected: 0,
    });
    const expected = 1 * EGG_HIT_SCORE + Math.pow(RICOCHET_MULT, 2) * RICOCHET_BASE;
    expect(shot).toBeCloseTo(expected, 5);
    expect(shot).toBeCloseTo(298, 0);
  });

  it('single shot hits 3+ distinct targets → singleShotBonus added', () => {
    const shot = computeShotScore({
      eggHpDestroyed: 3,
      ricochetCount: 0,
      targetsHitThisShot: 3,
      crystalsCollected: 0,
    });
    expect(shot).toBeCloseTo(3 * EGG_HIT_SCORE + SINGLE_SHOT_BONUS, 5);
  });

  it('orb collects crystal → crystalBonus added', () => {
    const shot = computeShotScore({
      eggHpDestroyed: 0,
      ricochetCount: 0,
      targetsHitThisShot: 0,
      crystalsCollected: 1,
    });
    expect(shot).toBe(CRYSTAL_BONUS);
  });

  it('level cleared with 4 of 8 orbs remaining (50%) → remainingOrbMul = 2.0', () => {
    const mul = computeLevelMultiplier({ orbsRemaining: 4, orbsTotal: 8 });
    expect(mul).toBeCloseTo(2.0, 5);
  });
});

describe('star-rating — threshold logic', () => {
  it('level cleared with 0 orbs remaining → starsEarned = 1', () => {
    expect(computeStars({ orbsRemaining: 0, orbsTotal: 10 })).toBe(1);
  });

  it('level cleared with orbsRemaining >= 40% of orbsTotal → starsEarned = 2', () => {
    expect(computeStars({ orbsRemaining: 4, orbsTotal: 10 })).toBe(2);
    expect(computeStars({ orbsRemaining: 5, orbsTotal: 10 })).toBe(2);
  });

  it('level cleared with orbsRemaining >= 66% of orbsTotal → starsEarned = 3', () => {
    expect(computeStars({ orbsRemaining: 7, orbsTotal: 10 })).toBe(3);
    expect(computeStars({ orbsRemaining: 10, orbsTotal: 10 })).toBe(3);
  });

  it('threshold constants match OQ-001', () => {
    expect(TWO_STAR_THRESHOLD).toBe(0.4);
    expect(THREE_STAR_THRESHOLD).toBe(0.66);
  });

  it('starsEarned writes through MarsBouncePlugin transaction', async () => {
    const { createMarsBounceWorld } = await import('~/game/marsbounce/state/MarsBouncePlugin');
    const db = createMarsBounceWorld();
    db.transactions.setStarsEarned({ stars: 3 });
    expect(db.resources.starsEarned).toBe(3);
  });

  it('checkWinLose writes starsEarned + boardState on clear', async () => {
    const { createMarsBounceWorld } = await import('~/game/marsbounce/state/MarsBouncePlugin');
    const { checkWinLose } = await import('~/game/marsbounce/state/scoringActions');
    const db = createMarsBounceWorld();
    db.transactions.setOrbs({ remaining: 7, total: 10 });
    const outcome = checkWinLose(db, { eggsRemaining: 0 });
    expect(outcome).toBe('won');
    expect(db.resources.starsEarned).toBe(3);
    expect(db.resources.boardState).toBe('won');
  });

  it('checkWinLose marks lost when orbs exhausted with eggs remaining', async () => {
    const { createMarsBounceWorld } = await import('~/game/marsbounce/state/MarsBouncePlugin');
    const { checkWinLose } = await import('~/game/marsbounce/state/scoringActions');
    const db = createMarsBounceWorld();
    db.transactions.setOrbs({ remaining: 0, total: 10 });
    const outcome = checkWinLose(db, { eggsRemaining: 2 });
    expect(outcome).toBe('lost');
    expect(db.resources.boardState).toBe('lost');
  });
});
