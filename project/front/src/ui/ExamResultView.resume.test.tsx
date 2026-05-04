import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ExamResultView } from './ExamResultView';
import {
  EXAM_TIME_LIMIT_SECONDS,
  EXAM_TOTAL_QUESTIONS,
  clearExamProgress,
  loadExamProgress,
  saveExamProgress,
  type ExamAnswerEntry,
  type ExamProgressSnapshot,
  type ExamSession,
} from '../domain/examTimer';
import type { HistoryItem } from '../domain/history';
import type { Priority } from '../domain/case';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * PBI-046 / Sprint010 TASK-204: 再開後 ExamResultView 一致確認テスト。
 *
 * - 中断前の examAnswers（フル）を sessionStorage に保存 → loadExamProgress で復元
 *   → App.tsx と同等のロジックで HistoryItem 配列を再構築 → ExamResultView を描画。
 * - 中断前の元 history で描画したときと比較し、以下が完全一致することを検証する。
 *   1. 総合正答率（％・分子分母）
 *   2. 所要時間（mm:ss）
 *   3. 優先度別 A/B/C 正答数（n / m）
 */

const PRIORITIES: readonly Priority[] = ['A', 'B', 'C'];

/** App.tsx 続行パスと同等のロジック（PBI-046 完全復元）。 */
function reconstructHistoryFromSnapshot(answers: readonly ExamAnswerEntry[]): HistoryItem[] {
  return answers.map((a) => ({
    caseId: a.caseId,
    judgement: a.judgement === 'unanswered' ? 'incorrect' : a.judgement,
    correctPriority: a.correctPriority,
    learningStyle: 'exam',
    ...(a.answeredPriority !== undefined && { answeredPriority: a.answeredPriority }),
  }));
}

function makeSession(elapsedSeconds: number): ExamSession {
  return {
    totalQuestions: EXAM_TOTAL_QUESTIONS,
    timeLimit: EXAM_TIME_LIMIT_SECONDS,
    startedAt: Date.now() - elapsedSeconds * 1000,
    questionIds: Array.from(
      { length: EXAM_TOTAL_QUESTIONS },
      (_, i) => `case-${String(i + 1).padStart(3, '0')}`,
    ),
  };
}

/** 20 問・正答 13 問・優先度 A/B/C を均等配分・未回答 2 問混在のサンプルを構築。 */
function makeOriginalHistory(): {
  history: HistoryItem[];
  examAnswers: ExamAnswerEntry[];
} {
  const history: HistoryItem[] = [];
  const examAnswers: ExamAnswerEntry[] = [];
  // 0..19 を A/B/C ローテーションで割り当て、i<13 は正解、i in {17,18} は未回答、その他は不正解。
  for (let i = 0; i < EXAM_TOTAL_QUESTIONS; i++) {
    const caseId = `case-${String(i + 1).padStart(3, '0')}`;
    const correctPriority = PRIORITIES[i % 3];
    if (i < 13) {
      history.push({
        caseId,
        judgement: 'correct',
        correctPriority,
        answeredPriority: correctPriority,
        learningStyle: 'exam',
      });
      examAnswers.push({
        caseId,
        judgement: 'correct',
        correctPriority,
        answeredPriority: correctPriority,
      });
    } else if (i === 17 || i === 18) {
      // 未回答は HistoryItem 上は不正解扱い（answeredPriority 省略）。
      history.push({
        caseId,
        judgement: 'incorrect',
        correctPriority,
        learningStyle: 'exam',
      });
      examAnswers.push({
        caseId,
        judgement: 'unanswered',
        correctPriority,
      });
    } else {
      const wrong = PRIORITIES.find((p) => p !== correctPriority) as Priority;
      history.push({
        caseId,
        judgement: 'incorrect',
        correctPriority,
        answeredPriority: wrong,
        learningStyle: 'exam',
      });
      examAnswers.push({
        caseId,
        judgement: 'incorrect',
        correctPriority,
        answeredPriority: wrong,
      });
    }
  }
  return { history, examAnswers };
}

function renderInto(container: HTMLElement, root: Root, session: ExamSession, h: HistoryItem[]) {
  act(() => {
    root.render(<ExamResultView session={session} history={h} onBackToStudy={() => {}} />);
  });
  return container.cloneNode(true) as HTMLElement;
}

