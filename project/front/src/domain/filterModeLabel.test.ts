import { describe, expect, it } from 'vitest';
import { FILTER_MODE_LABELS, type FilterModeLabel } from './filterModeLabel';
import { FILTER_MODES, type FilterMode } from './random';

describe('filterModeLabel（PBI-042 / TASK-008）', () => {
  it('FILTER_MODES の全件にラベル定義が存在する', () => {
    for (const mode of FILTER_MODES) {
      expect(FILTER_MODE_LABELS[mode]).toBeDefined();
    }
    // 余分なキーが混入していないこと
    expect(Object.keys(FILTER_MODE_LABELS).sort()).toEqual([...FILTER_MODES].sort());
  });

  it('各エントリは FilterModeLabel 型（label / aria が非空文字列）', () => {
    for (const mode of FILTER_MODES) {
      const entry: FilterModeLabel = FILTER_MODE_LABELS[mode];
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.aria).toBe('string');
      expect(entry.aria.length).toBeGreaterThan(0);
    }
  });

  it('現行 ModeSelector の labelOf / ariaOf 文言と一致する', () => {
    expect(FILTER_MODE_LABELS.all).toEqual({ label: '全件', aria: '全件から出題' });
    expect(FILTER_MODE_LABELS.A).toEqual({ label: 'Aのみ', aria: '優先度Aのみ出題' });
    expect(FILTER_MODE_LABELS.B).toEqual({ label: 'Bのみ', aria: '優先度Bのみ出題' });
    expect(FILTER_MODE_LABELS.C).toEqual({ label: 'Cのみ', aria: '優先度Cのみ出題' });
  });

  it('Record<FilterMode, ...> として型安全に参照できる', () => {
    const m: FilterMode = 'all';
    const label: FilterModeLabel = FILTER_MODE_LABELS[m];
    expect(label.label).toBe('全件');
  });
});
