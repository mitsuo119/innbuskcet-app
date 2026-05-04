import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

// `@types/node` を増やさず最小宣言で `process.env` を参照する。
declare const process: { env: Record<string, string | undefined> };

// 本番（GitHub Pages）はサブパス配信のため `VITE_BASE_URL` で切替。
// 未指定時は開発・テスト用にルート `/` を使用する。
// 例: GitHub Actions で `VITE_BASE_URL=/ai-scrum-inbuscket/` を注入。
const base = process.env.VITE_BASE_URL ?? '/';

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

const adsenseClientId = process.env.VITE_ADSENSE_CLIENT_ID;

export default defineConfig({
  base,
  plugins: [
    react(),
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
