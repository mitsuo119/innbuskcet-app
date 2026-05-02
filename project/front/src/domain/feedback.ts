/**
 * ルールベース AI 評価フィードバック（PBI-029 / TASK-009）。
 *
 * - 「判断 / 理由 / アクション」3 ブロックを観点別に ◎ / ○ / △ で評価する純粋関数群。
 * - DoD §10-1（入力検証）: 空文字 / 想定外入力 / 不正な優先度はすべて安全側へフォールバック。
 * - DoD §10-2（XSS 防止）: 評価コメントは静的文字列のみで構成し、HTML を含めない。
 * - 評価ロジックはランダム性なし（同入力→同出力）。
 */

import { ACTION_KEYWORDS, REASON_KEYWORDS, countKeywordMatches } from './feedbackKeywords';
import type { WritingEntry } from './writing';

/** 評価スコア記号（3 段階）。 */
export type FeedbackScore = '◎' | '○' | '△';

/** 観点別の評価項目（カテゴリ名 / スコア / 定型コメント）。 */
export interface FeedbackItem {
  category: string;
  score: FeedbackScore;
  comment: string;
}

/** 記述全体のフィードバック（判断 / 理由 / アクション + 総合）。 */
export interface WritingFeedback {
  judgment: FeedbackItem;
  reason: FeedbackItem[];
  action: FeedbackItem[];
  overall: FeedbackScore;
}

/** "A" | "B" | "C" のいずれかなら true。 */
function isPriorityChar(c: string): c is 'A' | 'B' | 'C' {
  return c === 'A' || c === 'B' || c === 'C';
}

/** ユーザ記述から先頭に出現する A / B / C を抽出する（見つからなければ null）。 */
function extractPriority(text: string): 'A' | 'B' | 'C' | null {
  if (typeof text !== 'string' || text.length === 0) return null;
  const m = text.match(/[ABC]/);
  return m && isPriorityChar(m[0]) ? m[0] : null;
}

/** A=0 / B=1 / C=2 のインデックスに変換。 */
function priorityIndex(p: 'A' | 'B' | 'C'): number {
  return p === 'A' ? 0 : p === 'B' ? 1 : 2;
}

/**
 * 判断（A/B/C）の妥当性を評価する。
 * - 一致: ◎
 * - 1 段差（A↔B / B↔C）: ○
 * - 2 段差（A↔C）: △
 * - 抽出不可 / correctPriority 不正: △
 */
export function evaluateJudgment(userJudgment: string, correctPriority: string): FeedbackItem {
  const category = '判断';
  const correct = isPriorityChar(correctPriority) ? correctPriority : null;
  const user = extractPriority(userJudgment);

  if (correct === null || user === null) {
    return {
      category,
      score: '△',
      comment: '判断（A / B / C）が読み取れません。模範解答を確認してください。',
    };
  }
  const diff = Math.abs(priorityIndex(user) - priorityIndex(correct));
  if (diff === 0) {
    return { category, score: '◎', comment: '判断が正解と一致しています。' };
  }
  if (diff === 1) {
    return {
      category,
      score: '○',
      comment: '判断は概ね妥当ですが、優先度を再考してください。',
    };
  }
  return {
    category,
    score: '△',
    comment: '判断に大きなずれがあります。模範解答を確認してください。',
  };
}

/** 件数 → スコア（3+ 件: ◎ / 1〜2 件: ○ / 0 件: △）。 */
function countToScore(count: number): FeedbackScore {
  if (count >= 3) return '◎';
  if (count >= 1) return '○';
  return '△';
}

/** 観点ごとの定型コメント（◎ / ○ / △）。 */
function commentFor(category: string, score: FeedbackScore): string {
  if (score === '◎') return `${category}の観点が十分に盛り込まれています。`;
  if (score === '○') return `${category}の観点が一部含まれています。さらに具体化しましょう。`;
  return `${category}の観点が不足しています。記述を見直してください。`;
}

/**
 * 理由（reason）テキストを 5W1H / 優先度 / 論理 の 3 観点で評価する。
 * - 各観点でキーワード出現数を集計し、件数に応じて ◎ / ○ / △ を判定。
 */
export function evaluateReason(text: string): FeedbackItem[] {
  const safe = typeof text === 'string' ? text : '';
  return Object.entries(REASON_KEYWORDS).map(([category, keywords]) => {
    const count = countKeywordMatches(safe, keywords);
    const score = countToScore(count);
    return { category, score, comment: commentFor(category, score) };
  });
}

/**
 * アクション（action）テキストを 委任 / フォロー / 具体性 の 3 観点で評価する。
 * - 各観点でキーワード出現数を集計。
 * - テキスト長が 80 文字以上であれば +1 加点（具体的な記述を促す）。
 */
export function evaluateAction(text: string): FeedbackItem[] {
  const safe = typeof text === 'string' ? text : '';
  const lengthBonus = safe.length >= 80 ? 1 : 0;
  return Object.entries(ACTION_KEYWORDS).map(([category, keywords]) => {
    const matches = countKeywordMatches(safe, keywords);
    const effective = matches + lengthBonus;
    const score = countToScore(effective);
    return { category, score, comment: commentFor(category, score) };
  });
}

/** スコア→数値（平均算出用）。 */
function scoreToNum(s: FeedbackScore): number {
  return s === '◎' ? 2 : s === '○' ? 1 : 0;
}

/**
 * `WritingEntry` 全体を評価する。
 * - 判断 / 理由 / アクションの各観点を評価し、総合スコア（平均値ベース）を算出。
 * - avg >= 1.6: ◎ / avg >= 0.8: ○ / それ未満: △
 */
export function evaluateWriting(entry: WritingEntry, correctPriority: string): WritingFeedback {
  const judgment = evaluateJudgment(entry.judgment, correctPriority);
  const reason = evaluateReason(entry.reason);
  const action = evaluateAction(entry.action);

  const all = [judgment, ...reason, ...action];
  const avg = all.reduce((sum, it) => sum + scoreToNum(it.score), 0) / all.length;
  const overall: FeedbackScore = avg >= 1.6 ? '◎' : avg >= 0.8 ? '○' : '△';

  return { judgment, reason, action, overall };
}
