/**
 * AdProvider — stub ad-network abstraction (OQ-003).
 *
 * Real implementation is wired in the integration sprint. The stub returns
 * immediately and always reports "unavailable" so the UI can show
 * "Watch Ad (Unavailable)" rather than promise rewards it cannot deliver.
 */

export interface AdReward {
  orbs: number;
}

export interface AdProvider {
  isAvailable: () => boolean;
  requestAd: () => Promise<AdReward | null>;
}

export const stubAdProvider: AdProvider = {
  isAvailable: () => false,
  requestAd: async () => null,
};
