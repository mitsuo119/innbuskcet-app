interface Props {
  answerCount: number;
  selfScoreCount: number;
  saveFailed: boolean;
  onClear: () => void;
}

/** ブラウザに保存した学習記録の案内と消去（PBI-107）。 */
export function LearningRecordPanel({ answerCount, selfScoreCount, saveFailed, onClear }: Props) {
  return (
    <section className="learning-record" aria-labelledby="learning-record-heading">
      <h2 id="learning-record-heading" className="learning-record__title">
        学習記録
      </h2>
      <p className="learning-record__text">
        回答の記録（案件・選んだ優先度・正誤・学習スタイル）と自己採点は、このブラウザに保存されます。記述欄の入力文は学習記録に含めません。
      </p>
      <p className="learning-record__count">
        回答 {answerCount} 件／自己採点 {selfScoreCount} 件
      </p>
      {saveFailed && (
        <p className="learning-record__warning" role="status">
          このブラウザでは学習記録を保存できませんでした。演習は続けられますが、ページを閉じると記録は消えます。
        </p>
      )}
      <div className="learning-record__actions">
        <button
          type="button"
          className="learning-record__clear"
          onClick={onClear}
          disabled={answerCount === 0 && selfScoreCount === 0}
        >
          学習記録を消去
        </button>
        <a href="/privacy-policy/" className="home-about__link">
          保存する項目と消去の方法
        </a>
      </div>
    </section>
  );
}
