import { describe, expect, it } from 'vitest';
import { loadCases } from './loader';
import { ALL_CASES_FILTER, filterCases, filterFromSearch, isSameFilter } from './practiceFilter';
import { CASE_PATTERN_MAP, patternIdOf } from './patternWeakness';
import { SCENARIOS, findScenario } from './scenario';
import { createScenarioExamSession, loadExamSession, saveExamSession } from './examTimer';

const cases = loadCases();

describe('practiceFilter（PBI-109）', () => {
  it('条件なしは全件', () => {
    expect(filterCases(cases, ALL_CASES_FILTER)).toHaveLength(cases.length);
  });

  it('パターンと難易度で絞り込める', () => {
    const patternId = CASE_PATTERN_MAP[cases[0].id];
    const difficulty = cases[0].difficulty!;
    const out = filterCases(cases, { patternId, difficulty });
    expect(out.length).toBeGreaterThan(0);
    expect(
      out.every((c) => CASE_PATTERN_MAP[c.id] === patternId && c.difficulty === difficulty),
    ).toBe(true);
  });

  it('20パターンすべてに1問以上ある', () => {
    for (let id = 1; id <= 20; id++) {
      expect(filterCases(cases, { patternId: id, difficulty: null }).length).toBeGreaterThan(0);
    }
  });

  it('?pattern=N を読み取り、範囲外は無視する', () => {
    expect(filterFromSearch('?pattern=7')).toEqual({ patternId: 7, difficulty: null });
    expect(filterFromSearch('?pattern=21')).toEqual(ALL_CASES_FILTER);
    expect(filterFromSearch('?pattern=abc')).toEqual(ALL_CASES_FILTER);
    expect(filterFromSearch('')).toEqual(ALL_CASES_FILTER);
  });

  it('isSameFilter', () => {
    expect(isSameFilter(ALL_CASES_FILTER, { patternId: null, difficulty: null })).toBe(true);
    expect(isSameFilter(ALL_CASES_FILTER, { patternId: 1, difficulty: null })).toBe(false);
  });
});

describe('scenario（PBI-108）', () => {
  it('シナリオを読み込め、案件IDは通常の案件と重複しない', () => {
    expect(SCENARIOS.length).toBeGreaterThan(0);
    const ids = new Set(cases.map((c) => c.id));
    for (const scenario of SCENARIOS) {
      expect(scenario.cases.length).toBeGreaterThanOrEqual(5);
      for (const c of scenario.cases) expect(ids.has(c.id)).toBe(false);
    }
  });

  it('解説で示すパターン番号と集計に使う番号が一致する', () => {
    for (const scenario of SCENARIOS) {
      for (const c of scenario.cases) {
        const id = patternIdOf(c.id);
        expect(id).toBeDefined();
        expect(c.explanation).toContain(`（パターン${id}）`);
      }
    }
  });

  it('シナリオ演習のセッションは案件数・制限時間・順序を保つ', () => {
    const scenario = SCENARIOS[0];
    const session = createScenarioExamSession(scenario);
    expect(session.scenarioId).toBe(scenario.id);
    expect(session.totalQuestions).toBe(scenario.cases.length);
    expect(session.timeLimit).toBe(scenario.timeLimitMinutes * 60);
    expect(session.questionIds).toEqual(scenario.cases.map((c) => c.id));
    saveExamSession(session);
    expect(loadExamSession()?.scenarioId).toBe(scenario.id);
    expect(findScenario(session.scenarioId)).toBe(scenario);
    expect(findScenario('unknown')).toBeUndefined();
  });
});
