import type { CardDef } from '../model/types'
import { getCardArt } from '../assets/cardArt'

const COLOR_VAR: Record<CardDef['color'], string> = { red: 'var(--red)', blue: 'var(--blue)', purple: 'var(--purple)' }

export function Card({ card, disabled, onPlay }: { card: CardDef; disabled?: boolean; onPlay?: () => void }) {
  const artUrl = getCardArt(card.art)

  return (
    <button
      className="card"
      disabled={disabled}
      onClick={onPlay}
      style={{ borderColor: COLOR_VAR[card.color], opacity: disabled ? 0.45 : 1 }}
    >
      <div className="card-cost">{card.cost}</div>
      <div className="card-name" style={{ color: COLOR_VAR[card.color] }}>{card.name}</div>
      <div className="card-art" aria-label={`${card.art} artwork`}>
        {artUrl ? (
          <img src={artUrl} alt="" draggable={false} />
        ) : (
          <span className="card-art-fallback">{card.art}</span>
        )}
      </div>
      <div className="card-text">{card.text}</div>
    </button>
  )
}
