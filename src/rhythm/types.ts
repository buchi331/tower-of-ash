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
