// PBI-067 / TASK-405
// SEO / OGP / Twitter Card / canonical メタの設置と
// `resolveSiteUrl` / `replaceSeoTokens` ユーティリティを検証する。
// env 依存値はモック注入で複数ケース確認（PBI-058 規律）。

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSiteUrl, replaceSeoTokens, SITE_URL_TOKEN } from './seo';

const FRONT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_HTML = resolve(FRONT_DIR, 'index.html');
const HTML = readFileSync(INDEX_HTML, 'utf-8');

describe('PBI-067 resolveSiteUrl', () => {
  it('VITE_SITE_URL（末尾 / あり）はそのまま返す', () => {
    expect(
      resolveSiteUrl(
        { VITE_SITE_URL: 'https://owner.github.io/ai-scrum-inbuscket/' },
        '/ai-scrum-inbuscket/',
      ),
    ).toBe('https://owner.github.io/ai-scrum-inbuscket/');
  });

  it('VITE_SITE_URL（末尾 / なし）には / を補完する', () => {
    expect(
      resolveSiteUrl(
        { VITE_SITE_URL: 'https://owner.github.io/ai-scrum-inbuscket' },
        '/ai-scrum-inbuscket/',
      ),
    ).toBe('https://owner.github.io/ai-scrum-inbuscket/');
  });

  it('VITE_SITE_URL 未指定時は localhost + base を返す（base="/"）', () => {
    expect(resolveSiteUrl({}, '/')).toBe('http://localhost:5173/');
  });

  it('VITE_SITE_URL 未指定時は localhost + base を返す（サブパス base）', () => {
    expect(resolveSiteUrl({ VITE_SITE_URL: '' }, '/ai-scrum-inbuscket/')).toBe(
      'http://localhost:5173/ai-scrum-inbuscket/',
    );
  });

  it('VITE_SITE_URL の前後空白はトリムする', () => {
    expect(
      resolveSiteUrl(
        { VITE_SITE_URL: '  https://owner.github.io/ai-scrum-inbuscket/  ' },
        '/ai-scrum-inbuscket/',
      ),
    ).toBe('https://owner.github.io/ai-scrum-inbuscket/');
  });
});

describe('PBI-067 replaceSeoTokens', () => {
  it('__SITE_URL__ を全箇所置換する', () => {
    const html = `<a href="${SITE_URL_TOKEN}"></a><img src="${SITE_URL_TOKEN}x.png">`;
    expect(replaceSeoTokens(html, 'https://x/y/')).toBe(
      '<a href="https://x/y/"></a><img src="https://x/y/x.png">',
    );
  });

  it('置換対象が無い場合は HTML をそのまま返す', () => {
    expect(replaceSeoTokens('<p>hello</p>', 'https://x/')).toBe('<p>hello</p>');
  });
});

