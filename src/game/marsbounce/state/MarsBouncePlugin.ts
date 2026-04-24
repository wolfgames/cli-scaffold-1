/**
 * MarsBouncePlugin — ECS plugin for Mars Bounce.
 *
 * Property order is runtime-enforced by @adobe/data:
 *   extends → services → components → resources → archetypes →
 *   computed → transactions → actions → systems
 *
 * ECS is the source of truth for game state. SolidJS signals are a DOM
 * bridge only (see bridgeEcsToSignals.ts).
 */

import { Database } from '@adobe/data/ecs';
import { Vec2, F32, U32, I32 } from '@adobe/data/math';

// Board/game-wide state keys. Kept narrow so Inspector displays read well.
export type BoardState =
  | 'loaded'
  | 'idle'
  | 'aiming'
  | 'animating'
  | 'resolving'
  | 'won'
  | 'lost'
  | 'paused';

export const marsBouncePlugin = Database.Plugin.create({
  // ── components (per-entity) ────────────────────────────────────────
  components: {
    // Numeric — linear memory layout.
    position: Vec2.schema,
    velocity: Vec2.schema,
    radius: F32.schema,
    hp: F32.schema,
    maxHp: F32.schema,
    scoreValue: F32.schema,

    // Oscillation for the Alien Planet (batch 9).
    oscillationRange: F32.schema,
    oscillationSpeed: F32.schema,

    // Kind / identity — short strings for Inspector legibility.
    entityKind: { type: 'string', default: '' } as const,
    eggColor: { type: 'string', default: 'green' } as const,
    spriteKey: { type: 'string', default: '' } as const,

    // Boolean flags.
    alive: { type: 'boolean', default: true } as const,
    collectible: { type: 'boolean', default: false } as const,

    // Integers for board coordinates.
    gridRow: I32.schema,
    gridCol: I32.schema,
    idTag: U32.schema,
  },

  // ── resources (singletons) ─────────────────────────────────────────
  resources: {
    score: { default: 0 as number },
    orbsRemaining: { default: 10 as number },
    orbsTotal: { default: 10 as number },
    level: { default: 1 as number },
    zone: { default: 1 as number },
    starsEarned: { default: 0 as number },
    boardState: { default: 'loaded' as BoardState },
    lastShotScore: { default: 0 as number },
    lastRicochetCount: { default: 0 as number },
  },

  // ── archetypes ─────────────────────────────────────────────────────
  archetypes: {
    Orb: ['position', 'velocity', 'radius', 'entityKind', 'alive'],
    RockPeg: ['position', 'radius', 'entityKind', 'spriteKey', 'alive'],
    AlienEgg: [
      'position',
      'radius',
      'hp',
      'maxHp',
      'eggColor',
      'entityKind',
      'spriteKey',
      'alive',
      'scoreValue',
    ],
    AlienPlanet: [
      'position',
      'radius',
      'hp',
      'maxHp',
      'entityKind',
      'spriteKey',
      'alive',
      'oscillationRange',
      'oscillationSpeed',
    ],
    EnergyCrystal: [
      'position',
      'radius',
      'entityKind',
      'spriteKey',
      'alive',
      'collectible',
    ],
  },

  // ── transactions (atomic mutations) ────────────────────────────────
  transactions: {
    addScore(store, args: { amount: number }) {
      store.resources.score = store.resources.score + args.amount;
    },
    setScore(store, args: { value: number }) {
      store.resources.score = args.value;
    },
    decrementOrbs(store) {
      store.resources.orbsRemaining = Math.max(0, store.resources.orbsRemaining - 1);
    },
    addOrbs(store, args: { amount: number }) {
      store.resources.orbsRemaining = store.resources.orbsRemaining + args.amount;
    },
    setOrbs(store, args: { remaining: number; total: number }) {
      store.resources.orbsRemaining = args.remaining;
      store.resources.orbsTotal = args.total;
    },
    setLevel(store, args: { level: number; zone: number }) {
      store.resources.level = args.level;
      store.resources.zone = args.zone;
    },
    setBoardState(store, args: { state: BoardState }) {
      store.resources.boardState = args.state;
    },
    setStarsEarned(store, args: { stars: number }) {
      store.resources.starsEarned = args.stars;
    },
    recordShot(store, args: { score: number; ricochets: number }) {
      store.resources.lastShotScore = args.score;
      store.resources.lastRicochetCount = args.ricochets;
    },
    resetLevel(store) {
      store.resources.score = 0;
      store.resources.starsEarned = 0;
      store.resources.boardState = 'loaded';
    },

    // Entity spawners — transactions because @adobe/data only allows
    // archetype inserts inside transactions/systems.
    spawnRockPeg(store, args: { x: number; y: number; radius: number }) {
      store.archetypes.RockPeg.insert({
        position: [args.x, args.y] as unknown as never,
        radius: args.radius,
        entityKind: 'rockPeg',
        spriteKey: 'peg-rock',
        alive: true,
      });
    },
    spawnAlienEgg(store, args: { x: number; y: number; radius: number; hp: number; color: string }) {
      store.archetypes.AlienEgg.insert({
        position: [args.x, args.y] as unknown as never,
        radius: args.radius,
        hp: args.hp,
        maxHp: args.hp,
        eggColor: args.color,
        entityKind: 'alienEgg',
        spriteKey: `egg-${args.color}`,
        alive: true,
        scoreValue: 200,
      });
    },
    spawnAlienPlanet(
      store,
      args: { x: number; y: number; radius: number; hp: number; oscillationRange: number; oscillationSpeed: number },
    ) {
      store.archetypes.AlienPlanet.insert({
        position: [args.x, args.y] as unknown as never,
        radius: args.radius,
        hp: args.hp,
        maxHp: args.hp,
        entityKind: 'alienPlanet',
        spriteKey: 'alien-planet',
        alive: true,
        oscillationRange: args.oscillationRange,
        oscillationSpeed: args.oscillationSpeed,
      });
    },
    spawnEnergyCrystal(store, args: { x: number; y: number; radius: number }) {
      store.archetypes.EnergyCrystal.insert({
        position: [args.x, args.y] as unknown as never,
        radius: args.radius,
        entityKind: 'energyCrystal',
        spriteKey: 'crystal-energy',
        alive: true,
        collectible: true,
      });
    },
    clearAllEntities(store) {
      // Helper for resetLevel: delete rows from every archetype.
      for (const kind of ['RockPeg', 'AlienEgg', 'AlienPlanet', 'EnergyCrystal'] as const) {
        const archetype = store.archetypes[kind];
        // @adobe/data archetypes expose iterate/delete in transactions.
        const ids = (store.select as (cols: string[]) => readonly number[])?.(['alive']);
        if (!ids) break;
        for (const id of ids) {
          try {
            (store as unknown as { delete: (id: number) => void }).delete(id);
          } catch {
            /* best-effort */
          }
        }
        void archetype;
        break; // only iterate once — select returns all `alive` rows
      }
    },
  },
});

export type MarsBounceDatabase = Database.FromPlugin<typeof marsBouncePlugin>;

/** Factory used by the controller and by tests. */
export function createMarsBounceWorld(): MarsBounceDatabase {
  return Database.create(marsBouncePlugin);
}
