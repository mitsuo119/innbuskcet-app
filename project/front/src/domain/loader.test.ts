import { describe, it, expect } from 'vitest';
import { loadCases } from './loader';

describe('loadCases', () => {
  it('JSON から12件以上の案件を読み込める', () => {
    const cases = loadCases();
    expect(cases.length).toBeGreaterThanOrEqual(12);
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
});
