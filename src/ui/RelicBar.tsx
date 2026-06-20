import type { RunState } from '../model/types'
import { RELICS } from '../content/relics'
import { getRelicArt } from '../assets/relicArt'

export function RelicBar({ run }: { run: RunState }) {
  if (run.relics.length === 0) return null
  return (
    <div className="relic-bar">
      {run.relics.map((id, i) => {
        const r = RELICS[id]
        if (!r) return null
        const icon = getRelicArt(r.art ?? r.id)
        return (
          <span key={`${id}-${i}`} className="relic-chip" title={r.text}>
            {icon && <img className="relic-chip-icon" src={icon} alt="" draggable={false} />}
            {r.name}
          </span>
        )
      })}
    </div>
  )
}
