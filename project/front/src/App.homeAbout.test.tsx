import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';

/**
 * PBI-090 / TASK-090-2 (Sprint024 DAY4):
 * トップ本文「このサイトについて」セクション（home-about）の存在検証。
 *
 * 受入基準:
 * - h2「このサイトについて」セクションが存在する
 * - 本文の文字数が 200 字以上（200〜400 字目安）
 * - 主要コンテンツ概要（全12章 / 20パターン / 20ケース / Quick / Deep / Exam）に言及
 * - JS 無効でも表示されるプレーンテキスト中心の構造
 * - a11y: aria-labelledby で h2 と紐付け
 */
describe('PBI-090 トップ「このサイトについて」セクション', () => {
  const html = renderToStaticMarkup(<App />);

  it('home-about セクションが aria-labelledby 付きで存在する', () => {
    expect(html).toContain('<section class="home-about" aria-labelledby="home-about-heading">');
    expect(html).toMatch(/<h2[^>]*id="home-about-heading"[^>]*>このサイトについて<\/h2>/);
  });

  it('セクション内の本文テキストが 200 字以上である', () => {
    // home-about セクション部分のみを抽出して文字数を検証する。
    const match = html.match(/<section class="home-about"[\s\S]*?<\/section>/);
    expect(match).not.toBeNull();
    const sectionHtml = match![0];
    // タグを除去したプレーンテキスト長を計測する（ホワイトスペースは 1 字に正規化）。
    const text = sectionHtml
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, '')
      .trim();
    expect(text.length).toBeGreaterThanOrEqual(200);
  });

  it('主要コンテンツ概要（12章 / 20パターン / 20ケース / Quick・Deep・Exam）に言及している', () => {
    const sectionHtml = html.match(/<section class="home-about"[\s\S]*?<\/section>/)![0];
    expect(sectionHtml).toContain('全12章');
    expect(sectionHtml).toContain('全20パターン');
    expect(sectionHtml).toContain('代表ケース20件');
    expect(sectionHtml).toContain('Quick');
    expect(sectionHtml).toContain('Deep');
    expect(sectionHtml).toContain('Exam');
  });

  it('運営者情報・利用規約への動線リンクを含む', () => {
    const sectionHtml = html.match(/<section class="home-about"[\s\S]*?<\/section>/)![0];
    expect(sectionHtml).toMatch(/<a [^>]*href="\/about"/);
    expect(sectionHtml).toMatch(/<a [^>]*href="\/terms"/);
  });
});
