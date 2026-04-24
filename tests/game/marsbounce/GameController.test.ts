/**
 * GameController — init and destroy tests for Mars Bounce
 *
 * These tests mock Pixi so we can verify lifecycle ordering without
 * touching a real GPU canvas.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Stub `document` / `window` for the node env before anything imports Pixi.
if (typeof (globalThis as unknown as { document?: unknown }).document === 'undefined') {
  const makeEl = () => {
    const el: Record<string, unknown> = {
      appendChild: () => undefined,
      removeChild: () => undefined,
      children: [],
      style: {},
      setAttribute: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => true,
      remove: () => undefined,
    };
    return el;
  };
  (globalThis as unknown as { document: { createElement: (tag: string) => unknown } }).document = {
    createElement: () => makeEl(),
  };
}
if (typeof (globalThis as unknown as { window?: unknown }).window === 'undefined') {
  (globalThis as unknown as { window: { devicePixelRatio: number; innerHeight: number; innerWidth: number; location: { origin: string } } }).window = {
    devicePixelRatio: 1,
    innerHeight: 844,
    innerWidth: 390,
    location: { origin: 'http://localhost' },
  };
}

// Mock Pixi before importing the controller.
vi.mock('pixi.js', () => {
  class MockApplication {
    stage = { addChild: vi.fn(), eventMode: 'passive', removeChildren: vi.fn() };
    canvas: HTMLCanvasElement;
    screen = { width: 390, height: 844 };
    ticker = { addOnce: (fn: () => void) => fn() };
    constructor() {
      this.canvas = document.createElement('canvas');
    }
    init = vi.fn().mockResolvedValue(undefined);
    destroy = vi.fn();
  }
  class MockContainer {
    children: unknown[] = [];
    eventMode = 'passive';
    position = { set: vi.fn(), x: 0, y: 0 };
    parent: unknown = null;
    addChild = vi.fn((c: unknown) => { this.children.push(c); return c; });
    removeChild = vi.fn();
    removeChildren = vi.fn();
    destroy = vi.fn();
    removeAllListeners = vi.fn();
    on = vi.fn();
    off = vi.fn();
  }
  class MockText {
    text = '';
    style: Record<string, unknown> = {};
    position = { set: vi.fn(), x: 0, y: 0 };
    constructor(opts?: { text?: string; style?: Record<string, unknown> }) {
      if (opts?.text) this.text = opts.text;
      if (opts?.style) this.style = opts.style;
    }
    destroy = vi.fn();
  }
  class MockGraphics {
    rect = vi.fn().mockReturnThis();
    fill = vi.fn().mockReturnThis();
    circle = vi.fn().mockReturnThis();
    stroke = vi.fn().mockReturnThis();
    moveTo = vi.fn().mockReturnThis();
    lineTo = vi.fn().mockReturnThis();
    clear = vi.fn().mockReturnThis();
    position = { set: vi.fn(), x: 0, y: 0 };
    destroy = vi.fn();
  }
  return {
    Application: MockApplication,
    Container: MockContainer,
    Text: MockText,
    Graphics: MockGraphics,
    TextStyle: class { constructor(public style?: unknown) {} },
  };
});

// Mock GSAP to avoid timer complications
vi.mock('gsap', () => ({
  default: {
    to: vi.fn(),
    killTweensOf: vi.fn(),
    delayedCall: vi.fn(),
    timeline: vi.fn(() => ({ to: vi.fn().mockReturnThis(), play: vi.fn(), kill: vi.fn() })),
  },
  gsap: {
    to: vi.fn(),
    killTweensOf: vi.fn(),
    delayedCall: vi.fn(),
    timeline: vi.fn(() => ({ to: vi.fn().mockReturnThis(), play: vi.fn(), kill: vi.fn() })),
  },
}));

import { setupGame } from '~/game/marsbounce/screens/gameController';
import { activeDb } from '~/core/systems/ecs/DbBridge';

function makeDeps() {
  return {
    coordinator: {
      audio: { play: vi.fn(), stop: vi.fn(), unlock: vi.fn() },
      initGpu: vi.fn().mockResolvedValue(undefined),
      getGpuApp: vi.fn(),
    } as unknown as Parameters<typeof setupGame>[0]['coordinator'],
    tuning: { scaffold: {} as never, game: {} as never },
    audio: {},
    gameData: {},
    analytics: {},
  } as Parameters<typeof setupGame>[0];
}

describe('GameController — init and destroy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GameScreen.tsx mounts — Pixi application initializes and ECS DB is registered', async () => {
    const controller = setupGame(makeDeps());
    expect(controller.gameMode).toBe('pixi');

    const container = document.createElement('div');
    controller.init(container);
    // Give the init promise a microtask to resolve
    await new Promise((r) => setTimeout(r, 0));

    // ECS DB should be registered via setActiveDb
    expect(activeDb()).not.toBeNull();

    controller.destroy();
  });

  it('controller.destroy() cleans up — no active DB, no errors', async () => {
    const controller = setupGame(makeDeps());
    const container = document.createElement('div');
    controller.init(container);
    await new Promise((r) => setTimeout(r, 0));

    expect(activeDb()).not.toBeNull();

    // Should not throw
    expect(() => controller.destroy()).not.toThrow();
    // After destroy, activeDb is null
    expect(activeDb()).toBeNull();
  });
});
