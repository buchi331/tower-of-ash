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

export function findTargetForInput(
  targets: readonly StageTarget[],
  inputMs: number,
  judgedIds: ReadonlySet<string>,
): StageTarget | null {
  return (
    targets.find((target) => {
      if (!canJudgeTarget(target, judgedIds)) return false
      const cueMs = beatToMs(target.cueBeat)
      const targetMs = beatToMs(target.targetBeat)
      return inputMs >= cueMs && !isTargetMissed(targetMs, inputMs)
    }) ?? null
  )
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
