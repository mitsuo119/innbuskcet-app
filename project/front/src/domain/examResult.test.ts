/**
 * examResult.ts 集計純粋関数の単体テスト（PBI-030 / TASK-003）。
 *
 * 対象:
 *   - calcPercentage
 *   - evaluateByPriority
 *   - buildExamResultSummary
 *
 * 観点（DoD §10-1 入力検証 / 境界値）:
 *   - 全問正解 / 全問不正解 / 典型ケース（15/20）
 *   - A/B/C 別の正答率
 *   - 0 問（空配列）の除算 0 セーフ
 *   - 未回答（配列長不一致）→ 不正解扱い
 *   - 不正な priority 値のフォールバック（無視）
 *   - 経過時間の負値・NaN クランプ + mm:ss 整形
 */

import { describe, expect, it } from 'vitest';
import type { Priority } from './case';
import { buildExamResultSummary, calcPercentage, evaluateByPriority } from './examResult';

/** A/B/C を均等に並べた 20 問分の正解配列を生成（A:7 / B:7 / C:6）。 */
function makeCorrect20(): Priority[] {
  const arr: Priority[] = [];
  for (let i = 0; i < 7; i++) arr.push('A');
  for (let i = 0; i < 7; i++) arr.push('B');
  for (let i = 0; i < 6; i++) arr.push('C');
  return arr;
}

