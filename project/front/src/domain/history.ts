import type { Priority } from './case';
import type { Judgement } from './judge';

/** 履歴1件: ○×（judgement）と正解優先度を保持 */
export interface HistoryItem {
  /** 問題の case id（重複可：同じ案件を複数回解いた場合） */
  caseId: string;
  /** 回答結果（○ = correct, × = incorrect） */
  judgement: Judgement;
  /** その案件の正解優先度（A/B/C） */
  correctPriority: Priority;
}

/** 直近何件まで保持するか（PBI-016 受入基準） */
export const MAX_HISTORY = 10;

/** 初期履歴（空配列・イミュータブル） */
export const initialHistory: readonly HistoryItem[] = Object.freeze([]);

/**
 * 回答結果を履歴に追加し、直近 MAX_HISTORY 件のみを保持した新しい配列を返す。
 * - 純粋関数（入力配列を変更しない）。
 * - 古いものから捨てる（FIFO）。
 * - セッション内のみ保持する責務は呼び出し側（App 側 useState 等）に委ねる。
 */
export function pushHistory(history: readonly HistoryItem[], item: HistoryItem): HistoryItem[] {
  const next = [...history, item];
  if (next.length > MAX_HISTORY) {
    return next.slice(next.length - MAX_HISTORY);
  }
  return next;
}
