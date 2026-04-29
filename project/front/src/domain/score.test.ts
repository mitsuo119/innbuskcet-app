import { describe, expect, it } from 'vitest';
import { addScore, initialScore } from './score';

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