describe('PBI-067 index.html SEO/OGP/Twitter Card メタの存在', () => {
  it('html lang="ja" を維持する', () => {
    expect(HTML).toMatch(/<html\s+lang="ja"/);
  });

  it('meta description が日本語で 70〜120 字に収まる', () => {
    const m = /<meta[^>]*\sname="description"[^>]*\scontent="([^"]+)"/.exec(HTML);
    expect(m, 'meta description が見つかりません').not.toBeNull();
    const content = m![1];
    expect(content.length).toBeGreaterThanOrEqual(70);
    expect(content.length).toBeLessThanOrEqual(120);
    // 日本語文字（ひらがな/カタカナ/漢字）を 1 文字以上含む
    expect(content).toMatch(/[\u3040-\u30ff\u4e00-\u9fff]/);
  });

  it('color-scheme を light dark で設定する', () => {
    expect(HTML).toMatch(/<meta\s+name="color-scheme"\s+content="light dark"/);
  });

  it('canonical リンクをプレースホルダで設定する（ビルド時注入）', () => {
    expect(HTML).toMatch(/<link\s+rel="canonical"\s+href="__SITE_URL__"/);
  });

  it('OGP（og:type=website / og:title / og:description / og:url / og:image）を設定する', () => {
    expect(HTML).toMatch(/<meta\s+property="og:type"\s+content="website"/);
    expect(HTML).toMatch(/<meta\s+property="og:title"\s+content="[^"]+"/);
    expect(HTML).toMatch(/<meta\s+property="og:description"\s+content="[^"]+"/);
    expect(HTML).toMatch(/<meta\s+property="og:url"\s+content="__SITE_URL__"/);
    expect(HTML).toMatch(/<meta\s+property="og:image"\s+content="__SITE_URL__icon-512\.png"/);
    expect(HTML).toMatch(/<meta\s+property="og:locale"\s+content="ja_JP"/);
  });

  it('Twitter Card（summary_large_image / title / description / image）を設定する', () => {
    expect(HTML).toMatch(/<meta\s+name="twitter:card"\s+content="summary_large_image"/);
    expect(HTML).toMatch(/<meta\s+name="twitter:title"\s+content="[^"]+"/);
    expect(HTML).toMatch(/<meta\s+name="twitter:description"\s+content="[^"]+"/);
    expect(HTML).toMatch(/<meta\s+name="twitter:image"\s+content="__SITE_URL__icon-512\.png"/);
  });

  it('source 上に canonical/og:url/og:image/twitter:image の http(s) 直書きを含まない（PBI-058 規律）', () => {
    const tags = ['canonical', 'og:url', 'og:image', 'twitter:image'];
    for (const tag of tags) {
      // tag を持つメタ/リンク行に `https?://` 直書きが無いこと
      const re = new RegExp(
        String.raw`<(?:meta|link)[^>]*(?:property|name|rel)="${tag}"[^>]*(?:content|href)="https?://[^"]+"`,
      );
      expect(HTML, `${tag} に http(s) 直書きが含まれてはならない`).not.toMatch(re);
    }
  });
});

describe('PBI-067 ビルド時のサブパス解決（モック注入）', () => {
  it('GitHub Pages 公開時に canonical/og:url/og:image が公開 URL に解決される', () => {
    const siteUrl = resolveSiteUrl(
      { VITE_SITE_URL: 'https://owner.github.io/ai-scrum-inbuscket/' },
      '/ai-scrum-inbuscket/',
    );
    const out = replaceSeoTokens(HTML, siteUrl);
    expect(out).toContain(
      '<link rel="canonical" href="https://owner.github.io/ai-scrum-inbuscket/"',
    );
    expect(out).toContain(
      '<meta property="og:url" content="https://owner.github.io/ai-scrum-inbuscket/"',
    );
    expect(out).toContain(
      '<meta property="og:image" content="https://owner.github.io/ai-scrum-inbuscket/icon-512.png"',
    );
    expect(out).toContain(
      '<meta name="twitter:image" content="https://owner.github.io/ai-scrum-inbuscket/icon-512.png"',
    );
    expect(out).not.toContain(SITE_URL_TOKEN);
  });

  it('開発時（base="/" / VITE_SITE_URL 未設定）は localhost に解決される', () => {
    const siteUrl = resolveSiteUrl({}, '/');
    const out = replaceSeoTokens(HTML, siteUrl);
    expect(out).toContain('<link rel="canonical" href="http://localhost:5173/"');
    expect(out).not.toContain(SITE_URL_TOKEN);
  });

  it('別オーナー/別リポ名でも置換が成立する（複数ケース）', () => {
    const siteUrl = resolveSiteUrl(
      { VITE_SITE_URL: 'https://example.github.io/another-repo/' },
      '/another-repo/',
    );
    const out = replaceSeoTokens(HTML, siteUrl);
    expect(out).toContain('<link rel="canonical" href="https://example.github.io/another-repo/"');
    expect(out).toContain(
      '<meta property="og:image" content="https://example.github.io/another-repo/icon-512.png"',
    );
  });
});
