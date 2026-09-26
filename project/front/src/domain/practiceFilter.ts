import type { Case, Difficulty } from './case';
import { CASE_PATTERN_MAP } from './patternWeakness';

/**
 * 出題範囲（PBI-109）。正答（A/B/C）で絞ると答えが分かるため、案件の型と難易度で選ぶ。
 * null は「すべて」。
 */
export interface PracticeFilter {
  readonly patternId: number | null;
  readonly difficulty: Difficulty | null;
}

export const ALL_CASES_FILTER: PracticeFilter = { patternId: null, difficulty: null };

export function filterCases(cases: readonly Case[], filter: PracticeFilter): Case[] {
  return cases.filter(
    (item) =>
      (filter.patternId === null || CASE_PATTERN_MAP[item.id] === filter.patternId) &&
      (filter.difficulty === null || item.difficulty === filter.difficulty),
  );
}

export function isSameFilter(a: PracticeFilter, b: PracticeFilter): boolean {
  return a.patternId === b.patternId && a.difficulty === b.difficulty;
}

/** `?pattern=N`（パターン詳細の「この型の問題を解く」）から出題範囲を作る。 */
export function filterFromSearch(search: string): PracticeFilter {
  const patternId = Number(new URLSearchParams(search).get('pattern'));
  return Number.isInteger(patternId) && patternId >= 1 && patternId <= 20
    ? { patternId, difficulty: null }
    : ALL_CASES_FILTER;
}
