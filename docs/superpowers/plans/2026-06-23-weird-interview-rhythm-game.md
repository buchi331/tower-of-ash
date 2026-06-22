# Weird Interview Rhythm Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone one-button browser rhythm comedy prototype called Weird Interview.

**Architecture:** Keep the existing Vite + React + TypeScript project, but replace the current app surface with the new rhythm game. Put timing and scoring in pure functions under `src/rhythm` so the core game rules are testable, while `src/App.tsx` owns runtime state, animation timing, input handling, and screen routing.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Web Audio API, CSS.

## Global Constraints

- Use no new external dependencies.
- Do not use Nintendo names, characters, minigames, music, sound effects, layouts, or direct visual references.
- Use a fixed BPM of 120 for the prototype.
- One beat is 500 ms.
- Perfect window is +/- 80 ms from target time.
- Good window is +/- 150 ms from target time.
- Inputs outside the Good window are Miss.
- Keyboard input must support Space and Enter.
- Pointer input must support click and tap anywhere on the play area.
- Audio must start only after a user gesture.
- If Web Audio is unavailable, the game continues silently.
- The prototype includes one deterministic 30-45 second stage.

---

## File Structure

- Create `src/rhythm/types.ts`: shared rhythm game types.
- Create `src/rhythm/stage.ts`: BPM constants and deterministic interview stage script.
- Create `src/rhythm/timing.ts`: pure beat/time, judgment, miss, duplicate-input, and ranking helpers.
- Create `src/rhythm/timing.test.ts`: Vitest coverage for timing and ranking.
- Create `src/audio/useRhythmAudio.ts`: browser-safe generated sound helper.
- Modify `src/App.tsx`: replace the existing card-game shell with the rhythm game screens and runtime loop.
- Replace `src/styles.css`: new responsive visual system for the interview game.

---

### Task 1: Rhythm Data And Timing Core

**Files:**
- Create: `src/rhythm/types.ts`
- Create: `src/rhythm/stage.ts`
- Create: `src/rhythm/timing.ts`
- Create: `src/rhythm/timing.test.ts`

**Interfaces:**
- Produces: `Judgment = 'perfect' | 'good' | 'miss'`
- Produces: `GamePhase = 'title' | 'playing' | 'result'`
- Produces: `StageTarget { id, cueBeat, targetBeat, cueText, successText, missText }`
- Produces: `INTERVIEW_BPM`, `BEAT_MS`, `PERFECT_WINDOW_MS`, `GOOD_WINDOW_MS`, `INTERVIEW_STAGE`
- Produces: `beatToMs(beat: number, beatMs?: number): number`
- Produces: `judgeOffset(offsetMs: number): Judgment`
- Produces: `judgeInput(targetMs: number, inputMs: number): Judgment`
- Produces: `isTargetMissed(targetMs: number, nowMs: number): boolean`
- Produces: `canJudgeTarget(target: StageTarget, judgedIds: ReadonlySet<string>): boolean`
- Produces: `summarizeResults(judgments: readonly Judgment[], totalTargets: number): ResultSummary`

- [ ] **Step 1: Create the shared types**

Create `src/rhythm/types.ts`:

```ts
export type Judgment = 'perfect' | 'good' | 'miss'

export type GamePhase = 'title' | 'playing' | 'result'

export type Rank = 'S' | 'A' | 'B' | 'C'

export interface StageTarget {
  id: string
  cueBeat: number
  targetBeat: number
  cueText: string
  successText: string
  missText: string
}

export interface JudgedTarget {
  targetId: string
  judgment: Judgment
  offsetMs: number | null
}

export interface ResultSummary {
  perfect: number
  good: number
  miss: number
  score: number
  maxScore: number
  rank: Rank
}
```

- [ ] **Step 2: Create the deterministic stage script**

Create `src/rhythm/stage.ts`:

