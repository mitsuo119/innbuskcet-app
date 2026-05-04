import type { Case, Priority } from '../domain/case';
import type { Judgement } from '../domain/judge';
import { PRIORITY_LABELS, formatPriorityLabel } from '../domain/priorityLabel';
import { renderExplanationWithPatternLinks } from '../utils/explanationPatternLinks';

interface Props {
  caseItem: Case;
  answer: Priority;
  judgement: Judgement;
  onRetry?: () => void;
}

/**
 * 採点結果と解説を表示する（PBI-035: A/B/C ラベル全画面統一表示）。
 * - 「あなたの回答 / 正解」表記は `priorityLabel.ts` の `PRIORITY_LABELS` を唯一の定義源として参照
 * - SR 読み上げは `aria-label` に `formatPriorityLabel`（例: 「A（最優先）即時着手すべき」）を格納
 * - onRetry が渡された場合、同一案件をもう一度解き直す導線を表示する。
 */
export function ExplanationView({ caseItem, answer, judgement, onRetry }: Props) {
  const isCorrect = judgement === 'correct';
  const answerLabel = PRIORITY_LABELS[answer];
  const correctLabel = PRIORITY_LABELS[caseItem.correctPriority];
  return (
    <section
      className={'explanation' + (isCorrect ? ' explanation--correct' : ' explanation--incorrect')}
      aria-live="polite"
    >
      <div className="explanation__header">
        <span className={'badge ' + (isCorrect ? 'badge--correct' : 'badge--incorrect')}>
          {isCorrect ? '正解' : '不正解'}
        </span>
        <span className="explanation__summary">
          あなたの回答:{' '}
          <strong aria-label={formatPriorityLabel(answer)}>
            {answer}（{answerLabel.name}）— {answerLabel.meaning}
          </strong>{' '}
          / 正解:{' '}
          <strong aria-label={formatPriorityLabel(caseItem.correctPriority)}>
            {caseItem.correctPriority}（{correctLabel.name}）— {correctLabel.meaning}
          </strong>
        </span>
      </div>
      <p className="explanation__body">{renderExplanationWithPatternLinks(caseItem.explanation)}</p>
      {onRetry && (
        <div className="explanation__actions">
          <button
            type="button"
            className="explanation__retry"
            onClick={onRetry}
            aria-label="同じ案件をもう一度解き直す"
          >
            もう一度この問題
          </button>
        </div>
      )}
    </section>
  );
}
