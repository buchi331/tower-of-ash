/// <reference types="vite/client" />
import axe from './art/cards/axe.svg'
import eye from './art/cards/eye.svg'
import flame from './art/cards/flame.svg'
import flask from './art/cards/flask.svg'
import hammer from './art/cards/hammer.svg'
import shield from './art/cards/shield.svg'
import sword from './art/cards/sword.svg'
import swords from './art/cards/swords.svg'

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
  return CARD_ART[artKey]
}
