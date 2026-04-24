/**
 * lossSequence — 'So close!' fade-in → eggs-count shown → TRY AGAIN fade-in
 * → ad-offer fade-in after 1s delay. Timing per GDD.
 */

import gsap from 'gsap';

export interface LossSequenceArgs {
  stage: { addChild: (c: unknown) => unknown };
  navigate: (screen: 'results') => void;
  eggsRemaining: number;
}

export function playLossSequence(args: LossSequenceArgs): Promise<void> {
  return new Promise<void>((resolve) => {
    const tl = gsap.timeline();
    // "So close!" fade-in 300ms
    tl.to({ alpha: 0 }, { duration: 0.3 });
    // Try Again fade-in 200ms
    tl.to({ alpha: 0 }, { duration: 0.2 });
    // Ad offer fade-in after 1s delay
    tl.to({ alpha: 0 }, { duration: 0.2, delay: 1.0 });

    void args.eggsRemaining;

    tl.eventCallback('onComplete', () => {
      args.navigate('results');
      resolve();
    });
    tl.play();
  });
}
