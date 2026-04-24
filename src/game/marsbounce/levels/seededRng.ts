/**
 * seededRng — deterministic, pure PRNG.
 *
 * Use for level generation / solver. No Math.random, no global state.
 * Seed formula: seed = levelNumber * 48271 + 9973 (Lehmer-style constants).
 */

export interface Rng {
  next: () => number; // uniform [0, 1)
  nextInt: (minInclusive: number, maxExclusive: number) => number;
  pick: <T>(arr: readonly T[]) => T;
}

/** Mulberry32 — fast, tiny, good-enough for level seeding. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    nextInt: (a, b) => Math.floor(next() * (b - a)) + a,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
  };
}

export function seedForLevel(levelNumber: number): number {
  return (levelNumber * 48271 + 9973) >>> 0;
}
