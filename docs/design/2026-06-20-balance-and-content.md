# Balance & content proposal — Tower of Ash

Date: 2026-06-20 · Author: Claude · Status: **proposal, awaiting go-ahead**

Scope: game logic/content only (`cards.ts`, `relics.ts`, `enemies.ts`, small `combat.ts` effect). Does **not** touch the rendering layer (Codex's domain). New cards include `art` keys so Codex can illustrate them; their prompt rows get added to `docs/art/card-art-prompts.md` on implementation.

---

## 1. Balance tweaks (small, high-confidence)

| change | from | to | why |
|---|---|---|---|
| `reckless` 捨て身 | 0E, 10 dmg, self 3 | **0E, 8 dmg, self 4** | A 0-cost repeatable ~nuke is the strongest card in the pool and trivializes early fights. Keep its cheap-risky identity, soften the payoff. |
| `wraith` 影 hp | 34 | **38** | Floors 5–6 barely escalate over 1–3 even though you have a built deck + a relic by then. |
| `ashking` 灰の王 hp | 120 | **132** | With relics, the boss falls a touch fast; small bump keeps tension. |

(Conservative — no playtest data yet. Easy to revert/tune.)

## 2. New cards

### 2a. No engine change (compose existing effects) — implement as pure data

| id | 名前 | type | cost | effect | art key | fills |
|---|---|---|---|---|---|---|
| weaken | 衰え | skill | 1 | 敵に弱体2 | `down` | uses the unused player-side `weak`; defensive tool |
| venommist | 毒霧 | skill | 1 | 敵に毒6 | `cloud` | cheap poison source |
| flurry | 乱れ突き | attack | 1 | 2ダメージ×3 | `arrows` | strength payoff (multi-hit) |
| riposte | 受け流し | skill | 1 | 6ブロック＋敵に5ダメージ | `parry` | defensive aggression / block builds |
| conflagration | 業火 | attack | 2 | 11ダメージ＋脆弱1 | `fire-burst` | 2nd vulnerable source |
| channel | 練気 | skill | 1 | 力+1＋1枚引く | `spiral` | strength + tempo hybrid |

All six are just new `CardDef` entries using existing effect kinds (`applyStatus`, `damage`, `block`, `draw`). Zero engine risk; add to `REWARD_POOL`.

### 2b. One small engine addition — poison payoff (gives the poison build a finisher)

| id | 名前 | type | cost | effect | art key |
|---|---|---|---|---|---|
| corrode | 腐食 | attack | 1 | 敵の毒に等しいダメージ | `acid` |

New effect kind `damageEqualToEnemyPoison` in `combat.ts` (mirrors the existing `damageEqualToBlock`): `applyDamage(enemy, calcDamage(enemy.status.poison, player.status, enemy.status))`. Unit-tested like the other effects. Turns stacked poison into a burst — the missing reason to build poison.

## 3. New relics (proposal — some need a small new hook)

| id | 名前 | effect | kind | engine |
|---|---|---|---|---|
| swiftboots | 俊足の靴 | 各戦闘の最初のターン、エネルギー+1 | `startEnergy` (new) | +1 line in `createCombat` |
| bloodpact | 血の契約 | 戦闘に勝つたび最大HP+3 | `maxHpPerWin` (new) | +1 branch in `finishCombat` |
| venomheart | 毒の心臓 | 戦闘開始時、敵に毒3 | `startPoison` (new) | +1 line in `createCombat` |

These add build variety (tempo / scaling / poison-start). Each is a tiny, testable hook. Lower priority than the cards.

## 4. Suggested implementation order
1. **Batch A (no engine change):** §1 balance tweaks + §2a six cards. Pure data + a few content tests. Safest, biggest variety bump.
2. **Batch B:** §2b `corrode` (one new effect + test) — unlocks the poison archetype.
3. **Batch C:** §3 relics (new hooks + tests).

Each batch: TDD, then update `docs/art/card-art-prompts.md` with the new art keys for Codex.

## 5. Coordination note
New `art` keys introduced: `down, cloud, arrows, parry, fire-burst, spiral, acid`. After implementing, I add their prompt rows so Codex's pipeline can render them (missing-art fallback means the game still works before the images exist).
