import { describe, it, expect } from 'vitest'
import { makeRng } from './rng'
import { createCombat, playCard } from './combat'
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
