/**
 * Mars Bounce — GameController (Pixi mode)
 *
 * Central integration point. Wiring sequence (per game-controller.mdc):
 *
 *   1. ECS DB created from plugin → setActiveDb(db) → bridgeEcsToSignals(db)
 *   2. Pixi Application initialized → layers created (bg, board, hud, ui)
 *   3. Renderers instantiated with stage layers and layout bounds
 *   4. Input routed from boardRenderer.container via pointertap (wired in batch 2)
 *   5. Game actions dispatched through ecsDb.actions.* / transactions.*
 *
 * Teardown order (critical — tweens must die before sprites):
 *   Pixi app destroy → ECS bridge cleanup → setActiveDb(null) → ecsDb = null
 */

import { createSignal } from 'solid-js';
import { Application, Container } from 'pixi.js';

import type {
  GameControllerDeps,
  GameController,
  SetupGame,
} from '~/game/mygame-contract';

import { createMarsBounceWorld, type MarsBounceDatabase } from '../state/MarsBouncePlugin';
import { gameState } from '~/game/state';
import { zoneForLevel } from '../levels/levelGenerator';
import { bridgeEcsToSignals, type BridgeCleanup } from '../state/bridgeEcsToSignals';
import { setActiveDb } from '~/core/systems/ecs/DbBridge';
import { HudRenderer } from '../renderers/HudRenderer';
import { LauncherRenderer } from '../renderers/LauncherRenderer';
import { TrajectoryRenderer } from '../renderers/TrajectoryRenderer';
import { EntityRenderer } from '../renderers/EntityRenderer';
import { createLauncherInput, type LauncherInput } from '../input/LauncherInput';
import { canAcceptInput, nextBoardState } from '../state/boardStateMachine';
import { previewTrajectory } from '../physics/trajectoryPreview';
import { loadLevel, type LevelConfig } from '../levels/levelLoader';
import {
  spawnRockPeg,
  spawnAlienEgg,
  spawnAlienPlanet,
  spawnEnergyCrystal,
} from '../entities';
import { playWinSequence } from '../sequences/winSequence';
import { playLossSequence } from '../sequences/lossSequence';