```ts
import type { StageTarget } from './types'

export const INTERVIEW_BPM = 120
export const BEAT_MS = 60000 / INTERVIEW_BPM
export const PERFECT_WINDOW_MS = 80
export const GOOD_WINDOW_MS = 150
export const STAGE_END_BEAT = 72

export const INTERVIEW_STAGE: StageTarget[] = [
  { id: 'q01', cueBeat: 4, targetBeat: 5, cueText: 'お名前は?', successText: 'はいっ', missText: 'えっ' },
  { id: 'q02', cueBeat: 6, targetBeat: 7, cueText: '元気?', successText: 'はいっ', missText: '小声' },
  { id: 'q03', cueBeat: 8, targetBeat: 9, cueText: '特技は?', successText: 'はいっ', missText: '無言' },
  { id: 'q04', cueBeat: 10, targetBeat: 11, cueText: 'なるほど', successText: 'はいっ', missText: '遅刻' },
  { id: 'q05', cueBeat: 14, targetBeat: 15, cueText: 'で?', successText: 'はいっ', missText: 'で...?' },
  { id: 'q06', cueBeat: 16, targetBeat: 17, cueText: '趣味は?', successText: 'はいっ', missText: '空白' },
  { id: 'q07', cueBeat: 18, targetBeat: 19, cueText: 'いいね', successText: 'はいっ', missText: '苦笑' },
  { id: 'q08', cueBeat: 20, targetBeat: 21, cueText: '採用?', successText: 'はいっ', missText: '保留' },
  { id: 'q09', cueBeat: 24, targetBeat: 25, cueText: '急に?', successText: 'はいっ', missText: '硬直' },
  { id: 'q10', cueBeat: 26, targetBeat: 27, cueText: 'まだ?', successText: 'はいっ', missText: '沈黙' },
  { id: 'q11', cueBeat: 28, targetBeat: 29, cueText: 'それで?', successText: 'はいっ', missText: '目線' },
  { id: 'q12', cueBeat: 30, targetBeat: 31, cueText: 'つまり?', successText: 'はいっ', missText: '汗' },
  { id: 'q13', cueBeat: 34, targetBeat: 35, cueText: '一拍おいて', successText: 'はいっ', missText: '早い' },
  { id: 'q14', cueBeat: 36, targetBeat: 37, cueText: 'もう一度', successText: 'はいっ', missText: '遅い' },
  { id: 'q15', cueBeat: 38, targetBeat: 39, cueText: 'いい返事', successText: 'はいっ', missText: '薄い' },
  { id: 'q16', cueBeat: 42, targetBeat: 43, cueText: '履歴書は?', successText: 'はいっ', missText: 'ない' },
  { id: 'q17', cueBeat: 44, targetBeat: 45, cueText: '写真は?', successText: 'はいっ', missText: '別人' },
  { id: 'q18', cueBeat: 46, targetBeat: 47, cueText: '長所は?', successText: 'はいっ', missText: '短所' },
  { id: 'q19', cueBeat: 50, targetBeat: 51, cueText: '最終確認', successText: 'はいっ', missText: '未確認' },
  { id: 'q20', cueBeat: 52, targetBeat: 53, cueText: '本当に?', successText: 'はいっ', missText: '多分' },
  { id: 'q21', cueBeat: 54, targetBeat: 55, cueText: '自信は?', successText: 'はいっ', missText: '少し' },
  { id: 'q22', cueBeat: 58, targetBeat: 59, cueText: 'ラスト', successText: 'はいっ', missText: 'あっ' },
  { id: 'q23', cueBeat: 60, targetBeat: 61, cueText: '決めて', successText: 'はいっ', missText: 'ズレ' },
  { id: 'q24', cueBeat: 62, targetBeat: 63, cueText: '採用です', successText: 'はいっ', missText: '再面接' },
]
```

- [ ] **Step 3: Write timing tests first**

