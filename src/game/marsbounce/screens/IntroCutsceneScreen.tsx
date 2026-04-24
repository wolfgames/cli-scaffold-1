/**
 * IntroCutsceneScreen — 3-4 emoji-illustrated panels with captions. Skip
 * button always visible top-right (44×44pt). Clears first-time flag on
 * complete or skip.
 */

import { createSignal, onCleanup, Show } from 'solid-js';
import { useScreen } from '~/core/systems/screens';
import { clearFirstTimePlayer } from './firstTimeFlag';

interface Panel {
  glyph: string;
  text: string;
}

const PANELS: Panel[] = [
  { glyph: '📡', text: 'A strange signal from Mars…' },
  { glyph: '🥚', text: 'Alien eggs everywhere.' },
  { glyph: '🚀', text: 'Bounce your orbs. Clear the board.' },
  { glyph: '🪐', text: 'Something much bigger awaits.' },
];

export function IntroCutsceneScreen() {
  const { goto } = useScreen();
  const [idx, setIdx] = createSignal(0);
  const PANEL_MS = 2200;

  const advance = () => {
    if (idx() < PANELS.length - 1) {
      setIdx(idx() + 1);
    } else {
      clearFirstTimePlayer();
      void goto('start');
    }
  };

  const skip = () => {
    clearFirstTimePlayer();
    void goto('start');
  };

  const timer = setInterval(advance, PANEL_MS);
  onCleanup(() => clearInterval(timer));

  return (
    <div class="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0b0f1a] to-black px-6">
      <button
        onClick={skip}
        aria-label="Skip intro"
        class="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white active:scale-95"
        style={{ 'min-width': '44px', 'min-height': '44px' }}
      >
        ✕
      </button>

      <Show when={PANELS[idx()]}>
        <div class="text-7xl mb-6" aria-hidden="true">{PANELS[idx()].glyph}</div>
        <p class="text-white text-lg text-center max-w-xs">{PANELS[idx()].text}</p>
      </Show>

      <div class="flex gap-2 mt-10">
        {PANELS.map((_, i) => (
          <span class={`w-2 h-2 rounded-full ${i === idx() ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}

export default IntroCutsceneScreen;
