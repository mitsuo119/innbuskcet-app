/**
 * フィードバック評価用のキーワード辞書（PBI-029 / TASK-008）。
 *
 * - ルールベース評価で「理由」「アクション」記述の質を観点別に簡易判定するための辞書。
 * - 純粋関数 `countKeywordMatches` でテキスト内の出現数を集計する（重なり許容なしの非重複カウント）。
 * - DoD §10-1（入力検証）: 空文字 / 空配列 / 空キーワード はすべて 0 を返す。
 */

/** キーワード辞書の型: 観点名 → キーワード配列。 */
export type FeedbackKeywordMap = Record<string, readonly string[]>;

/** 理由（reason）評価用のキーワード辞書。 */
export const REASON_KEYWORDS: FeedbackKeywordMap = {
  '5W1H': ['誰が', 'いつ', 'どこで', '何を', 'なぜ', 'どのように'],
  優先度: ['緊急', '重要', 'リスク', '期限', '締切', '影響'],
  論理: ['なぜなら', 'ため', 'から', 'ので', '結果として', 'このため'],
};

/** アクション（action）評価用のキーワード辞書。 */
export const ACTION_KEYWORDS: FeedbackKeywordMap = {
  委任: ['依頼', '任せ', '担当', '委任', '連絡', '相談'],
  フォロー: ['確認', '報告', '追跡', 'フォロー', '状況確認'],
  具体性: ['〇〇時', '本日中', '明日', '今週中', '優先して'],
};

/**
 * テキスト内のキーワード出現数を数える（部分一致・非重複・大小区別あり）。
 *
 * - 空文字 / 空配列 / 空キーワードは 0 を返す（DoD §10-1）。
 * - 同一キーワードが複数回出現すれば加算する。
 * - キーワード同士の重なり（例: 'ため' と 'このため'）はそれぞれ独立にカウントする。
 */
export function countKeywordMatches(text: string, keywords: readonly string[]): number {
  if (typeof text !== 'string' || text.length === 0) return 0;
  if (!Array.isArray(keywords) || keywords.length === 0) return 0;
  let count = 0;
  for (const kw of keywords) {
    if (typeof kw !== 'string' || kw.length === 0) continue;
    let idx = 0;
    while (true) {
      const found = text.indexOf(kw, idx);
      if (found === -1) break;
      count++;
      idx = found + kw.length;
    }
  }
  return count;
}
