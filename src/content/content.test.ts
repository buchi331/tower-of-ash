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
