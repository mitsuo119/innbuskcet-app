import type { Case, Priority } from '../domain/case';
import type { Judgement } from '../domain/judge';

interface Props {
  caseItem: Case;
  answer: Priority;
  judgement: Judgement;
  onRetry?: () => void;
}

/**
 * 採点結果と解説を表示する。
 * onRetry が渡された場合、同一案件をもう一度解き直す導線を表示する。
 */
export function ExplanationView({ caseItem, answer, judgement, onRetry }: Props) {
  const isCorrect = judgement === 'correct';
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
          あなたの回答: <strong>{answer}</strong> / 正解:{' '}
          <strong>{caseItem.correctPriority}</strong>
        </span>
      </div>
      <p className="explanation__body">{caseItem.explanation}</p>
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
