import { CARDS } from '../content/cards'
import { Card } from './Card'

export function RewardScreen({ rewards, onChoose }: { rewards: string[]; onChoose: (id: string | null) => void }) {
  return (
    <div className="screen">
      <h2>カードを選ぶ</h2>
      <div className="reward-cards">
        {rewards.map((id, i) => <Card key={`${id}-${i}`} card={CARDS[id]} onPlay={() => onChoose(id)} />)}
      </div>
      <button className="btn" onClick={() => onChoose(null)}>スキップ</button>
    </div>
  )
}
