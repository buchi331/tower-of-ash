# Card Art Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render card artwork from the existing `CardDef.art` keys and create a Claude-friendly prompt tracking document for the first card art batch.

**Architecture:** Add a small Vite asset resolver in `src/assets/cardArt.ts`, then update `Card.tsx` and `styles.css` so each card renders either an imported image or a stable fallback label. Keep combat, run, persistence, and card data behavior unchanged.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Vitest 2, CSS, local imported image assets.

## Global Constraints

- Card images live under `src/assets/art/cards/`.
- Use lowercase stable filenames based on the `art` key or card id.
- Preferred final image format is WebP; PNG is acceptable for early drafts.
- Missing assets must return `undefined` and must not break card rendering.
- No combat, run, or persistence logic changes in this milestone.
- Runtime image downloads and remote asset hosting are out of scope.
- Required verification commands: `npm.cmd run typecheck`, `npm.cmd run test:run`, and `npm.cmd run build`.

---

## File Structure

- Create `src/assets/cardArt.ts`: owns card art URL lookup and missing-art behavior.
- Create `src/assets/cardArt.test.ts`: verifies known keys resolve and unknown keys return `undefined`.
- Modify `src/ui/Card.tsx`: consumes `getCardArt(card.art)` and renders image/fallback artwork panel.
- Modify `src/styles.css`: defines fixed artwork panel dimensions and fallback styling inside the existing card.
- Create `docs/art/card-art-prompts.md`: Claude handoff table for the first art batch.

---

### Task 1: Card Art Resolver And Card UI

**Files:**
- Create: `src/assets/cardArt.ts`
- Create: `src/assets/cardArt.test.ts`
- Modify: `src/ui/Card.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `CardDef.art: string` from `src/model/types.ts`
- Produces: `getCardArt(artKey: string): string | undefined` from `src/assets/cardArt.ts`

- [ ] **Step 1: Create placeholder image assets for the first art keys**

Create the directory:

```powershell
New-Item -ItemType Directory -Force -Path src\assets\art\cards
```

Create these files as temporary SVG-backed assets renamed with `.svg` extension for the first pass:

```text
src/assets/art/cards/sword.svg
src/assets/art/cards/shield.svg
src/assets/art/cards/hammer.svg
src/assets/art/cards/swords.svg
src/assets/art/cards/axe.svg
src/assets/art/cards/flask.svg
src/assets/art/cards/flame.svg
src/assets/art/cards/eye.svg
```

Each file can use this exact structure, changing only the `<title>` text and the central letter. Example for `sword.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-labelledby="title">
  <title>sword</title>
  <rect width="256" height="256" rx="28" fill="#15122b"/>
  <circle cx="128" cy="128" r="90" fill="#241f44"/>
  <path d="M128 34 146 118 222 128 146 138 128 222 110 138 34 128 110 118Z" fill="#e8c170"/>
  <text x="128" y="142" text-anchor="middle" font-family="serif" font-size="38" font-weight="700" fill="#ece9ff">S</text>
</svg>
```

Use these central letters:

```text
sword.svg: S
shield.svg: D
hammer.svg: H
swords.svg: X
axe.svg: A
flask.svg: P
flame.svg: F
eye.svg: E
```

- [ ] **Step 2: Write the failing resolver test**

Create `src/assets/cardArt.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getCardArt } from './cardArt'

describe('getCardArt', () => {
  it('returns a bundled URL for a known art key', () => {
    expect(getCardArt('sword')).toContain('/src/assets/art/cards/sword.svg')
  })

  it('returns undefined for an unknown art key', () => {
    expect(getCardArt('missing-art')).toBeUndefined()
  })
})
```

- [ ] **Step 3: Run the failing resolver test**

Run:

```powershell
npm.cmd run test:run -- src/assets/cardArt.test.ts
```

Expected: FAIL because `src/assets/cardArt.ts` does not exist yet.

- [ ] **Step 4: Implement the resolver**

Create `src/assets/cardArt.ts`:

```ts
import axe from './art/cards/axe.svg'
import eye from './art/cards/eye.svg'
import flame from './art/cards/flame.svg'
import flask from './art/cards/flask.svg'
import hammer from './art/cards/hammer.svg'
import shield from './art/cards/shield.svg'
import sword from './art/cards/sword.svg'
import swords from './art/cards/swords.svg'

