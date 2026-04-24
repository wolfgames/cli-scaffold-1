/**
 * firstTimeFlag — localStorage-backed first-time-player flag.
 *
 * Keeps the intro cutscene from re-showing. Survives page reload. Writing
 * is tolerant of no-storage environments (private mode / tests).
 */

const KEY = 'marsbounce.hasSeenIntro';

export function isFirstTimePlayer(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(KEY) !== '1';
  } catch {
    return true; // default to "yes, they're new" on storage failure
  }
}

export function clearFirstTimePlayer(): void {
  try {
    localStorage?.setItem(KEY, '1');
  } catch {
    /* silently ignore */
  }
}
