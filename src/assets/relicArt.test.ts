import { describe, expect, it } from 'vitest'
import { getRelicArt } from './relicArt'

describe('getRelicArt', () => {
  it('returns a bundled URL for a known relic id', () => {
    expect(getRelicArt('oldshield')).toContain('/src/assets/art/relics/oldshield.webp')
  })

  it('returns undefined for unknown and prototype keys', () => {
    expect(getRelicArt('missing-relic')).toBeUndefined()
    expect(getRelicArt('toString')).toBeUndefined()
  })
})
