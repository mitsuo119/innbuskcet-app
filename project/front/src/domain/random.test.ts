import { describe, it, expect } from 'vitest';
import { FILTER_MODES, filterByMode, pickNextCase, pickNextCaseByMode } from './random';
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

describe('filterByMode (PBI-018)', () => {
  const cases = [c('a1', 'A'), c('a2', 'A'), c('b1', 'B'), c('c1', 'C')];

  it('FILTER_MODES は all/A/B/C の4種', () => {
    expect(FILTER_MODES).toEqual(['all', 'A', 'B', 'C']);
  });

  it("mode='all' は全件返す（新規配列）", () => {
    const out = filterByMode(cases, 'all');
    expect(out).toHaveLength(4);
    expect(out).not.toBe(cases);
  });

  it.each(['A', 'B', 'C'] as const)("mode='%s' は該当優先度のみ返す", (mode) => {
    const out = filterByMode(cases, mode);
    expect(out.every((x) => x.correctPriority === mode)).toBe(true);
  });

  it('該当 0 件のときは空配列を返す', () => {
    const onlyA = [c('a1', 'A')];
    expect(filterByMode(onlyA, 'C')).toEqual([]);
  });

  it('入力配列を破壊しない', () => {
    const snapshot = [...cases];
    filterByMode(cases, 'A');
    expect(cases).toEqual(snapshot);
  });
});

describe('pickNextCaseByMode (PBI-018)', () => {
  const cases = [c('a1', 'A'), c('a2', 'A'), c('b1', 'B'), c('c1', 'C')];

  it("mode='C' で C のみが返る", () => {
    const picked = pickNextCaseByMode(cases, undefined, 'C', () => 0);
    expect(picked?.correctPriority).toBe('C');
    expect(picked?.id).toBe('c1');
  });

  it("mode='all' は previousId 直前を除外する", () => {
    const picked = pickNextCaseByMode(cases, 'a1', 'all', () => 0);
    // a1 を除外した先頭は a2
    expect(picked?.id).toBe('a2');
  });

  it("mode='B' でフィルタ後 1 件のときはその案件が返る（previousId 一致でも）", () => {
    const picked = pickNextCaseByMode(cases, 'b1', 'B', () => 0);
    expect(picked?.id).toBe('b1');
  });

  it('該当 0 件なら null', () => {
    const onlyA = [c('a1', 'A')];
    expect(pickNextCaseByMode(onlyA, undefined, 'C', () => 0)).toBeNull();
  });
});
