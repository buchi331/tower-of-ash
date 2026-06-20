/// <reference types="vite/client" />
import { buildArtMap, resolveArt } from './artMap'

// Relic icons. Drop `<artKey>.webp` (or .png/.svg) into ./art/relics/.
// The art key defaults to the relic id (see callers).
const RELIC_ART = buildArtMap(
  import.meta.glob('./art/relics/*.{webp,png,svg}', { eager: true, import: 'default' }) as Record<string, string>,
)

export function getRelicArt(artKey: string): string | undefined {
  return resolveArt(RELIC_ART, artKey)
}
