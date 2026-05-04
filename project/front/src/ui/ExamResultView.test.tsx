import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ExamResultView } from './ExamResultView';
import type { ExamSession } from '../domain/examTimer';
import type { HistoryItem } from '../domain/history';
import type { Priority } from '../domain/case';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * ExamResultView の a11y / 統合テスト（PBI-030 / Sprint008 TASK-005）。
 *
 * - DoD §9-3: ルート `aria-label="Exam結果"` と各問 `aria-label` のスクリーンリーダー対応
 * - DoD §10-2: `dangerouslySetInnerHTML` 不使用 + XSS 文字列の機械検証
 * - 境界値: 0 問（履歴空）でもエラーなく描画
 *
 * NOTE: 既存テスト（`ExamResult.test.tsx` / `FeedbackView.test.tsx`）の
 * `createRoot` + `act` パターンを踏襲（`@testing-library/react` は未導入）。
 */

function makeSession(elapsedSeconds: number, totalQuestions = 20): ExamSession {
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

/**
 * 20 問中 `correctCount` 件正解の history を生成する。
 * - 出題優先度は A/B/C を均等に割り振る（A=7, B=7, C=6）。
 * - 不正解時は正解と異なる優先度を回答する。
 */
function makeHistory(totalQuestions: number, correctCount: number): HistoryItem[] {
  const priorities: Priority[] = ['A', 'B', 'C'];
  const items: HistoryItem[] = [];
  for (let i = 0; i < totalQuestions; i++) {
    const correct = priorities[i % 3];
    const isCorrect = i < correctCount;
    const answered: Priority = isCorrect
      ? correct
      : (priorities.find((p) => p !== correct) as Priority);
    items.push({
      caseId: `case-${String(i + 1).padStart(3, '0')}`,
      judgement: isCorrect ? 'correct' : 'incorrect',
      correctPriority: correct,
      answeredPriority: answered,
    });
  }
  return items;
}

describe('ExamResultView（PBI-030 / Sprint008 TASK-005 a11y・統合テスト）', () => {
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

  it('ルート要素に role="region" と aria-label="Exam結果" が存在する（DoD §9-3）', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(60)}
          history={makeHistory(20, 15)}
          onBackToStudy={() => {}}
        />,
      );
    });
    const region = container.querySelector('section[role="region"][aria-label="Exam結果"]');
    expect(region).not.toBeNull();
  });

  it('20問中15問正解で "15 / 20" と "75%" が表示される', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(60)}
          history={makeHistory(20, 15)}
          onBackToStudy={() => {}}
        />,
      );
    });
    const text = container.textContent ?? '';
    expect(text).toContain('15 / 20');
    expect(text).toContain('75%');
  });

  it('A/B/C 別の正答率が表示される', () => {
    // 20問: A=7問(i=0,3,6,9,12,15,18) / B=7問(i=1,4,7,10,13,16,19) / C=6問(i=2,5,8,11,14,17)
    // 15問正解 → 不正解は i=15,16,17,18,19（A=2件,B=2件,C=1件 が誤答）
    // A: 5/7, B: 5/7, C: 5/6
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(60)}
          history={makeHistory(20, 15)}
          onBackToStudy={() => {}}
        />,
      );
    });
    const breakdown = container.querySelector('.exam-result__priority-list');
    expect(breakdown).not.toBeNull();
    const text = breakdown!.textContent ?? '';
    // A 5/7 (71%)
    expect(text).toContain('5 / 7');
    // C 5/6 (83%)
    expect(text).toContain('5 / 6');
    // 優先度ラベル併記（色非依存）
    expect(text).toContain('A（最優先）');
    expect(text).toContain('B（中優先）');
    expect(text).toContain('C（低優先）');
  });

  it('所要時間が mm:ss 形式で表示される（125秒 → "02:05"）', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(125)}
          history={makeHistory(20, 15)}
          onBackToStudy={() => {}}
        />,
      );
    });
    expect(container.textContent ?? '').toContain('02:05');
  });

  it('「Deep で学習に戻る」ボタンが存在し、クリックで onBackToStudy が呼ばれる', () => {
    let backCount = 0;
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(60)}
          history={makeHistory(20, 15)}
          onBackToStudy={() => backCount++}
        />,
      );
    });
    const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
    const back = buttons.find((b) => (b.textContent ?? '').includes('Deep で学習に戻る'));
    expect(back).toBeDefined();
    act(() => {
      back!.click();
    });
    expect(backCount).toBe(1);
  });

  it('dangerouslySetInnerHTML 不使用: XSSコンテンツをrender してもscript/imgタグが生成されない（DoD §10-2）', () => {
    const dangerous: HistoryItem[] = [
      {
        caseId: '<script>alert(1)</script>',
        judgement: 'incorrect',
        correctPriority: 'A',
        answeredPriority: 'B',
      },
    ];
    act(() => {
      root.render(
        <ExamResultView session={makeSession(60)} history={dangerous} onBackToStudy={() => {}} />,
      );
    });
    // dangerouslySetInnerHTML を使用していれば script タグが DOM に現れる
    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('<script>alert(1)</script>');
  });

  it('XSS 安全: caseId に攻撃文字列を含んでもDOMに script / img タグが生成されない（DoD §10-2）', () => {
    const malicious = '<script>alert(1)</script><img src=x onerror="alert(2)">';
    const history: HistoryItem[] = [
      {
        caseId: malicious,
        judgement: 'incorrect',
        correctPriority: 'A',
        answeredPriority: 'B',
      },
      {
        caseId: malicious,
        judgement: 'correct',
        correctPriority: 'B',
        answeredPriority: 'B',
      },
    ];
    act(() => {
      root.render(
        <ExamResultView session={makeSession(60, 2)} history={history} onBackToStudy={() => {}} />,
      );
    });
    // React はテキストノードとしてエスケープするので script / img は生成されない
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    // onerror 属性が DOM に乗っていないことも確認
    const html = container.innerHTML;
    expect(html.toLowerCase()).not.toContain('<script');
    expect(html.toLowerCase()).not.toContain('onerror=');
  });

  it('履歴 0 問の境界値: エラーなく描画され「回答履歴がありません。」が表示される', () => {
    expect(() => {
      act(() => {
        root.render(
          <ExamResultView session={makeSession(0, 0)} history={[]} onBackToStudy={() => {}} />,
        );
      });
    }).not.toThrow();
    const region = container.querySelector('section[role="region"][aria-label="Exam結果"]');
    expect(region).not.toBeNull();
    // 0 問なので 0% / 0 / 0
    const text = container.textContent ?? '';
    expect(text).toContain('0%');
    expect(text).toContain('0 / 0');
    expect(text).toContain('回答履歴がありません。');
  });

  it('各問の正誤一覧 li に適切な aria-label（第N問・正解/不正解・回答・正解優先度）が付与される', () => {
    const history: HistoryItem[] = [
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
    act(() => {
      root.render(
        <ExamResultView session={makeSession(60, 2)} history={history} onBackToStudy={() => {}} />,
      );
    });
    const items = container.querySelectorAll('.exam-result__answer-row');
    expect(items.length).toBe(2);
    const label1 = items[0].getAttribute('aria-label') ?? '';
    expect(label1).toContain('第1問');
    expect(label1).toContain('正解');
    expect(label1).toContain('回答A');
    expect(label1).toContain('正解A');
    expect(label1).toContain('最優先');

    const label2 = items[1].getAttribute('aria-label') ?? '';
    expect(label2).toContain('第2問');
    expect(label2).toContain('不正解');
    expect(label2).toContain('回答C');
    expect(label2).toContain('正解B');
    expect(label2).toContain('中優先');
  });
});
