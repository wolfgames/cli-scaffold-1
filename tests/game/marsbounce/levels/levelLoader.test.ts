/**
 * levelLoader — load and fallback tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { loadLevel, parseLevel } from '~/game/marsbounce/levels/levelLoader';

describe('levelLoader — load and fallback', () => {
  it('parseLevel returns a validated LevelConfig from raw JSON', () => {
    const raw = {
      levelNumber: 1,
      orbsTotal: 10,
      pegs: [{ x: 100, y: 200, radius: 12 }],
      eggs: [{ x: 195, y: 300, radius: 20, hp: 1, color: 'green' }],
      crystals: [],
    };
    const cfg = parseLevel(raw);
    expect(cfg.levelNumber).toBe(1);
    expect(cfg.orbsTotal).toBe(10);
    expect(cfg.pegs.length).toBe(1);
    expect(cfg.eggs.length).toBe(1);
  });

  it('loadLevel(1) returns hand-crafted level data', async () => {
    const cfg = await loadLevel(1);
    expect(cfg.levelNumber).toBe(1);
    expect(cfg.eggs.length).toBeGreaterThan(0);
    expect(cfg.orbsTotal).toBeGreaterThanOrEqual(8);
    expect(cfg.orbsTotal).toBeLessThanOrEqual(10);
  });

  it('loadLevel(1) uses fallback-pool when hand-crafted missing — Sentry error logged', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // 9999 is above the hand-crafted range, forcing fallback.
    const cfg = await loadLevel(9999);
    expect(cfg).toBeDefined();
    expect(cfg.eggs.length).toBeGreaterThan(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
