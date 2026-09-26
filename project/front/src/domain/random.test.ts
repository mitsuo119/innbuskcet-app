import { describe, it, expect } from 'vitest';
import { FILTER_MODES, pickNextCase } from './random';
import type { Case, Priority } from './case';

const c = (id: string, p: Priority = 'A'): Case => ({
  id,
  title: `t-${id}`,
  body: `b-${id}`,
  correctPriority: p,
  explanation: `e-${id}`,
});

describe('pickNextCase', () => {
  it('空配列なら null を返す', () => {
    expect(pickNextCase([], undefined)).toBeNull();
  });

  it('1件のみなら除外せずそれを返す', () => {
    const only = c('x');
    expect(pickNextCase([only], 'x')).toBe(only);
  });

  it('previousId と異なる案件を返す', () => {
    const cases = [c('1'), c('2'), c('3')];
    // random=0 → pool[0] が選ばれる。previousId='1' を除外した pool の先頭は '2'
    expect(pickNextCase(cases, '1', () => 0)).toEqual(c('2'));
  });

  it('previousId が undefined のときは全件から選ばれる', () => {
    const cases = [c('1'), c('2')];
    expect(pickNextCase(cases, undefined, () => 0)).toEqual(c('1'));
  });

  it('「次の問題」遷移を繰り返しても直前案件は連続しない', () => {
    const cases = [c('1'), c('2'), c('3'), c('4')];
    // 連続呼び出し（次問題への遷移を5回シミュレート）。乱数は適当に変動。
    const seq = [0, 0.4, 0.7, 0.2, 0.9];
    let prev: string | undefined = undefined;
    let i = 0;
    for (let n = 0; n < seq.length; n++) {
      const picked = pickNextCase(cases, prev, () => seq[i++ % seq.length]);
      expect(picked).not.toBeNull();
      expect(picked!.id).not.toBe(prev);
      prev = picked!.id;
    }
  });
});

describe('FILTER_MODES (PBI-018)', () => {
  it('FILTER_MODES は all/A/B/C の4種', () => {
    expect(FILTER_MODES).toEqual(['all', 'A', 'B', 'C']);
  });
});
