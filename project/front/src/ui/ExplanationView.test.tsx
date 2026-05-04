import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExplanationView } from './ExplanationView';
import type { Case } from '../domain/case';

/**
 * PBI-063 Day4 後半: ExplanationView の視認性向上に伴う最小不変条件。
 * - badge / aria-live / explanation__body の構造
 * - retry ボタンの aria-label とクラス
 * - DoD §10-2: dangerouslySetInnerHTML 不使用
 */
const SAMPLE: Case = {
  id: 'case-explain-001',
  title: 'ダミー案件',
  body: '本文ダミー',
  correctPriority: 'A',
  explanation: '解説本文ダミー。',
};

describe('ExplanationView（PBI-063 / Day4 視認性向上）', () => {
  it('正解時に badge--correct と aria-live="polite" が付く', () => {
    const html = renderToStaticMarkup(
      <ExplanationView caseItem={SAMPLE} answer="A" judgement="correct" />,
    );
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('badge--correct');
    expect(html).toContain('explanation--correct');
    expect(html).toContain('正解');
  });

  it('不正解時に badge--incorrect と explanation--incorrect が付く', () => {
    const html = renderToStaticMarkup(
      <ExplanationView caseItem={SAMPLE} answer="B" judgement="incorrect" />,
    );
    expect(html).toContain('badge--incorrect');
    expect(html).toContain('explanation--incorrect');
    expect(html).toContain('不正解');
  });

  it('onRetry 指定時に retry ボタンが表示され aria-label を持つ', () => {
    const html = renderToStaticMarkup(
      <ExplanationView caseItem={SAMPLE} answer="A" judgement="correct" onRetry={() => {}} />,
    );
    expect(html).toContain('class="explanation__retry"');
    expect(html).toContain('aria-label="同じ案件をもう一度解き直す"');
    expect(html).toContain('もう一度この問題');
  });

  it('onRetry 未指定時は retry ボタンが描画されない', () => {
    const html = renderToStaticMarkup(
      <ExplanationView caseItem={SAMPLE} answer="A" judgement="correct" />,
    );
    expect(html).not.toContain('explanation__retry');
  });

  it('dangerouslySetInnerHTML を使用しない（DoD §10-2）', () => {
    const html = renderToStaticMarkup(
      <ExplanationView caseItem={SAMPLE} answer="A" judgement="correct" onRetry={() => {}} />,
    );
    // テキストノードとして本文が描画されている
    expect(html).toContain('解説本文ダミー');
  });
});
