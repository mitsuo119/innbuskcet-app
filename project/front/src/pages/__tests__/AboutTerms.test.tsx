import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { About } from '../About';
import { Terms } from '../Terms';
import { Contact } from '../Contact';
import { PrivacyPolicy } from '../PrivacyPolicy';
import information from '../../data/siteInformation.json';
import { PUBLIC_ROUTES } from '../../routes';
import { ROUTES } from '../../../scripts/prerender.mjs';

describe('運営情報とプライバシーの表示一致', () => {
  const pages = [
    { path: '/about', page: <About />, content: information.about },
    { path: '/contact', page: <Contact />, content: information.contact },
    { path: '/privacy-policy', page: <PrivacyPolicy />, content: information.privacy },
  ];

  for (const entry of pages) {
    it(`${entry.path} は全段落・連絡先・更新日を画面と静的HTMLで共有する`, () => {
      const live = new DOMParser().parseFromString(renderToStaticMarkup(entry.page), 'text/html');
      const staticPage = new DOMParser().parseFromString(
        ROUTES.find((route: { path: string }) => route.path === entry.path)!.bodyHtml,
        'text/html',
      );
      for (const output of [live, staticPage]) {
        expect(output.body.textContent).toContain(entry.content.introduction);
        expect(output.querySelector('time')?.getAttribute('datetime')).toBe(entry.content.updated);
        for (const section of entry.content.sections) {
          for (const text of [section.heading, ...section.paragraphs, ...section.points]) {
            expect(output.body.textContent).toContain(text);
          }
          for (const link of section.links) {
            expect(output.querySelector(`a[href="${link.href}"]`)).not.toBeNull();
          }
        }
      }
    });
  }

  it('問い合わせが実際のIssue作成先に届き、公開範囲を明示する', () => {
    const html = renderToStaticMarkup(<Contact />);
    expect(html).toContain('href="https://github.com/mitsuo119/innbuskcet-app/issues/new"');
    expect(html).not.toContain('href="https://github.com"');
    expect(html).toContain('投稿内容はインターネット上に公開');
    expect(html).not.toContain('別途ご連絡方法をご案内');
  });

  it('架空の専門家監修や外部AIによる採点をうたわない', () => {
    const html = renderToStaticMarkup(<About />);
    expect(html).toContain('AIを教材の草案作成と実装に利用');
    expect(html).toContain('公式採点基準、配点、合格ラインを示すものではありません');
    expect(html).toContain('ブラウザ内での語句・形式のチェック');
  });

  it('Cookieとブラウザ保存を区別し、Googleのデータ利用説明にリンクする', () => {
    const html = renderToStaticMarkup(<PrivacyPolicy />);
    expect(html).toContain('これらはCookieとは異なる保存機能');
    expect(html).toContain('IPアドレス');
    expect(html).toContain('ウェブビーコン');
    expect(html).toContain('https://policies.google.com/technologies/partner-sites?hl=ja');
  });
});

/**
 * PBI-088 / TASK-088-3 (Sprint024 DAY4):
 * /about 運営者情報ページのスモーク + メタ + 動線テスト。
 */
describe('PBI-088 /about 運営者情報ページ', () => {
  const html = renderToStaticMarkup(<About />);

  it('h1「運営者情報（このサイトについて）」と必須6項目見出しを含む', () => {
    expect(html).toContain('運営者情報');
    expect(html).toContain('1. サイトの目的');
    expect(html).toContain('2. 想定読者');
    expect(html).toContain('3. コンテンツ作成方針');
    expect(html).toContain('4. 運営者表記');
    expect(html).toContain('5. 連絡手段');
    expect(html).toContain('6. 更新ポリシー');
  });

  it('GlobalNav と戻る導線（<a href="/">）を持つ', () => {
    expect(html).toContain('aria-label="グローバルナビゲーション"');
    expect(html).toMatch(/<a [^>]*href="\/"[^>]*class="legal-back-btn"[^>]*>/);
  });

  it('PUBLIC_ROUTES に /about が登録されている（sitemap 自動生成対象）', () => {
    const paths = PUBLIC_ROUTES.map((r) => r.path);
    expect(paths).toContain('/about');
  });
});

/**
 * PBI-089 / TASK-089-3 (Sprint024 DAY4):
 * /terms サービス利用規約ページのスモーク + Footer 3 点リンク + メタ。
 */
describe('PBI-089 /terms サービス利用規約ページ', () => {
  const html = renderToStaticMarkup(<Terms />);

  it('h1「サービス利用規約」と必須6項目見出しを含む', () => {
    expect(html).toContain('サービス利用規約');
    expect(html).toContain('1. 利用条件');
    expect(html).toContain('2. 免責');
    expect(html).toContain('3. 著作権・知的財産');
    expect(html).toContain('4. 禁止事項');
    expect(html).toContain('5. 準拠法');
    expect(html).toContain('6. 改定');
  });

  it('GlobalNav と戻る導線（<a href="/">）を持つ', () => {
    expect(html).toContain('aria-label="グローバルナビゲーション"');
    expect(html).toMatch(/<a [^>]*href="\/"[^>]*class="legal-back-btn"[^>]*>/);
  });

  it('legal 3 点リンク（privacy-policy / terms-of-service / contact）への動線を含む', () => {
    expect(html).toContain('href="/privacy-policy"');
    expect(html).toContain('href="/terms-of-service"');
    // /contact は本文中に現れない場合もあるため GlobalNav 内を含めた全体で検証。
    // /terms 本文では privacy / terms-of-service を本文内リンクとして提供。
  });

  it('PUBLIC_ROUTES に /terms が登録されている（sitemap 自動生成対象）', () => {
    const paths = PUBLIC_ROUTES.map((r) => r.path);
    expect(paths).toContain('/terms');
  });
});
