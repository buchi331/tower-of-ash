import type { RunState } from '../model/types'
import { getRelicArt } from '../assets/relicArt'
import { RELICS } from '../content/relics'

export function RelicBar({ run }: { run: RunState }) {
  if (run.relics.length === 0) return null
  return (
    <div className="relic-bar">
      {run.relics.map((id, i) => {
        const r = RELICS[id]
        if (!r) return null
        const art = getRelicArt(id)
        return (
          <span key={`${id}-${i}`} className="relic-chip" title={r.text}>
            {art && <img className="relic-chip-art" src={art} alt="" aria-hidden="true" />}
            {r.name}
          </span>
        )
      })}
    </div>
  )
}
