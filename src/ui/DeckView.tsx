import type { RunState } from '../model/types'
import { CARDS } from '../content/cards'

export function DeckView({ run, onClose }: { run: RunState; onClose: () => void }) {
  const counts = run.deck.reduce<Record<string, number>>((acc, id) => { acc[id] = (acc[id] ?? 0) + 1; return acc }, {})
  return (
    <div className="screen">
      <h2>デッキ ({run.deck.length}枚)</h2>
      <ul className="deck-list">
        {Object.entries(counts).map(([id, n]) => (
          <li key={id}><span>{CARDS[id].name}</span><span className="muted">×{n}</span></li>
        ))}
      </ul>
      <button className="btn" onClick={onClose}>閉じる</button>
    </div>
  )
}
