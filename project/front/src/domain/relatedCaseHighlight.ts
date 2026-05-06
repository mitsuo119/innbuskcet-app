import type { Case } from './case';

export type RelatedHighlightKind = 'character' | 'department';

export interface RelatedCaseHighlight {
  kind: RelatedHighlightKind;
  value: string;
  matchedCaseIds: readonly string[];
}

const normalize = (value: string): string => value.trim().toLocaleLowerCase('ja-JP');

function toNormalizedMap(values: readonly string[] | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!values) return map;
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed.length === 0) continue;
    const key = normalize(trimmed);
    if (!map.has(key)) {
      map.set(key, trimmed);
    }
  }
  return map;
}

function findByField(
  kind: RelatedHighlightKind,
  currentValues: readonly string[] | undefined,
  previousCases: readonly Case[],
): RelatedCaseHighlight[] {
  const currentMap = toNormalizedMap(currentValues);
  if (currentMap.size === 0) return [];

  const hitMap = new Map<string, Set<string>>();

  for (const prev of previousCases) {
    const prevValues = kind === 'character' ? prev.characters : prev.departments;
    if (!prevValues || prevValues.length === 0) continue;
    for (const raw of prevValues) {
      const key = normalize(raw);
      if (!currentMap.has(key)) continue;
      const set = hitMap.get(key) ?? new Set<string>();
      set.add(prev.id);
      hitMap.set(key, set);
    }
  }

  return Array.from(hitMap.entries())
    .map(([key, ids]) => ({
      kind,
      value: currentMap.get(key) ?? key,
      matchedCaseIds: Array.from(ids),
    }))
    .sort(
      (a, b) => b.matchedCaseIds.length - a.matchedCaseIds.length || a.value.localeCompare(b.value),
    );
}

/**
 * PBI-028: セッション内（既出案件）から、同一人物/同一部署の関連を抽出する。
 */
export function buildRelatedCaseHighlights(
  currentCase: Case,
  previousCases: readonly Case[],
): RelatedCaseHighlight[] {
  return [
    ...findByField('character', currentCase.characters, previousCases),
    ...findByField('department', currentCase.departments, previousCases),
  ];
}
