import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadCases, parseModelAnswer } from './loader';
import type { Priority } from './case';

describe('loadCases (40件前提・PBI-017)', () => {
  it('JSON から40件以上の案件を読み込める', () => {
    const cases = loadCases();
    expect(cases.length).toBeGreaterThanOrEqual(40);
  });

  it('全件が必須フィールドを持ち correctPriority は A/B/C のいずれか', () => {
    const cases = loadCases();
    for (const c of cases) {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.body).toBeTruthy();
      expect(c.explanation).toBeTruthy();
      expect(['A', 'B', 'C']).toContain(c.correctPriority);
    }
  });

  it('id が一意である', () => {
    const cases = loadCases();
    const ids = new Set(cases.map((c) => c.id));
    expect(ids.size).toBe(cases.length);
  });

  it('優先度 A/B/C の各比率が 30% 以上である（PBI-017 受入基準）', () => {
    const cases = loadCases();
    const total = cases.length;
    const ratio = (p: Priority) => cases.filter((c) => c.correctPriority === p).length / total;
    expect(ratio('A')).toBeGreaterThanOrEqual(0.3);
    expect(ratio('B')).toBeGreaterThanOrEqual(0.3);
    expect(ratio('C')).toBeGreaterThanOrEqual(0.3);
  });
});

describe('parseModelAnswer (PBI-024 / TASK-008・DoD §10-3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('正常: 全フィールド非空文字列なら ModelAnswer を返す', () => {
    const result = parseModelAnswer({
      judgment: 'Aランクで対応',
      reason: '顧客影響が大きいため',
      action: '担当部長へ即連絡',
    });
    expect(result).toEqual({
      judgment: 'Aランクで対応',
      reason: '顧客影響が大きいため',
      action: '担当部長へ即連絡',
    });
  });

  it('正常: undefined / null は undefined を返す（任意フィールド）', () => {
    expect(parseModelAnswer(undefined)).toBeUndefined();
    expect(parseModelAnswer(null)).toBeUndefined();
  });

  it('異常: judgment が空文字なら undefined にフォールバックし console.warn を呼ぶ', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = parseModelAnswer({ judgment: '', reason: 'r', action: 'a' }, 0, 'case-001');
    expect(result).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('modelAnswer.judgment');
  });

  it('異常: 必須キー（reason）欠落なら undefined にフォールバック', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = parseModelAnswer({ judgment: 'j', action: 'a' });
    expect(result).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('modelAnswer.reason');
  });

  it('異常: 型不正（フィールドが数値）なら undefined にフォールバック', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = parseModelAnswer({ judgment: 'j', reason: 'r', action: 123 });
    expect(result).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('modelAnswer.action');
  });

  it('異常: オブジェクトではない（配列・文字列）なら undefined にフォールバック', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parseModelAnswer([])).toBeUndefined();
    expect(parseModelAnswer('not-an-object')).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('loadCases 経由でも modelAnswer が整備済み案件は ModelAnswer を保持する', () => {
    const cases = loadCases();
    const withModel = cases.filter((c) => c.modelAnswer !== undefined);
    expect(withModel.length).toBeGreaterThan(0);
    for (const c of withModel) {
      expect(typeof c.modelAnswer?.judgment).toBe('string');
      expect(c.modelAnswer?.judgment.length).toBeGreaterThan(0);
      expect(typeof c.modelAnswer?.reason).toBe('string');
      expect(c.modelAnswer?.reason.length).toBeGreaterThan(0);
      expect(typeof c.modelAnswer?.action).toBe('string');
      expect(c.modelAnswer?.action.length).toBeGreaterThan(0);
    }
  });

  it('loadCases 経由で全件が modelAnswer を整備済みである（PBI-033c 完了）', () => {
    const cases = loadCases();
    const withoutModel = cases.filter((c) => c.modelAnswer === undefined);
    expect(withoutModel.length).toBe(0);
  });
});
