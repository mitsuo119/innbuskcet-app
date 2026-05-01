import { describe, expect, it } from 'vitest';
import { MAX_HISTORY, initialHistory, pushHistory, type HistoryItem } from './history';

const item = (caseId: string, judgement: 'correct' | 'incorrect'): HistoryItem => ({
  caseId,
  judgement,
  correctPriority: 'A',
});

describe('pushHistory()', () => {
  it('初期履歴は空配列', () => {
    expect(initialHistory).toEqual([]);
  });

  it('1件追加すると長さ1になる', () => {
    const h = pushHistory(initialHistory, item('case-001', 'correct'));
    expect(h).toHaveLength(1);
    expect(h[0]).toEqual({
      caseId: 'case-001',
      judgement: 'correct',
      correctPriority: 'A',
    });
  });

  it('元の配列を変更しない（イミュータブル）', () => {
    const base: HistoryItem[] = [item('case-001', 'correct')];
    const snapshot = [...base];
    const next = pushHistory(base, item('case-002', 'incorrect'));
    expect(base).toEqual(snapshot);
    expect(next).not.toBe(base);
    expect(next).toHaveLength(2);
  });

  it('追加順（時系列）が末尾に来る', () => {
    let h: readonly HistoryItem[] = initialHistory;
    h = pushHistory(h, item('case-001', 'correct'));
    h = pushHistory(h, item('case-002', 'incorrect'));
    h = pushHistory(h, item('case-003', 'correct'));
    expect(h.map((x) => x.caseId)).toEqual(['case-001', 'case-002', 'case-003']);
  });

  it(`${MAX_HISTORY}件までは全件保持される`, () => {
    let h: readonly HistoryItem[] = initialHistory;
    for (let i = 0; i < MAX_HISTORY; i += 1) {
      h = pushHistory(h, item(`case-${i}`, 'correct'));
    }
    expect(h).toHaveLength(MAX_HISTORY);
    expect(h[0].caseId).toBe('case-0');
    expect(h[MAX_HISTORY - 1].caseId).toBe(`case-${MAX_HISTORY - 1}`);
  });

  it(`${MAX_HISTORY + 1}件目を追加すると最古が落ちる（FIFO・直近${MAX_HISTORY}件保持）`, () => {
    let h: readonly HistoryItem[] = initialHistory;
    for (let i = 0; i < MAX_HISTORY + 1; i += 1) {
      h = pushHistory(h, item(`case-${i}`, i % 2 === 0 ? 'correct' : 'incorrect'));
    }
    expect(h).toHaveLength(MAX_HISTORY);
    // 最古 case-0 が落ち、case-1 〜 case-10 が残る
    expect(h[0].caseId).toBe('case-1');
    expect(h[MAX_HISTORY - 1].caseId).toBe(`case-${MAX_HISTORY}`);
  });

  it('大量追加でも常に直近10件のみが保持される', () => {
    let h: readonly HistoryItem[] = initialHistory;
    for (let i = 0; i < 50; i += 1) {
      h = pushHistory(h, item(`case-${i}`, 'correct'));
    }
    expect(h).toHaveLength(MAX_HISTORY);
    expect(h[0].caseId).toBe('case-40');
    expect(h[MAX_HISTORY - 1].caseId).toBe('case-49');
  });

  it('HistoryItem は judgement と correctPriority を独立に保持する', () => {
    const h = pushHistory(initialHistory, {
      caseId: 'case-x',
      judgement: 'incorrect',
      correctPriority: 'B',
    });
    expect(h[0]).toEqual({
      caseId: 'case-x',
      judgement: 'incorrect',
      correctPriority: 'B',
    });
  });
});
