import { describe, expect, it } from 'vitest';
import {
  buildExamResultSummary,
  calcPercentage,
  evaluateByPriority,
} from './examResult';

/**
 * PBI-030 / TASK-002 ドメインロジックの境界値テスト（DAY1 着手分）。
 *
 * NOTE: 境界値テスト 8 件全ての網羅は TASK-002 完了（DAY2）で達成予定。
 * DAY1 では基本 / 0 件 / 配列長不一致 の最小 3 件で骨格を担保する。
 */
describe('examResult ドメイン関数（PBI-030 / DAY1 部分）', () => {
  it('全問正解＋A/B/C ミックスで正答率 100% / 優先度別カウントを集計する', () => {
    const correct: ('A' | 'B' | 'C')[] = ['A', 'A', 'B', 'B', 'C'];
    const user: ('A' | 'B' | 'C')[] = ['A', 'A', 'B', 'B', 'C'];
    const summary = buildExamResultSummary(correct, user, 1234);
    expect(summary.totalQuestions).toBe(5);
    expect(summary.correctCount).toBe(5);
    expect(summary.percentage).toBe(100);
    expect(summary.byPriority.A).toEqual({ correct: 2, total: 2 });
    expect(summary.byPriority.B).toEqual({ correct: 2, total: 2 });
    expect(summary.byPriority.C).toEqual({ correct: 1, total: 1 });
    expect(summary.elapsedDisplay).toBe('20:34');
  });

  it('出題数 0 のとき正答率 0%・mm:ss は 00:00 を返す（DoD §10-1）', () => {
    const summary = buildExamResultSummary([], [], -10);
    expect(summary.totalQuestions).toBe(0);
    expect(summary.correctCount).toBe(0);
    expect(summary.percentage).toBe(0);
    expect(summary.elapsedSeconds).toBe(0);
    expect(summary.elapsedDisplay).toBe('00:00');
    expect(calcPercentage(3, 0)).toBe(0);
  });

  it('配列長不一致は短い方に揃えて集計する（安全側フォールバック）', () => {
    const breakdown = evaluateByPriority(['A', 'B', 'C'], ['A', 'B']);
    expect(breakdown.A).toEqual({ correct: 1, total: 1 });
    expect(breakdown.B).toEqual({ correct: 1, total: 1 });
    expect(breakdown.C).toEqual({ correct: 0, total: 0 });
  });
});
