import type {
  CardDef, CombatState, EnemyDef, PlayerCombatState, EnemyCombatState, StatusEffects,
} from '../model/types'
import { shuffle, type RNG } from './rng'

export type CardTable = Record<string, CardDef>

function emptyStatus(): StatusEffects {
  return { vulnerable: 0, weak: 0, strength: 0, poison: 0 }
}

// Draw n cards into hand, reshuffling discard into draw when needed. Mutates the draft.
function drawCards(s: CombatState, n: number, rng: RNG): void {
  for (let i = 0; i < n; i++) {
    if (s.drawPile.length === 0) {
      if (s.discardPile.length === 0) return
      s.drawPile = shuffle(s.discardPile, rng)
      s.discardPile = []
    }
    const id = s.drawPile.pop()!
    s.hand.push(id)
  }
}

function startPlayerTurn(s: CombatState, rng: RNG): void {
  s.turn += 1
  s.player.block = 0
  s.player.energy = s.player.maxEnergy
  // poison ticks at the owner's turn start
  if (s.player.status.poison > 0) {
    s.player.hp -= s.player.status.poison
    s.player.status.poison -= 1
    if (s.player.hp <= 0) { s.phase = 'lost'; return }
  }
  drawCards(s, 5, rng)
  s.phase = 'player'
}

export function createCombat(
  enemyDef: EnemyDef, deck: readonly string[], playerHp: number, maxHp: number, rng: RNG, cards: CardTable,
): CombatState {
  void cards // cards table is used by playCard; accepted here to fix the signature for all callers
  const player: PlayerCombatState = {
    hp: playerHp, maxHp, block: 0, status: emptyStatus(), energy: 0, maxEnergy: 3, poisonOnAttack: 0,
  }
  const enemy: EnemyCombatState = {
    def: enemyDef, hp: enemyDef.maxHp, maxHp: enemyDef.maxHp, block: 0, status: emptyStatus(), intentIndex: 0,
  }
  const s: CombatState = {
    player, enemy,
    drawPile: shuffle(deck, rng),
    hand: [], discardPile: [],
    turn: 0, phase: 'player', log: [],
  }
  startPlayerTurn(s, rng)
  return s
}

// exported for use by later tasks within this file
export { emptyStatus, drawCards, startPlayerTurn }
