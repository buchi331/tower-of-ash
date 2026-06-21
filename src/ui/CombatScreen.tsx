import { useEffect, useRef, useState } from 'react'
import type { CardDef, CombatState, IntentStep, StatusKey } from '../model/types'
import { currentIntent } from '../engine/combat'
import { CARDS } from '../content/cards'
import { getEnemyArt } from '../assets/enemyArt'
import { Card } from './Card'
import { useHitFeedback } from './useHitFeedback'

type ActorPose = 'idle' | 'attack' | 'defend' | 'cast' | 'hit'
type BattleEffect = 'slash' | 'guard' | 'spell' | 'poison' | 'enemy-attack' | 'enemy-guard' | 'enemy-spell'

function Bar({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100))
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
      <span className="bar-label">{Math.max(0, hp)} / {max}</span>
    </div>
  )
}

function statusName(status: StatusKey): string {
  switch (status) {
    case 'vulnerable': return '脆弱'
    case 'weak': return '弱体'
    case 'strength': return '筋力'
    case 'poison': return '毒'
  }
}

function intentText(s: CombatState): string {
  const it = currentIntent(s)
  switch (it.kind) {
    case 'attack': return `攻撃 ${it.value}${it.times && it.times > 1 ? ` ×${it.times}` : ''}`
    case 'defend': return `防御 ${it.value}`
    case 'buff': return `強化 ${statusName(it.status)} ${it.amount}`
    case 'debuff': return `弱体 ${statusName(it.status)} ${it.amount}`
  }
}

function statusLine(s: { vulnerable: number; weak: number; strength: number; poison: number }): string {
  const parts: string[] = []
  if (s.strength) parts.push(`筋力 ${s.strength}`)
  if (s.vulnerable) parts.push(`脆弱 ${s.vulnerable}`)
  if (s.weak) parts.push(`弱体 ${s.weak}`)
  if (s.poison) parts.push(`毒 ${s.poison}`)
  return parts.join(' / ')
}

function cardEffect(card: CardDef): BattleEffect {
  if (card.effects.some((effect) => effect.kind === 'applyStatus' && effect.status === 'poison')) return 'poison'
  if (card.type === 'attack') return 'slash'
  if (card.effects.some((effect) => effect.kind === 'block')) return 'guard'
  return 'spell'
}

function playerPoseFor(effect: BattleEffect): ActorPose {
  if (effect === 'slash' || effect === 'poison') return 'attack'
  if (effect === 'guard') return 'defend'
  return 'cast'
}

function enemyEffect(intent: IntentStep): BattleEffect {
  switch (intent.kind) {
    case 'attack': return 'enemy-attack'
    case 'defend': return 'enemy-guard'
    case 'buff':
    case 'debuff':
      return 'enemy-spell'
  }
}

function enemyPoseFor(effect: BattleEffect): ActorPose {
  if (effect === 'enemy-attack') return 'attack'
  if (effect === 'enemy-guard') return 'defend'
  return 'cast'
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
  const [playerPose, setPlayerPose] = useState<ActorPose>('idle')
  const [enemyPose, setEnemyPose] = useState<ActorPose>('idle')
  const [effect, setEffect] = useState<{ kind: BattleEffect; key: number } | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => {
    for (const timer of timers.current) window.clearTimeout(timer)
  }, [])

  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      const timer = window.setTimeout(resolve, ms)
      timers.current.push(timer)
    })
  }

  function resetAnimation() {
    setPlayerPose('idle')
    setEnemyPose('idle')
    setEffect(null)
    setIsAnimating(false)
  }

  async function playCardAnimated(index: number) {
    if (isAnimating || combat.phase !== 'player') return
    const id = hand[index]
    const card = id ? CARDS[id] : undefined
    if (!card || card.cost > player.energy) return

    const kind = cardEffect(card)
    setIsAnimating(true)
    setPlayerPose(playerPoseFor(kind))
    setEffect({ kind, key: Date.now() })
    await wait(240)
    if (kind === 'slash' || kind === 'poison') setEnemyPose('hit')
    onPlay(index)
    await wait(360)
    resetAnimation()
  }

  async function endTurnAnimated() {
    if (isAnimating || combat.phase !== 'player') return
    const kind = enemyEffect(currentIntent(combat))
    setIsAnimating(true)
    setEnemyPose(enemyPoseFor(kind))
    setEffect({ kind, key: Date.now() })
    await wait(300)
    if (kind === 'enemy-attack' || kind === 'enemy-spell') setPlayerPose('hit')
    onEndTurn()
    await wait(360)
    resetAnimation()
  }

  return (
    <div className={`combat${isAnimating ? ' is-animating' : ''}`}>
      <section className={`enemy-stage${enemyFx.shake ? ' shake' : ''}`}>
        {enemyFx.pop && <span key={enemyFx.pop.key} className="dmg-pop">{enemyFx.pop.delta}</span>}
        <div className={`enemy-frame pose-${enemyPose}`}>
          {enemyArt && <img className="enemy-art" src={enemyArt} alt="" aria-hidden="true" />}
          <div className="enemy-vignette" />
          <div className="actor-aura" />
        </div>
        <div className="enemy-readout">
          <div>
            <div className="enemy-label">ENEMY</div>
            <div className="enemy-name">{enemy.def.name}</div>
          </div>
          <div className="intent">予告: {intentText(combat)}</div>
        </div>
        <Bar hp={enemy.hp} max={enemy.maxHp} />
        <div className="status">{enemy.block > 0 ? `ブロック ${enemy.block} / ` : ''}{statusLine(enemy.status)}</div>
      </section>

      <section className={`player-console${playerFx.shake ? ' shake' : ''}`}>
        {playerFx.pop && <span key={playerFx.pop.key} className="dmg-pop player-pop">{playerFx.pop.delta}</span>}
        <div className={`player-avatar pose-${playerPose}`} aria-hidden="true">
          <div className="player-figure" />
          <div className="actor-aura" />
        </div>
        <div className="player-readout">
          <div className="player-label">PLAYER</div>
          <Bar hp={player.hp} max={player.maxHp} />
          <div className="status">{player.block > 0 ? `ブロック ${player.block} / ` : ''}{statusLine(player.status)}</div>
        </div>
        <div className="resources">
          <span className="energy">{player.energy}/{player.maxEnergy}</span>
          <button className="btn" disabled={isAnimating} onClick={onOpenDeck}>デッキ</button>
          <button className="btn end-turn" disabled={isAnimating} onClick={endTurnAnimated}>ターン終了</button>
        </div>
      </section>

      {effect && <div key={effect.key} className={`battle-effect fx-${effect.kind}`} aria-hidden="true" />}

      <div className="hand">
        {hand.map((id, i) => {
          const card = CARDS[id]
          return (
            <Card
              key={`${id}-${i}`}
              card={card}
              disabled={isAnimating || card.cost > player.energy}
              onPlay={() => playCardAnimated(i)}
            />
          )
        })}
      </div>
    </div>
  )
}
