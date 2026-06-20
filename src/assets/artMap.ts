// Shared art-resolution helpers for the drop-in asset pipeline.
//
// Each asset category (cards, enemies, relics) calls `import.meta.glob` with its
// own literal folder path — the glob argument must be a literal, so it can't be
// shared — and feeds the resulting modules through `buildArtMap`. Codex drops an
// image into the folder and it is registered by filename with no code change.
//
// When several extensions share a key (e.g. a finished `sword.webp` next to a
// placeholder `sword.svg`), the higher-priority raster art wins, so generated
// art replaces the stub automatically.

const EXT_PRIORITY = ['webp', 'png', 'svg']

export function buildArtMap(modules: Record<string, string>): Record<string, string> {
  const best: Record<string, { url: string; rank: number }> = Object.create(null)
  for (const [path, url] of Object.entries(modules)) {
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

export function resolveArt(map: Record<string, string>, key: string): string | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}
