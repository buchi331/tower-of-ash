import type { StageTarget } from './types'

export const INTERVIEW_BPM = 120
export const BEAT_MS = 60000 / INTERVIEW_BPM
export const PERFECT_WINDOW_MS = 80
export const GOOD_WINDOW_MS = 150
export const STAGE_END_BEAT = 72

export const INTERVIEW_STAGE: StageTarget[] = [
  { id: 'q01', cueBeat: 4, targetBeat: 5, cueText: '縺雁錐蜑阪・?', successText: '縺ｯ縺・▲', missText: '縺医▲' },
  { id: 'q02', cueBeat: 6, targetBeat: 7, cueText: '蜈・ｰ・', successText: '縺ｯ縺・▲', missText: '蟆丞｣ｰ' },
  { id: 'q03', cueBeat: 8, targetBeat: 9, cueText: '迚ｹ謚縺ｯ?', successText: '縺ｯ縺・▲', missText: '辟｡險' },
  { id: 'q04', cueBeat: 10, targetBeat: 11, cueText: '縺ｪ繧九⊇縺ｩ', successText: '縺ｯ縺・▲', missText: '驕・綾' },
  { id: 'q05', cueBeat: 14, targetBeat: 15, cueText: '縺ｧ?', successText: '縺ｯ縺・▲', missText: '縺ｧ...?' },
  { id: 'q06', cueBeat: 16, targetBeat: 17, cueText: '雜｣蜻ｳ縺ｯ?', successText: '縺ｯ縺・▲', missText: '遨ｺ逋ｽ' },
  { id: 'q07', cueBeat: 18, targetBeat: 19, cueText: '縺・＞縺ｭ', successText: '縺ｯ縺・▲', missText: '闍ｦ隨・' },
  { id: 'q08', cueBeat: 20, targetBeat: 21, cueText: '謗｡逕ｨ?', successText: '縺ｯ縺・▲', missText: '菫晉蕗' },
  { id: 'q09', cueBeat: 24, targetBeat: 25, cueText: '諤･縺ｫ?', successText: '縺ｯ縺・▲', missText: '遑ｬ逶ｴ' },
  { id: 'q10', cueBeat: 26, targetBeat: 27, cueText: '縺ｾ縺?', successText: '縺ｯ縺・▲', missText: '豐磯ｻ・' },
  { id: 'q11', cueBeat: 28, targetBeat: 29, cueText: '縺昴ｌ縺ｧ?', successText: '縺ｯ縺・▲', missText: '逶ｮ邱・' },
  { id: 'q12', cueBeat: 30, targetBeat: 31, cueText: '縺､縺ｾ繧・', successText: '縺ｯ縺・▲', missText: '豎・' },
  { id: 'q13', cueBeat: 34, targetBeat: 35, cueText: '荳諡阪♀縺・※', successText: '縺ｯ縺・▲', missText: '譌ｩ縺・' },
  { id: 'q14', cueBeat: 36, targetBeat: 37, cueText: '繧ゅ≧荳蠎ｦ', successText: '縺ｯ縺・▲', missText: '驕・＞' },
  { id: 'q15', cueBeat: 38, targetBeat: 39, cueText: '縺・＞霑比ｺ・', successText: '縺ｯ縺・▲', missText: '阮・＞' },
  { id: 'q16', cueBeat: 42, targetBeat: 43, cueText: '螻･豁ｴ譖ｸ縺ｯ?', successText: '縺ｯ縺・▲', missText: '縺ｪ縺・' },
  { id: 'q17', cueBeat: 44, targetBeat: 45, cueText: '蜀咏悄縺ｯ?', successText: '縺ｯ縺・▲', missText: '蛻･莠ｺ' },
  { id: 'q18', cueBeat: 46, targetBeat: 47, cueText: '髟ｷ謇縺ｯ?', successText: '縺ｯ縺・▲', missText: '遏ｭ謇' },
  { id: 'q19', cueBeat: 50, targetBeat: 51, cueText: '譛邨ら｢ｺ隱・', successText: '縺ｯ縺・▲', missText: '譛ｪ遒ｺ隱・' },
  { id: 'q20', cueBeat: 52, targetBeat: 53, cueText: '譛ｬ蠖薙↓?', successText: '縺ｯ縺・▲', missText: '螟壼・' },
  { id: 'q21', cueBeat: 54, targetBeat: 55, cueText: '閾ｪ菫｡縺ｯ?', successText: '縺ｯ縺・▲', missText: '蟆代＠' },
  { id: 'q22', cueBeat: 58, targetBeat: 59, cueText: '繝ｩ繧ｹ繝・', successText: '縺ｯ縺・▲', missText: '縺ゅ▲' },
  { id: 'q23', cueBeat: 60, targetBeat: 61, cueText: '豎ｺ繧√※', successText: '縺ｯ縺・▲', missText: '繧ｺ繝ｬ' },
  { id: 'q24', cueBeat: 62, targetBeat: 63, cueText: '謗｡逕ｨ縺ｧ縺・', successText: '縺ｯ縺・▲', missText: '蜀埼擇謗･' },
]
