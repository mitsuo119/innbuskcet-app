import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Router } from './Router';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * PBI-076 / TASK-076-1: History API ルーターの動作検証。
 * - 初期 pathname / popstate / pushState（NAVIGATE_EVENT）/ レガシーハッシュ自動移行 / 不存在ルート404 を検証する。
 */
describe('PBI-076 History API ルーター', () => {
  let container: HTMLDivElement;
  let root: Root;
  const initialTitle = document.title;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    // 各テスト前に pathname / hash を初期化
    window.history.replaceState(null, '', '/');
    // 既存テストの replaceState 影響で残存している noindex を消す
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

  it('pathname `/reference` から解説リファレンス画面を解決する', () => {
    window.history.replaceState(null, '', '/reference');

    act(() => {
      root.render(<Router />);
    });

    expect(container.textContent).toContain('インバスケット解説リファレンス');
  });

  it('pathname `/patterns/1` からパターン詳細を解決する', () => {
    window.history.replaceState(null, '', '/patterns/1');

    act(() => {
      root.render(<Router />);
    });

    expect(document.title).toContain('パターン1');
    expect(document.title).toContain('インバスケット - 学習アプリ');
  });

  it('レガシーハッシュ `#/reference` をマウント時に pathname へ自動移行する', () => {
    window.history.replaceState(null, '', '/');
    window.location.hash = '#/reference';

    act(() => {
      root.render(<Router />);
    });

    expect(window.location.pathname).toBe('/reference');
    expect(window.location.hash).toBe('');
    expect(container.textContent).toContain('インバスケット解説リファレンス');
  });

  it('不存在ルートは not-found 画面を描画し meta robots noindex を付与する', () => {
    window.history.replaceState(null, '', '/no-such-route');

    act(() => {
      root.render(<Router />);
    });

    expect(container.textContent).toContain('ページが見つかりません');
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    expect(robots).not.toBeNull();
    expect(robots?.getAttribute('content')).toContain('noindex');
    expect(document.title).toContain('ページが見つかりません');
  });

  it('不存在パターンID（/patterns/9999）も 404 として扱う', () => {
    window.history.replaceState(null, '', '/patterns/9999');

    act(() => {
      root.render(<Router />);
    });

    expect(container.textContent).toContain('ページが見つかりません');
  });

  it('不存在 reference ID（/reference/chapter99）も 404 として扱う', () => {
    window.history.replaceState(null, '', '/reference/chapter99');

    act(() => {
      root.render(<Router />);
    });

    expect(container.textContent).toContain('ページが見つかりません');
  });

  it('popstate（戻る/進む）で pathname を再評価する', () => {
    window.history.replaceState(null, '', '/');

    act(() => {
      root.render(<Router />);
    });

    // pushState で /patterns へ進み、popstate を発火させる
    window.history.pushState(null, '', '/patterns');
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(document.title).toContain('パターン別解説');
  });
});

/**
 * PBI-077 / TASK-077-4: 内部 `<a href="/...">` クリックの修飾キー・中央/右クリック・キーボード操作回帰テスト。
 *
 * 検証観点:
 * - 通常クリックは Router の delegated click handler が pushState 化する（preventDefault される）。
 * - 修飾キー併用（Ctrl/Meta/Shift/Alt）は preventDefault されない（ブラウザ既定の新規タブ/コピー挙動を尊重）。
 * - 中央クリック / 右クリック（button !== 0）も preventDefault されない（新規タブ・コンテキストメニューを尊重）。
 * - target="_blank" / download 属性 / rel="external" は無視される（既定挙動を尊重）。
 * - Enter キーでアンカーをアクティベートできる（既定挙動でリンクをたどる）。
 */
