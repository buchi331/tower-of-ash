import { describe, expect, it } from 'vitest'
import { getCardArt } from './cardArt'

describe('getCardArt', () => {
  it('returns a bundled URL for a known art key', () => {
    expect(getCardArt('sword')).toContain('/src/assets/art/cards/sword.svg')
  })

  it('returns undefined for an unknown art key', () => {
    expect(getCardArt('missing-art')).toBeUndefined()
  })
})
