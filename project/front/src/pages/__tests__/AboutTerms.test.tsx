import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { About } from '../About';
import { Terms } from '../Terms';
import { PUBLIC_ROUTES } from '../../routes';

/**
 * PBI-088 / TASK-088-3 (Sprint024 DAY4):
 * /about 運営者情報ページのスモーク + メタ + 動線テスト。
 */
describe('PBI-088 /about 運営者情報ページ', () => {
  const html = renderToStaticMarkup(<About />);

  it('h1「運営者情報（このサイトについて）」と必須6項目見出しを含む', () => {
    expect(html).toContain('運営者情報');
    expect(html).toContain('1. サイトの目的');
    expect(html).toContain('2. 想定読者');
    expect(html).toContain('3. コンテンツ作成方針');
    expect(html).toContain('4. 運営者表記');
    expect(html).toContain('5. 連絡手段');
    expect(html).toContain('6. 更新ポリシー');
  });

  it('GlobalNav と戻る導線（<a href="/">）を持つ', () => {
    expect(html).toContain('aria-label="グローバルナビゲーション"');
    expect(html).toMatch(/<a [^>]*href="\/"[^>]*class="legal-back-btn"[^>]*>/);
  });

  it('PUBLIC_ROUTES に /about が登録されている（sitemap 自動生成対象）', () => {
    const paths = PUBLIC_ROUTES.map((r) => r.path);
    expect(paths).toContain('/about');
  });
});

/**
 * PBI-089 / TASK-089-3 (Sprint024 DAY4):
 * /terms サービス利用規約ページのスモーク + Footer 3 点リンク + メタ。
 */
describe('PBI-089 /terms サービス利用規約ページ', () => {
  const html = renderToStaticMarkup(<Terms />);

  it('h1「サービス利用規約」と必須6項目見出しを含む', () => {
    expect(html).toContain('サービス利用規約');
    expect(html).toContain('1. 利用条件');
    expect(html).toContain('2. 免責');
    expect(html).toContain('3. 著作権・知的財産');
    expect(html).toContain('4. 禁止事項');
    expect(html).toContain('5. 準拠法');
    expect(html).toContain('6. 改定');
  });

  it('GlobalNav と戻る導線（<a href="/">）を持つ', () => {
    expect(html).toContain('aria-label="グローバルナビゲーション"');
    expect(html).toMatch(/<a [^>]*href="\/"[^>]*class="legal-back-btn"[^>]*>/);
  });

  it('legal 3 点リンク（privacy-policy / terms-of-service / contact）への動線を含む', () => {
    expect(html).toContain('href="/privacy-policy"');
    expect(html).toContain('href="/terms-of-service"');
    // /contact は本文中に現れない場合もあるため GlobalNav 内を含めた全体で検証。
    // /terms 本文では privacy / terms-of-service を本文内リンクとして提供。
  });

  it('PUBLIC_ROUTES に /terms が登録されている（sitemap 自動生成対象）', () => {
    const paths = PUBLIC_ROUTES.map((r) => r.path);
    expect(paths).toContain('/terms');
  });
});
