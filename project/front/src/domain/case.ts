/**
 * 優先度ランク
 * - A: 緊急かつ重要
 * - B: 重要だが緊急ではない / 緊急だが重要度は低い
 * - C: 緊急でも重要でもない（定型処理）
 */
export type Priority = 'A' | 'B' | 'C';

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
}
