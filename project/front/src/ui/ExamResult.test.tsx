import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ExamResult } from './ExamResult';
import { buildExamResultSummary } from '../domain/examResult';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

/**
 * ExamResult UI（PBI-030 / TASK-001）の DAY1 基本構造テスト。
 *
 * NOTE: UI テスト 8 件全ての網羅は TASK-004 (DAY2) で達成予定。
 * DAY1 では「正答率 / 所要時間 / 優先度別正答数 が見出しと値で表示される」基本骨格のみ確認。
 */
describe('ExamResult（PBI-030 / DAY1 部分）', () => {
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

  it('正答率・所要時間・A/B/C 別正答数を見出しと値で表示する', () => {
    const summary = buildExamResultSummary(
      ['A', 'A', 'B', 'B', 'C'],
      ['A', 'B', 'B', 'B', 'C'],
      90 * 60 - 1, // 89:59
    );
    let restarted = 0;
    act(() => {
      root.render(<ExamResult summary={summary} onRestart={() => restarted++} />);
    });

    const heading = container.querySelector('#exam-result-heading');
    expect(heading?.textContent).toBe('Exam 結果');

    const text = container.textContent ?? '';
    // 正答率 80%（4/5）
    expect(text).toContain('80%');
    expect(text).toContain('4 / 5');
    // 所要時間 89:59
    expect(text).toContain('89:59');
    // 優先度ラベル（symbol は aria-hidden）+ A/B/C 行が出る
    expect(text).toContain('A（最優先）');
    expect(text).toContain('B（中優先）');
    expect(text).toContain('C（低優先）');

    // もう一度チャレンジ ボタンが押せる
    const btn = container.querySelector(
      '.exam-result__btn--primary',
    ) as HTMLButtonElement | null;
    expect(btn).not.toBeNull();
    act(() => {
      btn!.click();
    });
    expect(restarted).toBe(1);

    // onBackToTop 未指定時は「トップへ戻る」ボタンが出ない
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(1);
  });
});
