/**
 * bridgeEcsToSignals — ECS → SolidJS signal bridge for DOM screens.
 *
 * Game state lives in ECS (source of truth). DOM screens (Results, HUD shells)
 * read Solid signals. This adapter observes ECS resources and pushes their
 * values into existing signals.
 *
 * The controller owns the cleanup function — it must be called BEFORE
 * setActiveDb(null) in destroy() so no observers fire into a dead DB.
 */

import type { MarsBounceDatabase } from './MarsBouncePlugin';
import { gameState } from '~/game/state';

export type BridgeCleanup = () => void;

export function bridgeEcsToSignals(db: MarsBounceDatabase): BridgeCleanup {
  // Seed the signals from current ECS values.
  gameState.setScore(db.resources.score);
  gameState.setLevel(db.resources.level);
  // starsEarned lives in ECS (set by checkWinLose action in batch 4).
  // Results screen reads this signal — bridge it here so the binding spans batches.
  gameState.setStarsEarned(db.resources.starsEarned);

  // Poll-on-transaction: each mutating transaction re-publishes the
  // resources the DOM cares about. This avoids relying on an Observe API
  // shape that can vary between @adobe/data versions.
  let disposed = false;

  const unsubscribe = db.observe.transactions((_t) => {
    if (disposed) return;
    const score = db.resources.score;
    const level = db.resources.level;
    const starsEarned = db.resources.starsEarned;
    if (gameState.score() !== score) gameState.setScore(score);
    if (gameState.level() !== level) gameState.setLevel(level);
    if (gameState.starsEarned() !== starsEarned) gameState.setStarsEarned(starsEarned);
  });

  return () => {
    disposed = true;
    try {
      unsubscribe();
    } catch {
      // observer already disposed — safe to swallow
    }
  };
}
