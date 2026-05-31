// PBI-086 / TASK-086-5 (Sprint024 DAY4)
// SSG/Pre-render PoC（C2: 自前静的 HTML 生成スクリプト）の純関数検証＋スナップショット。
//
// view-source: 静的取得確認の自動化版:
//   - h1 / 本文段落（data-prerender 属性付き）が <div id="root"> に挿入されること
//   - title / canonical / OGP / Twitter Card メタが各ルートのメタに置換されること
//   - 既存 AdSense ローダー <script>（vite.config.ts プラグインで注入）が継承されること
//   - `transformIndexHtml` 後の siteUrl 置換と衝突しないこと

import { describe, it, expect } from 'vitest';
import {
  ROUTES,
  resolveSiteUrl,
  toAbsoluteUrl,
  transformTemplateForRoute,
  countVisibleText,
  mdToHtml,
} from './prerender.mjs';

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

  it('Sprint025 PBI-087 第1〜4段階 + Sprint026 PBI-099 一覧 の 59 ルート（/, /about, /terms, /privacy-policy, /contact, /reference/chapter01〜12, /cases/case-XXX × 20, /patterns/1〜20, /reference, /patterns）を含む', () => {
    const paths = ROUTES.map((r) => r.path);
    expect(paths).toHaveLength(59);
    expect(paths.slice(0, 5)).toEqual(['/', '/about', '/terms', '/privacy-policy', '/contact']);
    expect(paths.slice(5, 17)).toEqual([
      '/reference/chapter01',
      '/reference/chapter02',
      '/reference/chapter03',
      '/reference/chapter04',
      '/reference/chapter05',
      '/reference/chapter06',
      '/reference/chapter07',
      '/reference/chapter08',
      '/reference/chapter09',
      '/reference/chapter10',
      '/reference/chapter11',
      '/reference/chapter12',
    ]);
    expect(paths.slice(17, 37)).toEqual([
      '/cases/case-001',
      '/cases/case-002',
      '/cases/case-004',
      '/cases/case-010',
      '/cases/case-012',
      '/cases/case-013',
      '/cases/case-015',
      '/cases/case-016',
      '/cases/case-017',
      '/cases/case-018',
      '/cases/case-019',
      '/cases/case-021',
      '/cases/case-029',
      '/cases/case-031',
      '/cases/case-035',
      '/cases/case-037',
      '/cases/case-039',
      '/cases/case-042',
      '/cases/case-048',
      '/cases/case-053',
    ]);
    expect(paths.slice(37, 57)).toEqual([
      '/patterns/1',
      '/patterns/2',
      '/patterns/3',
      '/patterns/4',
      '/patterns/5',
      '/patterns/6',
      '/patterns/7',
      '/patterns/8',
      '/patterns/9',
      '/patterns/10',
      '/patterns/11',
      '/patterns/12',
      '/patterns/13',
      '/patterns/14',
      '/patterns/15',
      '/patterns/16',
      '/patterns/17',
      '/patterns/18',
      '/patterns/19',
      '/patterns/20',
    ]);
    // Sprint026 PBI-099 一覧プリレンダ追加分
    expect(paths.slice(57)).toEqual(['/reference', '/patterns']);
    expect(ROUTES[0].outRelative).toBe('index.html');
    expect(ROUTES[1].outRelative).toBe('about/index.html');
    expect(ROUTES[3].outRelative).toBe('privacy-policy/index.html');
    expect(ROUTES[4].outRelative).toBe('contact/index.html');
    expect(ROUTES[5].outRelative).toBe('reference/chapter01/index.html');
    expect(ROUTES[16].outRelative).toBe('reference/chapter12/index.html');
    expect(ROUTES[17].outRelative).toBe('cases/case-001/index.html');
    expect(ROUTES[36].outRelative).toBe('cases/case-053/index.html');
    expect(ROUTES[37].outRelative).toBe('patterns/1/index.html');
    expect(ROUTES[56].outRelative).toBe('patterns/20/index.html');
    expect(ROUTES[57].outRelative).toBe('reference/index.html');
    expect(ROUTES.at(-1)?.outRelative).toBe('patterns/index.html');
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
    const homeRoute = ROUTES.find((r) => r.path === '/');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, homeRoute);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/reference/chapter01 ルート / 退行検知）', () => {
    const ch01 = ROUTES.find((r) => r.path === '/reference/chapter01');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, ch01);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/reference/chapter06 ルート / 第2段階代表）', () => {
    const ch06 = ROUTES.find((r) => r.path === '/reference/chapter06');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, ch06);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/reference/chapter12 ルート / 第2段階末尾）', () => {
    const ch12 = ROUTES.find((r) => r.path === '/reference/chapter12');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, ch12);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/cases/case-001 ルート / 第3段階先頭）', () => {
    const c1 = ROUTES.find((r) => r.path === '/cases/case-001');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, c1);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/cases/case-029 ルート / 第3段階中央代表）', () => {
    const c29 = ROUTES.find((r) => r.path === '/cases/case-029');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, c29);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/cases/case-053 ルート / 第3段階末尾）', () => {
    const c53 = ROUTES.find((r) => r.path === '/cases/case-053');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, c53);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/patterns/1 ルート / 第4段階先頭代表）', () => {
    const p1 = ROUTES.find((r) => r.path === '/patterns/1');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, p1);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/patterns/10 ルート / 第4段階中央代表）', () => {
    const p10 = ROUTES.find((r) => r.path === '/patterns/10');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, p10);
    expect(out).toMatchSnapshot();
  });

  it('生成 HTML 全体スナップショット（/patterns/20 ルート / 第4段階末尾）', () => {
    const p20 = ROUTES.find((r) => r.path === '/patterns/20');
    const out = transformTemplateForRoute(TEMPLATE, SITE_URL, p20);
    expect(out).toMatchSnapshot();
  });
});

