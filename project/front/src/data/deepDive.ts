/**
 * 詳細ページ向け深掘り解説データのアクセサ。
 *
 * AdSense「有用性の低いコンテンツ」判定への対応として、パターン詳細 20 件・
 * 代表ケース詳細 20 件に、ページ固有の解説本文（出題場面の読み解き／優先度の論拠／
 * よくある失敗／回答例文／評価者視点）を追加する。定義源は JSON に分離し、
 * `scripts/prerender.mjs` からも同じファイルを読み込んで焼き込む。
 */
import patternDeepDiveJson from './patternDeepDive.json';
import caseDeepDiveJson from './caseDeepDive.json';

/** パターン詳細ページの深掘り解説 */
export interface PatternDeepDive {
  /** この案件が出題される典型的な場面の読み解き */
  situation: string;
  /** なぜその優先度になるのかの論拠 */
  priorityRationale: string;
  /** よくある失敗 */
  commonMistakes: string[];
  /** 回答例文（全文） */
  answerExample: string;
  /** 採点者・評価者の着眼点 */
  evaluatorView: string;
}

/** 代表ケース詳細ページの深掘り解説 */
export interface CaseDeepDive {
  /** 案件文から読み取るべき状況の分析 */
  situationAnalysis: string;
  /** 優先度判定の論拠 */
  priorityRationale: string;
  /** よくある誤答 */
  pitfalls: string[];
  /** 回答例文（全文） */
  answerExample: string;
  /** 一次対応後のフォローアップ */
  followUp: string;
  sources?: { label: string; href: string }[];
}

const PATTERN_DEEP_DIVE = patternDeepDiveJson as Record<string, PatternDeepDive>;
const CASE_DEEP_DIVE = caseDeepDiveJson as Record<string, CaseDeepDive>;

/** パターンID（1〜20）から深掘り解説を取得する */
export function findPatternDeepDive(patternId: number): PatternDeepDive | undefined {
  return PATTERN_DEEP_DIVE[String(patternId)];
}

/** ケースID（case-XXX）から深掘り解説を取得する */
export function findCaseDeepDive(caseId: string): CaseDeepDive | undefined {
  return CASE_DEEP_DIVE[caseId];
}
