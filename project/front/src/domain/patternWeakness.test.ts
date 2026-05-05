/**
 * PBI-026: パターン別弱点分析 patternWeakness.test.ts
 *
 * 集計ロジック・信頼度警告・Top3選定ロジックのvitest単体テスト（TASK-264）。
 */

import { describe, it, expect } from 'vitest';
import type { HistoryItem } from './history';
import {
  aggregateByPattern,
  selectWeaknessTop3,
  RELIABILITY_THRESHOLD,
  CASE_PATTERN_MAP,
  PATTERN_NAME_MAP,
} from './patternWeakness';

// テスト用ヘルパー: HistoryItemを簡潔に生成する
function makeItem(
  caseId: string,
  judgement: 'correct' | 'incorrect',
): HistoryItem {
  return {
    caseId,
    judgement,
    correctPriority: 'A',
    learningStyle: 'quick',
  };
}

// =====================================================
// CASE_PATTERN_MAP のサニティチェック
// =====================================================
describe('CASE_PATTERN_MAP', () => {
  it('全40件のcase_idが含まれている', () => {
    const ids = Object.keys(CASE_PATTERN_MAP);
    expect(ids.length).toBe(40);
  });

  it('全パターン値が1〜20の範囲内である', () => {
    for (const [, patternId] of Object.entries(CASE_PATTERN_MAP)) {
      expect(patternId).toBeGreaterThanOrEqual(1);
      expect(patternId).toBeLessThanOrEqual(20);
    }
  });

  it('20パターン全てが少なくとも1件以上マッピングされている', () => {
    const usedPatterns = new Set(Object.values(CASE_PATTERN_MAP));
    for (let i = 1; i <= 20; i++) {
      expect(usedPatterns.has(i)).toBe(true);
    }
  });
});

// =====================================================
// PATTERN_NAME_MAP のサニティチェック
// =====================================================
describe('PATTERN_NAME_MAP', () => {
  it('20パターン全ての名称が定義されている', () => {
    for (let i = 1; i <= 20; i++) {
      expect(PATTERN_NAME_MAP[i]).toBeTruthy();
    }
  });
});

// =====================================================
// aggregateByPattern
// =====================================================
describe('aggregateByPattern', () => {
  it('空の履歴では空配列を返す', () => {
    expect(aggregateByPattern([])).toEqual([]);
  });

  it('1件の正解のみ: そのパターンが total=1, incorrect=0 で返る', () => {
    const history = [makeItem('case-001', 'correct')]; // pattern 1
    const stats = aggregateByPattern(history);
    expect(stats).toHaveLength(1);
    expect(stats[0].patternId).toBe(1);
    expect(stats[0].total).toBe(1);
    expect(stats[0].incorrect).toBe(0);
    expect(stats[0].errorRate).toBe(0);
  });

  it('1件の誤答: errorRate=1.0, lowReliability=true', () => {
    const history = [makeItem('case-001', 'incorrect')]; // pattern 1, total=1
    const stats = aggregateByPattern(history);
    expect(stats[0].errorRate).toBe(1.0);
    expect(stats[0].lowReliability).toBe(true); // total <= RELIABILITY_THRESHOLD(1)
  });

  it('同一パターンの複数回答を正しく集計する', () => {
    const history = [
      makeItem('case-002', 'incorrect'), // pattern 12
      makeItem('case-006', 'correct'),   // pattern 12
      makeItem('case-009', 'incorrect'), // pattern 12
    ];
    const stats = aggregateByPattern(history);
    expect(stats).toHaveLength(1);
    expect(stats[0].patternId).toBe(12);
    expect(stats[0].total).toBe(3);
    expect(stats[0].incorrect).toBe(2);
    expect(stats[0].errorRate).toBeCloseTo(2 / 3);
    expect(stats[0].lowReliability).toBe(false); // total > RELIABILITY_THRESHOLD
  });

  it('複数パターンを個別に集計する', () => {
    const history = [
      makeItem('case-001', 'correct'),   // pattern 1
      makeItem('case-004', 'incorrect'), // pattern 8
    ];
    const stats = aggregateByPattern(history);
    const patternIds = stats.map((s) => s.patternId).sort();
    expect(patternIds).toEqual([1, 8]);
  });

  it('CASE_PATTERN_MAPに存在しないcase_idは無視する', () => {
    const history = [
      makeItem('case-999', 'incorrect'), // 存在しない
      makeItem('case-001', 'correct'),   // pattern 1
    ];
    const stats = aggregateByPattern(history);
    expect(stats).toHaveLength(1);
    expect(stats[0].patternId).toBe(1);
  });

  it('patternNameが正しく設定される', () => {
    const history = [makeItem('case-001', 'correct')]; // pattern 1 = 顧客クレーム
    const stats = aggregateByPattern(history);
    expect(stats[0].patternName).toBe('顧客クレーム');
  });
});

