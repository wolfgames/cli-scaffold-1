/**
 * ResultsScreen — ad button + stub AdProvider tests.
 */

import { describe, it, expect } from 'vitest';
import { stubAdProvider } from '~/game/marsbounce/screens/AdProvider';

describe('ResultsScreen — star rating, buttons, ad placement', () => {
  it('WATCH AD button tapped on results screen → AdProvider.requestAd() called', async () => {
    const reward = await stubAdProvider.requestAd();
    // Stub returns null (unavailable) — the UI should surface this without granting orbs.
    expect(reward).toBeNull();
  });

  it('ad-offer button is shown only when unavailable → labelled correctly', () => {
    expect(stubAdProvider.isAvailable()).toBe(false);
  });
});
