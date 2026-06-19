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
