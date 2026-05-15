// PBI-086 / TASK-086-4 (Sprint024 DAY3)
// SSG/Pre-render PoC — ADR-002（C2: 自前静的 HTML 生成スクリプト）採用案の最小実装。
//
// 目的:
// - AdSense クローラ（Mediapartners-Google）が `view-source:` した際に、
//   h1 と本文段落・主要メタを「JS 実行前に」取得できる状態にすること。
// - 既存 SPA 挙動（React マウント後にクライアントルーティングへ移行）を完全に維持すること。
// - 既存 AdSense ローダー Vite プラグイン（vite.config.ts）／`scripts/transform-seo-tokens.mjs`／
//   `public/404.html`（PBI-076 SPA フォールバック）と衝突しないこと。
//
// PoC 対象 2 ルート（ADR-002 / R-A 受容）:
//   1) `/`                       … トップ画面（h1 = インバスケット ／ 本文 = PBI-090「このサイトについて」段落）
//   2) `/reference/chapter01`    … 章「インバスケットとは何か」（章 title / description / 概要本文）
//
// 動作:
//   - `dist/index.html` をテンプレートとして読み込み、ルートごとに以下を差し替えて出力する。
//       * <title>                                   → ルート別 title
//       * <meta name="description">                 → ルート別 description
//       * <link rel="canonical">                    → siteUrl + path
//       * <meta property="og:title|og:description|og:url">
//       * <meta name="twitter:title|twitter:description">
//       * <div id="root"></div>                     → 静的フォールバック本文（h1 + 段落）を内側に挿入
//         （React マウント時に置換される。view-source: では本文テキストとして可視。）
//   - 出力先:
//       * `/`                    → `dist/index.html`（in-place 更新）
//       * `/reference/chapter01` → `dist/reference/chapter01/index.html`（mkdir -p）
//
// 注意（後続スプリントへの引き継ぎ）:
//   - 本 PoC は 2 ルート決め打ち。PBI-087（全ルート展開）で `routes.ts` 単一ソースから
//     URL を列挙し、`resolveRouteSeo`（`Router.tsx`）と等価なメタを Node 側で生成する設計に拡張する。
//   - DOM レンダリング（React コンポーネント評価）は行わず、ルートごとに静的に既知のテキストを
//     書き込む方式。重量級依存（Puppeteer / Playwright）を回避（ADR-002 / E3〜E6 / R-A）。
//
// 依存追加: なし（Node 標準のみ）。

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONT_DIR = resolve(__dirname, '..');
const DIST_DIR = resolve(FRONT_DIR, 'dist');
const TEMPLATE = resolve(DIST_DIR, 'index.html');

const APP_NAME = 'インバスケット - 学習アプリ';

/**
 * `transform-seo-tokens.mjs` と同等のロジックで siteUrl を解決する
 * （末尾 `/` を保証）。本番ビルドでは GitHub Actions が `VITE_SITE_URL` を注入する。
 */
export function resolveSiteUrl() {
  const raw = (process.env.VITE_SITE_URL ?? '').trim();
  if (raw) return raw.endsWith('/') ? raw : `${raw}/`;
  const base = process.env.VITE_BASE_URL ?? '/';
  const withLeading = base.startsWith('/') ? base : `/${base}`;
  const withTrailing = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  return `http://localhost:5173${withTrailing}`;
}

/** path（先頭 `/`）を絶対 URL に変換する。`/` はサイトルートのまま。 */
export function toAbsoluteUrl(siteUrl, path) {
  if (path === '/') return siteUrl;
  return `${siteUrl}${path.replace(/^\/+/, '')}`;
}

/**
 * PoC 対象 2 ルートのメタ＋静的フォールバック本文。
 * - title/description は `Router.tsx#resolveRouteSeo` の同ルート分岐と意味的に一致させること。
 * - bodyHtml は `<div id="root">` の内側に挿入される。React マウント直後に置換されるため
 *   ユーザー体験には影響しないが、AdSense クローラの view-source: では本文として可視となる。
 */
