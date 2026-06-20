import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import {
  startRun, isBossFloor, rewardOptions, addCardToDeck, advanceFloor, recordVictory, recordDefeat, START_HP,
  addRelic, relicRewardOptions, postCombatHealAmount,
} from './run'
import { STARTER_DECK } from '../content/cards'
import { RELICS } from '../content/relics'

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

describe('run — relics', () => {
  it('startRun begins with no relics', () => {
    expect(startRun(1).relics).toEqual([])
  })
  it('addRelic appends the id; maxHpUp raises max and current HP', () => {
    const r = addRelic(startRun(1), RELICS.giantblood)
    expect(r.relics).toContain('giantblood')
    expect(r.maxHp).toBe(START_HP + 15)
    expect(r.playerHp).toBe(START_HP + 15)
  })
  it('relicRewardOptions excludes already-owned relics', () => {
    const r = { ...startRun(1), relics: Object.keys(RELICS).slice(0, 6) }
    const opts = relicRewardOptions(r, makeRng(3))
    expect(opts.length).toBe(2) // only 2 remain
    for (const id of opts) expect(r.relics).not.toContain(id)
  })
  it('postCombatHealAmount sums postCombatHeal relics', () => {
    const r = { ...startRun(1), relics: ['lifecharm'] }
    expect(postCombatHealAmount(r)).toBe(6)
  })
})
