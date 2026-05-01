import { describe, it, expect } from 'vitest';
import { loadCases } from './loader';
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
