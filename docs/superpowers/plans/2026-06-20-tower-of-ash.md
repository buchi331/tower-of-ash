# 灰の塔（Tower of Ash）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully client-side, offline, free deck-building roguelike (Slay the Spire-lite, dark fantasy) that runs as an installable PWA on smartphones.

**Architecture:** A pure, deterministic, side-effect-free combat/run engine (TypeScript) is built and unit-tested first. Content (cards, enemies, tower) lives as plain data, separated from logic. A thin React UI renders engine state and dispatches actions. Persistence is a small localStorage wrapper. RNG is seedable for test reproducibility.

**Tech Stack:** Vite + React + TypeScript, Vitest (+ jsdom) for tests, vite-plugin-pwa for installability. No backend, no external APIs.

**Working directory:** `C:\Users\buchi\OneDrive\ゲーム開発` (the Vite project lives at the repo root). Git is already initialized on branch `main`.

**Spec:** `docs/superpowers/specs/2026-06-20-tower-of-ash-deckbuilder-design.md`

---

## File structure

```
ゲーム開発/
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  index.html
  public/
    pwa-192.png  pwa-512.png  (icons, added in PWA task)
  src/
    main.tsx                 # React entry
    App.tsx                  # screen router
    model/
      types.ts               # all data types (no logic)
    content/
      cards.ts               # CardDef table + STARTER_DECK + REWARD_POOL
      enemies.ts             # EnemyDef table
      tower.ts               # Floor[] config
      content.test.ts        # data-integrity tests
    engine/
      rng.ts                 # seedable RNG + shuffle
      rng.test.ts
      combat.ts              # pure combat functions (the heart)
      combat.test.ts
      run.ts                 # run progression (pure)
      run.test.ts
    state/
      persistence.ts         # localStorage wrapper
      persistence.test.ts
      useGame.tsx            # React hook: wires engine + run + persistence
    ui/
      Card.tsx               # one card
      CombatScreen.tsx       # the fight
      RewardScreen.tsx       # pick 1 of 3
      TowerProgress.tsx      # floor indicator
      DeckView.tsx           # view current deck
      TitleScreen.tsx
      ResultScreen.tsx       # win / lose
    styles.css               # global + dark-fantasy theme + juice animations
```

**Responsibilities:** `engine/*` and `content/*` are pure and UI-free (testable in node). `state/useGame.tsx` is the only place engine + persistence + React meet. `ui/*` are presentational, driven by props/callbacks from `useGame`.

---

## Task 0: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`

