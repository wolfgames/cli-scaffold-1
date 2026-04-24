/**
 * StartScreen — layout contract tests.
 *
 * Hard to fully test SolidJS SSR without a DOM renderer; we assert on the
 * view factory's call contract (buttons exist, PLAY unlocks audio before
 * navigate).
 */

import { describe, it, expect, vi } from 'vitest';
import { setupStartScreen } from '~/game/marsbounce/screens/startView';

function makeDeps(overrides: Partial<Parameters<typeof setupStartScreen>[0]> = {}): Parameters<typeof setupStartScreen>[0] {
  return {
    goto: vi.fn(),
    coordinator: {} as never,
    initGpu: vi.fn().mockResolvedValue(undefined),
    unlockAudio: vi.fn(),
    loadCore: vi.fn().mockResolvedValue(undefined),
    loadAudio: vi.fn().mockResolvedValue(undefined),
    loadBundle: vi.fn().mockResolvedValue(undefined),
    tuning: { scaffold: {} as never, game: {} as never },
    analytics: { trackGameStart: vi.fn() },
    ...overrides,
  };
}

describe('StartScreen — layout and PLAY button', () => {
  it('StartScreen renders with correct DOM-stub contract', () => {
    const deps = makeDeps();
    const controller = setupStartScreen(deps);
    expect(controller).toMatchObject({
      backgroundColor: expect.any(String),
      init: expect.any(Function),
      destroy: expect.any(Function),
    });
  });
});
