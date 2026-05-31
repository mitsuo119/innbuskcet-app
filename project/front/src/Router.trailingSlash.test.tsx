import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Router } from './Router';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * PBI-103 / TASK-103-1: 末尾スラッシュ正規化の回帰テスト。
 *
 * 背景:
 * - order017 P0 / PBI-102 で `parsePathname()` 冒頭に末尾スラッシュ正規化を導入した。
 * - 旧実装では `/about/` / `/reference/chapter01/` / `/cases/case-001/` / `/patterns/` 等の
 *   末尾スラッシュ付き URL が JS 実行後に not-found に解決され soft 404 化していた
 *   （クローラー経由で AdSense 審査落ちの直接要因）。
 * - 本テストは「末尾スラッシュ有無に関わらず同一ページに解決される」ことと、
 *   root `/` および不存在ルートは正規化後も既存挙動を維持することを担保する。
 */
describe('PBI-103 末尾スラッシュ正規化の回帰テスト', () => {
  let container: HTMLDivElement;
  let root: Root;
  const initialTitle = document.title;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.history.replaceState(null, '', '/');
    document.querySelector('meta[name="robots"]')?.remove();
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
   * 代表 URL × スラッシュ有無 = 16 件を同一ページに解決することを検証する。
   * 各ケースは pathname 設定 → render → `expect` 関数で描画内容（タイトル等）を判定。
   */
  const cases: Array<{
    label: string;
    pathname: string;
    expect: () => void;
  }> = [
    // /about
    {
      label: '/about',
      pathname: '/about',
      expect: () => expect(document.title).toContain('運営者情報'),
    },
    {
      label: '/about/',
      pathname: '/about/',
      expect: () => expect(document.title).toContain('運営者情報'),
    },
    // /privacy-policy
    {
      label: '/privacy-policy',
      pathname: '/privacy-policy',
      expect: () => expect(document.title).toContain('プライバシーポリシー'),
    },
    {
      label: '/privacy-policy/',
      pathname: '/privacy-policy/',
      expect: () => expect(document.title).toContain('プライバシーポリシー'),
    },
    // /terms-of-service
    {
      label: '/terms-of-service',
      pathname: '/terms-of-service',
      expect: () => expect(document.title).toContain('利用規約'),
    },
    {
      label: '/terms-of-service/',
      pathname: '/terms-of-service/',
      expect: () => expect(document.title).toContain('利用規約'),
    },
    // /terms
    {
      label: '/terms',
      pathname: '/terms',
      expect: () => expect(document.title).toContain('サービス利用規約'),
    },
    {
      label: '/terms/',
      pathname: '/terms/',
      expect: () => expect(document.title).toContain('サービス利用規約'),
    },
    // /contact
    {
      label: '/contact',
      pathname: '/contact',
      expect: () => expect(document.title).toContain('お問い合わせ'),
    },
    {
      label: '/contact/',
      pathname: '/contact/',
      expect: () => expect(document.title).toContain('お問い合わせ'),
    },
    // /reference
    {
      label: '/reference',
      pathname: '/reference',
      expect: () => expect(document.title).toContain('解説リファレンス'),
    },
    {
      label: '/reference/',
      pathname: '/reference/',
      expect: () => expect(document.title).toContain('解説リファレンス'),
    },
    // /reference/:chapterId
    {
      label: '/reference/chapter01',
      pathname: '/reference/chapter01',
      expect: () => expect(document.title).toContain('解説リファレンス'),
    },
    {
      label: '/reference/chapter01/',
      pathname: '/reference/chapter01/',
      expect: () => expect(document.title).toContain('解説リファレンス'),
    },
    // /patterns
    {
      label: '/patterns',
      pathname: '/patterns',
      expect: () => expect(document.title).toContain('パターン別解説'),
    },
    {
      label: '/patterns/',
      pathname: '/patterns/',
      expect: () => expect(document.title).toContain('パターン別解説'),
    },
    // /patterns/:id
    {
      label: '/patterns/1',
      pathname: '/patterns/1',
      expect: () => expect(document.title).toContain('パターン1'),
    },
    {
      label: '/patterns/1/',
      pathname: '/patterns/1/',
      expect: () => expect(document.title).toContain('パターン1'),
    },
    // /cases/:id
    {
      label: '/cases/case-001',
      pathname: '/cases/case-001',
      expect: () => expect(document.title).toContain('ケース001'),
    },
    {
      label: '/cases/case-001/',
      pathname: '/cases/case-001/',
      expect: () => expect(document.title).toContain('ケース001'),
    },
  ];

  for (const c of cases) {
    it(`末尾スラッシュ有無に関わらず ${c.label} は同一ページに解決される`, () => {
      window.history.replaceState(null, '', c.pathname);
      act(() => {
        root.render(<Router />);
      });
      // not-found ページに落ちていないこと（soft 404 回帰防止）
      expect(container.textContent).not.toContain('ページが見つかりません');
      // 期待コンテンツ判定
      c.expect();
    });
  }

  it('root `/` は末尾スラッシュ正規化の対象外（既存挙動維持）', () => {
    window.history.replaceState(null, '', '/');
    act(() => {
      root.render(<Router />);
    });
    // home ルートは既存通りタイトル接頭辞なし（resolveRouteSeo の default 分岐）
    expect(document.title).toBe('インバスケット - 学習アプリ');
    expect(container.textContent).not.toContain('ページが見つかりません');
  });

  it('不存在ルート（/unknown）は末尾スラッシュ有無に関わらず 404 として扱う', () => {
    window.history.replaceState(null, '', '/unknown');
    act(() => {
      root.render(<Router />);
    });
    expect(container.textContent).toContain('ページが見つかりません');
  });

  it('不存在ルート（/unknown/）も 404 として扱う（末尾スラッシュ正規化後も既存通り）', () => {
    window.history.replaceState(null, '', '/unknown/');
    act(() => {
      root.render(<Router />);
    });
    expect(container.textContent).toContain('ページが見つかりません');
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toContain('noindex');
  });

  it('不存在パターンID（/patterns/9999/）も 404 として扱う', () => {
    window.history.replaceState(null, '', '/patterns/9999/');
    act(() => {
      root.render(<Router />);
    });
    expect(container.textContent).toContain('ページが見つかりません');
  });

  it('不存在 reference ID（/reference/chapter99/）も 404 として扱う', () => {
    window.history.replaceState(null, '', '/reference/chapter99/');
    act(() => {
      root.render(<Router />);
    });
    expect(container.textContent).toContain('ページが見つかりません');
  });

  it('多重末尾スラッシュ（/about///）も /about に正規化される', () => {
    window.history.replaceState(null, '', '/about///');
    act(() => {
      root.render(<Router />);
    });
    expect(container.textContent).not.toContain('ページが見つかりません');
    expect(document.title).toContain('運営者情報');
  });
});
