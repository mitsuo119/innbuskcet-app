/**
 * PBI-025: 6軸自己採点ドメインロジック
 *
 * 6軸（問題発見/分析/意思決定/洞察/組織活用/ヒューマンスキル）を
 * 1〜5で自己採点し、セッション内の平均をレーダーチャートで可視化する。
 */

/** 6軸の識別子（型安全な const タプル） */
export const SELF_SCORE_AXES = [
  'problemDiscovery',
  'analysis',
  'decisionMaking',
  'insight',
  'orgUtilization',
  'humanSkill',
] as const;

export type SelfScoreAxis = (typeof SELF_SCORE_AXES)[number];

/** 各軸のメタ情報 */
export interface AxisMeta {
  /** 表示ラベル（短縮形） */
  label: string;
  /** 採点基準の説明文 */
  description: string;
  /** 弱点改善のための参考チャプター */
  chapterRef: string;
  /** 改善提案メッセージ */
  suggestion: string;
}

/** 軸ごとのメタ情報定義 */
export const AXIS_META: Record<SelfScoreAxis, AxisMeta> = {
  problemDiscovery: {
    label: '問題発見',
    description: '案件の本質・問題点を把握できたか',
    chapterRef: 'chapter01・chapter02',
    suggestion:
      'インバスケットの構造と採点基準を再確認しましょう。chapter01・chapter02を参照してください。',
  },
  analysis: {
    label: '分析',
    description: '情報を整理・分析できたか',
    chapterRef: 'chapter06',
    suggestion:
      '意思決定フレームワークを活用して情報を体系的に整理する練習をしましょう。chapter06を参照してください。',
  },
  decisionMaking: {
    label: '意思決定',
    description: '適切な優先度で素早く判断できたか',
    chapterRef: 'chapter05',
    suggestion:
      'ABCの優先度基準を徹底的に習得しましょう。chapter05（優先順位付け）を参照してください。',
  },
  insight: {
    label: '洞察',
    description: '背景や意図を深く読み取れたか',
    chapterRef: 'chapter03',
    suggestion:
      'マネジャーとしてのマインドセット強化が有効です。chapter03を参照してください。',
  },
  orgUtilization: {
    label: '組織活用',
    description: '委任・組織リソースを適切に活用できたか',
    chapterRef: 'chapter07',
    suggestion:
      '委任の判断基準と部下・関係者の活用方法を確認しましょう。chapter07を参照してください。',
  },
  humanSkill: {
    label: 'ヒューマンスキル',
    description: '関係者への配慮・コミュニケーションを意識できたか',
    chapterRef: 'chapter09',
    suggestion:
      '説得力のある文章・指示の書き方を練習しましょう。chapter09を参照してください。',
  },
};

/** 1〜5の整数スコア（型ガード用） */
export type SelfScore = 1 | 2 | 3 | 4 | 5;

/** 有効スコアの最小/最大 */
export const SELF_SCORE_MIN: SelfScore = 1;
export const SELF_SCORE_MAX: SelfScore = 5;

/** 1問分の自己採点エントリ（6軸すべてのスコアを保持） */
export type SelfScoreEntry = Record<SelfScoreAxis, SelfScore>;

/** セッション内の自己採点履歴（問ごとのエントリ配列・イミュータブル） */
export type SelfScoreHistory = readonly SelfScoreEntry[];

/**
 * デフォルトの自己採点エントリを生成（全軸スコア=3）。
 * - フォーム初期値として使用する。
 */
export function createDefaultSelfScoreEntry(): SelfScoreEntry {
  return {
    problemDiscovery: 3,
    analysis: 3,
    decisionMaking: 3,
    insight: 3,
    orgUtilization: 3,
    humanSkill: 3,
  };
}

/**
 * 複数エントリから各軸の平均スコアを計算する。
 * - 純粋関数（入力を変更しない）
 * - エントリが0件の場合は null を返す
 */
export function aggregateSelfScores(
  entries: SelfScoreHistory,
): Record<SelfScoreAxis, number> | null {
  if (entries.length === 0) return null;

  const sums: Record<string, number> = {
    problemDiscovery: 0,
    analysis: 0,
    decisionMaking: 0,
    insight: 0,
    orgUtilization: 0,
    humanSkill: 0,
  };

  for (const entry of entries) {
    for (const axis of SELF_SCORE_AXES) {
      sums[axis] += entry[axis];
    }
  }

  return Object.fromEntries(
    SELF_SCORE_AXES.map((axis) => [axis, sums[axis] / entries.length]),
  ) as Record<SelfScoreAxis, number>;
}

/**
 * 最も低い平均スコアの軸を返す（同率の場合は配列順で最初のものを優先）。
 * - 強調表示と改善提案メッセージに使用する。
 */
export function findWeakestAxis(averages: Record<SelfScoreAxis, number>): SelfScoreAxis {
  let weakest: SelfScoreAxis = SELF_SCORE_AXES[0];
  let minScore = Infinity;
  for (const axis of SELF_SCORE_AXES) {
    if (averages[axis] < minScore) {
      minScore = averages[axis];
      weakest = axis;
    }
  }
  return weakest;
}

/**
 * スコア値を SelfScore 型にクランプする（境界外入力の安全変換）。
 * - 1 未満 → 1、5 超 → 5
 */
export function clampSelfScore(value: number): SelfScore {
  if (value < SELF_SCORE_MIN) return SELF_SCORE_MIN;
  if (value > SELF_SCORE_MAX) return SELF_SCORE_MAX;
  return Math.round(value) as SelfScore;
}
