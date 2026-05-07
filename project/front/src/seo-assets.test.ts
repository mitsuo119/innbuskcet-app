// PBI-068 / TASK-505
// 構造化データ（JSON-LD）/ robots.txt / sitemap.xml / 404.html の検証。
// `__SITE_URL__` 置換は vite.config.ts の SEO プラグインで行うため、
// ソース上はトークン記述、置換後の整合は `replaceSeoTokens` モック注入で検証する（PBI-058 規律）。

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { replaceSeoTokens, resolveSiteUrl, SITE_URL_TOKEN } from './seo';

const FRONT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = resolve(FRONT_DIR, 'public');
const INDEX_HTML = readFileSync(resolve(FRONT_DIR, 'index.html'), 'utf-8');
const ROBOTS = readFileSync(resolve(PUBLIC_DIR, 'robots.txt'), 'utf-8');
const SITEMAP = readFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), 'utf-8');
const NOT_FOUND_HTML = readFileSync(resolve(PUBLIC_DIR, '404.html'), 'utf-8');

describe('PBI-068 JSON-LD 構造化データ', () => {
  // <script type="application/ld+json"> ブロックを抽出
  const m = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(INDEX_HTML);

  it('index.html に JSON-LD ブロックが 1 件以上存在する', () => {
    expect(m, 'JSON-LD <script> が見つかりません').not.toBeNull();
  });

  it('JSON として妥当でパースできる（トークン置換後）', () => {
    const body = m![1];
    const replaced = replaceSeoTokens(body, 'https://owner.github.io/ai-scrum-inbuscket/');
    expect(() => JSON.parse(replaced)).not.toThrow();
  });

  it('@context が https://schema.org / @type が WebSite または WebApplication', () => {
    const body = m![1];
    const replaced = replaceSeoTokens(body, 'https://owner.github.io/ai-scrum-inbuscket/');
    const obj = JSON.parse(replaced) as Record<string, unknown>;
    expect(obj['@context']).toBe('https://schema.org');
    expect(['WebSite', 'WebApplication']).toContain(obj['@type']);
  });

  it('必須項目（name / url / description / inLanguage）を持つ', () => {
    const body = m![1];
    const replaced = replaceSeoTokens(body, 'https://owner.github.io/ai-scrum-inbuscket/');
    const obj = JSON.parse(replaced) as Record<string, unknown>;
    expect(typeof obj.name).toBe('string');
    expect(obj.url).toBe('https://owner.github.io/ai-scrum-inbuscket/');
    expect(typeof obj.description).toBe('string');
    expect(obj.inLanguage).toBe('ja');
  });

  it('source 上は __SITE_URL__ トークンで記述され http(s) 直書きを含まない（PBI-058 規律）', () => {
    const body = m![1];
    expect(body).toContain(SITE_URL_TOKEN);
    expect(body).not.toMatch(/https?:\/\/(?!schema\.org)/);
  });

  it('dangerouslySetInnerHTML を src 配下に持ち込まない（DoD §10-2）', () => {
    // index.html に直書きされた静的 JSON-LD のため React 側に渡る危険な API は使われない。
    // JSX プロップとしての使用（`dangerouslySetInnerHTML=`）が無いことを検証する
    // （コメント等で語句に言及することは許容）。
    expect(INDEX_HTML).not.toMatch(/dangerouslySetInnerHTML\s*=/);
  });

  it('WebSite と BreadcrumbList の JSON-LD を追加している（PBI-072）', () => {
    expect(INDEX_HTML).toContain('"@type": "WebSite"');
    expect(INDEX_HTML).toContain('"@type": "BreadcrumbList"');
    expect(INDEX_HTML).toContain('"name": "解説リファレンス"');
    expect(INDEX_HTML).toContain('"name": "パターン別解説"');
  });
});

