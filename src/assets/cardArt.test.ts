import { describe, expect, it } from 'vitest'
import { getCardArt } from './cardArt'

describe('getCardArt', () => {
  it('returns a bundled URL for a known art key', () => {
    expect(getCardArt('sword')).toContain('/src/assets/art/cards/sword.webp')
  })

  it('returns bundled URLs for generated art keys', () => {
    expect(getCardArt('acid')).toContain('/src/assets/art/cards/acid.webp')
    expect(getCardArt('shield-bolt')).toContain('/src/assets/art/cards/shield-bolt.webp')
    expect(getCardArt('fire-burst')).toContain('/src/assets/art/cards/fire-burst.webp')
  })

  it('returns undefined for an unknown art key', () => {
    expect(getCardArt('missing-art')).toBeUndefined()
  })

  it('returns undefined for prototype keys', () => {
    expect(getCardArt('toString')).toBeUndefined()
  })
})