We create config manually (not the interactive `npm create vite`) because the directory already contains `docs/`, `.git`, and `.gitignore`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "tower-of-ash",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
})
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#0d0b1f" />
    <title>灰の塔</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/styles.css`**

```css
:root { --bg:#0d0b1f; --panel:#171430; --ink:#ece9ff; --muted:#9b93c7; --line:#332c5a;
  --red:#e2574c; --blue:#4f8de0; --purple:#a855f7; --gold:#e8c170; }
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body, #root { height: 100%; margin: 0; }
body { background: var(--bg); color: var(--ink); font-family: system-ui, sans-serif;
  overscroll-behavior: none; user-select: none; }
button { font: inherit; color: inherit; cursor: pointer; }
.app { max-width: 480px; margin: 0 auto; min-height: 100%; display: flex; flex-direction: column; }
```

- [ ] **Step 7: Create `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 8: Create `src/App.tsx` (temporary placeholder)**

```tsx
export default function App() {
  return <div className="app" style={{ padding: 16 }}>灰の塔 — 起動確認OK</div>
}
```

- [ ] **Step 9: Install dependencies**

Run: `npm install`
Expected: completes without error; `node_modules/` created.

- [ ] **Step 10: Verify dev server boots**

Run: `npm run build`
Expected: `tsc -b` passes and `vite build` writes `dist/` with no errors.

- [ ] **Step 11: Verify the test runner works (no tests yet is an error in vitest 2; add a smoke test)**

Create `src/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
describe('smoke', () => {
  it('runs', () => { expect(1 + 1).toBe(2) })
})
```

Run: `npm run test:run`
Expected: 1 passing test.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS + Vitest project"
```

---

## Task 1: Data model types

**Files:**
- Create: `src/model/types.ts`

- [ ] **Step 1: Create `src/model/types.ts`**

```ts
export type CardType = 'attack' | 'skill' | 'power'
export type CardColor = 'red' | 'blue' | 'purple'
export type StatusKey = 'vulnerable' | 'weak' | 'strength' | 'poison'

export interface StatusEffects {
  vulnerable: number
  weak: number
  strength: number
  poison: number
}

export type CardEffect =
  | { kind: 'damage'; amount: number; times?: number }
  | { kind: 'block'; amount: number }
  | { kind: 'applyStatus'; status: StatusKey; amount: number; target: 'enemy' | 'self' }
  | { kind: 'draw'; amount: number }
  | { kind: 'gainEnergy'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'loseHp'; amount: number }
  | { kind: 'damageEqualToBlock' }
  | { kind: 'poisonOnAttack'; amount: number }

export interface CardDef {
  id: string
  name: string
  type: CardType
  cost: number
  text: string
  color: CardColor
  art: string
  effects: CardEffect[]
}

export type IntentKind = 'attack' | 'defend' | 'buff' | 'debuff'
export interface IntentStep {
  kind: IntentKind
  value?: number
  times?: number
  status?: StatusKey
  amount?: number
}

export interface EnemyDef {
  id: string
  name: string
  maxHp: number
  intentPattern: IntentStep[]
}

export interface CombatantState {
  hp: number
  maxHp: number
  block: number
  status: StatusEffects
}

export interface PlayerCombatState extends CombatantState {
  energy: number
  maxEnergy: number
  poisonOnAttack: number
}

export interface EnemyCombatState extends CombatantState {
  def: EnemyDef
  intentIndex: number
}

export type CombatPhase = 'player' | 'enemy' | 'won' | 'lost'

export interface CombatState {
  player: PlayerCombatState
  enemy: EnemyCombatState
  drawPile: string[]
  hand: string[]
  discardPile: string[]
  turn: number
  phase: CombatPhase
  log: string[]
}

export type FloorKind = 'normal' | 'elite' | 'boss'
export interface Floor {
  kind: FloorKind
  enemyId: string
}

export type RunStatus = 'inProgress' | 'won' | 'lost'
export interface RunState {
  schemaVersion: number
  seed: number
  floor: number
  deck: string[]
  playerHp: number
  maxHp: number
  status: RunStatus
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/model/types.ts
git commit -m "feat: add core data model types"
```

---

## Task 2: Seedable RNG + shuffle

**Files:**
- Create: `src/engine/rng.ts`
- Test: `src/engine/rng.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { makeRng, shuffle } from './rng'

describe('rng', () => {
  it('is deterministic for the same seed', () => {
    const a = makeRng(123)
    const b = makeRng(123)
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()])
  })

  it('int() stays within [0, max)', () => {
    const r = makeRng(42)
    for (let i = 0; i < 1000; i++) {
      const n = r.int(5)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(5)
    }
  })

  it('shuffle is a permutation and deterministic per seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8]
    const s1 = shuffle(arr, makeRng(7))
    const s2 = shuffle(arr, makeRng(7))
    expect(s1).toEqual(s2)
    expect([...s1].sort((a, b) => a - b)).toEqual(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8]) // original not mutated
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/rng.test.ts`
Expected: FAIL — cannot find module './rng'.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface RNG {
  next(): number          // float in [0, 1)
  int(maxExclusive: number): number
}

// mulberry32: small, fast, deterministic
export function makeRng(seed: number): RNG {
  let a = seed >>> 0
  const next = () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (maxExclusive: number) => Math.floor(next() * maxExclusive),
  }
}

export function shuffle<T>(arr: readonly T[], rng: RNG): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/engine/rng.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/rng.ts src/engine/rng.test.ts
git commit -m "feat: add seedable RNG and shuffle"
```

---

## Task 3: Combat setup & turn structure

Introduces `combat.ts` with state setup, the draw/reshuffle helper, and `startPlayerTurn`. A tiny test-only enemy/deck is defined in the test file so combat tests don't depend on real content.

**Files:**
- Create: `src/engine/combat.ts`
- Test: `src/engine/combat.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import { createCombat } from './combat'
import type { CardDef, EnemyDef } from '../model/types'

// minimal test fixtures (independent of real content)
export const TEST_CARDS: Record<string, CardDef> = {
  strike: { id: 'strike', name: 'S', type: 'attack', cost: 1, color: 'red', art: 'x', text: '', effects: [{ kind: 'damage', amount: 6 }] },
  defend: { id: 'defend', name: 'D', type: 'skill', cost: 1, color: 'blue', art: 'x', text: '', effects: [{ kind: 'block', amount: 5 }] },
}
export const DUMMY: EnemyDef = { id: 'dummy', name: 'Dummy', maxHp: 30, intentPattern: [{ kind: 'attack', value: 5 }] }

describe('createCombat', () => {
  it('sets up player, enemy, and draws a 5-card opening hand', () => {
    const deck = ['strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'strike']
    const s = createCombat(DUMMY, deck, 70, 70, makeRng(1), TEST_CARDS)
    expect(s.player.hp).toBe(70)
    expect(s.player.energy).toBe(3)
    expect(s.enemy.hp).toBe(30)
    expect(s.phase).toBe('player')
    expect(s.hand.length).toBe(5)
    expect(s.drawPile.length).toBe(2) // 7 - 5
    expect(s.turn).toBe(1)
  })

  it('reshuffles the discard pile when the draw pile is empty', () => {
    const deck = ['strike', 'strike', 'strike'] // fewer than 5
    const s = createCombat(DUMMY, deck, 70, 70, makeRng(1), TEST_CARDS)
    expect(s.hand.length).toBe(3) // can't draw more than exist
    expect(s.drawPile.length).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/combat.test.ts`
Expected: FAIL — cannot find `createCombat`.

- [ ] **Step 3: Write minimal implementation**

```ts
import type {
  CardDef, CombatState, EnemyDef, PlayerCombatState, EnemyCombatState, StatusEffects,
} from '../model/types'
import { shuffle, type RNG } from './rng'

export type CardTable = Record<string, CardDef>

function emptyStatus(): StatusEffects {
  return { vulnerable: 0, weak: 0, strength: 0, poison: 0 }
}

// Draw n cards into hand, reshuffling discard into draw when needed. Mutates the draft.
function drawCards(s: CombatState, n: number, rng: RNG): void {
  for (let i = 0; i < n; i++) {
    if (s.drawPile.length === 0) {
      if (s.discardPile.length === 0) return
      s.drawPile = shuffle(s.discardPile, rng)
      s.discardPile = []
    }
    const id = s.drawPile.pop()!
    s.hand.push(id)
  }
}

function startPlayerTurn(s: CombatState, rng: RNG): void {
  s.turn += 1
  s.player.block = 0
  s.player.energy = s.player.maxEnergy
  // poison ticks at the owner's turn start
  if (s.player.status.poison > 0) {
    s.player.hp -= s.player.status.poison
    s.player.status.poison -= 1
    if (s.player.hp <= 0) { s.phase = 'lost'; return }
  }
  drawCards(s, 5, rng)
  s.phase = 'player'
}

export function createCombat(
  enemyDef: EnemyDef, deck: readonly string[], playerHp: number, maxHp: number, rng: RNG, cards: CardTable,
): CombatState {
  void cards // cards table is used by playCard; accepted here to fix the signature for all callers
  const player: PlayerCombatState = {
    hp: playerHp, maxHp, block: 0, status: emptyStatus(), energy: 0, maxEnergy: 3, poisonOnAttack: 0,
  }
  const enemy: EnemyCombatState = {
    def: enemyDef, hp: enemyDef.maxHp, maxHp: enemyDef.maxHp, block: 0, status: emptyStatus(), intentIndex: 0,
  }
  const s: CombatState = {
    player, enemy,
    drawPile: shuffle(deck, rng),
    hand: [], discardPile: [],
    turn: 0, phase: 'player', log: [],
  }
  startPlayerTurn(s, rng)
  return s
}

// exported for use by later tasks within this file
export { emptyStatus, drawCards, startPlayerTurn }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/engine/combat.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/combat.ts src/engine/combat.test.ts
git commit -m "feat: combat setup and turn structure"
```

---

## Task 4: Attacks & damage calculation

Adds `calcDamage`, `applyDamage`, and `playCard` (damage + multi-hit only for now). `playCard` validates energy, spends it, applies the card's effects, moves the card to discard (or removes powers), and checks for victory.

**Files:**
- Modify: `src/engine/combat.ts`
- Test: `src/engine/combat.test.ts`

- [ ] **Step 1: Write the failing test (append to combat.test.ts)**

```ts
import { playCard } from './combat'

describe('playCard — attacks', () => {
  it('deals damage to the enemy and spends energy', () => {
    const deck = ['strike', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), TEST_CARDS)
    const before = s.enemy.hp
    s = playCard(s, 0, makeRng(1), TEST_CARDS)
    expect(s.enemy.hp).toBe(before - 6)
    expect(s.player.energy).toBe(2)
    expect(s.hand.length).toBe(4)
    expect(s.discardPile).toContain('strike')
  })

  it('rejects a card when energy is insufficient', () => {
    const cards = { ...TEST_CARDS, big: { ...TEST_CARDS.strike, id: 'big', cost: 9 } }
    const deck = ['big', 'big', 'big', 'big', 'big']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    const snapshot = JSON.stringify(s)
    s = playCard(s, 0, makeRng(1), cards)
    expect(JSON.stringify(s)).toBe(snapshot) // unchanged
  })

  it('marks combat won when the enemy reaches 0 hp', () => {
    const cards = { ...TEST_CARDS, nuke: { ...TEST_CARDS.strike, id: 'nuke', cost: 0, effects: [{ kind: 'damage' as const, amount: 99 }] } }
    const deck = ['nuke', 'nuke', 'nuke', 'nuke', 'nuke']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, 0, makeRng(1), cards)
    expect(s.enemy.hp).toBeLessThanOrEqual(0)
    expect(s.phase).toBe('won')
  })

  it('multi-hit applies damage per hit', () => {
    const cards = { ...TEST_CARDS, twin: { ...TEST_CARDS.strike, id: 'twin', cost: 1, effects: [{ kind: 'damage' as const, amount: 3, times: 2 }] } }
    const deck = ['twin', 'twin', 'twin', 'twin', 'twin']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    const before = s.enemy.hp
    s = playCard(s, 0, makeRng(1), cards)
    expect(s.enemy.hp).toBe(before - 6)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/combat.test.ts`
Expected: FAIL — `playCard` not exported.

- [ ] **Step 3: Add implementation to `combat.ts`**

Add these helpers and `playCard` (place `calcDamage`/`applyDamage` near the top, after `emptyStatus`; export `playCard`):

```ts
// damage = (base + attacker strength), then weak (-25%), then target vulnerable (+50%)
function calcDamage(base: number, attacker: StatusEffects, target: StatusEffects): number {
  let dmg = base + attacker.strength
  if (attacker.weak > 0) dmg = Math.floor(dmg * 0.75)
  if (target.vulnerable > 0) dmg = Math.floor(dmg * 1.5)
  return Math.max(0, dmg)
}

function applyDamage(target: { hp: number; block: number }, dmg: number): void {
  const blocked = Math.min(target.block, dmg)
  target.block -= blocked
  target.hp -= dmg - blocked
}

function checkWin(s: CombatState): void {
  if (s.enemy.hp <= 0) s.phase = 'won'
}

export function playCard(state: CombatState, handIndex: number, rng: RNG, cards: CardTable): CombatState {
  if (state.phase !== 'player') return state
  const id = state.hand[handIndex]
  if (id == null) return state
  const card = cards[id]
  if (!card || card.cost > state.player.energy) return state

  const s: CombatState = structuredClone(state)
  s.player.energy -= card.cost
  s.hand.splice(handIndex, 1)

  for (const e of card.effects) {
    switch (e.kind) {
      case 'damage': {
        const hits = e.times ?? 1
        for (let i = 0; i < hits; i++) {
          applyDamage(s.enemy, calcDamage(e.amount, s.player.status, s.enemy.status))
        }
        break
      }
      // remaining effect kinds are added in later tasks
    }
  }

  // powers leave play; everything else goes to discard
  if (card.type !== 'power') s.discardPile.push(id)
  checkWin(s)
  return s
}

export { calcDamage, applyDamage, checkWin }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/engine/combat.test.ts`
Expected: PASS (all attack tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/combat.ts src/engine/combat.test.ts
git commit -m "feat: attacks, damage calc, and playCard"
```

---

## Task 5: Block & defensive effects

Adds the `block` effect to `playCard`.

**Files:**
- Modify: `src/engine/combat.ts`
- Test: `src/engine/combat.test.ts`

- [ ] **Step 1: Write the failing test (append)**

```ts
describe('playCard — block', () => {
  it('grants block that absorbs the next damage', () => {
    const deck = ['defend', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), TEST_CARDS)
    const i = s.hand.indexOf('defend')
    s = playCard(s, i, makeRng(1), TEST_CARDS)
    expect(s.player.block).toBe(5)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/combat.test.ts -t "grants block"`
Expected: FAIL — block stays 0.

- [ ] **Step 3: Add the `block` case to the effect switch in `playCard`**

```ts
      case 'block':
        s.player.block += e.amount
        break
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/engine/combat.test.ts -t "grants block"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/combat.ts src/engine/combat.test.ts
git commit -m "feat: block effect"
```

---

## Task 6: Status effects (vulnerable, weak, strength, poison)

Adds the `applyStatus` effect and verifies status interactions already wired into `calcDamage` (vulnerable/weak/strength) and poison-on-turn-start.

**Files:**
- Modify: `src/engine/combat.ts`
- Test: `src/engine/combat.test.ts`

- [ ] **Step 1: Write the failing test (append)**

```ts
describe('playCard — statuses', () => {
  it('applies vulnerable to the enemy and amplifies later damage by 50%', () => {
    const cards = {
      ...TEST_CARDS,
      bash: { ...TEST_CARDS.strike, id: 'bash', cost: 0, effects: [{ kind: 'applyStatus' as const, status: 'vulnerable' as const, amount: 2, target: 'enemy' as const }] },
    }
    const deck = ['bash', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('bash'), makeRng(1), cards)
    expect(s.enemy.status.vulnerable).toBe(2)
    const before = s.enemy.hp
    s = playCard(s, s.hand.indexOf('strike'), makeRng(1), cards)
    expect(s.enemy.hp).toBe(before - 9) // 6 * 1.5
  })

  it('strength increases attack damage', () => {
    const cards = {
      ...TEST_CARDS,
      focus: { ...TEST_CARDS.strike, id: 'focus', type: 'skill' as const, cost: 0, effects: [{ kind: 'applyStatus' as const, status: 'strength' as const, amount: 2, target: 'self' as const }] },
    }
    const deck = ['focus', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('focus'), makeRng(1), cards)
    const before = s.enemy.hp
    s = playCard(s, s.hand.indexOf('strike'), makeRng(1), cards)
    expect(s.enemy.hp).toBe(before - 8) // 6 + 2
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/combat.test.ts -t "statuses"`
Expected: FAIL — status not applied.

- [ ] **Step 3: Add the `applyStatus` case to the effect switch in `playCard`**

```ts
      case 'applyStatus': {
        const who = e.target === 'self' ? s.player.status : s.enemy.status
        who[e.status] += e.amount
        break
      }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/engine/combat.test.ts -t "statuses"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/combat.ts src/engine/combat.test.ts
git commit -m "feat: status effects (vulnerable, weak, strength, poison apply)"
```

---

## Task 7: Remaining card effects

Adds `draw`, `gainEnergy`, `heal`, `loseHp`, `damageEqualToBlock`, and the `poisonOnAttack` power (auto-applies poison to the enemy whenever an attack card is played).

**Files:**
- Modify: `src/engine/combat.ts`
- Test: `src/engine/combat.test.ts`

- [ ] **Step 1: Write the failing test (append)**

```ts
describe('playCard — utility effects', () => {
  it('draw + gainEnergy', () => {
    const cards = {
      ...TEST_CARDS,
      adr: { ...TEST_CARDS.defend, id: 'adr', cost: 0, effects: [{ kind: 'draw' as const, amount: 2 }, { kind: 'gainEnergy' as const, amount: 1 }] },
    }
    const deck = ['adr', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    const handBefore = s.hand.length // 5 (adr drawn into opening hand)
    s = playCard(s, s.hand.indexOf('adr'), makeRng(1), cards)
    expect(s.hand.length).toBe(handBefore - 1 + 2) // played 1, drew 2
    expect(s.player.energy).toBe(3 - 0 + 1)
  })

  it('heal does not exceed maxHp', () => {
    const cards = { ...TEST_CARDS, life: { ...TEST_CARDS.defend, id: 'life', cost: 0, effects: [{ kind: 'heal' as const, amount: 10 }] } }
    const deck = ['life', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 65, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('life'), makeRng(1), cards)
    expect(s.player.hp).toBe(70)
  })

  it('loseHp damages the player directly', () => {
    const cards = { ...TEST_CARDS, reck: { ...TEST_CARDS.strike, id: 'reck', cost: 0, effects: [{ kind: 'damage' as const, amount: 10 }, { kind: 'loseHp' as const, amount: 3 }] } }
    const deck = ['reck', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('reck'), makeRng(1), cards)
    expect(s.player.hp).toBe(67)
  })

  it('damageEqualToBlock uses current block as damage', () => {
    const cards = {
      ...TEST_CARDS,
      sb: { ...TEST_CARDS.strike, id: 'sb', cost: 0, effects: [{ kind: 'damageEqualToBlock' as const }] },
    }
    const deck = ['defend', 'sb', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('defend'), makeRng(1), cards) // +5 block
    const before = s.enemy.hp
    s = playCard(s, s.hand.indexOf('sb'), makeRng(1), cards)
    expect(s.enemy.hp).toBe(before - 5)
  })

  it('poisonOnAttack power adds poison whenever an attack is played', () => {
    const cards = {
      ...TEST_CARDS,
      pm: { ...TEST_CARDS.defend, id: 'pm', type: 'power' as const, cost: 0, effects: [{ kind: 'poisonOnAttack' as const, amount: 1 }] },
    }
    const deck = ['pm', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('pm'), makeRng(1), cards)
    expect(s.player.poisonOnAttack).toBe(1)
    s = playCard(s, s.hand.indexOf('strike'), makeRng(1), cards)
    expect(s.enemy.status.poison).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/combat.test.ts -t "utility effects"`
Expected: FAIL.

- [ ] **Step 3: Add the remaining cases to the effect switch in `playCard`**

Add these `case` blocks inside the `switch (e.kind)` in `playCard`:

```ts
      case 'draw':
        drawCards(s, e.amount, rng)
        break
      case 'gainEnergy':
        s.player.energy += e.amount
        break
      case 'heal':
        s.player.hp = Math.min(s.player.maxHp, s.player.hp + e.amount)
        break
      case 'loseHp':
        s.player.hp -= e.amount
        break
      case 'damageEqualToBlock':
        applyDamage(s.enemy, calcDamage(s.player.block, s.player.status, s.enemy.status))
        break
      case 'poisonOnAttack':
        s.player.poisonOnAttack += e.amount
        break
```

Then, immediately after the `for (const e of card.effects)` loop (before the power/discard handling), add the on-attack poison trigger:

```ts
  if (card.type === 'attack' && s.player.poisonOnAttack > 0) {
    s.enemy.status.poison += s.player.poisonOnAttack
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/engine/combat.test.ts -t "utility effects"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/combat.ts src/engine/combat.test.ts
git commit -m "feat: draw, energy, heal, self-damage, shield-bash, poison power effects"
```

---

## Task 8: End turn, enemy AI, and win/loss

Adds `endTurn`: discards the hand, decays the player's debuffs, then runs the enemy's telegraphed action, decays the enemy's debuffs, and either ends combat or starts the next player turn. Also adds `currentIntent` for the UI.

**Files:**
- Modify: `src/engine/combat.ts`
- Test: `src/engine/combat.test.ts`

- [ ] **Step 1: Write the failing test (append)**

```ts
import { endTurn, currentIntent } from './combat'

describe('endTurn — enemy AI', () => {
  it('discards hand and runs the enemy attack, reduced by player block', () => {
    const deck = ['defend', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat({ ...DUMMY, intentPattern: [{ kind: 'attack', value: 5 }] }, deck, 70, 70, makeRng(1), TEST_CARDS)
    s = playCard(s, s.hand.indexOf('defend'), makeRng(1), TEST_CARDS) // +5 block
    s = endTurn(s, makeRng(1), TEST_CARDS)
    expect(s.player.hp).toBe(70) // 5 dmg fully blocked
    expect(s.phase).toBe('player')
    expect(s.turn).toBe(2)
    expect(s.hand.length).toBe(5) // fresh hand
  })

  it('enemy defend grants the enemy block', () => {
    let s = createCombat({ ...DUMMY, intentPattern: [{ kind: 'defend', value: 8 }] }, ['strike','strike','strike','strike','strike'], 70, 70, makeRng(1), TEST_CARDS)
    s = endTurn(s, makeRng(1), TEST_CARDS)
    expect(s.enemy.block).toBe(8)
  })

  it('player dies when enemy damage exceeds hp → phase lost', () => {
    let s = createCombat({ ...DUMMY, intentPattern: [{ kind: 'attack', value: 999 }] }, ['strike','strike','strike','strike','strike'], 70, 70, makeRng(1), TEST_CARDS)
    s = endTurn(s, makeRng(1), TEST_CARDS)
    expect(s.phase).toBe('lost')
  })

  it('player vulnerable decays at end of player turn', () => {
    let s = createCombat({ ...DUMMY, intentPattern: [{ kind: 'defend', value: 1 }] }, ['strike','strike','strike','strike','strike'], 70, 70, makeRng(1), TEST_CARDS)
    s.player.status.vulnerable = 2
    s = endTurn(s, makeRng(1), TEST_CARDS)
    expect(s.player.status.vulnerable).toBe(1)
  })

  it('currentIntent reports the enemy next action', () => {
    const s = createCombat({ ...DUMMY, intentPattern: [{ kind: 'attack', value: 7 }] }, ['strike','strike','strike','strike','strike'], 70, 70, makeRng(1), TEST_CARDS)
    expect(currentIntent(s)).toEqual({ kind: 'attack', value: 7 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/combat.test.ts -t "enemy AI"`
Expected: FAIL — `endTurn`/`currentIntent` not exported.

- [ ] **Step 3: Add implementation to `combat.ts`**

```ts
import type { IntentStep } from '../model/types'

export function currentIntent(s: CombatState): IntentStep {
  const p = s.enemy.def.intentPattern
  return p[s.enemy.intentIndex % p.length]
}

function decayDebuffs(c: { status: StatusEffects }): void {
  if (c.status.vulnerable > 0) c.status.vulnerable -= 1
  if (c.status.weak > 0) c.status.weak -= 1
}

function runEnemyAction(s: CombatState): void {
  const step = currentIntent(s)
  switch (step.kind) {
    case 'attack': {
      const hits = step.times ?? 1
      for (let i = 0; i < hits; i++) {
        applyDamage(s.player, calcDamage(step.value ?? 0, s.enemy.status, s.player.status))
      }
      break
    }
    case 'defend':
      s.enemy.block += step.value ?? 0
      break
    case 'buff':
      if (step.status) s.enemy.status[step.status] += step.amount ?? 0
      break
    case 'debuff':
      if (step.status) s.player.status[step.status] += step.amount ?? 0
      break
  }
  s.enemy.intentIndex += 1
}

export function endTurn(state: CombatState, rng: RNG, _cards: CardTable): CombatState {
  if (state.phase !== 'player') return state
  const s: CombatState = structuredClone(state)

  // discard remaining hand
  s.discardPile.push(...s.hand)
  s.hand = []
  decayDebuffs(s.player)

  // enemy turn
  s.phase = 'enemy'
  s.enemy.block = 0
  if (s.enemy.status.poison > 0) {
    s.enemy.hp -= s.enemy.status.poison
    s.enemy.status.poison -= 1
  }
  if (s.enemy.hp <= 0) { s.phase = 'won'; return s }

  runEnemyAction(s)
  if (s.player.hp <= 0) { s.phase = 'lost'; return s }
  decayDebuffs(s.enemy)

  startPlayerTurn(s, rng)
  return s
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/engine/combat.test.ts`
Expected: PASS (entire combat suite).

- [ ] **Step 5: Full-suite check + commit**

Run: `npm run test:run`
Expected: all tests pass.

```bash
git add src/engine/combat.ts src/engine/combat.test.ts
git commit -m "feat: end turn, enemy AI, status decay, win/loss"
```

---

## Task 9: Content data (cards, enemies, tower)

**Files:**
- Create: `src/content/cards.ts`, `src/content/enemies.ts`, `src/content/tower.ts`
- Test: `src/content/content.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { CARDS, STARTER_DECK, REWARD_POOL } from './cards'
import { ENEMIES } from './enemies'
import { TOWER } from './tower'

describe('content integrity', () => {
  it('starter deck and reward pool reference real cards', () => {
    for (const id of STARTER_DECK) expect(CARDS[id], `starter ${id}`).toBeDefined()
    for (const id of REWARD_POOL) expect(CARDS[id], `reward ${id}`).toBeDefined()
  })
  it('every card id matches its key', () => {
    for (const [k, c] of Object.entries(CARDS)) expect(c.id).toBe(k)
  })
  it('tower floors reference real enemies and end on a boss', () => {
    for (const f of TOWER) expect(ENEMIES[f.enemyId], `enemy ${f.enemyId}`).toBeDefined()
    expect(TOWER[TOWER.length - 1].kind).toBe('boss')
    expect(TOWER.length).toBe(8)
  })
  it('every enemy has a non-empty intent pattern', () => {
    for (const e of Object.values(ENEMIES)) expect(e.intentPattern.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/content/content.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create `src/content/cards.ts`**

```ts
import type { CardDef } from '../model/types'

export const CARDS: Record<string, CardDef> = {
  strike:       { id: 'strike', name: '斬撃', type: 'attack', cost: 1, color: 'red', art: 'sword', text: '6ダメージ。', effects: [{ kind: 'damage', amount: 6 }] },
  defend:       { id: 'defend', name: '守勢', type: 'skill', cost: 1, color: 'blue', art: 'shield', text: '5ブロック。', effects: [{ kind: 'block', amount: 5 }] },
  bash:         { id: 'bash', name: '痛打', type: 'attack', cost: 2, color: 'red', art: 'hammer', text: '8ダメージ。脆弱2。', effects: [{ kind: 'damage', amount: 8 }, { kind: 'applyStatus', status: 'vulnerable', amount: 2, target: 'enemy' }] },
  twinslash:    { id: 'twinslash', name: '連刃', type: 'attack', cost: 1, color: 'red', art: 'swords', text: '3ダメージ×2。', effects: [{ kind: 'damage', amount: 3, times: 2 }] },
  heavy:        { id: 'heavy', name: '重撃', type: 'attack', cost: 2, color: 'red', art: 'axe', text: '14ダメージ。', effects: [{ kind: 'damage', amount: 14 }] },
  poisonblade:  { id: 'poisonblade', name: '毒刃', type: 'attack', cost: 1, color: 'red', art: 'flask', text: '5ダメージ。毒3。', effects: [{ kind: 'damage', amount: 5 }, { kind: 'applyStatus', status: 'poison', amount: 3, target: 'enemy' }] },
  lifesteal:    { id: 'lifesteal', name: '吸血', type: 'attack', cost: 2, color: 'red', art: 'droplet', text: '8ダメージ。4回復。', effects: [{ kind: 'damage', amount: 8 }, { kind: 'heal', amount: 4 }] },
  allout:       { id: 'allout', name: '渾身', type: 'attack', cost: 3, color: 'red', art: 'flame', text: '22ダメージ。', effects: [{ kind: 'damage', amount: 22 }] },
  reckless:     { id: 'reckless', name: '捨て身', type: 'attack', cost: 0, color: 'red', art: 'skull', text: '10ダメージ。自分に3ダメージ。', effects: [{ kind: 'damage', amount: 10 }, { kind: 'loseHp', amount: 3 }] },
  shieldbash:   { id: 'shieldbash', name: '盾打ち', type: 'attack', cost: 1, color: 'red', art: 'shield-bolt', text: '現在のブロック値と同じダメージ。', effects: [{ kind: 'damageEqualToBlock' }] },
  ironwall:     { id: 'ironwall', name: '鉄壁', type: 'skill', cost: 2, color: 'blue', art: 'wall', text: '12ブロック。', effects: [{ kind: 'block', amount: 12 }] },
  focus:        { id: 'focus', name: '集中', type: 'skill', cost: 1, color: 'purple', art: 'up', text: '力+2。', effects: [{ kind: 'applyStatus', status: 'strength', amount: 2, target: 'self' }] },
  inflame:      { id: 'inflame', name: '鍛錬', type: 'power', cost: 1, color: 'purple', art: 'bolt', text: '力+3。', effects: [{ kind: 'applyStatus', status: 'strength', amount: 3, target: 'self' }] },
  poisonmastery:{ id: 'poisonmastery', name: '毒の心得', type: 'power', cost: 1, color: 'purple', art: 'biohazard', text: '攻撃をプレイするたび毒1。', effects: [{ kind: 'poisonOnAttack', amount: 1 }] },
  adrenaline:   { id: 'adrenaline', name: '戦機', type: 'skill', cost: 0, color: 'blue', art: 'run', text: '2枚引く。エネルギー+1。', effects: [{ kind: 'draw', amount: 2 }, { kind: 'gainEnergy', amount: 1 }] },
  insight:      { id: 'insight', name: '見極め', type: 'skill', cost: 1, color: 'blue', art: 'eye', text: '2枚引く。', effects: [{ kind: 'draw', amount: 2 }] },
}

export const STARTER_DECK: string[] = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'defend', 'defend', 'defend', 'defend',
  'bash',
]

export const REWARD_POOL: string[] = [
  'bash', 'twinslash', 'heavy', 'poisonblade', 'lifesteal', 'allout', 'reckless',
  'shieldbash', 'ironwall', 'focus', 'inflame', 'poisonmastery', 'adrenaline', 'insight',
]
```

- [ ] **Step 4: Create `src/content/enemies.ts`**

```ts
import type { EnemyDef } from '../model/types'

export const ENEMIES: Record<string, EnemyDef> = {
  skeleton: { id: 'skeleton', name: '骸骨剣士', maxHp: 28, intentPattern: [
    { kind: 'attack', value: 7 }, { kind: 'attack', value: 7 }, { kind: 'defend', value: 6 },
  ] },
  bats: { id: 'bats', name: '蝙蝠群', maxHp: 24, intentPattern: [
    { kind: 'attack', value: 2, times: 3 }, { kind: 'debuff', status: 'weak', amount: 1 },
  ] },
  golem: { id: 'golem', name: '泥人形', maxHp: 46, intentPattern: [
    { kind: 'defend', value: 8 }, { kind: 'attack', value: 16 },
  ] },
  ghoul: { id: 'ghoul', name: '屍喰い', maxHp: 30, intentPattern: [
    { kind: 'attack', value: 6 }, { kind: 'debuff', status: 'poison', amount: 3 }, { kind: 'attack', value: 6 },
  ] },
  wraith: { id: 'wraith', name: '影', maxHp: 34, intentPattern: [
    { kind: 'defend', value: 10 }, { kind: 'attack', value: 9 },
  ] },
  cursemage: { id: 'cursemage', name: '呪術師', maxHp: 55, intentPattern: [
    { kind: 'debuff', status: 'vulnerable', amount: 2 }, { kind: 'attack', value: 11 }, { kind: 'attack', value: 11 },
  ] },
  sentinel: { id: 'sentinel', name: '鎧の番人', maxHp: 64, intentPattern: [
    { kind: 'defend', value: 14 }, { kind: 'attack', value: 18 },
  ] },
  ashking: { id: 'ashking', name: '灰の王', maxHp: 120, intentPattern: [
    { kind: 'attack', value: 16 }, { kind: 'debuff', status: 'weak', amount: 2 },
    { kind: 'buff', status: 'strength', amount: 2 }, { kind: 'attack', value: 12 }, { kind: 'defend', value: 16 },
  ] },
}
```

- [ ] **Step 5: Create `src/content/tower.ts`**

```ts
import type { Floor } from '../model/types'

export const TOWER: Floor[] = [
  { kind: 'normal', enemyId: 'skeleton' },
  { kind: 'normal', enemyId: 'bats' },
  { kind: 'normal', enemyId: 'ghoul' },
  { kind: 'elite', enemyId: 'cursemage' },
  { kind: 'normal', enemyId: 'golem' },
  { kind: 'normal', enemyId: 'wraith' },
  { kind: 'elite', enemyId: 'sentinel' },
  { kind: 'boss', enemyId: 'ashking' },
]
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test:run -- src/content/content.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add src/content
git commit -m "feat: content data (cards, enemies, tower)"
```

---

## Task 10: Run controller

Pure functions for run lifecycle: `startRun`, `currentFloor`, `isBossFloor`, `rewardOptions`, `addCardToDeck`, `healPlayer`, `advanceFloor`, plus `recordVictory`/`recordDefeat`.

**Files:**
- Create: `src/engine/run.ts`
- Test: `src/engine/run.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import {
  startRun, currentFloor, isBossFloor, rewardOptions, addCardToDeck, advanceFloor, recordVictory, recordDefeat, START_HP,
} from './run'
import { STARTER_DECK } from '../content/cards'

describe('run', () => {
  it('startRun begins at floor 0 with the starter deck', () => {
    const r = startRun(99)
    expect(r.floor).toBe(0)
    expect(r.playerHp).toBe(START_HP)
    expect(r.deck).toEqual(STARTER_DECK)
    expect(r.status).toBe('inProgress')
  })

  it('rewardOptions returns 3 distinct real cards', () => {
    const opts = rewardOptions(makeRng(5))
    expect(opts.length).toBe(3)
    expect(new Set(opts).size).toBe(3)
  })

  it('addCardToDeck appends to the deck', () => {
    const r = startRun(1)
    const r2 = addCardToDeck(r, 'heavy')
    expect(r2.deck.length).toBe(r.deck.length + 1)
    expect(r2.deck).toContain('heavy')
  })

  it('advanceFloor increments floor and heals 25% after an elite', () => {
    let r = startRun(1)
    r = { ...r, floor: 3, playerHp: 40 } // floor index 3 = elite (cursemage)
    expect(isBossFloor(r)).toBe(false)
    const r2 = advanceFloor(r)
    expect(r2.floor).toBe(4)
    expect(r2.playerHp).toBe(40 + Math.floor(r.maxHp * 0.25))
  })

  it('recordVictory on boss floor marks run won', () => {
    let r = startRun(1)
    r = { ...r, floor: 7 } // boss
    expect(isBossFloor(r)).toBe(true)
    expect(recordVictory(r).status).toBe('won')
  })

  it('recordDefeat marks run lost', () => {
    expect(recordDefeat(startRun(1)).status).toBe('lost')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/engine/run.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

```ts
import type { RunState, Floor } from '../model/types'
import { STARTER_DECK, REWARD_POOL } from '../content/cards'
import { TOWER } from '../content/tower'
import type { RNG } from './rng'

export const SCHEMA_VERSION = 1
export const START_HP = 70
const ELITE_HEAL_PCT = 0.25

export function startRun(seed: number): RunState {
  return {
    schemaVersion: SCHEMA_VERSION, seed, floor: 0,
    deck: [...STARTER_DECK], playerHp: START_HP, maxHp: START_HP, status: 'inProgress',
  }
}

export function currentFloor(run: RunState): Floor {
  return TOWER[run.floor]
}

export function isBossFloor(run: RunState): boolean {
  return currentFloor(run).kind === 'boss'
}

export function rewardOptions(rng: RNG): string[] {
  const pool = [...REWARD_POOL]
  const out: string[] = []
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    out.push(pool.splice(rng.int(pool.length), 1)[0])
  }
  return out
}

export function addCardToDeck(run: RunState, cardId: string): RunState {
  return { ...run, deck: [...run.deck, cardId] }
}

export function healPlayer(run: RunState, amount: number): RunState {
  return { ...run, playerHp: Math.min(run.maxHp, run.playerHp + amount) }
}

export function advanceFloor(run: RunState): RunState {
  const wasElite = currentFloor(run).kind === 'elite'
  let next: RunState = { ...run, floor: run.floor + 1 }
  if (wasElite) next = healPlayer(next, Math.floor(run.maxHp * ELITE_HEAL_PCT))
  return next
}

export function recordVictory(run: RunState): RunState {
  return isBossFloor(run) ? { ...run, status: 'won' } : run
}

export function recordDefeat(run: RunState): RunState {
  return { ...run, status: 'lost' }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/engine/run.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/run.ts src/engine/run.test.ts
git commit -m "feat: run controller (progression, rewards, heal)"
```

---

## Task 11: Persistence

**Files:**
- Create: `src/state/persistence.ts`
- Test: `src/state/persistence.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { saveRun, loadRun, clearRun } from './persistence'
import { startRun, SCHEMA_VERSION } from '../engine/run'

describe('persistence', () => {
  beforeEach(() => localStorage.clear())

  it('saves and loads a run unchanged', () => {
    const r = startRun(7)
    saveRun(r)
    expect(loadRun()).toEqual(r)
  })

  it('returns null when nothing is saved', () => {
    expect(loadRun()).toBeNull()
  })

  it('returns null on a schema version mismatch', () => {
    const r = { ...startRun(1), schemaVersion: SCHEMA_VERSION + 1 }
    saveRun(r)
    expect(loadRun()).toBeNull()
  })

  it('returns null on corrupt data instead of throwing', () => {
    localStorage.setItem('tower-of-ash:save', '{ not json')
    expect(loadRun()).toBeNull()
  })

  it('clearRun removes the save', () => {
    saveRun(startRun(1))
    clearRun()
    expect(loadRun()).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/state/persistence.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

```ts
import type { RunState } from '../model/types'
import { SCHEMA_VERSION } from '../engine/run'

const KEY = 'tower-of-ash:save'

export function saveRun(run: RunState): void {
  try { localStorage.setItem(KEY, JSON.stringify(run)) } catch { /* storage full / unavailable */ }
}

export function loadRun(): RunState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as RunState
    if (data.schemaVersion !== SCHEMA_VERSION) return null
    return data
  } catch {
    return null
  }
}

export function clearRun(): void {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/state/persistence.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/state/persistence.ts src/state/persistence.test.ts
git commit -m "feat: localStorage persistence with versioning and corruption safety"
```

---

## Task 12: Game state hook (`useGame`)

The single integration point: holds app screen + run + combat state, owns the RNG, calls the engine, and persists after each meaningful change. UI components consume this.

**Files:**
- Create: `src/state/useGame.tsx`

- [ ] **Step 1: Create `src/state/useGame.tsx`**

```tsx
import { useCallback, useRef, useState } from 'react'
import type { CombatState, RunState } from '../model/types'
import { makeRng, type RNG } from '../engine/rng'
import { createCombat, playCard as enginePlayCard, endTurn as engineEndTurn } from '../engine/combat'
import {
  startRun, currentFloor, isBossFloor, rewardOptions, addCardToDeck, advanceFloor, recordVictory, recordDefeat,
} from '../engine/run'
import { CARDS } from '../content/cards'
import { ENEMIES } from '../content/enemies'
import { saveRun, loadRun, clearRun } from './persistence'

export type Screen = 'title' | 'combat' | 'reward' | 'win' | 'lose' | 'deck'

export interface GameApi {
  screen: Screen
  run: RunState | null
  combat: CombatState | null
  rewards: string[]
  hasSave: boolean
  newRun: () => void
  continueRun: () => void
  play: (handIndex: number) => void
  endTurn: () => void
  chooseReward: (cardId: string | null) => void
  openDeck: () => void
  closeDeck: () => void
  backToTitle: () => void
}

function seedNow(): number {
  // app runtime only (not a workflow script), Date.now is fine here
  return (Date.now() & 0xffffffff) >>> 0
}

export function useGame(): GameApi {
  const [screen, setScreen] = useState<Screen>('title')
  const [run, setRun] = useState<RunState | null>(null)
  const [combat, setCombat] = useState<CombatState | null>(null)
  const [rewards, setRewards] = useState<string[]>([])
  const [hasSave, setHasSave] = useState<boolean>(() => loadRun() !== null)
  const prevScreen = useRef<Screen>('title')
  const rng = useRef<RNG>(makeRng(seedNow()))

  const beginCombat = useCallback((r: RunState) => {
    const enemy = ENEMIES[currentFloor(r).enemyId]
    setCombat(createCombat(enemy, r.deck, r.playerHp, r.maxHp, rng.current, CARDS))
    setScreen('combat')
  }, [])

  const newRun = useCallback(() => {
    const r = startRun(seedNow())
    rng.current = makeRng(r.seed)
    setRun(r)
    saveRun(r)
    setHasSave(true)
    beginCombat(r)
  }, [beginCombat])

  const continueRun = useCallback(() => {
    const r = loadRun()
    if (!r) return
    rng.current = makeRng((r.seed ^ r.floor ^ r.playerHp) >>> 0)
    setRun(r)
    beginCombat(r)
  }, [beginCombat])

  // Called once when combat reaches a terminal phase. Top-level setters only (no nested setState).
  const finishCombat = useCallback((c: CombatState, r: RunState) => {
    if (c.phase === 'won') {
      const updated: RunState = { ...r, playerHp: c.player.hp }
      if (isBossFloor(updated)) {
        const won = recordVictory(updated)
        setRun(won); clearRun(); setHasSave(false); setScreen('win')
      } else {
        setRun(updated); saveRun(updated); setRewards(rewardOptions(rng.current)); setScreen('reward')
      }
    } else if (c.phase === 'lost') {
      setRun(recordDefeat(r)); clearRun(); setHasSave(false); setScreen('lose')
    }
  }, [])

  const play = useCallback((handIndex: number) => {
    if (!combat || !run) return
    const next = enginePlayCard(combat, handIndex, rng.current, CARDS)
    setCombat(next)
    if (next.phase === 'won' || next.phase === 'lost') finishCombat(next, run)
  }, [combat, run, finishCombat])

  const endTurn = useCallback(() => {
    if (!combat || !run) return
    const next = engineEndTurn(combat, rng.current, CARDS)
    setCombat(next)
    if (next.phase === 'won' || next.phase === 'lost') finishCombat(next, run)
  }, [combat, run, finishCombat])

  const chooseReward = useCallback((cardId: string | null) => {
    if (!run) return
    let r = run
    if (cardId) r = addCardToDeck(r, cardId)
    r = advanceFloor(r)
    setRun(r); saveRun(r)
    beginCombat(r)
  }, [run, beginCombat])

  const openDeck = useCallback(() => { prevScreen.current = screen; setScreen('deck') }, [screen])
  const closeDeck = useCallback(() => setScreen(prevScreen.current), [])
  const backToTitle = useCallback(() => { setScreen('title'); setHasSave(loadRun() !== null) }, [])

  return {
    screen, run, combat, rewards, hasSave,
    newRun, continueRun, play, endTurn, chooseReward, openDeck, closeDeck, backToTitle,
  }
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/state/useGame.tsx
git commit -m "feat: useGame hook wiring engine, run, and persistence"
```

---

## Task 13: Card component + Combat screen

**Files:**
- Create: `src/ui/Card.tsx`, `src/ui/CombatScreen.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create `src/ui/Card.tsx`**

```tsx
import type { CardDef } from '../model/types'

const COLOR_VAR: Record<CardDef['color'], string> = { red: 'var(--red)', blue: 'var(--blue)', purple: 'var(--purple)' }

export function Card({ card, disabled, onPlay }: { card: CardDef; disabled?: boolean; onPlay?: () => void }) {
  return (
    <button className="card" disabled={disabled} onClick={onPlay}
      style={{ borderColor: COLOR_VAR[card.color], opacity: disabled ? 0.45 : 1 }}>
      <div className="card-cost">{card.cost}</div>
      <div className="card-name" style={{ color: COLOR_VAR[card.color] }}>{card.name}</div>
      <div className="card-text">{card.text}</div>
    </button>
  )
}
```

- [ ] **Step 2: Create `src/ui/CombatScreen.tsx`**

```tsx
import type { CombatState } from '../model/types'
import { currentIntent } from '../engine/combat'
import { CARDS } from '../content/cards'
import { Card } from './Card'

function Bar({ hp, max }: { hp: number; max: number }) {
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, (hp / max) * 100))}%` }} />
      <span className="bar-label">{Math.max(0, hp)} / {max}</span>
    </div>
  )
}

function intentText(s: CombatState): string {
  const it = currentIntent(s)
  switch (it.kind) {
    case 'attack': return `攻撃 ${it.value}${it.times && it.times > 1 ? ` ×${it.times}` : ''}`
    case 'defend': return `防御 ${it.value}`
    case 'buff': return `強化 (${it.status})`
    case 'debuff': return `弱化 (${it.status} ${it.amount})`
  }
}

function statusLine(s: { vulnerable: number; weak: number; strength: number; poison: number }): string {
  const parts: string[] = []
  if (s.strength) parts.push(`力${s.strength}`)
  if (s.vulnerable) parts.push(`脆弱${s.vulnerable}`)
  if (s.weak) parts.push(`弱体${s.weak}`)
  if (s.poison) parts.push(`毒${s.poison}`)
  return parts.join(' ')
}

export function CombatScreen({ combat, onPlay, onEndTurn, onOpenDeck }: {
  combat: CombatState
  onPlay: (i: number) => void
  onEndTurn: () => void
  onOpenDeck: () => void
}) {
  const { player, enemy, hand } = combat
  return (
    <div className="combat">
      <div className="enemy-area">
        <div className="enemy-name">{enemy.def.name}</div>
        <div className="intent">予告: {intentText(combat)}</div>
        <Bar hp={enemy.hp} max={enemy.maxHp} />
        <div className="status">{enemy.block > 0 ? `🛡 ${enemy.block}　` : ''}{statusLine(enemy.status)}</div>
      </div>

      <div className="player-area">
        <Bar hp={player.hp} max={player.maxHp} />
        <div className="status">{player.block > 0 ? `🛡 ${player.block}　` : ''}{statusLine(player.status)}</div>
        <div className="resources">
          <span className="energy">⚡ {player.energy}/{player.maxEnergy}</span>
          <button className="btn" onClick={onOpenDeck}>デッキ</button>
          <button className="btn end-turn" onClick={onEndTurn}>ターン終了</button>
        </div>
      </div>

      <div className="hand">
        {hand.map((id, i) => {
          const card = CARDS[id]
          return <Card key={`${id}-${i}`} card={card} disabled={card.cost > player.energy} onPlay={() => onPlay(i)} />
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Append combat styles to `src/styles.css`**

```css
.combat { display: flex; flex-direction: column; flex: 1; padding: 12px; gap: 12px; }
.enemy-area { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px; text-align: center; }
.enemy-name { font-size: 20px; font-weight: 600; }
.intent { color: var(--gold); margin: 6px 0; font-size: 14px; }
.bar { position: relative; height: 22px; background: #241f44; border-radius: 11px; overflow: hidden; margin: 6px 0; }
.bar-fill { position: absolute; inset: 0; background: var(--red); transition: width .25s ease; }
.bar-label { position: relative; font-size: 12px; line-height: 22px; }
.status { font-size: 12px; color: var(--muted); min-height: 16px; }
.player-area { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 12px; }
.player-area .bar-fill { background: #4caf6a; }
.resources { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.energy { color: #ffd76a; font-weight: 600; }
.btn { background: #241f44; border: 1px solid var(--line); border-radius: 8px; padding: 8px 12px; }
.end-turn { margin-left: auto; background: var(--purple); border-color: var(--purple); }
.hand { display: flex; gap: 8px; overflow-x: auto; padding: 8px 4px; margin-top: auto; }
.card { flex: 0 0 96px; height: 132px; background: #15122b; border: 2px solid var(--line); border-radius: 10px;
  padding: 8px; display: flex; flex-direction: column; text-align: left; transition: transform .08s; }
.card:active:not(:disabled) { transform: translateY(-6px); }
.card-cost { position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #ffd76a; color: #000;
  font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 13px; }
.card-name { margin-top: 26px; font-weight: 600; font-size: 14px; }
.card-text { margin-top: 6px; font-size: 11px; color: var(--muted); line-height: 1.3; }
```

- [ ] **Step 4: Verify typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/ui/Card.tsx src/ui/CombatScreen.tsx src/styles.css
git commit -m "feat: card component and combat screen"
```

---

## Task 14: Remaining screens + App router

**Files:**
- Create: `src/ui/RewardScreen.tsx`, `src/ui/TowerProgress.tsx`, `src/ui/DeckView.tsx`, `src/ui/TitleScreen.tsx`, `src/ui/ResultScreen.tsx`
- Modify: `src/App.tsx`, `src/styles.css`

- [ ] **Step 1: Create `src/ui/RewardScreen.tsx`**

```tsx
import { CARDS } from '../content/cards'
import { Card } from './Card'

export function RewardScreen({ rewards, onChoose }: { rewards: string[]; onChoose: (id: string | null) => void }) {
  return (
    <div className="screen">
      <h2>カードを選ぶ</h2>
      <div className="reward-cards">
        {rewards.map((id, i) => <Card key={`${id}-${i}`} card={CARDS[id]} onPlay={() => onChoose(id)} />)}
      </div>
      <button className="btn" onClick={() => onChoose(null)}>スキップ</button>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/ui/TowerProgress.tsx`**

```tsx
import type { RunState } from '../model/types'
import { TOWER } from '../content/tower'

export function TowerProgress({ run }: { run: RunState }) {
  return (
    <div className="tower-progress">
      {TOWER.map((f, i) => (
        <span key={i} className={`floor ${f.kind} ${i === run.floor ? 'current' : ''} ${i < run.floor ? 'done' : ''}`}>
          {f.kind === 'boss' ? '★' : f.kind === 'elite' ? '◆' : '●'}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/ui/DeckView.tsx`**

```tsx
import type { RunState } from '../model/types'
import { CARDS } from '../content/cards'

export function DeckView({ run, onClose }: { run: RunState; onClose: () => void }) {
  const counts = run.deck.reduce<Record<string, number>>((acc, id) => { acc[id] = (acc[id] ?? 0) + 1; return acc }, {})
  return (
    <div className="screen">
      <h2>デッキ ({run.deck.length}枚)</h2>
      <ul className="deck-list">
        {Object.entries(counts).map(([id, n]) => (
          <li key={id}><span>{CARDS[id].name}</span><span className="muted">×{n}</span></li>
        ))}
      </ul>
      <button className="btn" onClick={onClose}>閉じる</button>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/ui/TitleScreen.tsx`**

```tsx
export function TitleScreen({ hasSave, onNew, onContinue }: { hasSave: boolean; onNew: () => void; onContinue: () => void }) {
  return (
    <div className="screen title">
      <h1>灰の塔</h1>
      <p className="muted">Tower of Ash</p>
      {hasSave && <button className="btn primary" onClick={onContinue}>つづきから</button>}
      <button className="btn primary" onClick={onNew}>{hasSave ? 'はじめから' : 'ゲーム開始'}</button>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/ui/ResultScreen.tsx`**

```tsx
export function ResultScreen({ won, floor, onBack }: { won: boolean; floor: number; onBack: () => void }) {
  return (
    <div className="screen title">
      <h1>{won ? '塔を制覇した' : '力尽きた'}</h1>
      <p className="muted">{won ? '灰の王を討ち取った！' : `到達 ${floor + 1} 階`}</p>
      <button className="btn primary" onClick={onBack}>タイトルへ</button>
    </div>
  )
}
```

- [ ] **Step 6: Replace `src/App.tsx`**

```tsx
import { useGame } from './state/useGame'
import { CombatScreen } from './ui/CombatScreen'
import { RewardScreen } from './ui/RewardScreen'
import { DeckView } from './ui/DeckView'
import { TitleScreen } from './ui/TitleScreen'
import { ResultScreen } from './ui/ResultScreen'
import { TowerProgress } from './ui/TowerProgress'

export default function App() {
  const g = useGame()
  return (
    <div className="app">
      {g.run && (g.screen === 'combat' || g.screen === 'reward') && <TowerProgress run={g.run} />}
      {g.screen === 'title' && <TitleScreen hasSave={g.hasSave} onNew={g.newRun} onContinue={g.continueRun} />}
      {g.screen === 'combat' && g.combat && (
        <CombatScreen combat={g.combat} onPlay={g.play} onEndTurn={g.endTurn} onOpenDeck={g.openDeck} />
      )}
      {g.screen === 'reward' && <RewardScreen rewards={g.rewards} onChoose={g.chooseReward} />}
      {g.screen === 'deck' && g.run && <DeckView run={g.run} onClose={g.closeDeck} />}
      {g.screen === 'win' && g.run && <ResultScreen won floor={g.run.floor} onBack={g.backToTitle} />}
      {g.screen === 'lose' && g.run && <ResultScreen won={false} floor={g.run.floor} onBack={g.backToTitle} />}
    </div>
  )
}
```

- [ ] **Step 7: Append screen styles to `src/styles.css`**

```css
.screen { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px; }
.screen.title { justify-content: center; }
.screen h1 { font-size: 40px; margin: 0; color: var(--gold); letter-spacing: 4px; }
.muted { color: var(--muted); }
.btn.primary { background: var(--purple); border: none; border-radius: 10px; padding: 14px 28px; font-size: 16px; min-width: 200px; }
.reward-cards { display: flex; gap: 12px; }
.tower-progress { display: flex; gap: 6px; justify-content: center; padding: 10px; }
.floor { color: var(--line); font-size: 14px; }
.floor.elite { color: #c08; }
.floor.boss { color: var(--gold); }
.floor.done { color: #4caf6a; }
.floor.current { color: #fff; transform: scale(1.4); }
.deck-list { list-style: none; padding: 0; width: 100%; max-width: 320px; }
.deck-list li { display: flex; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid var(--line); }
```

- [ ] **Step 8: Verify build + run a manual smoke test**

Run: `npm run build`
Expected: passes.

Run: `npm run dev` and open the printed URL. Verify: title → start → play cards → end turn → win a fight → pick a reward → next fight. (Use browser devtools mobile view.)

- [ ] **Step 9: Commit**

```bash
git add src/ui src/App.tsx src/styles.css
git commit -m "feat: reward, deck, title, result screens and app router"
```

---

## Task 15: Juice (damage feedback)

Adds floating damage numbers and a hit-shake to make combat feel responsive. Implemented as a small presentational layer driven by hp deltas; no engine changes.

**Files:**
- Create: `src/ui/useHitFeedback.ts`
- Modify: `src/ui/CombatScreen.tsx`, `src/styles.css`

- [ ] **Step 1: Create `src/ui/useHitFeedback.ts`**

```ts
import { useEffect, useRef, useState } from 'react'

// Returns a shake flag and the most recent hp delta to display as a floating number.
export function useHitFeedback(hp: number) {
  const prev = useRef(hp)
  const [pop, setPop] = useState<{ delta: number; key: number } | null>(null)
  const [shake, setShake] = useState(false)
  const keyRef = useRef(0)

  useEffect(() => {
    const delta = hp - prev.current
    prev.current = hp
    if (delta < 0) {
      keyRef.current += 1
      setPop({ delta, key: keyRef.current })
      setShake(true)
      const t = setTimeout(() => setShake(false), 220)
      return () => clearTimeout(t)
    }
  }, [hp])

  return { pop, shake }
}
```

- [ ] **Step 2: Use it in `CombatScreen.tsx`**

Add the import and apply feedback to the enemy and player areas. Add at top:

```tsx
import { useHitFeedback } from './useHitFeedback'
```

Inside `CombatScreen`, before the return, add:

```tsx
  const enemyFx = useHitFeedback(enemy.hp)
  const playerFx = useHitFeedback(player.hp)
```

Then change the enemy area opening tag and player area opening tag to include shake + a floating number. Replace:

```tsx
<div className="enemy-area">
```
with:
```tsx
<div className={`enemy-area${enemyFx.shake ? ' shake' : ''}`}>
  {enemyFx.pop && <span key={enemyFx.pop.key} className="dmg-pop">{enemyFx.pop.delta}</span>}
```

And replace:
```tsx
<div className="player-area">
```
with:
```tsx
<div className={`player-area${playerFx.shake ? ' shake' : ''}`}>
  {playerFx.pop && <span key={playerFx.pop.key} className="dmg-pop">{playerFx.pop.delta}</span>}
```

(Both areas need `position: relative`, added in the next step.)

- [ ] **Step 3: Append juice styles to `src/styles.css`**

```css
.enemy-area, .player-area { position: relative; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
.shake { animation: shake .2s; }
@keyframes pop { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-30px)} }
.dmg-pop { position: absolute; top: 8px; right: 14px; font-size: 26px; font-weight: 800; color: #ff5a4d;
  animation: pop .6s ease-out forwards; pointer-events: none; }
```

- [ ] **Step 4: Verify build + manual check**

Run: `npm run build`
Expected: passes.

Run `npm run dev`, attack the enemy, confirm a red number pops and the panel shakes.

- [ ] **Step 5: Commit**

```bash
git add src/ui/useHitFeedback.ts src/ui/CombatScreen.tsx src/styles.css
git commit -m "feat: damage popups and hit shake"
```

---

## Task 16: PWA (installable, offline) + final verification

**Files:**
- Modify: `package.json`, `vite.config.ts`
- Create: `public/pwa-192.png`, `public/pwa-512.png`

- [ ] **Step 1: Install the PWA plugin**

Run: `npm install -D vite-plugin-pwa@^0.20.1`
Expected: installs.

- [ ] **Step 2: Configure the plugin in `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: '灰の塔',
        short_name: '灰の塔',
        description: 'ダークファンタジーのデッキ構築ローグライク',
        theme_color: '#0d0b1f',
        background_color: '#0d0b1f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  test: { globals: true, environment: 'node' },
})
```

- [ ] **Step 3: Create placeholder icons**

Generate two solid dark-purple PNG icons (192 and 512). Run this Node one-liner from the project root (writes minimal valid PNGs):

```bash
node -e "const fs=require('fs');const z=require('zlib');function png(s){const sig=Buffer.from([137,80,78,71,13,10,26,10]);function chunk(t,d){const len=Buffer.alloc(4);len.writeUInt32BE(d.length);const tb=Buffer.from(t);const crc=Buffer.alloc(4);const c=require('zlib');let crcTable=[];for(let n=0;n<256;n++){let c2=n;for(let k=0;k<8;k++)c2=c2&1?0xedb88320^(c2>>>1):c2>>>1;crcTable[n]=c2>>>0}let cc=0xffffffff;const buf=Buffer.concat([tb,d]);for(let i=0;i<buf.length;i++)cc=crcTable[(cc^buf[i])&0xff]^(cc>>>8);crc.writeUInt32BE((cc^0xffffffff)>>>0);return Buffer.concat([len,tb,d,crc])}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(s,0);ihdr.writeUInt32BE(s,4);ihdr[8]=8;ihdr[9]=2;const row=Buffer.alloc(1+s*3);for(let x=0;x<s;x++){row[1+x*3]=13;row[2+x*3]=11;row[3+x*3]=31}const raw=Buffer.concat(Array.from({length:s},()=>row));const idat=z.deflateSync(raw);return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))])}fs.writeFileSync('public/pwa-192.png',png(192));fs.writeFileSync('public/pwa-512.png',png(512));console.log('icons written')"
```

Expected: prints `icons written`; both files exist in `public/`.

(These are placeholder solid-color icons — replace with real artwork later, per the spec's "art is swappable" principle.)

- [ ] **Step 4: Build and confirm the service worker + manifest are emitted**

Run: `npm run build`
Expected: `dist/` contains `sw.js` (or `registerSW.js`), `manifest.webmanifest`, and the two icons.

- [ ] **Step 5: Preview and verify installability**

Run: `npm run preview`
Open the URL in Chrome, open DevTools → Application → Manifest. Verify the manifest loads with name "灰の塔" and a service worker is registered. (On a phone, the browser will offer "ホーム画面に追加".)

- [ ] **Step 6: Full test + typecheck + commit**

Run: `npm run test:run`
Expected: all tests pass.

Run: `npm run typecheck`
Expected: no errors.

```bash
git add -A
git commit -m "feat: PWA manifest, service worker, and icons"
```

---

## Final verification checklist

- [ ] `npm run test:run` — all engine/run/persistence/content tests green
- [ ] `npm run typecheck` — clean
- [ ] `npm run build` — clean, emits PWA assets
- [ ] Manual full run on a phone-sized viewport: title → fight → reward → elite heal → boss → win/lose → back to title; refresh mid-run and "つづきから" restores the run.

---

## Self-review notes (verifies plan against spec)

- **Combat loop** (spec §3): Tasks 3–8 (turn structure, attacks, block, statuses, utility, enemy AI). ✓
- **4 statuses only** (spec §3): vulnerable/weak/strength/poison — Task 6 + content; no 5th status introduced. ✓
- **Run structure: 8-floor linear, HP persists, reward 1-of-3, elite heal, boss=win** (spec §4): Tasks 9, 10, 12, 14. ✓
- **Content: 1 class, ~20 cards, 6 normal + 2 elite + boss** (spec §5): Task 9 (16 cards table + starter; 14-card reward pool; 5 normal + 2 elite + 1 boss). Note: the card table has 16 distinct cards (≈20 including starter copies); 5 distinct normal enemies are used across the normal floors. Within spec's "約20 / 5〜6 + ボス" intent. ✓
- **Card visual: CSS + color by type (red/blue/purple)** (spec §6): Task 13 Card component. ✓
- **Game feel: intents, damage numbers, shake** (spec §7): intents in Task 13, popups + shake in Task 15. ✓
- **Architecture: pure engine, separated content, persistence, UI thin** (spec §8): module layout + Tasks 1–14. ✓
- **Persistence: localStorage, versioned, corruption-safe** (spec §9): Task 11. ✓
- **Testing: pure functions unit-tested** (spec §10): Tasks 2,3–8,9,10,11. ✓
- **PWA, offline, free** (spec §1,2): Task 16. ✓
- **Cut for v1** (spec §11): no map branching, relics, shops, events, potions, upgrades, multiclass in any task. ✓
