import { describe, expect, it } from 'vitest';
import {
  EMPTY_LEARNING_RECORD,
  LEARNING_RECORD_STORAGE_KEY,
  MAX_RECORD_ANSWERS,
  appendAnswer,
  appendSelfScore,
  clearLearningRecord,
  loadLearningRecord,
  parseLearningRecord,
  saveLearningRecord,
} from './learningRecord';
import type { HistoryItem } from './history';
import { SELF_SCORE_AXES, type SelfScoreEntry } from './selfScore';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

const answer = (caseId: string): HistoryItem => ({
  caseId,
  judgement: 'correct',
  correctPriority: 'A',
  learningStyle: 'deep',
  answeredPriority: 'A',
});

const selfScore = Object.fromEntries(
  SELF_SCORE_AXES.map((axis, i) => [axis, (i % 5) + 1]),
) as SelfScoreEntry;
const firstAxis = SELF_SCORE_AXES[0];

describe('learningRecord（PBI-107）', () => {
  it('保存した記録を再読み込みで復元できる', () => {
    const storage = new MemoryStorage();
    const record = appendSelfScore(
      appendAnswer(EMPTY_LEARNING_RECORD, answer('case-001')),
      selfScore,
    );
    expect(saveLearningRecord(record, storage)).toBe(true);
    expect(loadLearningRecord(storage)).toEqual(record);
  });

  it('消去すると保存先からも削除される', () => {
    const storage = new MemoryStorage();
    saveLearningRecord(appendAnswer(EMPTY_LEARNING_RECORD, answer('case-001')), storage);
    expect(clearLearningRecord(storage)).toBe(true);
    expect(storage.getItem(LEARNING_RECORD_STORAGE_KEY)).toBeNull();
    expect(loadLearningRecord(storage)).toEqual(EMPTY_LEARNING_RECORD);
  });

  it('壊れた値や不正な項目は捨てる', () => {
    expect(parseLearningRecord('{')).toEqual(EMPTY_LEARNING_RECORD);
    expect(parseLearningRecord('null')).toEqual(EMPTY_LEARNING_RECORD);
    const parsed = parseLearningRecord(
      JSON.stringify({
        answers: [answer('case-002'), { caseId: 'x', judgement: 'maybe', correctPriority: 'A' }],
        selfScores: [selfScore, { ...selfScore, [firstAxis]: 9 }],
        userInput: '記述文',
      }),
    );
    expect(parsed.answers).toEqual([answer('case-002')]);
    expect(parsed.selfScores).toEqual([selfScore]);
    expect(parsed).not.toHaveProperty('userInput');
  });

  it('上限を超えた分は古いものから捨てる', () => {
    let record = EMPTY_LEARNING_RECORD;
    for (let i = 0; i < MAX_RECORD_ANSWERS + 5; i++) record = appendAnswer(record, answer(`c${i}`));
    expect(record.answers).toHaveLength(MAX_RECORD_ANSWERS);
    expect(record.answers[0].caseId).toBe('c5');
  });

  it('保存できない環境では false を返し、例外を投げない', () => {
    const failing = new MemoryStorage();
    failing.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(saveLearningRecord(EMPTY_LEARNING_RECORD, failing)).toBe(false);
  });
});
