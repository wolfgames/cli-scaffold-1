/**
 * LoadingScreen — first-time routing tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isFirstTimePlayer,
  clearFirstTimePlayer,
} from '~/game/marsbounce/screens/firstTimeFlag';

describe('LoadingScreen — routing logic', () => {
  beforeEach(() => {
    try {
      (globalThis as unknown as { localStorage: Storage }).localStorage = undefined as never;
    } catch {
      /* ignore */
    }
    const store = new Map<string, string>();
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    };
  });

  it('first-time player: first-time flag is true', () => {
    expect(isFirstTimePlayer()).toBe(true);
  });

  it('returning player: first-time flag is false', () => {
    clearFirstTimePlayer();
    expect(isFirstTimePlayer()).toBe(false);
  });
});