describe('calcPercentage', () => {
  it('total=0 のとき 0 を返す（除算 0 セーフ）', () => {
    expect(calcPercentage(0, 0)).toBe(0);
    expect(calcPercentage(5, 0)).toBe(0);
  });

  it('full match は 100 を返す', () => {
    expect(calcPercentage(20, 20)).toBe(100);
  });

  it('15/20 は 75 を返す（典型ケース）', () => {
    expect(calcPercentage(15, 20)).toBe(75);
  });

  it('correct > total は total に丸めて 100（安全側）', () => {
    expect(calcPercentage(25, 20)).toBe(100);
  });

  it('correct が負値のときは 0 にクランプ', () => {
    expect(calcPercentage(-5, 20)).toBe(0);
  });

  it('NaN / Infinity は 0 を返す', () => {
    expect(calcPercentage(Number.NaN, 20)).toBe(0);
    expect(calcPercentage(10, Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('1/3 は四捨五入で 33 を返す', () => {
    expect(calcPercentage(1, 3)).toBe(33);
  });
});

describe('evaluateByPriority', () => {
  it('空配列はすべて 0 件のブレイクダウンを返す（境界値）', () => {
    const r = evaluateByPriority([], []);
    expect(r).toEqual({
      A: { correct: 0, total: 0 },
      B: { correct: 0, total: 0 },
      C: { correct: 0, total: 0 },
    });
  });

  it('全問正解（20 問）→ 各優先度で correct === total', () => {
    const correct = makeCorrect20();
    const r = evaluateByPriority(correct, correct);
    expect(r.A).toEqual({ correct: 7, total: 7 });
    expect(r.B).toEqual({ correct: 7, total: 7 });
    expect(r.C).toEqual({ correct: 6, total: 6 });
  });

  it('全問不正解 → correct はすべて 0、total は維持', () => {
    const correct: Priority[] = ['A', 'A', 'B', 'B', 'C', 'C'];
    const user: Priority[] = ['B', 'C', 'C', 'A', 'A', 'B'];
    const r = evaluateByPriority(correct, user);
    expect(r.A).toEqual({ correct: 0, total: 2 });
    expect(r.B).toEqual({ correct: 0, total: 2 });
    expect(r.C).toEqual({ correct: 0, total: 2 });
  });

  it('A 優先度のみ集計（B/C 0 件）', () => {
    const correct: Priority[] = ['A', 'A', 'A', 'A'];
    const user: Priority[] = ['A', 'A', 'B', 'C'];
    const r = evaluateByPriority(correct, user);
    expect(r.A).toEqual({ correct: 2, total: 4 });
    expect(r.B).toEqual({ correct: 0, total: 0 });
    expect(r.C).toEqual({ correct: 0, total: 0 });
  });

  it('B 優先度のみ集計', () => {
    const correct: Priority[] = ['B', 'B', 'B'];
    const user: Priority[] = ['B', 'A', 'B'];
    const r = evaluateByPriority(correct, user);
    expect(r.B).toEqual({ correct: 2, total: 3 });
    expect(r.A.total).toBe(0);
    expect(r.C.total).toBe(0);
  });

  it('C 優先度のみ集計', () => {
    const correct: Priority[] = ['C', 'C', 'C', 'C'];
    const user: Priority[] = ['C', 'C', 'C', 'A'];
    const r = evaluateByPriority(correct, user);
    expect(r.C).toEqual({ correct: 3, total: 4 });
  });

  it('A/B/C 混在 → 各カテゴリ別に正答率が独立して算出される', () => {
    const correct: Priority[] = ['A', 'A', 'A', 'B', 'B', 'C', 'C', 'C'];
    const user: Priority[] = ['A', 'A', 'B', 'B', 'C', 'C', 'A', 'C'];
    const r = evaluateByPriority(correct, user);
    expect(r.A).toEqual({ correct: 2, total: 3 });
    expect(r.B).toEqual({ correct: 1, total: 2 });
    expect(r.C).toEqual({ correct: 2, total: 3 });
  });

  it('user 配列が短い（未回答あり）→ min(length) までを集計し残りは出題数からも除外', () => {
    const correct: Priority[] = ['A', 'A', 'B', 'B', 'C'];
    // 3 件目以降は未回答（配列長不一致）→ 集計対象外（C 出題は 0 件扱い）
    // 先頭 2 件は cp='A','A'、user='A','B' なので A は 1/2 となる
    const user = ['A', 'B'] as Priority[];
    const r = evaluateByPriority(correct, user);
    expect(r.A).toEqual({ correct: 1, total: 2 });
    expect(r.B).toEqual({ correct: 0, total: 0 });
    expect(r.C).toEqual({ correct: 0, total: 0 });
  });

  it('correct 側に不正値（A/B/C 以外）が混在したらその要素は無視される', () => {
    const correct = ['A', 'X', 'B', null, 'C'] as unknown as Priority[];
    const user = ['A', 'A', 'B', 'B', 'C'] as Priority[];
    const r = evaluateByPriority(correct, user);
    expect(r.A).toEqual({ correct: 1, total: 1 });
    expect(r.B).toEqual({ correct: 1, total: 1 });
    expect(r.C).toEqual({ correct: 1, total: 1 });
  });

  it('非配列入力は空ブレイクダウンにフォールバック（throw しない）', () => {
    const bogus = undefined as unknown as Priority[];
    const r = evaluateByPriority(bogus, bogus);
    expect(r.A.total).toBe(0);
    expect(r.B.total).toBe(0);
    expect(r.C.total).toBe(0);
  });
});

describe('buildExamResultSummary', () => {
  it('全問正解（20 問・A 優先度一致含む）→ 正答率 100%', () => {
    const correct = makeCorrect20();
    const r = buildExamResultSummary(correct, correct, 600);
    expect(r.totalQuestions).toBe(20);
    expect(r.correctCount).toBe(20);
    expect(r.percentage).toBe(100);
    expect(r.elapsedSeconds).toBe(600);
    expect(r.elapsedDisplay).toBe('10:00');
  });

  it('全問不正解（20 問）→ 正答率 0%', () => {
    const correct = makeCorrect20();
    const user: Priority[] = correct.map((p) => (p === 'A' ? 'B' : p === 'B' ? 'C' : 'A'));
    const r = buildExamResultSummary(correct, user, 5400);
    expect(r.totalQuestions).toBe(20);
    expect(r.correctCount).toBe(0);
    expect(r.percentage).toBe(0);
    expect(r.elapsedDisplay).toBe('90:00');
  });

  it('典型ケース（15/20 正解）→ 75%', () => {
    const correct = makeCorrect20();
    const user = correct.slice();
    // 末尾 5 件を間違える
    for (let i = 15; i < 20; i++) {
      user[i] = user[i] === 'A' ? 'B' : user[i] === 'B' ? 'C' : 'A';
    }
    const r = buildExamResultSummary(correct, user, 1830);
    expect(r.correctCount).toBe(15);
    expect(r.totalQuestions).toBe(20);
    expect(r.percentage).toBe(75);
    expect(r.elapsedDisplay).toBe('30:30');
  });

  it('0 問（空配列）→ percentage は 0、elapsedDisplay は 00:00（境界値）', () => {
    const r = buildExamResultSummary([], [], 0);
    expect(r.totalQuestions).toBe(0);
    expect(r.correctCount).toBe(0);
    expect(r.percentage).toBe(0);
    expect(r.elapsedSeconds).toBe(0);
    expect(r.elapsedDisplay).toBe('00:00');
    expect(r.byPriority.A.total).toBe(0);
  });

  it('未回答（user 配列が短い）→ 該当要素は不正解扱い・出題数も伸びない', () => {
    const correct: Priority[] = ['A', 'A', 'B', 'B', 'C'];
    const user = ['A', 'A'] as Priority[];
    const r = buildExamResultSummary(correct, user, 60);
    // 集計対象は先頭 2 件のみ（A 2 問・正解 2）
    expect(r.totalQuestions).toBe(2);
    expect(r.correctCount).toBe(2);
    expect(r.percentage).toBe(100);
    expect(r.byPriority.A).toEqual({ correct: 2, total: 2 });
    expect(r.byPriority.B.total).toBe(0);
    expect(r.byPriority.C.total).toBe(0);
  });

  it('A/B/C 混在 → byPriority に各カテゴリ独立の集計結果', () => {
    const correct: Priority[] = ['A', 'A', 'A', 'A', 'B', 'B', 'C', 'C'];
    const user: Priority[] = ['A', 'A', 'B', 'C', 'B', 'A', 'C', 'B'];
    const r = buildExamResultSummary(correct, user, 90);
    expect(r.byPriority.A).toEqual({ correct: 2, total: 4 });
    expect(r.byPriority.B).toEqual({ correct: 1, total: 2 });
    expect(r.byPriority.C).toEqual({ correct: 1, total: 2 });
    expect(r.correctCount).toBe(4);
    expect(r.totalQuestions).toBe(8);
    expect(r.percentage).toBe(50);
    expect(r.elapsedDisplay).toBe('01:30');
  });

  it('elapsedSeconds が負値・NaN なら 0 にクランプ', () => {
    const correct: Priority[] = ['A'];
    const user: Priority[] = ['A'];
    expect(buildExamResultSummary(correct, user, -10).elapsedSeconds).toBe(0);
    expect(buildExamResultSummary(correct, user, Number.NaN).elapsedSeconds).toBe(0);
    expect(buildExamResultSummary(correct, user, -10).elapsedDisplay).toBe('00:00');
  });

  it('priority が存在しない（不正値）case はフォールバック動作で無視される', () => {
    const correct = ['A', 'foo', 'B'] as unknown as Priority[];
    const user = ['A', 'A', 'B'] as Priority[];
    const r = buildExamResultSummary(correct, user, 30);
    expect(r.totalQuestions).toBe(2); // 'foo' は無視
    expect(r.correctCount).toBe(2);
    expect(r.percentage).toBe(100);
    expect(r.elapsedDisplay).toBe('00:30');
  });
});
