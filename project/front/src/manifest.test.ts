// PBI-066 / TASK-303 / TASK-304 / TASK-305
// manifest.webmanifest と index.html のファビコン/manifest リンクを検証する。
// dist へのビルドに依存せず、ソース（public/, index.html）を直接読み込んで検証する。
// BASE_URL（GitHub Pages サブパス）の解決は Vite が build 時に書き換えるため、
// ソース上で `href="/..."` の絶対パス記法であることを確認する（PBI-059 規律）。

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = resolve(FRONT_DIR, 'public');
const INDEX_HTML = resolve(FRONT_DIR, 'index.html');
const MANIFEST = resolve(PUBLIC_DIR, 'manifest.webmanifest');

describe('PBI-066 PWA manifest スキーマ', () => {
  const raw = readFileSync(MANIFEST, 'utf-8');
  const m = JSON.parse(raw) as Record<string, unknown>;

  it('必須項目（name/short_name/start_url/scope/display/theme_color/background_color/icons）を持つ', () => {
    expect(m.name).toBe('インバスケット学習アプリ');
    expect(m.short_name).toBe('インバスケット');
    expect(typeof m.start_url).toBe('string');
    expect(typeof m.scope).toBe('string');
    expect(m.display).toBe('standalone');
    expect(m.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(m.background_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(Array.isArray(m.icons)).toBe(true);
  });

  it('start_url / scope は相対参照（BASE_URL 配下に解決される）', () => {
    // 絶対 URL（http(s)://）や絶対パス（先頭 /）は GitHub Pages サブパス公開で
    // 不整合になるため、相対 (./) を必須とする（PBI-059 規律）。
    expect(m.start_url).toMatch(/^\.\//);
    expect(m.scope).toMatch(/^\.\//);
  });

  it('icons に 192/512 PNG（any）と maskable と SVG を含む', () => {
    const icons = m.icons as Array<{ src: string; sizes: string; type: string; purpose?: string }>;
    const has = (pred: (i: (typeof icons)[number]) => boolean) => icons.some(pred);
    expect(has((i) => i.type === 'image/svg+xml')).toBe(true);
    expect(has((i) => i.sizes === '192x192' && i.type === 'image/png')).toBe(true);
    expect(
      has((i) => i.sizes === '512x512' && i.type === 'image/png' && (i.purpose ?? 'any') === 'any'),
    ).toBe(true);
    expect(has((i) => i.purpose === 'maskable')).toBe(true);
  });

  it('icons の src は相対参照のみ（BASE_URL 配下解決）', () => {
    const icons = m.icons as Array<{ src: string }>;
    for (const i of icons) {
      expect(i.src).not.toMatch(/^https?:/);
      expect(i.src).not.toMatch(/^\//);
    }
  });
});

describe('PBI-066 public/ アイコンファイル群が配置されている', () => {
  const required = [
    'icon.svg',
    'favicon.ico',
    'favicon-16.png',
    'favicon-32.png',
    'favicon-48.png',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'icon-maskable-512.png',
    'manifest.webmanifest',
  ];

  it.each(required)('%s が public/ 配下に存在し非空である', (name) => {
    const p = resolve(PUBLIC_DIR, name);
    expect(existsSync(p), `${name} が見つかりません`).toBe(true);
    expect(statSync(p).size, `${name} が空ファイルです`).toBeGreaterThan(0);
  });

  it('favicon.ico は ICO シグネチャ (00 00 01 00) で始まる', () => {
    const buf = readFileSync(resolve(PUBLIC_DIR, 'favicon.ico'));
    expect(buf[0]).toBe(0);
    expect(buf[1]).toBe(0);
    expect(buf[2]).toBe(1);
    expect(buf[3]).toBe(0);
  });

  it('PNG はすべて PNG シグネチャで始まる', () => {
    const pngs = [
      'favicon-16.png',
      'favicon-32.png',
      'favicon-48.png',
      'apple-touch-icon.png',
      'icon-192.png',
      'icon-512.png',
      'icon-maskable-512.png',
    ];
    for (const f of pngs) {
      const b = readFileSync(resolve(PUBLIC_DIR, f));
      expect([b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7]]).toEqual([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
    }
  });
});

describe('PBI-066 index.html のアイコン/manifest リンク', () => {
  const html = readFileSync(INDEX_HTML, 'utf-8');

  it('html lang="ja" を維持する', () => {
    expect(html).toMatch(/<html\s+lang="ja"/);
  });

  it('SVG ファビコンを link rel="icon" type="image/svg+xml" で参照する', () => {
    expect(html).toMatch(/<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\/icon\.svg"\s*\/?>/);
  });

  it('favicon.ico を link rel="icon" で参照する', () => {
    expect(html).toMatch(/<link\s+rel="icon"[^>]*href="\/favicon\.ico"/);
  });

  it('apple-touch-icon (180px) を参照する', () => {
    expect(html).toMatch(
      /<link\s+rel="apple-touch-icon"\s+sizes="180x180"\s+href="\/apple-touch-icon\.png"/,
    );
  });

  it('manifest を link rel="manifest" で参照する', () => {
    expect(html).toMatch(/<link\s+rel="manifest"\s+href="\/manifest\.webmanifest"/);
  });

  it('theme-color を light / dark の prefers-color-scheme で 2 件設定する', () => {
    expect(html).toMatch(/<meta\s+name="theme-color"[^>]*media="\(prefers-color-scheme: light\)"/);
    expect(html).toMatch(/<meta\s+name="theme-color"[^>]*media="\(prefers-color-scheme: dark\)"/);
  });

  it('href は全て絶対パス（先頭 /）で記述され、Vite ビルド時に BASE_URL 解決される（PBI-059 規律）', () => {
    // 検証対象: アイコン/manifest 関連の href のみ
    const refs = [
      '/icon.svg',
      '/favicon.ico',
      '/favicon-16.png',
      '/favicon-32.png',
      '/apple-touch-icon.png',
      '/manifest.webmanifest',
    ];
    for (const r of refs) {
      expect(html).toContain(`href="${r}"`);
    }
  });

  it('http(s):// 直書きの href を含まない（CDN/外部参照を持たない）', () => {
    // theme-color / link href の中に外部 URL がないこと（dangerouslySetInnerHTML 不使用と整合・DoD §10-2）
    const linkLines = html.split('\n').filter((l) => /<link\s/.test(l));
    for (const line of linkLines) {
      expect(line).not.toMatch(/href="https?:\/\//);
    }
  });
});
