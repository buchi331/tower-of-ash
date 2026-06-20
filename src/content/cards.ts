import type { CardDef } from '../model/types'

export const CARDS: Record<string, CardDef> = {
  strike:       { id: 'strike', name: '斬撃', type: 'attack', cost: 1, color: 'red', art: 'sword', text: '6ダメージ。', effects: [{ kind: 'damage', amount: 6 }] },
  defend:       { id: 'defend', name: '防御', type: 'skill', cost: 1, color: 'blue', art: 'shield', text: '5ブロック。', effects: [{ kind: 'block', amount: 5 }] },
  bash:         { id: 'bash', name: '痛打', type: 'attack', cost: 2, color: 'red', art: 'hammer', text: '8ダメージ。脆弱2。', effects: [{ kind: 'damage', amount: 8 }, { kind: 'applyStatus', status: 'vulnerable', amount: 2, target: 'enemy' }] },
  twinslash:    { id: 'twinslash', name: '連斬', type: 'attack', cost: 1, color: 'red', art: 'swords', text: '3ダメージ×2。', effects: [{ kind: 'damage', amount: 3, times: 2 }] },
  heavy:        { id: 'heavy', name: '重撃', type: 'attack', cost: 2, color: 'red', art: 'axe', text: '14ダメージ。', effects: [{ kind: 'damage', amount: 14 }] },
  poisonblade:  { id: 'poisonblade', name: '毒刃', type: 'attack', cost: 1, color: 'red', art: 'flask', text: '5ダメージ。毒3。', effects: [{ kind: 'damage', amount: 5 }, { kind: 'applyStatus', status: 'poison', amount: 3, target: 'enemy' }] },
  lifesteal:    { id: 'lifesteal', name: '吸血', type: 'attack', cost: 2, color: 'red', art: 'droplet', text: '8ダメージ。HP4回復。', effects: [{ kind: 'damage', amount: 8 }, { kind: 'heal', amount: 4 }] },
  allout:       { id: 'allout', name: '渾身', type: 'attack', cost: 3, color: 'red', art: 'flame', text: '22ダメージ。', effects: [{ kind: 'damage', amount: 22 }] },
  reckless:     { id: 'reckless', name: '捨て身', type: 'attack', cost: 0, color: 'red', art: 'skull', text: '8ダメージ。自分に4ダメージ。', effects: [{ kind: 'damage', amount: 8 }, { kind: 'loseHp', amount: 4 }] },
  shieldbash:   { id: 'shieldbash', name: '盾打ち', type: 'attack', cost: 1, color: 'red', art: 'shield-bolt', text: '現在のブロック値と同じダメージ。', effects: [{ kind: 'damageEqualToBlock' }] },
  ironwall:     { id: 'ironwall', name: '鉄壁', type: 'skill', cost: 2, color: 'blue', art: 'wall', text: '12ブロック。', effects: [{ kind: 'block', amount: 12 }] },
  focus:        { id: 'focus', name: '集中', type: 'skill', cost: 1, color: 'purple', art: 'up', text: '筋力2。', effects: [{ kind: 'applyStatus', status: 'strength', amount: 2, target: 'self' }] },
  inflame:      { id: 'inflame', name: '発火', type: 'power', cost: 1, color: 'purple', art: 'bolt', text: '筋力3。', effects: [{ kind: 'applyStatus', status: 'strength', amount: 3, target: 'self' }] },
  poisonmastery:{ id: 'poisonmastery', name: '毒の心得', type: 'power', cost: 1, color: 'purple', art: 'biohazard', text: '攻撃するたび毒1。', effects: [{ kind: 'poisonOnAttack', amount: 1 }] },
  adrenaline:   { id: 'adrenaline', name: '戦慄', type: 'skill', cost: 0, color: 'blue', art: 'run', text: 'カードを2枚引く。エネルギー+1。', effects: [{ kind: 'draw', amount: 2 }, { kind: 'gainEnergy', amount: 1 }] },
  insight:      { id: 'insight', name: '見極め', type: 'skill', cost: 1, color: 'blue', art: 'eye', text: 'カードを2枚引く。', effects: [{ kind: 'draw', amount: 2 }] },
  weaken:       { id: 'weaken', name: '衰え', type: 'skill', cost: 1, color: 'blue', art: 'down', text: '敵に弱体2。', effects: [{ kind: 'applyStatus', status: 'weak', amount: 2, target: 'enemy' }] },
  venommist:    { id: 'venommist', name: '毒霧', type: 'skill', cost: 1, color: 'purple', art: 'cloud', text: '毒6。', effects: [{ kind: 'applyStatus', status: 'poison', amount: 6, target: 'enemy' }] },
  flurry:       { id: 'flurry', name: '乱れ突き', type: 'attack', cost: 1, color: 'red', art: 'arrows', text: '2ダメージ×3。', effects: [{ kind: 'damage', amount: 2, times: 3 }] },
  riposte:      { id: 'riposte', name: '受け流し', type: 'skill', cost: 1, color: 'blue', art: 'parry', text: '6ブロック。敵に5ダメージ。', effects: [{ kind: 'block', amount: 6 }, { kind: 'damage', amount: 5 }] },
  conflagration:{ id: 'conflagration', name: '業火', type: 'attack', cost: 2, color: 'red', art: 'fire-burst', text: '11ダメージ。脆弱1。', effects: [{ kind: 'damage', amount: 11 }, { kind: 'applyStatus', status: 'vulnerable', amount: 1, target: 'enemy' }] },
  channel:      { id: 'channel', name: '練気', type: 'skill', cost: 1, color: 'purple', art: 'spiral', text: '筋力1。カードを1枚引く。', effects: [{ kind: 'applyStatus', status: 'strength', amount: 1, target: 'self' }, { kind: 'draw', amount: 1 }] },
  corrode:      { id: 'corrode', name: '腐食', type: 'attack', cost: 1, color: 'purple', art: 'acid', text: '敵の毒と同じダメージ。', effects: [{ kind: 'damageEqualToEnemyPoison' }] },
}

export const STARTER_DECK: string[] = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'defend', 'defend', 'defend', 'defend',
  'bash',
]

export const REWARD_POOL: string[] = [
  'bash', 'twinslash', 'heavy', 'poisonblade', 'lifesteal', 'allout', 'reckless',
  'shieldbash', 'ironwall', 'focus', 'inflame', 'poisonmastery', 'adrenaline', 'insight',
  'weaken', 'venommist', 'flurry', 'riposte', 'conflagration', 'channel', 'corrode',
]