Create `src/rhythm/timing.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { BEAT_MS, GOOD_WINDOW_MS, INTERVIEW_STAGE, PERFECT_WINDOW_MS } from './stage'
import { beatToMs, canJudgeTarget, isTargetMissed, judgeInput, judgeOffset, summarizeResults } from './timing'

describe('rhythm timing', () => {
  it('converts beats to milliseconds at 120 BPM', () => {
    expect(BEAT_MS).toBe(500)
    expect(beatToMs(0)).toBe(0)
    expect(beatToMs(4)).toBe(2000)
    expect(beatToMs(5.5)).toBe(2750)
  })

  it('judges perfect, good, and miss offsets', () => {
    expect(judgeOffset(0)).toBe('perfect')
    expect(judgeOffset(PERFECT_WINDOW_MS)).toBe('perfect')
    expect(judgeOffset(-PERFECT_WINDOW_MS)).toBe('perfect')
    expect(judgeOffset(PERFECT_WINDOW_MS + 1)).toBe('good')
    expect(judgeOffset(-(PERFECT_WINDOW_MS + 1))).toBe('good')
    expect(judgeOffset(GOOD_WINDOW_MS + 1)).toBe('miss')
  })

  it('judges input against a target time', () => {
    expect(judgeInput(2500, 2500)).toBe('perfect')
    expect(judgeInput(2500, 2600)).toBe('good')
    expect(judgeInput(2500, 2700)).toBe('miss')
  })

  it('detects an unpressed target after the good window expires', () => {
    expect(isTargetMissed(2500, 2500 + GOOD_WINDOW_MS)).toBe(false)
    expect(isTargetMissed(2500, 2500 + GOOD_WINDOW_MS + 1)).toBe(true)
  })

  it('prevents duplicate judgment for the same target', () => {
    const target = INTERVIEW_STAGE[0]
    expect(canJudgeTarget(target, new Set())).toBe(true)
    expect(canJudgeTarget(target, new Set([target.id]))).toBe(false)
  })

  it('summarizes score and rank', () => {
    expect(summarizeResults(['perfect', 'perfect'], 2)).toEqual({
      perfect: 2,
      good: 0,
      miss: 0,
      score: 4,
      maxScore: 4,
      rank: 'S',
    })
    expect(summarizeResults(['perfect', 'good', 'miss', 'miss'], 4).rank).toBe('B')
    expect(summarizeResults(['good', 'miss', 'miss', 'miss'], 4).rank).toBe('C')
  })
})
```

- [ ] **Step 4: Run the tests and verify they fail**

Run: `npm run test:run -- src/rhythm/timing.test.ts`

Expected: FAIL because `src/rhythm/timing.ts` does not exist.

- [ ] **Step 5: Implement timing helpers**

Create `src/rhythm/timing.ts`:

```ts
import { BEAT_MS, GOOD_WINDOW_MS, PERFECT_WINDOW_MS } from './stage'
import type { Judgment, Rank, ResultSummary, StageTarget } from './types'

export function beatToMs(beat: number, beatMs = BEAT_MS): number {
  return Math.round(beat * beatMs)
}

export function judgeOffset(offsetMs: number): Judgment {
  const absoluteOffset = Math.abs(offsetMs)
  if (absoluteOffset <= PERFECT_WINDOW_MS) return 'perfect'
  if (absoluteOffset <= GOOD_WINDOW_MS) return 'good'
  return 'miss'
}

export function judgeInput(targetMs: number, inputMs: number): Judgment {
  return judgeOffset(inputMs - targetMs)
}

export function isTargetMissed(targetMs: number, nowMs: number): boolean {
  return nowMs > targetMs + GOOD_WINDOW_MS
}

export function canJudgeTarget(target: StageTarget, judgedIds: ReadonlySet<string>): boolean {
  return !judgedIds.has(target.id)
}

export function summarizeResults(judgments: readonly Judgment[], totalTargets: number): ResultSummary {
  const perfect = judgments.filter((judgment) => judgment === 'perfect').length
  const good = judgments.filter((judgment) => judgment === 'good').length
  const miss = totalTargets - perfect - good
  const score = perfect * 2 + good
  const maxScore = totalTargets * 2
  const ratio = maxScore === 0 ? 0 : score / maxScore
  const rank: Rank = ratio >= 0.9 ? 'S' : ratio >= 0.75 ? 'A' : ratio >= 0.55 ? 'B' : 'C'

  return { perfect, good, miss, score, maxScore, rank }
}
```