// Sprint026 PBI-097 / TASK-097-2
// クローキング解消の自動検証: ROUTES 全件で出力 HTML に `hidden` 属性および
// `aria-hidden="true"` を含まないこと（テンプレート文字列に固定で残らないこと）を担保する。
// view-source: クローラ可視性の退行を CI で検知するためのガード。
describe('PBI-097 クローキング解消（hidden aria-hidden 除去）', () => {
  for (const route of ROUTES) {
    it(`${route.path} の出力に hidden aria-hidden が含まれない`, () => {
      const out = transformTemplateForRoute(TEMPLATE, SITE_URL, route);
      expect(out).not.toMatch(/hidden\s+aria-hidden="true"/i);
      // data-prerender ラッパ div 自体に hidden 属性が付いていないことも明示的に検証。
      expect(out).not.toMatch(/<div\s+data-prerender="[^"]+"\s+hidden\b/i);
    });
  }

  it('route.bodyHtml テンプレート文字列自体にも hidden / aria-hidden が含まれない', () => {
    for (const route of ROUTES) {
      expect(route.bodyHtml).not.toMatch(/\bhidden\b/i);
      expect(route.bodyHtml).not.toMatch(/aria-hidden="true"/i);
    }
  });
});

// Sprint026 PBI-098 第1段階 / TASK-098-2
// プリレンダ本文文字数下限（600字）の自動検証。referenceData/cases/patternData に
// 由来する実本文を view-source: で 600 字以上可視出力することを担保し、
// AdSense審査の「薄いプリレンダ」根治退行を CI で検知する。
describe('PBI-098 プリレンダ本文文字数下限（600字以上 / 章 + 詳細ページ）', () => {
  // 第1段階: reference chapter01〜12（mdToHtml で ref/ 本文を焼き込み）
  const chapterRoutes = ROUTES.filter((r) => /^\/reference\/chapter\d{2}$/.test(r.path));
  it('reference 章ルートが 12 件存在する', () => {
    expect(chapterRoutes).toHaveLength(12);
  });
  for (const route of chapterRoutes) {
    it(`${route.path} の bodyHtml 可視テキストが 600 字以上`, () => {
      const len = countVisibleText(route.bodyHtml);
      expect(len).toBeGreaterThanOrEqual(600);
    });
  }

  // Sprint026 PBI-098 第2段階 / TASK-098-3
  // 代表ケース20件（cases.json 由来の本文・解説・模範回答を焼き込み）
  const caseRoutes = ROUTES.filter((r) => /^\/cases\/case-\d{3}$/.test(r.path));
  it('cases ルートが 20 件存在する', () => {
    expect(caseRoutes).toHaveLength(20);
  });
  for (const route of caseRoutes) {
    it(`${route.path} の bodyHtml 可視テキストが 600 字以上`, () => {
      const len = countVisibleText(route.bodyHtml);
      expect(len).toBeGreaterThanOrEqual(600);
    });
  }
  it('代表ケース case-001 / case-010 / case-053（ID昇順末尾）の本文に解説と模範回答セクションが含まれる', () => {
    const sample = ['/cases/case-001', '/cases/case-010', '/cases/case-053'];
    for (const path of sample) {
      const r = caseRoutes.find((x) => x.path === path);
      expect(r, `${path} が ROUTES に存在しない`).toBeDefined();
      expect(r.bodyHtml).toContain('<h2>ケース概要：');
      expect(r.bodyHtml).toContain('<h2>正解優先度：');
      expect(r.bodyHtml).toContain('<h2>模範回答の骨格</h2>');
      expect(r.bodyHtml).toContain('判断：');
      expect(r.bodyHtml).toContain('理由：');
      expect(r.bodyHtml).toContain('対応：');
    }
  });

  // Sprint026 PBI-098 第3段階 / TASK-098-4
  // 全 20 パターン詳細（patternData.ts 由来の characteristics / answerSkeleton / keyPhrases / notes を焼き込み）
  const patternRoutes = ROUTES.filter((r) => /^\/patterns\/\d+$/.test(r.path));
  it('patterns ルートが 20 件存在する', () => {
    expect(patternRoutes).toHaveLength(20);
  });
  for (const route of patternRoutes) {
    it(`${route.path} の bodyHtml 可視テキストが 600 字以上`, () => {
      const len = countVisibleText(route.bodyHtml);
      expect(len).toBeGreaterThanOrEqual(600);
    });
  }
  it('代表パターン /patterns/1 / /patterns/10 / /patterns/20 の本文に主要セクションが含まれる', () => {
    const sample = ['/patterns/1', '/patterns/10', '/patterns/20'];
    for (const path of sample) {
      const r = patternRoutes.find((x) => x.path === path);
      expect(r, `${path} が ROUTES に存在しない`).toBeDefined();
      expect(r.bodyHtml).toContain('<h2>カテゴリ：');
      expect(r.bodyHtml).toContain('<h2>優先度の目安：');
      expect(r.bodyHtml).toContain('<h2>回答の骨格');
    }
  });
});

