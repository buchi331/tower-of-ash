/// <reference types="vite/client" />

// Auto-register every image placed in ./art/cards/ by its filename (without
// extension). Codex generates the pixels and drops files here; this resolver
// wires them in with no per-asset code change.
//
// When several extensions share a key (e.g. a finished `sword.webp` next to the
// placeholder `sword.svg`), the higher-priority raster art wins, so generated
// art replaces the stub automatically.
const MODULES = import.meta.glob('./art/cards/*.{webp,png,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const EXT_PRIORITY = ['webp', 'png', 'svg']

function buildArtMap(): Record<string, string> {
  const best: Record<string, { url: string; rank: number }> = Object.create(null)
  for (const [path, url] of Object.entries(MODULES)) {
    const file = path.split('/').pop() ?? ''
    const dot = file.lastIndexOf('.')
    const key = dot === -1 ? file : file.slice(0, dot)
    const ext = dot === -1 ? '' : file.slice(dot + 1).toLowerCase()
    const rank = EXT_PRIORITY.indexOf(ext)
    const normalizedRank = rank === -1 ? EXT_PRIORITY.length : rank
    const prev = best[key]
    if (!prev || normalizedRank < prev.rank) {
      best[key] = { url, rank: normalizedRank }
    }
  }
  const map: Record<string, string> = Object.create(null)
  for (const key of Object.keys(best)) map[key] = best[key].url
  return map
}

const CARD_ART = buildArtMap()

export function getCardArt(artKey: string): string | undefined {
  return Object.hasOwn(CARD_ART, artKey) ? CARD_ART[artKey] : undefined
}
