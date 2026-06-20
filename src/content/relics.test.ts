import { describe, it, expect } from 'vitest'
import { RELICS, RELIC_POOL } from './relics'

describe('relics content', () => {
  it('every relic id matches its key and has a positive value', () => {
    for (const [k, r] of Object.entries(RELICS)) {
      expect(r.id).toBe(k)
      expect(r.value).toBeGreaterThan(0)
    }
  })
  it('RELIC_POOL lists all relic ids', () => {
    expect(RELIC_POOL.sort()).toEqual(Object.keys(RELICS).sort())
  })
})
