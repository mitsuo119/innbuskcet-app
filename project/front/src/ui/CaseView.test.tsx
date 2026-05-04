import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CaseView } from './CaseView';
import type { Case } from '../domain/case';

/**
 * PBI-063 Day3: 問題回答画面の視認性向上に伴う最小レンダリング担保。
 * - 出題タイトル / 本文 / aria-labelledby の整合
 * - white-space: pre-wrap 利用前提として、本文が改行を含むケースでも壊れない
 */
const SAMPLE: Case = {
  id: 'case-test-001',
  title: '部下からの相談メール',
  body: '上司として最優先で対応すべき案件かを判断してください。\n背景: ...\n依頼内容: ...',
  correctPriority: 'A',
  explanation: 'これはテスト用説明です。',
};

describe('CaseView（PBI-063 / Day3 視認性向上）', () => {
  it('article 要素に aria-labelledby が付き、対応する h2#case-title が存在する', () => {
    const html = renderToStaticMarkup(<CaseView caseItem={SAMPLE} />);
    expect(html).toContain('aria-labelledby="case-title"');
    expect(html).toContain('id="case-title"');
    expect(html).toContain('部下からの相談メール');
  });

  it('case-view / case-view__title / case-view__body の構造を維持する', () => {
    const html = renderToStaticMarkup(<CaseView caseItem={SAMPLE} />);
    expect(html).toContain('class="case-view"');
    expect(html).toContain('class="case-view__title"');
    expect(html).toContain('class="case-view__body"');
  });

  it('改行を含む本文をそのまま埋め込み、危険な dangerouslySetInnerHTML は使わない', () => {
    const html = renderToStaticMarkup(<CaseView caseItem={SAMPLE} />);
    expect(html).toContain('背景:');
    expect(html).toContain('依頼内容:');
    // DoD §10-2: 危険な innerHTML を含まない
    expect(html).not.toMatch(/dangerouslysetinnerhtml/i);
  });
});
