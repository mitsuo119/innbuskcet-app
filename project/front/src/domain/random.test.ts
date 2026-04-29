import { describe, it, expect } from 'vitest';
import { pickNextCase } from './random';
import type { Case } from './case';

const c = (id: string): Case => ({
  id,
  title: `t-${id}`,
  body: `b-${id}`,
  correctPriority: 'A',
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
