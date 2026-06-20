/// <reference types="vite/client" />
import { buildArtMap, resolveArt } from './artMap'

// Enemy portraits. Drop `<artKey>.webp` (or .png/.svg) into ./art/enemies/.
// The art key defaults to the enemy id (see callers).
const ENEMY_ART = buildArtMap(
  import.meta.glob('./art/enemies/*.{webp,png,svg}', { eager: true, import: 'default' }) as Record<string, string>,
)

export function getEnemyArt(artKey: string): string | undefined {
  return resolveArt(ENEMY_ART, artKey)
}
