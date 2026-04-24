/**
 * AlienPlanet — optional chapter-boss entity. Oscillates horizontally when idle.
 * Worth extra score; destroying it triggers a screen-edge flash (batch 5).
 *
 * Render glyph: 🪐.
 */

export const ALIEN_PLANET_GLYPH = '🪐';
export const ALIEN_PLANET_DEFAULT_RADIUS = 32;
export const ALIEN_PLANET_SCORE = 1000;

export type { AlienPlanetSpec } from './index';
export { spawnAlienPlanet } from './index';
