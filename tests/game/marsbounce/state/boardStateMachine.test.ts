/**
 * boardStateMachine — pure state machine tests.
 */

import { describe, it, expect } from 'vitest';
import { nextBoardState, canAcceptInput } from '~/game/marsbounce/state/boardStateMachine';

describe('boardStateMachine — transitions', () => {
  it('board is in animating state and orb resolves → transitions to resolving', () => {
    const next = nextBoardState('animating', 'orbResolved');
    expect(next).toBe('resolving');
  });

  it('resolving with no win/loss → idle', () => {
    expect(nextBoardState('resolving', 'scanComplete', { won: false, lost: false })).toBe('idle');
  });

  it('resolving with all eggs cleared → won', () => {
    expect(nextBoardState('resolving', 'scanComplete', { won: true, lost: false })).toBe('won');
  });

  it('resolving with no orbs and eggs remaining → lost', () => {
    expect(nextBoardState('resolving', 'scanComplete', { won: false, lost: true })).toBe('lost');
  });

  it('idle + pointerDown → aiming', () => {
    expect(nextBoardState('idle', 'pointerDown')).toBe('aiming');
  });

  it('aiming + releaseValid → animating', () => {
    expect(nextBoardState('aiming', 'releaseValid')).toBe('animating');
  });

  it('aiming + releaseInvalid → idle (silent cancel)', () => {
    expect(nextBoardState('aiming', 'releaseInvalid')).toBe('idle');
  });

  it('canAcceptInput blocks during animating/resolving/won/lost/paused', () => {
    expect(canAcceptInput('idle')).toBe(true);
    expect(canAcceptInput('aiming')).toBe(true);
    expect(canAcceptInput('animating')).toBe(false);
    expect(canAcceptInput('resolving')).toBe(false);
    expect(canAcceptInput('won')).toBe(false);
    expect(canAcceptInput('lost')).toBe(false);
    expect(canAcceptInput('paused')).toBe(false);
  });
});
