/// <reference types="vite/client" />
import { buildArtMap, resolveArt } from './artMap'

// Auto-register every image placed in ./art/cards/ by its filename. See
// ./artMap.ts for the resolution rules (raster wins over placeholder svg).
const CARD_ART = buildArtMap(
  import.meta.glob('./art/cards/*.{webp,png,svg}', { eager: true, import: 'default' }) as Record<string, string>,
)

export function getCardArt(artKey: string): string | undefined {
  return resolveArt(CARD_ART, artKey)
}
