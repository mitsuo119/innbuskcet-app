/**
 * GlobalNav 単体テスト（PBI-064 / TASK-203）
 * - レンダリング: 4 リンク（問題回答 / 解説リファレンス / パターン別解説 / プライバシー）
 * - アクティブ状態: current で指定したリンクのみ aria-current="page"
 * - aria 属性: <nav> に aria-label="グローバルナビゲーション"
 * - 順序: 仕様順固定
 * - href: pathname ベースのルーターと整合（PBI-076 / TASK-076-4）
 *
 * 既存テストの慣習に倣い `renderToStaticMarkup` で HTML 文字列検証する
 * （`@testing-library/react` は未導入）。
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GlobalNav } from './GlobalNav';

describe('GlobalNav（PBI-064 / TASK-201）', () => {
  it('<nav> に aria-label="グローバルナビゲーション" を付与する', () => {
    const html = renderToStaticMarkup(<GlobalNav current="home" />);
    expect(html).toMatch(/<nav[^>]*aria-label="グローバルナビゲーション"/);
  });

  it('4 つのリンク（問題回答 / 解説リファレンス / パターン別解説 / プライバシー）を順序通りに描画する', () => {
    const html = renderToStaticMarkup(<GlobalNav current="home" />);
    const expectedOrder = ['問題回答', '解説リファレンス', 'パターン別解説', 'プライバシー'];
    let cursor = 0;
    for (const label of expectedOrder) {
      const idx = html.indexOf(label, cursor);
      expect(idx, `"${label}" が順序内に見つからない`).toBeGreaterThan(-1);
      cursor = idx + label.length;
    }
  });

  it('各リンクが pathname ベースの正しい href を持つ（PBI-076 / TASK-076-4）', () => {
    const html = renderToStaticMarkup(<GlobalNav current="home" />);
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/reference"');
    expect(html).toContain('href="/patterns"');
    expect(html).toContain('href="/privacy-policy"');
  });

  it('current で指定したページのリンクのみ aria-current="page" を持つ', () => {
    const html = renderToStaticMarkup(<GlobalNav current="reference" />);
    // aria-current="page" が 1 つだけ
    const matches = html.match(/aria-current="page"/g) ?? [];
    expect(matches).toHaveLength(1);
    // その属性は "解説リファレンス" のリンク要素に付いている
    expect(html).toMatch(
      /<a[^>]*href="\/reference"[^>]*aria-current="page"[^>]*>解説リファレンス<\/a>/,
    );
  });

  it('current="home" のとき問題回答のみアクティブ修飾クラスが付く', () => {
    const html = renderToStaticMarkup(<GlobalNav current="home" />);
    // 問題回答リンクに active 修飾クラス
    expect(html).toMatch(
      /<a[^>]*href="\/"[^>]*class="[^"]*global-nav__link--active[^"]*"[^>]*>問題回答<\/a>/,
    );
    // 他リンクには active 修飾クラスが付かない
    expect(html).not.toMatch(/<a[^>]*href="\/reference"[^>]*global-nav__link--active/);
    expect(html).not.toMatch(/<a[^>]*href="\/patterns"[^>]*global-nav__link--active/);
    expect(html).not.toMatch(/<a[^>]*href="\/privacy-policy"[^>]*global-nav__link--active/);
  });

  it('current が未対応ページ（terms-of-service / contact）でも全リンクは inactive で描画される', () => {
    const html = renderToStaticMarkup(<GlobalNav current="terms-of-service" />);
    expect(html).not.toContain('aria-current="page"');
    expect(html).not.toContain('global-nav__link--active');
    // 4 リンクは欠けない
    expect(html).toContain('問題回答');
    expect(html).toContain('解説リファレンス');
    expect(html).toContain('パターン別解説');
    expect(html).toContain('プライバシー');
  });
});
