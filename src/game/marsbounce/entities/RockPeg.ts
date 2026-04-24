/**
 * RockPeg — rock obstacle.
 *
 * Orbs bounce off rock pegs. Pegs do not take damage. Color: neutral
 * (brown/gray). Render glyph: 🪨.
 */

export const ROCK_PEG_GLYPH = '🪨';
export const ROCK_PEG_DEFAULT_RADIUS = 14;
export const ROCK_PEG_SCORE = 0;

export type { RockPegSpec } from './index';
export { spawnRockPeg } from './index';
