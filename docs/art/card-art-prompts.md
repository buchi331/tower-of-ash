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

## Tracking table

| # | card id | art key | 名前 | effect (EN, encoding-proof) | filename | status |
|---|---------|---------|------|------------------------------|----------|--------|
| 1 | strike | sword | 斬撃 | Deal 6 damage | `sword.webp` | batch1 · prompt ready |
| 2 | defend | shield | 守勢 | Gain 5 block | `shield.webp` | batch1 · prompt ready |
| 3 | bash | hammer | 痛打 | Deal 8, apply Vulnerable 2 | `hammer.webp` | batch1 · prompt ready |
| 4 | twinslash | swords | 連刃 | Deal 3 twice | `swords.webp` | batch1 · prompt ready |
| 5 | heavy | axe | 重撃 | Deal 14 | `axe.webp` | batch1 · prompt ready |
| 6 | poisonblade | flask | 毒刃 | Deal 5, apply Poison 3 | `flask.webp` | batch1 · prompt ready |
| 7 | allout | flame | 渾身 | Deal 22 | `flame.webp` | batch1 · prompt ready |
| 8 | insight | eye | 見極め | Draw 2 cards | `eye.webp` | batch1 · prompt ready |
| 9 | lifesteal | droplet | 吸血 | Deal 8, heal 4 | `droplet.webp` | queued · prompt ready |
| 10 | reckless | skull | 捨て身 | Deal 10, lose 3 HP | `skull.webp` | queued · prompt ready |
| 11 | shieldbash | shield-bolt | 盾打ち | Deal damage equal to current block | `shield-bolt.webp` | queued · prompt ready |
| 12 | ironwall | wall | 鉄壁 | Gain 12 block | `wall.webp` | queued · prompt ready |
| 13 | focus | up | 集中 | Gain Strength 2 | `up.webp` | queued · prompt ready |
| 14 | inflame | bolt | 鍛錬 | Power: Strength +3 | `bolt.webp` | queued · prompt ready |
| 15 | poisonmastery | biohazard | 毒の心得 | Power: apply Poison 1 on each attack | `biohazard.webp` | queued · prompt ready |
| 16 | adrenaline | run | 戦機 | Draw 2, gain 1 energy | `run.webp` | queued · prompt ready |

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
