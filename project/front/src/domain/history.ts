import type { Priority } from './case';
import type { Judgement } from './judge';
import type { LearningStyle } from './learningStyle';

/** 履歴1件: ○×（judgement）と正解優先度を保持 */
export interface HistoryItem {
  /** 問題の case id（重複可：同じ案件を複数回解いた場合） */
  caseId: string;
  /** 回答結果（○ = correct, × = incorrect） */
  judgement: Judgement;
  /** その案件の正解優先度（A/B/C） */
  correctPriority: Priority;
  /**
   * 回答時の学習スタイル（PBI-037 / TASK-014）。
   * - quick: 優先順位のみ回答
   * - deep: 記述あり
   * 既存履歴互換のため optional。未指定は Sprint006 以前のレコードを示す。
   */
  learningStyle?: LearningStyle;
  /**
   * ユーザが回答した優先度（PBI-030 / Sprint008 TASK-002）。
   * - 既存履歴互換のため optional。Sprint007 以前のレコードでは未設定。
   * - ExamResultView での「回答／正解」並列表示に使用する。
   */
  answeredPriority?: Priority;
}

/** 直近何件まで保持するか（PBI-016 受入基準。PBI-020 で表示件数 10/20 切替可） */
export const MAX_HISTORY = 10;

/** PBI-020 で選択可能な保持件数の選択肢 */
export const HISTORY_LIMIT_OPTIONS = [10, 20] as const;
export type HistoryLimit = (typeof HISTORY_LIMIT_OPTIONS)[number];

/** 初期履歴（空配列・イミュータブル） */
export const initialHistory: readonly HistoryItem[] = Object.freeze([]);

/**
 * 回答結果を履歴に追加し、直近 `max` 件のみを保持した新しい配列を返す。
 * - 純粋関数（入力配列を変更しない）。
 * - 古いものから捨てる（FIFO）。
 * - `max` 省略時は MAX_HISTORY (=10) を上限とする（PBI-016 既定動作）。
 * - PBI-020 で 10/20 切替対応のため `max` を受け取れるよう拡張。
 */
export function pushHistory(
  history: readonly HistoryItem[],
  item: HistoryItem,
  max: number = MAX_HISTORY,
): HistoryItem[] {
  const next = [...history, item];
  if (next.length > max) {
    return next.slice(next.length - max);
  }
  return next;
}

/**
 * 既存履歴を新しい上限で切り詰める（履歴件数切替時の補正用・PBI-020）。
 * - 末尾（新しい側）優先で残す。
 * - max 以下なら同一参照を返さず新配列で返却（呼び出し側の不要な再描画を避ける場合は呼び側で参照比較する想定）。
 */
export function trimHistory(history: readonly HistoryItem[], max: number): HistoryItem[] {
  if (history.length <= max) return [...history];
  return history.slice(history.length - max);
}
