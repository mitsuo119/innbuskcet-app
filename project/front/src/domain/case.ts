/**
 * 優先度ランク
 * - A: 緊急かつ重要
 * - B: 重要だが緊急ではない / 緊急だが重要度は低い
 * - C: 緊急でも重要でもない（定型処理）
 */
export type Priority = 'A' | 'B' | 'C';

/**
 * 模範回答骨格（PBI-024）。
 * 「判断・理由・アクション」の 3 ブロックでの合格答案の型を提示する。
 * - 全フィールド必須（modelAnswer 自体はオプショナル）
 * - 段階移行のため、未整備の案件では undefined となる
 */
export interface ModelAnswer {
  /** 判断の模範回答骨格 */
  judgment: string;
  /** 理由の模範回答骨格 */
  reason: string;
  /** アクションの模範回答骨格 */
  action: string;
}

/**
 * 学習用の案件（インバスケット問題1件）。
 */
export interface Case {
  /** 一意なID */
  id: string;
  /** 案件タイトル（短い見出し） */
  title: string;
  /** 案件本文（メール本文や状況説明） */
  body: string;
  /** 正解優先度 */
  correctPriority: Priority;
  /** 解説文（なぜその優先度なのか） */
  explanation: string;
  /**
   * 案件に登場する人物名（PBI-028 / 任意）。
   * 段階移行のため未設定案件は undefined。
   */
  characters?: string[];
  /**
   * 案件に登場する部署名（PBI-028 / 任意）。
   * 段階移行のため未設定案件は undefined。
   */
  departments?: string[];
  /**
   * 模範回答骨格（PBI-024 / 任意）。
   * cases.json で段階的に整備中。未整備の案件では undefined。
   */
  modelAnswer?: ModelAnswer;
}
