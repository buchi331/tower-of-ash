/// <reference types="vite/client" />
import axe from './art/cards/axe.jpg'
import eye from './art/cards/eye.jpg'
import flame from './art/cards/flame.jpg'
import flask from './art/cards/flask.jpg'
import hammer from './art/cards/hammer.jpg'
import shield from './art/cards/shield.jpg'
import sword from './art/cards/sword.jpg'
import swords from './art/cards/swords.jpg'

const CARD_ART: Record<string, string> = {
  axe,
  eye,
  flame,
  flask,
  hammer,
  shield,
  sword,
  swords,
}

export function getCardArt(artKey: string): string | undefined {
  return Object.hasOwn(CARD_ART, artKey) ? CARD_ART[artKey] : undefined
}
