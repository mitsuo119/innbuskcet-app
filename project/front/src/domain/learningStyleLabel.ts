/**
 * 学習スタイル（LearningStyle）表示ラベルの単一定義源（PBI-042 / TASK-008）。
 *
 * - UI コンポーネント（LearningStyleToggle 等）が表示文言・ツールチップ・aria-label を
 *   重複定義せず、ここを参照する。
 * - 現在の `LearningStyleToggle.tsx` の `TOOLTIPS` および `LEARNING_STYLES`（label/description）
 *   と一致させる。aria-label は現行実装の `${label}：${description} — ${tooltip}` 形式を踏襲。
 */
import { LEARNING_STYLES, type LearningStyle } from './learningStyle';

/** LearningStyle 1 件分の表示メタ。 */
export interface LearningStyleLabel {
  /** セグメントボタン等に表示する短いラベル（例: "Quick"）。 */
  readonly label: string;
  /** ホバー / aria-describedby で表示する補助説明（PBI-036b）。 */
  readonly tooltip: string;
  /** 単独で読まれるスクリーンリーダ向け aria-label（label + description + tooltip 連結）。 */
  readonly ariaLabel: string;
}

/** ツールチップ文言（現行 `LearningStyleToggle.tsx` の TOOLTIPS と一致）。 */
const TOOLTIPS: Readonly<Record<LearningStyle, string>> = {
  quick: '速習モード: 解答のみ・優先度判断の練習（約5分/問）',
  deep: 'じっくりモード: 記述あり・模範解答と比較（約10分/問）',
  exam: '模試モード: 20問90分・本番形式で実力測定',
} as const;

const buildAriaLabel = (key: LearningStyle): string => {
  const meta = LEARNING_STYLES[key];
  return `${meta.label}：${meta.description} — ${TOOLTIPS[key]}`;
};

/** LearningStyle → 表示ラベル のマップ（PBI-042 / TASK-008）。 */
export const LEARNING_STYLE_LABELS: Readonly<Record<LearningStyle, LearningStyleLabel>> = {
  quick: {
    label: LEARNING_STYLES.quick.label,
    tooltip: TOOLTIPS.quick,
    ariaLabel: buildAriaLabel('quick'),
  },
  deep: {
    label: LEARNING_STYLES.deep.label,
    tooltip: TOOLTIPS.deep,
    ariaLabel: buildAriaLabel('deep'),
  },
  exam: {
    label: LEARNING_STYLES.exam.label,
    tooltip: TOOLTIPS.exam,
    ariaLabel: buildAriaLabel('exam'),
  },
} as const;
