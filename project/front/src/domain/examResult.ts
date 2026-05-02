/**
 * Exam モード結果集計（PBI-030 / TASK-002）。
 *
 * Exam セッション完走時 / 時間切れ時に、
 *   - 正答数 / 出題数 / 正答率（%）
 *   - 所要時間（mm:ss）
 *   - 優先度（A/B/C）別の正答数 / 出題数
 * を純粋関数として算出する。UI（ExamResult.tsx）から参照する。
 *
 * - 入力検証（DoD §10-1）: 配列長不一致 / 不正値は安全にフォールバックし throw しない。
 * - 副作用なし: I/O は examTimer.ts に集約しているため本ファイルでは扱わない。
 *
 * NOTE (DAY1 部分実装): 基盤 API のみ提供。境界値テスト 8 件 / 全件 PASS は
 * TASK-002 完了 (DAY2) で達成予定。
 */

import type { Priority } from './case';
import { formatTime } from './examTimer';

/** 優先度別の正答 / 出題カウント。 */
export interface PriorityCount {
  /** 正答数 */
  correct: number;
  /** 出題数 */
  total: number;
}

/** A/B/C 優先度ごとのカウント。 */
export type PriorityBreakdown = Readonly<Record<Priority, PriorityCount>>;

/** Exam 結果サマリ（UI に渡す形）。 */
export interface ExamResultSummary {
  /** 出題数（通常 20）。 */
  totalQuestions: number;
  /** 全体正答数。 */
  correctCount: number;
  /** 正答率（0–100 の整数 %）。出題数 0 のときは 0。 */
  percentage: number;
  /** 所要時間（秒・0 以上）。 */
  elapsedSeconds: number;
  /** 所要時間 mm:ss 表示（formatTime 経由）。 */
  elapsedDisplay: string;
  /** 優先度別の正答 / 出題。 */
  byPriority: PriorityBreakdown;
}

const EMPTY_BREAKDOWN: PriorityBreakdown = {
  A: { correct: 0, total: 0 },
  B: { correct: 0, total: 0 },
  C: { correct: 0, total: 0 },
};

/** A/B/C 別カウントの空インスタンス（mutate 用に都度生成）。 */
function emptyBreakdown(): { A: PriorityCount; B: PriorityCount; C: PriorityCount } {
  return {
    A: { correct: 0, total: 0 },
    B: { correct: 0, total: 0 },
    C: { correct: 0, total: 0 },
  };
}

/**
 * 出題と回答の配列から優先度別の正答 / 出題カウントを集計する純粋関数。
 *
 * - 配列長が一致しないときは min(length) までを集計対象とする（安全側）。
 * - 想定外の値（A/B/C 以外）は無視する（DoD §10-1）。
 */
export function evaluateByPriority(
  correctPriorities: readonly Priority[],
  userPriorities: readonly Priority[],
): PriorityBreakdown {
  if (!Array.isArray(correctPriorities) || !Array.isArray(userPriorities)) {
    return EMPTY_BREAKDOWN;
  }
  const len = Math.min(correctPriorities.length, userPriorities.length);
  const acc = emptyBreakdown();
  for (let i = 0; i < len; i++) {
    const cp = correctPriorities[i];
    const up = userPriorities[i];
    if (cp !== 'A' && cp !== 'B' && cp !== 'C') continue;
    acc[cp].total += 1;
    if (cp === up) acc[cp].correct += 1;
  }
  return acc;
}

/**
 * 0–100 の整数パーセントを返す（0 除算は 0）。
 */
export function calcPercentage(correct: number, total: number): number {
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0) return 0;
  const safeCorrect = Math.max(0, Math.min(correct, total));
  return Math.round((safeCorrect / total) * 100);
}

/**
 * Exam 結果サマリを生成する純粋関数（PBI-030 / TASK-002）。
 *
 * @param correctPriorities 正解優先度（出題順）。
 * @param userPriorities ユーザ回答（出題順、未回答は補完済み前提）。
 * @param elapsedSeconds 所要時間（秒・負値は 0 にクランプ）。
 */
export function buildExamResultSummary(
  correctPriorities: readonly Priority[],
  userPriorities: readonly Priority[],
  elapsedSeconds: number,
): ExamResultSummary {
  const byPriority = evaluateByPriority(correctPriorities, userPriorities);
  const correctCount = byPriority.A.correct + byPriority.B.correct + byPriority.C.correct;
  const totalQuestions =
    byPriority.A.total + byPriority.B.total + byPriority.C.total;
  const safeElapsed =
    Number.isFinite(elapsedSeconds) && elapsedSeconds > 0 ? Math.floor(elapsedSeconds) : 0;
  return {
    totalQuestions,
    correctCount,
    percentage: calcPercentage(correctCount, totalQuestions),
    elapsedSeconds: safeElapsed,
    elapsedDisplay: formatTime(safeElapsed),
    byPriority,
  };
}
