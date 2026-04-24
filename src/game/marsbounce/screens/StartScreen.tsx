/**
 * Mars Bounce StartScreen — Mars gradient background, wordmark, centered
 * PLAY button, settings icon top-right.
 */

import { onMount, onCleanup } from 'solid-js';
import { setupStartScreen } from './startView';
import { useScreen, type ScreenId } from '~/core/systems/screens';
import { useAssets } from '~/core/systems/assets';
import { useTuning, type ScaffoldTuning } from '~/core';
import { useGameTracking } from '~/game/setup/tracking';
import type { GameTuning } from '~/game/tuning';

export function StartScreen() {
  const { goto } = useScreen();
  const { coordinator, initGpu, unlockAudio, loadCore, loadAudio, loadBundle } = useAssets();
  const tuning = useTuning<ScaffoldTuning, GameTuning>();
  const { trackGameStart } = useGameTracking();
  let containerRef: HTMLDivElement | undefined;

  const controller = setupStartScreen({
    goto: (screen) => { void goto(screen as ScreenId); },
    coordinator,
    initGpu,
    unlockAudio,
    loadCore,
    loadAudio,
    loadBundle,
    tuning,
    analytics: { trackGameStart },
  });

  onMount(() => {
    if (containerRef) controller.init(containerRef);
  });
  onCleanup(() => controller.destroy());

  return (
    <div class="fixed inset-0 bg-gradient-to-b from-[#3a1a0d] via-[#1a0f06] to-black">
      <div ref={containerRef} class="absolute inset-0" />
      <button
        aria-label="Settings"
        class="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white active:scale-95"
      >
        ⚙
      </button>
    </div>
  );
}

export default StartScreen;
