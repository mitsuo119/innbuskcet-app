import { LEARNING_STYLES, type LearningStyle } from '../domain/learningStyle';

export interface LearningStyleToggleProps {
  /** 現在選択中の学習スタイル。 */
  style: LearningStyle;
  /** 選択変更時のコールバック（同値クリック時は呼ばない）。 */
  onChange: (style: LearningStyle) => void;
  /** 全ボタン無効化（Exam モード進行中の途中切替防止・PBI-027 / TASK-002）。 */
  disabled?: boolean;
}

const ORDER: readonly LearningStyle[] = ['quick', 'deep', 'exam'] as const;

/**
 * 各ボタンに表示するツールチップ説明（PBI-036b / TASK-010）。
 * - `title` 属性: ホバー / 長押しで表示（デスクトップ・一部モバイル）。
 * - `aria-describedby` 経由で hidden span を参照しスクリーンリーダにも明示。
 * - `aria-label` の末尾にも同内容を含めることで touch デバイス（title 非表示環境）にもフォールバック対応。
 */
const TOOLTIPS: Readonly<Record<LearningStyle, string>> = {
  quick: '速習モード: 解答のみ・優先度判断の練習（約5分/問）',
  deep: 'じっくりモード: 記述あり・模範解答と比較（約10分/問）',
  exam: '模試モード: 20問90分・本番形式で実力測定',
} as const;

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
        const meta = LEARNING_STYLES[key];
        const selected = style === key;
        const tip = TOOLTIPS[key];
        const tid = tooltipId(key);
        return (
          <button
            key={key}
            type="button"
            aria-pressed={selected}
            aria-label={`${meta.label}：${meta.description} — ${tip}`}
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
