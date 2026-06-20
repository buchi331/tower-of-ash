import type { EnemyDef } from '../model/types'

export const ENEMIES: Record<string, EnemyDef> = {
  skeleton: { id: 'skeleton', name: '骸骨剣士', maxHp: 28, intentPattern: [
    { kind: 'attack', value: 7 }, { kind: 'attack', value: 7 }, { kind: 'defend', value: 6 },
  ] },
  bats: { id: 'bats', name: '吸血蝙蝠群', maxHp: 24, intentPattern: [
    { kind: 'attack', value: 2, times: 3 }, { kind: 'debuff', status: 'weak', amount: 1 },
  ] },
  golem: { id: 'golem', name: '泥人形', maxHp: 46, intentPattern: [
    { kind: 'defend', value: 8 }, { kind: 'attack', value: 16 },
  ] },
  ghoul: { id: 'ghoul', name: '墓所の喰屍鬼', maxHp: 30, intentPattern: [
    { kind: 'attack', value: 6 }, { kind: 'debuff', status: 'poison', amount: 3 }, { kind: 'attack', value: 6 },
  ] },
  wraith: { id: 'wraith', name: '影霊', maxHp: 38, intentPattern: [
    { kind: 'defend', value: 10 }, { kind: 'attack', value: 9 },
  ] },
  cursemage: { id: 'cursemage', name: '呪術師', maxHp: 55, intentPattern: [
    { kind: 'debuff', status: 'vulnerable', amount: 2 }, { kind: 'attack', value: 11 }, { kind: 'attack', value: 11 },
  ] },
  sentinel: { id: 'sentinel', name: '灰の番人', maxHp: 64, intentPattern: [
    { kind: 'defend', value: 14 }, { kind: 'attack', value: 18 },
  ] },
  ashking: { id: 'ashking', name: '灰の王', maxHp: 132, intentPattern: [
    { kind: 'attack', value: 16 }, { kind: 'debuff', status: 'weak', amount: 2 },
    { kind: 'buff', status: 'strength', amount: 2 }, { kind: 'attack', value: 12 }, { kind: 'defend', value: 16 },
  ] },
}
