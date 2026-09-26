import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Router } from '../../Router';
import { ROUTES } from '../../../scripts/prerender.mjs';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface StaticRoute {
  path: string;
  title: string;
  description: string;
  bodyHtml: string;
}

const BLOCK_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'li', 'dt', 'dd', 'th', 'td'];
const normalize = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, '');
const texts = (nodes: Iterable<Element>) =>
  [...nodes].map((node) => normalize(node.textContent)).filter(Boolean);

/**
 * 検索エンジンが JS 実行前に読む静的HTML（scripts/prerender.mjs）と、利用者が見る画面が
 * 同じ内容であることを全60ルートで検証する（静的HTMLだけの文章・画面だけの本文を作らない）。
 */
describe('静的HTMLと画面表示の一致', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    if (!document.querySelector('meta[name="description"]')) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.history.replaceState(null, '', '/');
  });

  for (const route of ROUTES as StaticRoute[]) {
    it(`${route.path}: title・description・本文が画面と一致する`, () => {
      window.history.replaceState(null, '', route.path);
      act(() => {
        root.render(<Router />);
      });

      expect(document.title).toBe(route.title);
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        route.description,
      );

      const staticDocument = new DOMParser().parseFromString(route.bodyHtml, 'text/html');
      const live = normalize(container.textContent);
      for (const text of texts(staticDocument.querySelectorAll(BLOCK_TAGS.join(',')))) {
        expect(live, `${route.path} の静的HTMLだけにある文: ${text}`).toContain(text);
      }

      // トップは演習UIを含むため、画面→静的HTMLの方向は導入と実践解説（別テスト）で確認する。
      if (route.path === '/') return;
      const staticText = normalize(staticDocument.body.textContent);
      const liveBlocks = texts(
        container.querySelectorAll(
          ['header h1', 'header p', ...BLOCK_TAGS.map((tag) => `main ${tag}`)].join(','),
        ),
      );
      for (const text of liveBlocks) {
        expect(staticText, `${route.path} の画面だけにある文: ${text}`).toContain(text);
      }
    });
  }
});
