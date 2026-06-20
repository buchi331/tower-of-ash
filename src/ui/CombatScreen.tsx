import type { CombatState } from '../model/types'
import { currentIntent } from '../engine/combat'
import { CARDS } from '../content/cards'
import { getEnemyArt } from '../assets/enemyArt'
import { Card } from './Card'
import { useHitFeedback } from './useHitFeedback'

function Bar({ hp, max }: { hp: number; max: number }) {
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, (hp / max) * 100))}%` }} />
      <span className="bar-label">{Math.max(0, hp)} / {max}</span>
    </div>
  )
}

function intentText(s: CombatState): string {
  const it = currentIntent(s)
  switch (it.kind) {
    case 'attack': return `攻撃 ${it.value}${it.times && it.times > 1 ? ` ×${it.times}` : ''}`
    case 'defend': return `防御 ${it.value}`
    case 'buff': return `強化 (${it.status})`
    case 'debuff': return `弱化 (${it.status} ${it.amount})`
  }
}

function statusLine(s: { vulnerable: number; weak: number; strength: number; poison: number }): string {
  const parts: string[] = []
  if (s.strength) parts.push(`力${s.strength}`)
  if (s.vulnerable) parts.push(`脆弱${s.vulnerable}`)
  if (s.weak) parts.push(`弱体${s.weak}`)
  if (s.poison) parts.push(`毒${s.poison}`)
  return parts.join(' ')
}

export function CombatScreen({ combat, onPlay, onEndTurn, onOpenDeck }: {
  combat: CombatState
  onPlay: (i: number) => void
  onEndTurn: () => void
  onOpenDeck: () => void
}) {
  const { player, enemy, hand } = combat
  const enemyFx = useHitFeedback(enemy.hp)
  const playerFx = useHitFeedback(player.hp)
  const enemyArt = getEnemyArt(enemy.def.id)
  return (
    <div className="combat">
      <div className={`enemy-area${enemyFx.shake ? ' shake' : ''}`}>
        {enemyFx.pop && <span key={enemyFx.pop.key} className="dmg-pop">{enemyFx.pop.delta}</span>}
        {enemyArt && <img className="enemy-art" src={enemyArt} alt="" aria-hidden="true" />}
        <div className="enemy-name">{enemy.def.name}</div>
        <div className="intent">予告: {intentText(combat)}</div>
        <Bar hp={enemy.hp} max={enemy.maxHp} />
        <div className="status">{enemy.block > 0 ? `🛡 ${enemy.block}　` : ''}{statusLine(enemy.status)}</div>
      </div>

      <div className={`player-area${playerFx.shake ? ' shake' : ''}`}>
        {playerFx.pop && <span key={playerFx.pop.key} className="dmg-pop">{playerFx.pop.delta}</span>}
        <Bar hp={player.hp} max={player.maxHp} />
        <div className="status">{player.block > 0 ? `🛡 ${player.block}　` : ''}{statusLine(player.status)}</div>
        <div className="resources">
          <span className="energy">⚡ {player.energy}/{player.maxEnergy}</span>
          <button className="btn" onClick={onOpenDeck}>デッキ</button>
          <button className="btn end-turn" onClick={onEndTurn}>ターン終了</button>
        </div>
      </div>

      <div className="hand">
        {hand.map((id, i) => {
          const card = CARDS[id]
          return <Card key={`${id}-${i}`} card={card} disabled={card.cost > player.energy} onPlay={() => onPlay(i)} />
        })}
      </div>
    </div>
  )
}
