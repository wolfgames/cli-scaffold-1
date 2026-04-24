/**
 * ChapterInterstitialScreen — zone boundary trigger tests.
 */

import { describe, it, expect } from 'vitest';
import { isZoneBoundary, zoneForLevel } from '~/game/marsbounce/levels/levelGenerator';

describe('ChapterInterstitialScreen — zone boundary trigger', () => {
  it('player crosses zone boundary (every ZONE_SIZE=10 levels)', () => {
    expect(isZoneBoundary(1)).toBe(false);
    expect(isZoneBoundary(10)).toBe(false);
    expect(isZoneBoundary(11)).toBe(true);
    expect(isZoneBoundary(21)).toBe(true);
  });

  it('zoneForLevel maps correctly', () => {
    expect(zoneForLevel(1)).toBe(1);
    expect(zoneForLevel(10)).toBe(1);
    expect(zoneForLevel(11)).toBe(2);
    expect(zoneForLevel(30)).toBe(3);
  });
});
