# Card art prompts — Tower of Ash

Shared working doc for the card-art pipeline. Per `docs/superpowers/specs/2026-06-20-card-art-pipeline-design.md`:

- **Claude (this doc):** card concepts, worldbuilding, image prompts, creative notes, status.
- **Codex:** asset loading, `src/assets/cardArt.ts`, `Card.tsx` rendering, places images under `src/assets/art/cards/`, keeps types/tests/build green.
- **Seam:** `CardDef.art` key → `src/assets/art/cards/<artKey>.webp`. No combat/run/persistence changes.

### Encoding note
The source Japanese in `src/content/cards.ts` is valid UTF‑8 (verified: `斬撃`, `守勢`, `毒刃` read correctly, and the running build renders them correctly in‑browser). Any mojibake is a reader/terminal display artifact, not corrupted source. The **English effect summary** column below is the encoding‑proof reference for prompt work.

### Shared visual direction (append to every prompt)
> dark fantasy painterly spot illustration, single iconic subject, strong silhouette, dramatic rim lighting, restrained smoky background, high contrast so it reads at ~96px, square 1:1, centered composition, no text, no frame, no border.

Color/mood cue by card type: **attack** = ember/crimson · **skill (block/utility)** = cold steel‑blue · **power** = arcane violet · **poison** = sickly green.

Final format: **WebP**, square. PNG ok for drafts. Missing art must fall back gracefully (Codex handles).

---

## First Batch

Stable Claude/Codex handoff table for the first batch only.

| Card id | Art key | Effect summary | Image prompt | Generated/target filename | Status |
|---|---|---|---|---|---|
| `strike` | `sword` | Deal 6 damage. | A single worn iron sword cutting through ash-dark air, bright ember sparks at the blade edge, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/sword.webp` | placeholder svg present |
| `defend` | `shield` | Gain 5 block. | A battered round shield catching a heavy blow, blue-gray defensive glow, ash and dust around the rim, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/shield.webp` | placeholder svg present |
| `bash` | `hammer` | Deal 8 damage and apply Vulnerable 2. | A brutal war hammer descending with cracked golden impact light, enemy armor implied but not detailed, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/hammer.webp` | placeholder svg present |
| `twinslash` | `swords` | Deal 3 damage twice. | Two crossing blades leaving twin red-orange arcs in smoky darkness, fast motion and clean readable shapes, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/swords.webp` | placeholder svg present |
| `heavy` | `axe` | Deal 14 damage. | A heavy execution axe embedded in cracked black stone, glowing embers in the split, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/axe.webp` | placeholder svg present |
| `poisonblade` | `flask` | Deal 5 damage and apply Poison 3. | A poisoned dagger beside a small green vial, sickly vapor curling upward, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/flask.webp` | placeholder svg present |
| `allout` | `flame` | Deal 22 damage. | A violent burst of crimson flame shaped like a final reckless strike, ash fragments flying outward, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/flame.webp` | placeholder svg present |
| `insight` | `eye` | Draw 2 cards. | A luminous eye opening inside a ring of ash and pale blue light, mysterious but readable at small size, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/eye.webp` | placeholder svg present |

## Queued Prompts

Preserved from the earlier draft for later batches.

| Card id | Art key | Effect summary | Image prompt | Generated/target filename | Status |
|---|---|---|---|---|---|
| `lifesteal` | `droplet` | Deal 8 damage and heal 4. | A dark blade slick with blood, crimson droplets lifting upward off the steel into a faint vampiric red mist, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/droplet.webp` | queued |
| `reckless` | `skull` | Deal 10 damage and lose 3 HP. | A grinning cracked skull pierced on a jagged blade, reckless self-sacrifice, dim red embers glowing in the eye sockets, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/skull.webp` | queued |
| `shieldbash` | `shield-bolt` | Deal damage equal to current block. | A heavy round shield thrust forward edge-first as a weapon, a bright impact shock-bolt flashing across its central boss, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/shield-bolt.webp` | queued |
| `ironwall` | `wall` | Gain 12 block. | A colossal interlocked stone-and-iron fortress wall filling the frame, impenetrable, deep cold-blue shadow, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/wall.webp` | queued |
| `focus` | `up` | Gain Strength 2. | An upward surge of pale arcane energy converging to a single point, focused concentration, faint violet glow, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/up.webp` | queued |
| `inflame` | `bolt` | Power: Strength +3. | A clenched armored fist crackling with violet forge sparks, raw empowering strength, a glowing rune etched on the gauntlet, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/bolt.webp` | queued |
| `poisonmastery` | `biohazard` | Power: apply Poison 1 on each attack. | A swirling toxic sigil of three coiled serpents forming a venom emblem, dripping green ichor, arcane poison mastery, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/biohazard.webp` | queued |
| `adrenaline` | `run` | Draw 2 cards and gain 1 energy. | A blurred surge of forward motion, streaking speed lines and a burst of blue-white energy, momentum and quickness, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/run.webp` | queued |