const CARD_ART: Record<string, string> = {
  axe,
  eye,
  flame,
  flask,
  hammer,
  shield,
  sword,
  swords,
}

export function getCardArt(artKey: string): string | undefined {
  return CARD_ART[artKey]
}
```

- [ ] **Step 5: Run the resolver test until it passes**

Run:

```powershell
npm.cmd run test:run -- src/assets/cardArt.test.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 6: Update `Card.tsx` to render art**

Replace `src/ui/Card.tsx` with:

```tsx
import type { CardDef } from '../model/types'
import { getCardArt } from '../assets/cardArt'

const COLOR_VAR: Record<CardDef['color'], string> = { red: 'var(--red)', blue: 'var(--blue)', purple: 'var(--purple)' }

export function Card({ card, disabled, onPlay }: { card: CardDef; disabled?: boolean; onPlay?: () => void }) {
  const artUrl = getCardArt(card.art)

  return (
    <button
      className="card"
      disabled={disabled}
      onClick={onPlay}
      style={{ borderColor: COLOR_VAR[card.color], opacity: disabled ? 0.45 : 1 }}
    >
      <div className="card-cost">{card.cost}</div>
      <div className="card-name" style={{ color: COLOR_VAR[card.color] }}>{card.name}</div>
      <div className="card-art" aria-label={`${card.art} artwork`}>
        {artUrl ? (
          <img src={artUrl} alt="" draggable={false} />
        ) : (
          <span className="card-art-fallback">{card.art}</span>
        )}
      </div>
      <div className="card-text">{card.text}</div>
    </button>
  )
}
```

- [ ] **Step 7: Update CSS for fixed card artwork layout**

In `src/styles.css`, replace the existing `.card`, `.card-cost`, `.card-name`, and `.card-text` block with:

```css
.card { position: relative; flex: 0 0 104px; height: 150px; background: #15122b; border: 2px solid var(--line); border-radius: 8px;
  padding: 7px; display: flex; flex-direction: column; text-align: left; transition: transform .08s; overflow: hidden; }
.card:active:not(:disabled) { transform: translateY(-6px); }
.card-cost { position: absolute; top: 7px; left: 7px; width: 22px; height: 22px; border-radius: 50%; background: #ffd76a; color: #000;
  font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 13px; z-index: 1; }
.card-name { min-height: 22px; padding-left: 28px; font-weight: 600; font-size: 13px; line-height: 1.1; overflow: hidden; }
.card-art { height: 58px; margin: 6px 0; border: 1px solid rgba(236,233,255,.16); border-radius: 6px; background: #241f44;
  display: flex; align-items: center; justify-content: center; overflow: hidden; }
.card-art img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card-art-fallback { color: var(--muted); font-size: 10px; line-height: 1.1; max-width: 88px; overflow-wrap: anywhere; text-align: center; padding: 4px; }
.card-text { margin-top: 0; font-size: 11px; color: var(--muted); line-height: 1.25; overflow: hidden; }
```

- [ ] **Step 8: Run verification for Task 1**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Expected:

```text
typecheck exits 0
test:run exits 0 with all tests passing
build exits 0 and writes dist/
```

- [ ] **Step 9: Commit Task 1**

Run:

```powershell
git add src/assets/cardArt.ts src/assets/cardArt.test.ts src/assets/art/cards src/ui/Card.tsx src/styles.css
git commit -m "feat: render card artwork"
```

---

### Task 2: Claude Prompt Tracking Document

**Files:**
- Create: `docs/art/card-art-prompts.md`

**Interfaces:**
- Consumes: first-batch card ids and art keys from `src/content/cards.ts`
- Produces: a stable table Claude can update without touching `src/`

- [ ] **Step 1: Create the art docs directory**

Run:

