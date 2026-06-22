import type { StageTarget } from './types'

export const INTERVIEW_BPM = 120
export const BEAT_MS = 60000 / INTERVIEW_BPM
export const PERFECT_WINDOW_MS = 80
export const GOOD_WINDOW_MS = 150
export const STAGE_END_BEAT = 72

export const INTERVIEW_STAGE: StageTarget[] = [
  { id: 'q01', cueBeat: 4, targetBeat: 5, cueText: 'Name?', successText: 'Yes!', missText: 'Uh' },
  { id: 'q02', cueBeat: 6, targetBeat: 7, cueText: 'Ready?', successText: 'Yes!', missText: 'Too soon' },
  { id: 'q03', cueBeat: 8, targetBeat: 9, cueText: 'Skill?', successText: 'Yes!', missText: 'Blank' },
  { id: 'q04', cueBeat: 10, targetBeat: 11, cueText: 'I see', successText: 'Yes!', missText: 'Stare' },
  { id: 'q05', cueBeat: 14, targetBeat: 15, cueText: 'So?', successText: 'Yes!', missText: 'Again' },
  { id: 'q06', cueBeat: 16, targetBeat: 17, cueText: 'Hobby?', successText: 'Yes!', missText: 'Late' },
  { id: 'q07', cueBeat: 18, targetBeat: 19, cueText: 'Hmm', successText: 'Yes!', missText: 'Uh' },
  { id: 'q08', cueBeat: 20, targetBeat: 21, cueText: 'Explain?', successText: 'Yes!', missText: 'Blank' },
  { id: 'q09', cueBeat: 24, targetBeat: 25, cueText: 'Favorite?', successText: 'Yes!', missText: 'Stare' },
  { id: 'q10', cueBeat: 26, targetBeat: 27, cueText: 'Really?', successText: 'Yes!', missText: 'Too soon' },
  { id: 'q11', cueBeat: 28, targetBeat: 29, cueText: 'And then?', successText: 'Yes!', missText: 'Late' },
  { id: 'q12', cueBeat: 30, targetBeat: 31, cueText: 'You too?', successText: 'Yes!', missText: 'Again' },
  { id: 'q13', cueBeat: 34, targetBeat: 35, cueText: 'One more', successText: 'Yes!', missText: 'Uh' },
  { id: 'q14', cueBeat: 36, targetBeat: 37, cueText: 'Almost', successText: 'Yes!', missText: 'Blank' },
  { id: 'q15', cueBeat: 38, targetBeat: 39, cueText: 'Speak up', successText: 'Yes!', missText: 'Stare' },
  { id: 'q16', cueBeat: 42, targetBeat: 43, cueText: 'Interview?', successText: 'Yes!', missText: 'Too soon' },
  { id: 'q17', cueBeat: 44, targetBeat: 45, cueText: 'Deep breath', successText: 'Yes!', missText: 'Late' },
  { id: 'q18', cueBeat: 46, targetBeat: 47, cueText: 'One word?', successText: 'Yes!', missText: 'Again' },
  { id: 'q19', cueBeat: 50, targetBeat: 51, cueText: 'Final answer', successText: 'Yes!', missText: 'Blank' },
  { id: 'q20', cueBeat: 52, targetBeat: 53, cueText: 'Before lunch?', successText: 'Yes!', missText: 'Uh' },
  { id: 'q21', cueBeat: 54, targetBeat: 55, cueText: 'Bonus round?', successText: 'Yes!', missText: 'Stare' },
  { id: 'q22', cueBeat: 58, targetBeat: 59, cueText: 'Last one', successText: 'Yes!', missText: 'Too soon' },
  { id: 'q23', cueBeat: 60, targetBeat: 61, cueText: 'Wrap it?', successText: 'Yes!', missText: 'Late' },
  { id: 'q24', cueBeat: 62, targetBeat: 63, cueText: 'Hired.', successText: 'Yes!', missText: 'Again' },
]