## Remaining Prompts

Completes coverage so every card in `src/content/cards.ts` has a prompt and a target filename. Same seam: `CardDef.art` key → `src/assets/art/cards/<artKey>.webp`.

| Card id | Art key | Effect summary | Image prompt | Generated/target filename | Status |
|---|---|---|---|---|---|
| `weaken` | `down` | Apply Weak 2 to enemy. | A downward-curling wisp of cold blue-gray vapor sapping a faint armored silhouette, drooping and drained, weakening hex, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/down.webp` | queued |
| `venommist` | `cloud` | Apply Poison 6. | A rolling low cloud of sickly green venom mist creeping forward, faint toxic droplets suspended in the haze, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/cloud.webp` | queued |
| `flurry` | `arrows` | Deal 2 damage three times. | Three crimson-tipped thrusting strikes fanning out in rapid succession, motion streaks and ember sparks, fast multi-hit, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/arrows.webp` | queued |
| `riposte` | `parry` | Gain 6 block and deal 5 damage. | A blade turning aside an incoming strike with a bright steel-blue spark at the parry point, instantly counter-cutting, poised defense-into-attack, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/parry.webp` | queued |
| `conflagration` | `fire-burst` | Deal 11 damage and apply Vulnerable 1. | A blooming burst of crimson conflagration erupting outward in a ring of fire and flying embers, searing and exposing, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/fire-burst.webp` | queued |
| `channel` | `spiral` | Gain Strength 1 and draw 1 card. | A tight inward arcane violet spiral of channeled energy drawing power to a glowing core, focused breath of mana, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/spiral.webp` | queued |
| `corrode` | `acid` | Deal damage equal to enemy Poison. | A blade dissolving in dripping violet-green acid, corroded pitted steel with hissing fumes, poison-fueled decay, compact dark fantasy spot illustration, strong silhouette, restrained background, no text. | `src/assets/art/cards/acid.webp` | queued |

### Prose prompts — Remaining

**17. down.webp — 衰え / Weaken (skill)**
> A downward-curling wisp of cold blue-gray vapor draining a faint armored silhouette, drooping and sapped of strength. [shared visual direction]

**18. cloud.webp — 毒霧 / Venom Mist (skill · poison)**
> A rolling low bank of sickly green venom mist creeping forward, toxic droplets suspended in the haze. [shared visual direction]

**19. arrows.webp — 乱れ突き / Flurry (attack)**
> Three crimson-tipped thrusts fanning out in rapid succession, motion streaks and ember sparks, a fast multi-hit. [shared visual direction]

**20. parry.webp — 受け流し / Riposte (skill)**
> A blade turning aside an incoming strike with a bright steel-blue spark at the parry point, poised to counter-cut. [shared visual direction]

**21. fire-burst.webp — 業火 / Conflagration (attack)**
> A blooming burst of crimson fire erupting outward in a ring of embers, searing and exposing the target. [shared visual direction]

**22. spiral.webp — 練気 / Channel (skill)**
> A tight inward arcane-violet spiral of channeled energy drawing power to a glowing core, a focused breath of mana. [shared visual direction]

**23. acid.webp — 腐食 / Corrode (attack · poison)**
> A blade dissolving in dripping violet-green acid, corroded pitted steel with hissing fumes. [shared visual direction]

---

## Later Milestones

