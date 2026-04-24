/**
 * scoringActions — controller-facing action helpers that bind the pure
 * scoring formulas to the ECS transactions.
 *
 * Actions as a first-class @adobe/data feature would require adding an
 * `actions` section to the plugin (between `computed` and `systems`).
 * For this pass we provide thin helper functions that orchestrate
 * transactions in the order the plan prescribes:
 *   orbHitsEgg, orbHitsPlanet, orbCollectsCrystal → addScore
 *   checkWinLose → setStarsEarned + setBoardState
 */

import type { MarsBounceDatabase } from './MarsBouncePlugin';
import {
  computeShotScore,
  computeLevelMultiplier,
  computeStars,
} from './scoring';

export function orbHitsEgg(
  db: MarsBounceDatabase,
  args: {
    eggHpDestroyed: number;
    ricochetCount: number;
    targetsHitThisShot: number;
  },
): number {
  const score = computeShotScore({
    eggHpDestroyed: args.eggHpDestroyed,
    ricochetCount: args.ricochetCount,
    targetsHitThisShot: args.targetsHitThisShot,
    crystalsCollected: 0,
  });
  db.transactions.addScore({ amount: score });
  db.transactions.recordShot({ score, ricochets: args.ricochetCount });
  return score;
}

export function orbHitsPlanet(
  db: MarsBounceDatabase,
  args: { ricochetCount: number },
): number {
  // Planet destruction rewards the SINGLE_SHOT_BONUS path implicitly via
  // ricochet scaling; the caller passes the ricochet count accumulated.
  const score = computeShotScore({
    eggHpDestroyed: 0,
    ricochetCount: args.ricochetCount,
    targetsHitThisShot: 1,
    crystalsCollected: 0,
  }) + 1000; // planet flat bonus
  db.transactions.addScore({ amount: score });
  return score;
}

export function orbCollectsCrystal(db: MarsBounceDatabase): number {
  const score = computeShotScore({
    eggHpDestroyed: 0,
    ricochetCount: 0,
    targetsHitThisShot: 0,
    crystalsCollected: 1,
  });
  db.transactions.addScore({ amount: score });
  db.transactions.addOrbs({ amount: 1 }); // crystal grants a bonus orb
  return score;
}

export function checkWinLose(
  db: MarsBounceDatabase,
  args: { eggsRemaining: number },
): 'won' | 'lost' | 'idle' {
  const { orbsRemaining, orbsTotal } = db.resources;
  if (args.eggsRemaining === 0) {
    const mul = computeLevelMultiplier({ orbsRemaining, orbsTotal });
    const currentScore = db.resources.score;
    db.transactions.setScore({ value: Math.round(currentScore * mul) });
    const stars = computeStars({ orbsRemaining, orbsTotal });
    db.transactions.setStarsEarned({ stars });
    db.transactions.setBoardState({ state: 'won' });
    return 'won';
  }
  if (orbsRemaining <= 0 && args.eggsRemaining > 0) {
    db.transactions.setStarsEarned({ stars: 0 });
    db.transactions.setBoardState({ state: 'lost' });
    return 'lost';
  }
  return 'idle';
}
