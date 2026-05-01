import type { Case, Priority } from './case';

/**
 * 出題モード（PBI-018）。
 * - 'all' : 全件から出題
 * - 'A' / 'B' / 'C' : 該当する正解優先度の案件のみ
 */
export type FilterMode = 'all' | Priority;

/** 出題モードの一覧（UI 切替で使用） */
export const FILTER_MODES: readonly FilterMode[] = ['all', 'A', 'B', 'C'] as const;

/**
 * 指定モードに合致する案件のみを抽出する純粋関数。
 * - mode='all' は入力をそのまま返す（参照は新規配列）。
 * - 一致なしなら空配列を返す（呼び出し側で「該当なし」表示を担保する）。
 */
export function filterByMode(cases: readonly Case[], mode: FilterMode): Case[] {
  if (mode === 'all') {
    return [...cases];
  }
  return cases.filter((c) => c.correctPriority === mode);
}

/**
 * 直前に出題した1件を除外したうえでランダムに1件返す。
 * - cases が空の場合は null を返す
 * - cases が1件のみの場合は除外できないためその1件を返す
 *
 * @param cases 出題候補
 * @param previousId 直前に出題した case の id（無ければ undefined）
 * @param random 0以上1未満の乱数生成器（差し替えてテストできるよう注入）
 */
export function pickNextCase(
  cases: readonly Case[],
  previousId: string | undefined,
  random: () => number = Math.random,
): Case | null {
  if (cases.length === 0) {
    return null;
  }
  if (cases.length === 1) {
    return cases[0];
  }

  const candidates = previousId === undefined ? cases : cases.filter((c) => c.id !== previousId);

  // 全件が previousId と一致するケース（理論上発生しないが防御的に）
  const pool = candidates.length > 0 ? candidates : cases;

  const index = Math.floor(random() * pool.length);
  return pool[index];
}

/**
 * モードでフィルタしたうえで次の1件を選ぶ便利関数（PBI-018）。
 * - フィルタ後 0 件なら null（UI 側で「該当案件なし」を表示する責務）。
 */
export function pickNextCaseByMode(
  cases: readonly Case[],
  previousId: string | undefined,
  mode: FilterMode,
  random: () => number = Math.random,
): Case | null {
  return pickNextCase(filterByMode(cases, mode), previousId, random);
}
