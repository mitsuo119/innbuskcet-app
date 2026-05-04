import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { replaceSeoTokens, resolveSiteUrl } from './src/seo';

// `@types/node` を増やさず最小宣言で `process.env` を参照する。
declare const process: { env: Record<string, string | undefined> };

// 本番（GitHub Pages）はサブパス配信のため `VITE_BASE_URL` で切替。
// 未指定時は開発・テスト用にルート `/` を使用する。
// 例: GitHub Actions で `VITE_BASE_URL=/ai-scrum-inbuscket/` を注入。
const base = process.env.VITE_BASE_URL ?? '/';

// PBI-067: index.html の SEO/OGP メタに埋め込む公開 URL を解決する（PBI-058 規律）。
// GitHub Actions では `VITE_SITE_URL=https://<owner>.github.io/<repo>/` を注入。
const siteUrl = resolveSiteUrl({ VITE_SITE_URL: process.env.VITE_SITE_URL }, base);

/**
 * 本番ビルド時のみ AdSense ローダースクリプトを <head> に注入する Vite プラグイン。
 * VITE_ADSENSE_CLIENT_ID が未設定（開発・テスト環境）の場合は何もしない。
 * PBI-052 / TASK-201
 */
function adsenseLoaderPlugin(clientId: string): Plugin {
  return {
    name: 'inject-adsense-loader',
    transformIndexHtml(html: string): string {
      const script =
        `    <script async` +
        ` src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}"` +
        ` crossorigin="anonymous"></script>\n`;
      return html.replace('</head>', `${script}  </head>`);
    },
  };
}

/**
 * index.html 中の `__SITE_URL__` を GitHub Pages 公開 URL に置換する Vite プラグイン。
 * canonical / og:url / og:image / twitter:image / JSON-LD 等で利用される（PBI-067 / TASK-404・PBI-068 / TASK-501）。
 *
 * 注: public/ 配下の robots.txt / sitemap.xml / 404.html は `transformIndexHtml` の対象外のため、
 * ビルド後の後処理スクリプト `scripts/transform-seo-tokens.mjs` で同じ siteUrl を用いて置換する
 * （PBI-058 規律：env 依存値はビルド時注入）。
 */
function seoMetaPlugin(resolvedSiteUrl: string): Plugin {
  return {
    name: 'replace-seo-site-url',
    transformIndexHtml(html: string): string {
      return replaceSeoTokens(html, resolvedSiteUrl);
    },
  };
}

const adsenseClientId = process.env.VITE_ADSENSE_CLIENT_ID;

export default defineConfig({
  base,
  plugins: [
    react(),
    seoMetaPlugin(siteUrl),
    // VITE_ADSENSE_CLIENT_ID が設定されている場合のみ（本番ビルド時）AdSense スクリプトを注入。
    // 開発・テスト時は注入しないことで不要なネットワーク接続と追跡を防ぐ。
    ...(adsenseClientId ? [adsenseLoaderPlugin(adsenseClientId)] : []),
  ],
  server: {
    host: true, // LAN 内の全インターフェースで Listen（スマホからアクセス可）
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