// Sprint026 PBI-098 / TASK-098-1
// Markdown→HTML 変換ヘルパー（mdToHtml）の純関数検証。
describe('PBI-098 mdToHtml 純関数', () => {
  it('frontmatter は除去される', () => {
    const html = mdToHtml('---\ntitle: x\n---\n\n## H\n\n本文');
    expect(html).not.toContain('title: x');
    expect(html).toContain('<h2>H</h2>');
    expect(html).toContain('<p>本文</p>');
  });
  it('見出し（##/###）が h2/h3 に変換される', () => {
    expect(mdToHtml('## 章\n\n### 節')).toBe('<h2>章</h2>\n<h3>節</h3>');
  });
  it('箇条書きが ul/li に変換される', () => {
    expect(mdToHtml('- a\n- b')).toBe('<ul><li>a</li><li>b</li></ul>');
  });
  it('表が table/thead/tbody に変換される', () => {
    const html = mdToHtml('| h1 | h2 |\n| --- | --- |\n| a | b |');
    expect(html).toContain('<table>');
    expect(html).toContain('<th>h1</th>');
    expect(html).toContain('<td>a</td>');
  });
  it('**bold** と `code` のインライン記法を変換しつつ HTML エスケープする', () => {
    const html = mdToHtml('**強調** と `cmd` と <危険>');
    expect(html).toContain('<strong>強調</strong>');
    expect(html).toContain('<code>cmd</code>');
    expect(html).toContain('&lt;危険&gt;');
  });
});

// Sprint026 PBI-099 / TASK-099-1
// 一覧プリレンダ（/reference・/patterns）の説明文・項目別出力を検証する。
describe('PBI-099 一覧プリレンダ（/reference・/patterns）', () => {
  const refIndex = ROUTES.find((r) => r.path === '/reference');
  const patternsIndex = ROUTES.find((r) => r.path === '/patterns');
  it('/reference ルートが存在し ul/li で全12章を列挙する', () => {
    expect(refIndex).toBeDefined();
    expect(refIndex.bodyHtml).toContain('<ul>');
    for (let i = 1; i <= 12; i++) {
      const id = `chapter${String(i).padStart(2, '0')}`;
      expect(refIndex.bodyHtml).toContain(`/reference/${id}`);
    }
  });
  it('/reference ルートに導入文（一覧の目的・使い方）が含まれる', () => {
    expect(refIndex.bodyHtml).toMatch(/全12章の索引/);
    expect(refIndex.bodyHtml).toMatch(/使い方の目安/);
  });
  it('/patterns ルートが存在し ul/li で全20パターンを列挙する', () => {
    expect(patternsIndex).toBeDefined();
    expect(patternsIndex.bodyHtml).toContain('<ul>');
    for (let i = 1; i <= 20; i++) {
      expect(patternsIndex.bodyHtml).toContain(`/patterns/${i}`);
    }
  });
  it('/patterns ルートに導入文（一覧の目的・使い方）が含まれる', () => {
    expect(patternsIndex.bodyHtml).toMatch(/案件20パターンの索引/);
    expect(patternsIndex.bodyHtml).toMatch(/使い方の目安/);
  });
  it('一覧ページ自身もプリレンダ本文 200 字以上（広告非掲載・項目集約のため低めの下限）', () => {
    expect(countVisibleText(refIndex.bodyHtml)).toBeGreaterThanOrEqual(200);
    expect(countVisibleText(patternsIndex.bodyHtml)).toBeGreaterThanOrEqual(200);
  });
});
