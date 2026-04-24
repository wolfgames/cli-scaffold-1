/**
 * LauncherRenderer — GPU launcher handle + hit target at bottom-center of
 * the play area. Emoji-backed sprite (🚀) with a ≥ 44×44 px touch region.
 */

import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import type { Vec2Like } from '../physics/orbPhysics';

export interface LauncherInitArgs {
  origin: Vec2Like;
}

export class LauncherRenderer {
  readonly container: Container;
  private handle: Text | null = null;
  private hitRing: Graphics | null = null;

  constructor() {
    this.container = new Container();
    this.container.eventMode = 'passive';
  }

  init(args: LauncherInitArgs): void {
    // Hit ring — 44×44px touch target, semi-transparent.
    const ring = new Graphics()
      .circle(0, 0, 28)
      .fill({ color: 0xffffff, alpha: 0.12 })
      .circle(0, 0, 28)
      .stroke({ color: 0xffffff, width: 2, alpha: 0.5 });
    ring.position.set(args.origin.x, args.origin.y);
    this.hitRing = ring;
    this.container.addChild(ring);

    // Emoji launcher icon.
    const style = new TextStyle({
      fontSize: 32,
      fill: 0xffffff,
    });
    const handle = new Text({ text: '🚀', style });
    handle.anchor?.set?.(0.5, 0.5);
    handle.position.set(args.origin.x, args.origin.y);
    this.handle = handle;
    this.container.addChild(handle);
  }

  /** Rotate the handle sprite to follow aim angle (in radians). */
  pointAt(angleRad: number): void {
    if (this.handle) this.handle.rotation = angleRad + Math.PI / 2;
  }

  /** Reset rotation on release/cancel. */
  reset(): void {
    if (this.handle) this.handle.rotation = 0;
  }

  destroy(): void {
    this.handle?.parent?.removeChild(this.handle);
    this.handle?.destroy();
    this.handle = null;
    this.hitRing?.parent?.removeChild(this.hitRing);
    this.hitRing?.destroy();
    this.hitRing = null;
    this.container.parent?.removeChild(this.container);
    this.container.destroy({ children: true });
  }
}
