import { describe, expect, it } from 'vitest';
import {
  addLearningStyleScore,
  addModeScore,
  addScore,
  calcRollingScore,
  initialLearningStyleScores,
  initialModeScores,
  initialScore,
  ratePercent,
} from './score';

describe('addScore()', () => {
  it('初期値は 0/0', () => {
    expect(initialScore).toEqual({ total: 0, correct: 0 });
  });

  it('正解時は出題数と正答数の両方が +1', () => {
    const next = addScore(initialScore, 'correct');
    expect(next).toEqual({ total: 1, correct: 1 });
  });

  it('不正解時は出題数のみ +1（正答数は据え置き）', () => {
    const next = addScore(initialScore, 'incorrect');
    expect(next).toEqual({ total: 1, correct: 0 });
  });

  it('連続加算で正答/出題が独立に積み上がる', () => {
    let s = initialScore;
    s = addScore(s, 'correct');
    s = addScore(s, 'incorrect');
    s = addScore(s, 'correct');
    s = addScore(s, 'incorrect');
    expect(s).toEqual({ total: 4, correct: 2 });
  });

  it('元の Score オブジェクトを変更しない（イミュータブル）', () => {
    const base: Readonly<typeof initialScore> = { total: 1, correct: 1 };
    const next = addScore(base, 'correct');
    expect(base).toEqual({ total: 1, correct: 1 });
    expect(next).toEqual({ total: 2, correct: 2 });
  });

  it('「もう一度」シナリオでは addScore を呼ばないため score は変化しない（PBI-014 回帰）', () => {
    // 1問正解で 1/1 まで進めた後に「もう一度」ボタン押下を想定。
    // App 側では handleRetry が score を更新しないため、addScore は呼ばれない。
    const after1 = addScore(initialScore, 'correct');
    expect(after1).toEqual({ total: 1, correct: 1 });
    // 「もう一度」押下では score の更新関数は呼ばれない → 同一インスタンスのまま
    const afterRetry = after1;
    expect(afterRetry).toBe(after1);
    expect(afterRetry).toEqual({ total: 1, correct: 1 });
    // 再回答（不正解）で初めて total のみ +1 される
    const afterRetryAnswer = addScore(afterRetry, 'incorrect');
    expect(afterRetryAnswer).toEqual({ total: 2, correct: 1 });
  });
});

describe('addModeScore() / ratePercent() (PBI-021)', () => {
  it('initialModeScores は全モード 0/0', () => {
    expect(initialModeScores).toEqual({
      all: { total: 0, correct: 0 },
      A: { total: 0, correct: 0 },
      B: { total: 0, correct: 0 },
      C: { total: 0, correct: 0 },
    });
  });

  it('A 案件正解時は all と A のみ +1（B/C は据え置き）', () => {
    const next = addModeScore(initialModeScores, 'A', 'correct');
    expect(next.all).toEqual({ total: 1, correct: 1 });
    expect(next.A).toEqual({ total: 1, correct: 1 });
    expect(next.B).toEqual({ total: 0, correct: 0 });
    expect(next.C).toEqual({ total: 0, correct: 0 });
  });

  it('B 案件不正解時は all と B のみ total +1（correct は据え置き）', () => {
    const next = addModeScore(initialModeScores, 'B', 'incorrect');
    expect(next.all).toEqual({ total: 1, correct: 0 });
    expect(next.B).toEqual({ total: 1, correct: 0 });
    expect(next.A).toEqual({ total: 0, correct: 0 });
    expect(next.C).toEqual({ total: 0, correct: 0 });
  });

  it('連続加算でモード別に独立集計される', () => {
    let s = initialModeScores;
    s = addModeScore(s, 'A', 'correct');
    s = addModeScore(s, 'A', 'incorrect');
    s = addModeScore(s, 'B', 'correct');
    s = addModeScore(s, 'C', 'incorrect');
    s = addModeScore(s, 'C', 'correct');
    expect(s.all).toEqual({ total: 5, correct: 3 });
    expect(s.A).toEqual({ total: 2, correct: 1 });
    expect(s.B).toEqual({ total: 1, correct: 1 });
    expect(s.C).toEqual({ total: 2, correct: 1 });
  });

  it('元の ModeScores を変更しない（イミュータブル）', () => {
    const base = initialModeScores;
    const next = addModeScore(base, 'A', 'correct');
    expect(base).toEqual(initialModeScores);
    expect(next).not.toBe(base);
    expect(next.A).not.toBe(base.A);
  });

  it('ratePercent: 0 件モードは null（除算ガード）', () => {
    expect(ratePercent({ total: 0, correct: 0 })).toBeNull();
  });

  it('ratePercent: 端数は四捨五入', () => {
    expect(ratePercent({ total: 3, correct: 1 })).toBe(33); // 33.33... → 33
    expect(ratePercent({ total: 3, correct: 2 })).toBe(67); // 66.66... → 67
    expect(ratePercent({ total: 4, correct: 2 })).toBe(50);
    expect(ratePercent({ total: 1, correct: 1 })).toBe(100);
    expect(ratePercent({ total: 1, correct: 0 })).toBe(0);
  });
});

