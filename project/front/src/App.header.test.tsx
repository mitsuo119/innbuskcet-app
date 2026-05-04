import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';

/**
 * PBI-065 / Sprint015 TASK-104: アプリヘッダー文言（h1・サブタイトル）の検証。
 *
 * - h1 が日本語表記「インバスケット」であること
 * - サブタイトルから運用情報（MVP 開発中・Sprint 番号）が排除されていること
 */
describe('App ヘッダー文言（PBI-065）', () => {
  const html = renderToStaticMarkup(<App />);

  it('h1 が「インバスケット」である', () => {
    expect(html).toContain('<h1>インバスケット</h1>');
  });

  it('サブタイトルが「インバスケット学習アプリ」である', () => {
    expect(html).toContain('インバスケット学習アプリ');
  });

  it('UI 上に「InBusket」「MVP 開発中」「Sprint 006」表記が残っていない', () => {
    // ヘッダー〜main 内の利用者向け UI を対象に検証（ロゴ・法務本文はスコープ外）。
    const headerStart = html.indexOf('<header');
    const headerEnd = html.indexOf('</header>') + '</header>'.length;
    const headerHtml = html.slice(headerStart, headerEnd);
    expect(headerHtml).not.toContain('InBusket');
    expect(headerHtml).not.toContain('MVP');
    expect(headerHtml).not.toMatch(/Sprint\s?0\d\d/);
    expect(headerHtml).not.toContain('開発中');
  });
});
