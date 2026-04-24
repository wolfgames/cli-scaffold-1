/**
 * TrajectoryRenderer — dotted trajectory line drawn from Segment[] produced
 * by trajectoryPreview(). Drawn on the board layer; cleared when the player
 * releases or cancels.
 *
 * Alpha fades toward the end of the line (tail reads as "predicted").
 */

import { Container, Graphics } from 'pixi.js';
import type { Segment } from '../physics/trajectoryPreview';

const DOT_RADIUS = 3;
const DOT_SPACING = 14;
const BASE_ALPHA = 0.85;
const MIN_ALPHA = 0.15;
const COLOR = 0xffffff;

export class TrajectoryRenderer {
  readonly container: Container;
  private gfx: Graphics | null = null;

  constructor() {
    this.container = new Container();
    this.container.eventMode = 'none';
  }

  init(): void {
    const gfx = new Graphics();
    this.gfx = gfx;
    this.container.addChild(gfx);
  }

  render(segments: readonly Segment[]): void {
    if (!this.gfx) return;
    this.gfx.clear();

    if (segments.length === 0) return;

    // Compute full path length for alpha falloff.
    let totalLen = 0;
    for (const s of segments) {
      totalLen += Math.hypot(s.bx - s.ax, s.by - s.ay);
    }
    if (totalLen <= 0) return;

    let traveled = 0;
    for (const seg of segments) {
      const segLen = Math.hypot(seg.bx - seg.ax, seg.by - seg.ay);
      if (segLen <= 0) continue;
      const nx = (seg.bx - seg.ax) / segLen;
      const ny = (seg.by - seg.ay) / segLen;

      // Place dots along the segment.
      for (let d = 0; d < segLen; d += DOT_SPACING) {
        const t = (traveled + d) / totalLen;
        const alpha = BASE_ALPHA * (1 - t) + MIN_ALPHA * t;
        const x = seg.ax + nx * d;
        const y = seg.ay + ny * d;
        this.gfx
          .circle(x, y, DOT_RADIUS)
          .fill({ color: COLOR, alpha });
      }
      traveled += segLen;
    }
  }

  clear(): void {
    this.gfx?.clear();
  }

  destroy(): void {
    this.gfx?.parent?.removeChild(this.gfx);
    this.gfx?.destroy();
    this.gfx = null;
    this.container.parent?.removeChild(this.container);
    this.container.destroy({ children: true });
  }
}
