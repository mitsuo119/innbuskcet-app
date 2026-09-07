import type { FeedbackItem, FeedbackScore, WritingFeedback } from '../domain/feedback';

export interface FeedbackViewProps {
  /** 評価結果。null の場合は何も表示しない。 */
  feedback: WritingFeedback | null;
  /** 表示可否。false の場合は何も表示しない。 */
  visible: boolean;
}

/** 総合評価バッジ用の定型メッセージ。 */
const OVERALL_MESSAGE: Record<FeedbackScore, string> = {
  '◎': '照合の目安: 語句・形式の一致が多めです。',
  '○': '照合の目安: 語句・形式の一致が一部あります。',
  '△': '照合の目安: 語句・形式の一致が少なめです。',
};

/** スコア記号 → CSS 修飾子（◎=good / ○=ok / △=ng）。 */
function scoreModifier(score: FeedbackScore): string {
  return score === '◎' ? 'good' : score === '○' ? 'ok' : 'ng';
}

/** suggestion 行に付与する id を観点ごとに生成（aria-describedby 用）。 */
function suggestionId(category: string): string {
  return `feedback-suggestion-${category}`;
}

/**
 * 観点別評価項目を `<dl>` の dt/dd で描画する。
 * - dt: 観点名 + スコアバッジ
 * - dd: 定型コメント（テキストノードのみ・XSS 安全）
 * - △ 評価で `item.suggestion` が存在する場合のみ改善提案行を追加表示（PBI-040 / TASK-008）。
 *   `dangerouslySetInnerHTML` 不使用（DoD §10-2）/ aria-describedby で SR にも明示（DoD §9-3）。
 */
function FeedbackItemRow({ item }: { item: FeedbackItem }) {
  const mod = scoreModifier(item.score);
  const hasSuggestion = typeof item.suggestion === 'string' && item.suggestion.length > 0;
  const sid = hasSuggestion ? suggestionId(item.category) : undefined;
  return (
    <div className="feedback-view__item">
      <dt className="feedback-view__term">
        <span className="feedback-view__category">{item.category}</span>
        <span
          className={`feedback-view__score feedback-view__score--${mod}`}
          aria-label={`照合結果 ${item.score}`}
        >
          {item.score}
        </span>
      </dt>
      <dd className="feedback-view__desc" aria-describedby={sid}>
        {item.comment}
      </dd>
      {hasSuggestion && (
        <dd
          id={sid}
          className="feedback-view__suggestion"
          aria-label={`改善提案: ${item.suggestion}`}
        >
          <span className="feedback-view__suggestion-icon" aria-hidden="true">
            💡
          </span>
          <span className="feedback-view__suggestion-label">改善提案:</span>{' '}
          <span className="feedback-view__suggestion-text">{item.suggestion}</span>
        </dd>
      )}
    </div>
  );
}

/**
 * 記述のルールベース照合結果を表示するコンポーネント。
 *
 * - `visible=false` または `feedback=null` の場合は何も描画しない（null を返す）。
 * - 全体評価バッジ（◎ / ○ / △ + 定型メッセージ）+ 判断 1 行 + 理由 3 観点 + アクション 3 観点。
 * - DoD §10-2: テキストノードのみで構成し `dangerouslySetInnerHTML` 不使用（XSS 安全）。
 * - DoD §9-3: `<dl>` で観点と照合結果を意味的に対応付け。
 */
export function FeedbackView({ feedback, visible }: FeedbackViewProps) {
  if (!visible || feedback === null) return null;

  const overallMod = scoreModifier(feedback.overall);

  return (
    <section className="feedback-view" aria-label="記述の自動チェック">
      <header className="feedback-view__header">
        <h3 className="feedback-view__title">記述の自動チェック</h3>
        <p className="legal-note">
          語句・形式の照合結果です。文章の意味や正しさ、試験の得点は判定しません。
          <a href="/reference/chapter02">判定の前提と限界</a>
        </p>
        <div
          className={`feedback-view__overall feedback-view__overall--${overallMod}`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`feedback-view__overall-badge feedback-view__overall-badge--${overallMod}`}
            aria-label={`全体の照合結果 ${feedback.overall}`}
          >
            {feedback.overall}
          </span>
          <span className="feedback-view__overall-message">
            {OVERALL_MESSAGE[feedback.overall]}
          </span>
        </div>
      </header>

      <div className="feedback-view__block">
        <h4 className="feedback-view__block-title">判断</h4>
        <dl className="feedback-view__list">
          <FeedbackItemRow item={feedback.judgment} />
        </dl>
      </div>

      <div className="feedback-view__block">
        <h4 className="feedback-view__block-title">理由</h4>
        <dl className="feedback-view__list">
          {feedback.reason.map((item) => (
            <FeedbackItemRow key={`reason-${item.category}`} item={item} />
          ))}
        </dl>
      </div>

      <div className="feedback-view__block">
        <h4 className="feedback-view__block-title">アクション</h4>
        <dl className="feedback-view__list">
          {feedback.action.map((item) => (
            <FeedbackItemRow key={`action-${item.category}`} item={item} />
          ))}
        </dl>
      </div>
    </section>
  );
}
