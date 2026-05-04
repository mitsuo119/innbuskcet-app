import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ExamResultView } from './ExamResultView';
import type { ExamSession } from '../domain/examTimer';
import type { HistoryItem } from '../domain/history';
import type { Case } from '../domain/case';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * PBI-048 / Sprint011: ExamResult 詳細パネル戻り導線のテスト。
 *
 * - TASK-401: 「結果一覧に戻る」ボタンが詳細展開時のみ表示され、押下で閉じる。
 * - TASK-402: Escape キーで詳細パネルが閉じる（キーボード完結 / DoD §9-1）。
 * - TASK-401/402: 閉じた後フォーカスがトグルボタンに戻る（DoD §9-2 / §9-3）。
 */

function makeSession(elapsedSeconds: number, totalQuestions = 2): ExamSession {
  return {
    totalQuestions,
    timeLimit: 90 * 60,
    startedAt: Date.now() - elapsedSeconds * 1000,
    questionIds: Array.from(
      { length: totalQuestions },
      (_, i) => `case-${String(i + 1).padStart(3, '0')}`,
    ),
  };
}

const baseHistory: HistoryItem[] = [
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
];

const cases: Case[] = [
  {
    id: 'case-001',
    title: 'タイトル001',
    body: '本文001',
    correctPriority: 'A',
    explanation: '解説001',
    modelAnswer: { judgment: '判断001', reason: '理由001', action: 'アクション001' },
  },
  {
    id: 'case-002',
    title: 'タイトル002',
    body: '本文002',
    correctPriority: 'B',
    explanation: '解説002',
  },
];

async function flushMicrotasks() {
  // queueMicrotask でフォーカス復帰を遅延しているため、テスト側でも 1 サイクル待つ。
  await Promise.resolve();
}

describe('ExamResultView 詳細パネル戻り導線（PBI-048）', () => {
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

  function renderView() {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(60)}
          history={baseHistory}
          onBackToStudy={() => {}}
          cases={cases}
        />,
      );
    });
  }

  it('初期状態では「結果一覧に戻る」ボタンは存在しない', () => {
    renderView();
    expect(container.querySelector('.exam-result__detail-back')).toBeNull();
  });

  it('詳細を展開すると「結果一覧に戻る」ボタンが表示される（TASK-401）', () => {
    renderView();
    const toggle = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    act(() => {
      toggle.click();
    });
    const backBtn = container.querySelector<HTMLButtonElement>('.exam-result__detail-back');
    expect(backBtn).not.toBeNull();
    expect(backBtn!.textContent).toContain('結果一覧に戻る');
  });

  it('「結果一覧に戻る」ボタン押下で詳細パネルが閉じ、フォーカスがトグルへ戻る（TASK-401）', async () => {
    renderView();
    const toggle = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    act(() => {
      toggle.click();
    });
    const backBtn = container.querySelector<HTMLButtonElement>('.exam-result__detail-back')!;
    act(() => {
      backBtn.click();
    });
    await flushMicrotasks();
    expect(container.querySelector('.exam-result__detail-panel')).toBeNull();
    const after = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    expect(after.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(after);
  });

  it('Escape キーで詳細パネルが閉じ、フォーカスがトグルへ戻る（TASK-402）', async () => {
    renderView();
    const toggles = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    act(() => {
      toggles[1].click();
    });
    const panel = container.querySelector<HTMLElement>('.exam-result__detail-panel')!;
    expect(panel).not.toBeNull();
    act(() => {
      panel.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    await flushMicrotasks();
    expect(container.querySelector('.exam-result__detail-panel')).toBeNull();
    const after = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    expect(after[1].getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(after[1]);
  });

  it('Escape 以外のキーでは閉じない（TASK-402 副作用境界）', () => {
    renderView();
    const toggle = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    act(() => {
      toggle.click();
    });
    const panel = container.querySelector<HTMLElement>('.exam-result__detail-panel')!;
    act(() => {
      panel.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
      );
    });
    expect(container.querySelector('.exam-result__detail-panel')).not.toBeNull();
  });

  it('先頭行展開時は「前の問へ」がdisabledで「次の問へ」は有効（PBI-054 端境界）', () => {
    renderView();
    const toggle = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    act(() => {
      toggle.click();
    });

    const prevBtn = container.querySelector<HTMLButtonElement>('.exam-result__detail-prev');
    const nextBtn = container.querySelector<HTMLButtonElement>('.exam-result__detail-next');
    expect(prevBtn).not.toBeNull();
    expect(nextBtn).not.toBeNull();
    expect(prevBtn!.disabled).toBe(true);
    expect(nextBtn!.disabled).toBe(false);
  });

  it('「次の問へ」で次問詳細へ遷移し、新パネル先頭見出しへフォーカス移動（PBI-054）', async () => {
    renderView();
    const toggle = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle')[0];
    act(() => {
      toggle.click();
    });

    const nextBtn = container.querySelector<HTMLButtonElement>('.exam-result__detail-next')!;
    act(() => {
      nextBtn.click();
    });
    await flushMicrotasks();

    const panel = container.querySelector('.exam-result__detail-panel');
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('タイトル002');

    const heading = container.querySelector<HTMLElement>('#exam-result-detail-heading-1');
    expect(heading).not.toBeNull();
    expect(document.activeElement).toBe(heading);

    const toggles = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    expect(toggles[0].getAttribute('aria-expanded')).toBe('false');
    expect(toggles[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('末尾行展開時は「次の問へ」がdisabledで「前の問へ」は有効（PBI-054 端境界）', () => {
    renderView();
    const toggle = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle')[1];
    act(() => {
      toggle.click();
    });

    const prevBtn = container.querySelector<HTMLButtonElement>('.exam-result__detail-prev');
    const nextBtn = container.querySelector<HTMLButtonElement>('.exam-result__detail-next');
    expect(prevBtn).not.toBeNull();
    expect(nextBtn).not.toBeNull();
    expect(prevBtn!.disabled).toBe(false);
    expect(nextBtn!.disabled).toBe(true);
  });

  it('「前の問へ」で前問詳細へ遷移し、新パネル先頭見出しへフォーカス移動（PBI-054）', async () => {
    renderView();
    const toggle = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle')[1];
    act(() => {
      toggle.click();
    });

    const prevBtn = container.querySelector<HTMLButtonElement>('.exam-result__detail-prev')!;
    act(() => {
      prevBtn.click();
    });
    await flushMicrotasks();

    const panel = container.querySelector('.exam-result__detail-panel');
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('タイトル001');

    const heading = container.querySelector<HTMLElement>('#exam-result-detail-heading-0');
    expect(heading).not.toBeNull();
    expect(document.activeElement).toBe(heading);

    const toggles = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    expect(toggles[0].getAttribute('aria-expanded')).toBe('true');
    expect(toggles[1].getAttribute('aria-expanded')).toBe('false');
  });
});
