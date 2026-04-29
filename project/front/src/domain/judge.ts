import type { Priority } from './case';

/** 採点結果 */
export type Judgement = 'correct' | 'incorrect';

/**
 * 回答と正解を比較して正誤を返す。
 * @param answer ユーザーが選択した優先度
 * @param correct 正解の優先度
 */
export function judge(answer: Priority, correct: Priority): Judgement {
  return answer === correct ? 'correct' : 'incorrect';
}
