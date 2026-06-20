import { getRelicArt } from '../assets/relicArt'
import { RELICS } from '../content/relics'

export function RelicRewardScreen({ rewards, onChoose }: { rewards: string[]; onChoose: (id: string | null) => void }) {
  return (
    <div className="screen">
      <h2>レリックを選ぶ</h2>
      <div className="relic-choices">
        {rewards.map((id, i) => {
          const r = RELICS[id]
          const art = getRelicArt(id)
          return (
            <button key={`${id}-${i}`} className="relic-card" onClick={() => onChoose(id)}>
              {art && <img className="relic-card-art" src={art} alt="" aria-hidden="true" />}
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
