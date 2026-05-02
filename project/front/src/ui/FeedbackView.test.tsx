import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FeedbackView } from './FeedbackView';
import type { WritingFeedback } from '../domain/feedback';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function makeFeedback(overrides: Partial<WritingFeedback> = {}): WritingFeedback {
  return {
    judgment: { category: '判断', score: '◎', comment: '判断が正解と一致しています。' },
    reason: [
      { category: '5W1H', score: '◎', comment: '5W1Hの観点が十分に盛り込まれています。' },
      { category: '優先度', score: '○', comment: '優先度の観点が一部含まれています。' },
      { category: '論理', score: '◎', comment: '論理の観点が十分に盛り込まれています。' },
    ],
    action: [
      { category: '委任', score: '◎', comment: '委任の観点が十分に盛り込まれています。' },
      { category: 'フォロー', score: '◎', comment: 'フォローの観点が十分に盛り込まれています。' },
      { category: '具体性', score: '○', comment: '具体性の観点が一部含まれています。' },
    ],
    overall: '◎',
    ...overrides,
  };
}

describe('FeedbackView（PBI-029 / TASK-010）', () => {
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

  it('visible=false のとき何も描画しない', () => {
    act(() => {
      root.render(<FeedbackView feedback={makeFeedback()} visible={false} />);
    });
    expect(container.querySelector('.feedback-view')).toBeNull();
    expect(container.textContent).toBe('');
  });

  it('feedback=null のとき何も描画しない', () => {
    act(() => {
      root.render(<FeedbackView feedback={null} visible={true} />);
    });
    expect(container.querySelector('.feedback-view')).toBeNull();
  });

  it('overall=◎ で aria-label="AI評価フィードバック" + 総合バッジ + 7 観点を表示する', () => {
    act(() => {
      root.render(<FeedbackView feedback={makeFeedback()} visible={true} />);
    });
    const section = container.querySelector('section[aria-label="AI評価フィードバック"]');
    expect(section).not.toBeNull();

    // 総合バッジ
    const overall = container.querySelector('.feedback-view__overall-badge');
    expect(overall).not.toBeNull();
    expect(overall!.textContent).toBe('◎');
    expect(container.textContent).toContain('総合評価: 優秀');

    // 判断 1 件 + 理由 3 件 + アクション 3 件 = 7 観点
    const items = container.querySelectorAll('.feedback-view__item');
    expect(items.length).toBe(7);
  });

  it('XSS 安全: feedback コメントにスクリプトタグを含んでいてもテキストとしてエスケープされる', () => {
    const malicious = '<script>alert(1)</script><img src=x onerror="alert(2)">';
    const fb = makeFeedback({
      judgment: { category: '判断', score: '◎', comment: malicious },
    });
    act(() => {
      root.render(<FeedbackView feedback={fb} visible={true} />);
    });
    // <script> や <img> は React によりテキストノードとして描画される
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    // 文字列として表示されている
    expect(container.textContent).toContain('<script>alert(1)</script>');
  });

  it('判断 △ のときスコアバッジに ng 修飾子クラスが付与される', () => {
    const fb = makeFeedback({
      judgment: {
        category: '判断',
        score: '△',
        comment: '判断に大きなずれがあります。',
      },
      overall: '△',
    });
    act(() => {
      root.render(<FeedbackView feedback={fb} visible={true} />);
    });
    // 判断ブロック先頭の dt 内のスコアバッジ
    const judgmentBlock = container.querySelectorAll('.feedback-view__block')[0];
    const score = judgmentBlock.querySelector('.feedback-view__score');
    expect(score).not.toBeNull();
    expect(score!.textContent).toBe('△');
    expect(score!.className).toContain('feedback-view__score--ng');

    // 総合バッジも ng 修飾子
    const overallBadge = container.querySelector('.feedback-view__overall-badge');
    expect(overallBadge!.className).toContain('feedback-view__overall-badge--ng');
  });
});
