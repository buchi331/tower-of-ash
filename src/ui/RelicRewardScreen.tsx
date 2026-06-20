import { RELICS } from '../content/relics'
import { getRelicArt } from '../assets/relicArt'

export function RelicRewardScreen({ rewards, onChoose }: { rewards: string[]; onChoose: (id: string | null) => void }) {
  return (
    <div className="screen">
      <h2>レリックを選ぶ</h2>
      <div className="relic-choices">
        {rewards.map((id, i) => {
          const r = RELICS[id]
          const icon = getRelicArt(r.art ?? r.id)
          return (
            <button key={`${id}-${i}`} className="relic-card" onClick={() => onChoose(id)}>
              {icon && <img className="relic-icon" src={icon} alt="" draggable={false} />}
              <div className="relic-card-body">
                <div className="relic-card-name">{r.name}</div>
                <div className="relic-card-text">{r.text}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
