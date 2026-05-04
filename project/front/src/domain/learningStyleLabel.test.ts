import { describe, expect, it } from 'vitest';
import { LEARNING_STYLES, type LearningStyle } from './learningStyle';
import { LEARNING_STYLE_LABELS, type LearningStyleLabel } from './learningStyleLabel';

const ALL_STYLES: readonly LearningStyle[] = ['quick', 'deep', 'exam'] as const;

describe('learningStyleLabel（PBI-042 / TASK-008）', () => {
  it('全 LearningStyle にラベル定義が存在する', () => {
    for (const s of ALL_STYLES) {
      expect(LEARNING_STYLE_LABELS[s]).toBeDefined();
    }
    expect(Object.keys(LEARNING_STYLE_LABELS).sort()).toEqual([...ALL_STYLES].sort());
  });

  it('各エントリは LearningStyleLabel 型（label / tooltip / ariaLabel が非空）', () => {
    for (const s of ALL_STYLES) {
      const entry: LearningStyleLabel = LEARNING_STYLE_LABELS[s];
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.tooltip).toBe('string');
      expect(entry.tooltip.length).toBeGreaterThan(0);
      expect(typeof entry.ariaLabel).toBe('string');
      expect(entry.ariaLabel.length).toBeGreaterThan(0);
    }
  });

  it('label は LEARNING_STYLES の label と一致する（単一定義源の整合）', () => {
    for (const s of ALL_STYLES) {
      expect(LEARNING_STYLE_LABELS[s].label).toBe(LEARNING_STYLES[s].label);
    }
  });

  it('現行 LearningStyleToggle.tsx の TOOLTIPS 文言と一致する', () => {
    expect(LEARNING_STYLE_LABELS.quick.tooltip).toBe(
      '速習モード: 解答のみ・優先度判断の練習（約5分/問）',
    );
    expect(LEARNING_STYLE_LABELS.deep.tooltip).toBe(
      'じっくりモード: 記述あり・模範解答と比較（約10分/問）',
    );
    expect(LEARNING_STYLE_LABELS.exam.tooltip).toBe('模試モード: 20問90分・本番形式で実力測定');
  });

  it('ariaLabel は "label：description — tooltip" 形式である', () => {
    for (const s of ALL_STYLES) {
      const meta = LEARNING_STYLES[s];
      const entry = LEARNING_STYLE_LABELS[s];
      expect(entry.ariaLabel).toBe(`${meta.label}：${meta.description} — ${entry.tooltip}`);
    }
  });
});
