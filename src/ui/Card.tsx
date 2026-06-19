import type { CardDef } from '../model/types'

const COLOR_VAR: Record<CardDef['color'], string> = { red: 'var(--red)', blue: 'var(--blue)', purple: 'var(--purple)' }

export function Card({ card, disabled, onPlay }: { card: CardDef; disabled?: boolean; onPlay?: () => void }) {
  return (
    <button className="card" disabled={disabled} onClick={onPlay}
      style={{ borderColor: COLOR_VAR[card.color], opacity: disabled ? 0.45 : 1 }}>
      <div className="card-cost">{card.cost}</div>
      <div className="card-name" style={{ color: COLOR_VAR[card.color] }}>{card.name}</div>
      <div className="card-text">{card.text}</div>
    </button>
  )
}