- Enemy portraits: skeleton, bats, mud golem, ghoul, wraith, curse mage, armored sentinel, Ash King boss.
- Relic icons: sealed pebble, pocket charm, torn scroll, burned ring, eye sigil, poison vial, iron mask, cracked crown.
- Add those rows and prompts when the project reaches the next batch.

---

## Image prompts — Batch 1 (starter + early rewards)

**1. sword.webp — 斬撃 / Strike (attack)**
> A single curved steel longsword caught mid‑slash, a thin crimson arc trailing the edge, sparks flicking off cold polished steel. [shared visual direction]

**2. shield.webp — 守勢 / Defend (skill)**
> A battered iron kite shield braced edge‑on, cold steel‑blue light glancing across dented metal, worn leather straps. [shared visual direction]

**3. hammer.webp — 痛打 / Bash (attack)**
> A massive iron warhammer crashing downward, a burst of dust and orange sparks exploding from the point of impact. [shared visual direction]

**4. swords.webp — 連刃 / Twin Slash (attack)**
> Two crossed short blades forming a sharp X, twin crimson slash streaks crisscrossing behind them, fast and vicious. [shared visual direction]

**5. axe.webp — 重撃 / Heavy Blow (attack)**
> A huge two‑handed executioner's battle axe, brutal notched edge, heavy and grim, a faint ember glow along the steel. [shared visual direction]

**6. flask.webp — 毒刃 / Poison Blade (attack · poison)**
> A cracked glass vial of glowing green poison tipping its contents onto a dagger's edge, toxic emerald vapor curling upward. [shared visual direction]

**7. flame.webp — 渾身 / All‑Out (attack)**
> A sword blade wreathed in roaring orange fire, an all‑out blazing strike, embers and heat‑haze streaming off the steel. [shared visual direction]

**8. eye.webp — 見極め / Insight (skill)**
> A single glowing arcane eye opening within swirling mist, foresight and clarity, cold pale‑blue radiance. [shared visual direction]

---

## Image prompts — Queued (remaining cards)

**9. droplet.webp — 吸血 / Lifesteal (attack)**
> A dark blade slick with blood, crimson droplets lifting upward off the steel into a faint vampiric red mist. [shared visual direction]

**10. skull.webp — 捨て身 / Reckless (attack)**
> A grinning cracked skull pierced on a jagged blade, reckless self‑sacrifice, dim red embers glowing in the eye sockets. [shared visual direction]

**11. shield-bolt.webp — 盾打ち / Shield Bash (attack)**
> A heavy round shield thrust forward edge‑first as a weapon, a bright impact shock‑bolt flashing across its central boss. [shared visual direction]

**12. wall.webp — 鉄壁 / Iron Wall (skill)**
> A colossal interlocked stone‑and‑iron fortress wall filling the frame, impenetrable, deep cold‑blue shadow. [shared visual direction]

**13. up.webp — 集中 / Focus (skill)**
> An upward surge of pale arcane energy converging to a single point, focused concentration, faint violet glow. [shared visual direction]

**14. bolt.webp — 鍛錬 / Inflame (power)**
> A clenched armored fist crackling with violet forge‑sparks, raw empowering strength, a glowing rune etched on the gauntlet. [shared visual direction]

**15. biohazard.webp — 毒の心得 / Poison Mastery (power · poison)**
> A swirling toxic sigil of three coiled serpents forming a venom emblem, dripping green ichor, arcane poison mastery. [shared visual direction]

**16. run.webp — 戦機 / Adrenaline (skill)**
> A blurred surge of forward motion, streaking speed lines and a burst of blue‑white energy, momentum and quickness. [shared visual direction]

---

## Later milestones (out of scope for batch 1, prompts on request)
- **Enemy portraits** (`骸骨剣士` skeleton, `蝙蝠群` bats, `泥人形` mud golem, `屍喰い` ghoul, `影` wraith, `呪術師` curse mage, `鎧の番人` armored sentinel, `灰の王` Ash King boss) — wider, scene-ish framing.
- **Relic icons** (古びた盾 / 猛りの種火 / 砂のローブ / 怒りの拳 / 棘の革鎧 / 毒の小瓶 / 巨人の血 / 命の護符) — small emblem style.

Ping me (Claude) and I'll add these rows + prompts.
