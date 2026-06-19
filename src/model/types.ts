export type CardType = 'attack' | 'skill' | 'power'
export type CardColor = 'red' | 'blue' | 'purple'
export type StatusKey = 'vulnerable' | 'weak' | 'strength' | 'poison'

export interface StatusEffects {
  vulnerable: number
  weak: number
  strength: number
  poison: number
}

export type CardEffect =
  | { kind: 'damage'; amount: number; times?: number }
  | { kind: 'block'; amount: number }
  | { kind: 'applyStatus'; status: StatusKey; amount: number; target: 'enemy' | 'self' }
  | { kind: 'draw'; amount: number }
  | { kind: 'gainEnergy'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'loseHp'; amount: number }
  | { kind: 'damageEqualToBlock' }
  | { kind: 'poisonOnAttack'; amount: number }

export interface CardDef {
  id: string
  name: string
  type: CardType
  cost: number
  text: string
  color: CardColor
  art: string
  effects: CardEffect[]
}

export type IntentKind = 'attack' | 'defend' | 'buff' | 'debuff'
export interface IntentStep {
  kind: IntentKind
  value?: number
  times?: number
  status?: StatusKey
  amount?: number
}

export interface EnemyDef {
  id: string
  name: string
  maxHp: number
  intentPattern: IntentStep[]
}

export interface CombatantState {
  hp: number
  maxHp: number
  block: number
  status: StatusEffects
}

export interface PlayerCombatState extends CombatantState {
  energy: number
  maxEnergy: number
  poisonOnAttack: number
}

export interface EnemyCombatState extends CombatantState {
  def: EnemyDef
  intentIndex: number
}

export type CombatPhase = 'player' | 'enemy' | 'won' | 'lost'

export interface CombatState {
  player: PlayerCombatState
  enemy: EnemyCombatState
  drawPile: string[]
  hand: string[]
  discardPile: string[]
  turn: number
  phase: CombatPhase
  log: string[]
}

export type FloorKind = 'normal' | 'elite' | 'boss'
export interface Floor {
  kind: FloorKind
  enemyId: string
}

export type RunStatus = 'inProgress' | 'won' | 'lost'
export interface RunState {
  schemaVersion: number
  seed: number
  floor: number
  deck: string[]
  playerHp: number
  maxHp: number
  status: RunStatus
}
