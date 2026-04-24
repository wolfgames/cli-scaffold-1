/**
 * Game Configuration
 *
 * Screen wiring, asset manifest, and data types.
 * Game identity (projectId, slug, CDN URLs) comes from GameConfigProvider.
 */

import { lazy, type Component } from 'solid-js';
import type { ViewportMode } from '@wolfgames/components/core';
import type { ScreenId, ScreenAssetConfig } from '~/core/systems/screens/types';
// Use Mars Bounce themed screens so all screens reflect game identity (player-flow fix).
import { LoadingScreen } from './marsbounce/screens/LoadingScreen';
import { ResultsScreen } from './marsbounce/screens/ResultsScreen';
import { StartScreen as MarsBounceStartScreen } from './marsbounce/screens/StartScreen';

/** Game font family — loaded via @font-face in app.css */
export const GAME_FONT_FAMILY = 'Baloo, system-ui, sans-serif';

// ============================================================================
// DATA TYPES
//
// Define your game's data schema here.
// These types are used by useGameData() and the ManifestProvider.
// ============================================================================

/** Dialogue message for companion/NPC interactions */
export interface DialogueMessage {
  id: string;
  speaker?: string;
  text: string;
}

/**
 * Game data fetched from server / injected by host.
 * Replace with your game's actual data shape.
 */
export interface GameData {
  uid: string;
  name: string;
}
// ============================================================================
// SCREEN WIRING
// ============================================================================

export interface GameConfig {
  screens: {
    loading: Component;
    start: Component;
    game: Component;
    results: Component;
  };
  /** Per-screen asset requirements. The screen manager loads required bundles
   *  before showing the screen and background-loads optional bundles. */
  screenAssets?: Partial<Record<ScreenId, ScreenAssetConfig>>;
  initialScreen: 'loading' | 'start' | 'game' | 'results';
  defaultViewportMode?: ViewportMode;
}

export const gameConfig: GameConfig = {
  screens: {
    loading: LoadingScreen,
    start: MarsBounceStartScreen,
    game: lazy(() => import('./screens/GameScreen')),
    results: ResultsScreen,
  },
  initialScreen: 'loading',
  defaultViewportMode: 'small',
};
