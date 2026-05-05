import { useState } from 'react';
import {
  SELF_SCORE_AXES,
  AXIS_META,
  createDefaultSelfScoreEntry,
  clampSelfScore,
  type SelfScoreEntry,
  type SelfScoreAxis,
  type SelfScore,
} from '../domain/selfScore';

interface Props {
  /** 採点完了コールバック（採点結果を引数で渡す） */
  onSubmit: (entry: SelfScoreEntry) => void;
  /** スキップコールバック（採点しないで次へ進む） */
  onSkip: () => void;
}

/**
 * PBI-025: 6軸自己採点入力UI（TASK-251）
 *
 * 回答後に表示し、6軸（問題発見/分析/意思決定/洞察/組織活用/ヒューマンスキル）を
 * 1〜5で自己採点する入力フォーム。スキップ可能。
 */
export function SelfScoreInput({ onSubmit, onSkip }: Props) {
  const [scores, setScores] = useState<SelfScoreEntry>(createDefaultSelfScoreEntry);

  const handleChange = (axis: SelfScoreAxis, value: number) => {
    const clamped = clampSelfScore(value);
    setScores((prev) => ({ ...prev, [axis]: clamped }));
  };

  const handleSubmit = () => {
    onSubmit(scores);
  };

  return (
    <section
      className="self-score-input"
      aria-label="6軸自己採点"
      aria-live="polite"
    >
      <h3 className="self-score-input__title">自己採点（任意）</h3>
      <p className="self-score-input__desc">
        今回の回答を6軸で自己評価してください。1（低い）〜5（高い）で選択。
      </p>
      <div className="self-score-input__grid">
        {SELF_SCORE_AXES.map((axis) => {
          const meta = AXIS_META[axis];
          const currentScore = scores[axis];
          return (
            <div key={axis} className="self-score-input__row">
              <div className="self-score-input__axis-info">
                <span className="self-score-input__axis-label">{meta.label}</span>
                <span className="self-score-input__axis-desc">{meta.description}</span>
              </div>
              {/* aria-label にテキスト形式のスコアを含めてスクリーンリーダー対応（DoD §9-3） */}
              <div
                className="self-score-input__stars"
                role="group"
                aria-label={`${meta.label}: 現在のスコア ${currentScore}`}
              >
                {([1, 2, 3, 4, 5] as SelfScore[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={
                      'self-score-input__star' +
                      (n <= currentScore ? ' self-score-input__star--active' : '')
                    }
                    onClick={() => handleChange(axis, n)}
                    aria-label={`${meta.label} ${n}点`}
                    aria-pressed={n === currentScore}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="self-score-input__actions">
        <button
          type="button"
          className="self-score-input__skip"
          onClick={onSkip}
          aria-label="自己採点をスキップして次へ進む"
        >
          スキップ
        </button>
        <button
          type="button"
          className="self-score-input__submit"
          onClick={handleSubmit}
          aria-label="自己採点を記録する"
        >
          採点を記録
        </button>
      </div>
    </section>
  );
}
