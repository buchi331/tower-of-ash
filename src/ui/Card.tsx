import type { CSSProperties } from 'react'
import type { CardDef } from '../model/types'
import { getCardArt } from '../assets/cardArt'

const COLOR_VAR: Record<CardDef['color'], string> = { red: 'var(--red)', blue: 'var(--blue)', purple: 'var(--purple)' }

export function Card({ card, disabled, onPlay }: { card: CardDef; disabled?: boolean; onPlay?: () => void }) {
  const artUrl = getCardArt(card.art)
  const style = { '--card-accent': COLOR_VAR[card.color] } as CSSProperties

  return (
    <button
      className={`card card-${card.color}`}
      disabled={disabled}
      onClick={onPlay}
      style={style}
    >
      <div className="card-cost">{card.cost}</div>
      <div className="card-name">{card.name}</div>
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
