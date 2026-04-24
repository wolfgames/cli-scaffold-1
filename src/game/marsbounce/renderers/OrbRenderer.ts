/**
 * OrbRenderer — animated energy-orb sprite for the in-flight projectile.
 *
 * The orb is a single emoji Text node (⚡) sized 24px; it is shown when the
 * orb launches and hidden after it resolves. The controller drives position
 * via moveTo(); the renderer never reads physics state directly.
 */

import { Container, Text, TextStyle } from 'pixi.js';
import type { Vec2Like } from '../physics/orbPhysics';

export const ORB_GLYPH = '⚡';
export const ORB_RADIUS = 9; // physics radius

export class OrbRenderer {
  readonly container: Container;
  private sprite: Text | null = null;

  constructor() {
    this.container = new Container();
    this.container.eventMode = 'none';
  }

  init(origin: Vec2Like): void {
    const sprite = new Text({
      text: ORB_GLYPH,
      style: new TextStyle({ fontSize: 24, fill: 0xffffff }),
    });
    sprite.anchor?.set?.(0.5, 0.5);
    sprite.position.set(origin.x, origin.y);
    sprite.visible = false;
    this.sprite = sprite;
    this.container.addChild(sprite);
  }

  /** Show the orb at the given position and make it visible. */
  launch(origin: Vec2Like): void {
    if (!this.sprite) return;
    this.sprite.position.set(origin.x, origin.y);
    this.sprite.visible = true;
    this.sprite.alpha = 1;
  }

  /** Update position each physics tick. */
  moveTo(pos: Vec2Like): void {
    if (!this.sprite) return;
    this.sprite.position.set(pos.x, pos.y);
  }

  /** Hide the orb (called after resolve). */
  hide(): void {
    if (!this.sprite) return;
    this.sprite.visible = false;
  }

  destroy(): void {
    this.sprite?.parent?.removeChild(this.sprite);
    this.sprite?.destroy();
    this.sprite = null;
    this.container.parent?.removeChild(this.container);
    this.container.destroy({ children: true });
  }
}
