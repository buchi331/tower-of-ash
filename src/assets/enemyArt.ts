/// <reference types="vite/client" />
import ashking from './art/enemies/ashking.webp'
import bats from './art/enemies/bats.webp'
import cursemage from './art/enemies/cursemage.webp'
import ghoul from './art/enemies/ghoul.webp'
import golem from './art/enemies/golem.webp'
import sentinel from './art/enemies/sentinel.webp'
import skeleton from './art/enemies/skeleton.webp'
import wraith from './art/enemies/wraith.webp'

const ENEMY_ART: Record<string, string> = {
  ashking,
  bats,
  cursemage,
  ghoul,
  golem,
  sentinel,
  skeleton,
  wraith,
}

export function getEnemyArt(id: string): string | undefined {
  return Object.hasOwn(ENEMY_ART, id) ? ENEMY_ART[id] : undefined
}