describe('PBI-068 robots.txt', () => {
  it('User-agent: * / Allow: / を含む', () => {
    expect(ROBOTS).toMatch(/User-agent:\s*\*/);
    expect(ROBOTS).toMatch(/Allow:\s*\//);
  });

  it('Sitemap 行が __SITE_URL__sitemap.xml を参照する（ビルド時置換）', () => {
    expect(ROBOTS).toMatch(new RegExp(`Sitemap:\\s*${SITE_URL_TOKEN}sitemap\\.xml`));
  });

  it('source 上は http(s) 直書きを含まない（PBI-058 規律）', () => {
    expect(ROBOTS).not.toMatch(/https?:\/\//);
  });

  it('GitHub Pages 公開 URL に解決される（モック注入）', () => {
    const out = replaceSeoTokens(
      ROBOTS,
      resolveSiteUrl(
        { VITE_SITE_URL: 'https://owner.github.io/ai-scrum-inbuscket/' },
        '/ai-scrum-inbuscket/',
      ),
    );
    expect(out).toContain('Sitemap: https://owner.github.io/ai-scrum-inbuscket/sitemap.xml');
    expect(out).not.toContain(SITE_URL_TOKEN);
  });
});

describe('PBI-068 sitemap.xml', () => {
  it('XML 宣言と urlset を持つ', () => {
    expect(SITEMAP).toMatch(/^<\?xml\s+version="1\.0"/);
    expect(SITEMAP).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
    expect(SITEMAP).toContain('<urlset');
  });

  it('トップページ + 主要画面 URL を含む（pathname ルート 6 件以上 / PBI-076 で hash 撤廃）', () => {
    const locs = [...SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThanOrEqual(6);
    expect(locs).toContain(SITE_URL_TOKEN); // home
    expect(locs).toContain(`${SITE_URL_TOKEN}patterns`);
    expect(locs).toContain(`${SITE_URL_TOKEN}reference`);
    expect(locs).toContain(`${SITE_URL_TOKEN}privacy-policy`);
    expect(locs).toContain(`${SITE_URL_TOKEN}terms-of-service`);
    expect(locs).toContain(`${SITE_URL_TOKEN}contact`);
  });

  it('hash ベース URL（`#/...`）を含まない（PBI-076 / TASK-076-5）', () => {
    const locs = [...SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
      expect(loc, `sitemap に hash ルートが残存: ${loc}`).not.toMatch(/#\//);
    }
  });

  it('source 上の <loc> は全て __SITE_URL__ トークン始まりで http(s) 直書きを含まない', () => {
    const locs = [...SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
      expect(loc.startsWith(SITE_URL_TOKEN)).toBe(true);
      expect(loc).not.toMatch(/https?:\/\//);
    }
  });

  it('GitHub Pages サブパスでも開発時 base="/" でも置換が成立する（複数ケース）', () => {
    // GitHub Pages 公開
    const prod = replaceSeoTokens(
      SITEMAP,
      resolveSiteUrl(
        { VITE_SITE_URL: 'https://owner.github.io/ai-scrum-inbuscket/' },
        '/ai-scrum-inbuscket/',
      ),
    );
    expect(prod).toContain('<loc>https://owner.github.io/ai-scrum-inbuscket/</loc>');
    expect(prod).toContain('<loc>https://owner.github.io/ai-scrum-inbuscket/patterns</loc>');
    expect(prod).toContain(
      '<loc>https://owner.github.io/ai-scrum-inbuscket/reference/chapter01</loc>',
    );
    expect(prod).not.toContain(SITE_URL_TOKEN);

    // 開発時
    const dev = replaceSeoTokens(SITEMAP, resolveSiteUrl({}, '/'));
    expect(dev).toContain('<loc>http://localhost:5173/</loc>');
    expect(dev).toContain('<loc>http://localhost:5173/patterns</loc>');
    expect(dev).not.toContain(SITE_URL_TOKEN);
  });
});

describe('PBI-068 404.html', () => {
  it('html lang="ja" を維持する', () => {
    expect(NOT_FOUND_HTML).toMatch(/<html\s+lang="ja"/);
  });

  it('title に「ページが見つかりません」を含む', () => {
    expect(NOT_FOUND_HTML).toMatch(/<title>[^<]*ページが見つかりません[^<]*<\/title>/);
  });

  it('meta robots="noindex" を設定する（404 ページは検索インデックス対象外）', () => {
    expect(NOT_FOUND_HTML).toMatch(/<meta\s+name="robots"\s+content="noindex"/);
  });

  it('color-scheme と theme-color（light/dark 両テーマ）を設定する', () => {
    expect(NOT_FOUND_HTML).toMatch(/<meta\s+name="color-scheme"\s+content="light dark"/);
    expect(NOT_FOUND_HTML).toMatch(
      /<meta\s+name="theme-color"[^>]*media="\(prefers-color-scheme: light\)"/,
    );
    expect(NOT_FOUND_HTML).toMatch(
      /<meta\s+name="theme-color"[^>]*media="\(prefers-color-scheme: dark\)"/,
    );
  });

  it('トップへ戻るリンクを持ち、href が __SITE_URL__ トークン（ビルド時置換）', () => {
    expect(NOT_FOUND_HTML).toMatch(/<a[^>]*href="__SITE_URL__"[^>]*>\s*トップへ戻る\s*<\/a>/);
  });

  it('source 上は http(s) 直書きを含まない（PBI-058 規律）', () => {
    // schema.org 等の外部参照は 404.html では持たない方針
    expect(NOT_FOUND_HTML).not.toMatch(/href="https?:\/\//);
    expect(NOT_FOUND_HTML).not.toMatch(/src="https?:\/\//);
  });

  it('インライン style に prefers-color-scheme: dark のダークテーマ定義を持つ', () => {
    expect(NOT_FOUND_HTML).toContain('@media (prefers-color-scheme: dark)');
  });

  it('置換後の href がサブパス公開でトップに解決される', () => {
    const out = replaceSeoTokens(
      NOT_FOUND_HTML,
      resolveSiteUrl(
        { VITE_SITE_URL: 'https://owner.github.io/ai-scrum-inbuscket/' },
        '/ai-scrum-inbuscket/',
      ),
    );
    expect(out).toContain('href="https://owner.github.io/ai-scrum-inbuscket/"');
    expect(out).not.toContain(SITE_URL_TOKEN);
  });
});

describe('PBI-069 / TASK-603: index.html noscript フォールバック', () => {
  // <noscript>...</noscript> ブロックを抽出
  const m = /<noscript>([\s\S]*?)<\/noscript>/.exec(INDEX_HTML);

  it('index.html に <noscript> ブロックが存在する', () => {
    expect(m, '<noscript> ブロックが見つかりません').not.toBeNull();
  });

  it('プロダクト概要を伝える日本語の説明文を含む', () => {
    const body = m![1];
    expect(body).toMatch(/インバスケット/);
    expect(body).toMatch(/JavaScript/);
    // ひらがな/カタカナ/漢字を 1 文字以上含む
    expect(body).toMatch(/[\u3040-\u30ff\u4e00-\u9fff]/);
  });

  it('JavaScript 有効化を促す案内文を含む', () => {
    const body = m![1];
    expect(body).toMatch(/JavaScript[^。]*有効/);
  });

  it('role="alert" を持つランドマークで囲まれている（スクリーンリーダ通知）', () => {
    const body = m![1];
    expect(body).toMatch(/role="alert"/);
  });

  it('外部参照（http(s):// の src/href）を含まない（DoD §10-2 / オフライン安全）', () => {
    const body = m![1];
    expect(body).not.toMatch(/src="https?:\/\//);
    expect(body).not.toMatch(/href="https?:\/\//);
  });

  it('img タグが存在しない（または存在する場合 alt と width/height を必須とする）', () => {
    const body = m![1];
    const imgs = [...body.matchAll(/<img\b[^>]*>/g)];
    for (const i of imgs) {
      expect(i[0], 'noscript 内 img には alt が必須').toMatch(/\salt="/);
      expect(i[0], 'noscript 内 img には width が必須').toMatch(/\swidth="/);
      expect(i[0], 'noscript 内 img には height が必須').toMatch(/\sheight="/);
    }
  });
});

describe('PBI-069 / TASK-602: index.html 全体の Best Practices 観点', () => {
  it('<img> タグがある場合は alt 属性を必須とする（現状 0 件で空走を許容）', () => {
    const imgs = [...INDEX_HTML.matchAll(/<img\b[^>]*>/g)];
    for (const i of imgs) {
      expect(i[0], `index.html の img には alt が必須: ${i[0]}`).toMatch(/\salt="/);
    }
  });

  it('og:image にも alt（og:image:alt）と width/height を併記する（SNS プレビュー崩れ予防）', () => {
    expect(INDEX_HTML).toMatch(/<meta\s+property="og:image:alt"\s+content="[^"]+"/);
    expect(INDEX_HTML).toMatch(/<meta\s+property="og:image:width"\s+content="\d+"/);
    expect(INDEX_HTML).toMatch(/<meta\s+property="og:image:height"\s+content="\d+"/);
  });

  it('charset / viewport / doctype を備える（Lighthouse Best Practices 基本要件）', () => {
    expect(INDEX_HTML).toMatch(/^<!doctype html>/i);
    expect(INDEX_HTML).toMatch(/<meta\s+charset="UTF-8"/i);
    expect(INDEX_HTML).toMatch(
      /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1\.0"/,
    );
  });
});
