/**
 * Mars Bounce asset manifest — bundles for the game.
 *
 * Bundle prefix rules (see guardrails — wrong prefix = silent failure):
 *   scene-*  → GPU (Pixi) game sprites
 *   fx-*     → GPU (Pixi) particles / VFX
 *   audio-*  → Howler SFX + music
 *   data-*   → JSON configs (level data)
 *
 * During the core pass the game runs with emoji placeholders rather than real
 * sprite atlases, so these bundles are declared but their asset files may be
 * stubs. Real art replaces the stubs in the asset pass.
 */

import type { Manifest } from '@wolfgames/components/core';

export const MARSBOUNCE_BUNDLES = {
  sceneSprites: 'scene-sprites-marsbounce',
  fxParticles: 'fx-particles-marsbounce',
  audioSfx: 'audio-sfx-marsbounce',
  audioMusic: 'audio-music-marsbounce',
  dataLevels: 'data-levels-marsbounce',
} as const;

export function appendMarsBounceBundles(manifest: Manifest): Manifest {
  const existing = new Set(manifest.bundles.map((b) => b.name));
  const toAdd = [
    {
      name: MARSBOUNCE_BUNDLES.sceneSprites,
      assets: [{ alias: MARSBOUNCE_BUNDLES.sceneSprites, src: 'atlas-marsbounce.json' }],
    },
    {
      name: MARSBOUNCE_BUNDLES.fxParticles,
      assets: [{ alias: MARSBOUNCE_BUNDLES.fxParticles, src: 'vfx-marsbounce.json' }],
    },
    {
      name: MARSBOUNCE_BUNDLES.audioSfx,
      assets: [{ alias: MARSBOUNCE_BUNDLES.audioSfx, src: 'sfx-marsbounce.json' }],
    },
    {
      name: MARSBOUNCE_BUNDLES.audioMusic,
      assets: [{ alias: MARSBOUNCE_BUNDLES.audioMusic, src: 'music-marsbounce.json' }],
    },
    {
      name: MARSBOUNCE_BUNDLES.dataLevels,
      assets: [{ alias: MARSBOUNCE_BUNDLES.dataLevels, src: 'levels-marsbounce.json' }],
    },
  ].filter((b) => !existing.has(b.name));

  return {
    ...manifest,
    bundles: [...manifest.bundles, ...toAdd],
  };
}
