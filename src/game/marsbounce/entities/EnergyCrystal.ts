/**
 * EnergyCrystal — collectible bonus entity.
 *
 * Orb collecting a crystal triggers:
 *   - +50 score bonus per crystal (scoring.ts: crystalBonus)
 *   - +1 bonus orb to orbsRemaining
 *   - 150ms sparkle animation (batch 5)
 *
 * Render glyph: 💎.
 */

export const ENERGY_CRYSTAL_GLYPH = '💎';
export const ENERGY_CRYSTAL_DEFAULT_RADIUS = 10;
export const ENERGY_CRYSTAL_BONUS = 50;
export const ENERGY_CRYSTAL_BONUS_ORBS = 1;

export type { EnergyCrystalSpec } from './index';
export { spawnEnergyCrystal } from './index';
