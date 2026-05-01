import { describe, expect, it } from 'vitest';

import {
  PRIORITY_LABELS,
  formatPriorityLabel,
  getPriorityLabel,
  type PriorityKey,
} from './priorityLabel';

describe('PRIORITY_LABELS', () => {
  it('A は ◎ / 最優先 / 即時着手すべき', () => {
    expect(PRIORITY_LABELS.A).toEqual({
      symbol: '◎',
      name: '最優先',
      meaning: '即時着手すべき',
    });
  });

  it('B は ○ / 中優先 / 重要だが緊急ではない', () => {
    expect(PRIORITY_LABELS.B).toEqual({
      symbol: '○',
      name: '中優先',
      meaning: '重要だが緊急ではない',
    });
  });

  it('C は △ / 低優先 / リソースが余れば対応', () => {
    expect(PRIORITY_LABELS.C).toEqual({
      symbol: '△',
      name: '低優先',
      meaning: 'リソースが余れば対応',
    });
  });

  it('A/B/C の 3 キーのみが存在する', () => {
    expect(Object.keys(PRIORITY_LABELS).sort()).toEqual(['A', 'B', 'C']);
  });
});

describe('getPriorityLabel', () => {
  it('A キーで A のラベルを返す', () => {
    expect(getPriorityLabel('A')).toBe(PRIORITY_LABELS.A);
  });

  it('B キーで B のラベルを返す', () => {
    expect(getPriorityLabel('B')).toBe(PRIORITY_LABELS.B);
  });

  it('C キーで C のラベルを返す', () => {
    expect(getPriorityLabel('C')).toBe(PRIORITY_LABELS.C);
  });
});

describe('formatPriorityLabel', () => {
  it('A は "A（最優先）即時着手すべき"', () => {
    expect(formatPriorityLabel('A')).toBe('A（最優先）即時着手すべき');
  });

  it('B は "B（中優先）重要だが緊急ではない"', () => {
    expect(formatPriorityLabel('B')).toBe('B（中優先）重要だが緊急ではない');
  });

  it('C は "C（低優先）リソースが余れば対応"', () => {
    expect(formatPriorityLabel('C')).toBe('C（低優先）リソースが余れば対応');
  });
});

describe('型安全性', () => {
  it('PriorityKey に絞れば全件 formatPriorityLabel を適用可能', () => {
    const keys: PriorityKey[] = ['A', 'B', 'C'];
    const formatted = keys.map((k) => formatPriorityLabel(k));
    expect(formatted).toHaveLength(3);
    formatted.forEach((s) => expect(s).toMatch(/^[ABC]（(最|中|低)優先）/));
  });
});
