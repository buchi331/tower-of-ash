# Card Art Pipeline Design

- Date: 2026-06-20
- Project: Tower of Ash
- Scope: Add a maintainable card illustration pipeline and a Claude collaboration workflow.

## Goal

Tower of Ash already has a `CardDef.art` field, but the card UI does not render artwork yet. This change will turn that field into a stable asset key so cards can show illustrations without changing combat logic or card data structure.

The first milestone is not to illustrate the whole game. It is to create the display and asset workflow, then add a small first batch of card images to validate visual direction.

## Recommended Approach

Start with card illustrations, then expand to enemy portraits and relic icons later.

Cards are the best first target because:

- The existing `art` field gives us a natural integration point.
- Card visuals are seen every turn, so a small number of images has high impact.
- The UI can degrade gracefully when an image is missing.
- Claude can help generate card-by-card prompt text from card names, effects, and worldbuilding.

## Visual Direction

Use compact dark-fantasy spot illustrations that read clearly inside small mobile card frames.

Preferred style:

- painterly or illustrated fantasy, not photorealistic
- strong silhouette and clear subject
- restrained background detail
- enough contrast to read at roughly 96px card width
- no embedded text in the image

The first batch should favor simple, iconic compositions: sword strike, shield guard, heavy hammer blow, poison blade, flame, eye, and similar motifs.

## Asset Layout

Card images should live under:

```text
src/assets/art/cards/
```

Use lowercase stable filenames based on the `art` key or card id:

```text
src/assets/art/cards/sword.webp
src/assets/art/cards/shield.webp
src/assets/art/cards/hammer.webp
```

Preferred format is WebP for final assets. PNG is acceptable for early drafts if transparency is useful. Images should be square so the UI can crop or fit them predictably.

## Code Design

Add a small asset resolver module:

```text
src/assets/cardArt.ts
```

Responsibilities:

- map known `CardDef.art` keys to imported image URLs
- expose a helper such as `getCardArt(artKey: string): string | undefined`
- return `undefined` for missing assets instead of throwing

Update `Card.tsx` to render an artwork panel above the card text:

- if an asset exists, render it as an image
- if no asset exists, render a compact fallback using the existing `art` key
- keep cost and name readable
- keep the card stable in size on mobile

No combat, run, or persistence logic should change for this milestone.

## Initial Batch

The first image pass should cover the starter deck and a few early rewards:

- `strike` / `sword`
- `defend` / `shield`
- `bash` / `hammer`
- `twinslash` / `swords`
- `heavy` / `axe`
- `poisonblade` / `flask`
- `allout` / `flame`
- `insight` / `eye`

This is enough to evaluate style without committing to a full production art pass.

## Claude Collaboration Workflow

Claude should be used primarily for creative production support, while Codex owns implementation and verification.

Claude responsibilities:

- propose card names, enemy concepts, and worldbuilding
- draft image prompts from card effect, card type, and desired mood
- maintain short creative notes for each asset

Codex responsibilities:

- implement asset loading and UI changes
- place generated images using stable filenames
- keep TypeScript types and tests healthy
- run `npm.cmd run typecheck`, `npm.cmd run test:run`, and builds when relevant
- inspect `git diff` after Claude edits before continuing

Shared working document:

```text
docs/art/card-art-prompts.md
```

This file should contain one row per card with:

- card id
- art key
- current Japanese display name
- gameplay effect summary
- image prompt
- generated filename
- status

## Text Encoding Note

Several existing Japanese strings appear mojibaked in the current source and design docs. Art prompt work depends on readable names and descriptions, so the project should either:

- restore readable Japanese strings before prompt generation, or
- keep an English effect summary in `docs/art/card-art-prompts.md` until the source text is repaired.

The art pipeline itself should not depend on the text cleanup being finished.

## Testing And Verification

Required checks for the implementation phase:

- `npm.cmd run typecheck`
- `npm.cmd run test:run`
- `npm.cmd run build`
- visual check of card layout at mobile width

Manual QA:

- missing art keys do not break rendering
- starter hand cards show art or fallback
- card text still fits
- disabled card opacity still applies to the whole card

## Out Of Scope

This spec does not include:

- enemy portrait rendering
- relic icon rendering
- full image generation for every card
- card balance changes
- Japanese text repair, except for documenting the need
- runtime image downloads or remote asset hosting

## Open Decisions

Use WebP as the default final format. If the image generation tool exports PNG first, keep PNG only as a temporary source or draft asset and convert when finalizing.

The first implementation should use local imported assets instead of dynamic path strings so Vite includes images reliably in production builds.
