#!/usr/bin/env node
/**
 * Sprint027 PBI-104 / TASK-104-1,2,3
 *
 * 本番同等での実機アウトカム検証スクリプト。Sprint026 retro A-121/A-120 の具体化実装。
 *
 * 目的:
 *  - DoD §4-3 (Sprint027 で 21→22 項目に拡張) を機械検証する。
 *  - 「自動テストは緑だが本番 Googlebot 視点でコンテンツ無効」を再発させない。
 *
 * チェック内容（各代表ルートに対して、末尾スラッシュ付きで実施）:
 *  (a) サーバが返す HTML に、本文ラッパ（[data-prerender]）または <main> 上に
 *      `hidden` 属性 / `aria-hidden="true"` が付与されていないこと（クローキング防止）。
 *  (b) サーバ HTML プリレンダ本文文字数が下限（既定 600 字、シェルページは 100 字）を満たすこと。
 *  (c) Playwright (chromium) でアクセスし JS 実行後の最終 DOM の <h1> が
 *      「ページが見つかりません」を含まないこと、かつ NotFound 痕跡がないこと（Soft 404 防止）。
 *
 * 既存 `scripts/measure-prerender-content.mjs` (PBI-098, dist 直読) との関係:
 *  - measure-prerender-content.mjs は dist/ ローカルファイルの本文文字数のみを計測する単機能。
 *  - 本スクリプトは「稼働中サーバ（preview / prod）に対する HTTP 経由」+「JS 実行後 DOM 検証」を
 *    追加で行うアウトカム検証であり、役割は補完関係（重複しない）。
 *
 * 使い方:
 *   node scripts/check-routes-outcome.mjs --target=preview
 *   node scripts/check-routes-outcome.mjs --target=prod
 *   pnpm run check:outcome -- --target=preview
 *
 * --target=preview: ローカル `vite preview`（既定 http://localhost:4173）を対象とする。
 *                   呼出側で事前に `pnpm build && pnpm preview --port 4173` を起動しておくこと。
 * --target=prod   : 本番 https://inbasket-app.com を対象とする。
 *
 * 終了コード:
 *   0 = 全ルート全項目 PASS
 *   1 = いずれかの項目で FAIL
 *
 * 依存: playwright（Sprint027 PBI-104 で devDep 追加 / 渡辺セキュリティレビュー要）。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONT_DIR = resolve(__dirname, '..');
const ROUTES_TS = resolve(FRONT_DIR, 'src', 'routes.ts');
const REPORT_PATH = resolve(
  FRONT_DIR,
  '..',
  '..',
  'project',
  'docs',
  'outcome_verification_report.md',
);

// ===== 引数パース =====
const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : defaultValue;
}
const TARGET = getArg('target', 'preview');
const TARGETS = {
  preview: { baseUrl: getArg('preview-url', 'http://localhost:4173'), label: 'preview' },
  prod: { baseUrl: getArg('prod-url', 'https://inbasket-app.com'), label: 'prod' },
};
if (!TARGETS[TARGET]) {
  console.error(`[check-routes-outcome] unknown --target=${TARGET} (expected preview|prod)`);
  process.exit(2);
}
const BASE_URL = TARGETS[TARGET].baseUrl.replace(/\/+$/, '');

// ===== 設定 =====
/** 本文文字数下限（DoD §4-3）。 */
const CONTENT_MIN_CHARS = 600;
/** 本文を持たないシェル/一覧ページの下限（緩め）。 */
const SHELL_MIN_CHARS = 100;
/** シェル/一覧扱いとするパス（本文 600 字を強制しない）。 */
const SHELL_PATHS = new Set([
  '/',
  '/about',
  '/patterns',
  '/reference',
  '/cases',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/terms-of-service',
]);

