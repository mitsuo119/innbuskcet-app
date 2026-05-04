#!/usr/bin/env node
// PBI-068 / TASK-502・503・504
// `public/` から `dist/` へコピーされる静的アセット（robots.txt / sitemap.xml / 404.html）の
// `__SITE_URL__` プレースホルダを GitHub Pages 公開 URL に置換する後処理スクリプト。
// Vite の `transformIndexHtml` は public/ 配下の静的ファイルに適用されないため、
// `pnpm build` 末尾でこのスクリプトを実行する（PBI-058 規律：env 依存値はビルド時注入）。
//
// `src/seo.ts` の `resolveSiteUrl` / `replaceSeoTokens` と同等の動作を最小実装で再現する
// （vite.config.ts と src を経由せず Node 単体で実行可能にするため）。
import { readFile, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL_TOKEN = '__SITE_URL__';

function resolveSiteUrl(envSiteUrl, base) {
  const raw = (envSiteUrl ?? '').trim();
  if (raw) return raw.endsWith('/') ? raw : `${raw}/`;
  const withLeading = base.startsWith('/') ? base : `/${base}`;
  const withTrailing = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  return `http://localhost:5173${withTrailing}`;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const base = process.env.VITE_BASE_URL ?? '/';
const siteUrl = resolveSiteUrl(process.env.VITE_SITE_URL, base);
const targets = ['robots.txt', 'sitemap.xml', '404.html'];

for (const name of targets) {
  const filePath = resolve(distDir, name);
  try {
    await access(filePath, constants.R_OK);
  } catch {
    console.warn(`[transform-seo-tokens] ${filePath} が存在しないためスキップ`);
    continue;
  }
  const original = await readFile(filePath, 'utf-8');
  const replaced = original.split(SITE_URL_TOKEN).join(siteUrl);
  if (original !== replaced) {
    await writeFile(filePath, replaced);
    console.log(`[transform-seo-tokens] replaced __SITE_URL__ in ${name} -> ${siteUrl}`);
  } else {
    console.log(`[transform-seo-tokens] no token in ${name} (skipped)`);
  }
}
