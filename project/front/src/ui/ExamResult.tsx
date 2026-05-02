import type { ExamResultSummary } from '../domain/examResult';
import { PRIORITY_LABELS } from '../domain/priorityLabel';

export interface ExamResultProps {
  /** Exam 結果サマリ（buildExamResultSummary の戻り値）。 */
  summary: ExamResultSummary;
  /** 「もう一度チャレンジ」押下時のコールバック。 */
  onRestart: () => void;
  /** 「トップへ戻る」押下時のコールバック（任意・未指定時はボタン非表示）。 */
  onBackToTop?: () => void;
}

/**
 * Exam 結果画面（PBI-030 / TASK-001）。
 *
 * - 正答率（%・分子/分母）/ 所要時間（mm:ss）/ 優先度（A/B/C）別正答数の 3 ブロック構成。
 * - `dangerouslySetInnerHTML` 不使用（DoD §10-2）。
 * - role="region" + aria-labelledby で見出しに紐付け（DoD §9-3）。
 * - 色だけに依存しないテキスト併記（DoD §9-2）。
 *
 * NOTE (DAY1): 基本構造のみ。モバイル幅対応（TASK-003）/ a11y 仕上げ（TASK-006）/
 * App.tsx 統合（TASK-005）は DAY2 以降で順次実施。
 */
export function ExamResult({ summary, onRestart, onBackToTop }: ExamResultProps) {
  const { totalQuestions, correctCount, percentage, elapsedDisplay, byPriority } = summary;

  return (
    <section
      className="exam-result"
      role="region"
      aria-labelledby="exam-result-heading"
    >
      <h2 id="exam-result-heading" className="exam-result__heading">
        Exam 結果
      </h2>

      <dl className="exam-result__stats">
        <div className="exam-result__stat">
          <dt>正答率</dt>
          <dd>
            <strong>{percentage}%</strong>
            <span className="exam-result__sub">
              （{correctCount} / {totalQuestions} 問）
            </span>
          </dd>
        </div>
        <div className="exam-result__stat">
          <dt>所要時間</dt>
          <dd>
            <strong>{elapsedDisplay}</strong>
          </dd>
        </div>
      </dl>

      <section
        className="exam-result__breakdown"
        aria-labelledby="exam-result-breakdown-heading"
      >
        <h3
          id="exam-result-breakdown-heading"
          className="exam-result__breakdown-heading"
        >
          優先度別 正答数
        </h3>
        <dl className="exam-result__priority-list">
          {(['A', 'B', 'C'] as const).map((p) => {
            const label = PRIORITY_LABELS[p];
            const c = byPriority[p];
            return (
              <div key={p} className="exam-result__priority-row">
                <dt>
                  <span aria-hidden="true">{label.symbol}</span>{' '}
                  {p}（{label.name}）
                </dt>
                <dd>
                  {c.correct} / {c.total}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <div className="exam-result__actions">
        <button
          type="button"
          className="exam-result__btn exam-result__btn--primary"
          onClick={onRestart}
        >
          もう一度チャレンジ
        </button>
        {onBackToTop && (
          <button
            type="button"
            className="exam-result__btn"
            onClick={onBackToTop}
          >
            トップへ戻る
          </button>
        )}
      </div>
    </section>
  );
}
