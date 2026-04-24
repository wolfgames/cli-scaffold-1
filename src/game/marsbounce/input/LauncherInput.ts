/**
 * LauncherInput — drag/aim/release input for the orb launcher.
 *
 * Pure logic module. Takes pointer coordinates (world space) and dispatches
 * aim / fire / cancel callbacks. The controller connects this to Pixi
 * pointer events; tests can drive it directly.
 *
 * Downward drags are silent cancels (per GDD). Input is gated by
 * `canAcceptInput()` — the controller wires this to the ECS board state
 * via `canAcceptInput(boardState.current)`.
 */

import type { Vec2Like } from '../physics/orbPhysics';

export interface AimPayload {
  angleRad: number;
  dragLength: number;
}

export interface FirePayload {
  angleRad: number;
  speed: number;
}

export interface LauncherDeps {
  origin: Vec2Like;
  canAcceptInput: () => boolean;
  onAim: (payload: AimPayload) => void;
  onFire: (payload: FirePayload) => void;
  onCancel: () => void;
  /** Max pixel speed at max drag. Scales linearly with drag length. */
  maxSpeed?: number;
  /** Drag length that yields maxSpeed. */
  maxDragPx?: number;
  /** Minimum upward drag before release can fire. */
  minDragPx?: number;
}

export interface LauncherInput {
  handlePointerDown: (pt: Vec2Like) => void;
  handlePointerMove: (pt: Vec2Like) => void;
  handlePointerUp: (pt: Vec2Like) => void;
  isAiming: () => boolean;
}

export function createLauncherInput(deps: LauncherDeps): LauncherInput {
  const maxSpeed = deps.maxSpeed ?? 14;
  const maxDragPx = deps.maxDragPx ?? 260;
  const minDragPx = deps.minDragPx ?? 24;

  let aiming = false;
  let lastAim: AimPayload | null = null;

  const computeAim = (pt: Vec2Like): AimPayload => {
    const dx = pt.x - deps.origin.x;
    const dy = pt.y - deps.origin.y;
    const dragLength = Math.hypot(dx, dy);
    // Raw angle: positive-y-down math. Upward = negative dy.
    const angleRad = Math.atan2(dy, dx);
    return { angleRad, dragLength };
  };

  const isValidUpward = (aim: AimPayload): boolean => {
    // Upward means angleRad in (-PI, 0) in screen coords.
    return aim.angleRad < 0 && aim.dragLength >= minDragPx;
  };

  return {
    handlePointerDown(_pt) {
      if (!deps.canAcceptInput()) return;
      aiming = true;
      lastAim = null;
    },
    handlePointerMove(pt) {
      if (!aiming || !deps.canAcceptInput()) return;
      const aim = computeAim(pt);
      lastAim = aim;
      deps.onAim(aim);
    },
    handlePointerUp(pt) {
      if (!aiming) return;
      aiming = false;
      if (!deps.canAcceptInput()) return;
      const aim = lastAim ?? computeAim(pt);
      if (isValidUpward(aim)) {
        const clampedDrag = Math.min(aim.dragLength, maxDragPx);
        const speed = (clampedDrag / maxDragPx) * maxSpeed;
        deps.onFire({ angleRad: aim.angleRad, speed });
      } else {
        deps.onCancel();
      }
    },
    isAiming: () => aiming,
  };
}
