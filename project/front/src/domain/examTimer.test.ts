import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EXAM_ANSWER_USER_INPUT_MAX_LENGTH,
  EXAM_TIME_LIMIT_SECONDS,
  EXAM_TOTAL_QUESTIONS,
  clearExamProgress,
  clearExamSession,
  createExamSession,
  formatTime,
  getElapsedSeconds,
  getRemainingSeconds,
  isTimeUp,
  loadExamProgress,
  loadExamSession,
  saveExamProgress,
  saveExamSession,
  type ExamAnswerEntry,
  type ExamProgressSnapshot,
  type ExamSession,
} from './examTimer';

const STORAGE_KEY = 'inbasket.examSession.v1';
const PROGRESS_STORAGE_KEY = 'examProgress';

const buildIds = (n: number): string[] =>
  Array.from({ length: n }, (_, i) => `case-${String(i + 1).padStart(3, '0')}`);

describe('examTimer（PBI-027 / TASK-001）', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });
  afterEach(() => {
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  describe('定数', () => {
    it('EXAM_TOTAL_QUESTIONS は 20', () => {
      expect(EXAM_TOTAL_QUESTIONS).toBe(20);
    });
    it('EXAM_TIME_LIMIT_SECONDS は 90 分（5400 秒）', () => {
      expect(EXAM_TIME_LIMIT_SECONDS).toBe(90 * 60);
    });
  });

  describe('createExamSession', () => {
    it('40 件の候補から正確に 20 件を選択する', () => {
      const session = createExamSession(buildIds(40));
      expect(session.questionIds).toHaveLength(20);
      expect(session.totalQuestions).toBe(20);
      expect(session.timeLimit).toBe(EXAM_TIME_LIMIT_SECONDS);
      // 全件が候補集合に含まれる
      const set = new Set(buildIds(40));
      expect(session.questionIds.every((id) => set.has(id))).toBe(true);
      // 重複しない
      expect(new Set(session.questionIds).size).toBe(20);
    });

    it('startedAt は Date.now() 直近の値', () => {
      const before = Date.now();
      const session = createExamSession(buildIds(20));
      const after = Date.now();
      expect(session.startedAt).toBeGreaterThanOrEqual(before);
      expect(session.startedAt).toBeLessThanOrEqual(after);
    });

    it('候補が 20 件未満なら例外を投げる', () => {
      expect(() => createExamSession(buildIds(19))).toThrow();
    });
  });

  describe('getElapsedSeconds / getRemainingSeconds / isTimeUp', () => {
    const baseSession: ExamSession = {
      totalQuestions: 20,
      timeLimit: EXAM_TIME_LIMIT_SECONDS,
      startedAt: 1_000_000,
      questionIds: buildIds(20),
    };

    it('開始直後（経過 0s）は残 5400s で時間切れではない', () => {
      expect(getElapsedSeconds(baseSession, 1_000_000)).toBe(0);
      expect(getRemainingSeconds(baseSession, 1_000_000)).toBe(EXAM_TIME_LIMIT_SECONDS);
      expect(isTimeUp(baseSession, 1_000_000)).toBe(false);
    });

    it('60 秒経過時は経過 60s / 残 5340s', () => {
      const now = 1_000_000 + 60_000;
      expect(getElapsedSeconds(baseSession, now)).toBe(60);
      expect(getRemainingSeconds(baseSession, now)).toBe(EXAM_TIME_LIMIT_SECONDS - 60);
      expect(isTimeUp(baseSession, now)).toBe(false);
    });

    it('残り 0 秒で時間切れ（境界値）', () => {
      const now = 1_000_000 + EXAM_TIME_LIMIT_SECONDS * 1000;
      expect(getRemainingSeconds(baseSession, now)).toBe(0);
      expect(isTimeUp(baseSession, now)).toBe(true);
    });

    it('制限時間超過（負値）は 0 にクランプし時間切れ', () => {
      const now = 1_000_000 + (EXAM_TIME_LIMIT_SECONDS + 120) * 1000;
      expect(getRemainingSeconds(baseSession, now)).toBe(0);
      expect(isTimeUp(baseSession, now)).toBe(true);
    });

    it('開始時刻より前（時計巻き戻り）は経過 0s 扱い', () => {
      const now = 999_000;
      expect(getElapsedSeconds(baseSession, now)).toBe(0);
      expect(getRemainingSeconds(baseSession, now)).toBe(EXAM_TIME_LIMIT_SECONDS);
    });
  });

  describe('formatTime', () => {
    it('"00:00" / "00:30" / "01:30"', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(90)).toBe('01:30');
    });
    it('"90:00"（90 分・MM 2 桁超え許容）', () => {
      expect(formatTime(90 * 60)).toBe('90:00');
    });
    it('負値・NaN は "00:00" にクランプ', () => {
      expect(formatTime(-1)).toBe('00:00');
      expect(formatTime(Number.NaN)).toBe('00:00');
    });
    it('小数点以下は切り捨て', () => {
      expect(formatTime(59.9)).toBe('00:59');
    });
  });

  describe('saveExamSession / loadExamSession ラウンドトリップ', () => {
    it('保存して読み戻すと同一内容になる', () => {
      const session: ExamSession = {
        totalQuestions: 20,
        timeLimit: EXAM_TIME_LIMIT_SECONDS,
        startedAt: 1_700_000_000_000,
        questionIds: buildIds(20),
      };
      saveExamSession(session);
      const loaded = loadExamSession();
      expect(loaded).toEqual(session);
    });

    it('未保存時は null', () => {
      expect(loadExamSession()).toBeNull();
    });

    it('不正 JSON は null フォールバック', () => {
      window.sessionStorage.setItem(STORAGE_KEY, '{not-json');
      expect(loadExamSession()).toBeNull();
    });

    it('必須キー欠落（questionIds なし）は null フォールバック', () => {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ totalQuestions: 20, timeLimit: 5400, startedAt: 1 }),
      );
      expect(loadExamSession()).toBeNull();
    });

    it('型不一致（questionIds に number 混入）は null フォールバック', () => {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          totalQuestions: 20,
          timeLimit: 5400,
          startedAt: 1,
          questionIds: ['case-001', 2, 'case-003'],
        }),
      );
      expect(loadExamSession()).toBeNull();
    });
  });

  describe('clearExamSession', () => {
    it('保存後に削除すると loadExamSession は null', () => {
      const session: ExamSession = {
        totalQuestions: 20,
        timeLimit: EXAM_TIME_LIMIT_SECONDS,
        startedAt: 1_700_000_000_000,
        questionIds: buildIds(20),
      };
      saveExamSession(session);
      expect(loadExamSession()).not.toBeNull();
      clearExamSession();
      expect(loadExamSession()).toBeNull();
    });
  });

  describe('saveExamProgress / loadExamProgress / clearExamProgress（PBI-041）', () => {
    const sample: ExamProgressSnapshot = {
      examIndex: 5,
      answeredIds: ['case-001', 'case-002', 'case-003'],
      elapsedMs: 123_456,
    };

    it('保存して読み戻すと同一内容になる', () => {
      saveExamProgress(sample);
      expect(loadExamProgress()).toEqual(sample);
    });

    it('未保存時は null', () => {
      expect(loadExamProgress()).toBeNull();
    });

    it('不正 JSON は null フォールバック', () => {
      window.sessionStorage.setItem(PROGRESS_STORAGE_KEY, '{not-json');
      expect(loadExamProgress()).toBeNull();
    });

    it('必須キー欠落（answeredIds なし）は null フォールバック', () => {
      window.sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({ examIndex: 1, elapsedMs: 1000 }),
      );
      expect(loadExamProgress()).toBeNull();
    });

    it('型不一致（answeredIds に number 混入）は null フォールバック', () => {
      window.sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({ examIndex: 1, answeredIds: ['case-001', 2], elapsedMs: 1000 }),
      );
      expect(loadExamProgress()).toBeNull();
    });

    it('examIndex が負値は null フォールバック', () => {
      window.sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({ examIndex: -1, answeredIds: [], elapsedMs: 0 }),
      );
      expect(loadExamProgress()).toBeNull();
    });

    it('elapsedMs が負値は null フォールバック', () => {
      window.sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({ examIndex: 0, answeredIds: [], elapsedMs: -1 }),
      );
      expect(loadExamProgress()).toBeNull();
    });

    it('clearExamProgress で削除できる', () => {
      saveExamProgress(sample);
      expect(loadExamProgress()).not.toBeNull();
      clearExamProgress();
      expect(loadExamProgress()).toBeNull();
    });

    it('Exam セッションキー（v1）と進行状況キー（examProgress）は独立', () => {
      saveExamProgress(sample);
      const session: ExamSession = {
        totalQuestions: 20,
        timeLimit: EXAM_TIME_LIMIT_SECONDS,
        startedAt: 1_700_000_000_000,
        questionIds: buildIds(20),
      };
      saveExamSession(session);
      clearExamSession();
      expect(loadExamProgress()).toEqual(sample);
      expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  // PBI-041 / TASK-006：中断・再開のラウンドトリップと境界値の追加カバレッジ
  describe('saveExamProgress → loadExamProgress 境界値ラウンドトリップ（PBI-041 / TASK-006）', () => {
    it('examIndex=0（先頭問・未回答）でも同一内容で復元できる', () => {
      const snap: ExamProgressSnapshot = {
        examIndex: 0,
        answeredIds: [],
        elapsedMs: 0,
      };
      saveExamProgress(snap);
      expect(loadExamProgress()).toEqual(snap);
    });

    it('examIndex=最終問（19）でも同一内容で復元できる', () => {
      const snap: ExamProgressSnapshot = {
        examIndex: EXAM_TOTAL_QUESTIONS - 1,
        answeredIds: buildIds(EXAM_TOTAL_QUESTIONS - 1),
        elapsedMs: EXAM_TIME_LIMIT_SECONDS * 1000 - 1,
      };
      saveExamProgress(snap);
      expect(loadExamProgress()).toEqual(snap);
    });

    it('examIndex=中間問（10）でも同一内容で復元できる', () => {
      const snap: ExamProgressSnapshot = {
        examIndex: 10,
        answeredIds: buildIds(10),
        elapsedMs: 60_000,
      };
      saveExamProgress(snap);
      expect(loadExamProgress()).toEqual(snap);
    });

    it('elapsedMs=0（境界・開始直後）を復元できる', () => {
      const snap: ExamProgressSnapshot = {
        examIndex: 0,
        answeredIds: [],
        elapsedMs: 0,
      };
      saveExamProgress(snap);
      expect(loadExamProgress()?.elapsedMs).toBe(0);
    });

    it('elapsedMs が大きな値（Number.MAX_SAFE_INTEGER）でも復元できる', () => {
      const snap: ExamProgressSnapshot = {
        examIndex: 5,
        answeredIds: buildIds(5),
        elapsedMs: Number.MAX_SAFE_INTEGER,
      };
      saveExamProgress(snap);
      expect(loadExamProgress()?.elapsedMs).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('answeredIds が空配列のときも空配列のまま復元される', () => {
      const snap: ExamProgressSnapshot = {
        examIndex: 0,
        answeredIds: [],
        elapsedMs: 1234,
      };
      saveExamProgress(snap);
      const loaded = loadExamProgress();
      expect(loaded).not.toBeNull();
      expect(loaded?.answeredIds).toEqual([]);
      expect(Array.isArray(loaded?.answeredIds)).toBe(true);
    });

    it('clearExamProgress 後の loadExamProgress は null を返す', () => {
      const snap: ExamProgressSnapshot = {
        examIndex: 3,
        answeredIds: ['case-001', 'case-002', 'case-003'],
        elapsedMs: 30_000,
      };
      saveExamProgress(snap);
      expect(loadExamProgress()).not.toBeNull();
      clearExamProgress();
      expect(loadExamProgress()).toBeNull();
      // sessionStorage 上のキー自体も消えている
      expect(window.sessionStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
    });
  });

  // PBI-046 / TASK-203: examAnswers 完全保存スキーマの境界値テスト。
  describe('examAnswers 完全保存スキーマ（PBI-046 / TASK-203）', () => {
    const buildEntry = (
      i: number,
      judgement: ExamAnswerEntry['judgement'] = 'correct',
    ): ExamAnswerEntry => ({
      caseId: `case-${String(i + 1).padStart(3, '0')}`,
      judgement,
      correctPriority: 'A',
      answeredPriority: judgement === 'unanswered' ? undefined : 'A',
    });

    it('examAnswers が空配列でもラウンドトリップで一致する', () => {
      const snap: ExamProgressSnapshot = {
        examIndex: 0,
        answeredIds: [],
        elapsedMs: 0,
        examAnswers: [],
      };
      saveExamProgress(snap);
      expect(loadExamProgress()).toEqual(snap);
    });

    it('examAnswers が最大 20 件でもラウンドトリップで一致する', () => {
      const entries = Array.from({ length: EXAM_TOTAL_QUESTIONS }, (_, i) =>
        buildEntry(i, i % 2 === 0 ? 'correct' : 'incorrect'),
      );
      const snap: ExamProgressSnapshot = {
        examIndex: EXAM_TOTAL_QUESTIONS,
        answeredIds: entries.map((e) => e.caseId),
        elapsedMs: 1_000,
        examAnswers: entries,
      };
      saveExamProgress(snap);
      expect(loadExamProgress()?.examAnswers).toHaveLength(EXAM_TOTAL_QUESTIONS);
      expect(loadExamProgress()).toEqual(snap);
    });

    it('judgement = "unanswered" を含むエントリも復元できる', () => {
      const entries: ExamAnswerEntry[] = [buildEntry(0, 'correct'), buildEntry(1, 'unanswered')];
      const snap: ExamProgressSnapshot = {
        examIndex: 2,
        answeredIds: ['case-001', 'case-002'],
        elapsedMs: 5_000,
        examAnswers: entries,
      };
      saveExamProgress(snap);
      const loaded = loadExamProgress();
      expect(loaded?.examAnswers).toEqual(entries);
    });

    it('userInput を含むエントリも復元できる（境界長 500 文字）', () => {
      const long = 'あ'.repeat(EXAM_ANSWER_USER_INPUT_MAX_LENGTH);
      const entry: ExamAnswerEntry = {
        caseId: 'case-001',
        judgement: 'correct',
        correctPriority: 'A',
        answeredPriority: 'A',
        userInput: { judgment: long, reason: long, action: long },
      };
      const snap: ExamProgressSnapshot = {
        examIndex: 1,
        answeredIds: ['case-001'],
        elapsedMs: 1,
        examAnswers: [entry],
      };
      saveExamProgress(snap);
      expect(loadExamProgress()?.examAnswers?.[0]).toEqual(entry);
    });

    it('不正 judgement を持つ要素は破棄される（ほかは残る）', () => {
      const valid = buildEntry(0, 'correct');
      const invalid = { ...buildEntry(1), judgement: 'pending' };
      window.sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({
          examIndex: 2,
          answeredIds: ['case-001', 'case-002'],
          elapsedMs: 100,
          examAnswers: [valid, invalid],
        }),
      );
      const loaded = loadExamProgress();
      expect(loaded?.examAnswers).toHaveLength(1);
      expect(loaded?.examAnswers?.[0]).toEqual(valid);
    });

    it('必須キー欠落（caseId なし）の要素は破棄される', () => {
      const valid = buildEntry(0, 'correct');
      const invalid = { judgement: 'correct', correctPriority: 'A' }; // caseId 欠落
      window.sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({
          examIndex: 1,
          answeredIds: ['case-001'],
          elapsedMs: 100,
          examAnswers: [invalid, valid],
        }),
      );
      const loaded = loadExamProgress();
      expect(loaded?.examAnswers).toHaveLength(1);
      expect(loaded?.examAnswers?.[0]).toEqual(valid);
    });

    it('userInput の長さ超過要素は破棄される', () => {
      const valid = buildEntry(0, 'correct');
      const tooLong = 'あ'.repeat(EXAM_ANSWER_USER_INPUT_MAX_LENGTH + 1);
      const invalid = {
        ...buildEntry(1),
        userInput: { judgment: tooLong, reason: '', action: '' },
      };
      window.sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({
          examIndex: 2,
          answeredIds: ['case-001', 'case-002'],
          elapsedMs: 100,
          examAnswers: [valid, invalid],
        }),
      );
      const loaded = loadExamProgress();
      expect(loaded?.examAnswers).toHaveLength(1);
      expect(loaded?.examAnswers?.[0]).toEqual(valid);
    });

    it('correctPriority 列挙値外の要素は破棄される', () => {
      const valid = buildEntry(0, 'correct');
      const invalid = { ...buildEntry(1), correctPriority: 'D' };
      window.sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({
          examIndex: 2,
          answeredIds: ['case-001', 'case-002'],
          elapsedMs: 100,
          examAnswers: [valid, invalid],
        }),
      );
      const loaded = loadExamProgress();
      expect(loaded?.examAnswers).toHaveLength(1);
      expect(loaded?.examAnswers?.[0]).toEqual(valid);
    });

    it('examAnswers が配列でない（オブジェクト）場合はトップレベル null フォールバック', () => {
      window.sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({
          examIndex: 0,
          answeredIds: [],
          elapsedMs: 0,
          examAnswers: { invalid: true },
        }),
      );
      expect(loadExamProgress()).toBeNull();
    });

    it('旧形式（examAnswers なし）スナップショットも後方互換で復元できる', () => {
      const legacy = { examIndex: 1, answeredIds: ['case-001'], elapsedMs: 100 };
      window.sessionStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(legacy));
      const loaded = loadExamProgress();
      expect(loaded).not.toBeNull();
      expect(loaded?.examIndex).toBe(1);
      expect(loaded?.examAnswers).toBeUndefined();
    });
  });
});
