---
type: game-report
game: "Mars Bounce"
pipeline_version: "0.3.8"
run: "01"
pass: core
status: partial
features:
  total: 22
  implemented: 19
  partial: 3
  deferred: 3
tests:
  new: 230
  passing: 230
  total: 230
issues:
  critical: 0
  minor: 3
cos:
  - id: core-interaction
    status: pass
    note: "interaction-archetype.md written; drag-aim-release archetype; pointer events with input gating; 44×44 touch target on launcher handle; one-gesture rule met; downward drag silently cancelled per GDD"
  - id: canvas
    status: pass
    note: "entity emoji glyphs all ≥48px after fix (egg was 40px → 48px); color+shape+glyph distinctiveness per OQ-004; HUD top 101px, launcher bottom 127px, 552px play area — no overlap at 390×844; dark starfield + colored entities = clear Mars identity"
  - id: animated-dynamics
    status: partial
    note: "orb travels visually via Pixi ticker loop (fixed in stabilize cycle 1); GSAP tween factories exist for peg/egg/planet/crystal; destroyWithTweenKill enforced; input blocked during animating state; ECS entity stable IDs; GAP: EntityRenderer does not call animation helpers on hit — egg pops and peg flashes are not wired into the tick loop collision callbacks"
  - id: scoring
    status: pass
    note: "multiplicative formula: targetScore + geometric ricochetBonus + singleShotBonus + crystalBonus, all scaled by remainingOrbMul; star thresholds 0.40/0.66 per OQ-001; checkWinLose wired; starsEarned bridged to SolidJS"
completeness:
  items_required: 19
  items_met: 14
  items_gaps: 5
blocking:
  cos_failed: []
  completeness_gaps:
    - "Interaction: Cascade escalation (speed, bounce, intensity scale with depth) — physics launcher has no chain-cascade concept; N/A for this genre in core pass"
    - "Core Mechanics: Input blocked during animations — orb blocks input correctly; egg-pop animations not yet wired into EntityRenderer collision callbacks"
    - "Board & Pieces: Gravity drop with per-piece animation (board-diff) — no grid; physics-based play; N/A for this genre shape"
    - "Board & Pieces: Cascade resolution (chains complete before next input) — single-orb game; chains are sequential by design; input blocked during animating state"
    - "Board & Pieces: New-piece spawning from top — no gravity-fill grid; physics launcher genre; N/A"
---

# Pipeline Report: Mars Bounce

## Blocking issues — must resolve before next pass

The following completeness gaps are **not actual blockers** for the next pass — they are genre-inapplicable items from the completeness checklist written for grid-match games. Mars Bounce is a physics launcher; it has no grid gravity-fill, no cascade chains in the match-3 sense, and no piece spawning from top. These items are correctly marked as N/A.

**One real gap must be resolved before `secondary` pass:**

- **Animated-dynamics partial — EntityRenderer hit wiring**: Entity collision animations (flashPeg, popEgg, explodePlanet, sparkCrystal) exist as GSAP tween factories and are fully tested. The `EntityRenderer` does not yet call these helpers when the orb tick loop detects a collision. The controller's `tickOrb` function detects hits but does not invoke entity animations. Resolution: wire `flashPeg`/`crackEgg`/`popEgg`/`sparkCrystal` calls into the tick loop collision branches (the helpers and their call sites are the only gap).

## Features

- [x] asset-manifest — scene-sprites-marsbounce, fx-particles-marsbounce, audio-sfx-marsbounce, audio-music-marsbounce, data-levels-marsbounce bundles
- [x] audio-system — SFX wiring: pegHit, eggPop, crystalCollect, planetExplode, winFanfare, lossTone, orbLaunch, wallBounce
- [x] pause-overlay — Mars-themed styling, RESUME/QUIT buttons 44×44 px min
- [x] loading-screen — Martian landscape silhouette, animated progress bar, 'Mars Bounce' wordmark, first-time routing
- [x] title-screen — animated Mars surface background, PLAY button, settings icon, unlockAudio on PLAY tap
- [x] results-screen — star rating, score counter, win/loss branching, ad-offer (stub), starsEarned from ECS
- [x] game-screen-shell — Pixi mode, GPU canvas, ECS DB, HUD, layer hierarchy, win/loss sequence wiring
- [x] level-data-scaffold — levels 1–10 hand-crafted JSON; fallback-pool.json; levels 1–5 green-only
- [x] orb-launcher — drag-aim-release input, 44×44 touch target, input gating, downward cancel
- [x] physics-engine — gravity, wall/sphere reflection, orbIntersectsSphere, deterministic
- [x] game-entities — RockPeg, AlienEgg (tinted by HP color), AlienPlanet, EnergyCrystal; ECS archetypes
- [x] game-state-ecs — MarsBouncePlugin; resources: score, orbsRemaining, orbsTotal, level, zone, starsEarned, boardState; ECS purity (no Math.random in actions)
- [x] scoring-system — computeShotScore, computeLevelMultiplier, computeStars; formula matches GDD exactly
- [x] level-generator — seedForLevel formula; seededRng deterministic; generateLevel stub; zoneForLevel
- [x] board-state-machine — idle→aiming→animating→resolving→won|lost; canAcceptInput guard
- [x] trajectory-preview — raycasting, 3–4 reflections, wall/sphere obstacles, alpha fade
- [x] entity-animations — flashPeg, crackEgg, popEgg, explodePlanet, sparkCrystal, destroyWithTweenKill; GSAP guardrail enforced
- [x] win-loss-sequences — GSAP timelines matching GDD timing; navigate after resolve; starsEarned
- [x] star-rating — computeStars; thresholds 0.40/0.66; ECS resource → SolidJS bridge
- [ ] chapter-interstitial — ChapterInterstitialScreen exists; zone boundary trigger works; auto-skip if no new zone (partial: intro cutscene unreachable from ScreenId enum)
- [ ] intro-cutscene — IntroCutsceneScreen exists; skip button 44×44 px; first-time flag; GAP: not registered in ScreenId closed enum
- [ ] continue-ad-system — UX shell built (button lower on screen, 1s delay); AdProvider stub; GAP: only shown on loss, button labeled "Watch Ad (Unavailable)"
- [~] hud-display — HudRenderer: orb count, score, level, pause button 44×44 px at top-right; ECS reactive; HUD pop animation wired (batch 9 helper exists, wired in stabilize)

