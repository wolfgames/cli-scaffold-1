/**
 * levelGenerator — procedural level generation for levels beyond the
 * hand-crafted tutorial zone (> 10). Pure: takes a seed, produces config.
 *
 * Deferred scope: the full generator lives on a later integration pass;
 * for the core pass we expose the seed machinery and a thin factory that
 * wraps hand-crafted fallback. This keeps solver/difficulty tests aligned
 * with what's shipped without shipping a half-built procgen.
 */

import { seedForLevel } from './seededRng';
import { difficultyForLevel, ZONE_SIZE } from './difficultyParams';
import type { LevelConfig } from './levelLoader';

export { ZONE_SIZE } from './difficultyParams';

/** Derive the zone/chapter number from a level number. */
export function zoneForLevel(levelNumber: number): number {
  return difficultyForLevel(levelNumber).zone;
}

/** True if `levelNumber` is the first level of a new chapter. */
export function isZoneBoundary(levelNumber: number): boolean {
  return (levelNumber - 1) % ZONE_SIZE === 0 && levelNumber > 1;
}

export interface GenerateArgs {
  levelNumber: number;
  template: LevelConfig; // a hand-crafted seed we remix for higher levels
}

/**
 * Produce a level config for levelNumber > 10. Deterministic from seed.
 * Current implementation: returns the template verbatim (procgen deferred).
 */
export function generateLevel({ levelNumber, template }: GenerateArgs): LevelConfig {
  const _seed = seedForLevel(levelNumber);
  void _seed;
  return { ...template, levelNumber };
}
