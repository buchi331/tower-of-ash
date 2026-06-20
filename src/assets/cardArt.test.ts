import { describe, expect, it } from 'vitest'
import { getCardArt } from './cardArt'

describe('getCardArt', () => {
  it('returns a bundled URL for a known art key', () => {
    expect(getCardArt('sword')).toMatch(/\/src\/assets\/art\/cards\/sword\.(?:webp|png|svg)/)
  })

  it('returns undefined for an unknown art key', () => {
    expect(getCardArt('missing-art')).toBeUndefined()
  })

  it('returns undefined for prototype keys', () => {
    expect(getCardArt('toString')).toBeUndefined()
  })
})
