/**
 * A/B/C 優先度ラベル定義（PBI-035）。
 *
 * 全画面（AnswerButtons / ExplanationView / HistoryView / ModelAnswerView）で
 * 同一の表記（記号・名称・意味）を使うための唯一の定義源（DRY）。
 */

import type { Priority } from './case';

/** 優先度キー（A/B/C） */
export type PriorityKey = Priority;

/** 優先度ラベル（記号・名称・意味の 3 要素） */
export interface PriorityLabel {
  /** 色非依存の識別記号（DoD §9-2） */
  symbol: string;
  /** 優先度の名称 */
  name: string;
  /** 1 行の意味（判断軸の補足） */
  meaning: string;
}

/**
 * 優先度ラベルの定数定義。
 * 本ファイルが唯一の定義源であり、全画面でこの定数を参照する。
 */
export const PRIORITY_LABELS: Readonly<Record<PriorityKey, PriorityLabel>> = {
  A: { symbol: '◎', name: '最優先', meaning: '即時着手すべき' },
  B: { symbol: '○', name: '中優先', meaning: '重要だが緊急ではない' },
  C: { symbol: '△', name: '低優先', meaning: 'リソースが余れば対応' },
} as const;

/**
 * 優先度キーに対応するラベルオブジェクトを返す（純粋関数）。
 */
export function getPriorityLabel(key: PriorityKey): PriorityLabel {
  return PRIORITY_LABELS[key];
}

/**
 * 優先度キーを「A（最優先）即時着手すべき」形式の文字列で返す（純粋関数）。
 */
export function formatPriorityLabel(key: PriorityKey): string {
  const label = PRIORITY_LABELS[key];
  return `${key}（${label.name}）${label.meaning}`;
}
