/**
 * HudRenderer — GPU Pixi text nodes for HUD.
 *
 * Renders orb count, score, level number, pause button.
 * Top 101px budget (HUD zone per viewport-budget); pause button 44x44 px
 * at top-right (mobile touch target).
 *
 * Renderers translate ECS state into Pixi visuals. They never hold game state.
 * Read from ECS via update() calls; do NOT query the DB directly.
 */

import { Container, Text, TextStyle, Graphics } from 'pixi.js';

export interface HudUpdate {
  score: number;
  orbsRemaining: number;
  level: number;
}

export interface HudCallbacks {
  onPauseTap?: () => void;
}

export class HudRenderer {
  readonly container: Container;
  private scoreText: Text | null = null;
  private orbsText: Text | null = null;
  private levelText: Text | null = null;
  private pauseButton: Container | null = null;
  private width = 0;

  constructor(private readonly callbacks: HudCallbacks = {}) {
    this.container = new Container();
    this.container.eventMode = 'passive'; // children are interactive
  }

  init(data: HudUpdate, viewportW: number, _viewportH: number, _reservedTop = 0): void {
    this.width = viewportW;

    const style = new TextStyle({
      fontFamily: 'Baloo, system-ui, sans-serif',
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: '700',
    });

    // Orb count — top-left.
    const orbs = new Text({ text: `Orbs: ${data.orbsRemaining}`, style });
    orbs.position.set(16, 20);
    this.orbsText = orbs;
    this.container.addChild(orbs);

    // Score — top-center.
    const score = new Text({ text: `Score: ${data.score}`, style });
    score.position.set(Math.max(140, viewportW / 2 - 60), 20);
    this.scoreText = score;
    this.container.addChild(score);

    // Level — small text, under orb count.
    const levelStyle = new TextStyle({
      fontFamily: 'Baloo, system-ui, sans-serif',
      fontSize: 14,
      fill: 0xcccccc,
      fontWeight: '400',
    });
    const level = new Text({ text: `Level ${data.level}`, style: levelStyle });
    level.position.set(16, 54);
    this.levelText = level;
    this.container.addChild(level);

    // Pause button — top-right, 44×44 px hit area.
    const pauseBtn = new Container();
    pauseBtn.eventMode = 'static';
    const btnBg = new Graphics()
      .rect(0, 0, 44, 44)
      .fill({ color: 0xffffff, alpha: 0.15 });
    const pauseGlyph = new Text({
      text: '||',
      style: new TextStyle({
        fontFamily: 'monospace',
        fontSize: 22,
        fill: 0xffffff,
        fontWeight: '700',
      }),
    });
    pauseGlyph.position.set(12, 8);
    pauseBtn.addChild(btnBg);
    pauseBtn.addChild(pauseGlyph);
    pauseBtn.position.set(viewportW - 44 - 16, 16);
    pauseBtn.on('pointertap', () => {
      this.callbacks.onPauseTap?.();
    });
    this.pauseButton = pauseBtn;
    this.container.addChild(pauseBtn);
  }

  update(data: HudUpdate): void {
    if (this.scoreText) this.scoreText.text = `Score: ${data.score}`;
    if (this.orbsText) this.orbsText.text = `Orbs: ${data.orbsRemaining}`;
    if (this.levelText) this.levelText.text = `Level ${data.level}`;
  }

  /** Reposition HUD when the viewport resizes. */
  resize(viewportW: number): void {
    this.width = viewportW;
    if (this.scoreText) {
      this.scoreText.position.set(Math.max(140, viewportW / 2 - 60), 20);
    }
    if (this.pauseButton) {
      this.pauseButton.position.set(viewportW - 44 - 16, 16);
    }
  }

  destroy(): void {
    // Pause button first — it has a listener.
    this.pauseButton?.removeAllListeners();
    this.pauseButton?.parent?.removeChild(this.pauseButton);
    this.pauseButton?.destroy({ children: true });
    this.pauseButton = null;

    this.scoreText?.parent?.removeChild(this.scoreText);
    this.scoreText?.destroy();
    this.scoreText = null;

    this.orbsText?.parent?.removeChild(this.orbsText);
    this.orbsText?.destroy();
    this.orbsText = null;

    this.levelText?.parent?.removeChild(this.levelText);
    this.levelText?.destroy();
    this.levelText = null;

    this.container.parent?.removeChild(this.container);
    this.container.destroy({ children: true });

    // silence unused warning for the field on older TS configs
    void this.width;
  }
}
