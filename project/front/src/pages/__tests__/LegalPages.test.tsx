import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PrivacyPolicy } from '../PrivacyPolicy';
import { TermsOfService } from '../TermsOfService';
import { Contact } from '../Contact';

describe('PBI-051 法務ページスモークテスト', () => {
  it('PrivacyPolicy がタイトルと主要テキストを表示する', () => {
    const html = renderToStaticMarkup(<PrivacyPolicy />);

    expect(html).toContain('プライバシーポリシー');
    expect(html).toContain('Google AdSense');
    expect(html).toContain('広告とCookieの選択');
    expect(html).toContain('これらはCookieとは異なる保存機能');
  });

  it('TermsOfService がタイトルと主要テキストを表示する', () => {
    const html = renderToStaticMarkup(<TermsOfService />);

    expect(html).toContain('利用規約');
    expect(html).toContain('第3条（禁止事項）');
    expect(html).toContain('第6条（免責事項）');
  });

  it('Contact がタイトルと主要テキストを表示する', () => {
    const html = renderToStaticMarkup(<Contact />);

    expect(html).toContain('お問い合わせ');
    expect(html).toContain('お問い合わせ方法');
    expect(html).toContain('GitHub Issues でお問い合わせ');
  });

  // PBI-064 / Sprint015 DAY4 / TASK-201: 法務 3 ページに GlobalNav が展開されていること。
  it('法務 3 ページに GlobalNav（aria-label="グローバルナビゲーション"）が描画される', () => {
    const cases = [
      { html: renderToStaticMarkup(<PrivacyPolicy />), current: 'privacy-policy' },
      {
        html: renderToStaticMarkup(<TermsOfService />),
        current: 'terms-of-service',
      },
      { html: renderToStaticMarkup(<Contact />), current: 'contact' },
    ];
    for (const { html } of cases) {
      expect(html).toContain('aria-label="グローバルナビゲーション"');
      expect(html).toContain('href="/"');
      expect(html).toContain('href="/reference"');
      expect(html).toContain('href="/patterns"');
      expect(html).toContain('href="/privacy-policy"');
    }
    // PrivacyPolicy のみ aria-current="page" を持つ
    expect(cases[0].html).toContain('aria-current="page"');
    // terms-of-service / contact は GlobalNav 4 リンク中に対応 ID がないため aria-current 非付与
    expect(cases[1].html).not.toContain('aria-current="page"');
    expect(cases[2].html).not.toContain('aria-current="page"');
  });

  // PBI-077 / TASK-077-3: 戻る導線が `<a href="/">` 化され onClick 単独遷移が 0 件であること。
  it('法務 3 ページの戻る導線が `<a href="/">` で実装されている', () => {
    for (const html of [
      renderToStaticMarkup(<PrivacyPolicy />),
      renderToStaticMarkup(<TermsOfService />),
      renderToStaticMarkup(<Contact />),
    ]) {
      expect(html).toMatch(/<a [^>]*href="\/"[^>]*class="legal-back-btn"[^>]*>/);
    }
  });
});
