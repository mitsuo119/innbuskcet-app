/**
 * 学習スタイル（PBI-036）。
 *
 * - `quick`: 優先順位（A/B/C）のみ回答する隙間時間学習用フロー。
 * - `deep`: 記述あり（じっくり練習）。本格的な合格答案の型を反復する現行フロー。
 *
 * `exam` は本試験形式（時間制限・連続出題）として将来拡張予定。
 * UI 上はグレイアウト表示で存在のみ示し、型レベルでは現時点では含めない。
 */
export type LearningStyle = 'quick' | 'deep';

/** UI 表示用メタ情報。 */
export interface LearningStyleMeta {
  readonly label: string;
  readonly description: string;
}

/** Quick / Deep の表示メタ（DoD §3 / §7）。 */
export const LEARNING_STYLES: Readonly<Record<LearningStyle, LearningStyleMeta>> = {
  quick: {
    label: 'Quick',
    description: '優先順位のみ回答（隙間時間用）',
  },
  deep: {
    label: 'Deep',
    description: '記述あり（じっくり練習）',
  },
} as const;

/** 不正値検出時のフォールバック既定値（PO 合意）。 */
const DEFAULT_LEARNING_STYLE: LearningStyle = 'deep';

/** localStorage キー（DoD §10-3 適用範囲）。 */
const STORAGE_KEY = 'inbasket.learningStyle.v1';

function isLearningStyle(value: unknown): value is LearningStyle {
  return value === 'quick' || value === 'deep';
}

/**
 * localStorage から学習スタイルを読み込む。
 * - キー未設定 / 不正値 / storage 不可 はすべて `'deep'` にフォールバック。
 */
export function loadLearningStyle(): LearningStyle {
  if (typeof window === 'undefined') return DEFAULT_LEARNING_STYLE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_LEARNING_STYLE;
    return isLearningStyle(raw) ? raw : DEFAULT_LEARNING_STYLE;
  } catch {
    // プライベートモード等で localStorage が無効な環境でもアプリは継続稼働させる。
    return DEFAULT_LEARNING_STYLE;
  }
}

/**
 * 学習スタイルを localStorage へ保存する。
 * storage 不可環境では黙って失敗（呼び出し側でクラッシュさせない）。
 */
export function saveLearningStyle(style: LearningStyle): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, style);
  } catch {
    // no-op
  }
}

/** Deep モード（記述あり）かどうかを判定する純粋関数。 */
export function isDeepMode(style: LearningStyle): boolean {
  return style === 'deep';
}
