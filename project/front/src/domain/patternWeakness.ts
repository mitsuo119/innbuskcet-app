/**
 * PBI-026: パターン別弱点分析ドメインロジック
 *
 * case_pattern_mapping.md の 40 件対応表に基づき、
 * セッション内の回答履歴をchapter08の20パターンで集計し、
 * 誤答率上位3パターンを「弱点パターンTop3」として返す。
 *
 * 役割分担: 6軸（PBI-025）は"スキル軸"の自己採点、本機能は"問題種別"の客観集計。
 */

import type { HistoryItem } from './history';

/** 1パターンの集計結果 */
export interface PatternStat {
  /** パターン番号（1〜20） */
  patternId: number;
  /** パターン名称 */
  patternName: string;
  /** 回答件数 */
  total: number;
  /** 誤答件数 */
  incorrect: number;
  /** 誤答率（0.0〜1.0） */
  errorRate: number;
  /**
   * 信頼度警告フラグ。
   * total が RELIABILITY_THRESHOLD 以下（出題数が少ない）場合に true。
   */
  lowReliability: boolean;
}

/** 信頼度低判定の閾値（この件数以下は「信頼度低」）。 */
export const RELIABILITY_THRESHOLD = 1;

/** Top3 選定に最低必要な出題件数（0件のパターンは除外）。 */
export const MIN_TOTAL_FOR_TOP3 = 1;

/**
 * case_id → パターン番号のマッピング（case_pattern_mapping.md 逆引き表より）。
 * 複合パターンをもつ案件（case-024等）は主パターンのみ採用。
 */
export const CASE_PATTERN_MAP: Record<string, number> = {
  'case-001': 1,
  'case-002': 12,
  'case-003': 10,
  'case-004': 8,
  'case-005': 4,
  'case-006': 12,
  'case-007': 9,
  'case-008': 18,
  'case-009': 12,
  'case-010': 4,
  'case-011': 10,
  'case-012': 17,
  'case-013': 14,
  'case-014': 2,
  'case-015': 5,
  'case-016': 11,
  'case-017': 3,
  'case-018': 13,
  'case-019': 7,
  'case-020': 6,
  'case-021': 19,
  'case-022': 18,
  'case-023': 17,
  'case-024': 18,
  'case-025': 15,
  'case-026': 12,
  'case-027': 16,
  'case-028': 2,
  'case-029': 9,
  'case-030': 10,
  'case-031': 20,
  'case-032': 12,
  'case-033': 7,
  'case-034': 12,
  'case-035': 10,
  'case-036': 2,
  'case-037': 18,
  'case-038': 11,
  'case-039': 15,
  'case-040': 20,
};

/** パターンID → パターン名称のマッピング（chapter08-case-patterns.md より） */
export const PATTERN_NAME_MAP: Record<number, string> = {
  1: '顧客クレーム',
  2: '取引先からの要求',
  3: '新規取引・営業案件',
  4: '部下の退職・異動の相談',
  5: '部下間の対立・人間関係',
  6: '部下のパフォーマンス問題',
  7: '部下の有給・休暇申請',
  8: 'ハラスメント報告',
  9: 'プロジェクト遅延・品質問題',
  10: '予算承認・経費申請',
  11: '業務改善提案',
  12: '会議・セミナー参加依頼',
  13: '事故・災害報告',
  14: '情報セキュリティインシデント',
  15: 'コンプライアンス違反（不正）',
  16: '組織変更・人員配置',
  17: '上位方針の伝達・対応',
  18: '他部署からの依頼・調整',
  19: '前任者の未完了案件',
  20: '複合案件（複数パターン組合せ）',
};

/**
 * 回答履歴をパターン別に集計する（TASK-261）。
 *
 * - `history` のうち CASE_PATTERN_MAP に存在しない case_id は無視する。
 * - 出題が0件のパターンは結果に含まれない。
 * - 純粋関数（入力を変更しない）。
 *
 * @param history セッション内の回答履歴（無制限件数を受け付ける）
 * @returns パターン別集計結果（出題ありのもの全件）
 */
export function aggregateByPattern(history: readonly HistoryItem[]): PatternStat[] {
  // パターン別カウンタを初期化
  const totals: Record<number, number> = {};
  const incorrects: Record<number, number> = {};

  for (const item of history) {
    const patternId = CASE_PATTERN_MAP[item.caseId];
    if (patternId === undefined) continue;

    totals[patternId] = (totals[patternId] ?? 0) + 1;
    if (item.judgement === 'incorrect') {
      incorrects[patternId] = (incorrects[patternId] ?? 0) + 1;
    }
  }

  return Object.entries(totals).map(([idStr, total]) => {
    const patternId = Number(idStr);
    const incorrect = incorrects[patternId] ?? 0;
    const errorRate = total > 0 ? incorrect / total : 0;
    return {
      patternId,
      patternName: PATTERN_NAME_MAP[patternId] ?? `パターン${patternId}`,
      total,
      incorrect,
      errorRate,
      lowReliability: total <= RELIABILITY_THRESHOLD,
    };
  });
}

/**
 * 弱点パターン Top3 を選定する（TASK-261）。
 *
 * 選定基準:
 * 1. 出題件数が MIN_TOTAL_FOR_TOP3 以上のパターンが対象
 * 2. 誤答率の降順でソート（同率の場合は出題件数の多い方を優先）
 * 3. 上位3件を返す
 *
 * @param stats aggregateByPattern の結果
 * @returns 弱点パターン Top3（3件未満の場合はその件数）
 */
export function selectWeaknessTop3(stats: PatternStat[]): PatternStat[] {
  return stats
    .filter((s) => s.total >= MIN_TOTAL_FOR_TOP3)
    .sort((a, b) => {
      if (b.errorRate !== a.errorRate) return b.errorRate - a.errorRate;
      // 同率の場合は出題件数の多い方が弱点として意味がある（信頼度が高い）
      return b.total - a.total;
    })
    .slice(0, 3);
}
