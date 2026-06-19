import { useCallback, useRef, useState } from 'react'
import type { CombatState, RunState } from '../model/types'
import { makeRng, type RNG } from '../engine/rng'
import { createCombat, playCard as enginePlayCard, endTurn as engineEndTurn } from '../engine/combat'
import {
  startRun, currentFloor, isBossFloor, rewardOptions, addCardToDeck, advanceFloor, recordVictory, recordDefeat,
} from '../engine/run'
import { CARDS } from '../content/cards'
import { ENEMIES } from '../content/enemies'
import { saveRun, loadRun, clearRun } from './persistence'

export type Screen = 'title' | 'combat' | 'reward' | 'win' | 'lose' | 'deck'

export interface GameApi {
  screen: Screen
  run: RunState | null
  combat: CombatState | null
  rewards: string[]
  hasSave: boolean
  newRun: () => void
  continueRun: () => void
  play: (handIndex: number) => void
  endTurn: () => void
  chooseReward: (cardId: string | null) => void
  openDeck: () => void
  closeDeck: () => void
  backToTitle: () => void
}

function seedNow(): number {
  // app runtime only (not a workflow script), Date.now is fine here
  return (Date.now() & 0xffffffff) >>> 0
}

export function useGame(): GameApi {
  const [screen, setScreen] = useState<Screen>('title')
  const [run, setRun] = useState<RunState | null>(null)
  const [combat, setCombat] = useState<CombatState | null>(null)
  const [rewards, setRewards] = useState<string[]>([])
  const [hasSave, setHasSave] = useState<boolean>(() => loadRun() !== null)
  const prevScreen = useRef<Screen>('title')
  const rng = useRef<RNG>(makeRng(seedNow()))

  const beginCombat = useCallback((r: RunState) => {
    const enemy = ENEMIES[currentFloor(r).enemyId]
    setCombat(createCombat(enemy, r.deck, r.playerHp, r.maxHp, rng.current, CARDS))
    setScreen('combat')
  }, [])

  const newRun = useCallback(() => {
    const r = startRun(seedNow())
    rng.current = makeRng(r.seed)
    setRun(r)
    saveRun(r)
    setHasSave(true)
    beginCombat(r)
  }, [beginCombat])

  const continueRun = useCallback(() => {
    const r = loadRun()
    if (!r) return
    rng.current = makeRng((r.seed ^ r.floor ^ r.playerHp) >>> 0)
    setRun(r)
    beginCombat(r)
  }, [beginCombat])

  // Called once when combat reaches a terminal phase. Top-level setters only (no nested setState).
  const finishCombat = useCallback((c: CombatState, r: RunState) => {
    if (c.phase === 'won') {
      const updated: RunState = { ...r, playerHp: c.player.hp }
      if (isBossFloor(updated)) {
        const won = recordVictory(updated)
        setRun(won); clearRun(); setHasSave(false); setScreen('win')
      } else {
        setRun(updated); saveRun(updated); setRewards(rewardOptions(rng.current)); setScreen('reward')
      }
    } else if (c.phase === 'lost') {
      setRun(recordDefeat(r)); clearRun(); setHasSave(false); setScreen('lose')
    }
  }, [])

  const play = useCallback((handIndex: number) => {
    if (!combat || !run) return
    const next = enginePlayCard(combat, handIndex, rng.current, CARDS)
    setCombat(next)
    if (next.phase === 'won' || next.phase === 'lost') finishCombat(next, run)
  }, [combat, run, finishCombat])

  const endTurn = useCallback(() => {
    if (!combat || !run) return
    const next = engineEndTurn(combat, rng.current, CARDS)
    setCombat(next)
    if (next.phase === 'won' || next.phase === 'lost') finishCombat(next, run)
  }, [combat, run, finishCombat])

  const chooseReward = useCallback((cardId: string | null) => {
    if (!run) return
    let r = run
    if (cardId) r = addCardToDeck(r, cardId)
    r = advanceFloor(r)
    setRun(r); saveRun(r)
    beginCombat(r)
  }, [run, beginCombat])

  const openDeck = useCallback(() => { prevScreen.current = screen; setScreen('deck') }, [screen])
  const closeDeck = useCallback(() => setScreen(prevScreen.current), [])
  const backToTitle = useCallback(() => { setScreen('title'); setHasSave(loadRun() !== null) }, [])

  return {
    screen, run, combat, rewards, hasSave,
    newRun, continueRun, play, endTurn, chooseReward, openDeck, closeDeck, backToTitle,
  }
}
