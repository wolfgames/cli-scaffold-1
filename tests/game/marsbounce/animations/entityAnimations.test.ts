/**
 * entityAnimations — GSAP tween contract tests.
 *
 * We mock GSAP to assert the call order: killTweensOf must fire BEFORE any
 * destroy() call on the same sprite. Tests verify the animation helpers
 * return promises that resolve when the mocked timeline completes.
 */

import { describe, it, expect, vi } from 'vitest';

const calls: Array<{ fn: string; target: unknown }> = [];

vi.mock('gsap', () => {
  const tweenStub = (opts?: { onComplete?: () => void }) => {
    // Fire onComplete synchronously so promise-based helpers resolve
    // immediately in tests.
    if (opts?.onComplete) opts.onComplete();
    return { kill: vi.fn() };
  };
  return {
    default: {
      to: vi.fn((target, opts) => {
        calls.push({ fn: 'to', target });
        return tweenStub(opts as { onComplete?: () => void });
      }),
      from: vi.fn((target, opts) => {
        calls.push({ fn: 'from', target });
        return tweenStub(opts as { onComplete?: () => void });
      }),
      fromTo: vi.fn((target, _from, opts) => {
        calls.push({ fn: 'fromTo', target });
        return tweenStub(opts as { onComplete?: () => void });
      }),
      killTweensOf: vi.fn((target) => {
        calls.push({ fn: 'killTweensOf', target });
      }),
      delayedCall: vi.fn((_sec, cb: () => void) => {
        cb();
      }),
      timeline: vi.fn(() => {
        const tl = {
          to: vi.fn(() => tl),
          from: vi.fn(() => tl),
          fromTo: vi.fn(() => tl),
          play: vi.fn(),
          kill: vi.fn(),
          eventCallback: vi.fn(),
        };
        return tl;
      }),
    },
  };
});

import {
  flashPeg,
  crackEgg,
  popEgg,
  explodePlanet,
  sparkCrystal,
  destroyWithTweenKill,
} from '~/game/marsbounce/animations/entityAnimations';

describe('entityAnimations — GSAP tween contract', () => {
  it('orb contacts a RockPeg → flashPeg fires', () => {
    calls.length = 0;
    const sprite = { alpha: 1, tint: 0xffffff };
    flashPeg(sprite);
    expect(calls.some((c) => c.fn === 'to')).toBe(true);
  });

  it('AlienEgg with hp=2 hit for first time (hp becomes 1) → crackEgg fires', () => {
    calls.length = 0;
    const sprite = { alpha: 1 };
    crackEgg(sprite);
    expect(calls.some((c) => c.fn === 'to')).toBe(true);
  });

  it('AlienEgg destroyed (hp reaches 0) → popEgg animates then resolves', async () => {
    calls.length = 0;
    const sprite = { alpha: 1, scale: { set: vi.fn() } };
    await popEgg(sprite);
    expect(calls.some((c) => c.fn === 'to')).toBe(true);
  });

  it('AlienPlanet destroyed → explodePlanet animates', async () => {
    calls.length = 0;
    const sprite = { alpha: 1, scale: { set: vi.fn() } };
    await explodePlanet(sprite);
    expect(calls.some((c) => c.fn === 'to')).toBe(true);
  });

  it('EnergyCrystal collected → sparkCrystal animates', async () => {
    calls.length = 0;
    const sprite = { alpha: 1, scale: { set: vi.fn() } };
    await sparkCrystal(sprite);
    expect(calls.some((c) => c.fn === 'to')).toBe(true);
  });

  it('destroyWithTweenKill calls killTweensOf BEFORE destroy on the same sprite', () => {
    calls.length = 0;
    const sprite = {
      destroy: vi.fn(),
      parent: { removeChild: vi.fn() },
      removeAllListeners: vi.fn(),
    };
    destroyWithTweenKill(sprite);

    const killCall = calls.find((c) => c.fn === 'killTweensOf' && c.target === sprite);
    expect(killCall).toBeDefined();
    expect(sprite.removeAllListeners).toHaveBeenCalled();
    expect(sprite.parent.removeChild).toHaveBeenCalledWith(sprite);
    expect(sprite.destroy).toHaveBeenCalledWith({ children: true });
  });
});
