/**
 * 出題モード（FilterMode）表示ラベルの単一定義源（PBI-042 / TASK-008）。
 *
 * - UI コンポーネント（ModeSelector / ScoreCounter など）が同じ表示文言・aria 文言を
 *   重複定義せず、ここを参照することで唯一定義源を維持する。
 * - 現在の `ModeSelector.tsx` の `labelOf` / `ariaOf` の文言と一致させる。
 */
import type { FilterMode } from './random';

/** FilterMode 1 件分の表示メタ。 */
export interface FilterModeLabel {
  /** ボタン等に表示する短いラベル（例: "全件" / "Aのみ"）。 */
  readonly label: string;
  /** スクリーンリーダ向け aria-label（例: "全件から出題"）。 */
  readonly aria: string;
}

/**
 * FilterMode → 表示ラベル のマップ（PBI-042 / TASK-008）。
 *
 * 文言は現行 `ModeSelector.tsx` と一致：
 * - all : "全件" / "全件から出題"
 * - A/B/C : "{P}のみ" / "優先度{P}のみ出題"
 */
export const FILTER_MODE_LABELS: Readonly<Record<FilterMode, FilterModeLabel>> = {
  all: { label: '全件', aria: '全件から出題' },
  A: { label: 'Aのみ', aria: '優先度Aのみ出題' },
  B: { label: 'Bのみ', aria: '優先度Bのみ出題' },
  C: { label: 'Cのみ', aria: '優先度Cのみ出題' },
} as const;
