import type { RunState } from '../model/types'
import { TOWER } from '../content/tower'

export function TowerProgress({ run }: { run: RunState }) {
  return (
    <div className="tower-progress">
      {TOWER.map((f, i) => (
        <span key={i} className={`floor ${f.kind} ${i === run.floor ? 'current' : ''} ${i < run.floor ? 'done' : ''}`}>
          {f.kind === 'boss' ? '★' : f.kind === 'elite' ? '◆' : '●'}
        </span>
      ))}
    </div>
  )
}
