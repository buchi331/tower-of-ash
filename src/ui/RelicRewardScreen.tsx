import { RELICS } from '../content/relics'

export function RelicRewardScreen({ rewards, onChoose }: { rewards: string[]; onChoose: (id: string | null) => void }) {
  return (
    <div className="screen">
      <h2>レリックを選ぶ</h2>
      <div className="relic-choices">
        {rewards.map((id, i) => {
          const r = RELICS[id]
          return (
            <button key={`${id}-${i}`} className="relic-card" onClick={() => onChoose(id)}>
              <div className="relic-card-name">{r.name}</div>
              <div className="relic-card-text">{r.text}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
