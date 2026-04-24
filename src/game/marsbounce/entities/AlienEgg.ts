/**
 * AlienEgg — target entity. Colors encode HP and behavior:
 *   - green (1 HP)  — intro / levels 1–5
 *   - purple (2 HP) — introduced at level 6
 *   - orange (3 HP, explodes) — introduced at level 20
 *
 * Render glyph: 🥚 with tint + outline for color cue.
 */

export const ALIEN_EGG_GLYPH = '🥚';
export const ALIEN_EGG_DEFAULT_RADIUS = 22;
export const ALIEN_EGG_BASE_SCORE = 200;

export const EGG_COLOR_TINTS = {
  green: 0x66dd66,
  purple: 0xbb66dd,
  orange: 0xffaa44,
} as const;

export type { AlienEggSpec, EggColor } from './index';
export { spawnAlienEgg } from './index';
