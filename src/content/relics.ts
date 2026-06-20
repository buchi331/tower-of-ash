import type { RelicDef } from '../model/types'

export const RELICS: Record<string, RelicDef> = {
  oldshield:  { id: 'oldshield', name: '古びた盾', text: '戦闘開始時、ブロック+8。', kind: 'startBlock', value: 8 },
  ember:      { id: 'ember', name: '燻る火種', text: '戦闘開始時、筋力+1。', kind: 'startStrength', value: 1 },
  sandrobe:   { id: 'sandrobe', name: '砂のローブ', text: '毎ターン、引くカード+1。', kind: 'extraDraw', value: 1 },
  ragefist:   { id: 'ragefist', name: '怒りの拳', text: '毎ターン最初の攻撃に+3ダメージ。', kind: 'firstAttackBonus', value: 3 },
  thornmail:  { id: 'thornmail', name: '棘の革鎧', text: 'ブロックを得るたび、敵に2ダメージ。', kind: 'blockThorns', value: 2 },
  poisonvial: { id: 'poisonvial', name: '毒の小瓶', text: '敵に毒を与えるたび、毒+1。', kind: 'poisonPlus', value: 1 },
  giantblood: { id: 'giantblood', name: '巨人の血', text: '獲得時、最大HP+15。', kind: 'maxHpUp', value: 15 },
  lifecharm:  { id: 'lifecharm', name: '命の護符', text: '戦闘に勝つたび、HP+6回復。', kind: 'postCombatHeal', value: 6 },
  swiftboots: { id: 'swiftboots', name: '俊足の靴', text: '各戦闘の最初のターン、エネルギー+1。', kind: 'startEnergy', value: 1 },
  bloodpact:  { id: 'bloodpact', name: '血の契約', text: '戦闘に勝つたび、最大HP+3。', kind: 'maxHpPerWin', value: 3 },
  venomheart: { id: 'venomheart', name: '毒の心臓', text: '戦闘開始時、敵に毒3。', kind: 'startPoison', value: 3 },
}

export const RELIC_POOL: string[] = Object.keys(RELICS)
