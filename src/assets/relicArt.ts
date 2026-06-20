/// <reference types="vite/client" />
import bloodpact from './art/relics/bloodpact.webp'
import ember from './art/relics/ember.webp'
import giantblood from './art/relics/giantblood.webp'
import lifecharm from './art/relics/lifecharm.webp'
import oldshield from './art/relics/oldshield.webp'
import poisonvial from './art/relics/poisonvial.webp'
import ragefist from './art/relics/ragefist.webp'
import sandrobe from './art/relics/sandrobe.webp'
import swiftboots from './art/relics/swiftboots.webp'
import thornmail from './art/relics/thornmail.webp'
import venomheart from './art/relics/venomheart.webp'

const RELIC_ART: Record<string, string> = {
  bloodpact,
  ember,
  giantblood,
  lifecharm,
  oldshield,
  poisonvial,
  ragefist,
  sandrobe,
  swiftboots,
  thornmail,
  venomheart,
}

export function getRelicArt(id: string): string | undefined {
  return Object.hasOwn(RELIC_ART, id) ? RELIC_ART[id] : undefined
}
