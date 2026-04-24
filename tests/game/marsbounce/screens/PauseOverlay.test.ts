/**
 * PauseOverlay — QUIT navigation + pause interaction tests.
 *
 * The actual PauseOverlay component is in src/core/ui/PauseOverlay.tsx (read-
 * only scaffold). We test the adjacent pause-triggered transaction wiring on
 * the MarsBouncePlugin.
 */

import { describe, it, expect } from 'vitest';
import { createMarsBounceWorld } from '~/game/marsbounce/state/MarsBouncePlugin';
import { nextBoardState } from '~/game/marsbounce/state/boardStateMachine';

describe('PauseOverlay — QUIT navigation', () => {
  it('pause button tapped in-game → boardState transitions to paused', () => {
    const db = createMarsBounceWorld();
    db.transactions.setBoardState({ state: 'idle' });
    const next = nextBoardState(db.resources.boardState, 'pause');
    db.transactions.setBoardState({ state: next });
    expect(db.resources.boardState).toBe('paused');
  });

  it('QUIT tapped in pause overlay → reset transitions to loaded', () => {
    const db = createMarsBounceWorld();
    db.transactions.setBoardState({ state: 'paused' });
    const next = nextBoardState(db.resources.boardState, 'reset');
    db.transactions.setBoardState({ state: next });
    expect(db.resources.boardState).toBe('loaded');
  });
});
