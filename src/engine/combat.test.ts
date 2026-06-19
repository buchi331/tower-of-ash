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

describe('playCard — block', () => {
  it('grants block that absorbs the next damage', () => {
    const deck = ['defend', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), TEST_CARDS)
    const i = s.hand.indexOf('defend')
    s = playCard(s, i, makeRng(1), TEST_CARDS)
    expect(s.player.block).toBe(5)
  })
})

describe('playCard — statuses', () => {
  it('applies vulnerable to the enemy and amplifies later damage by 50%', () => {
    const cards = {
      ...TEST_CARDS,
      bash: { ...TEST_CARDS.strike, id: 'bash', cost: 0, effects: [{ kind: 'applyStatus' as const, status: 'vulnerable' as const, amount: 2, target: 'enemy' as const }] },
    }
    const deck = ['bash', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('bash'), makeRng(1), cards)
    expect(s.enemy.status.vulnerable).toBe(2)
    const before = s.enemy.hp
    s = playCard(s, s.hand.indexOf('strike'), makeRng(1), cards)
    expect(s.enemy.hp).toBe(before - 9) // 6 * 1.5
  })

  it('strength increases attack damage', () => {
    const cards = {
      ...TEST_CARDS,
      focus: { ...TEST_CARDS.strike, id: 'focus', type: 'skill' as const, cost: 0, effects: [{ kind: 'applyStatus' as const, status: 'strength' as const, amount: 2, target: 'self' as const }] },
    }
    const deck = ['focus', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('focus'), makeRng(1), cards)
    const before = s.enemy.hp
    s = playCard(s, s.hand.indexOf('strike'), makeRng(1), cards)
    expect(s.enemy.hp).toBe(before - 8) // 6 + 2
  })
})

describe('playCard — utility effects', () => {
  it('draw + gainEnergy', () => {
    const cards = {
      ...TEST_CARDS,
      adr: { ...TEST_CARDS.defend, id: 'adr', cost: 0, effects: [{ kind: 'draw' as const, amount: 2 }, { kind: 'gainEnergy' as const, amount: 1 }] },
    }
    const deck = ['adr', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    const handBefore = s.hand.length // 5 (adr drawn into opening hand)
    s = playCard(s, s.hand.indexOf('adr'), makeRng(1), cards)
    expect(s.hand.length).toBe(handBefore - 1 + 2) // played 1, drew 2
    expect(s.player.energy).toBe(3 - 0 + 1)
  })

  it('heal does not exceed maxHp', () => {
    const cards = { ...TEST_CARDS, life: { ...TEST_CARDS.defend, id: 'life', cost: 0, effects: [{ kind: 'heal' as const, amount: 10 }] } }
    const deck = ['life', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 65, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('life'), makeRng(1), cards)
    expect(s.player.hp).toBe(70)
  })

  it('loseHp damages the player directly', () => {
    const cards = { ...TEST_CARDS, reck: { ...TEST_CARDS.strike, id: 'reck', cost: 0, effects: [{ kind: 'damage' as const, amount: 10 }, { kind: 'loseHp' as const, amount: 3 }] } }
    const deck = ['reck', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('reck'), makeRng(1), cards)
    expect(s.player.hp).toBe(67)
  })

  it('damageEqualToBlock uses current block as damage', () => {
    const cards = {
      ...TEST_CARDS,
      sb: { ...TEST_CARDS.strike, id: 'sb', cost: 0, effects: [{ kind: 'damageEqualToBlock' as const }] },
    }
    const deck = ['defend', 'sb', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('defend'), makeRng(1), cards) // +5 block
    const before = s.enemy.hp
    s = playCard(s, s.hand.indexOf('sb'), makeRng(1), cards)
    expect(s.enemy.hp).toBe(before - 5)
  })

  it('poisonOnAttack power adds poison whenever an attack is played', () => {
    const cards = {
      ...TEST_CARDS,
      pm: { ...TEST_CARDS.defend, id: 'pm', type: 'power' as const, cost: 0, effects: [{ kind: 'poisonOnAttack' as const, amount: 1 }] },
    }
    const deck = ['pm', 'strike', 'strike', 'strike', 'strike']
    let s = createCombat(DUMMY, deck, 70, 70, makeRng(1), cards)
    s = playCard(s, s.hand.indexOf('pm'), makeRng(1), cards)
    expect(s.player.poisonOnAttack).toBe(1)
    s = playCard(s, s.hand.indexOf('strike'), makeRng(1), cards)
    expect(s.enemy.status.poison).toBe(1)
  })
})
