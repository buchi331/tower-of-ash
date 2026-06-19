// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { saveRun, loadRun, clearRun } from './persistence'
import { startRun, SCHEMA_VERSION } from '../engine/run'

describe('persistence', () => {
  beforeEach(() => localStorage.clear())

  it('saves and loads a run unchanged', () => {
    const r = startRun(7)
    saveRun(r)
    expect(loadRun()).toEqual(r)
  })

  it('returns null when nothing is saved', () => {
    expect(loadRun()).toBeNull()
  })

  it('returns null on a schema version mismatch', () => {
    const r = { ...startRun(1), schemaVersion: SCHEMA_VERSION + 1 }
    saveRun(r)
    expect(loadRun()).toBeNull()
  })

  it('returns null on corrupt data instead of throwing', () => {
    localStorage.setItem('tower-of-ash:save', '{ not json')
    expect(loadRun()).toBeNull()
  })

  it('clearRun removes the save', () => {
    saveRun(startRun(1))
    clearRun()
    expect(loadRun()).toBeNull()
  })
})