describe('PBI-077 / TASK-077-4 内部リンクの修飾キー・中央クリック・キーボード操作', () => {
  let container: HTMLDivElement;
  let root: Root;

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
    document.querySelector('meta[name="robots"]')?.remove();
  });

  function dispatchClick(
    target: EventTarget,
    init: Partial<{
      button: number;
      ctrlKey: boolean;
      metaKey: boolean;
      shiftKey: boolean;
      altKey: boolean;
    }> = {},
  ): MouseEvent {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: init.button ?? 0,
      ctrlKey: init.ctrlKey ?? false,
      metaKey: init.metaKey ?? false,
      shiftKey: init.shiftKey ?? false,
      altKey: init.altKey ?? false,
    });
    target.dispatchEvent(event);
    return event;
  }

  it('通常クリック（button=0・修飾キーなし）で内部 `<a href="/patterns">` を pushState する', () => {
    window.history.replaceState(null, '', '/');
    act(() => {
      root.render(<Router />);
    });

    const anchor = container.querySelector<HTMLAnchorElement>(
      'a.app-footer__legal-link[href="/patterns"]',
    );
    expect(anchor).not.toBeNull();

    act(() => {
      const event = dispatchClick(anchor!);
      expect(event.defaultPrevented).toBe(true);
    });

    expect(window.location.pathname).toBe('/patterns');
    expect(document.title).toContain('パターン別解説');
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
  ])('修飾キー %s 併用クリックは preventDefault されず pushState されない', (_label, mods) => {
    window.history.replaceState(null, '', '/');
    act(() => {
      root.render(<Router />);
    });

    const anchor = container.querySelector<HTMLAnchorElement>(
      'a.app-footer__legal-link[href="/patterns"]',
    );
    expect(anchor).not.toBeNull();

    const event = dispatchClick(anchor!, mods);
    // ブラウザ既定の新規タブ・コピー挙動を尊重するため preventDefault しない
    expect(event.defaultPrevented).toBe(false);
    // pushState されないので URL は変わらない
    expect(window.location.pathname).toBe('/');
  });

  it('ミドルクリック（button=1）は preventDefault されず pushState されない', () => {
    window.history.replaceState(null, '', '/');
    act(() => {
      root.render(<Router />);
    });

    const anchor = container.querySelector<HTMLAnchorElement>(
      'a.app-footer__legal-link[href="/patterns"]',
    );
    expect(anchor).not.toBeNull();

    const event = dispatchClick(anchor!, { button: 1 });
    expect(event.defaultPrevented).toBe(false);
    expect(window.location.pathname).toBe('/');
  });

  it('右クリック（button=2）は preventDefault されず pushState されない', () => {
    window.history.replaceState(null, '', '/');
    act(() => {
      root.render(<Router />);
    });

    const anchor = container.querySelector<HTMLAnchorElement>(
      'a.app-footer__legal-link[href="/patterns"]',
    );
    expect(anchor).not.toBeNull();

    const event = dispatchClick(anchor!, { button: 2 });
    expect(event.defaultPrevented).toBe(false);
    expect(window.location.pathname).toBe('/');
  });

  it('外部リンク（target="_blank" / download / rel="external"）は delegated click が無視する', () => {
    window.history.replaceState(null, '', '/');
    act(() => {
      root.render(<Router />);
    });

    // 動的に外部リンクを差し込み、delegated click が無視することを検証
    const externalAnchor = document.createElement('a');
    externalAnchor.href = '/patterns';
    externalAnchor.target = '_blank';
    container.appendChild(externalAnchor);

    const event = dispatchClick(externalAnchor);
    expect(event.defaultPrevented).toBe(false);
    expect(window.location.pathname).toBe('/');

    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = '/patterns';
    downloadAnchor.setAttribute('download', 'data.txt');
    container.appendChild(downloadAnchor);

    const ev2 = dispatchClick(downloadAnchor);
    expect(ev2.defaultPrevented).toBe(false);

    const externalRelAnchor = document.createElement('a');
    externalRelAnchor.href = '/patterns';
    externalRelAnchor.setAttribute('rel', 'external');
    container.appendChild(externalRelAnchor);

    const ev3 = dispatchClick(externalRelAnchor);
    expect(ev3.defaultPrevented).toBe(false);
  });

  it('PatternList カードが `<a href="/patterns/:id">` で実装されており通常クリックで pushState する', () => {
    window.history.replaceState(null, '', '/patterns');
    act(() => {
      root.render(<Router />);
    });

    const cardAnchor = container.querySelector<HTMLAnchorElement>(
      'a.pattern-list__item[href="/patterns/1"]',
    );
    expect(cardAnchor).not.toBeNull();

    act(() => {
      const event = dispatchClick(cardAnchor!);
      expect(event.defaultPrevented).toBe(true);
    });

    expect(window.location.pathname).toBe('/patterns/1');
    expect(document.title).toContain('パターン1');
  });

  it('PatternList カードを Ctrl+Click した場合は pushState されない（新規タブ）', () => {
    window.history.replaceState(null, '', '/patterns');
    act(() => {
      root.render(<Router />);
    });

    const cardAnchor = container.querySelector<HTMLAnchorElement>(
      'a.pattern-list__item[href="/patterns/1"]',
    );
    expect(cardAnchor).not.toBeNull();

    const event = dispatchClick(cardAnchor!, { ctrlKey: true });
    expect(event.defaultPrevented).toBe(false);
    expect(window.location.pathname).toBe('/patterns');
  });

  it('Enter キーでアンカーをアクティベートできる（HTMLAnchorElement.click で既定動作）', () => {
    window.history.replaceState(null, '', '/');
    act(() => {
      root.render(<Router />);
    });

    const anchor = container.querySelector<HTMLAnchorElement>(
      'a.app-footer__legal-link[href="/reference"]',
    );
    expect(anchor).not.toBeNull();
    // フォーカス可能であること（キーボード操作の前提）
    anchor!.focus();
    expect(document.activeElement).toBe(anchor);

    // Enter キーで HTMLAnchorElement の既定動作（click 発火）が起こる前提のもと、
    // ここでは click() をトリガーし delegated handler が pushState することを確認する。
    act(() => {
      anchor!.click();
    });

    expect(window.location.pathname).toBe('/reference');
  });
});
