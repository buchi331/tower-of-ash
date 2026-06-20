import { describe, expect, it } from 'vitest'
import { getEnemyArt } from './enemyArt'

describe('getEnemyArt', () => {
  it('returns a bundled URL for a known enemy id', () => {
    expect(getEnemyArt('ashking')).toContain('/src/assets/art/enemies/ashking.webp')
  })

  it('returns undefined for unknown and prototype keys', () => {
    expect(getEnemyArt('missing-enemy')).toBeUndefined()
    expect(getEnemyArt('toString')).toBeUndefined()
  })
})