// ===== routes.ts から PUBLIC_ROUTES を抽出 =====
async function loadRoutes() {
  const src = await readFile(ROUTES_TS, 'utf-8');
  const blockMatch = src.match(/export const PUBLIC_ROUTES[^=]*=\s*\[([\s\S]*?)\]\s*as const;/);
  if (!blockMatch) throw new Error('PUBLIC_ROUTES の抽出に失敗');
  const re = /path:\s*'([^']+)'/g;
  const paths = [];
  let m;
  while ((m = re.exec(blockMatch[1])) !== null) paths.push(m[1]);
  if (paths.length === 0) throw new Error('PUBLIC_ROUTES が空');
  return paths;
}

// ===== 末尾スラッシュ付与（root 除外） =====
function toTrailing(path) {
  if (path === '/' || path === '') return '/';
  return path.endsWith('/') ? path : path + '/';
}

// ===== 静的 HTML チェック (a) (b) =====
function checkServerHtml(html, path) {
  const issues = [];

  // (a) クローキング検出: data-prerender ラッパまたは <main> 開始タグに hidden / aria-hidden=true が付いていないか
  const wrapperMatch = html.match(/<(?:div|main)[^>]*data-prerender="[^"]*"[^>]*>/i);
  const mainMatch = html.match(/<main[^>]*>/i);
  for (const tag of [wrapperMatch?.[0], mainMatch?.[0]].filter(Boolean)) {
    if (/\shidden(?:\s|=|>)/i.test(tag)) issues.push(`hidden 属性検出: ${tag.slice(0, 120)}`);
    if (/aria-hidden\s*=\s*"true"/i.test(tag))
      issues.push(`aria-hidden="true" 検出: ${tag.slice(0, 120)}`);
  }

  // (b) 本文文字数下限
  // `<div data-prerender="...">...</div></div>` の内側、無ければ <main>...</main> 内
  let inner = '';
  const dpInner = html.match(/<div\s+data-prerender="[^"]+"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
  if (dpInner) {
    inner = dpInner[1];
  } else {
    const mainInner = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    inner = mainInner ? mainInner[1] : '';
  }
  const textLen = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, '').length;
  const min = SHELL_PATHS.has(path) ? SHELL_MIN_CHARS : CONTENT_MIN_CHARS;
  const meetsLen = textLen >= min;
  if (!meetsLen) issues.push(`本文文字数不足: ${textLen} < ${min}`);

  // プリレンダ <h1> が "ページが見つかりません" でないこと（サーバ HTML 段階でのソフト 404 検出）
  // Sprint027 DAY4 改善: `index.html` の <noscript> 内には常に
  // 「JavaScript を有効にしてください」という <h1> が含まれており、文書全体を
  // 対象に正規表現マッチすると noscript フォールバックの h1 を誤検知する。
  // そのためプリレンダ実コンテンツ領域（[data-prerender] 配下、無ければ <main> 内）に
  // 限定して <h1> を抽出する。inner が空のときのみ全体フォールバックを残す
  // （NotFound プリレンダ等、ラッパが無いケースのソフト 404 検出のため）。
  const h1Source = inner || html;
  const h1Match = h1Source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
  if (h1Text.includes('ページが見つかりません')) {
    issues.push(`サーバ HTML の <h1> が NotFound: "${h1Text}"`);
  }

  return { textLen, h1Text, issues };
}

// ===== JS 実行後 DOM チェック (c) =====
async function checkJsAfterDom(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  // hydration 安定のため少しだけ待つ（重い fetch がある場合の保険）。
  await page.waitForTimeout(150);
  // page.evaluate のコールバックはブラウザ実行コンテキストで評価される（Node 環境ではない）。
  /* eslint-disable no-undef */
  const result = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const h1Text = h1 ? (h1.textContent || '').trim() : '';
    const bodyText = (document.body.textContent || '').trim();
    return {
      h1Text,
      hasNotFoundH1: h1Text.includes('ページが見つかりません'),
      hasNotFoundInBody: bodyText.includes('ページが見つかりません'),
      title: document.title,
    };
  });
  /* eslint-enable no-undef */
  const issues = [];
  if (result.hasNotFoundH1) issues.push(`JS 実行後 <h1> が NotFound: "${result.h1Text}"`);
  if (result.hasNotFoundInBody && !result.hasNotFoundH1)
    issues.push(`JS 実行後 body に NotFound 痕跡: title="${result.title}"`);
  return { ...result, issues };
}

