/**
 * ChapterInterstitialScreen — shown when the player crosses a zone boundary
 * (every ZONE_SIZE levels, defined in difficultyParams.ts). Auto-skipped
 * when no boundary has been crossed.
 */

import { createMemo, Show } from 'solid-js';
import { gameState } from '~/game/state';
import { useScreen } from '~/core/systems/screens';
import { isZoneBoundary, zoneForLevel } from '../levels/levelGenerator';

const CHAPTER_NAMES: Record<number, { name: string; blurb: string }> = {
  1: { name: 'Hellas Basin', blurb: 'The ancient crater. Gentle gravity. Many rocks.' },
  2: { name: 'Valles Marineris', blurb: 'A canyon of crystals and deep echoes.' },
  3: { name: 'Olympus Mons', blurb: 'Volcanic thermals. Eggs bathed in glow.' },
};

export function ChapterInterstitialScreen() {
  const { goto } = useScreen();
  const level = gameState.level;
  const zone = createMemo(() => zoneForLevel(level()));
  const crossed = createMemo(() => isZoneBoundary(level()));

  // Auto-skip if we are not crossing a boundary.
  if (!crossed()) {
    setTimeout(() => void goto('game'), 0);
  }

  const chapter = () => CHAPTER_NAMES[zone()] ?? { name: `Chapter ${zone()}`, blurb: '' };

  return (
    <Show when={crossed()} fallback={null}>
      <div class="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#3a1a0d] to-black px-6">
        <p class="text-white/60 text-sm mb-2">Chapter {zone()}</p>
        <h1 class="text-4xl font-bold text-orange-300 mb-4 text-center">{chapter().name}</h1>
        <p class="text-white/70 text-center mb-8 max-w-sm">{chapter().blurb}</p>
        <button
          onClick={() => void goto('game')}
          class="px-6 py-4 bg-orange-500 text-white rounded-xl font-semibold"
          style={{ 'min-width': '44px', 'min-height': '44px' }}
        >
          CONTINUE
        </button>
      </div>
    </Show>
  );
}

export default ChapterInterstitialScreen;
