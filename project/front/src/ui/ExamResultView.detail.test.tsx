import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ExamResultView } from './ExamResultView';
import type { ExamSession } from '../domain/examTimer';
import type { HistoryItem } from '../domain/history';
import type { Case } from '../domain/case';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * PBI-043 / Sprint010 TASK-403・404: ExamResultView 詳細パネルの開閉・フォーカス管理・
 * 375px 幅での横スクロール無し（CSS 検証）を機械検証する。
 *
 * - TASK-404: 詳細トグルの aria-expanded / 単一展開 / フォールバック / フォーカス維持
 * - TASK-403: styles.css 上で詳細パネルが max-width:100% / overflow-wrap:anywhere /
 *   トグルが min-height:44px であることを機械検証（PBI-045 整合）
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

const fullCase: Case = {
  id: 'case-001',
  title: 'タイトル001',
  body: '本文001 詳細説明',
  correctPriority: 'A',
  explanation: '解説001 ここに理由を記載',
  modelAnswer: {
    judgment: '判断テキスト001',
    reason: '理由テキスト001',
    action: 'アクション001',
  },
};

const noModelCase: Case = {
  id: 'case-002',
  title: 'タイトル002',
  body: '本文002',
  correctPriority: 'B',
  explanation: '解説002',
};

describe('ExamResultView 詳細トグル（PBI-043 / TASK-404）', () => {
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

  function renderView(cases?: readonly Case[]) {
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

  it('初期状態では全トグルが aria-expanded="false" でパネル未表示', () => {
    renderView([fullCase, noModelCase]);
    const toggles = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    expect(toggles.length).toBe(2);
    toggles.forEach((t) => {
      expect(t.getAttribute('aria-expanded')).toBe('false');
      expect(t.textContent).toContain('詳細を見る');
    });
    expect(container.querySelector('.exam-result__detail-panel')).toBeNull();
  });

  it('クリックで該当行が展開され aria-expanded="true" / パネル本文を表示', () => {
    renderView([fullCase, noModelCase]);
    const toggles = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    act(() => {
      toggles[0].click();
    });
    const expandedToggles = container.querySelectorAll<HTMLButtonElement>(
      '.exam-result__detail-toggle',
    );
    expect(expandedToggles[0].getAttribute('aria-expanded')).toBe('true');
    expect(expandedToggles[0].textContent).toContain('閉じる');
    const panel = container.querySelector('.exam-result__detail-panel');
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('タイトル001');
    expect(panel!.textContent).toContain('本文001 詳細説明');
    expect(panel!.textContent).toContain('解説001');
    expect(panel!.textContent).toContain('判断テキスト001');
    // aria-controls と panel id が一致
    expect(expandedToggles[0].getAttribute('aria-controls')).toBe(panel!.id);
  });

  it('再クリックで折畳み（aria-expanded="false" / パネル消失）', () => {
    renderView([fullCase, noModelCase]);
    const toggle = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    act(() => {
      toggle.click();
    });
    act(() => {
      container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!.click();
    });
    const after = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    expect(after.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('.exam-result__detail-panel')).toBeNull();
  });

  it('別行クリック時は前の行が閉じ、同時展開は1行のみ', () => {
    renderView([fullCase, noModelCase]);
    let toggles = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    act(() => {
      toggles[0].click();
    });
    toggles = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    act(() => {
      toggles[1].click();
    });
    toggles = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    expect(toggles[0].getAttribute('aria-expanded')).toBe('false');
    expect(toggles[1].getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelectorAll('.exam-result__detail-panel').length).toBe(1);
  });

  it('modelAnswer 未整備の案件では「模範解答準備中」フォールバックを表示', () => {
    renderView([fullCase, noModelCase]);
    const toggles = container.querySelectorAll<HTMLButtonElement>('.exam-result__detail-toggle');
    act(() => {
      toggles[1].click();
    });
    const panel = container.querySelector('.exam-result__detail-panel');
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('模範解答準備中');
  });

  it('cases 未指定 / caseId 不一致時は「案件詳細を取得できませんでした」フォールバックを表示', () => {
    renderView(undefined);
    const toggle = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    act(() => {
      toggle.click();
    });
    const panel = container.querySelector('.exam-result__detail-panel');
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('案件詳細を取得できませんでした');
    expect(panel!.textContent).toContain('case-001');
  });

  it('クリック後フォーカスはトグル自身に維持される（DoD §9-2 / §9-3 フォーカス管理）', () => {
    renderView([fullCase, noModelCase]);
    const toggle = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    toggle.focus();
    act(() => {
      toggle.click();
    });
    const after = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    expect(document.activeElement).toBe(after);
  });

  it('XSS 安全: caseId / case 文字列に攻撃文字列を含んでも script / img タグが生成されない（DoD §10-2）', () => {
    const malicious = '<script>alert(1)</script><img src=x onerror="alert(2)">';
    const dangerousCase: Case = {
      id: malicious,
      title: malicious,
      body: malicious,
      correctPriority: 'A',
      explanation: malicious,
      modelAnswer: { judgment: malicious, reason: malicious, action: malicious },
    };
    const dangerousHistory: HistoryItem[] = [
      {
        caseId: malicious,
        judgement: 'correct',
        correctPriority: 'A',
        answeredPriority: 'A',
      },
    ];
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(60, 1)}
          history={dangerousHistory}
          onBackToStudy={() => {}}
          cases={[dangerousCase]}
        />,
      );
    });
    const toggle = container.querySelector<HTMLButtonElement>('.exam-result__detail-toggle')!;
    act(() => {
      toggle.click();
    });
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    // 実 DOM に onerror 属性を持つ要素が無い（テキストとしての &lt;img src=x onerror=... は React エスケープ済で安全）
    expect(container.querySelector('[onerror]')).toBeNull();
    const html = container.innerHTML.toLowerCase();
    // 生の <script タグ・<img タグは生成されない（エスケープ済みは &lt;script / &lt;img として現れる）
    expect(html).not.toMatch(/<script\b/);
    expect(html).not.toMatch(/<img\b/);
  });
});

const stylesPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'styles.css');
const css = readFileSync(stylesPath, 'utf-8');

describe('ExamResultView 375px 幅 CSS 検証（PBI-043 / TASK-403 / PBI-045 整合）', () => {
  it('exam-result__detail-panel は max-width:100% / overflow-wrap:anywhere / word-break:break-word', () => {
    const block = css.match(/\.exam-result__detail-panel\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/max-width:\s*100%/);
    expect(block![0]).toMatch(/overflow-wrap:\s*anywhere/);
    expect(block![0]).toMatch(/word-break:\s*break-word/);
  });

  it('exam-result__detail-toggle は min-height:44px（PBI-045 タップ領域）', () => {
    const block = css.match(/\.exam-result__detail-toggle\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/min-height:\s*44px/);
  });

  it('exam-result__answer-summary は flex-wrap:wrap で 375px 幅でも横スクロールしない', () => {
    const block = css.match(/\.exam-result__answer-summary\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/flex-wrap:\s*wrap/);
  });

  it('@media (max-width: 480px) で詳細パネル font-size を縮小（PBI-045 TASK-103）', () => {
    // .exam-result__detail-toggle に 0.9rem 程度のレスポンシブ調整があること
    const mediaSections = css.match(/@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const examMedia = mediaSections.find((m) => m.includes('exam-result__detail'));
    expect(examMedia).toBeDefined();
    expect(examMedia!).toMatch(/exam-result__detail-toggle/);
    expect(examMedia!).toMatch(/font-size:\s*0\.9rem/);
  });

  it('exam-result__detail-fallback が定義されている（TASK-402 フォールバック表示）', () => {
    const block = css.match(/\.exam-result__detail-fallback\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
  });
});
