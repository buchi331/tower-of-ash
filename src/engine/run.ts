import type { RunState, Floor, RelicDef } from '../model/types'
import { STARTER_DECK, REWARD_POOL } from '../content/cards'
import { TOWER } from '../content/tower'
import type { RNG } from './rng'
import { RELICS, RELIC_POOL } from '../content/relics'

export const SCHEMA_VERSION = 2
export const START_HP = 70
const ELITE_HEAL_PCT = 0.25

export function startRun(seed: number): RunState {
  return {
    schemaVersion: SCHEMA_VERSION, seed, floor: 0,
    deck: [...STARTER_DECK], playerHp: START_HP, maxHp: START_HP, status: 'inProgress',
    relics: [],
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

export function addRelic(run: RunState, relic: RelicDef): RunState {
  const relics = [...run.relics, relic.id]
  if (relic.kind === 'maxHpUp') {
    return { ...run, relics, maxHp: run.maxHp + relic.value, playerHp: run.playerHp + relic.value }
  }
  return { ...run, relics }
}

export function relicRewardOptions(run: RunState, rng: RNG): string[] {
  const pool = RELIC_POOL.filter((id) => !run.relics.includes(id))
  const out: string[] = []
  for (let i = 0; i < 3 && pool.length > 0; i++) out.push(pool.splice(rng.int(pool.length), 1)[0])
  return out
}

export function postCombatHealAmount(run: RunState): number {
  return run.relics.reduce((sum, id) => {
    const r = RELICS[id]
    return sum + (r && r.kind === 'postCombatHeal' ? r.value : 0)
  }, 0)
}
