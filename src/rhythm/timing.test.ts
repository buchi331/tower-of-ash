import { describe, expect, it } from 'vitest'
import { BEAT_MS, GOOD_WINDOW_MS, INTERVIEW_STAGE, PERFECT_WINDOW_MS } from './stage'
import { beatToMs, canJudgeTarget, findTargetForInput, isTargetMissed, judgeInput, judgeOffset, summarizeResults } from './timing'

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

  it('finds the current target when input lands within its score window', () => {
    const target = INTERVIEW_STAGE[0]

    expect(findTargetForInput(INTERVIEW_STAGE, beatToMs(target.targetBeat), new Set())).toBe(target)
  })

  it('consumes the earliest cued unjudged target for off-window input before auto-miss', () => {
    const first = INTERVIEW_STAGE[0]
    const inputMs = beatToMs(first.cueBeat)

    expect(findTargetForInput(INTERVIEW_STAGE, inputMs, new Set())).toBe(first)
  })

  it('skips targets whose cue has not appeared yet or whose miss window already elapsed', () => {
    const first = INTERVIEW_STAGE[0]
    const second = INTERVIEW_STAGE[1]

    expect(findTargetForInput(INTERVIEW_STAGE, beatToMs(first.cueBeat) - 1, new Set())).toBeNull()
    expect(findTargetForInput(INTERVIEW_STAGE, beatToMs(first.targetBeat) + GOOD_WINDOW_MS + 1, new Set())).toBeNull()
    expect(findTargetForInput(INTERVIEW_STAGE, beatToMs(second.cueBeat), new Set([first.id]))).toBe(second)
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
    expect(summarizeResults(['perfect', 'good', 'miss', 'miss'], 4).rank).toBe('C')
    expect(summarizeResults(['good', 'miss', 'miss', 'miss'], 4).rank).toBe('C')
  })
})
