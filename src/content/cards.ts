import type { CardDef } from '../model/types'

export const CARDS: Record<string, CardDef> = {
  strike:       { id: 'strike', name: '斬撃', type: 'attack', cost: 1, color: 'red', art: 'sword', text: '6ダメージ。', effects: [{ kind: 'damage', amount: 6 }] },
  defend:       { id: 'defend', name: '守勢', type: 'skill', cost: 1, color: 'blue', art: 'shield', text: '5ブロック。', effects: [{ kind: 'block', amount: 5 }] },
  bash:         { id: 'bash', name: '痛打', type: 'attack', cost: 2, color: 'red', art: 'hammer', text: '8ダメージ。脆弱2。', effects: [{ kind: 'damage', amount: 8 }, { kind: 'applyStatus', status: 'vulnerable', amount: 2, target: 'enemy' }] },
  twinslash:    { id: 'twinslash', name: '連刃', type: 'attack', cost: 1, color: 'red', art: 'swords', text: '3ダメージ×2。', effects: [{ kind: 'damage', amount: 3, times: 2 }] },
  heavy:        { id: 'heavy', name: '重撃', type: 'attack', cost: 2, color: 'red', art: 'axe', text: '14ダメージ。', effects: [{ kind: 'damage', amount: 14 }] },
  poisonblade:  { id: 'poisonblade', name: '毒刃', type: 'attack', cost: 1, color: 'red', art: 'flask', text: '5ダメージ。毒3。', effects: [{ kind: 'damage', amount: 5 }, { kind: 'applyStatus', status: 'poison', amount: 3, target: 'enemy' }] },
  lifesteal:    { id: 'lifesteal', name: '吸血', type: 'attack', cost: 2, color: 'red', art: 'droplet', text: '8ダメージ。4回復。', effects: [{ kind: 'damage', amount: 8 }, { kind: 'heal', amount: 4 }] },
  allout:       { id: 'allout', name: '渾身', type: 'attack', cost: 3, color: 'red', art: 'flame', text: '22ダメージ。', effects: [{ kind: 'damage', amount: 22 }] },
  reckless:     { id: 'reckless', name: '捨て身', type: 'attack', cost: 0, color: 'red', art: 'skull', text: '10ダメージ。自分に3ダメージ。', effects: [{ kind: 'damage', amount: 10 }, { kind: 'loseHp', amount: 3 }] },
  shieldbash:   { id: 'shieldbash', name: '盾打ち', type: 'attack', cost: 1, color: 'red', art: 'shield-bolt', text: '現在のブロック値と同じダメージ。', effects: [{ kind: 'damageEqualToBlock' }] },
  ironwall:     { id: 'ironwall', name: '鉄壁', type: 'skill', cost: 2, color: 'blue', art: 'wall', text: '12ブロック。', effects: [{ kind: 'block', amount: 12 }] },
  focus:        { id: 'focus', name: '集中', type: 'skill', cost: 1, color: 'purple', art: 'up', text: '力+2。', effects: [{ kind: 'applyStatus', status: 'strength', amount: 2, target: 'self' }] },
  inflame:      { id: 'inflame', name: '鍛錬', type: 'power', cost: 1, color: 'purple', art: 'bolt', text: '力+3。', effects: [{ kind: 'applyStatus', status: 'strength', amount: 3, target: 'self' }] },
  poisonmastery:{ id: 'poisonmastery', name: '毒の心得', type: 'power', cost: 1, color: 'purple', art: 'biohazard', text: '攻撃をプレイするたび毒1。', effects: [{ kind: 'poisonOnAttack', amount: 1 }] },
  adrenaline:   { id: 'adrenaline', name: '戦機', type: 'skill', cost: 0, color: 'blue', art: 'run', text: '2枚引く。エネルギー+1。', effects: [{ kind: 'draw', amount: 2 }, { kind: 'gainEnergy', amount: 1 }] },
  insight:      { id: 'insight', name: '見極め', type: 'skill', cost: 1, color: 'blue', art: 'eye', text: '2枚引く。', effects: [{ kind: 'draw', amount: 2 }] },
}

export const STARTER_DECK: string[] = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'defend', 'defend', 'defend', 'defend',
  'bash',
]

export const REWARD_POOL: string[] = [
  'bash', 'twinslash', 'heavy', 'poisonblade', 'lifesteal', 'allout', 'reckless',
  'shieldbash', 'ironwall', 'focus', 'inflame', 'poisonmastery', 'adrenaline', 'insight',
]
