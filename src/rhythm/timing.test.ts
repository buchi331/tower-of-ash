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
