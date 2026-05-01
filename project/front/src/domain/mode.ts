import type { Case } from './case';
import { initialHistory, type HistoryItem } from './history';
import { pickNextCaseByMode, type FilterMode } from './random';
import { initialScore, type Score } from './score';

/**
 * セッション初期モード（PBI-018）。
 * リロード時に常に 'all' に戻ることを保証するため、useState の初期値に使う。
 */
export const initialMode: FilterMode = 'all';

/** モード切替時のリセット状態 */
export interface ModeChangeReset {
  mode: FilterMode;
  history: readonly HistoryItem[];
  score: Score;
  current: Case | null;
}

/**
 * 出題モード切替時の状態リセット（純粋関数・PBI-018）。
 * - 履歴とカウンタを初期化する
 * - 新モードでフィルタした候補からランダムに次の1件を選ぶ
 * - フィルタ後 0 件のときは current = null（呼び出し側で「該当なし」表示）
 */
export function applyModeChange(
  cases: readonly Case[],
  nextMode: FilterMode,
  random: () => number = Math.random,
): ModeChangeReset {
  return {
    mode: nextMode,
    history: initialHistory,
    score: initialScore,
    current: pickNextCaseByMode(cases, undefined, nextMode, random),
  };
}
