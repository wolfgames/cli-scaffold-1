/**
 * MarsBouncePlugin — ECS state tests
 */

import { describe, it, expect } from 'vitest';
import { Database } from '@adobe/data/ecs';
import { marsBouncePlugin, createMarsBounceWorld } from '~/game/marsbounce/state/MarsBouncePlugin';
import { setActiveDb, activeDb } from '~/core/systems/ecs/DbBridge';

describe('MarsBouncePlugin — ECS state', () => {
  it('ECS DB created with score=0, orbsRemaining=orbsTotal, boardState=loaded; setActiveDb called', () => {
    // Given: game controller initializes with a level config
    const db = createMarsBounceWorld();

    // Score starts at 0
    expect(db.resources.score).toBe(0);
    // orbsRemaining starts equal to orbsTotal
    expect(db.resources.orbsRemaining).toBe(db.resources.orbsTotal);
    // boardState starts as 'loaded'
    expect(db.resources.boardState).toBe('loaded');

    // Bridge test — setActiveDb(db) registers it
    setActiveDb(db);
    expect(activeDb()).toBe(db);

    // Cleanup
    setActiveDb(null);
    expect(activeDb()).toBe(null);
  });

  it('ECS transaction addScore(100) fires and resource updates', () => {
    // Given: a fresh ECS DB
    const db = createMarsBounceWorld();
    expect(db.resources.score).toBe(0);

    // When: addScore(100) fires
    db.transactions.addScore({ amount: 100 });

    // Then: score equals 100
    expect(db.resources.score).toBe(100);
  });

  it('plugin is a Database.Plugin instance and produces a typed Database', () => {
    expect(marsBouncePlugin).toBeDefined();
    const db = Database.create(marsBouncePlugin);
    expect(db).toBeDefined();
    expect(typeof db.transactions.addScore).toBe('function');
  });
});
