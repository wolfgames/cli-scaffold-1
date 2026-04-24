import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => {
  const timelineStub = () => {
    let onCompleteCb: (() => void) | null = null;
    const tl = {
      to: vi.fn(() => tl),
      from: vi.fn(() => tl),
      fromTo: vi.fn(() => tl),
      play: vi.fn(() => {
        // Fire the stored onComplete synchronously in tests.
        onCompleteCb?.();
      }),
      kill: vi.fn(),
      call: vi.fn(() => tl),
      eventCallback: vi.fn((event: string, cb: () => void) => {
        if (event === 'onComplete') onCompleteCb = cb;
        return tl;
      }),
    };
    return tl;
  };
  return {
    default: {
      to: vi.fn(),
      killTweensOf: vi.fn(),
      delayedCall: vi.fn((_s, cb: () => void) => cb()),
      timeline: vi.fn(timelineStub),
    },
  };
});

import { playWinSequence } from '~/game/marsbounce/sequences/winSequence';
import { playLossSequence } from '~/game/marsbounce/sequences/lossSequence';

describe('winSequence', () => {
  it('board enters won state → win sequence plays and resolves', async () => {
    const stage = { addChild: vi.fn() };
    const navigate = vi.fn();
    await playWinSequence({ stage, navigate, starsEarned: 3, score: 1500 });
    expect(navigate).toHaveBeenCalledWith('results');
  });

  it('win sequence completes → navigation to results screen fires', async () => {
    const stage = { addChild: vi.fn() };
    const navigate = vi.fn();
    await playWinSequence({ stage, navigate, starsEarned: 2, score: 800 });
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});

describe('lossSequence', () => {
  it('board enters lost state → loss sequence plays and resolves', async () => {
    const stage = { addChild: vi.fn() };
    const navigate = vi.fn();
    await playLossSequence({ stage, navigate, eggsRemaining: 3 });
    expect(navigate).toHaveBeenCalledWith('results');
  });

  it('loss sequence completes → navigation to results screen fires', async () => {
    const stage = { addChild: vi.fn() };
    const navigate = vi.fn();
    await playLossSequence({ stage, navigate, eggsRemaining: 2 });
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
