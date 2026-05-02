import { LEARNING_STYLES, type LearningStyle } from '../domain/learningStyle';

export interface LearningStyleToggleProps {
  /** 現在選択中の学習スタイル。 */
  style: LearningStyle;
  /** 選択変更時のコールバック（同値クリック時は呼ばない）。 */
  onChange: (style: LearningStyle) => void;
}

const ORDER: readonly LearningStyle[] = ['quick', 'deep', 'exam'] as const;

/**
 * 学習スタイル切替トグル（PBI-036 / PBI-027）。
 *
 * - セグメントコントロール形式（Quick / Deep / Exam の 3 ボタン）。
 * - 選択中ボタンに `aria-pressed="true"` を付与（DoD §9-3）。
 * - 親コンテナは `role="group"` + `aria-label="学習スタイル"`。
 * - キーボード: Tab で各ボタンに到達、Space/Enter で選択（HTML button 既定）。
 * - `dangerouslySetInnerHTML` 不使用（DoD §10-2）。
 */
export function LearningStyleToggle({ style, onChange }: LearningStyleToggleProps) {
  return (
    <div role="group" aria-label="学習スタイル" className="learning-style-toggle">
      {ORDER.map((key) => {
        const meta = LEARNING_STYLES[key];
        const selected = style === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={selected}
            aria-label={`${meta.label}：${meta.description}`}
            className={
              selected
                ? 'learning-style-toggle__btn learning-style-toggle__btn--selected'
                : 'learning-style-toggle__btn'
            }
            onClick={() => {
              if (!selected) onChange(key);
            }}
          >
            <span className="learning-style-toggle__label">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
