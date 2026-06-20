import type {
  CardDef, CombatState, EnemyDef, PlayerCombatState, EnemyCombatState, StatusEffects, IntentStep,
  RelicDef, RelicBonuses,
} from '../model/types'
import { shuffle, type RNG } from './rng'

export type CardTable = Record<string, CardDef>

function emptyStatus(): StatusEffects {
  return { vulnerable: 0, weak: 0, strength: 0, poison: 0 }
}

function emptyBonuses(): RelicBonuses {
  return { startBlock: 0, startStrength: 0, extraDraw: 0, firstAttackBonus: 0, blockThorns: 0, poisonPlus: 0, startEnergy: 0, startPoison: 0 }
}

function computeBonuses(relics: RelicDef[]): RelicBonuses {
  const b = emptyBonuses()
  for (const r of relics) {
    switch (r.kind) {
      case 'startBlock': b.startBlock += r.value; break
      case 'startStrength': b.startStrength += r.value; break
      case 'extraDraw': b.extraDraw += r.value; break
      case 'firstAttackBonus': b.firstAttackBonus += r.value; break
      case 'blockThorns': b.blockThorns += r.value; break
      case 'poisonPlus': b.poisonPlus += r.value; break
      case 'startEnergy': b.startEnergy += r.value; break
      case 'startPoison': b.startPoison += r.value; break
      // maxHpUp, postCombatHeal, maxHpPerWin handled at run level
    }
  }
  return b
}

function addPoisonToEnemy(s: CombatState, amount: number): void {
  if (amount <= 0) return
  s.enemy.status.poison += amount + s.player.bonuses.poisonPlus
}

