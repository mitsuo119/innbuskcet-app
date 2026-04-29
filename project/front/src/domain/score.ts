import type { Judgement } from './judge';

/** セッション内スコア（リロードでリセット） */
export interface Score {
  /** 出題数（回答確定するたびに +1） */
  total: number;
  /** 正答数（正解時のみ +1） */
  correct: number;
}

/** 初期スコア（0/0） */
export const initialScore: Score = { total: 0, correct: 0 };

/**
 * 回答結果に応じてスコアを加算した新しい Score を返す。
 * - 出題数: 毎回 +1
 * - 正答数: judgement === 'correct' のときのみ +1
 */
export function addScore(score: Score, judgement: Judgement): Score {
  return {
    total: score.total + 1,
    correct: score.correct + (judgement === 'correct' ? 1 : 0),
  };
}
