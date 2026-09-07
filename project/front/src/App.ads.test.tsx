import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';
import { saveLearningStyle } from './domain/learningStyle';

vi.mock('./ui/AdSlot', () => ({
  AdSlot: () => <ins data-test-ad="true" />,
}));

describe('学習画面の広告配置', () => {
  afterEach(() => localStorage.clear());

  it.each(['quick', 'deep'] as const)('%s は演習・本文の後に1枠だけ配置する', (style) => {
    saveLearningStyle(style);
    const html = renderToStaticMarkup(<App />);
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.querySelectorAll('[data-test-ad]')).toHaveLength(1);
    expect(html.indexOf('id="home-about-heading"')).toBeLessThan(html.indexOf('data-test-ad'));
    expect(html.indexOf('優先度を選択')).toBeLessThan(html.indexOf('data-test-ad'));
  });

  it('模試では説明記事と広告を表示しない', () => {
    saveLearningStyle('exam');
    const html = renderToStaticMarkup(<App />);
    expect(html).not.toContain('data-test-ad');
    expect(html).not.toContain('id="home-about-heading"');
  });
});
