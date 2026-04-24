/**
 * EntityRenderer — renders game entities as emoji text nodes on the GPU canvas.
 *
 * Core pass (OQ-004): emoji placeholders satisfy the canvas CoS at 48×48px.
 * Later asset pass replaces each glyph with a scene-sprites-marsbounce sprite.
 *
 * Renderer holds sprite references keyed by entity id. Sync via syncFromLevel(),
 * which is cheap because we rebuild from current ECS state — the board rarely
 * has >30 entities.
 */

import { Container, Text, TextStyle } from 'pixi.js';
import { ROCK_PEG_GLYPH } from '../entities/RockPeg';
import { ALIEN_EGG_GLYPH, EGG_COLOR_TINTS } from '../entities/AlienEgg';
import { ALIEN_PLANET_GLYPH } from '../entities/AlienPlanet';
import { ENERGY_CRYSTAL_GLYPH } from '../entities/EnergyCrystal';
import type { LevelConfig } from '../levels/levelLoader';

interface RenderedEntity {
  sprite: Text;
}

export class EntityRenderer {
  readonly container: Container;
  private rendered: RenderedEntity[] = [];

  constructor() {
    this.container = new Container();
    this.container.eventMode = 'passive';
  }

  /** Clear and rebuild visuals from a LevelConfig. */
  syncFromLevel(cfg: LevelConfig): void {
    this.clear();

    // Pegs.
    for (const peg of cfg.pegs) {
      this.rendered.push({
        sprite: this.spawnGlyph(ROCK_PEG_GLYPH, peg.x, peg.y, 32),
      });
    }
    // Eggs with color tint.
    for (const egg of cfg.eggs) {
      const sprite = this.spawnGlyph(ALIEN_EGG_GLYPH, egg.x, egg.y, 40);
      sprite.tint = EGG_COLOR_TINTS[egg.color] ?? 0xffffff;
      this.rendered.push({ sprite });
    }
    // Optional planet.
    if (cfg.planet) {
      this.rendered.push({
        sprite: this.spawnGlyph(ALIEN_PLANET_GLYPH, cfg.planet.x, cfg.planet.y, 52),
      });
    }
    // Crystals.
    for (const c of cfg.crystals) {
      this.rendered.push({
        sprite: this.spawnGlyph(ENERGY_CRYSTAL_GLYPH, c.x, c.y, 28),
      });
    }
  }

  private spawnGlyph(glyph: string, x: number, y: number, sizePx: number): Text {
    const style = new TextStyle({ fontSize: sizePx, fill: 0xffffff });
    const t = new Text({ text: glyph, style });
    t.anchor?.set?.(0.5, 0.5);
    t.position.set(x, y);
    this.container.addChild(t);
    return t;
  }

  private clear(): void {
    for (const r of this.rendered) {
      r.sprite.parent?.removeChild(r.sprite);
      r.sprite.destroy();
    }
    this.rendered = [];
  }

  destroy(): void {
    this.clear();
    this.container.parent?.removeChild(this.container);
    this.container.destroy({ children: true });
  }
}
