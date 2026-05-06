import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Router } from './Router';

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
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.location.hash = initialHash;
    document.title = initialTitle;
  });

  it('ホームではアプリ標準タイトルを設定する', () => {
    act(() => {
      root.render(<Router />);
    });

    expect(document.title).toBe('インバスケット - 学習アプリ');
  });

  it('解説リファレンスではルート固有タイトルを設定する', () => {
    window.location.hash = '#/reference';

    act(() => {
      root.render(<Router />);
    });

    expect(document.title).toContain('解説リファレンス');
    expect(document.title).toContain('インバスケット - 学習アプリ');
  });

  it('パターン詳細では重複しないタイトルを設定する', () => {
    window.location.hash = '#/patterns/1';

    act(() => {
      root.render(<Router />);
    });

    expect(document.title).toContain('パターン1');
    expect(document.title).toContain('インバスケット - 学習アプリ');
  });
});
