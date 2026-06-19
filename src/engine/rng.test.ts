import { describe, it, expect } from 'vitest'
import { makeRng, shuffle } from './rng'

describe('rng', () => {
  it('is deterministic for the same seed', () => {
    const a = makeRng(123)
    const b = makeRng(123)
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()])
  })

  it('int() stays within [0, max)', () => {
    const r = makeRng(42)
    for (let i = 0; i < 1000; i++) {
      const n = r.int(5)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(5)
    }
  })

  it('shuffle is a permutation and deterministic per seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8]
    const s1 = shuffle(arr, makeRng(7))
    const s2 = shuffle(arr, makeRng(7))
    expect(s1).toEqual(s2)
    expect([...s1].sort((a, b) => a - b)).toEqual(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8]) // original not mutated
  })
})
