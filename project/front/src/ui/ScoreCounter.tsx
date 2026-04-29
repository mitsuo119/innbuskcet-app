import type { Score } from '../domain/score';

interface Props {
  score: Score;
}

/**
 * セッション内の正答/出題カウンタ表示。常時表示・初期 0/0。
 */
export function ScoreCounter({ score }: Props) {
  return (
    <div className="score-counter" aria-live="polite" aria-label="正答数 / 出題数">
      <span className="score-counter__label">正答 / 出題</span>
      <span className="score-counter__value">
        <strong>{score.correct}</strong>
        <span className="score-counter__sep"> / </span>
        <strong>{score.total}</strong>
      </span>
    </div>
  );
}
