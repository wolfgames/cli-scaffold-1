/**
 * Mars Bounce entity spawners.
 *
 * Thin wrappers over MarsBouncePlugin transactions. Archetype inserts must
 * happen inside transactions per @adobe/data's store model, so these
 * delegate to db.transactions.spawn*.
 */

import type { MarsBounceDatabase } from '../state/MarsBouncePlugin';

export type EggColor = 'green' | 'purple' | 'orange';

export interface RockPegSpec {
  x: number;
  y: number;
  radius: number;
}

export interface AlienEggSpec {
  x: number;
  y: number;
  radius: number;
  hp: number;
  color: EggColor;
}

export interface AlienPlanetSpec {
  x: number;
  y: number;
  radius: number;
  hp: number;
  oscillationRange: number;
  oscillationSpeed: number;
}

export interface EnergyCrystalSpec {
  x: number;
  y: number;
  radius: number;
}

export function spawnRockPeg(db: MarsBounceDatabase, spec: RockPegSpec): void {
  db.transactions.spawnRockPeg(spec);
}

export function spawnAlienEgg(db: MarsBounceDatabase, spec: AlienEggSpec): void {
  db.transactions.spawnAlienEgg(spec);
}

export function spawnAlienPlanet(db: MarsBounceDatabase, spec: AlienPlanetSpec): void {
  db.transactions.spawnAlienPlanet(spec);
}

export function spawnEnergyCrystal(db: MarsBounceDatabase, spec: EnergyCrystalSpec): void {
  db.transactions.spawnEnergyCrystal(spec);
}
