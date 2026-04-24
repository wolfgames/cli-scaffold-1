# Mars Bounce
**Tagline:** Every ricochet brings the red planet alive.
**Genre:** Physics Arcade / Puzzle
**Platform:** Mobile first (portrait, touch), playable on web
**Target Audience:** Casual adults 30+

---

## Table of Contents

**The Game**
1. [Game Overview](#game-overview)
2. [At a Glance](#at-a-glance)

**How It Plays**
3. [Core Mechanics](#core-mechanics)
4. [Level Generation](#level-generation)

**How It Flows**
5. [Game Flow](#game-flow)

---

## Game Overview

Mars Bounce is a physics-based arcade game set on the colonized surface of Mars, where alien lifeforms have begun nesting in the red rocks. The player launches bouncing energy orbs from a base launcher, ricocheting them off ancient Martian rock formations and alien structures to pop glowing alien eggs before they hatch. Chain reactions across the terrain create satisfying combos and crystal bonuses that power up the colony's defenses for the next wave.

**Setting:** The wind-scoured plateau of Hellas Basin, Mars — a small human colony perched between towering basalt pillars and the ruins of an alien civilization that arrived long before us.

**Core Loop:** Player aims and launches a bouncing orb from the colony launcher → the orb ricochets off Martian rock pegs and terrain obstacles, popping alien eggs and collecting energy crystals with each collision → clearing all alien eggs before running out of orbs earns stars and advances the colony further into unexplored Martian territory.

## At a Glance

| | |
|---|---|
| **Input** | Drag to aim launcher, release to fire (one gesture) |
| **Play Surface** | Free canvas, portrait ~375×580 pt effective area |
| **Orb Count** | 5–10 per level (varies by difficulty tier) |
| **Egg Types** | 3 — Green (1 HP), Purple (2 HP), Orange (3 HP) |
| **Special Entities** | Alien Planet (5 HP, drifts, 0–3 per level), Energy Crystal (bonus orb + points) |
| **Levels** | 10 hand-crafted (tutorial/early) + procedural beyond |
| **Session Target** | 2–5 min per level |
| **Difficulty Curve** | Gradual; challenge begins at level 21 |
| **Failure** | Yes — orbs exhausted before clearing all eggs |
| **Continue System** | Watch ad for 3 extra orbs |
| **Star Rating** | 1–3 stars based on orbs remaining at level clear |
| **Chapters at Launch** | 4+ zones (Hellas Basin and beyond) |

## Core Mechanics

### Primary Input
**Input:** Drag on the launcher, then release.
**Acts on:** The aim angle of the colony launcher at the bottom-center of the screen.
**Produces:** An energy-orb projectile launched at the chosen angle; a dotted trajectory preview is shown while the finger is held down.

- Minimum hit area for the launcher drag handle: 44×44 pt.
- The launcher is positioned in the Natural thumb zone (bottom 40% of the screen, center column).
- Drag up and left/right to aim; dotted line previews the first 3–4 bounce reflections.
- Release to fire. Player taps/drags once per turn — no continuous aiming adjustments after release.
- If the player drags below the horizontal axis (aiming downward), no orb is fired; the drag is silently cancelled.

### Play Surface
**Shape:** Free canvas (no grid), portrait aspect ~9:16.
**Dimensions:** Full device viewport; game area extends from below the HUD (top ~12%) to above the launcher (bottom ~15%). Effective play area is approximately 375 × 580 pt on a reference 375 × 812 pt screen.
**Bounds:** Left wall, right wall, and top wall are solid reflective surfaces. The bottom edge is a "danger zone" — orbs that reach it are lost.
**Terrain:** Each level populates the canvas with a handcrafted arrangement of Martian Rock Pegs, Alien Eggs, Alien Planets, and Crystals.

### Game Entities

#### Energy Orb (projectile)
- **Visual:** A small glowing sphere (~18 pt diameter) with swirling energy trails; color matches the colony's current energy type.
- **Behavior:** Travels in a straight line from the launcher. Reflects off Rock Pegs, walls, Alien Planets, and the top boundary with equal angles (angle of incidence = angle of reflection). A very slight gravitational downward curve (~0.3 m/s² equivalent) adds natural arc.
- **Edge cases:** If an orb would bounce more than 20 times without hitting an Alien Egg or Crystal, it is removed (prevents infinite loops). Only one orb in flight at a time.

#### Martian Rock Peg
- **Visual:** A rough orange-red basalt column (~24 pt wide, 24 pt tall circle base). Glows faintly on impact.
- **Behavior:** Stationary. Reflects orbs. Does not break. Lights up orange for 300 ms on orb contact for tactile feedback.
- **Edge cases:** Rock Pegs at corners still reflect the orb; the orb leaves the peg perpendicular to the surface normal.

#### Alien Egg (primary target)
- **Visual:** A lumpy ovoid (~32 pt tall) in one of three colors — green, purple, or orange — with bioluminescent spots. Shows a crack sprite on the second hit.
- **Behavior:** Has 1–3 hit points (HP) depending on color. Green = 1 HP, Purple = 2 HP, Orange = 3 HP. Each orb impact reduces HP by 1. At 0 HP the egg explodes in a pop animation (200 ms), removing it from the field. Adjacent eggs within 40 pt receive a small shockwave that deals 0 HP damage (visual-only chain ripple).
- **Edge cases:** If the last egg is destroyed, the level ends immediately (no need to exhaust remaining orbs).

#### Alien Planet (obstacle + target hybrid)
- **Visual:** A small ringed planet (~48 pt diameter), in alien purples and teals, with a slow wobble animation. At least one per level; up to three.
- **Behavior:** Drifts slowly back and forth on a fixed horizontal path (oscillating, 2–6 pt/s). Acts as a reflective peg. Has 5 HP. Destroying an Alien Planet earns a Crystal Bonus (×2 multiplier on the next crystal collected). On destruction: a 400 ms explosion animation, screen-edge light flash.
- **Edge cases:** Alien Planet movement pauses while an orb is in the air to keep difficulty predictable.

#### Energy Crystal (collectible)
- **Visual:** A bright cyan hexagonal crystal (~20 pt), spinning slowly.
- **Behavior:** Stationary. When hit by an orb, it is collected (disappears in a 150 ms sparkle) and adds +50 points plus 1 bonus orb to the current turn's orb count. Crystals do not count toward level-clear condition.
- **Edge cases:** A maximum of 5 bonus orbs can be earned per level from crystals.

### Movement & Physics Rules

- IF an orb reaches the bottom edge → THEN the orb is removed from play; the turn ends; the orb counter decreases by 1.
- IF an orb hits a left, right, or top wall → THEN the orb reflects with equal angle of incidence and continues travel.
- IF an orb hits a Rock Peg → THEN the orb reflects off the peg surface; the peg flashes orange for 300 ms.
- IF an orb hits an Alien Egg → THEN the egg loses 1 HP; the orb continues traveling (passes through the egg position); if HP reaches 0 the egg pops.
- IF an orb hits an Alien Planet → THEN the planet loses 1 HP, reflects the orb; if HP reaches 0 the planet explodes.
- IF an orb hits an Energy Crystal → THEN the crystal is collected; the orb continues traveling.
- IF the orb has bounced 20 times without hitting an egg or crystal → THEN the orb is removed immediately.
- IF all Alien Eggs are destroyed → THEN the level-clear sequence begins immediately (orb disappears, fanfare plays).
- IF the player runs out of orbs before clearing all eggs → THEN the level-fail state triggers after the current orb resolves.
- IF the player taps while an orb is in flight → THEN the input is ignored; the launcher does not move.

> For invalid action feedback (visual, audio, duration), see [Feedback & Juice](#feedback--juice).

## Level Generation

### Method
**Hybrid** — levels 1–10 are fully hand-crafted to onboard players with curated layouts. Levels 11 onwards use procedural generation seeded by level number, validated against solvability and difficulty rules, with a hand-crafted fallback pool of 20 layouts.

### Generation Algorithm

**Step 1: Seed Initialization**
- Inputs: `levelNumber` (integer ≥ 11)
- Outputs: Seeded deterministic RNG instance
- Constraints: Seed formula = `levelNumber × 48271 + 9973`. Same level number always produces identical output. RNG must be fully resettable from the seed (no reference to `Math.random()`).

**Step 2: Difficulty Parameter Lookup**
- Inputs: `levelNumber`, difficulty curve table (see below)
- Outputs: `eggCount`, `orbCount`, `rockPegCount`, `alienPlanetCount`, `crystalCount`, `allowedEggTypes`
- Constraints: Parameters must stay within per-tier bounds (see Difficulty Curve). Orange 3-HP eggs not permitted before level 20.

**Step 3: Terrain Layout — Rock Pegs**
- Inputs: RNG instance, `rockPegCount`, canvas bounds (375 × 580 pt effective area)
- Outputs: Array of `{x, y}` positions for Rock Pegs
- Constraints: No peg within 28 pt of canvas edges. No two pegs closer than 36 pt center-to-center. Pegs may not occupy the bottom 15% of the play area (clear firing lane). At least 2 pegs within the central vertical corridor (x: 140–235 pt) to ensure non-trivial reflection opportunities.

**Step 4: Alien Planet Placement**
- Inputs: RNG instance, `alienPlanetCount`, existing peg positions, canvas bounds
- Outputs: Array of `{x, oscillationRange, speed}` for each Alien Planet
- Constraints: Each planet placed in the upper 60% of the play area. Minimum 80 pt separation between planets. Oscillation range 20–60 pt. Speed 2–6 pt/s (slower = easier; calculated as `2 + (levelNumber / 40) * 4`, capped at 6).

**Step 5: Alien Egg Placement**
- Inputs: RNG instance, `eggCount`, `allowedEggTypes`, existing entity positions
- Outputs: Array of `{x, y, hp, color}` for each egg
- Constraints: Eggs in the upper 70% of play area. No egg within 40 pt of another egg or peg (center-to-center). At least 60% of eggs must be reachable by a straight shot from the launcher without passing through a Rock Peg (direct line of sight). Egg color distribution: ≤ 40% orange, ≤ 40% purple, remainder green.

**Step 6: Crystal Placement**
- Inputs: RNG instance, `crystalCount`, existing entity positions
- Outputs: Array of `{x, y}` for each Crystal
- Constraints: Crystals may not be placed within 24 pt of any egg (prevents accidental collection masking an egg pop). At least 1 crystal per level.

**Step 7: Solvability Check**
- Inputs: Full layout, `orbCount`, a fast simulation pass
- Outputs: `isSolvable` boolean, estimated minimum orbs to clear
- Constraints: Run up to 500 simulated trajectories from evenly-spaced angles. If no combination of ≤ `orbCount` shots can reach every egg, reject the layout. Rejected layouts increment the retry counter.

### Seeding & Reproducibility
Seed formula: `levelNumber × 48271 + 9973`. The identical seed always produces the identical layout. Seeded RNG is passed through every generation step — no step calls `Math.random()` or any global RNG. Level data is a pure function of `levelNumber`.

### Solvability Validation
**Rejection conditions:**
1. Any Alien Egg has no reachable trajectory (fully occluded in all 500 test angles).
2. Minimum orbs to clear all eggs exceeds `orbCount` in simulation.
3. Two entities overlap (center-to-center distance < combined radii + 4 pt padding).
4. Fewer than 2 Rock Pegs exist in the central corridor (level too easy, no skill expression).

**Retry logic:** On rejection, increment `attempt` counter and re-run from Step 1 with seed `= originalSeed + attempt * 7919`. Maximum 10 attempts.

**Fallback chain:** After 10 failed attempts, select from the hand-crafted fallback pool (20 layouts, indexed by `levelNumber mod 20`). Fallback pool layouts are always solvable — they were validated at author time.

**Last-resort guarantee:** The fallback pool is loaded at game start and cached in memory. It is never generated at runtime. If the pool file fails to load (network error), the game serves level 1's hand-crafted layout and logs an error to Sentry.

### Difficulty Curve

| Level Range | Eggs | Orbs | Rock Pegs | Alien Planets | Allowed Egg Types |
|-------------|------|------|-----------|---------------|-------------------|
| 1–5 (hand-crafted) | 4–6 | 8–10 | 4–6 | 0 | Green only |
| 6–10 (hand-crafted) | 6–8 | 8–10 | 6–8 | 0–1 | Green, Purple |
| 11–20 | 8–12 | 8–10 | 6–10 | 1 | Green, Purple |
| 21–35 | 10–14 | 7–9 | 8–12 | 1–2 | All types |
| 36–60 | 12–16 | 6–8 | 10–14 | 2 | All types |
| 61+ | 14–20 | 5–8 | 10–16 | 2–3 | All types |

No difficulty parameters spike by more than 2 steps between adjacent levels. Levels 11–20 post-tutorial should feel effortless — the game has only earned the right to challenge from level 21 onward.

### Hand-Crafted Levels
Levels 1–10 are hand-crafted JSON layouts stored in `src/game/marsbounce/data/levels/hand-crafted/level-001.json` … `level-010.json`. A separate `fallback-pool.json` holds 20 additional layouts used as procedural fallback. Owned by the game designer; validated by the level generator's solvability checker on each CI build.

## Game Flow

### Master Flow Diagram

```
App Open
  ↓ (assets loaded)
Loading Screen [BOOT]
  ↓ (load complete, first-time)
First-Time Intro Cutscene [TITLE]
  ↓ (skip or complete)
  ↓ (returning player — bypass cutscene)
Title Screen [TITLE]
  ↓ (tap PLAY)
Chapter Start Interstitial [PROGRESSION]
  ↓ (tap Continue)
Gameplay Screen [PLAY]
  ↓ (all eggs cleared, orbs remain)
Level Complete Screen [OUTCOME]
  ↓ (tap Next Level — more levels in chapter)
Gameplay Screen [PLAY]   ← loop
  ↓ (final level of chapter cleared)
Chapter Complete Screen [OUTCOME]
  ↓ (tap Continue)
Chapter Start Interstitial (next chapter) [PROGRESSION]
  ↓ …

Gameplay Screen [PLAY]
  ↓ (orbs exhausted, eggs remain)
Loss Screen [OUTCOME]
  ↓ (tap Try Again)
Gameplay Screen [PLAY] (same level, same seed)

Gameplay Screen [PLAY]
  ↓ (tap Pause button)
Pause Overlay [PLAY — input suspended]
  ↓ (tap Resume)
Gameplay Screen [PLAY]
  ↓ (tap Quit)
Title Screen [TITLE]
```

### Screen Breakdown

#### Loading Screen
- **lifecycle_phase:** BOOT
- **Purpose:** Load all assets; show the game identity while the player waits.
- **Player sees:** Martian landscape silhouette, animated progress bar, "Mars Bounce" wordmark.
- **Player does:** Nothing — passive wait.
- **What happens next:** On load complete, first-time players proceed to Intro Cutscene; returning players proceed to Title Screen.
- **Expected duration:** 2–4 s (target < 3 s on mid-range device, 4G).

#### First-Time Intro Cutscene
- **lifecycle_phase:** TITLE
- **Purpose:** Establish the fiction — a distress signal from Mars, alien eggs detected.
- **Player sees:** 3–4 illustrated panels with brief text captions. A "Skip" button (44×44 pt, top-right).
- **Player does:** Read panels or tap Skip.
- **What happens next:** Title Screen.
- **Expected duration:** 15–30 s (skippable at any point).

#### Title Screen
- **lifecycle_phase:** TITLE
- **Purpose:** Re-entry point for returning sessions; showcase game identity.
- **Player sees:** Animated Mars surface background, game logo, PLAY button (large, centered), settings icon (top-right).
- **Player does:** Tap PLAY (→ Chapter Start Interstitial or most recent incomplete level). Tap settings to adjust audio.
- **What happens next:** Chapter Start Interstitial, or directly to Gameplay Screen if mid-chapter.

#### Chapter Start Interstitial
- **lifecycle_phase:** PROGRESSION
- **Purpose:** Announce the new chapter's zone; signal what has changed (terrain theme, alien type).
- **Player sees:** Chapter name ("Zone 1: Hellas Basin"), brief descriptive line, background art preview, CONTINUE button.
- **Player does:** Read, then tap CONTINUE.
- **What happens next:** Gameplay Screen (first level of chapter).
- **Expected duration:** 5–10 s.

#### Gameplay Screen
- **lifecycle_phase:** PLAY
- **Purpose:** The core play experience — aim, launch, bounce, pop.
- **Player sees:** Martian terrain canvas, current orb count (top HUD), level number, score, pause button (top-right). Launcher at bottom center with drag handle.
- **Player does:** Drag launcher handle to aim; release to fire; repeat until level is won or lost.
- **What happens next:** Level Complete Screen (win) or Loss Screen (loss).
- **Expected session length:** 2–5 min per level.

#### Pause Overlay
- **lifecycle_phase:** PLAY (input suspended)
- **Purpose:** Allow interruption without losing progress.
- **Player sees:** Blurred gameplay background, RESUME and QUIT buttons (each 44×44 pt minimum).
- **Player does:** Tap RESUME (return to game) or QUIT (return to Title Screen).
- **What happens next:** Gameplay Screen (resume) or Title Screen (quit, level progress preserved).

#### Level Complete Screen
- **lifecycle_phase:** OUTCOME
- **Purpose:** Celebrate clearing the level; show score and star rating.
- **Player sees:** Mars fanfare animation, 1–3 star rating, score total, NEXT LEVEL button (large, centered).
- **Player does:** Tap NEXT LEVEL.
- **What happens next:** Gameplay Screen (next level) or Chapter Complete Screen (if last level of chapter).
- **Expected duration:** 5–8 s.

#### Loss Screen
- **lifecycle_phase:** OUTCOME
- **Purpose:** Encourage a retry without blame.
- **Player sees:** "So close!" headline, remaining eggs count, TRY AGAIN button (large), optional "Watch ad for 3 more orbs" button.
- **Player does:** Tap TRY AGAIN (replay level, same seed) or watch ad for bonus orbs.
- **What happens next:** Gameplay Screen (same level).
- **Expected duration:** 3–5 s.

#### Chapter Complete Screen
- **lifecycle_phase:** OUTCOME
- **Purpose:** Reward completing a full chapter; unveil the zone story snippet.
- **Player sees:** Zone panorama art, short story text (2–3 sentences about what the colony discovered), CONTINUE button.
- **Player does:** Read, tap CONTINUE.
- **What happens next:** Chapter Start Interstitial (next chapter).
- **Expected duration:** 10–15 s.

### Board States

| State | Description | Input Allowed |
|-------|-------------|---------------|
| `idle` | Launcher visible, no orb in flight, awaiting player aim | Yes — drag to aim |
| `aiming` | Player is dragging the launcher handle; trajectory preview shown | Yes — drag to adjust aim, release to fire |
| `animating` | Orb in flight, bouncing, triggering pops and crystal collects | No — all input ignored |
| `resolving` | Last orb has resolved; checking win/lose condition | No |
| `won` | All eggs destroyed; win sequence playing | No |
| `lost` | Orbs exhausted before clearing eggs; loss sequence playing | No |
| `paused` | Pause overlay active; gameplay frozen | Yes — tap Resume or Quit only |

Any transition that changes visible entities (egg pop, crystal collect, planet explosion) is an animated transition — no instant state changes.

### Win Condition
`level.win` = TRUE when `count(alienEggs where hp > 0) == 0`

### Lose Condition
`level.lose` = TRUE when `orbsRemaining == 0 AND count(alienEggs where hp > 0) > 0`

### Win Sequence (ordered)
1. Final egg explodes (200 ms pop animation).
2. Orb in flight (if any) is removed from canvas.
3. Board state → `won`.
4. Screen-edge gold flash (100 ms).
5. "Level Clear!" text slides in from top (300 ms, GSAP `back.out`).
6. Stars animate in one by one (each 250 ms, GSAP `elastic.out`); 1–3 stars based on remaining orbs.
7. Score counter ticks up to final value (500 ms, GSAP ease).
8. NEXT LEVEL button fades in (200 ms).
9. Level complete fanfare SFX plays at step 4.

### Loss Sequence (ordered)
1. Last orb falls off the bottom edge.
2. Orb disappears with a brief flicker (150 ms).
3. Board state → `lost`.
4. Remaining alien eggs pulse with a soft glow (300 ms, GSAP yo-yo — gentle, not menacing).
5. "So close!" text fades in (300 ms).
6. Remaining egg count shown: "X eggs left..."
7. TRY AGAIN button fades in (200 ms).
8. Optional ad-offer button fades in 1 s after TRY AGAIN (non-intrusive, lower on screen).
9. Gentle low-tone SFX (no "failure" buzzer — encouraging tone).