```powershell
New-Item -ItemType Directory -Force -Path docs\art
```

- [ ] **Step 2: Create the prompt tracking document**

Create `docs/art/card-art-prompts.md`:

```markdown
# Card Art Prompts

This document is the shared handoff between Claude and Codex for card illustrations.

Claude owns the creative prompt text. Codex owns implementation, filenames, asset placement, and verification.

## Style Anchor

Compact dark-fantasy spot illustration, painterly fantasy card art, strong silhouette, restrained background, high contrast at small mobile size, no text inside the image.

## First Batch

| Card id | Art key | Effect summary | Prompt | Target filename | Status |
|---|---|---|---|---|---|
| `strike` | `sword` | Deal 6 damage. | A single worn iron sword cutting through ash-dark air, bright ember sparks at the blade edge, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/sword.webp` | placeholder svg present |
| `defend` | `shield` | Gain 5 block. | A battered round shield catching a heavy blow, blue-gray defensive glow, ash and dust around the rim, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/shield.webp` | placeholder svg present |
| `bash` | `hammer` | Deal 8 damage and apply vulnerable 2. | A brutal war hammer descending with cracked golden impact light, enemy armor implied but not detailed, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/hammer.webp` | placeholder svg present |
| `twinslash` | `swords` | Deal 3 damage twice. | Two crossing blades leaving twin red-orange arcs in smoky darkness, fast motion and clean readable shapes, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/swords.webp` | placeholder svg present |
| `heavy` | `axe` | Deal 14 damage. | A heavy execution axe embedded in cracked black stone, glowing embers in the split, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/axe.webp` | placeholder svg present |
| `poisonblade` | `flask` | Deal 5 damage and apply poison 3. | A poisoned dagger beside a small green vial, sickly vapor curling upward, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/flask.webp` | placeholder svg present |
| `allout` | `flame` | Deal 22 damage. | A violent burst of crimson flame shaped like a final reckless strike, ash fragments flying outward, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/flame.webp` | placeholder svg present |
| `insight` | `eye` | Draw 2 cards. | A luminous eye opening inside a ring of ash and pale blue light, mysterious but readable at small size, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/eye.webp` | placeholder svg present |

## Workflow

1. Claude updates prompt wording in this document only.
2. Generate or export final square images.
3. Save final files using the target filenames.
4. Codex updates `src/assets/cardArt.ts` imports from `.svg` to `.webp` when final images are present.
5. Codex runs `npm.cmd run typecheck`, `npm.cmd run test:run`, and `npm.cmd run build`.
```

- [ ] **Step 3: Verify docs are committed separately**

Run:

```powershell
git diff -- docs/art/card-art-prompts.md
```

Expected: diff shows only the new prompt tracking document.

- [ ] **Step 4: Commit Task 2**

Run:

```powershell
git add docs/art/card-art-prompts.md
git commit -m "docs: add card art prompt tracker"
```

---

### Task 3: Final Manual Verification

**Files:**
- Inspect: `src/ui/Card.tsx`
- Inspect: `src/styles.css`
- Inspect: `docs/art/card-art-prompts.md`

**Interfaces:**
- Consumes: completed Tasks 1 and 2
- Produces: confidence that the first art pipeline is ready for image replacement

- [ ] **Step 1: Run full verification commands**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Expected:

```text
all commands exit 0
```

- [ ] **Step 2: Start the local dev server**

Run:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 3: Inspect the card layout manually**

Open the Vite URL and start or continue a run.

Confirm:

- starter hand cards show an artwork panel
- `strike`, `defend`, and `bash` show placeholder art
- missing art keys still show fallback text
- cost bubble, card name, artwork, and text do not overlap
- disabled cards fade as one whole card

- [ ] **Step 4: Stop the dev server**

Stop the Vite process with `Ctrl+C` in the terminal running the server.

- [ ] **Step 5: Record final status**

Run:

```powershell
git status --short --branch
```

Expected:

```text
## main
?? .vite/
```

The `.vite/` directory is an existing untracked cache directory and is not part of this plan.
