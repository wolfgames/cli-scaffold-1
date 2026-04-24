/**
 * Mars Bounce — game barrel.
 *
 * Exports the game contract (setupGame, setupStartScreen) used by the scaffold.
 * startView is kept temporarily from the mygame template until batch 7 replaces it.
 */

export { setupGame } from './screens/gameController';
export { setupStartScreen } from '~/game/mygame/screens/startView';

export { marsBouncePlugin, createMarsBounceWorld } from './state/MarsBouncePlugin';
export type { MarsBounceDatabase, BoardState } from './state/MarsBouncePlugin';
export { bridgeEcsToSignals } from './state/bridgeEcsToSignals';
export type { BridgeCleanup } from './state/bridgeEcsToSignals';
export { MARSBOUNCE_BUNDLES, appendMarsBounceBundles } from './asset-manifest';
