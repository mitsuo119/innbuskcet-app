// PBI-067 / TASK-404
// SEO メタ（canonical / og:url / og:image / twitter:image）に埋め込むサイト URL を、
// `import.meta.env` 直参照に頼らず props/定数注入で扱うためのユーティリティ（PBI-058 規律）。
//
// index.html 中の `__SITE_URL__` プレースホルダを Vite ビルド時に置換する。
// GitHub Actions では `VITE_SITE_URL` を `https://<owner>.github.io/<repo>/` 形式で注入する。
// 未設定時（`pnpm dev` / vitest）は `http://localhost:5173` + base へフォールバック。

/** index.html 中で SEO メタの URL に使う置換トークン。 */
export const SITE_URL_TOKEN = '__SITE_URL__';

/**
 * GitHub Pages 公開 URL（末尾 `/` 付き）を解決する。
 *
 * - `VITE_SITE_URL` が指定されている場合はそれを正規化（末尾 `/` 付与）して返す。
 * - 未設定時は `http://localhost:5173` + base のフォールバックを返す。
 *
 * @param env  `process.env` 互換の環境変数オブジェクト（テストではモック注入）。
 * @param base Vite の `base` 設定（先頭 `/` 必須・末尾 `/` 推奨）。
 */
export function resolveSiteUrl(env: { VITE_SITE_URL?: string | undefined }, base: string): string {
  const raw = env.VITE_SITE_URL?.trim();
  if (raw) {
    return raw.endsWith('/') ? raw : `${raw}/`;
  }
  const withLeading = base.startsWith('/') ? base : `/${base}`;
  const withTrailing = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  return `http://localhost:5173${withTrailing}`;
}

/** HTML 文字列内の {@link SITE_URL_TOKEN} を実 URL に置換する（Vite プラグインから呼び出す）。 */
export function replaceSeoTokens(html: string, siteUrl: string): string {
  return html.split(SITE_URL_TOKEN).join(siteUrl);
}
