/**
 * levelLoader — load a level config by number.
 *
 * Flow (with fallback chain):
 *   1. Hand-crafted JSON for levels 1–10 via static JSON import.
 *   2. Procedural generation for 11+ (batch owns `levelGenerator.ts`).
 *   3. fallback-pool.json if anything above throws.
 *   4. Warn via `console.warn` (Sentry replaces this in later integrate step).
 *
 * Pure functions for `parseLevel`. `loadLevel` is async — JSON modules are
 * resolved via dynamic `import()` so static Vite bundles include them.
 */

import fallbackJson from '../data/levels/fallback-pool.json';

export interface LevelPeg {
  x: number;
  y: number;
  radius: number;
}

export interface LevelEgg {
  x: number;
  y: number;
  radius: number;
  hp: number;
  color: 'green' | 'purple' | 'orange';
}

export interface LevelCrystal {
  x: number;
  y: number;
  radius: number;
}

export interface LevelPlanet {
  x: number;
  y: number;
  radius: number;
  hp: number;
  oscillationRange: number;
  oscillationSpeed: number;
}

export interface LevelConfig {
  levelNumber: number;
  orbsTotal: number;
  pegs: LevelPeg[];
  eggs: LevelEgg[];
  crystals: LevelCrystal[];
  planet?: LevelPlanet;
}

// Eager static imports for the hand-crafted tutorial zone — these end up in
// the game's main chunk (tiny JSON, no runtime fetch overhead).
import level001 from '../data/levels/hand-crafted/level-001.json';
import level002 from '../data/levels/hand-crafted/level-002.json';
import level003 from '../data/levels/hand-crafted/level-003.json';
import level004 from '../data/levels/hand-crafted/level-004.json';
import level005 from '../data/levels/hand-crafted/level-005.json';
import level006 from '../data/levels/hand-crafted/level-006.json';
import level007 from '../data/levels/hand-crafted/level-007.json';
import level008 from '../data/levels/hand-crafted/level-008.json';
import level009 from '../data/levels/hand-crafted/level-009.json';
import level010 from '../data/levels/hand-crafted/level-010.json';

const HAND_CRAFTED: Record<number, unknown> = {
  1: level001,
  2: level002,
  3: level003,
  4: level004,
  5: level005,
  6: level006,
  7: level007,
  8: level008,
  9: level009,
  10: level010,
};

/** Validate and copy raw JSON data into a typed LevelConfig. */
export function parseLevel(raw: unknown): LevelConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('parseLevel: raw is not an object');
  }
  const r = raw as Record<string, unknown>;
  const levelNumber = typeof r.levelNumber === 'number' ? r.levelNumber : 0;
  const orbsTotal = typeof r.orbsTotal === 'number' ? r.orbsTotal : 10;
  const pegs = Array.isArray(r.pegs) ? r.pegs.map(coercePeg) : [];
  const eggs = Array.isArray(r.eggs) ? r.eggs.map(coerceEgg) : [];
  const crystals = Array.isArray(r.crystals) ? r.crystals.map(coerceCrystal) : [];
  const planet = r.planet && typeof r.planet === 'object' ? coercePlanet(r.planet) : undefined;

  return { levelNumber, orbsTotal, pegs, eggs, crystals, planet };
}

function coercePeg(raw: unknown): LevelPeg {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    x: num(r.x),
    y: num(r.y),
    radius: num(r.radius, 12),
  };
}

function coerceEgg(raw: unknown): LevelEgg {
  const r = (raw ?? {}) as Record<string, unknown>;
  const color = r.color === 'purple' || r.color === 'orange' ? r.color : 'green';
  return {
    x: num(r.x),
    y: num(r.y),
    radius: num(r.radius, 20),
    hp: num(r.hp, 1),
    color,
  };
}

function coerceCrystal(raw: unknown): LevelCrystal {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    x: num(r.x),
    y: num(r.y),
    radius: num(r.radius, 10),
  };
}

function coercePlanet(raw: unknown): LevelPlanet {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    x: num(r.x),
    y: num(r.y),
    radius: num(r.radius, 32),
    hp: num(r.hp, 3),
    oscillationRange: num(r.oscillationRange, 24),
    oscillationSpeed: num(r.oscillationSpeed, 1.2),
  };
}

function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

/**
 * Load a level config. Falls back to the fallback pool and warns if the
 * requested level cannot be resolved.
 */
export async function loadLevel(levelNumber: number): Promise<LevelConfig> {
  try {
    const raw = HAND_CRAFTED[levelNumber];
    if (raw) return parseLevel(raw);

    // Above the hand-crafted zone: procedural path (batch owns generator).
    // For this pass we fall back to level 1 as a safe seed.
    if (levelNumber > 10) {
      // Procedural generation deliberately deferred to a later integration
      // pass — return a warned fallback rather than ship a stub.
      console.warn(
        `[marsbounce] level ${levelNumber} not hand-crafted and procedural ` +
          'generator is deferred; serving fallback-pool',
      );
      return parseLevel(fallbackJson);
    }

    console.warn(`[marsbounce] level ${levelNumber} missing; serving fallback-pool`);
    return parseLevel(fallbackJson);
  } catch (err) {
    console.warn('[marsbounce] levelLoader error — serving fallback:', err);
    return parseLevel(fallbackJson);
  }
}
