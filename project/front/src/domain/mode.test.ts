import { describe, expect, it } from 'vitest';
import { applyModeChange, initialMode } from './mode';
import type { Case, Priority } from './case';
import { initialHistory } from './history';
import { initialScore } from './score';
import { pushHistory } from './history';
import { addScore } from './score';

const c = (id: string, p: Priority = 'A'): Case => ({
  id,
  title: `t-${id}`,
  body: `b-${id}`,
  correctPriority: p,
  explanation: `e-${id}`,
});

describe('initialMode (PBI-018)', () => {
  it("セッション初期モードは 'all'（リロードで常に全件に戻る）", () => {
    expect(initialMode).toBe('all');
  });
});

describe('applyModeChange() (PBI-018)', () => {
  const cases = [c('a1', 'A'), c('a2', 'A'), c('b1', 'B'), c('c1', 'C')];

  it('モード切替で履歴が初期化される', () => {
    let history = initialHistory;
    history = pushHistory(history, {
      caseId: 'a1',
      judgement: 'correct',
      correctPriority: 'A',
    });
    history = pushHistory(history, {
      caseId: 'b1',
      judgement: 'incorrect',
      correctPriority: 'B',
    });
    expect(history).toHaveLength(2);

    const reset = applyModeChange(cases, 'B', () => 0);
    expect(reset.history).toEqual(initialHistory);
    expect(reset.history).toHaveLength(0);
  });

  it('モード切替でカウンタが初期化される', () => {
    const after = addScore(addScore(initialScore, 'correct'), 'incorrect');
    expect(after).toEqual({ total: 2, correct: 1 });

    const reset = applyModeChange(cases, 'A', () => 0);
    expect(reset.score).toEqual(initialScore);
    expect(reset.score).toEqual({ total: 0, correct: 0 });
  });

  it("mode='B' に切替えると B のみが current に選ばれる", () => {
    const reset = applyModeChange(cases, 'B', () => 0);
    expect(reset.mode).toBe('B');
    expect(reset.current?.correctPriority).toBe('B');
    expect(reset.current?.id).toBe('b1');
  });

  it("mode='all' に切替えると全件から選ばれる", () => {
    const reset = applyModeChange(cases, 'all', () => 0);
    expect(reset.mode).toBe('all');
    expect(reset.current?.id).toBe('a1');
  });

  it('該当 0 件のモードに切替えると current は null', () => {
    const onlyA = [c('a1', 'A'), c('a2', 'A')];
    const reset = applyModeChange(onlyA, 'C', () => 0);
    expect(reset.mode).toBe('C');
    expect(reset.current).toBeNull();
    expect(reset.history).toEqual(initialHistory);
    expect(reset.score).toEqual(initialScore);
  });

  it('入力 cases 配列を破壊しない', () => {
    const snapshot = [...cases];
    applyModeChange(cases, 'A', () => 0);
    expect(cases).toEqual(snapshot);
  });
});
