/**
 * level-data — onboarding contract tests.
 */

import { describe, it, expect } from 'vitest';
import { loadLevel } from '~/game/marsbounce/levels/levelLoader';

describe('level-data — onboarding contract', () => {
  it('levels 1-5 contain only green eggs, no Alien Planet, 4-6 eggs, 8-10 orbs', async () => {
    for (let i = 1; i <= 5; i++) {
      const cfg = await loadLevel(i);
      const nonGreen = cfg.eggs.filter((e) => e.color !== 'green');
      expect(nonGreen.length, `level ${i} non-green eggs`).toBe(0);
      expect(cfg.planet, `level ${i} planet`).toBeUndefined();
      expect(cfg.eggs.length, `level ${i} egg count`).toBeGreaterThanOrEqual(4);
      expect(cfg.eggs.length, `level ${i} egg count`).toBeLessThanOrEqual(6);
      expect(cfg.orbsTotal, `level ${i} orbs`).toBeGreaterThanOrEqual(8);
      expect(cfg.orbsTotal, `level ${i} orbs`).toBeLessThanOrEqual(10);
    }
  });
});
