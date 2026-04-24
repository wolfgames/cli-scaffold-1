/**
 * entityAnimations — GSAP tween factories for entity feedback.
 *
 * Guardrails:
 *   - Always kill tweens before destroying targets (destroyWithTweenKill helper)
 *   - No requestAnimationFrame (GSAP only)
 *   - No per-frame allocation — targets passed in by caller
 */

import gsap from 'gsap';

/** Anything sprite-shaped that GSAP can tween. Intentionally loose. */
export type AnimTarget = {
  alpha?: number;
  tint?: number;
  scale?: { set?: (n: number) => void } | number;
  destroy?: (opts?: unknown) => void;
  parent?: { removeChild?: (child: unknown) => unknown } | null;
  removeAllListeners?: () => void;
} & Record<string, unknown>;

/** Peg flash on orb contact — 300ms orange glow. */
export function flashPeg(sprite: AnimTarget): void {
  gsap.to(sprite, {
    pixi: { tint: 0xffaa44 },
    alpha: 1,
    duration: 0.15,
    yoyo: true,
    repeat: 1,
    overwrite: 'auto',
  });
}

/** Egg crack overlay shown when multi-HP egg takes a hit. */
export function crackEgg(sprite: AnimTarget): void {
  gsap.to(sprite, {
    alpha: 0.6,
    duration: 0.05,
    yoyo: true,
    repeat: 1,
    overwrite: 'auto',
  });
}

/** Egg pop animation — 200ms, resolves when complete. */
export function popEgg(sprite: AnimTarget): Promise<void> {
  return new Promise<void>((resolve) => {
    gsap.to(sprite, {
      pixi: { scale: 1.3, alpha: 0 },
      duration: 0.2,
      ease: 'back.in(1.7)',
      onComplete: () => resolve(),
      overwrite: 'auto',
    });
  });
}

/** Planet explosion — 400ms, spawn a screen-edge flash via caller. */
export function explodePlanet(sprite: AnimTarget): Promise<void> {
  return new Promise<void>((resolve) => {
    gsap.to(sprite, {
      pixi: { scale: 1.8, alpha: 0 },
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => resolve(),
      overwrite: 'auto',
    });
  });
}

/** Crystal sparkle — 150ms pop + fade. */
export function sparkCrystal(sprite: AnimTarget): Promise<void> {
  return new Promise<void>((resolve) => {
    gsap.to(sprite, {
      pixi: { scale: 1.2, alpha: 0 },
      duration: 0.15,
      ease: 'back.out(1.7)',
      onComplete: () => resolve(),
      overwrite: 'auto',
    });
  });
}

/** Adjacent egg ripple — visual-only (no hp change). */
export function rippleNeighbor(sprite: AnimTarget): void {
  gsap.to(sprite, {
    pixi: { scale: 1.08 },
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    overwrite: 'auto',
  });
}

/**
 * Safe destruction helper — kills tweens, removes listeners, detaches,
 * and destroys with children. This is the canonical order enforced by
 * the GSAP guardrail.
 */
export function destroyWithTweenKill(sprite: AnimTarget): void {
  gsap.killTweensOf(sprite);
  sprite.removeAllListeners?.();
  sprite.parent?.removeChild?.(sprite);
  sprite.destroy?.({ children: true });
}
