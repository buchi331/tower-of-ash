import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRhythmAudio } from './audio/useRhythmAudio'
import { BEAT_MS, GOOD_WINDOW_MS, INTERVIEW_STAGE, STAGE_END_BEAT } from './rhythm/stage'
import { beatToMs, canJudgeTarget, isTargetMissed, judgeInput, summarizeResults } from './rhythm/timing'
import type { GamePhase, JudgedTarget, Judgment, ResultSummary, StageTarget } from './rhythm/types'

const EMPTY_RESULT: ResultSummary = {
  perfect: 0,
  good: 0,
  miss: 0,
  score: 0,
  maxScore: INTERVIEW_STAGE.length * 2,
  rank: 'C',
}

function formatJudgment(judgment: Judgment | null) {
  if (judgment === 'perfect') return 'PERFECT'
  if (judgment === 'good') return 'GOOD'
  if (judgment === 'miss') return 'MISS'
  return 'READY'
}

function currentCue(targets: readonly StageTarget[], beat: number): StageTarget | null {
  return targets.find((target) => beat >= target.cueBeat && beat < target.targetBeat + 1) ?? null
}

export default function App() {
  const audio = useRhythmAudio()
  const [phase, setPhase] = useState<GamePhase>('title')
  const [startAt, setStartAt] = useState(0)
  const [nowMs, setNowMs] = useState(0)
  const [judged, setJudged] = useState<JudgedTarget[]>([])
  const [lastJudgment, setLastJudgment] = useState<Judgment | null>(null)
  const [lastText, setLastText] = useState('Space / Tap')
  const [lastBeat, setLastBeat] = useState(-1)
  const [result, setResult] = useState<ResultSummary>(EMPTY_RESULT)
  const judgedIds = useMemo(() => new Set(judged.map((entry) => entry.targetId)), [judged])
  const elapsedMs = phase === 'playing' ? Math.max(0, nowMs - startAt) : 0
  const beat = Math.floor(elapsedMs / BEAT_MS)
  const cue = phase === 'playing' ? currentCue(INTERVIEW_STAGE, beat) : null
  const progress = phase === 'playing' ? Math.min(1, elapsedMs / beatToMs(STAGE_END_BEAT)) : 0

  const finishRun = useCallback(
    (entries: readonly JudgedTarget[]) => {
      const summary = summarizeResults(
        entries.map((entry) => entry.judgment),
        INTERVIEW_STAGE.length,
      )
      setResult(summary)
      setPhase('result')
      audio.playResult(summary.rank)
    },
    [audio],
  )

  const startRun = useCallback(() => {
    audio.ensureAudio()
    setJudged([])
    setLastJudgment(null)
    setLastText('Space / Tap')
    setResult(EMPTY_RESULT)
    setLastBeat(-1)
    setStartAt(performance.now())
    setNowMs(performance.now())
    setPhase('playing')
  }, [audio])

  const judgePress = useCallback(() => {
    if (phase !== 'playing') return
    audio.ensureAudio()
    const inputMs = Math.max(0, performance.now() - startAt)
    const openTarget = INTERVIEW_STAGE.find((target) => {
      if (!canJudgeTarget(target, judgedIds)) return false
      const targetMs = beatToMs(target.targetBeat)
      return Math.abs(inputMs - targetMs) <= GOOD_WINDOW_MS
    })

    if (!openTarget) {
      setLastJudgment('miss')
      setLastText('Not now!')
      audio.playHit('miss')
      return
    }

    const targetMs = beatToMs(openTarget.targetBeat)
    const judgment = judgeInput(targetMs, inputMs)
    const entry: JudgedTarget = {
      targetId: openTarget.id,
      judgment,
      offsetMs: Math.round(inputMs - targetMs),
    }
    setJudged((previous) => [...previous, entry])
    setLastJudgment(judgment)
    setLastText(judgment === 'miss' ? openTarget.missText : openTarget.successText)
    audio.playHit(judgment)
  }, [audio, judgedIds, phase, startAt])

  useEffect(() => {
    if (phase !== 'playing') return
    let frame = 0
    const tick = () => {
      setNowMs(performance.now())
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return
    if (beat !== lastBeat) {
      setLastBeat(beat)
      audio.playBeat()
      if (INTERVIEW_STAGE.some((target) => target.cueBeat === beat)) audio.playCue()
    }
  }, [audio, beat, lastBeat, phase])

  useEffect(() => {
    if (phase !== 'playing') return
    const missedTargets = INTERVIEW_STAGE.filter((target) => {
      if (!canJudgeTarget(target, judgedIds)) return false
      return isTargetMissed(beatToMs(target.targetBeat), elapsedMs)
    })
    if (missedTargets.length === 0) return

    setJudged((previous) => [
      ...previous,
      ...missedTargets.map((target) => ({
        targetId: target.id,
        judgment: 'miss' as const,
        offsetMs: null,
      })),
    ])
    setLastJudgment('miss')
    setLastText(missedTargets[missedTargets.length - 1].missText)
    audio.playHit('miss')
  }, [audio, elapsedMs, judgedIds, phase])

  useEffect(() => {
    if (phase !== 'playing') return
    if (elapsedMs < beatToMs(STAGE_END_BEAT)) return
    finishRun(judged)
  }, [elapsedMs, finishRun, judged, phase])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.code !== 'Enter') return
      event.preventDefault()
      if (phase === 'title' || phase === 'result') startRun()
      else judgePress()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [judgePress, phase, startRun])

  if (phase === 'title') {
    return (
      <main className="app title-screen">
        <section className="title-panel">
          <p className="kicker">one button rhythm comedy</p>
          <h1>Weird Interview</h1>
          <p className="subtitle">Answer bizarre questions on the beat and survive the interview.</p>
          <button className="primary-action" type="button" onClick={startRun}>
            Start Interview
          </button>
          <p className="hint">Space / Enter / Tap</p>
        </section>
      </main>
    )
  }

  if (phase === 'result') {
    return (
      <main className="app result-screen">
        <section className="result-card">
          <p className="kicker">result</p>
          <h1>Rank {result.rank}</h1>
          <div className="score-grid">
            <span>Perfect</span>
            <strong>{result.perfect}</strong>
            <span>Good</span>
            <strong>{result.good}</strong>
            <span>Miss</span>
            <strong>{result.miss}</strong>
            <span>Score</span>
            <strong>
              {result.score}/{result.maxScore}
            </strong>
          </div>
          <div className="result-actions">
            <button className="primary-action" type="button" onClick={startRun}>
              Retry
            </button>
            <button className="secondary-action" type="button" onClick={() => setPhase('title')}>
              Title
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={`app play-screen judge-${lastJudgment ?? 'ready'}`} onPointerDown={judgePress}>
      <div className="progress">
        <span style={{ width: `${progress * 100}%` }} />
      </div>
      <section className="interview-room">
        <div className={`character applicant ${lastJudgment === 'miss' ? 'is-wrong' : ''}`}>
          <div className="head">
            <span className="eyes" />
          </div>
          <div className="body" />
          <p className="bubble answer">{lastText}</p>
        </div>
        <div className="desk">
          <div className="paper" />
          <div className="stamp" />
        </div>
        <div className={`character interviewer ${cue ? 'is-cueing' : ''}`}>
          <div className="head">
            <span className="eyes" />
          </div>
          <div className="body" />
          <p className="bubble question">{cue?.cueText ?? '...'}</p>
        </div>
      </section>
      <section className="hud">
        <div className="beat-pulse" aria-label="beat indicator">
          {beat % 4 + 1}
        </div>
        <strong>{formatJudgment(lastJudgment)}</strong>
        <span>Space / Tap</span>
      </section>
    </main>
  )
}