export const setupGame: SetupGame = (deps: GameControllerDeps): GameController => {
  const [ariaText, setAriaText] = createSignal('Game loading…');
  const navigate = deps.goto ?? (() => { /* no-op when goto not provided */ });

  // Stable references we clean up in destroy().
  let app: Application | null = null;
  let bgLayer: Container | null = null;
  let boardLayer: Container | null = null;
  let hudLayer: Container | null = null;
  let uiLayer: Container | null = null;
  let hud: HudRenderer | null = null;
  let launcher: LauncherRenderer | null = null;
  let trajectory: TrajectoryRenderer | null = null;
  let entities: EntityRenderer | null = null;
  let currentLevel: LevelConfig | null = null;
  let launcherInput: LauncherInput | null = null;
  let ecsDb: MarsBounceDatabase | null = null;
  let unbridge: BridgeCleanup | null = null;
  let hudUnsubscribers: Array<() => void> = [];
  // Stage-level pointer listeners we install in init() and remove in destroy().
  let pointerListeners: Array<{ event: string; fn: (e: unknown) => void }> = [];
  // Guard: sequences fire once per terminal state.
  let sequenceFired = false;

  return {
    gameMode: 'pixi',

    init(container: HTMLDivElement) {
      setAriaText('Mars Bounce — gameplay loading');

      // 1. ECS DB first, so the bridge is ready as Pixi spins up.
      ecsDb = createMarsBounceWorld();
      // Seed level from the Solid signal so NEXT LEVEL progression carries over.
      // bridgeEcsToSignals will overwrite the signal with ECS value — we set ECS
      // first so the signal gets the correct level after bridging.
      const startLevel = gameState.level();
      if (startLevel > 1) {
        ecsDb.transactions.setLevel({ level: startLevel, zone: zoneForLevel(startLevel) });
      }
      setActiveDb(ecsDb);
      unbridge = bridgeEcsToSignals(ecsDb);

      // 2. Pixi Application — async init, wire teardown on any failure.
      const pixiApp = new Application();
      app = pixiApp;
      pixiApp
        .init({
          resizeTo: container,
          background: 0x0b0f1a, // dark starfield
          resolution: Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio ?? 1, 2),
          antialias: true,
        })
        .then(() => {
          if (!app) return; // destroy() ran while init was pending
          container.appendChild(pixiApp.canvas as HTMLCanvasElement);

          pixiApp.stage.eventMode = 'static';

          bgLayer = new Container();
          bgLayer.eventMode = 'none';
          boardLayer = new Container();
          boardLayer.eventMode = 'passive';
          hudLayer = new Container();
          hudLayer.eventMode = 'passive';
          uiLayer = new Container();
          uiLayer.eventMode = 'passive';

          pixiApp.stage.addChild(bgLayer);
          pixiApp.stage.addChild(boardLayer);
          pixiApp.stage.addChild(hudLayer);
          pixiApp.stage.addChild(uiLayer);

          // 3. HUD renderer.
          hud = new HudRenderer({
            onPauseTap: () => {
              if (ecsDb) ecsDb.transactions.setBoardState({ state: 'paused' });
            },
          });
          hudLayer.addChild(hud.container);
          if (ecsDb) {
            hud.init(
              {
                score: ecsDb.resources.score,
                orbsRemaining: ecsDb.resources.orbsRemaining,
                level: ecsDb.resources.level,
              },
              pixiApp.screen.width,
              pixiApp.screen.height,
            );

            // Wire ECS resource changes → HUD update.
            const refreshHud = () => {
              if (!hud || !ecsDb) return;
              hud.update({
                score: ecsDb.resources.score,
                orbsRemaining: ecsDb.resources.orbsRemaining,
                level: ecsDb.resources.level,
              });
            };
            hudUnsubscribers.push(ecsDb.observe.resources.score(refreshHud));
            hudUnsubscribers.push(ecsDb.observe.resources.orbsRemaining(refreshHud));
            hudUnsubscribers.push(ecsDb.observe.resources.level(refreshHud));

            // Win/loss sequence observer. Fires once when boardState reaches
            // 'won' or 'lost' — then navigates to results. The guard ensures
            // the sequence fires exactly once even if the observer triggers
            // multiple times for the same terminal state.
            hudUnsubscribers.push(
              ecsDb.observe.resources.boardState((state) => {
                if (sequenceFired) return;
                if (state === 'won') {
                  sequenceFired = true;
                  void playWinSequence({
                    stage: pixiApp.stage as unknown as { addChild: (c: unknown) => unknown },
                    navigate: (screen) => navigate(screen),
                    starsEarned: ecsDb?.resources.starsEarned ?? 0,
                    score: ecsDb?.resources.score ?? 0,
                  });
                } else if (state === 'lost') {
                  sequenceFired = true;
                  void playLossSequence({
                    stage: pixiApp.stage as unknown as { addChild: (c: unknown) => unknown },
                    navigate: (screen) => navigate(screen),
                    eggsRemaining: 0,
                  });
                }
              }),
            );
          }

          // 4. Entity renderer + initial level load. Errors fall back to the
          // fallback-pool inside loadLevel — we never let a missing level
          // crash the canvas.
          entities = new EntityRenderer();
          boardLayer?.addChild(entities.container);
          void loadLevel(ecsDb?.resources.level ?? 1)
            .then((cfg) => {
              if (!ecsDb || !entities) return;
              currentLevel = cfg;
              // Sync the HUD total-orbs from the level.
              ecsDb.transactions.setOrbs({
                remaining: cfg.orbsTotal,
                total: cfg.orbsTotal,
              });
              // Populate ECS with entities from level.
              for (const p of cfg.pegs) spawnRockPeg(ecsDb, p);
              for (const e of cfg.eggs) spawnAlienEgg(ecsDb, e);
              if (cfg.planet) spawnAlienPlanet(ecsDb, cfg.planet);
              for (const c of cfg.crystals) spawnEnergyCrystal(ecsDb, c);
              // Paint the entities.
              entities.syncFromLevel(cfg);
            })
            .catch((err) => {
              console.error('[marsbounce] level load failed:', err);
            });

          // Launcher + trajectory renderers. Origin = bottom-center of the
          // play area. The GDD budget places the launcher ~127px from the
          // bottom; we center it horizontally and set y near the bottom-plus-
          // HUD safe zone. DOM logo reserves ~64px below the canvas.
          const origin = {
            x: pixiApp.screen.width / 2,
            y: pixiApp.screen.height - 127,
          };
          launcher = new LauncherRenderer();
          launcher.init({ origin });
          boardLayer?.addChild(launcher.container);

          trajectory = new TrajectoryRenderer();
          trajectory.init();
          boardLayer?.addChild(trajectory.container);

          // 5. Input wiring. Stage receives pointer events; we map to world
          // coordinates. Using `canAcceptInput(boardState)` for gating keeps
          // the state machine as the single source of truth.
          launcherInput = createLauncherInput({
            origin,
            canAcceptInput: () => canAcceptInput(ecsDb?.resources.boardState ?? 'loaded'),
            onAim: (payload) => {
              if (!ecsDb) return;
              // Move → aiming state (idempotent if already aiming).
              const currentState = ecsDb.resources.boardState;
              const next = nextBoardState(currentState, 'pointerDown');
              if (next !== currentState) {
                ecsDb.transactions.setBoardState({ state: next });
              }
              launcher?.pointAt(payload.angleRad);
              const obstacles = currentLevel
                ? [
                    ...currentLevel.pegs.map((p) => ({ x: p.x, y: p.y, r: p.radius })),
                    ...currentLevel.eggs.map((e) => ({ x: e.x, y: e.y, r: e.radius })),
                  ]
                : [];
              const segs = previewTrajectory(
                origin,
                payload.angleRad,
                Math.min(payload.dragLength / 20, 14),
                { left: 0, right: pixiApp.screen.width, top: 101 },
                obstacles,
                { maxReflections: 4, maxSteps: 600 },
              );
              trajectory?.render(segs);
            },
            onFire: (payload) => {
              if (!ecsDb) return;
              trajectory?.clear();
              launcher?.reset();
              const current = ecsDb.resources.boardState;
              ecsDb.transactions.setBoardState({
                state: nextBoardState(current, 'releaseValid'),
              });
              ecsDb.transactions.decrementOrbs();
              // Batch 3+ owns the actual orb physics tick loop; we record the
              // shot so later code can pick it up.
              ecsDb.transactions.recordShot({
                score: 0,
                ricochets: 0,
              });
              // Mark it resolved so the simple greenfield board returns to
              // idle. Real gameplay replaces this in batches 3–4.
              ecsDb.transactions.setBoardState({
                state: nextBoardState('animating', 'orbResolved'),
              });
              ecsDb.transactions.setBoardState({
                state: nextBoardState('resolving', 'scanComplete', {
                  won: false,
                  lost: ecsDb.resources.orbsRemaining <= 0,
                }),
              });
              void payload;
            },
            onCancel: () => {
              if (!ecsDb) return;
              trajectory?.clear();
              launcher?.reset();
              const current = ecsDb.resources.boardState;
              ecsDb.transactions.setBoardState({
                state: nextBoardState(current, 'releaseInvalid'),
              });
            },
          });

          // Pixi v8 stage listener. Translate the native point to world coords.
          const downFn = (e: { global?: { x: number; y: number } }) => {
            const pt = e.global;
            if (!pt) return;
            launcherInput?.handlePointerDown({ x: pt.x, y: pt.y });
          };
          const moveFn = (e: { global?: { x: number; y: number } }) => {
            const pt = e.global;
            if (!pt) return;
            launcherInput?.handlePointerMove({ x: pt.x, y: pt.y });
          };
          const upFn = (e: { global?: { x: number; y: number } }) => {
            const pt = e.global;
            if (!pt) return;
            launcherInput?.handlePointerUp({ x: pt.x, y: pt.y });
          };
          pixiApp.stage.on?.('pointerdown', downFn);
          pixiApp.stage.on?.('pointermove', moveFn);
          pixiApp.stage.on?.('pointerup', upFn);
          pixiApp.stage.on?.('pointerupoutside', upFn);
          pointerListeners.push({ event: 'pointerdown', fn: downFn as unknown as (e: unknown) => void });
          pointerListeners.push({ event: 'pointermove', fn: moveFn as unknown as (e: unknown) => void });
          pointerListeners.push({ event: 'pointerup', fn: upFn as unknown as (e: unknown) => void });
          pointerListeners.push({ event: 'pointerupoutside', fn: upFn as unknown as (e: unknown) => void });

          setAriaText('Mars Bounce — gameplay ready');
        })
        .catch((err) => {
          // Async init can fail (GPU denied etc). Surface the error, clean up eagerly.
          console.error('[marsbounce] Pixi init failed:', err);
          setAriaText('Unable to start the game.');
        });
    },

    destroy() {
      // Reset sequence guard so a re-init can fire sequences again.
      sequenceFired = false;

      // Remove stage pointer listeners BEFORE destroying the app so nothing
      // fires at a null input module.
      if (app?.stage) {
        for (const { event, fn } of pointerListeners) {
          try {
            app.stage.off?.(event, fn as never);
          } catch {
            /* already removed */
          }
        }
      }
      pointerListeners = [];
      launcherInput = null;

      // Renderers first — each kills its own tweens before releasing sprites.
      try {
        trajectory?.destroy();
      } catch (err) {
        console.warn('[marsbounce] Trajectory destroy error:', err);
      }
      trajectory = null;
      try {
        entities?.destroy();
      } catch (err) {
        console.warn('[marsbounce] Entity destroy error:', err);
      }
      entities = null;
      currentLevel = null;
      try {
        launcher?.destroy();
      } catch (err) {
        console.warn('[marsbounce] Launcher destroy error:', err);
      }
      launcher = null;
      try {
        hud?.destroy();
      } catch (err) {
        console.warn('[marsbounce] HUD destroy error:', err);
      }
      hud = null;

      // Stop ECS → HUD subscriptions before the DB disappears.
      for (const off of hudUnsubscribers) {
        try {
          off();
        } catch {
          /* already disposed */
        }
      }
      hudUnsubscribers = [];

      // 1. Pixi app — destroys all sprites, ticker, stage.
      try {
        app?.destroy(true, { children: true });
      } catch (err) {
        console.warn('[marsbounce] Pixi destroy error:', err);
      }
      app = null;
      bgLayer = null;
      boardLayer = null;
      hudLayer = null;
      uiLayer = null;

      // 2. ECS bridge — observer stops firing into destroyed renderers.
      try {
        unbridge?.();
      } catch {
        /* bridge already gone */
      }
      unbridge = null;

      // 3. Unregister DB from Inspector and null the ref.
      setActiveDb(null);
      ecsDb = null;

      setAriaText('Mars Bounce — game closed');
    },

    ariaText,
  };
};
