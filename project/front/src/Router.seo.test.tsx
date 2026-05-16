import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Router } from './Router';
import { PUBLIC_ROUTE_PATHS, SITEMAP_CASE_IDS, SITEMAP_REFERENCE_CHAPTER_IDS } from './routes';

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

/**
 * PBI-079 / TASK-079-6（DAY3 着手分）: 代表ケース 20 件の単独 URL に注入される
 * BreadcrumbList JSON-LD の単体検証。
 *
 * - `<script type="application/ld+json" data-route-jsonld="case-detail">` が
 *   ケース詳細ルートで 1 タグだけ存在し、@context/@type/itemListElement(4 件) を持つ。
 * - 公開ルートのうちケース詳細以外（例: トップ・パターン一覧・解説リファレンス）では
 *   JSON-LD タグが残留しない（撤去される）。
 */
describe('PBI-079 ケース詳細 JSON-LD（BreadcrumbList）', () => {
  let container: HTMLDivElement;
  let root: Root;
  const initialTitle = document.title;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.history.replaceState(null, '', '/');
    document
      .querySelectorAll('script[type="application/ld+json"][data-route-jsonld]')
      .forEach((node) => node.remove());
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.history.replaceState(null, '', '/');
    document.title = initialTitle;
    document
      .querySelectorAll('script[type="application/ld+json"][data-route-jsonld]')
      .forEach((node) => node.remove());
  });

  it('TASK-079-6: 代表ケース 20 件すべてで BreadcrumbList JSON-LD が 1 件だけ注入される', () => {
    for (const id of SITEMAP_CASE_IDS) {
      window.history.replaceState(null, '', `/cases/${id}`);
      act(() => {
        root.render(<Router />);
      });

      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-route-jsonld="case-detail"]',
      );
      expect(scripts, `${id} で JSON-LD タグが 1 つではない`).toHaveLength(1);

      const json = JSON.parse(scripts[0]?.textContent ?? '{}') as {
        '@context'?: string;
        '@type'?: string;
        itemListElement?: unknown[];
      };
      expect(json['@context']).toBe('https://schema.org');
      expect(json['@type']).toBe('BreadcrumbList');
      expect(json.itemListElement).toHaveLength(4);

      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });

  it('TASK-079-6: ケース詳細以外のルートでは JSON-LD タグが残留しない', () => {
    // 先にケース詳細をマウントして JSON-LD を注入。
    window.history.replaceState(null, '', '/cases/case-001');
    act(() => {
      root.render(<Router />);
    });
    expect(
      document.querySelector('script[type="application/ld+json"][data-route-jsonld="case-detail"]'),
    ).not.toBeNull();

    act(() => {
      root.unmount();
    });
    root = createRoot(container);

    // 続けて非ケース詳細ルートに遷移すると JSON-LD は撤去される。
    for (const path of ['/', '/patterns', '/reference', '/reference/chapter01']) {
      window.history.replaceState(null, '', path);
      act(() => {
        root.render(<Router />);
      });
      expect(
        document.querySelector(
          'script[type="application/ld+json"][data-route-jsonld="case-detail"]',
        ),
        `${path} で JSON-LD タグが残留している`,
      ).toBeNull();
      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });
});

/**
 * PBI-080 / TASK-080-5（DAY5）: 解説リファレンス全 12 章ページに注入される
 * BreadcrumbList JSON-LD の単体検証。
 *
 * - 各 `/reference/chapterXX` で `<script data-route-jsonld="reference-chapter">` が
 *   1 タグだけ存在し、@type=BreadcrumbList・itemListElement(3 件) を持つ。
 * - ルート切替時にケース詳細との routeKey が混在しない（残留しない）。
 */
