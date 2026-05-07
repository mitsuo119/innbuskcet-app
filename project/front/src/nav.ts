/**
 * クライアントサイドナビゲーションユーティリティ（PBI-076 / TASK-076-1）
 *
 * Router.tsx を History API（pushState/popstate/window.location.pathname）ベースに
 * 移行するための共通ナビゲーション API を提供する。
 *
 * 設計方針:
 * - SPA は GitHub Pages サブパス配信前提（vite.config.ts の `base`／`import.meta.env.BASE_URL`）。
 *   そのため内部リンクの URL は必ず `withBase()` を経由して BASE_URL を前置する。
 * - レガシー `#/...` ハッシュリンクは Router 側で pathname に自動 replaceState することで
 *   外部ブックマーク互換を保つ（TASK-076-4 の土台）。本ファイルは新規コード向けの API のみ提供する。
 * - `dangerouslySetInnerHTML` 不使用・外部ライブラリ依存ゼロ（DoD §10-2 / §5）。
 */

// Vite が提供する `import.meta.env.BASE_URL` を型増強なしで参照する最小宣言。
// `vite/client` を `types` に追加せずに済ませることで tsconfig 影響を最小化する。
const RAW_BASE = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ??
  '/') as string;
/** 末尾スラッシュなしの base prefix（`/` の場合は空文字に正規化）。 */
const BASE_PREFIX = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

/** Router 内で発火させるカスタムイベント名（pushState 後の再描画トリガ）。 */
export const NAVIGATE_EVENT = 'inbusket:navigate';

/**
 * アプリ内パス（先頭 `/` 必須）を base prefix 付きの絶対 URL pathname に変換する。
 * - 例: `withBase('/reference')` → `/ai-scrum-inbuscket/reference`（GitHub Pages 配信時）
 * - 例: `withBase('/')` → `/ai-scrum-inbuscket/`
 */
export function withBase(path: string): string {
  if (!path.startsWith('/')) {
    return `${BASE_PREFIX}/${path}`;
  }
  if (path === '/') {
    return BASE_PREFIX === '' ? '/' : `${BASE_PREFIX}/`;
  }
  return `${BASE_PREFIX}${path}`;
}

/**
 * 現在の `window.location.pathname` から base prefix を取り除いた、
 * アプリ内パス（先頭 `/` 必須）を返す。
 */
export function stripBase(pathname: string): string {
  if (BASE_PREFIX === '') return pathname || '/';
  if (pathname === BASE_PREFIX || pathname === `${BASE_PREFIX}/`) return '/';
  if (pathname.startsWith(`${BASE_PREFIX}/`)) {
    return pathname.slice(BASE_PREFIX.length);
  }
  return pathname || '/';
}

/**
 * pushState で内部遷移する。
 * - `path` は `/reference` のような先頭スラッシュ付きアプリ内パス。
 * - 同一 URL 連打は副作用を抑止する。
 * - 完了後 `NAVIGATE_EVENT` を window へディスパッチし Router の再描画を促す。
 */
export function navigate(path: string): void {
  const target = withBase(path);
  const current = `${window.location.pathname}${window.location.search}`;
  if (target !== current) {
    window.history.pushState(null, '', target);
  }
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/**
 * 主要マウスボタン・修飾キーなしのクリックを判定する。
 * - 修飾キー併用や中央/右クリックはブラウザ既定挙動を尊重する（新規タブ/コピー等）。
 */
export function isPlainLeftClick(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  return true;
}
