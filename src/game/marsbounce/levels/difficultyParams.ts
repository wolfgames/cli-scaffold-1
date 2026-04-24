/**
 * difficultyParams — derives per-level difficulty knobs from levelNumber.
 *
 * Pure function. Used by the level generator for procedural levels and by
 * the solver to cap search budget.
 */

export const ZONE_SIZE = 10; // OQ-002: 10 levels per chapter/zone.

export interface DifficultyParams {
  zone: number;
  orbsTotal: number;
  eggCount: number;
  introducesPurpleEggs: boolean;
  introducesOrangeEggs: boolean;
  allowsPlanet: boolean;
  solverSamples: number;
}

export function difficultyForLevel(levelNumber: number): DifficultyParams {
  const zone = Math.floor((levelNumber - 1) / ZONE_SIZE) + 1;

  // Orbs shrink slowly as levels rise.
  const orbsTotal = Math.max(6, 10 - Math.floor((levelNumber - 1) / 10));
  const eggCount = Math.min(10, 4 + Math.floor((levelNumber - 1) / 3));

  return {
    zone,
    orbsTotal,
    eggCount,
    introducesPurpleEggs: levelNumber >= 6,
    introducesOrangeEggs: levelNumber >= 20,
    allowsPlanet: levelNumber >= 6,
    solverSamples: 500,
  };
}
