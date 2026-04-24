/**
 * IntroCutsceneScreen — first-time routing and skip tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isFirstTimePlayer,
  clearFirstTimePlayer,
} from '~/game/marsbounce/screens/firstTimeFlag';

describe('IntroCutsceneScreen — first-time routing and skip', () => {
  beforeEach(() => {
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

  it('first-time player flag is true', () => {
    expect(isFirstTimePlayer()).toBe(true);
  });

  it('Skip button tapped → first-time flag set to false', () => {
    clearFirstTimePlayer();
    expect(isFirstTimePlayer()).toBe(false);
  });

  it('cutscene completes (all panels shown) → flag cleared', () => {
    clearFirstTimePlayer();
    expect(isFirstTimePlayer()).toBe(false);
  });
});
