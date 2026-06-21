# Combat Actor Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first playable layer of character motion so card actions visibly animate the player, enemy, and impact effects.

**Architecture:** Keep combat rules unchanged and add UI-local animation state in `CombatScreen`. Card clicks classify the played card into an animation kind, play a short sequence, then call the existing combat action. Enemy turn receives a matching intent animation before calling `endTurn`.

**Tech Stack:** React state/timeouts, TypeScript, CSS keyframe animations, existing Vite/Vitest setup.

## Global Constraints

- Do not add animation libraries for the first pass.
- Do not change combat math or run persistence.
- Keep existing generated enemy art visible without cropping.
- Make animation timing short enough to preserve mobile play speed.

---

### Task 1: Add UI-Local Actor Motion

**Files:**
- Modify: `src/ui/CombatScreen.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: existing `CombatScreen` props `onPlay`, `onEndTurn`, and `combat`.
- Produces: CSS classes `pose-*`, `fx-*`, `is-animating`, and visual actor slots for player/enemy motion.

- [ ] **Step 1: Add animation state to `CombatScreen`**

Use local state for player pose, enemy pose, and one current effect. Add a tiny timeout helper to sequence the animation.

- [ ] **Step 2: Classify card animations**

Map card types/effects into `attack`, `defend`, `cast`, and `poison`. Poison effects should override generic attack/cast when a card applies poison.

- [ ] **Step 3: Animate card play**

When a playable card is clicked, prevent double-clicks during animation, set poses/effects, then call `onPlay(index)` near the impact moment.

- [ ] **Step 4: Animate enemy turn**

When ending the turn, play the enemy intent animation first, then call `onEndTurn`.

- [ ] **Step 5: Add CSS actor slots and effects**

Add a player actor silhouette, enemy/player pose animations, slash/projectile/shield/aura effects, and reduced-motion fallback.

- [ ] **Step 6: Verify**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Expected: all pass.

