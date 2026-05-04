import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ExamResultView } from './ExamResultView';
import type { ExamSession } from '../domain/examTimer';
import type { HistoryItem } from '../domain/history';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * ExamResultView の設問別所要時間表示テスト（PBI-044 / TASK-303）。
 *
 * - elapsedMsList が指定されると、各設問行に「所要: N秒」を表示する。
 * - 未指定時は「所要: -」フォールバック表示（後方互換）。
 * - ms → 秒は小数点切り捨て（floor）。
 * - 不正値（負値・NaN・undefined）は安全に「-」へフォールバック。
 * - aria-label に所要時間を含めスクリーンリーダ対応（DoD §9-3）。
 */

function makeSession(): ExamSession {
  return {
    totalQuestions: 3,
    timeLimit: 90 * 60,
    startedAt: Date.now() - 1000,
    questionIds: ['case-001', 'case-002', 'case-003'],
  };
}

function makeHistory(): HistoryItem[] {
  return [
    {
      caseId: 'case-001',
      judgement: 'correct',
      correctPriority: 'A',
      answeredPriority: 'A',
    },
    {
      caseId: 'case-002',
      judgement: 'incorrect',
      correctPriority: 'B',
      answeredPriority: 'C',
    },
    {
      caseId: 'case-003',
      judgement: 'correct',
      correctPriority: 'C',
      answeredPriority: 'C',
    },
  ];
}

describe('ExamResultView 設問別所要時間表示（PBI-044 / TASK-303）', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('elapsedMsList を渡すと各設問行に「所要: N秒」が表示される（ms→秒 floor）', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession()}
          history={makeHistory()}
          elapsedMsList={[1500, 30_999, 60_000]}
          onBackToStudy={() => {}}
        />,
      );
    });
    const elapsedSpans = container.querySelectorAll('.exam-result__answer-elapsed');
    expect(elapsedSpans.length).toBe(3);
    // 1500ms → floor(1500/1000) = 1秒
    expect(elapsedSpans[0].textContent).toContain('1秒');
    // 30999ms → 30秒
    expect(elapsedSpans[1].textContent).toContain('30秒');
    // 60000ms → 60秒
    expect(elapsedSpans[2].textContent).toContain('60秒');
  });

  it('elapsedMsList 未指定なら全設問で「所要: -」フォールバック表示（後方互換）', () => {
    act(() => {
      root.render(
        <ExamResultView session={makeSession()} history={makeHistory()} onBackToStudy={() => {}} />,
      );
    });
    const elapsedSpans = container.querySelectorAll('.exam-result__answer-elapsed');
    expect(elapsedSpans.length).toBe(3);
    elapsedSpans.forEach((s) => {
      expect(s.textContent).toContain('-');
    });
  });

  it('elapsedMsList の要素が undefined / 負値 / NaN は「-」へ安全フォールバック', () => {
    // history は 3 件、elapsedMsList は要素ごとに不正値・正常値を混在させる。
    const list = [-1, Number.NaN, 5_000];
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession()}
          history={makeHistory()}
          elapsedMsList={list}
          onBackToStudy={() => {}}
        />,
      );
    });
    const spans = container.querySelectorAll('.exam-result__answer-elapsed');
    expect(spans[0].textContent).toContain('-'); // 負値
    expect(spans[1].textContent).toContain('-'); // NaN
    expect(spans[2].textContent).toContain('5秒'); // 正常値
  });

  it('所要時間 span に aria-label が付与される（DoD §9-3）', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession()}
          history={makeHistory()}
          elapsedMsList={[2000, 0, 7_500]}
          onBackToStudy={() => {}}
        />,
      );
    });
    const spans = container.querySelectorAll('.exam-result__answer-elapsed');
    expect(spans[0].getAttribute('aria-label')).toBe('所要時間 2 秒');
    expect(spans[1].getAttribute('aria-label')).toBe('所要時間 0 秒');
    expect(spans[2].getAttribute('aria-label')).toBe('所要時間 7 秒');
  });

  it('elapsedMsList が history より短い場合、不足インデックスは「-」', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession()}
          history={makeHistory()}
          elapsedMsList={[1000]} // 1 件のみ
          onBackToStudy={() => {}}
        />,
      );
    });
    const spans = container.querySelectorAll('.exam-result__answer-elapsed');
    expect(spans[0].textContent).toContain('1秒');
    expect(spans[1].textContent).toContain('-');
    expect(spans[2].textContent).toContain('-');
  });
});