// Draw n cards into hand, reshuffling discard into draw when needed. Mutates the draft.
function drawCards(s: CombatState, n: number, rng: RNG): void {
  for (let i = 0; i < n; i++) {
    if (s.drawPile.length === 0) {
      if (s.discardPile.length === 0) return // both piles empty — draws what's available and stops
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
  s.player.firstAttackDone = false
  // poison ticks at the owner's turn start
  if (s.player.status.poison > 0) {
    s.player.hp -= s.player.status.poison
    s.player.status.poison -= 1
    if (s.player.hp <= 0) { s.phase = 'lost'; return }
  }
  drawCards(s, 5 + s.player.bonuses.extraDraw, rng)
  s.phase = 'player'
}

export function createCombat(
  enemyDef: EnemyDef, deck: readonly string[], playerHp: number, maxHp: number, rng: RNG, cards: CardTable,
  relics: RelicDef[] = [],
): CombatState {
  void cards
  const bonuses = computeBonuses(relics)
  const player: PlayerCombatState = {
    hp: playerHp, maxHp, block: 0, status: emptyStatus(), energy: 0, maxEnergy: 3, poisonOnAttack: 0,
    bonuses, firstAttackDone: false,
  }
  const enemy: EnemyCombatState = {
    def: enemyDef, hp: enemyDef.maxHp, maxHp: enemyDef.maxHp, block: 0, status: emptyStatus(), intentIndex: 0,
  }
  const s: CombatState = {
    player, enemy, drawPile: shuffle(deck, rng), hand: [], discardPile: [], turn: 0, phase: 'player', log: [],
  }
  s.player.status.strength += bonuses.startStrength
  startPlayerTurn(s, rng)
  s.player.block += bonuses.startBlock
  s.player.energy += bonuses.startEnergy
  s.enemy.status.poison += bonuses.startPoison
  return s
}

// damage = (base + attacker strength), then weak (-25%), then target vulnerable (+50%)
function calcDamage(base: number, attacker: StatusEffects, target: StatusEffects): number {
  let dmg = base + attacker.strength
  if (attacker.weak > 0) dmg = Math.floor(dmg * 0.75)
  if (target.vulnerable > 0) dmg = Math.floor(dmg * 1.5)
  return Math.max(0, dmg)
}

function applyDamage(target: { hp: number; block: number }, dmg: number): void {
  const blocked = Math.min(target.block, dmg)
  target.block -= blocked
  target.hp -= dmg - blocked
}

function checkWin(s: CombatState): void {
  if (s.enemy.hp <= 0) s.phase = 'won'
}

function checkLost(s: CombatState): void {
  if (s.phase !== 'won' && s.player.hp <= 0) s.phase = 'lost'
}

export function playCard(state: CombatState, handIndex: number, rng: RNG, cards: CardTable): CombatState {
  if (state.phase !== 'player') return state
  const id = state.hand[handIndex]
  if (id == null) return state
  const card = cards[id]
  if (!card || card.cost > state.player.energy) return state

  const s: CombatState = structuredClone(state)
  s.player.energy -= card.cost
  s.hand.splice(handIndex, 1)

  const isAttack = card.type === 'attack'
  let firstAtkBonus = isAttack && !s.player.firstAttackDone ? s.player.bonuses.firstAttackBonus : 0

  for (const e of card.effects) {
    switch (e.kind) {
      case 'damage': {
        const hits = e.times ?? 1
        for (let i = 0; i < hits; i++) {
          let base = e.amount
          if (firstAtkBonus > 0) { base += firstAtkBonus; firstAtkBonus = 0 }
          applyDamage(s.enemy, calcDamage(base, s.player.status, s.enemy.status))
        }
        break
      }
      case 'block':
        s.player.block += e.amount
        if (s.player.bonuses.blockThorns > 0) applyDamage(s.enemy, s.player.bonuses.blockThorns)
        break
      case 'applyStatus': {
        if (e.status === 'poison' && e.target === 'enemy') {
          addPoisonToEnemy(s, e.amount)
        } else {
          const who = e.target === 'self' ? s.player.status : s.enemy.status
          who[e.status] += e.amount
        }
        break
      }
      case 'draw':
        drawCards(s, e.amount, rng)
        break
      case 'gainEnergy':
        s.player.energy += e.amount
        break
      case 'heal':
        s.player.hp = Math.min(s.player.maxHp, s.player.hp + e.amount)
        break
      case 'loseHp':
        s.player.hp -= e.amount
        break
      case 'damageEqualToBlock': {
        let base = s.player.block
        if (firstAtkBonus > 0) { base += firstAtkBonus; firstAtkBonus = 0 }
        applyDamage(s.enemy, calcDamage(base, s.player.status, s.enemy.status))
        break
      }
      case 'poisonOnAttack':
        s.player.poisonOnAttack += e.amount
        break
      case 'damageEqualToEnemyPoison': {
        let base = s.enemy.status.poison
        if (firstAtkBonus > 0) { base += firstAtkBonus; firstAtkBonus = 0 }
        applyDamage(s.enemy, calcDamage(base, s.player.status, s.enemy.status))
        break
      }
    }
  }

  if (isAttack) s.player.firstAttackDone = true
  if (isAttack && s.player.poisonOnAttack > 0) addPoisonToEnemy(s, s.player.poisonOnAttack)

  // powers leave play; everything else goes to discard
  if (card.type !== 'power') s.discardPile.push(id)
  checkWin(s)
  checkLost(s)
  return s
}

export { calcDamage, applyDamage, checkWin, checkLost }

export function currentIntent(s: CombatState): IntentStep {
  const p = s.enemy.def.intentPattern
  return p[s.enemy.intentIndex % p.length]
}

function decayDebuffs(c: { status: StatusEffects }): void {
  if (c.status.vulnerable > 0) c.status.vulnerable -= 1
  if (c.status.weak > 0) c.status.weak -= 1
}

function runEnemyAction(s: CombatState): void {
  const step = currentIntent(s)
  switch (step.kind) {
    case 'attack': {
      const hits = step.times ?? 1
      for (let i = 0; i < hits; i++) {
        applyDamage(s.player, calcDamage(step.value, s.enemy.status, s.player.status))
      }
      break
    }
    case 'defend':
      s.enemy.block += step.value
      break
    case 'buff':
      s.enemy.status[step.status] += step.amount
      break
    case 'debuff':
      s.player.status[step.status] += step.amount
      break
  }
  s.enemy.intentIndex += 1
}

export function endTurn(state: CombatState, rng: RNG, _cards: CardTable): CombatState {
  if (state.phase !== 'player') return state
  const s: CombatState = structuredClone(state)

  // discard remaining hand
  s.discardPile.push(...s.hand)
  s.hand = []
  decayDebuffs(s.player)

  // enemy turn
  s.phase = 'enemy'
  s.enemy.block = 0 // enemy block resets at the start of the enemy phase, not the player turn
  if (s.enemy.status.poison > 0) {
    s.enemy.hp -= s.enemy.status.poison
    s.enemy.status.poison -= 1
  }
  if (s.enemy.hp <= 0) { s.phase = 'won'; return s }

  runEnemyAction(s)
  if (s.player.hp <= 0) { s.phase = 'lost'; return s }
  decayDebuffs(s.enemy)

  startPlayerTurn(s, rng)
  return s
}
