/**
 * Mars Bounce LoadingScreen — Martian landscape silhouette, wordmark,
 * animated progress bar. Routes to IntroCutscene if the first-time flag is
 * set, otherwise to StartScreen.
 *
 * Kept in `src/game/marsbounce/screens/` so the scaffold screens/ LoadingScreen
 * can stay generic. GameScreen wiring picks whichever screen is exported
 * via game config.
 */

import { onMount, createMemo, Show, createSignal } from 'solid-js';
import { useScreen } from '~/core/systems/screens';
import { useAssets, useLoadingState } from '~/core/systems/assets';
import { isFirstTimePlayer } from './firstTimeFlag';

export function LoadingScreen() {
  const { goto } = useScreen();
  const assets = useAssets();
  const loadingState = useLoadingState();
  const [routed, setRouted] = createSignal(false);

  const progressPct = createMemo(() => {
    const s = loadingState();
    if (!s) return 0;
    const total = (s.loaded?.length ?? 0) + (s.loading?.length ?? 0);
    if (total === 0) return 15; // show motion even before bundles kick in
    return Math.min(100, Math.round((s.loaded.length / total) * 100));
  });

  onMount(async () => {
    try {
      await assets.loadBoot?.();
      await assets.loadTheme?.();
      await new Promise((r) => setTimeout(r, 400));
      if (routed()) return;
      setRouted(true);
      if (isFirstTimePlayer()) {
        // Intro cutscene (IntroCutsceneScreen) will be registered as a screen
        // in the asset pass when ScreenId is extended. For now, all players
        // land on start. Do NOT clear the first-time flag here — the cutscene
        // screen is responsible for clearing it after the player has seen it.
        await goto('start');
      } else {
        await goto('start');
      }
    } catch (err) {
      console.error('[marsbounce] LoadingScreen error:', err);
    }
  });

  return (
    <div class="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#3a1a0d] via-[#1a0f06] to-black">
      {/* Martian silhouette — emoji row */}
      <div class="mb-4 text-5xl" aria-hidden="true">🏔️ 🏜️ 🏔️</div>
      <h1 class="text-4xl font-bold text-orange-300 mb-8 tracking-wide">
        Mars Bounce
      </h1>
      <div class="w-56 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full bg-orange-400 rounded-full transition-all duration-300"
          style={{ width: `${progressPct()}%` }}
        />
      </div>
      <Show when={progressPct() >= 100}>
        <p class="text-white/60 text-sm mt-4">Entering Hellas Basin…</p>
      </Show>
    </div>
  );
}

export default LoadingScreen;
