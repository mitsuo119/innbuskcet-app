import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ExamResultView } from './ExamResultView';
import type { ExamSession } from '../domain/examTimer';
import type { HistoryItem } from '../domain/history';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function makeSession(totalQuestions = 3): ExamSession {
  return {
    totalQuestions,
    timeLimit: 90 * 60,
    startedAt: Date.now() - 1_000,
    questionIds: Array.from(
      { length: totalQuestions },
      (_, i) => `case-${String(i + 1).padStart(3, '0')}`,
    ),
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

describe('ExamResultView ミニタイムライン（PBI-053）', () => {
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

  it('0ms / 5分超 / 90分超過 の境界値を正しく表示・強調する', () => {
    // 0ms, 5分+1ms, 90分+1ms
    const elapsedMsList = [0, 300_001, 5_400_001];
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(3)}
          history={makeHistory()}
          elapsedMsList={elapsedMsList}
          onBackToStudy={() => {}}
        />,
      );
    });

    const rows = container.querySelectorAll('.exam-result__timeline-row');
    expect(rows.length).toBe(3);

    const fills = container.querySelectorAll<HTMLElement>('.exam-result__timeline-fill');
    expect(fills[0].style.width).toBe('0%');
    expect(fills[1].className).toContain('exam-result__timeline-fill--slow');
    expect(fills[2].className).toContain('exam-result__timeline-fill--slow');
    expect(fills[2].className).toContain('exam-result__timeline-fill--over');
    // 総時間超過は 100% でクランプ
    expect(fills[2].style.width).toBe('100%');

    const text = container.textContent ?? '';
    expect(text).toContain('0:00');
    expect(text).toContain('5:00');
    expect(text).toContain('90:00');
    expect(text).toContain('5分超');
    expect(text).toContain('90分超過');
  });

  it('各行にスクリーンリーダー向け aria-label が付与される', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(3)}
          history={makeHistory()}
          elapsedMsList={[0, 60_000, 120_000]}
          onBackToStudy={() => {}}
        />,
      );
    });

    const rows = container.querySelectorAll<HTMLElement>('.exam-result__timeline-row');
    expect(rows[0].getAttribute('aria-label')).toContain('第1問');
    expect(rows[0].getAttribute('aria-label')).toContain('0:00');
    expect(rows[1].getAttribute('aria-label')).toContain('1:00');
  });
});

const stylesPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'styles.css');
const css = readFileSync(stylesPath, 'utf-8');

describe('ExamResultView ミニタイムライン CSS（PBI-053）', () => {
  it('タイムライン行が 375px で横スクロールしないため minmax(0, 1fr) を使う', () => {
    const block = css.match(/\.exam-result__timeline-row\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/grid-template-columns:\s*3rem\s+minmax\(0,\s*1fr\)\s+auto/);
  });

  it('モバイル幅でメタ情報を改行配置し、横方向の圧迫を回避する', () => {
    const mediaSections = css.match(/@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const timelineMedia = mediaSections.find((m) => m.includes('exam-result__timeline-row'));
    expect(timelineMedia).toBeDefined();
    expect(timelineMedia!).toMatch(/exam-result__timeline-meta/);
    expect(timelineMedia!).toMatch(/grid-column:\s*1\s*\/\s*-1/);
  });
});

describe('ExamResultView 平均基準線（PBI-074）', () => {
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

  it('全タイムライン行に「90分 ÷ 問題数」基準線が配置され、left%が一致する', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(3)}
          history={makeHistory()}
          elapsedMsList={[0, 60_000, 120_000]}
          onBackToStudy={() => {}}
        />,
      );
    });

    // 3 問なので各行に 1 本ずつ基準線がある
    const baselines = container.querySelectorAll<HTMLElement>(
      '[data-testid="exam-result-timeline-baseline"]',
    );
    expect(baselines.length).toBe(3);

    // 90分(=5400000ms) ÷ 3問 ÷ 5400000ms = 1/3 ≒ 33.333...%
    for (const el of baselines) {
      expect(el.style.left).toMatch(/^33\.33/);
    }
  });

  it('凡例に「平均基準線（90分 ÷ N問 ＝ 1問あたり M:SS）」が表示される', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(2)}
          history={makeHistory().slice(0, 2)}
          elapsedMsList={[0, 60_000]}
          onBackToStudy={() => {}}
        />,
      );
    });

    const legend = container.querySelector('[data-testid="exam-result-timeline-baseline-legend"]');
    expect(legend).not.toBeNull();
    // 90 分 ÷ 2 問 ＝ 1 問あたり 45:00
    expect(legend!.textContent).toContain('平均基準線');
    expect(legend!.textContent).toContain('90分 ÷ 2問');
    expect(legend!.textContent).toContain('45:00');
  });

  it('totalQuestions が 0 の場合は基準線も凡例も描画されない（防御的フォールバック）', () => {
    act(() => {
      root.render(
        <ExamResultView
          session={makeSession(0)}
          history={[]}
          elapsedMsList={[]}
          onBackToStudy={() => {}}
        />,
      );
    });
    expect(container.querySelectorAll('[data-testid="exam-result-timeline-baseline"]').length).toBe(
      0,
    );
    expect(
      container.querySelector('[data-testid="exam-result-timeline-baseline-legend"]'),
    ).toBeNull();
  });
});

describe('ExamResultView 平均基準線 CSS（PBI-074 / コントラスト AA）', () => {
  it('基準線の border-color に var(--color-text) を用いて両テーマ AA を担保する', () => {
    const block = css.match(/\.exam-result__timeline-baseline\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    // 破線で塗り棒と差別化し、線色は本文色（両テーマで AA を満たす定義済み変数）
    expect(block![0]).toMatch(/border-left:\s*2px\s+dashed\s+var\(--color-text\)/);
    expect(block![0]).toMatch(/position:\s*absolute/);
  });

  it('凡例スウォッチも同じ破線スタイルで凡例とバッジの一貫性を担保する', () => {
    const block = css.match(/\.exam-result__timeline-baseline-swatch\s*\{[\s\S]*?\}/);
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/border-top:\s*2px\s+dashed\s+var\(--color-text\)/);
  });
});