// =====================================================
// 信頼度（lowReliability）の境界値テスト
// =====================================================
describe('lowReliability（境界値）', () => {
  it(`total = RELIABILITY_THRESHOLD(${RELIABILITY_THRESHOLD}) のとき lowReliability=true`, () => {
    const history = Array(RELIABILITY_THRESHOLD).fill(makeItem('case-001', 'incorrect'));
    const stats = aggregateByPattern(history);
    expect(stats[0].lowReliability).toBe(true);
  });

  it(`total = RELIABILITY_THRESHOLD+1 のとき lowReliability=false`, () => {
    const history = Array(RELIABILITY_THRESHOLD + 1).fill(makeItem('case-001', 'incorrect'));
    const stats = aggregateByPattern(history);
    expect(stats[0].lowReliability).toBe(false);
  });
});

// =====================================================
// selectWeaknessTop3
// =====================================================
describe('selectWeaknessTop3', () => {
  it('空配列では空配列を返す', () => {
    expect(selectWeaknessTop3([])).toEqual([]);
  });

  it('3件以下の場合はその件数を返す', () => {
    const history = [
      makeItem('case-001', 'incorrect'), // pattern 1
      makeItem('case-004', 'incorrect'), // pattern 8
    ];
    const stats = aggregateByPattern(history);
    const top3 = selectWeaknessTop3(stats);
    expect(top3.length).toBeLessThanOrEqual(3);
    expect(top3.length).toBe(2);
  });

  it('誤答率の降順で並ぶ', () => {
    // pattern 1: 1/1 = 100%, pattern 12: 1/3 ≈ 33%, pattern 9: 0/2 = 0%
    const history = [
      makeItem('case-001', 'incorrect'),  // p1
      makeItem('case-002', 'incorrect'),  // p12
      makeItem('case-006', 'correct'),    // p12
      makeItem('case-009', 'correct'),    // p12
      makeItem('case-007', 'correct'),    // p9
      makeItem('case-029', 'correct'),    // p9
    ];
    const stats = aggregateByPattern(history);
    const top3 = selectWeaknessTop3(stats);
    expect(top3[0].errorRate).toBeGreaterThanOrEqual(top3[1].errorRate);
    if (top3.length > 2) {
      expect(top3[1].errorRate).toBeGreaterThanOrEqual(top3[2].errorRate);
    }
  });

  it('同率誤答率の場合は出題件数が多い方が上位になる', () => {
    // どちらも errorRate=1.0 だが、一方は total=2、もう一方は total=1
    const history = [
      makeItem('case-001', 'incorrect'),  // p1: total=1, errorRate=1.0
      makeItem('case-007', 'incorrect'),  // p9: total=2, errorRate=1.0
      makeItem('case-029', 'incorrect'),  // p9: (追加)
    ];
    const stats = aggregateByPattern(history);
    const top3 = selectWeaknessTop3(stats);
    // p9(total=2) が p1(total=1) より上位
    expect(top3[0].patternId).toBe(9);
    expect(top3[1].patternId).toBe(1);
  });

  it('最大3件に絞る', () => {
    // 4パターン以上誤答でも上位3件のみ返る
    const history = [
      makeItem('case-001', 'incorrect'), // p1
      makeItem('case-001', 'incorrect'), // p1
      makeItem('case-004', 'incorrect'), // p8
      makeItem('case-004', 'incorrect'), // p8
      makeItem('case-007', 'incorrect'), // p9
      makeItem('case-007', 'incorrect'), // p9
      makeItem('case-013', 'incorrect'), // p14
      makeItem('case-013', 'incorrect'), // p14
    ];
    const stats = aggregateByPattern(history);
    const top3 = selectWeaknessTop3(stats);
    expect(top3.length).toBe(3);
  });

  it('全問正解の場合: errorRate=0 で上位に並ぶが0%のパターンを返す', () => {
    const history = [
      makeItem('case-001', 'correct'),
      makeItem('case-002', 'correct'),
      makeItem('case-002', 'correct'),
      makeItem('case-002', 'correct'),
    ];
    const stats = aggregateByPattern(history);
    const top3 = selectWeaknessTop3(stats);
    // 全て正解でも出題があれば返す（表示側で errorRate=0 を考慮）
    expect(top3.every((s) => s.errorRate === 0)).toBe(true);
  });
});