describe('PBI-080 解説リファレンス章 JSON-LD（BreadcrumbList）', () => {
  let container: HTMLDivElement;
  let root: Root;
  const initialTitle = document.title;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.history.replaceState(null, '', '/');
    document
      .querySelectorAll('script[type="application/ld+json"][data-route-jsonld]')
      .forEach((node) => node.remove());
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.history.replaceState(null, '', '/');
    document.title = initialTitle;
    document
      .querySelectorAll('script[type="application/ld+json"][data-route-jsonld]')
      .forEach((node) => node.remove());
  });

  it('TASK-080-5: 全 12 章で BreadcrumbList JSON-LD が 1 件だけ注入される', () => {
    for (const id of SITEMAP_REFERENCE_CHAPTER_IDS) {
      window.history.replaceState(null, '', `/reference/${id}`);
      act(() => {
        root.render(<Router />);
      });

      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-route-jsonld="reference-chapter"]',
      );
      expect(scripts, `${id} で JSON-LD タグが 1 つではない`).toHaveLength(1);

      const json = JSON.parse(scripts[0]?.textContent ?? '{}') as {
        '@context'?: string;
        '@type'?: string;
        itemListElement?: unknown[];
      };
      expect(json['@context']).toBe('https://schema.org');
      expect(json['@type']).toBe('BreadcrumbList');
      expect(json.itemListElement).toHaveLength(3);

      // ケース詳細用 JSON-LD が同時に残留していないこと（routeKey 切替の独立性）。
      expect(
        document.querySelector(
          'script[type="application/ld+json"][data-route-jsonld="case-detail"]',
        ),
        `${id} で case-detail JSON-LD が残留している`,
      ).toBeNull();

      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });

  it('TASK-080-5: 全 12 章で title が一意・description に章タイトルが含まれる', () => {
    const titles = new Set<string>();
    for (const id of SITEMAP_REFERENCE_CHAPTER_IDS) {
      window.history.replaceState(null, '', `/reference/${id}`);
      act(() => {
        root.render(<Router />);
      });
      titles.add(document.title);
      const description =
        document
          .querySelector<HTMLMetaElement>('meta[name="description"]')
          ?.getAttribute('content') ?? '';
      expect(description, `${id} の description が空`).not.toBe('');
      expect(document.title, `${id} の title が既定値に落ちている`).toContain('解説リファレンス：');
      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
    expect(titles.size).toBe(SITEMAP_REFERENCE_CHAPTER_IDS.length);
  });
});


/**
 * PBI-091 / TASK-091-1（Sprint025 DAY5）: パンくず BreadcrumbList JSON-LD 拡張
 * - パターン詳細（/patterns/:id）に BreadcrumbList JSON-LD（itemListElement 3 件）が注入される
 * - 3 系統（reference-chapter / case-detail / pattern-detail）の routeKey 切替時に残留しない
 * - パターン詳細以外のルートでは pattern-detail JSON-LD が撤去される
 */
describe('PBI-091 パターン詳細 JSON-LD（BreadcrumbList）', () => {
  let container: HTMLDivElement;
  let root: Root;
  const initialTitle = document.title;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.history.replaceState(null, '', '/');
    document
      .querySelectorAll('script[type="application/ld+json"][data-route-jsonld]')
      .forEach((node) => node.remove());
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.history.replaceState(null, '', '/');
    document.title = initialTitle;
    document
      .querySelectorAll('script[type="application/ld+json"][data-route-jsonld]')
      .forEach((node) => node.remove());
  });

  it('TASK-091-1: 代表 3 パターン（1/10/20）で BreadcrumbList JSON-LD が 1 件だけ注入される', () => {
    for (const id of [1, 10, 20]) {
      window.history.replaceState(null, '', `/patterns/${id}`);
      act(() => {
        root.render(<Router />);
      });

      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-route-jsonld="pattern-detail"]',
      );
      expect(scripts, `/patterns/${id} で JSON-LD タグが 1 つではない`).toHaveLength(1);

      const json = JSON.parse(scripts[0]?.textContent ?? '{}') as {
        '@context'?: string;
        '@type'?: string;
        itemListElement?: unknown[];
      };
      expect(json['@context']).toBe('https://schema.org');
      expect(json['@type']).toBe('BreadcrumbList');
      expect(json.itemListElement).toHaveLength(3);

      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });

  it('TASK-091-1: パターン詳細以外のルートでは pattern-detail JSON-LD が残留しない', () => {
    window.history.replaceState(null, '', '/patterns/1');
    act(() => {
      root.render(<Router />);
    });
    expect(
      document.querySelector(
        'script[type="application/ld+json"][data-route-jsonld="pattern-detail"]',
      ),
    ).not.toBeNull();

    act(() => {
      root.unmount();
    });
    root = createRoot(container);

    for (const path of ['/', '/patterns', '/reference/chapter01', '/cases/case-001']) {
      window.history.replaceState(null, '', path);
      act(() => {
        root.render(<Router />);
      });
      expect(
        document.querySelector(
          'script[type="application/ld+json"][data-route-jsonld="pattern-detail"]',
        ),
        `${path} で pattern-detail JSON-LD が残留している`,
      ).toBeNull();
      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });

  it('TASK-091-1: 3 系統ルートで視覚パンくず（nav[aria-label="パンくず"]）が表示される', () => {
    for (const path of ['/patterns/1', '/cases/case-001', '/reference/chapter01']) {
      window.history.replaceState(null, '', path);
      act(() => {
        root.render(<Router />);
      });
      const nav = container.querySelector('nav[aria-label="パンくず"]');
      expect(nav, `${path} で視覚パンくず nav が存在しない`).not.toBeNull();
      // 現在地は aria-current="page" の span として表示される（リンク化されない）。
      const current = nav?.querySelector('[aria-current="page"]');
      expect(current, `${path} で現在地（aria-current="page"）が存在しない`).not.toBeNull();
      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });
});