- [ ] **Step 6: Run timing tests and commit**

Run: `npm run test:run -- src/rhythm/timing.test.ts`

Expected: PASS.

Commit:

```bash
git add src/rhythm/types.ts src/rhythm/stage.ts src/rhythm/timing.ts src/rhythm/timing.test.ts
git commit -m "feat: add rhythm timing core"
```

---

### Task 2: Generated Audio Helper

**Files:**
- Create: `src/audio/useRhythmAudio.ts`

**Interfaces:**
- Consumes: no project-local imports.
- Produces: `useRhythmAudio(): { ensureAudio(): void; playBeat(): void; playCue(): void; playHit(kind: 'perfect' | 'good' | 'miss'): void; playResult(rank: string): void }`

- [ ] **Step 1: Create the audio hook**

Create `src/audio/useRhythmAudio.ts`:

```ts
import { useCallback, useRef } from 'react'

type AudioApi = {
  ensureAudio: () => void
  playBeat: () => void
  playCue: () => void
  playHit: (kind: 'perfect' | 'good' | 'miss') => void
  playResult: (rank: string) => void
}

type BrowserAudioContext = typeof AudioContext

function getAudioContextCtor(): BrowserAudioContext | null {
  return window.AudioContext ?? null
}

function playTone(ctx: AudioContext, frequency: number, durationMs: number, type: OscillatorType, gainValue = 0.08) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)

  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(now)
  oscillator.stop(now + durationMs / 1000 + 0.02)
}

export function useRhythmAudio(): AudioApi {
  const ctxRef = useRef<AudioContext | null>(null)

  const ensureAudio = useCallback(() => {
    if (ctxRef.current) {
      void ctxRef.current.resume()
      return
    }

    const Ctor = getAudioContextCtor()
    if (!Ctor) return

    try {
      ctxRef.current = new Ctor()
      void ctxRef.current.resume()
    } catch {
      ctxRef.current = null
    }
  }, [])

  const withAudio = useCallback((fn: (ctx: AudioContext) => void) => {
    const ctx = ctxRef.current
    if (!ctx) return
    try {
      fn(ctx)
    } catch {
      ctxRef.current = null
    }
  }, [])

  return {
    ensureAudio,
    playBeat: () => withAudio((ctx) => playTone(ctx, 220, 34, 'triangle', 0.035)),
    playCue: () => withAudio((ctx) => playTone(ctx, 440, 70, 'square', 0.045)),
    playHit: (kind) =>
      withAudio((ctx) => {
        if (kind === 'perfect') playTone(ctx, 880, 90, 'sine', 0.08)
        if (kind === 'good') playTone(ctx, 660, 75, 'triangle', 0.065)
        if (kind === 'miss') playTone(ctx, 110, 160, 'sawtooth', 0.045)
      }),
    playResult: (rank) =>
      withAudio((ctx) => {
        const base = rank === 'S' || rank === 'A' ? 523 : 196
        playTone(ctx, base, 120, 'sine', 0.07)
        window.setTimeout(() => withAudio((nextCtx) => playTone(nextCtx, base * 1.5, 140, 'sine', 0.07)), 130)
      }),
  }
}
```

- [ ] **Step 2: Typecheck the hook**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Commit**

Commit:

```bash
git add src/audio/useRhythmAudio.ts
git commit -m "feat: add generated rhythm audio"
```

---

### Task 3: React Game Runtime

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `INTERVIEW_STAGE`, `STAGE_END_BEAT`, `BEAT_MS`, `GOOD_WINDOW_MS`
- Consumes: `beatToMs`, `canJudgeTarget`, `isTargetMissed`, `judgeInput`, `summarizeResults`
- Consumes: `useRhythmAudio`
- Produces: title, playing, and result screens.

