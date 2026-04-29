import type { Case } from './case';

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
