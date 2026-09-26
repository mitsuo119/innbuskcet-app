import type { Priority } from './case';
import type { HistoryItem } from './history';
import type { Judgement } from './judge';
import type { LearningStyle } from './learningStyle';
import { SELF_SCORE_AXES, SELF_SCORE_MAX, SELF_SCORE_MIN, type SelfScoreEntry } from './selfScore';

/**
 * ブラウザに保存する学習記録（PBI-107）。
 * 回答の記録と自己採点のみを持ち、記述欄の入力文は含めない。
 */
export interface LearningRecord {
  readonly answers: readonly HistoryItem[];
  readonly selfScores: readonly SelfScoreEntry[];
}

export const EMPTY_LEARNING_RECORD: LearningRecord = { answers: [], selfScores: [] };

/** 保存件数の上限（古いものから捨てる）。 */
export const MAX_RECORD_ANSWERS = 500;
export const MAX_RECORD_SELF_SCORES = 200;

export const LEARNING_RECORD_STORAGE_KEY = 'inbasket.learningRecord.v1';

const PRIORITIES: readonly Priority[] = ['A', 'B', 'C'];
const JUDGEMENTS: readonly Judgement[] = ['correct', 'incorrect'];
const LEARNING_STYLES: readonly LearningStyle[] = ['quick', 'deep', 'exam'];

function toHistoryItem(value: unknown): HistoryItem | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.caseId !== 'string' || v.caseId.length === 0) return null;
  if (!JUDGEMENTS.includes(v.judgement as Judgement)) return null;
  if (!PRIORITIES.includes(v.correctPriority as Priority)) return null;
  const item: HistoryItem = {
    caseId: v.caseId,
    judgement: v.judgement as Judgement,
    correctPriority: v.correctPriority as Priority,
  };
  if (LEARNING_STYLES.includes(v.learningStyle as LearningStyle)) {
    item.learningStyle = v.learningStyle as LearningStyle;
  }
  if (PRIORITIES.includes(v.answeredPriority as Priority)) {
    item.answeredPriority = v.answeredPriority as Priority;
  }
  return item;
}

function toSelfScoreEntry(value: unknown): SelfScoreEntry | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const entry: Partial<Record<string, number>> = {};
  for (const axis of SELF_SCORE_AXES) {
    const score = v[axis];
    if (!Number.isInteger(score) || (score as number) < SELF_SCORE_MIN) return null;
    if ((score as number) > SELF_SCORE_MAX) return null;
    entry[axis] = score as number;
  }
  return entry as SelfScoreEntry;
}

/** 保存値を検証して復元する。壊れた値や想定外の項目は捨てる。 */
export function parseLearningRecord(raw: string | null): LearningRecord {
  if (!raw) return EMPTY_LEARNING_RECORD;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return EMPTY_LEARNING_RECORD;
    const { answers, selfScores } = data as Record<string, unknown>;
    return {
      answers: (Array.isArray(answers) ? answers : [])
        .map(toHistoryItem)
        .filter((item): item is HistoryItem => item !== null)
        .slice(-MAX_RECORD_ANSWERS),
      selfScores: (Array.isArray(selfScores) ? selfScores : [])
        .map(toSelfScoreEntry)
        .filter((entry): entry is SelfScoreEntry => entry !== null)
        .slice(-MAX_RECORD_SELF_SCORES),
    };
  } catch {
    return EMPTY_LEARNING_RECORD;
  }
}

function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadLearningRecord(
  storage: Storage | undefined = browserStorage(),
): LearningRecord {
  try {
    return parseLearningRecord(storage?.getItem(LEARNING_RECORD_STORAGE_KEY) ?? null);
  } catch {
    return EMPTY_LEARNING_RECORD;
  }
}

/** 保存できたら true。保存できない環境でも例外は投げない（演習は続けられる）。 */
export function saveLearningRecord(
  record: LearningRecord,
  storage: Storage | undefined = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(LEARNING_RECORD_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearLearningRecord(storage: Storage | undefined = browserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(LEARNING_RECORD_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function appendAnswer(record: LearningRecord, item: HistoryItem): LearningRecord {
  return { ...record, answers: [...record.answers, item].slice(-MAX_RECORD_ANSWERS) };
}

export function appendSelfScore(record: LearningRecord, entry: SelfScoreEntry): LearningRecord {
  return {
    ...record,
    selfScores: [...record.selfScores, entry].slice(-MAX_RECORD_SELF_SCORES),
  };
}