- [ ] **Step 1: Replace `src/App.tsx` with the rhythm game**

Replace the file with:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

  const finishRun = useCallback((entries: readonly JudgedTarget[]) => {
    const summary = summarizeResults(entries.map((entry) => entry.judgment), INTERVIEW_STAGE.length)
    setResult(summary)
    setPhase('result')
    audio.playResult(summary.rank)
  }, [audio])

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
      setLastText('まだです')
      audio.playHit('miss')
      return
    }

    const targetMs = beatToMs(openTarget.targetBeat)
    const judgment = judgeInput(targetMs, inputMs)
    const entry: JudgedTarget = { targetId: openTarget.id, judgment, offsetMs: Math.round(inputMs - targetMs) }
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
      ...missedTargets.map((target) => ({ targetId: target.id, judgment: 'miss' as const, offsetMs: null })),
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
          <p className="subtitle">まじめすぎる面接官に、リズムよく「はいっ」と返事しよう。</p>
          <button className="primary-action" type="button" onClick={startRun}>面接開始</button>
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
            <span>Perfect</span><strong>{result.perfect}</strong>
            <span>Good</span><strong>{result.good}</strong>
            <span>Miss</span><strong>{result.miss}</strong>
            <span>Score</span><strong>{result.score}/{result.maxScore}</strong>
          </div>
          <div className="result-actions">
            <button className="primary-action" type="button" onClick={startRun}>もう一度</button>
            <button className="secondary-action" type="button" onClick={() => setPhase('title')}>タイトル</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={`app play-screen judge-${lastJudgment ?? 'ready'}`} onPointerDown={judgePress}>
      <div className="progress"><span style={{ width: `${progress * 100}%` }} /></div>
      <section className="interview-room">
        <div className={`character applicant ${lastJudgment === 'miss' ? 'is-wrong' : ''}`}>
          <div className="head"><span className="eyes" /></div>
          <div className="body" />
          <p className="bubble answer">{lastText}</p>
        </div>
        <div className="desk">
          <div className="paper" />
          <div className="stamp" />
        </div>
        <div className={`character interviewer ${cue ? 'is-cueing' : ''}`}>
          <div className="head"><span className="eyes" /></div>
          <div className="body" />
          <p className="bubble question">{cue?.cueText ?? '...'}</p>
        </div>
      </section>
      <section className="hud">
        <div className="beat-pulse" aria-label="beat indicator">{beat % 4 + 1}</div>
        <strong>{formatJudgment(lastJudgment)}</strong>
        <span>Space / Tap</span>
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Typecheck the runtime**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Commit**

Commit:

```bash
git add src/App.tsx
git commit -m "feat: add weird interview game runtime"
```

---

### Task 4: Visual Treatment And Verification

**Files:**
- Replace: `src/styles.css`

**Interfaces:**
- Consumes: classes emitted by `src/App.tsx`.
- Produces: responsive title, playing, and result screens.

- [ ] **Step 1: Replace CSS**

Replace `src/styles.css` with:

