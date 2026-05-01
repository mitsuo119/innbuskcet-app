import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeToggle } from './ThemeToggle';

// React 18: act() を使うために必要なフラグ（vitest jsdom 環境向け）
// https://react.dev/reference/react/act
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * ThemeToggle（PBI-019 / TASK-004）のテスト。
 * - localStorage（キー `inbusket.theme`）からの復元
 * - クリックでの切替と <html data-theme> 反映
 * - aria-checked / aria-label の変化（DoD §9-3）
 * - role="switch" の維持（SSR）
 *
 * jsdom 環境（vite.config.ts）で `react-dom/client` + `act` により
 * useEffect の永続化処理まで含めて検証する。
 */
describe('ThemeToggle（PBI-019 / TASK-004 永続化・状態保持）', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('localStorage が "dark" なら aria-checked="true" で復元され <html data-theme="dark"> が設定される', () => {
    window.localStorage.setItem('inbusket.theme', 'dark');
    act(() => {
      root.render(<ThemeToggle />);
    });
    const btn = container.querySelector('button.theme-toggle');
    expect(btn).not.toBeNull();
    expect(btn!.getAttribute('aria-checked')).toBe('true');
    expect(btn!.getAttribute('aria-label')).toContain('ダーク');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('localStorage が "light" なら aria-checked="false" で復元され <html data-theme="light"> が設定される', () => {
    window.localStorage.setItem('inbusket.theme', 'light');
    act(() => {
      root.render(<ThemeToggle />);
    });
    const btn = container.querySelector('button.theme-toggle')!;
    expect(btn.getAttribute('aria-checked')).toBe('false');
    expect(btn.getAttribute('aria-label')).toContain('ライト');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('localStorage が無効値（"invalid"）や未設定の場合は light にフォールバックする', () => {
    window.localStorage.setItem('inbusket.theme', 'invalid');
    act(() => {
      root.render(<ThemeToggle />);
    });
    const btn = container.querySelector('button.theme-toggle')!;
    expect(btn.getAttribute('aria-checked')).toBe('false');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('クリックで light → dark → light にトグルし aria-checked と localStorage が同期する', () => {
    window.localStorage.setItem('inbusket.theme', 'light');
    act(() => {
      root.render(<ThemeToggle />);
    });
    const btn = container.querySelector('button.theme-toggle') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');

    // 1回目クリック: dark に切替
    act(() => {
      btn.click();
    });
    expect(btn.getAttribute('aria-checked')).toBe('true');
    expect(btn.getAttribute('aria-label')).toContain('ダーク');
    expect(window.localStorage.getItem('inbusket.theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // 2回目クリック: light に戻る
    act(() => {
      btn.click();
    });
    expect(btn.getAttribute('aria-checked')).toBe('false');
    expect(btn.getAttribute('aria-label')).toContain('ライト');
    expect(window.localStorage.getItem('inbusket.theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('role="switch" と aria-label が常に設定されている（DoD §9-3 / SSR で初期描画を確認）', () => {
    const html = renderToStaticMarkup(<ThemeToggle />);
    expect(html).toContain('role="switch"');
    expect(html).toMatch(/aria-label="[^"]+"/);
    // type="button" を維持しフォーム誤送信を防ぐ
    expect(html).toContain('type="button"');
  });
});
