# Mars Bounce — Interaction Archetype

**Primary gesture:** drag-aim-release (non-standard).

## Contract

| Phase | Pointer events | Visible feedback | State side effects |
|-------|---------------|------------------|---------------------|
| **Idle** | `pointerdown` on launcher handle → `aiming` | launcher handle at rest | `boardState = aiming` |
| **Aiming** | `pointermove` updates aim angle | dotted trajectory line (3–4 reflections), launcher rotates toward pointer | none until release |
| **Release (valid)** | `pointerup` with upward angle | trajectory line fades; orb sprite launches | `boardState = animating`, `decrementOrbs` |
| **Release (invalid)** | `pointerup` with downward angle | silent cancel (no shake, no error flash — per GDD) | `boardState = idle` |
| **In flight** | all pointer input ignored | orb animates along physics, pegs/eggs react on hit | `boardState` stays `animating` until resolve |
| **Resolve** | n/a | win/loss sequence kicks in, or return to idle | `boardState = resolving` → `idle/won/lost` |

## Touch target

The launcher "handle" hit area is ≥ 44 × 44 px. The actual sprite can be smaller; the hit region is padded.

## Input gating

`LauncherInput` checks `boardState`:
- accepts `pointerdown` only when state is `idle`
- accepts `pointermove` only when state is `aiming`
- accepts `pointerup` only when state is `aiming`
- ignores all input when state is `animating`, `resolving`, `won`, `lost`, or `paused`

## Trajectory preview

Updated per pointer move (not per frame — avoids drift when still). Raycasts from the launch origin at the current aim angle, simulating up to `MAX_PREVIEW_REFLECTIONS = 4` wall/peg bounces. Renders as a GPU dotted line with alpha fading toward the end (tail reads as "predicted" vs "certain").

## Design-smell guard

- No downward cancel feedback. GDD is explicit — mis-aim is silent.
- No per-frame allocation in `pointermove`. Trajectory segment array is pooled.
