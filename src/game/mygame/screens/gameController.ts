/**
 * Game Controller — re-export of the active game
 *
 * The scaffold's GameScreen.tsx imports from `~/game/mygame/screens/gameController`.
 * We redirect that import to the Mars Bounce Pixi controller so the Screen
 * mounts the real game instead of the DOM stub.
 *
 * If you fork to a new game, swap the import below to point at your game's
 * setupGame factory.
 */

export { setupGame } from '~/game/marsbounce/screens/gameController';
