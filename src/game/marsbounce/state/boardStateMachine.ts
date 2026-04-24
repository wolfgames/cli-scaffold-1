/**
 * boardStateMachine — pure state machine for the Mars Bounce board.
 *
 * No side effects. The controller calls `nextBoardState(current, event)`
 * and applies the resulting ECS transaction (`setBoardState`). Pure logic
 * keeps the state graph visible + testable.
 */

import type { BoardState } from './MarsBouncePlugin';

export type BoardEvent =
  | 'pointerDown'
  | 'pointerMoved'
  | 'releaseValid'
  | 'releaseInvalid'
  | 'orbResolved'
  | 'scanComplete'
  | 'pause'
  | 'resume'
  | 'reset';

export interface ResolveFlags {
  won: boolean;
  lost: boolean;
}

/** Return the next board state. Unhandled combinations return the current state. */
export function nextBoardState(
  current: BoardState,
  event: BoardEvent,
  flags?: ResolveFlags,
): BoardState {
  switch (current) {
    case 'loaded':
      if (event === 'scanComplete') return 'idle';
      if (event === 'pointerDown') return 'aiming';
      break;
    case 'idle':
      if (event === 'pointerDown') return 'aiming';
      if (event === 'pause') return 'paused';
      break;
    case 'aiming':
      if (event === 'releaseValid') return 'animating';
      if (event === 'releaseInvalid') return 'idle';
      if (event === 'pause') return 'paused';
      break;
    case 'animating':
      if (event === 'orbResolved') return 'resolving';
      break;
    case 'resolving':
      if (event === 'scanComplete') {
        if (flags?.won) return 'won';
        if (flags?.lost) return 'lost';
        return 'idle';
      }
      break;
    case 'paused':
      if (event === 'resume') return 'idle';
      if (event === 'reset') return 'loaded';
      break;
    case 'won':
    case 'lost':
      if (event === 'reset') return 'loaded';
      break;
  }
  return current;
}

/** Gate input — true only in states that should receive player pointer events. */
export function canAcceptInput(state: BoardState): boolean {
  return state === 'idle' || state === 'aiming';
}
