import type { RunState } from '../model/types'
import { SCHEMA_VERSION } from '../engine/run'

const KEY = 'tower-of-ash:save'

export function saveRun(run: RunState): void {
  try { localStorage.setItem(KEY, JSON.stringify(run)) } catch { /* storage full / unavailable */ }
}

export function loadRun(): RunState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as RunState
    if (data.schemaVersion !== SCHEMA_VERSION) return null
    return data
  } catch {
    return null
  }
}

export function clearRun(): void {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
