import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';
import guide from './data/homeStudyGuide.json';
import { PUBLIC_ROUTES } from './routes';
import { ROUTES } from '../scripts/prerender.mjs';

describe('トップの実践解説', () => {
  const html = renderToStaticMarkup(<App />);
  const document = new DOMParser().parseFromString(html, 'text/html');
  const staticDocument = new DOMParser().parseFromString(
    ROUTES.find((route: { path: string }) => route.path === '/')!.bodyHtml,
    'text/html',
  );

  it('home-about セクションが aria-labelledby 付きで存在する', () => {
    expect(html).toContain('<section class="home-about" aria-labelledby="home-about-heading">');
    expect(document.getElementById('home-about-heading')?.textContent).toBe(guide.title);
  });

  it('演習条件・判断根拠・回答比較・条件変更・振り返りを画面と静的HTMLで共有する', () => {
    for (const section of guide.sections) {
      for (const text of [section.heading, ...section.paragraphs, ...section.points]) {
        expect(document.body.textContent).toContain(text);
        expect(staticDocument.body.textContent).toContain(text);
      }
    }
    expect(document.body.textContent).toContain('公式正答や合格基準ではありません');
    expect(staticDocument.body.textContent).toContain(guide.introduction);
    expect(document.body.textContent).not.toContain('合格水準');
  });

  it('問題回答欄の後に記事を置き、記事へのリンクを先に表示する', () => {
    expect(html.indexOf('優先度を選択')).toBeLessThan(html.indexOf('id="home-about-heading"'));
    expect(document.querySelector('a[href="#home-about-heading"]')).not.toBeNull();
    expect(html).not.toContain('広告（ヘッダー下バナー）');
  });

  it('関連記事と運営者情報のリンク先が実在し、静的HTMLにも含まれる', () => {
    const paths = PUBLIC_ROUTES.map((route) => route.path);
    for (const link of [
      ...guide.sections.flatMap((section) => section.links),
      ...guide.siteLinks,
    ]) {
      expect(paths).toContain(link.href);
      expect(document.querySelector(`.home-about a[href="${link.href}"]`)).not.toBeNull();
      expect(staticDocument.querySelector(`a[href="${link.href}"]`)).not.toBeNull();
    }
  });
});