```css
:root {
  --bg: #f3e7cc;
  --ink: #17120d;
  --line: #17120d;
  --paper: #fff8e8;
  --desk: #7b4a27;
  --red: #e44732;
  --blue: #2374ab;
  --gold: #f5b93f;
  --green: #35a66a;
  --shadow: rgba(23, 18, 13, .28);
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body, #root { min-height: 100%; margin: 0; }
body {
  color: var(--ink);
  font-family: "Yu Gothic UI", "Hiragino Sans", system-ui, sans-serif;
  background:
    linear-gradient(90deg, rgba(23,18,13,.06) 1px, transparent 1px),
    linear-gradient(180deg, rgba(23,18,13,.06) 1px, transparent 1px),
    var(--bg);
  background-size: 34px 34px;
  user-select: none;
  overscroll-behavior: none;
}
button { font: inherit; color: inherit; cursor: pointer; }
button:focus-visible { outline: 4px solid var(--blue); outline-offset: 4px; }

.app {
  min-height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.title-screen,
.result-screen {
  padding: 24px;
}

.title-panel,
.result-card {
  width: min(100%, 520px);
  border: 4px solid var(--line);
  border-radius: 8px;
  padding: 26px;
  background: var(--paper);
  box-shadow: 10px 10px 0 var(--shadow);
  text-align: center;
}

.kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .14em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(42px, 11vw, 78px);
  line-height: .95;
}

.subtitle {
  margin: 16px auto 22px;
  max-width: 28rem;
  font-size: 17px;
  line-height: 1.6;
}

.hint {
  margin: 14px 0 0;
  font-size: 13px;
  font-weight: 800;
}

.primary-action,
.secondary-action {
  min-height: 48px;
  border: 3px solid var(--line);
  border-radius: 8px;
  padding: 10px 18px;
  background: var(--gold);
  box-shadow: 4px 4px 0 var(--line);
  font-weight: 900;
}

.secondary-action {
  background: var(--paper);
}

.primary-action:active,
.secondary-action:active {
  transform: translate(3px, 3px);
  box-shadow: 1px 1px 0 var(--line);
}

.play-screen {
  position: relative;
  grid-template-rows: 10px 1fr auto;
  align-items: stretch;
  justify-items: stretch;
  padding: 12px;
  cursor: pointer;
}

.progress {
  height: 10px;
  border: 3px solid var(--line);
  border-radius: 999px;
  background: var(--paper);
  overflow: hidden;
}

.progress span {
  display: block;
  height: 100%;
  background: var(--red);
  transition: width .08s linear;
}

.interview-room {
  position: relative;
  width: min(100%, 900px);
  min-height: 520px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr minmax(170px, 260px) 1fr;
  align-items: end;
  gap: clamp(10px, 3vw, 34px);
}

.desk {
  position: relative;
  height: 150px;
  margin-bottom: 48px;
  border: 4px solid var(--line);
  border-radius: 8px 8px 18px 18px;
  background: var(--desk);
  box-shadow: 8px 8px 0 var(--shadow);
}

.desk::after {
  content: "";
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: -54px;
  height: 54px;
  border: 4px solid var(--line);
  border-top: 0;
  background: #5e351d;
}

.paper {
  position: absolute;
  top: 20px;
  left: 24px;
  width: 78px;
  height: 58px;
  border: 3px solid var(--line);
  background: var(--paper);
  transform: rotate(-5deg);
}

.stamp {
  position: absolute;
  top: 34px;
  right: 28px;
  width: 34px;
  height: 34px;
  border: 4px solid var(--red);
  border-radius: 50%;
}

.character {
  position: relative;
  display: grid;
  justify-items: center;
  align-content: end;
  min-height: 390px;
}

.head {
  position: relative;
  width: clamp(96px, 17vw, 144px);
  height: clamp(112px, 18vw, 160px);
  border: 4px solid var(--line);
  border-radius: 46% 46% 42% 42%;
  background: #ffd9aa;
  box-shadow: 7px 7px 0 var(--shadow);
  z-index: 2;
}

.interviewer .head {
  border-radius: 42% 42% 48% 48%;
  background: #ffe1bc;
}

.head::before,
.head::after {
  content: "";
  position: absolute;
  top: 44%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--line);
}

.head::before { left: 28%; }
.head::after { right: 28%; }

.eyes::after {
  content: "";
  position: absolute;
  left: 37%;
  right: 37%;
  top: 64%;
  height: 4px;
  border-radius: 999px;
  background: var(--line);
}

.body {
  width: clamp(118px, 20vw, 172px);
  height: clamp(142px, 23vw, 196px);
  margin-top: -8px;
  border: 4px solid var(--line);
  border-radius: 32px 32px 8px 8px;
  background: var(--blue);
  box-shadow: 7px 7px 0 var(--shadow);
}

.interviewer .body {
  background: #222;
}

.bubble {
  position: absolute;
  top: 38px;
  min-width: 94px;
  max-width: 190px;
  margin: 0;
  border: 4px solid var(--line);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--paper);
  box-shadow: 5px 5px 0 var(--shadow);
  font-size: clamp(16px, 3vw, 24px);
  font-weight: 900;
  text-align: center;
}

.answer { right: 3%; }
.question { left: 3%; }

.is-cueing .head {
  animation: nod .28s ease-out;
}

.judge-perfect .applicant .head,
.judge-good .applicant .head {
  animation: answer-pop .18s ease-out;
}

.judge-miss .applicant .head {
  animation: wrong-shake .25s ease-out;
}

.judge-miss .interviewer .eyes::after {
  top: 61%;
  height: 8px;
}

.judge-perfect .answer { background: var(--green); color: white; }
.judge-good .answer { background: var(--gold); }
.judge-miss .answer { background: var(--red); color: white; }

.hud {
  width: min(100%, 620px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 12px;
  border: 4px solid var(--line);
  border-radius: 8px;
  padding: 10px 14px;
  background: var(--paper);
  box-shadow: 7px 7px 0 var(--shadow);
}

.hud strong {
  font-size: clamp(22px, 5vw, 44px);
  line-height: 1;
}

.hud span {
  font-size: 13px;
  font-weight: 900;
}

.beat-pulse {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 3px solid var(--line);
  border-radius: 50%;
  background: var(--gold);
  font-weight: 900;
  animation: pulse .5s ease-out infinite;
}

.score-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px 18px;
  max-width: 320px;
  margin: 22px auto;
  text-align: left;
  font-size: 18px;
}

.score-grid strong {
  text-align: right;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

@keyframes pulse {
  0% { transform: scale(1); }
  30% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

@keyframes nod {
  0%, 100% { transform: translateY(0) rotate(0); }
  45% { transform: translateY(12px) rotate(2deg); }
}

@keyframes answer-pop {
  0% { transform: scale(1); }
  60% { transform: scale(1.14, .9) translateY(8px); }
  100% { transform: scale(1); }
}

@keyframes wrong-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px) rotate(-2deg); }
  75% { transform: translateX(10px) rotate(2deg); }
}

@media (max-width: 700px) {
  .play-screen {
    padding: 10px;
  }

  .interview-room {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 130px;
    min-height: 560px;
    gap: 6px 14px;
  }

  .desk {
    grid-column: 1 / -1;
    grid-row: 2;
    width: min(78vw, 360px);
    margin: 0 auto 28px;
  }

  .character {
    min-height: 360px;
  }

  .applicant { grid-column: 1; }
  .interviewer { grid-column: 2; }

  .bubble {
    top: 8px;
    max-width: 150px;
    font-size: 16px;
  }

  .answer { right: -4px; }
  .question { left: -4px; }

  .hud {
    grid-template-columns: 52px 1fr;
  }

  .hud span {
    grid-column: 1 / -1;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Run all automated verification**

Run:

```bash
npm run test:run
npm run typecheck
npm run build
```

Expected: all commands PASS.

- [ ] **Step 3: Run local browser verification**

Run: `npm run dev -- --host 127.0.0.1`

Open the printed local URL. Verify:

- title screen renders
- clicking "面接開始" starts play
- Space judges input
- tapping/clicking the play area judges input
- Perfect/Good/Miss text changes
- characters visibly react
- result screen appears after the stage
- retry button starts a fresh run
- desktop width and mobile width do not overlap text or characters

- [ ] **Step 4: Commit**

Commit:

```bash
git add src/styles.css
git commit -m "style: add weird interview visual treatment"
```

---

## Final Verification

- [ ] Run `npm run test:run`
- [ ] Run `npm run typecheck`
- [ ] Run `npm run build`
- [ ] Run the dev server and manually play one full run.
- [ ] Confirm no generated files such as `.vite/`, `dist/`, or `tmp/` are accidentally staged.

Expected final state:

- The app opens to `Weird Interview`.
- One-button rhythm play works with keyboard and pointer input.
- The run ends in under one minute.
- Result rank and counts are shown.
- The project builds successfully.
