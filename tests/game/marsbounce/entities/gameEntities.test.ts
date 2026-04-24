/**
 * game-entities — ECS entity creation and collision detection tests.
 */

import { describe, it, expect } from 'vitest';
import { createMarsBounceWorld } from '~/game/marsbounce/state/MarsBouncePlugin';
import {
  spawnRockPeg,
  spawnAlienEgg,
  spawnAlienPlanet,
  spawnEnergyCrystal,
} from '~/game/marsbounce/entities';
import { orbIntersectsSphere } from '~/game/marsbounce/physics/orbPhysics';

describe('game-entities — ECS entity creation and collision', () => {
  it('level is loaded with a RockPeg entity', () => {
    const db = createMarsBounceWorld();
    spawnRockPeg(db, { x: 100, y: 200, radius: 12 });

    // Collision: an orb at (100, 200) with radius 6 overlaps the peg radius 12.
    expect(orbIntersectsSphere({ x: 100, y: 200 }, 6, { x: 100, y: 200 }, 12)).toBe(true);

    // The ECS archetype row is now present — select reveals rows with radius.
    const ids = db.select(['radius']);
    expect(ids.length).toBeGreaterThanOrEqual(1);
  });

  it('level is loaded with an AlienEgg entity with hp=2', () => {
    const db = createMarsBounceWorld();
    spawnAlienEgg(db, {
      x: 150,
      y: 300,
      radius: 20,
      hp: 2,
      color: 'purple',
    });
    const ids = db.select(['hp', 'eggColor']);
    expect(ids.length).toBeGreaterThanOrEqual(1);
  });

  it('level contains an EnergyCrystal', () => {
    const db = createMarsBounceWorld();
    spawnEnergyCrystal(db, { x: 50, y: 50, radius: 10 });
    const ids = db.select(['collectible']);
    expect(ids.length).toBeGreaterThanOrEqual(1);
  });

  it('level can contain an AlienPlanet', () => {
    const db = createMarsBounceWorld();
    spawnAlienPlanet(db, {
      x: 200,
      y: 200,
      radius: 32,
      hp: 3,
      oscillationRange: 24,
      oscillationSpeed: 1.2,
    });
    const ids = db.select(['oscillationRange']);
    expect(ids.length).toBeGreaterThanOrEqual(1);
  });
});