export const ROUTES = [
  {
    path: '/',
    outRelative: 'index.html',
    title: APP_NAME,
    description:
      '管理職昇進試験のインバスケット演習を、案件処理・優先順位付け・委任判断などのフレームワークから模擬試験までブラウザで体系的に学べる無料の日本語学習Webアプリです。',
    bodyHtml: `
      <div data-prerender="home" hidden aria-hidden="true">
        <h1>インバスケット</h1>
        <p>InBusket（インバスケット学習アプリ）は、管理職昇進試験などで出題されるインバスケット演習を、案件処理・優先順位付け・委任判断・意思決定フレームワーク・模擬試験まで、ブラウザ上で体系的に無料で学べる日本語の学習Webサービスです。</p>
        <p>想定読者は管理職昇進試験を控える社会人や、優先順位判断・委任・意思決定スキルを体系的に学びたい方です。コンテンツは全12章の解説リファレンス、全20パターンのケース別解説、代表ケース20件の単独URL演習、Quick（速習）／Deep（記述）／Exam（模試）の3つの学習モードで構成されます。</p>
        <p>詳細は <a href="/about">運営者情報</a> ／ <a href="/terms">サービス利用規約</a> をご覧ください。</p>
      </div>
    `.trim(),
  },
  {
    path: '/reference/chapter01',
    outRelative: 'reference/chapter01/index.html',
    title: `解説リファレンス：インバスケットとは何か | ${APP_NAME}`,
    description:
      'インバスケット学習の「インバスケットとは何か」を中心に、要点とフレームワークを章別に確認できる解説リファレンスページです。',
    bodyHtml: `
      <div data-prerender="reference-chapter01" hidden aria-hidden="true">
        <h1>解説リファレンス：インバスケットとは何か</h1>
        <p>インバスケット試験は、架空の管理職に着任した初日に未処理案件を制限時間内で処理するシミュレーションです。評価対象は「承認したか」よりも、なぜそう判断し、誰にどう指示したかというマネージャーとしての行動パターンです。</p>
        <p>本章では試験の正体と、エンジニアが求められる思考シフト（プレイヤー思考からマネージャー思考へ）を整理します。論理的思考力や問題分析力そのものは武器になりますが、使いどころを「自分が解く」から「組織で処理する」に切り替えることが合格の鍵です。</p>
        <p>関連パターン：<a href="/patterns/1">顧客クレーム（パターン1）</a> — A優先度・並行対応の代表例で「組織で処理する」発想を実体験できます。</p>
      </div>
    `.trim(),
  },
];

/** title 要素の中身を差し替える（テンプレート 1 件のみ存在前提）。 */
function replaceTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

/** name 属性 meta の content を差し替える（存在しない場合は no-op）。 */
function replaceMetaByName(html, name, content) {
  const re = new RegExp(`(<meta\\s+name="${escapeRegExp(name)}"\\s+content=)"[^"]*"`, 'i');
  return html.replace(re, `$1"${escapeAttr(content)}"`);
}

/** property 属性 meta の content を差し替える（OGP 用）。 */
function replaceMetaByProperty(html, property, content) {
  const re = new RegExp(`(<meta\\s+property="${escapeRegExp(property)}"\\s+content=)"[^"]*"`, 'i');
  return html.replace(re, `$1"${escapeAttr(content)}"`);
}

/** canonical の href を差し替える。 */
function replaceCanonical(html, absoluteUrl) {
  return html.replace(
    /(<link\s+rel="canonical"\s+href=)"[^"]*"/i,
    `$1"${escapeAttr(absoluteUrl)}"`,
  );
}

/**
 * `<div id="root"></div>`（または既存の中身入り `<div id="root">...</div>`）の内側に
 * 静的フォールバック本文を挿入する。React マウント時に内容は置換される。
 * 既に prerender 済（`data-prerender` 属性）の場合は二重挿入を避けて差し替える。
 */
function injectIntoRoot(html, bodyHtml) {
  const re = /<div id="root">[\s\S]*?<\/div>/i;
  return html.replace(re, `<div id="root">${bodyHtml}</div>`);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureTemplateExists() {
  try {
    await access(TEMPLATE, constants.R_OK);
  } catch {
    throw new Error(
      `[prerender] dist/index.html が存在しません。先に \`vite build\` を実行してください: ${TEMPLATE}`,
    );
  }
}

/**
 * テンプレート HTML をルート別メタ＋本文で書き換える純関数。
 * ファイル I/O を伴わず副作用がないため vitest で検証可能（TASK-086-5）。
 */
export function transformTemplateForRoute(template, siteUrl, route) {
  const absoluteUrl = toAbsoluteUrl(siteUrl, route.path);
  let html = template;
  html = replaceTitle(html, route.title);
  html = replaceMetaByName(html, 'description', route.description);
  html = replaceCanonical(html, absoluteUrl);
  html = replaceMetaByProperty(html, 'og:title', route.title);
  html = replaceMetaByProperty(html, 'og:description', route.description);
  html = replaceMetaByProperty(html, 'og:url', absoluteUrl);
  html = replaceMetaByName(html, 'twitter:title', route.title);
  html = replaceMetaByName(html, 'twitter:description', route.description);
  html = injectIntoRoot(html, route.bodyHtml);
  return html;
}

async function generateRoute(template, siteUrl, route) {
  const html = transformTemplateForRoute(template, siteUrl, route);
  const outPath = resolve(DIST_DIR, route.outRelative);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, 'utf-8');
  console.log(`[prerender] wrote ${route.path} -> ${outPath}`);
}

async function main() {
  await ensureTemplateExists();
  const siteUrl = resolveSiteUrl();
  const template = await readFile(TEMPLATE, 'utf-8');
  for (const route of ROUTES) {
    await generateRoute(template, siteUrl, route);
  }
  console.log(`[prerender] done (siteUrl=${siteUrl}, routes=${ROUTES.length})`);
}

// CLI として直接実行された場合のみ main() を呼ぶ（vitest からの import 時は副作用なし）。
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
