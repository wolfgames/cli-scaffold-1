/**
 * LauncherInput — drag/aim/release tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { createLauncherInput } from '~/game/marsbounce/input/LauncherInput';

describe('LauncherInput — aim and fire', () => {
  it('player drags the launcher handle upward → aim angle updates', () => {
    const onAim = vi.fn();
    const input = createLauncherInput({
      origin: { x: 195, y: 700 },
      canAcceptInput: () => true,
      onAim,
      onFire: vi.fn(),
      onCancel: vi.fn(),
    });

    input.handlePointerDown({ x: 195, y: 700 });
    input.handlePointerMove({ x: 195, y: 300 }); // straight up

    expect(onAim).toHaveBeenCalled();
    // straight up → angle ≈ -PI/2
    const call = onAim.mock.calls[onAim.mock.calls.length - 1][0];
    expect(call.angleRad).toBeCloseTo(-Math.PI / 2, 1);
  });

  it('player drags downward → drag cancelled silently on release', () => {
    const onFire = vi.fn();
    const onCancel = vi.fn();
    const input = createLauncherInput({
      origin: { x: 195, y: 700 },
      canAcceptInput: () => true,
      onAim: vi.fn(),
      onFire,
      onCancel,
    });

    input.handlePointerDown({ x: 195, y: 700 });
    input.handlePointerMove({ x: 195, y: 760 }); // below launcher
    input.handlePointerUp({ x: 195, y: 760 });

    expect(onFire).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('player releases with valid upward angle → fires', () => {
    const onFire = vi.fn();
    const input = createLauncherInput({
      origin: { x: 195, y: 700 },
      canAcceptInput: () => true,
      onAim: vi.fn(),
      onFire,
      onCancel: vi.fn(),
    });

    input.handlePointerDown({ x: 195, y: 700 });
    input.handlePointerMove({ x: 250, y: 300 });
    input.handlePointerUp({ x: 250, y: 300 });

    expect(onFire).toHaveBeenCalledTimes(1);
    const { angleRad, speed } = onFire.mock.calls[0][0];
    expect(angleRad).toBeLessThan(0); // upward
    expect(speed).toBeGreaterThan(0);
  });

  it('orb is in flight (animating state) → further drag input is silently ignored', () => {
    const onFire = vi.fn();
    const onAim = vi.fn();
    let canAccept = true;
    const input = createLauncherInput({
      origin: { x: 195, y: 700 },
      canAcceptInput: () => canAccept,
      onAim,
      onFire,
      onCancel: vi.fn(),
    });

    // Fire once, then lock input
    input.handlePointerDown({ x: 195, y: 700 });
    input.handlePointerMove({ x: 250, y: 300 });
    input.handlePointerUp({ x: 250, y: 300 });
    canAccept = false;

    // Subsequent pointers ignored.
    onAim.mockClear();
    onFire.mockClear();
    input.handlePointerDown({ x: 195, y: 700 });
    input.handlePointerMove({ x: 250, y: 300 });
    input.handlePointerUp({ x: 250, y: 300 });

    expect(onFire).not.toHaveBeenCalled();
    expect(onAim).not.toHaveBeenCalled();
  });
});
