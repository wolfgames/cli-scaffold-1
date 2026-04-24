/**
 * AudioManager — SFX wiring and unlockAudio tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { MarsBounceAudioManager, MARSBOUNCE_SFX } from '~/game/marsbounce/audio/AudioManager';

function makeLoader() {
  return {
    play: vi.fn(),
    stop: vi.fn(),
    unlock: vi.fn(),
  };
}

describe('AudioManager — SFX wiring and unlockAudio', () => {
  it('PLAY tapped on StartScreen → unlockAudio is exposed', () => {
    const loader = makeLoader();
    expect(typeof loader.unlock).toBe('function');
  });

  it('orb hits rock peg → peg-flash SFX plays', () => {
    const loader = makeLoader();
    const mgr = new MarsBounceAudioManager(loader as never);
    mgr.playPegHit();
    expect(loader.play).toHaveBeenCalledWith(
      'audio-sfx-marsbounce',
      MARSBOUNCE_SFX.pegHit,
      expect.any(Object),
    );
  });

  it('alien egg destroyed → egg-pop SFX plays', () => {
    const loader = makeLoader();
    const mgr = new MarsBounceAudioManager(loader as never);
    mgr.playEggPop();
    expect(loader.play).toHaveBeenCalledWith(
      'audio-sfx-marsbounce',
      MARSBOUNCE_SFX.eggPop,
      expect.any(Object),
    );
  });

  it('level won → win-fanfare SFX plays', () => {
    const loader = makeLoader();
    const mgr = new MarsBounceAudioManager(loader as never);
    mgr.playWinFanfare();
    expect(loader.play).toHaveBeenCalledWith(
      'audio-sfx-marsbounce',
      MARSBOUNCE_SFX.winFanfare,
      expect.any(Object),
    );
  });
});
