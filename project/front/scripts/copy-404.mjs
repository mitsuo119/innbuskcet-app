#!/usr/bin/env node
// SPA 404 フォールバック: GitHub Pages はディレクトリ未一致を 404.html で返すため、
// `dist/index.html` を `dist/404.html` にコピーしてクライアントルーティングを成立させる。
import { copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const src = resolve(distDir, 'index.html');
const dst = resolve(distDir, '404.html');

try {
  await access(src, constants.R_OK);
} catch {
  console.error(`[copy-404] ${src} が存在しません。先に vite build を実行してください。`);
  process.exit(1);
}

await copyFile(src, dst);
console.log(`[copy-404] ${src} -> ${dst}`);