describe('ExamResultView 再開後一致確認（PBI-046 / Sprint010 TASK-204）', () => {
  let container1: HTMLDivElement;
  let container2: HTMLDivElement;
  let root1: Root;
  let root2: Root;

  beforeEach(() => {
    clearExamProgress();
    container1 = document.createElement('div');
    container2 = document.createElement('div');
    document.body.appendChild(container1);
    document.body.appendChild(container2);
    root1 = createRoot(container1);
    root2 = createRoot(container2);
  });

  afterEach(() => {
    act(() => {
      root1.unmount();
      root2.unmount();
    });
    container1.remove();
    container2.remove();
    clearExamProgress();
  });

  it('saveExamProgress → loadExamProgress 経由で再構築した history が中断前と一致する', () => {
    const { history, examAnswers } = makeOriginalHistory();
    const snapshot: ExamProgressSnapshot = {
      examIndex: EXAM_TOTAL_QUESTIONS,
      answeredIds: history.map((h) => h.caseId),
      elapsedMs: 60_000,
      examAnswers,
    };
    saveExamProgress(snapshot);

    const restored = loadExamProgress();
    expect(restored).not.toBeNull();
    expect(restored!.examAnswers).toBeDefined();
    expect(restored!.examAnswers!.length).toBe(EXAM_TOTAL_QUESTIONS);

    const reconstructed = reconstructHistoryFromSnapshot(restored!.examAnswers!);
    // judgement / correctPriority / answeredPriority が一致（未回答→incorrect 矯正は仕様）。
    expect(reconstructed.length).toBe(history.length);
    reconstructed.forEach((r, i) => {
      expect(r.caseId).toBe(history[i].caseId);
      expect(r.judgement).toBe(history[i].judgement);
      expect(r.correctPriority).toBe(history[i].correctPriority);
      expect(r.answeredPriority).toBe(history[i].answeredPriority);
    });
  });

  it('再開後 ExamResultView の正答率・所要時間・優先度別正答数が中断前と完全一致', () => {
    const elapsed = 125; // mm:ss = 02:05
    const { history, examAnswers } = makeOriginalHistory();
    const session = makeSession(elapsed);

    saveExamProgress({
      examIndex: EXAM_TOTAL_QUESTIONS,
      answeredIds: history.map((h) => h.caseId),
      elapsedMs: elapsed * 1000,
      examAnswers,
    });
    const restored = loadExamProgress()!;
    const reconstructed = reconstructHistoryFromSnapshot(restored.examAnswers!);

    const beforeDom = renderInto(container1, root1, session, history);
    const afterDom = renderInto(container2, root2, session, reconstructed);

    // 1. 総合正答率
    const beforeStats = beforeDom.querySelector('.exam-result__stats')!.textContent ?? '';
    const afterStats = afterDom.querySelector('.exam-result__stats')!.textContent ?? '';
    expect(afterStats).toBe(beforeStats);
    expect(beforeStats).toContain('65%'); // 13/20 = 65%
    expect(beforeStats).toContain('13 / 20');
    // 2. 所要時間
    expect(beforeStats).toContain('02:05');

    // 3. 優先度別正答数
    const beforeBreakdown =
      beforeDom.querySelector('.exam-result__priority-list')!.textContent ?? '';
    const afterBreakdown = afterDom.querySelector('.exam-result__priority-list')!.textContent ?? '';
    expect(afterBreakdown).toBe(beforeBreakdown);

    // 各問の正誤一覧の件数も一致
    const beforeRows = beforeDom.querySelectorAll('.exam-result__answer-row').length;
    const afterRows = afterDom.querySelectorAll('.exam-result__answer-row').length;
    expect(afterRows).toBe(beforeRows);
    expect(afterRows).toBe(EXAM_TOTAL_QUESTIONS);
  });

  it('旧形式（answeredIds のみ）スナップショットでも ExamResultView がクラッシュしない（後方互換）', () => {
    const { history } = makeOriginalHistory();
    const session = makeSession(60);
    // examAnswers なしのレガシースナップショットを保存
    saveExamProgress({
      examIndex: EXAM_TOTAL_QUESTIONS,
      answeredIds: history.map((h) => h.caseId),
      elapsedMs: 60_000,
    });
    const restored = loadExamProgress()!;
    expect(restored.examAnswers).toBeUndefined();
    // 後方互換は App.tsx 側で answeredIds → 全問正解スタブ（旧仕様）になるが、
    // ここでは reconstructed が空でも ExamResultView がクラッシュしないことのみ確認する。
    expect(() => renderInto(container1, root1, session, [])).not.toThrow();
  });
});
