import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Router } from './Router';
import { PUBLIC_ROUTE_PATHS } from './routes';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('PBI-072 ルート別SEOメタ同期', () => {
  let container: HTMLDivElement;
  let root: Root;
  const initialHash = window.location.hash;
  const initialTitle = document.title;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.location.hash = '';
    window.history.replaceState(null, '', '/');
    document.querySelector('meta[name="robots"]')?.remove();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.location.hash = initialHash;
    window.history.replaceState(null, '', '/');
    document.title = initialTitle;
    document.querySelector('meta[name="robots"]')?.remove();
  });

  it('ホームではアプリ標準タイトルを設定する', () => {
    act(() => {
      root.render(<Router />);
    });

    expect(document.title).toBe('インバスケット - 学習アプリ');
  });

  it('解説リファレンスではルート固有タイトルを設定する', () => {
    window.history.replaceState(null, '', '/reference');

    act(() => {
      root.render(<Router />);
    });

    expect(document.title).toContain('解説リファレンス');
    expect(document.title).toContain('インバスケット - 学習アプリ');
  });

  it('パターン詳細では重複しないタイトルを設定する', () => {
    window.history.replaceState(null, '', '/patterns/1');

    act(() => {
      root.render(<Router />);
    });

    expect(document.title).toContain('パターン1');
    expect(document.title).toContain('インバスケット - 学習アプリ');
  });
});

/**
 * PBI-078 / TASK-078-2 / 078-3 / 078-4: メタ重複網羅レビューと自動テスト拡張。
 *
 * - 全公開ルート（PUBLIC_ROUTE_PATHS）を反復走査し title/description の一意性を Set で検証する（重複 0 件）。
 * - canonical（`<link rel="canonical">`）が origin + 自ルート pathname の絶対 URL であることを検証する。
 * - 全公開ルートで applySEO がデフォルト分岐に落ちず、ルート固有のメタ（noindex 無し）が
 *   付与されることを確認する（fail-on-missing：新規ルート追加時に case 漏れを検知）。
 */
describe('PBI-078 公開ルートのメタ重複網羅', () => {
  let container: HTMLDivElement;
  let root: Root;
  const initialTitle = document.title;

  /** index.html 由来の `<meta name="description">` を jsdom 環境向けに用意する。 */
  function ensureDescriptionMeta(): void {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', '');
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.history.replaceState(null, '', '/');
    document.querySelector('meta[name="robots"]')?.remove();
    ensureDescriptionMeta();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.history.replaceState(null, '', '/');
    document.title = initialTitle;
    document.querySelector('meta[name="robots"]')?.remove();
  });

  /**
   * 1 ルートを Router にマウントし、現時点の SEO メタ（title/description/canonical/robots）を採取する。
   * テスト間で独立させるため、毎回 root を破棄→再生成する。
   */
  function captureRouteSeo(path: string): {
    title: string;
    description: string;
    canonical: string;
    noindex: boolean;
  } {
    window.history.replaceState(null, '', path);

    act(() => {
      root.render(<Router />);
    });

    const title = document.title;
    const description =
      document
        .querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.getAttribute('content') ?? '';
    const canonical =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.getAttribute('href') ?? '';
    const robots =
      document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.getAttribute('content') ?? '';

    act(() => {
      root.unmount();
    });
    root = createRoot(container);

    return {
      title,
      description,
      canonical,
      noindex: robots.includes('noindex'),
    };
  }

  it('TASK-078-2: 全公開ルートで title が一意（重複 0 件）である', () => {
    const titles = PUBLIC_ROUTE_PATHS.map((path) => captureRouteSeo(path).title);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  it('TASK-078-2: 全公開ルートで description が一意（重複 0 件）である', () => {
    const descriptions = PUBLIC_ROUTE_PATHS.map((path) => captureRouteSeo(path).description);
    const unique = new Set(descriptions);
    expect(unique.size).toBe(descriptions.length);
  });

  it('TASK-078-3: 全公開ルートの canonical が origin + 自ルート pathname の絶対 URL である', () => {
    for (const path of PUBLIC_ROUTE_PATHS) {
      const { canonical } = captureRouteSeo(path);
      const expected = `${window.location.origin}${path}`;
      expect(canonical, `canonical mismatch for ${path}`).toBe(expected);
      // 絶対 URL 形式（http(s)://...）であること・`__SITE_URL__` トークン未置換が残っていないこと。
      expect(canonical).toMatch(/^https?:\/\//);
      expect(canonical).not.toContain('__SITE_URL__');
    }
  });

  it('TASK-078-4: 公開ルートには noindex が付与されない（noindex は not-found 限定）', () => {
    for (const path of PUBLIC_ROUTE_PATHS) {
      const { noindex } = captureRouteSeo(path);
      expect(noindex, `公開ルート ${path} に noindex が付与されている`).toBe(false);
    }
  });

  it('TASK-078-4: 不存在ルート（/no-such-route）では noindex が付与される', () => {
    const { noindex, title } = captureRouteSeo('/no-such-route');
    expect(noindex).toBe(true);
    expect(title).toContain('ページが見つかりません');
  });

  it('TASK-078-4: 全公開ルートで title がアプリ既定単独文字列に落ちない（resolveRouteSeo 未定義検知）', () => {
    // ルート `/` のみは APP_NAME 単独タイトルが正規。それ以外は ` | インバスケット - 学習アプリ` で連結される。
    for (const path of PUBLIC_ROUTE_PATHS) {
      const { title } = captureRouteSeo(path);
      if (path === '/') {
        expect(title).toBe('インバスケット - 学習アプリ');
      } else {
        // 他ルートは必ず ` | <APP_NAME>` 連結形（resolveRouteSeo の case 漏れ＝default 分岐に落ちると
        // APP_NAME 単独になり、ホームと衝突する）。
        expect(title, `${path} のタイトルが既定値に落ちている`).toMatch(
          / \| インバスケット - 学習アプリ$/,
        );
        expect(title).not.toBe('インバスケット - 学習アプリ');
      }
    }
  });
});
