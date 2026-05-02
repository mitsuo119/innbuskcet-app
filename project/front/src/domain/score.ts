import type { Judgement } from './judge';
import { FILTER_MODES, type FilterMode } from './random';
import type { Priority } from './case';
import type { LearningStyle } from './learningStyle';

/** セッション内スコア（リロードでリセット） */
export interface Score {
  /** 出題数（回答確定するたびに +1） */
  total: number;
  /** 正答数（正解時のみ +1） */
  correct: number;
}

/** 初期スコア（0/0） */
export const initialScore: Score = { total: 0, correct: 0 };

/** モード別スコア（PBI-021 / TASK-005） */
export type ModeScores = Record<FilterMode, Score>;

/** 初期モード別スコア（全モード 0/0） */
export const initialModeScores: ModeScores = {
  all: { total: 0, correct: 0 },
  A: { total: 0, correct: 0 },
  B: { total: 0, correct: 0 },
  C: { total: 0, correct: 0 },
};

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

/**
 * モード別スコアに 1 件分の回答結果を加算した新しい ModeScores を返す（PBI-021）。
 * - 'all' は常に加算（全件モードの母集団）
 * - 当該案件の正解優先度（A/B/C）にも加算
 *   → どの出題モード（A/B/C/all）で解いたかに依存せず、案件種別で集計する
 *   → モード切替後も累積し、モード別の手応えを正しく可視化できる
 */
export function addModeScore(
  modeScores: ModeScores,
  correctPriority: Priority,
  judgement: Judgement,
): ModeScores {
  const next: ModeScores = { ...modeScores };
  next.all = addScore(next.all, judgement);
  next[correctPriority] = addScore(next[correctPriority], judgement);
  return next;
}

/**
 * 正答率（%）を 0〜100 の整数で返す。
 * - 0 件モードは null を返す（呼び出し側で「-」等を表示する責務）
 * - 端数は四捨五入
 */
export function ratePercent(score: Score): number | null {
  if (score.total === 0) return null;
  return Math.round((score.correct / score.total) * 100);
}

/** 列挙ヘルパ（UI で「全モード横並び表示」する用途を想定） */
export const ALL_MODES: readonly FilterMode[] = FILTER_MODES;

/** 学習スタイル別スコア（PBI-037 / TASK-015） */
export type LearningStyleScores = Record<LearningStyle, Score>;

/** 初期学習スタイル別スコア（quick/deep/exam ともに 0/0） */
export const initialLearningStyleScores: LearningStyleScores = {
  quick: { total: 0, correct: 0 },
  deep: { total: 0, correct: 0 },
  exam: { total: 0, correct: 0 },
};

/**
 * 学習スタイル別スコアに 1 件分の回答結果を加算した新しい LearningStyleScores を返す（PBI-037）。
 * - 当該学習スタイル（quick/deep）にのみ加算（モード別とは独立）
 * - イミュータブル（入力を変更しない）
 */
export function addLearningStyleScore(
  scores: LearningStyleScores,
  style: LearningStyle,
  judgement: Judgement,
): LearningStyleScores {
  return {
    ...scores,
    [style]: addScore(scores[style], judgement),
  };
}
