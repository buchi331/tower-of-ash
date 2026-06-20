/// <reference types="vite/client" />
import acid from './art/cards/acid.webp'
import arrows from './art/cards/arrows.webp'
import axe from './art/cards/axe.webp'
import biohazard from './art/cards/biohazard.webp'
import bolt from './art/cards/bolt.webp'
import cloud from './art/cards/cloud.webp'
import down from './art/cards/down.webp'
import droplet from './art/cards/droplet.webp'
import eye from './art/cards/eye.webp'
import fireBurst from './art/cards/fire-burst.webp'
import flame from './art/cards/flame.webp'
import flask from './art/cards/flask.webp'
import hammer from './art/cards/hammer.webp'
import parry from './art/cards/parry.webp'
import run from './art/cards/run.webp'
import shieldBolt from './art/cards/shield-bolt.webp'
import shield from './art/cards/shield.webp'
import skull from './art/cards/skull.webp'
import spiral from './art/cards/spiral.webp'
import sword from './art/cards/sword.webp'
import swords from './art/cards/swords.webp'
import up from './art/cards/up.webp'
import wall from './art/cards/wall.webp'

const CARD_ART: Record<string, string> = {
  acid,
  arrows,
  axe,
  biohazard,
  bolt,
  cloud,
  down,
  droplet,
  eye,
  'fire-burst': fireBurst,
  flame,
  flask,
  hammer,
  parry,
  run,
  shield,
  'shield-bolt': shieldBolt,
  skull,
  spiral,
  sword,
  swords,
  up,
  wall,
}

export function getCardArt(artKey: string): string | undefined {
  return Object.hasOwn(CARD_ART, artKey) ? CARD_ART[artKey] : undefined
}
