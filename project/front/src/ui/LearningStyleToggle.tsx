import { type LearningStyle } from '../domain/learningStyle';
import { LEARNING_STYLE_LABELS } from '../domain/learningStyleLabel';

export interface LearningStyleToggleProps {
  /** 現在選択中の学習スタイル。 */
  style: LearningStyle;
  /** 選択変更時のコールバック（同値クリック時は呼ばない）。 */
  onChange: (style: LearningStyle) => void;
  /** 全ボタン無効化（Exam モード進行中の途中切替防止・PBI-027 / TASK-002）。 */
  disabled?: boolean;
}

const ORDER: readonly LearningStyle[] = ['quick', 'deep', 'exam'] as const;

/** ツールチップ用 hidden span の id（aria-describedby 参照先）。 */
function tooltipId(key: LearningStyle): string {
  return `learning-style-tooltip-${key}`;
}

/**
 * 学習スタイル切替トグル（PBI-036 / PBI-027 / PBI-036b）。
 *
 * - セグメントコントロール形式（Quick / Deep / Exam の 3 ボタン）。
 * - 選択中ボタンに `aria-pressed="true"` を付与（DoD §9-3）。
 * - 親コンテナは `role="group"` + `aria-label="学習スタイル"`。
 * - 各ボタンに `title` + `aria-describedby` でツールチップを提供（PBI-036b / TASK-010）。
 * - キーボード: Tab で各ボタンに到達、Space/Enter で選択（HTML button 既定）。
 * - `dangerouslySetInnerHTML` 不使用（DoD §10-2）。
 */
export function LearningStyleToggle({
  style,
  onChange,
  disabled = false,
}: LearningStyleToggleProps) {
  return (
    <div role="group" aria-label="学習スタイル" className="learning-style-toggle">
      {ORDER.map((key) => {
        const meta = LEARNING_STYLE_LABELS[key];
        const selected = style === key;
        const tip = meta.tooltip;
        const tid = tooltipId(key);
        return (
          <button
            key={key}
            type="button"
            aria-pressed={selected}
            aria-label={meta.ariaLabel}
            aria-describedby={tid}
            title={tip}
            disabled={disabled}
            className={
              selected
                ? 'learning-style-toggle__btn learning-style-toggle__btn--selected'
                : 'learning-style-toggle__btn'
            }
            onClick={() => {
              if (!selected && !disabled) onChange(key);
            }}
          >
            <span className="learning-style-toggle__label">{meta.label}</span>
            <span id={tid} className="learning-style-toggle__sr-only">
              {tip}
            </span>
          </button>
        );
      })}
    </div>
  );
}
