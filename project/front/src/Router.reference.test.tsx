import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';
import { Router } from './Router';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('PBI-056 解説導線', () => {
  let container: HTMLDivElement;
  let root: Root;
  const initialHash = window.location.hash;

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
  });

  it('既存ホーム画面に解説リファレンスへのリンクを表示する', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('解説リファレンス');
    expect(html).toContain('href="/reference"');
  });

  it('Router は #/reference で解説リファレンス画面を表示する', () => {
    window.location.hash = '#/reference';

    act(() => {
      root.render(<Router />);
    });

    expect(container.textContent).toContain('インバスケット解説リファレンス');
    expect(container.textContent).toContain('インバスケットとは何か');
    expect(container.textContent).toContain('採点基準を逆算する');
    expect(container.textContent).toContain('優先順位づけの技術');
    expect(container.textContent).toContain('案件パターン別攻略');
  });

  it('Router は #/reference/chapter08 で chapter08 リンクを現在位置として扱う', () => {
    window.location.hash = '#/reference/chapter08';

    act(() => {
      root.render(<Router />);
    });

    // PBI-064 / Sprint015 DAY4: GlobalNav の aria-current="page"（解説リファレンス）と
    // 章リンクの aria-current="page" が同居するため、章スキップナビ内に絞って検証する。
    const currentLink = container.querySelector<HTMLAnchorElement>(
      '.reference-page__chapter-link[aria-current="page"]',
    );
    expect(currentLink).not.toBeNull();
    expect(currentLink?.getAttribute('href')).toBe('/reference/chapter08');
    expect(currentLink?.textContent).toContain('案件パターン別攻略');
  });
});
