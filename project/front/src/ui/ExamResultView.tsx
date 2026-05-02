import { useMemo } from 'react';
import type { HistoryItem } from '../domain/history';
import { buildExamResultSummary, type ExamResultSummary } from '../domain/examResult';
import { getElapsedSeconds, type ExamSession } from '../domain/examTimer';
import { PRIORITY_LABELS } from '../domain/priorityLabel';
import type { Priority } from '../domain/case';

export interface ExamResultViewProps {
  /** 終了した Exam セッション（startedAt から所要時間を算出）。 */
  session: ExamSession;
  /** Exam セッション中の全問回答履歴（出題順）。 */
  history: readonly HistoryItem[];
  /** 「Deep で学習に戻る」押下時のコールバック。 */
  onBackToStudy: () => void;
}

/**
 * Exam モード終了時のスコア・振り返り画面（PBI-030 / Sprint008 TASK-002）。
 *
 * - 総合正答率／A・B・C 別正答率／所要時間／各問正誤の 4 ブロック構成。
 * - `dangerouslySetInnerHTML` 不使用（DoD §10-2）。
 * - ルート `section` に `aria-label="Exam結果"`（DoD §9-3）。
 * - 色だけに依存せず、○／× 記号と「正解／不正解」テキストを併記（DoD §9-2）。
 * - 集計は domain/examResult.ts の純粋関数 `buildExamResultSummary` に委譲する。
 */
export function ExamResultView({ session, history, onBackToStudy }: ExamResultViewProps) {
  const summary: ExamResultSummary = useMemo(() => {
    const correct = history.map((h) => h.correctPriority);
    const user = history.map<Priority>((h) => h.answeredPriority ?? h.correctPriority);
    // 履歴に answeredPriority が無い古いレコードでも整合させる。
    // judgement が 'incorrect' なら不正解扱いに矯正するため answered を「正解と異なる任意の優先度」に置換する。
    const adjusted = user.map((up, i) => {
      const item = history[i];
      if (item.answeredPriority) return up;
      if (item.judgement === 'correct') return item.correctPriority;
      // 不正解と判明しているが回答内容が不明の場合、A/B/C のうち正解と異なる先頭を返す。
      const candidates: Priority[] = ['A', 'B', 'C'];
      return candidates.find((p) => p !== item.correctPriority) ?? item.correctPriority;
    });
    const elapsed = getElapsedSeconds(session);
    return buildExamResultSummary(correct, adjusted, elapsed);
  }, [session, history]);

  const { totalQuestions, correctCount, percentage, elapsedDisplay, byPriority } = summary;

  return (
    <section
      className="exam-result"
      role="region"
      aria-label="Exam結果"
      aria-labelledby="exam-result-view-heading"
    >
      <h2 id="exam-result-view-heading" className="exam-result__heading">
        Exam 結果
      </h2>

      <dl className="exam-result__stats">
        <div className="exam-result__stat">
          <dt>総合正答率</dt>
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
        aria-labelledby="exam-result-view-breakdown-heading"
      >
        <h3 id="exam-result-view-breakdown-heading" className="exam-result__breakdown-heading">
          優先度別 正答率
        </h3>
        <dl className="exam-result__priority-list">
          {(['A', 'B', 'C'] as const).map((p) => {
            const label = PRIORITY_LABELS[p];
            const c = byPriority[p];
            const rate = c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0;
            return (
              <div key={p} className="exam-result__priority-row">
                <dt>
                  <span aria-hidden="true">{label.symbol}</span> {p}（{label.name}）
                </dt>
                <dd>
                  {c.correct} / {c.total}（{rate}%）
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="exam-result__answers" aria-labelledby="exam-result-view-answers-heading">
        <h3 id="exam-result-view-answers-heading" className="exam-result__breakdown-heading">
          各問の正誤
        </h3>
        {history.length === 0 ? (
          <p className="exam-result__empty">回答履歴がありません。</p>
        ) : (
          <ol className="exam-result__answer-list">
            {history.map((item, index) => {
              const correctLabel = PRIORITY_LABELS[item.correctPriority];
              const answered = item.answeredPriority;
              const answeredLabel = answered ? PRIORITY_LABELS[answered] : null;
              const judgementMark = item.judgement === 'correct' ? '○' : '×';
              const judgementText = item.judgement === 'correct' ? '正解' : '不正解';
              return (
                <li
                  key={`${item.caseId}-${index}`}
                  className={
                    'exam-result__answer-row ' +
                    (item.judgement === 'correct'
                      ? 'exam-result__answer-row--correct'
                      : 'exam-result__answer-row--incorrect')
                  }
                  aria-label={`第${index + 1}問 ${judgementText} 回答${
                    answered ? answered : '未回答'
                  } 正解${item.correctPriority}（${correctLabel.name}）`}
                >
                  <span className="exam-result__answer-no">第{index + 1}問</span>
                  <span className="exam-result__answer-mark" aria-hidden="true">
                    {judgementMark}
                  </span>
                  <span className="exam-result__answer-text">{judgementText}</span>
                  <span className="exam-result__answer-priority">
                    回答: {answered ? `${answered}（${answeredLabel?.name ?? ''}）` : '未回答'}
                  </span>
                  <span className="exam-result__answer-priority">
                    正解: {item.correctPriority}（{correctLabel.name}）
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="exam-result__actions">
        <button
          type="button"
          className="exam-result__btn exam-result__btn--primary"
          onClick={onBackToStudy}
        >
          Deep で学習に戻る
        </button>
      </div>
    </section>
  );
}
