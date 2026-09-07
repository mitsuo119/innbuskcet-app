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

  it('overall=◎ でも答案の品質を保証せず、照合結果と7観点を表示する', () => {
    act(() => {
      root.render(<FeedbackView feedback={makeFeedback()} visible={true} />);
    });
    const section = container.querySelector('section[aria-label="記述の自動チェック"]');
    expect(section).not.toBeNull();

    // 総合バッジ
    const overall = container.querySelector('.feedback-view__overall-badge');
    expect(overall).not.toBeNull();
    expect(overall!.textContent).toBe('◎');
    expect(container.textContent).toContain('照合の目安: 語句・形式の一致が多め');
    expect(container.textContent).toContain('文章の意味や正しさ、試験の得点は判定しません');
    expect(container.textContent).not.toContain('総合評価: 優秀');
    expect(container.textContent).not.toContain('AI 評価');
    expect(container.querySelector('a[href="/reference/chapter02"]')).not.toBeNull();

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

  describe('改善提案行（PBI-040 / TASK-008）', () => {
    it('△評価で suggestion がある場合、「💡 改善提案:」が表示される', () => {
      const fb = makeFeedback({
        judgment: {
          category: '判断',
          score: '△',
          comment: '判断に大きなずれがあります。',
          suggestion: '優先度（A / B / C）の判断根拠を明記してください。',
        },
        overall: '△',
      });
      act(() => {
        root.render(<FeedbackView feedback={fb} visible={true} />);
      });
      const suggestion = container.querySelector('.feedback-view__suggestion');
      expect(suggestion).not.toBeNull();
      expect(suggestion!.textContent).toContain('💡');
      expect(suggestion!.textContent).toContain('改善提案:');
      expect(suggestion!.textContent).toContain(
        '優先度（A / B / C）の判断根拠を明記してください。',
      );
    });

    it('◎評価で suggestion が undefined のとき、改善提案行は表示されない', () => {
      const fb = makeFeedback({
        judgment: { category: '判断', score: '◎', comment: '判断が正解と一致しています。' },
      });
      act(() => {
        root.render(<FeedbackView feedback={fb} visible={true} />);
      });
      // 全 7 観点が ◎/○ のため改善提案行は 0 件
      const suggestions = container.querySelectorAll('.feedback-view__suggestion');
      expect(suggestions.length).toBe(0);
    });

    it('○評価で suggestion が undefined のとき、改善提案行は表示されない', () => {
      const fb = makeFeedback({
        judgment: {
          category: '判断',
          score: '○',
          comment: '判断は概ね妥当ですが、優先度を再考してください。',
        },
        reason: [
          { category: '5W1H', score: '○', comment: '5W1H 部分含む。' },
          { category: '優先度', score: '○', comment: '優先度 部分含む。' },
          { category: '論理', score: '○', comment: '論理 部分含む。' },
        ],
        action: [
          { category: '委任', score: '○', comment: '委任 部分含む。' },
          { category: 'フォロー', score: '○', comment: 'フォロー 部分含む。' },
          { category: '具体性', score: '○', comment: '具体性 部分含む。' },
        ],
        overall: '○',
      });
      act(() => {
        root.render(<FeedbackView feedback={fb} visible={true} />);
      });
      const suggestions = container.querySelectorAll('.feedback-view__suggestion');
      expect(suggestions.length).toBe(0);
    });

    it('XSS 安全: suggestion に <script> や onerror を含んでも DOM にタグが生成されない', () => {
      const malicious = '<script>alert(99)</script><img src=x onerror="alert(1)">';
      const fb = makeFeedback({
        judgment: {
          category: '判断',
          score: '△',
          comment: '判断に大きなずれがあります。',
          suggestion: malicious,
        },
        overall: '△',
      });
      act(() => {
        root.render(<FeedbackView feedback={fb} visible={true} />);
      });
      // <script> や <img> タグは生成されずテキストノードとして描画される
      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('img')).toBeNull();
      const suggestion = container.querySelector('.feedback-view__suggestion');
      expect(suggestion).not.toBeNull();
      expect(suggestion!.textContent).toContain('<script>alert(99)</script>');
      expect(suggestion!.textContent).toContain('onerror');
    });

    it('複数 FeedbackItem のうち △ のもののみ改善提案行が表示される', () => {
      const fb = makeFeedback({
        judgment: { category: '判断', score: '◎', comment: '判断が正解と一致しています。' },
        reason: [
          { category: '5W1H', score: '◎', comment: '5W1H 十分。' },
          {
            category: '優先度',
            score: '△',
            comment: '優先度の観点が不足しています。',
            suggestion: '優先根拠を添えると◎になります。',
          },
          { category: '論理', score: '◎', comment: '論理 十分。' },
        ],
        action: [
          { category: '委任', score: '◎', comment: '委任 十分。' },
          {
            category: 'フォロー',
            score: '△',
            comment: 'フォローの観点が不足しています。',
            suggestion: 'フォローアップ時期を明記してください。',
          },
          { category: '具体性', score: '◎', comment: '具体性 十分。' },
        ],
        overall: '○',
      });
      act(() => {
        root.render(<FeedbackView feedback={fb} visible={true} />);
      });
      const suggestions = container.querySelectorAll('.feedback-view__suggestion');
      // △ が 2 件のため改善提案行も 2 件
      expect(suggestions.length).toBe(2);
      const texts = Array.from(suggestions).map((el) => el.textContent ?? '');
      expect(texts.some((t) => t.includes('優先根拠を添える'))).toBe(true);
      expect(texts.some((t) => t.includes('フォローアップ時期'))).toBe(true);
    });
  });
});
