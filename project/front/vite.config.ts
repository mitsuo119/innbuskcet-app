import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `@types/node` を増やさず最小宣言で `process.env` を参照する。
declare const process: { env: Record<string, string | undefined> };

// 本番（GitHub Pages）はサブパス配信のため `VITE_BASE_URL` で切替。
// 未指定時は開発・テスト用にルート `/` を使用する。
// 例: GitHub Actions で `VITE_BASE_URL=/ai-scrum-inbuscket/` を注入。
const base = process.env.VITE_BASE_URL ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true, // LAN 内の全インターフェースで Listen（スマホからアクセス可）
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