// ===== メイン =====
async function main() {
  const paths = await loadRoutes();
  console.log(
    `[check-routes-outcome] target=${TARGET} baseUrl=${BASE_URL} routes=${paths.length}`,
  );

  const browser = await chromium.launch();
  const context = await browser.newContext({ userAgent: 'inbusket-outcome-check/1.0' });
  const page = await context.newPage();

  const rows = [];
  for (const p of paths) {
    const trailing = toTrailing(p);
    const url = BASE_URL + trailing;
    let serverIssues = [];
    let textLen = 0;
    let serverH1 = '';
    let jsIssues = [];
    let jsH1 = '';
    let httpStatus = 0;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'inbusket-outcome-check/1.0' } });
      httpStatus = res.status;
      const html = await res.text();
      const serverCheck = checkServerHtml(html, p);
      serverIssues = serverCheck.issues;
      textLen = serverCheck.textLen;
      serverH1 = serverCheck.h1Text;
    } catch (e) {
      serverIssues.push(`HTTP 取得失敗: ${e.message}`);
    }
    try {
      const jsCheck = await checkJsAfterDom(page, url);
      jsIssues = jsCheck.issues;
      jsH1 = jsCheck.h1Text;
    } catch (e) {
      jsIssues.push(`Playwright 実行失敗: ${e.message}`);
    }

    const allIssues = [...serverIssues, ...jsIssues];
    const pass = httpStatus === 200 && allIssues.length === 0;
    rows.push({
      path: trailing,
      httpStatus,
      textLen,
      serverH1: serverH1.slice(0, 60),
      jsH1: jsH1.slice(0, 60),
      pass,
      issues: allIssues,
    });
    const mark = pass ? 'PASS' : 'FAIL';
    process.stdout.write(
      `  [${mark}] ${trailing.padEnd(28)} http=${httpStatus} text=${String(textLen).padStart(5)} h1="${jsH1.slice(0, 30)}"${allIssues.length ? ' :: ' + allIssues.join(' | ') : ''}\n`,
    );
  }

  await browser.close();

  // ===== レポート出力 =====
  const passCount = rows.filter((r) => r.pass).length;
  const failCount = rows.length - passCount;
  const now = new Date().toISOString();
  const lines = [];
  lines.push(`# アウトカム検証レポート（PBI-104）`);
  lines.push('');
  lines.push(`- 計測日時: ${now}`);
  lines.push(`- 対象: ${TARGET} (\`${BASE_URL}\`)`);
  lines.push(`- ルート数: ${rows.length} / **PASS: ${passCount} / FAIL: ${failCount}**`);
  lines.push(
    `- 検証項目: (a) サーバ HTML に hidden/aria-hidden なし / (b) 本文 ${CONTENT_MIN_CHARS} 字以上（シェル ${SHELL_MIN_CHARS} 字以上）/ (c) JS 実行後 <h1> が NotFound でない`,
  );
  lines.push('');
  lines.push('## 全件結果');
  lines.push('');
  lines.push('| # | ルート | HTTP | 本文字数 | サーバh1 | JS後h1 | 判定 | 問題点 |');
  lines.push('| ---: | --- | ---: | ---: | --- | --- | :---: | --- |');
  rows.forEach((r, i) => {
    lines.push(
      `| ${i + 1} | \`${r.path}\` | ${r.httpStatus} | ${r.textLen} | ${r.serverH1 || '-'} | ${r.jsH1 || '-'} | ${r.pass ? '✅' : '❌'} | ${r.issues.join(' / ') || '-'} |`,
    );
  });
  lines.push('');
  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, lines.join('\n'), 'utf-8');
  console.log(
    `\n[check-routes-outcome] PASS=${passCount} FAIL=${failCount} report=${REPORT_PATH}`,
  );

  process.exit(failCount === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
