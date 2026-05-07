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