describe('addLearningStyleScore() (PBI-037 / TASK-015)', () => {
  it('initialLearningStyleScores は quick/deep/exam ともに 0/0', () => {
    expect(initialLearningStyleScores).toEqual({
      quick: { total: 0, correct: 0 },
      deep: { total: 0, correct: 0 },
      exam: { total: 0, correct: 0 },
    });
  });

  it('quick 正解時は quick のみ +1（deep 据え置き）', () => {
    const next = addLearningStyleScore(initialLearningStyleScores, 'quick', 'correct');
    expect(next.quick).toEqual({ total: 1, correct: 1 });
    expect(next.deep).toEqual({ total: 0, correct: 0 });
  });

  it('deep 不正解時は deep のみ total +1', () => {
    const next = addLearningStyleScore(initialLearningStyleScores, 'deep', 'incorrect');
    expect(next.deep).toEqual({ total: 1, correct: 0 });
    expect(next.quick).toEqual({ total: 0, correct: 0 });
  });

  it('連続加算で quick/deep が独立集計される', () => {
    let s = initialLearningStyleScores;
    s = addLearningStyleScore(s, 'quick', 'correct');
    s = addLearningStyleScore(s, 'quick', 'incorrect');
    s = addLearningStyleScore(s, 'deep', 'correct');
    s = addLearningStyleScore(s, 'deep', 'correct');
    expect(s.quick).toEqual({ total: 2, correct: 1 });
    expect(s.deep).toEqual({ total: 2, correct: 2 });
  });

  it('元の LearningStyleScores を変更しない（イミュータブル）', () => {
    const base = initialLearningStyleScores;
    const next = addLearningStyleScore(base, 'quick', 'correct');
    expect(base).toEqual(initialLearningStyleScores);
    expect(next).not.toBe(base);
  });
});

describe('calcRollingScore() (PBI-031)', () => {
  const makeItem = (
    judgement: 'correct' | 'incorrect',
    style?: 'quick' | 'deep' | 'exam',
  ) => ({
    caseId: 'case-001',
    judgement,
    correctPriority: 'A' as const,
    learningStyle: style,
  });

  it('件数が n 未満のとき null を返す（安全表示）', () => {
    const history = Array.from({ length: 9 }, () => makeItem('correct', 'quick'));
    expect(calcRollingScore(history, 10, 'quick')).toBeNull();
  });

  it('件数が n のとき正しく集計する', () => {
    const history = [
      ...Array.from({ length: 7 }, () => makeItem('correct', 'quick')),
      ...Array.from({ length: 3 }, () => makeItem('incorrect', 'quick')),
    ];
    const result = calcRollingScore(history, 10, 'quick');
    expect(result).toEqual({ total: 10, correct: 7 });
  });

  it('件数が n を超えるとき直近 n 件のみ集計する', () => {
    // 古い 5 件は正解、直近 10 件は不正解 5/正解 5
    const history = [
      ...Array.from({ length: 5 }, () => makeItem('correct', 'quick')),
      ...Array.from({ length: 5 }, () => makeItem('incorrect', 'quick')),
      ...Array.from({ length: 5 }, () => makeItem('correct', 'quick')),
    ];
    const result = calcRollingScore(history, 10, 'quick');
    expect(result).toEqual({ total: 10, correct: 5 });
  });

  it('Quick/Deep を独立集計: quick フィルタ時は deep 分を除外する', () => {
    const history = [
      ...Array.from({ length: 5 }, () => makeItem('correct', 'deep')),
      ...Array.from({ length: 10 }, () => makeItem('incorrect', 'quick')),
    ];
    const result = calcRollingScore(history, 10, 'quick');
    expect(result).toEqual({ total: 10, correct: 0 });
  });

  it('style 未指定のとき全件集計する', () => {
    const history = [
      ...Array.from({ length: 5 }, () => makeItem('correct', 'quick')),
      ...Array.from({ length: 5 }, () => makeItem('correct', 'deep')),
    ];
    const result = calcRollingScore(history, 10);
    expect(result).toEqual({ total: 10, correct: 10 });
  });

  it('履歴が空のとき null を返す', () => {
    expect(calcRollingScore([], 10, 'quick')).toBeNull();
  });

  it('入力配列を変更しない（イミュータブル）', () => {
    const history = Array.from({ length: 10 }, () => makeItem('correct', 'quick'));
    const original = [...history];
    calcRollingScore(history, 10, 'quick');
    expect(history).toEqual(original);
  });
});
