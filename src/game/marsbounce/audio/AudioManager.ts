/**
 * Mars Bounce AudioManager — wires game-specific SFX sprite names to the
 * audio-sfx-marsbounce / audio-music-marsbounce bundles.
 *
 * Extends the scaffold BaseAudioManager. The `unlockAudio()` call in the
 * PLAY button tap path (startView) is the mobile audio-unlock that must
 * happen on user gesture.
 */

import { BaseAudioManager } from '~/core/systems/audio';
import type { AudioLoader } from '~/core/systems/assets/loaders/audio';
import { MARSBOUNCE_BUNDLES } from '../asset-manifest';

export const MARSBOUNCE_SFX = {
  pegHit: 'peg-flash',
  eggCrack: 'egg-crack',
  eggPop: 'egg-pop',
  crystalCollect: 'crystal-collect',
  planetExplode: 'planet-explode',
  winFanfare: 'win-fanfare',
  lossTone: 'loss-tone',
  orbLaunch: 'orb-launch',
  wallBounce: 'wall-bounce',
} as const;

export class MarsBounceAudioManager extends BaseAudioManager {
  constructor(audioLoader: AudioLoader) {
    super(audioLoader);
  }

  private playSfx(sprite: string, volume = 0.7): void {
    this.playSound({
      channel: MARSBOUNCE_BUNDLES.audioSfx,
      sprite,
      volume,
    });
  }

  playPegHit(): void { this.playSfx(MARSBOUNCE_SFX.pegHit); }
  playEggCrack(): void { this.playSfx(MARSBOUNCE_SFX.eggCrack); }
  playEggPop(): void { this.playSfx(MARSBOUNCE_SFX.eggPop, 0.85); }
  playCrystalCollect(): void { this.playSfx(MARSBOUNCE_SFX.crystalCollect); }
  playPlanetExplode(): void { this.playSfx(MARSBOUNCE_SFX.planetExplode, 0.9); }
  playWinFanfare(): void { this.playSfx(MARSBOUNCE_SFX.winFanfare, 0.9); }
  playLossTone(): void { this.playSfx(MARSBOUNCE_SFX.lossTone, 0.75); }
  playOrbLaunch(): void { this.playSfx(MARSBOUNCE_SFX.orbLaunch, 0.6); }
  playWallBounce(): void { this.playSfx(MARSBOUNCE_SFX.wallBounce, 0.5); }

  startMarsMusic(): void {
    this.startMusic({
      channel: MARSBOUNCE_BUNDLES.audioMusic,
      sprite: 'main-loop',
      volume: 0.5,
    });
  }
}
