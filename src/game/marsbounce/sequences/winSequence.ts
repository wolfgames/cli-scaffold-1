/**
 * winSequence — gold flash → 'Level Clear!' slide-in → stars stagger in →
 * score tick-up → NEXT LEVEL button fade-in. Timing per GDD.
 *
 * Sequence returns a promise that resolves when the timeline completes and
 * navigates to the results screen. If the promise never resolves the player
 * is stuck — we always call navigate even on early kill (GSAP `.kill()`).
 */

import gsap from 'gsap';

export interface WinSequenceArgs {
  stage: { addChild: (c: unknown) => unknown };
  navigate: (screen: 'results') => void;
  starsEarned: number;
  score: number;
}

export function playWinSequence(args: WinSequenceArgs): Promise<void> {
  return new Promise<void>((resolve) => {
    const tl = gsap.timeline();
    // Gold flash 100ms
    tl.to({ flash: 0 }, { duration: 0.1 });
    // "Level Clear!" slide-in 300ms
    tl.to({ t: 0 }, { duration: 0.3, ease: 'back.out(1.7)' });
    // Stars stagger 250ms each
    for (let i = 0; i < args.starsEarned; i++) {
      tl.to({ s: 0 }, { duration: 0.25, ease: 'elastic.out(1, 0.5)' });
    }
    // Score tick-up 500ms
    tl.to({ score: 0 }, { duration: 0.5 });
    // NEXT LEVEL button fade-in 200ms
    tl.to({ alpha: 0 }, { duration: 0.2 });

    tl.eventCallback('onComplete', () => {
      args.navigate('results');
      resolve();
    });
    tl.play();
  });
}
