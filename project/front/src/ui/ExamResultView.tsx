import { useMemo, useState } from 'react';
import type { HistoryItem } from '../domain/history';
import { buildExamResultSummary, type ExamResultSummary } from '../domain/examResult';
import { EXAM_TIME_LIMIT_SECONDS, getElapsedSeconds, type ExamSession } from '../domain/examTimer';
import { PRIORITY_LABELS } from '../domain/priorityLabel';
import type { Case, Priority } from '../domain/case';
import { renderExplanationWithPatternLinks } from '../utils/explanationPatternLinks';

const TIMELINE_TOTAL_MS = EXAM_TIME_LIMIT_SECONDS * 1000;
const TIMELINE_SLOW_MS = 5 * 60 * 1000;

function formatTimelineElapsed(ms: number | null): string {
  if (ms === null) return '-';
  const totalSeconds = Math.floor(ms / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

export interface ExamResultViewProps {
  /** 終了した Exam セッション（startedAt から所要時間を算出）。 */
  session: ExamSession;
  /** Exam セッション中の全問回答履歴（出題順）。 */
  history: readonly HistoryItem[];
  /**
   * 各設問の所要時間（ms 配列・出題順・PBI-044）。
   * - history と同一インデックスで対応する。
   * - 未指定または該当要素が undefined の場合は「-」フォールバック表示。
   */
  elapsedMsList?: readonly number[];
  /** 「Deep で学習に戻る」押下時のコールバック。 */
  onBackToStudy: () => void;
  /**
   * 詳細パネル参照用の全案件配列（PBI-043 / Sprint010 TASK-401・402）。
   * 未指定の場合は詳細パネルは「案件詳細未取得」のフォールバックを表示する。
   */
  cases?: readonly Case[];
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
export function ExamResultView({
  session,
  history,
  elapsedMsList,
  onBackToStudy,
  cases,
}: ExamResultViewProps) {
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

  /** PBI-053: Exam90分ミニタイムライン（設問別 elapsedMs 可視化）。 */
  const timelineItems = useMemo(
    () =>
      history.map((item, index) => {
        const rawElapsed = elapsedMsList?.[index];
        const elapsedMs =
          typeof rawElapsed === 'number' && Number.isFinite(rawElapsed) && rawElapsed >= 0
            ? rawElapsed
            : null;
        const clampedMs = elapsedMs === null ? 0 : Math.min(elapsedMs, TIMELINE_TOTAL_MS);
        const widthPercent = Math.max(0, Math.min(100, (clampedMs / TIMELINE_TOTAL_MS) * 100));
        const isSlow = elapsedMs !== null && elapsedMs > TIMELINE_SLOW_MS;
        const isOverTotal = elapsedMs !== null && elapsedMs > TIMELINE_TOTAL_MS;
        const elapsedText = formatTimelineElapsed(elapsedMs);
        const statusText =
          elapsedMs === null
            ? '所要時間未取得'
            : `${elapsedText}${isSlow ? '・5分超' : ''}${isOverTotal ? '・90分超過' : ''}`;
        return {
          key: `${item.caseId}-${index}`,
          questionNo: index + 1,
          widthPercent,
          isSlow,
          isOverTotal,
          elapsedText,
          ariaLabel: `第${index + 1}問 ${statusText}`,
        };
      }),
    [history, elapsedMsList],
  );

  /** 各問の caseId から Case を引くためのマップ（PBI-043）。 */
  const casesById = useMemo<ReadonlyMap<string, Case>>(() => {
    const m = new Map<string, Case>();
    for (const c of cases ?? []) m.set(c.id, c);
    return m;
  }, [cases]);

  /** 詳細パネルを開いている行のインデックス（同時に1行のみ展開）。 */
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };
  /**
   * PBI-054: 前後問遷移後に新しい詳細パネル先頭（見出し）へフォーカス移動する。
   * - キーボード利用時の現在位置喪失を防止（DoD §9-2 / §9-3）。
   */
  const focusDetailHeading = (index: number) => {
    queueMicrotask(() => {
      const heading = document.getElementById(`exam-result-detail-heading-${index}`);
      if (heading instanceof HTMLElement) heading.focus();
    });
  };
  /**
   * PBI-054: 詳細パネルを閉じずに隣接する設問詳細へ遷移する。
   * - 先頭/末尾は何もしない（ボタン disabled と二重防御）。
   */
  const moveDetail = (fromIndex: number, direction: -1 | 1) => {
    const target = fromIndex + direction;
    if (target < 0 || target >= history.length) return;
    setExpandedIndex(target);
    focusDetailHeading(target);
  };
  /**
   * PBI-048: 詳細パネルを閉じてフォーカスをトグルボタンへ戻す。
   * - 「結果一覧に戻る」ボタン押下／Escape キー押下時に呼び出す。
   * - DoD §9-1（キーボード完結）／§9-2（フォーカス可視）整合。
   */
  const closeDetail = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : prev));
    // setState 後の DOM 更新を待ってフォーカスを戻す。
    queueMicrotask(() => {
      const btn = document.getElementById(`exam-result-detail-toggle-${index}`);
      if (btn instanceof HTMLButtonElement) btn.focus();
    });
  };

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

      <section className="exam-result__timeline" aria-labelledby="exam-result-view-timeline-heading">
        <h3 id="exam-result-view-timeline-heading" className="exam-result__breakdown-heading">
          Exam 90分ミニタイムライン
        </h3>
        <ol className="exam-result__timeline-list" aria-label="設問ごとの所要時間タイムライン">
          {timelineItems.map((item) => (
            <li key={item.key} className="exam-result__timeline-row" aria-label={item.ariaLabel}>
              <span className="exam-result__timeline-no">Q{item.questionNo}</span>
              <div className="exam-result__timeline-track" aria-hidden="true">
                <div
                  className={
                    'exam-result__timeline-fill' +
                    (item.isSlow ? ' exam-result__timeline-fill--slow' : '') +
                    (item.isOverTotal ? ' exam-result__timeline-fill--over' : '')
                  }
                  style={{ width: `${item.widthPercent}%` }}
                />
              </div>
              <div className="exam-result__timeline-meta">
                <span className="exam-result__timeline-time">{item.elapsedText}</span>
                {item.isSlow && (
                  <span className="exam-result__timeline-badge" title="5分超">
                    ⚠ 5分超
                  </span>
                )}
                {item.isOverTotal && (
                  <span className="exam-result__timeline-badge exam-result__timeline-badge--over" title="90分超過">
                    ⏱ 90分超過
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
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
              const isExpanded = expandedIndex === index;
              const panelId = `exam-result-detail-${index}`;
              const buttonId = `exam-result-detail-toggle-${index}`;
              const caseItem = casesById.get(item.caseId);
              // PBI-044: 設問別所要時間（ms → 秒表示）。未保有時は「-」フォールバック。
              const rawElapsedMs = elapsedMsList?.[index];
              const hasElapsed =
                typeof rawElapsedMs === 'number' &&
                Number.isFinite(rawElapsedMs) &&
                rawElapsedMs >= 0;
              const elapsedSeconds = hasElapsed ? Math.floor(rawElapsedMs / 1000) : null;
              const elapsedDisplayText = elapsedSeconds !== null ? `${elapsedSeconds}秒` : '-';
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
                  <div className="exam-result__answer-summary">
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
                    <span
                      className="exam-result__answer-elapsed"
                      aria-label={
                        elapsedSeconds !== null
                          ? `所要時間 ${elapsedSeconds} 秒`
                          : '所要時間 未取得'
                      }
                    >
                      所要: {elapsedDisplayText}
                    </span>
                    <button
                      type="button"
                      id={buttonId}
                      className="exam-result__detail-toggle"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => toggleExpand(index)}
                    >
                      {isExpanded ? '閉じる' : '詳細を見る'}
                    </button>
                  </div>
                  {isExpanded && (
                    <section
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="exam-result__detail-panel"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          closeDetail(index);
                        }
                      }}
                    >
                      {caseItem ? (
                        <>
                          <h4
                            id={`exam-result-detail-heading-${index}`}
                            className="exam-result__detail-heading"
                            tabIndex={-1}
                          >
                            {caseItem.title}
                          </h4>
                          <p className="exam-result__detail-body">{caseItem.body}</p>
                          <dl className="exam-result__detail-meta">
                            <div>
                              <dt>あなたの回答</dt>
                              <dd>
                                {answered
                                  ? `${answered}（${answeredLabel?.name ?? ''}）`
                                  : '未回答'}
                              </dd>
                            </div>
                            <div>
                              <dt>正解</dt>
                              <dd>
                                {item.correctPriority}（{correctLabel.name}）
                              </dd>
                            </div>
                          </dl>
                          <section className="exam-result__detail-explanation" aria-label="解説">
                            <h5>解説</h5>
                            <p>{renderExplanationWithPatternLinks(caseItem.explanation)}</p>
                          </section>
                          <section className="exam-result__detail-model" aria-label="模範解答">
                            <h5>模範解答（骨格）</h5>
                            {caseItem.modelAnswer ? (
                              <dl>
                                <div>
                                  <dt>判断</dt>
                                  <dd>{caseItem.modelAnswer.judgment}</dd>
                                </div>
                                <div>
                                  <dt>理由</dt>
                                  <dd>{caseItem.modelAnswer.reason}</dd>
                                </div>
                                <div>
                                  <dt>アクション</dt>
                                  <dd>{caseItem.modelAnswer.action}</dd>
                                </div>
                              </dl>
                            ) : (
                              <p className="exam-result__detail-fallback">
                                模範解答準備中（この案件はまだ模範回答骨格が整備されていません）
                              </p>
                            )}
                          </section>
                        </>
                      ) : (
                        <p className="exam-result__detail-fallback">
                          案件詳細を取得できませんでした（caseId: {item.caseId}）
                        </p>
                      )}
                      <div className="exam-result__detail-actions">
                        <div className="exam-result__detail-nav">
                          <button
                            type="button"
                            className="exam-result__detail-prev"
                            onClick={() => moveDetail(index, -1)}
                            disabled={index === 0}
                            aria-disabled={index === 0}
                          >
                            前の問へ
                          </button>
                          <button
                            type="button"
                            className="exam-result__detail-next"
                            onClick={() => moveDetail(index, 1)}
                            disabled={index === history.length - 1}
                            aria-disabled={index === history.length - 1}
                          >
                            次の問へ
                          </button>
                        </div>
                        <button
                          type="button"
                          className="exam-result__detail-back"
                          onClick={() => closeDetail(index)}
                        >
                          結果一覧に戻る
                        </button>
                      </div>
                    </section>
                  )}
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
