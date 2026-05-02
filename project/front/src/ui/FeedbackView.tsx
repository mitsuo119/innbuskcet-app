import type { FeedbackItem, FeedbackScore, WritingFeedback } from '../domain/feedback';

export interface FeedbackViewProps {
  /** 評価結果。null の場合は何も表示しない。 */
  feedback: WritingFeedback | null;
  /** 表示可否。false の場合は何も表示しない。 */
  visible: boolean;
}

/** 総合評価バッジ用の定型メッセージ。 */
const OVERALL_MESSAGE: Record<FeedbackScore, string> = {
  '◎': '総合評価: 優秀。判断・理由・アクションの観点が十分に揃っています。',
  '○': '総合評価: 良好。観点は概ね揃っていますが、さらに具体化の余地があります。',
  '△': '総合評価: 改善の余地あり。模範解答を参考に観点を補強してください。',
};

/** スコア記号 → CSS 修飾子（◎=good / ○=ok / △=ng）。 */
function scoreModifier(score: FeedbackScore): string {
  return score === '◎' ? 'good' : score === '○' ? 'ok' : 'ng';
}

/**
 * 観点別評価項目を `<dl>` の dt/dd で描画する。
 * - dt: 観点名 + スコアバッジ
 * - dd: 定型コメント（テキストノードのみ・XSS 安全）
 */
function FeedbackItemRow({ item }: { item: FeedbackItem }) {
  const mod = scoreModifier(item.score);
  return (
    <div className="feedback-view__item">
      <dt className="feedback-view__term">
        <span className="feedback-view__category">{item.category}</span>
        <span
          className={`feedback-view__score feedback-view__score--${mod}`}
          aria-label={`評価 ${item.score}`}
        >
          {item.score}
        </span>
      </dt>
      <dd className="feedback-view__desc">{item.comment}</dd>
    </div>
  );
}

/**
 * AI 評価フィードバック表示コンポーネント（PBI-029 / TASK-010）。
 *
 * - `visible=false` または `feedback=null` の場合は何も描画しない（null を返す）。
 * - 全体評価バッジ（◎ / ○ / △ + 定型メッセージ）+ 判断 1 行 + 理由 3 観点 + アクション 3 観点。
 * - DoD §10-2: テキストノードのみで構成し `dangerouslySetInnerHTML` 不使用（XSS 安全）。
 * - DoD §9-3: `aria-label="AI評価フィードバック"` をセクションに付与。`<dl>` で観点と評価を意味的に対応付け。
 */
export function FeedbackView({ feedback, visible }: FeedbackViewProps) {
  if (!visible || feedback === null) return null;

  const overallMod = scoreModifier(feedback.overall);

  return (
    <section className="feedback-view" aria-label="AI評価フィードバック">
      <header className="feedback-view__header">
        <h3 className="feedback-view__title">AI 評価フィードバック</h3>
        <div
          className={`feedback-view__overall feedback-view__overall--${overallMod}`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`feedback-view__overall-badge feedback-view__overall-badge--${overallMod}`}
            aria-label={`総合評価 ${feedback.overall}`}
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