/**
 * PBI-091 / TASK-091-1（Sprint025 DAY5）: パンくず BreadcrumbList JSON-LD 拡張
 * - パターン詳細（/patterns/:id）に BreadcrumbList JSON-LD（itemListElement 3 件）が注入される
 * - 3 系統（reference-chapter / case-detail / pattern-detail）の routeKey 切替時に残留しない
 * - パターン詳細以外のルートでは pattern-detail JSON-LD が撤去される
 */
describe('PBI-091 パターン詳細 JSON-LD（BreadcrumbList）', () => {
  let container: HTMLDivElement;
  let root: Root;
  const initialTitle = document.title;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.history.replaceState(null, '', '/');
    document
      .querySelectorAll('script[type="application/ld+json"][data-route-jsonld]')
      .forEach((node) => node.remove());
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.history.replaceState(null, '', '/');
    document.title = initialTitle;
    document
      .querySelectorAll('script[type="application/ld+json"][data-route-jsonld]')
      .forEach((node) => node.remove());
  });

  it('TASK-091-1: 代表 3 パターン（1/10/20）で BreadcrumbList JSON-LD が 1 件だけ注入される', () => {
    for (const id of [1, 10, 20]) {
      window.history.replaceState(null, '', `/patterns/${id}`);
      act(() => {
        root.render(<Router />);
      });

      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-route-jsonld="pattern-detail"]',
      );
      expect(scripts, `/patterns/${id} で JSON-LD タグが 1 つではない`).toHaveLength(1);

      const json = JSON.parse(scripts[0]?.textContent ?? '{}') as {
        '@context'?: string;
        '@type'?: string;
        itemListElement?: unknown[];
      };
      expect(json['@context']).toBe('https://schema.org');
      expect(json['@type']).toBe('BreadcrumbList');
      expect(json.itemListElement).toHaveLength(3);

      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });

  it('TASK-091-1: パターン詳細以外のルートでは pattern-detail JSON-LD が残留しない', () => {
    window.history.replaceState(null, '', '/patterns/1');
    act(() => {
      root.render(<Router />);
    });
    expect(
      document.querySelector(
        'script[type="application/ld+json"][data-route-jsonld="pattern-detail"]',
      ),
    ).not.toBeNull();

    act(() => {
      root.unmount();
    });
    root = createRoot(container);

    for (const path of ['/', '/patterns', '/reference/chapter01', '/cases/case-001']) {
      window.history.replaceState(null, '', path);
      act(() => {
        root.render(<Router />);
      });
      expect(
        document.querySelector(
          'script[type="application/ld+json"][data-route-jsonld="pattern-detail"]',
        ),
        `${path} で pattern-detail JSON-LD が残留している`,
      ).toBeNull();
      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });

  it('TASK-091-1: 3 系統ルートで視覚パンくず（nav[aria-label="パンくず"]）が表示される', () => {
    for (const path of ['/patterns/1', '/cases/case-001', '/reference/chapter01']) {
      window.history.replaceState(null, '', path);
      act(() => {
        root.render(<Router />);
      });
      const nav = container.querySelector('nav[aria-label="パンくず"]');
      expect(nav, `${path} で視覚パンくず nav が存在しない`).not.toBeNull();
      // 現在地は aria-current="page" の span として表示される（リンク化されない）。
      const current = nav?.querySelector('[aria-current="page"]');
      expect(current, `${path} で現在地（aria-current="page"）が存在しない`).not.toBeNull();
      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });
});
