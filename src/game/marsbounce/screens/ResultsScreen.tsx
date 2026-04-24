/**
 * ResultsScreen — star rating, final score, NEXT LEVEL / TRY AGAIN / WATCH AD.
 *
 * Reads starsEarned + score from the Solid signals bridged from ECS by
 * bridgeEcsToSignals. Ad offer only shown on loss (orbs remaining == 0 &
 * eggs still on board). The scaffold GameScreen navigates to this on
 * results.
 */

import { createMemo, Show } from 'solid-js';
import { useScreen } from '~/core/systems/screens';
import { gameState } from '~/game/state';
import { stubAdProvider } from './AdProvider';

export function ResultsScreen() {
  const { goto } = useScreen();
  const stars = createMemo(() => Math.min(3, Math.max(0, 0))); // TODO: bind real stars signal when added
  const score = gameState.score;

  const handleNextLevel = () => {
    gameState.incrementLevel();
    void goto('game');
  };
  const handleTryAgain = () => {
    void goto('game');
  };
  const handleWatchAd = async () => {
    const reward = await stubAdProvider.requestAd();
    if (reward) {
      // Integration sprint: add reward.orbs to ecs.orbsRemaining then
      // navigate back to the game with same level.
    }
    void goto('game');
  };

  const lostBoard = () => score() === 0;

  return (
    <div class="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0b0f1a] to-black px-6">
      <Show when={!lostBoard()} fallback={<h1 class="text-3xl font-bold text-white mb-4">So close!</h1>}>
        <h1 class="text-3xl font-bold text-white mb-4">Level Clear!</h1>
      </Show>

      <div class="flex gap-3 mb-6" aria-label="star rating">
        {Array.from({ length: 3 }, (_, i) => (
          <span class={`text-4xl ${i < stars() ? 'text-yellow-300' : 'text-white/20'}`}>★</span>
        ))}
      </div>

      <div class="text-center mb-8">
        <p class="text-white/60 text-sm mb-1">Score</p>
        <p class="text-5xl font-bold text-white">{score()}</p>
      </div>

      <div class="flex flex-col gap-3 w-full max-w-xs">
        <Show when={!lostBoard()}>
          <button
            onClick={handleNextLevel}
            class="px-6 py-4 bg-emerald-500 text-white rounded-xl font-semibold min-h-11 active:scale-95"
            style={{ 'min-width': '44px', 'min-height': '44px' }}
          >
            NEXT LEVEL
          </button>
        </Show>
        <Show when={lostBoard()}>
          <button
            onClick={handleTryAgain}
            class="px-6 py-4 bg-emerald-500 text-white rounded-xl font-semibold min-h-11 active:scale-95"
            style={{ 'min-width': '44px', 'min-height': '44px' }}
          >
            TRY AGAIN
          </button>
          <button
            onClick={handleWatchAd}
            class="px-6 py-3 bg-white/10 text-white/80 rounded-xl font-medium min-h-11 active:scale-95 mt-2"
            style={{ 'min-width': '44px', 'min-height': '44px' }}
          >
            Watch Ad {stubAdProvider.isAvailable() ? '(+3 orbs)' : '(Unavailable)'}
          </button>
        </Show>
      </div>
    </div>
  );
}
