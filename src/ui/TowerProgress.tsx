import type { RunState } from '../model/types'
import { TOWER } from '../content/tower'

export function TowerProgress({ run }: { run: RunState }) {
  return (
    <div className="tower-progress" aria-label="塔の進行">
      {TOWER.map((f, i) => (
        <span key={i} className={`floor ${f.kind} ${i === run.floor ? 'current' : ''} ${i < run.floor ? 'done' : ''}`}>
          {i + 1}
        </span>
      ))}
    </div>
  )
}
