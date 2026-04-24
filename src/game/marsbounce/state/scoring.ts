/**
 * scoring — pure score formula + star rating.
 *
 * Formula (from GDD, echoed by implementation plan):
 *   shotScore = (eggHp * EGG_HIT_SCORE)
 *             + (RICOCHET_MULT^ricochetCount * RICOCHET_BASE)
 *             + (targetsHitThisShot >= 3 ? SINGLE_SHOT_BONUS : 0)
 *             + (crystalsCollected * CRYSTAL_BONUS)
 *
 *   levelMultiplier = 1 + (orbsRemaining / orbsTotal) * 4  (so 50% remaining = 2x)
 *
 *   finalLevelScore = sum(shotScores) * levelMultiplier
 *
 * Star thresholds (OQ-001):
 *   1 star — any clear
 *   2 stars — orbsRemaining / orbsTotal >= 0.40
 *   3 stars — orbsRemaining / orbsTotal >= 0.66
 */

export const EGG_HIT_SCORE = 200;
export const RICOCHET_BASE = 50;
export const RICOCHET_MULT = 1.4;
export const SINGLE_SHOT_BONUS = 1000;
export const CRYSTAL_BONUS = 50;

export const TWO_STAR_THRESHOLD = 0.4;
export const THREE_STAR_THRESHOLD = 0.66;

export interface ShotInput {
  eggHpDestroyed: number;
  ricochetCount: number;
  targetsHitThisShot: number;
  crystalsCollected: number;
}

export interface LevelInput {
  orbsRemaining: number;
  orbsTotal: number;
}

export function computeShotScore(s: ShotInput): number {
  let score = s.eggHpDestroyed * EGG_HIT_SCORE;
  if (s.ricochetCount > 0) {
    score += Math.pow(RICOCHET_MULT, s.ricochetCount) * RICOCHET_BASE;
  }
  if (s.targetsHitThisShot >= 3) {
    score += SINGLE_SHOT_BONUS;
  }
  score += s.crystalsCollected * CRYSTAL_BONUS;
  return score;
}

/**
 * Level multiplier — rewards efficiency.
 *
 * From the plan's worked example: 4 of 8 orbs remaining → `1 + 4*0.25 = 2.0`.
 * Interpretation: coefficient is `0.25` per unused orb, absolute (not ratio).
 * Note: `orbsTotal` still matters for the star formula — only the multiplier
 * is absolute. Caller is responsible for using this only when the level
 * clears (egg count reaches 0).
 */
export const REMAINING_ORB_COEFFICIENT = 0.25;

export function computeLevelMultiplier({ orbsRemaining }: LevelInput): number {
  return 1 + Math.max(0, orbsRemaining) * REMAINING_ORB_COEFFICIENT;
}

export function computeStars({ orbsRemaining, orbsTotal }: LevelInput): number {
  if (orbsTotal <= 0) return 1;
  const ratio = orbsRemaining / orbsTotal;
  if (ratio >= THREE_STAR_THRESHOLD) return 3;
  if (ratio >= TWO_STAR_THRESHOLD) return 2;
  return 1;
}
