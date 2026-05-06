import { describe, expect, it } from 'vitest';
import type { Case } from './case';
import { buildRelatedCaseHighlights } from './relatedCaseHighlight';

const createCase = (id: string, partial: Partial<Case>): Case => ({
  id,
  title: `title-${id}`,
  body: `body-${id}`,
  correctPriority: 'A',
  explanation: `exp-${id}`,
  ...partial,
});

describe('buildRelatedCaseHighlights (PBI-028)', () => {
  it('同一人物・同一部署の一致を抽出できる', () => {
    const current = createCase('case-current', {
      characters: ['田中課長', '佐藤部長'],
      departments: ['営業部'],
    });
    const previous = [
      createCase('case-001', { characters: ['田中課長'], departments: ['営業部'] }),
      createCase('case-002', { characters: ['田中課長'], departments: ['品質保証部'] }),
      createCase('case-003', { characters: ['鈴木課長'], departments: ['営業部'] }),
    ];

    const result = buildRelatedCaseHighlights(current, previous);
    expect(result).toHaveLength(2);

    const character = result.find((r) => r.kind === 'character' && r.value === '田中課長');
    expect(character?.matchedCaseIds).toEqual(['case-001', 'case-002']);

    const department = result.find((r) => r.kind === 'department' && r.value === '営業部');
    expect(department?.matchedCaseIds).toEqual(['case-001', 'case-003']);
  });

  it('一致がない場合は空配列を返す（安全フォールバック）', () => {
    const current = createCase('case-current', {
      characters: ['山田課長'],
      departments: ['企画部'],
    });
    const previous = [createCase('case-001', { characters: ['田中課長'], departments: ['営業部'] })];
    expect(buildRelatedCaseHighlights(current, previous)).toEqual([]);
  });

  it('currentCase にメタデータ未設定でも空配列を返す', () => {
    const current = createCase('case-current', {});
    const previous = [createCase('case-001', { characters: ['田中課長'], departments: ['営業部'] })];
    expect(buildRelatedCaseHighlights(current, previous)).toEqual([]);
  });

  it('同一案件IDの重複履歴は件数を重複カウントしない', () => {
    const current = createCase('case-current', {
      characters: ['田中課長'],
    });
    const previous = [
      createCase('case-001', { characters: ['田中課長'] }),
      createCase('case-001', { characters: ['田中課長'] }),
    ];

    const result = buildRelatedCaseHighlights(current, previous);
    expect(result).toHaveLength(1);
    expect(result[0]?.matchedCaseIds).toEqual(['case-001']);
  });
});
