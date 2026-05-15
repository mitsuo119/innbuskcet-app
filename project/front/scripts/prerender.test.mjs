// PBI-086 / TASK-086-5 (Sprint024 DAY4)
// SSG/Pre-render PoC（C2: 自前静的 HTML 生成スクリプト）の純関数検証＋スナップショット。
//
// view-source: 静的取得確認の自動化版:
//   - h1 / 本文段落（data-prerender 属性付き）が <div id="root"> に挿入されること
//   - title / canonical / OGP / Twitter Card メタが各ルートのメタに置換されること
//   - 既存 AdSense ローダー <script>（vite.config.ts プラグインで注入）が継承されること
//   - `transformIndexHtml` 後の siteUrl 置換と衝突しないこと

import { describe, it, expect } from 'vitest';
import { ROUTES, resolveSiteUrl, toAbsoluteUrl, transformTemplateForRoute } from './prerender.mjs';

/**
 * `dist/index.html` 風の最小テンプレート。
 * vite build → transform-seo-tokens（__SITE_URL__ 置換済）後の状態を模擬する。
 * AdSense ローダー <script> も注入済として扱う（PBI-052 / vite.config.ts）。
 */
const TEMPLATE = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="DEFAULT DESCRIPTION" />
    <link rel="canonical" href="https://example.test/" />
    <meta property="og:title" content="DEFAULT TITLE" />
    <meta property="og:description" content="DEFAULT DESCRIPTION" />
    <meta property="og:url" content="https://example.test/" />
    <meta name="twitter:title" content="DEFAULT TITLE" />
    <meta name="twitter:description" content="DEFAULT DESCRIPTION" />
    <title>DEFAULT TITLE</title>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossorigin="anonymous"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`;

const SITE_URL = 'https://example.test/';

describe('PBI-086 prerender 純関数', () => {
  it('resolveSiteUrl は VITE_SITE_URL を末尾 / 付きで返す', () => {
    const original = process.env.VITE_SITE_URL;
    process.env.VITE_SITE_URL = 'https://owner.github.io/repo';
    expect(resolveSiteUrl()).toBe('https://owner.github.io/repo/');
    process.env.VITE_SITE_URL = 'https://owner.github.io/repo/';
    expect(resolveSiteUrl()).toBe('https://owner.github.io/repo/');
    process.env.VITE_SITE_URL = original;
  });

  it('toAbsoluteUrl はトップとサブパスの双方を絶対 URL 化する', () => {
    expect(toAbsoluteUrl(SITE_URL, '/')).toBe('https://example.test/');
    expect(toAbsoluteUrl(SITE_URL, '/reference/chapter01')).toBe(
      'https://example.test/reference/chapter01',
    );
  });

  it('PoC 対象は /（in-place）と /reference/chapter01 の 2 ルートで構成される', () => {
    expect(ROUTES.map((r) => r.path)).toEqual(['/', '/reference/chapter01']);
    expect(ROUTES.map((r) => r.outRelative)).toEqual([
      'index.html',
      'reference/chapter01/index.html',
    ]);
  });
});

describe('PBI-086 transformTemplateForRoute（view-source: 静的可視）', () => {
  for (const route of ROUTES) {
    describe(`route=${route.path}`, () => {
      const out = transformTemplateForRoute(TEMPLATE, SITE_URL, route);
      const absolute = toAbsoluteUrl(SITE_URL, route.path);

      it('ルート別 title に置換される', () => {
        expect(out).toContain(`<title>${route.title}</title>`);
      });

      it('description / OGP / Twitter メタがルート別に置換される', () => {
        expect(out).toContain(`<meta name="description" content="${route.description}"`);
        expect(out).toContain(`<meta property="og:title" content="${route.title}"`);
        expect(out).toContain(`<meta property="og:description" content="${route.description}"`);
        expect(out).toContain(`<meta property="og:url" content="${absolute}"`);
        expect(out).toContain(`<meta name="twitter:title" content="${route.title}"`);
        expect(out).toContain(`<meta name="twitter:description" content="${route.description}"`);
      });

      it('canonical がルート絶対 URL に置換される', () => {
        expect(out).toContain(`<link rel="canonical" href="${absolute}"`);
      });

      it('<div id="root"> 内に静的 h1 と段落が挿入される', () => {
        expect(out).toMatch(/<div id="root">[\s\S]*<h1>[\s\S]*<\/h1>[\s\S]*<\/div>/);
        expect(out).toMatch(/<div id="root">[\s\S]*<p>[\s\S]*<\/p>[\s\S]*<\/div>/);
        expect(out).toContain('data-prerender');
      });

      it('AdSense ローダー <script> が継承される（PBI-052 整合）', () => {
        expect(out).toContain('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
      });

      it('SPA マウントスクリプトが残存する（既存 SPA 挙動維持 / ADR-002 R-A）', () => {
        expect(out).toContain('<script type="module" src="/assets/index.js"></script>');
      });
    });
  }

  it('生成 HTML 全体スナップショット（/ ルート / 退行検知）', () => {
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, ROUTES[0]);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/reference/chapter01 ルート / 退行検知）', () => {
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, ROUTES[1]);
    expect(out).toMatchSnapshot();
  });
});