## CoS Compliance — pass `core`

| CoS                    | Status  | Evidence / note |
|------------------------|---------|-----------------|
| `core-interaction`     | pass    | drag-aim-release archetype documented; pointer events; 44×44 touch target; input gating in all non-idle states |
| `canvas`               | pass    | entities ≥48px (egg fixed 40→48); color+shape+glyph distinctiveness; 552px play area; no HUD overlap |
| `animated-dynamics`    | partial | orb travels via tick loop (stabilize fix 1); GSAP factories exist + tested; GAP: entity hit animations not wired in EntityRenderer collision branches |
| `scoring` (base)       | pass    | multiplicative ricochet+trickshot+crystal formula; remainingOrbMul; starsEarned bridged |

## Completeness — pass `core`

| Area                         | Required | Met | Gaps |
|------------------------------|----------|-----|------|
| Interaction (primary gesture)| 5        | 5   | 0    |
| Board & Pieces               | 6        | 2   | 4 (genre N/A — physics launcher, no grid) |
| Core Mechanics               | 6        | 5   | 1 (entity-hit animation wiring) |
| Scoring (base)               | 3        | 3   | 0    |
| CoS mandatory items (core)   | 4        | 3   | 1 (animated-dynamics partial) |

## Known Issues

- **minor**: Intro cutscene screen (IntroCutsceneScreen) is unreachable because `ScreenId` is a closed enum in the scaffold. First-time players skip the cutscene and go directly to the title screen. The screen logic is correct; the navigation wiring requires scaffold modification.
- **minor**: L5→L6 difficulty spike (carry-forward from player_flow). When purple 2HP eggs are introduced at level 6, spare orbs drop from 4 to 1. Level data in levels 6–8 should be rebalanced.
- **minor**: Chunk size warning — `index-J_0eReHl.js` is 1.1 MB. Non-blocking but recommend dynamic imports for the game-screen chunk in a future pass.

## Deferred

- **Procedural level generator** (levels > 10): Generator is stubbed to fall back to pool so the game never gets stuck. Full procgen with solvability checker deferred to a future integration sprint.
- **Entity hit animation wiring in EntityRenderer**: GSAP factories (flashPeg, crackEgg, popEgg, explodePlanet, sparkCrystal) exist, are tested, and pass CoS at the unit level. Wiring them into EntityRenderer collision callbacks and the controller's tickOrb loop is the only remaining animated-dynamics gap.
- **Ad SDK integration**: AdProvider is stubbed behind an interface. Button is visible and positioned correctly (lower on screen, 1s delay). Ad network wiring deferred to a separate integration sprint.

## Recommendations

1. **Wire entity hit animations** (high priority — resolves animated-dynamics CoS gap): In the `tickOrb` function, call `flashPeg(sprite)` on peg collision, `crackEgg`/`popEgg` on egg collision based on remaining HP, `sparkCrystal` on crystal collection. EntityRenderer needs a `getSprite(entityId)` method to provide the sprite reference to these calls.
2. **Rebalance levels 6–10**: Reduce egg count or increase orb count in the JSON to avoid the L5→L6 spare-orb cliff. Target: ≥2 spare orbs on a competent first-clear.
3. **Register IntroCutsceneScreen in ScreenId**: Add `'intro'` to the scaffold ScreenId union so first-time players see the narrative cutscene.
4. **Dynamic imports for GameScreen chunk**: Split the Pixi/GSAP bundle to reduce initial load time.
