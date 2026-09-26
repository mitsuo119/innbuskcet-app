import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ReferencePage } from '../ReferencePage';
import scoringGuide from '../../data/scoringGuide.json';
import { REFERENCE_DATA, countChapterChars } from '../../data/referenceData';
import { MIN_BODY_CHAR_COUNT, shouldShowAds } from '../../ui/adPolicy';
import { ROUTES } from '../../../scripts/prerender.mjs';

const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'ReferencePage.tsx');
const source = readFileSync(sourcePath, 'utf-8');

describe('PBI-056 解説リファレンス画面', () => {
  for (const chapter of REFERENCE_DATA) {
    it(`${chapter.id} の詳細URLは指定章のみを表示し、他の章の本文を複製しない`, () => {
      const document = new DOMParser().parseFromString(
        renderToStaticMarkup(<ReferencePage focusChapterId={chapter.id} />),
        'text/html',
      );
      expect(document.querySelector('h1')?.textContent).toBe(chapter.title);
      expect(document.querySelectorAll('article.reference-page__chapter')).toHaveLength(1);
      expect(document.querySelector('article')?.id).toBe(`reference-${chapter.id}`);
      for (const other of REFERENCE_DATA.filter((entry) => entry.id !== chapter.id)) {
        expect(document.getElementById(`reference-${other.id}`)).toBeNull();
      }
    });
  }

  it('採点の章は公式基準と自己点検を区別し、全ブロックを静的HTMLと共有する', () => {
    const chapter = scoringGuide;
    const live = new DOMParser().parseFromString(
      renderToStaticMarkup(<ReferencePage focusChapterId="chapter02" />),
      'text/html',
    );
    const staticPage = new DOMParser().parseFromString(
      ROUTES.find((route: { path: string }) => route.path === '/reference/chapter02')!.bodyHtml,
      'text/html',
    );
    const collectText = (value: unknown): string[] => {
      if (typeof value === 'string') return [value];
      if (Array.isArray(value)) return value.flatMap(collectText);
      if (value && typeof value === 'object') {
        return Object.entries(value)
          .filter(([key]) => !['kind', 'id', 'href'].includes(key))
          .flatMap(([, child]) => collectText(child));
      }
      return [];
    };
    for (const output of [live, staticPage]) {
      expect(output.body.textContent).toContain('個別の試験の採点表や配点を確認していません');
      expect(output.body.textContent).not.toContain('一般に意思決定力の配点が最も高い');
      for (const text of collectText(chapter.sections)) {
        expect(output.body.textContent).toContain(text);
      }
    }
  });

  it('主要章の見出しとスキップ導線を表示し、内部表記を UI に出さない', () => {
    const html = renderToStaticMarkup(<ReferencePage />);

    expect(html).toContain('解説リファレンス');
    expect(html).toContain('インバスケット解説リファレンス');
    expect(html).toContain('インバスケットとは何か');
    expect(html).toContain('採点基準と振り返りの6観点');
    expect(html).toContain('優先順位づけの技術');
    expect(html).toContain('案件パターン別攻略');
    // PBI-061: chapter 表記と ref/ パスは UI に表示しない
    expect(html).not.toMatch(/&gt;chapter0[1-9]&lt;|>chapter0[1-9]</);
    expect(html).not.toContain('ref/chapter');
    expect(html).not.toContain('参照元</dt>');
    // 内部ルーティングは維持
    expect(html).toContain('href="/reference/chapter01"');
    expect(html).toContain('href="/reference/chapter02"');
    expect(html).toContain('href="/reference/chapter05"');
    expect(html).toContain('href="/reference/chapter08"');
  });

  it('テーブル・箇条書き・補足メモ・参照導線を安全にレンダリングする', () => {
    const html = renderToStaticMarkup(<ReferencePage focusChapterId="chapter08" />);

    expect(html).toContain('<table');
    expect(html).not.toContain('id="reference-chapter05"');
    expect(html).toContain('代表パターン分類（要点）');
    expect(html).toContain('href="/patterns"');
    expect(html).toContain('href="/patterns/14"');
    expect(html).toContain('aria-current="page"');
  });

  it('dangerouslySetInnerHTML を使わず、React の通常レンダリングのみで構成している', () => {
    expect(source).not.toContain('dangerouslySetInnerHTML');
  });

  describe('PBI-062 / PBI-083 章間導線（前/次/一覧へ戻る）', () => {
    const pages = REFERENCE_DATA.map((chapter, index) => ({
      chapter,
      index,
      html: renderToStaticMarkup(<ReferencePage focusChapterId={chapter.id} />),
    }));

    it('全12章の詳細ページに「前の章」「章一覧へ戻る」「次の章」の3導線が描画される', () => {
      expect(pages).toHaveLength(12);
      for (const { html } of pages) {
        expect(html.match(/class="reference-page__pager-link /g) ?? []).toHaveLength(3);
        expect(html).toContain('id="reference-chapter-nav"');
        const pager = html.slice(html.indexOf('reference-page__chapter-pager'));
        expect(pager).toContain('href="/reference"');
      }
    });

    it('章の本文を見出しの直後に置き、章の一覧は本文の後に置く', () => {
      for (const { html } of pages) {
        expect(html.indexOf('<article')).toBeLessThan(html.indexOf('id="reference-chapter-nav"'));
      }
    });

    it('先頭章の前の章と末尾章の次の章は aria-disabled で表示される', () => {
      const first = pages[0].html;
      expect(first).toMatch(
        /reference-page__pager-link--prev[^"]*reference-page__pager-link--disabled/,
      );
      expect(first).toContain('aria-disabled="true"');
      expect(first).toContain('（最初の章です）');
      expect(first).toContain('href="/reference/chapter02"');

      const last = pages[11].html;
      expect(last).toMatch(
        /reference-page__pager-link--next[^"]*reference-page__pager-link--disabled/,
      );
      expect(last).toContain('（最後の章です）');
      expect(last).toContain('href="/reference/chapter11"');
    });

    it('中間章には disabled なページャーが現れず、前後章リンクが正しく配置される', () => {
      for (const { html, index } of pages.slice(1, -1)) {
        const pager = html.slice(html.indexOf('reference-page__chapter-pager'));
        expect(pager).toContain(`href="/reference/${REFERENCE_DATA[index - 1].id}"`);
        expect(pager).toContain(`href="/reference/${REFERENCE_DATA[index + 1].id}"`);
        expect(pager).not.toContain('reference-page__pager-link--disabled');
      }
    });

    it('章スキップナビは番号バッジ＋章タイトルを表示し、位置情報は aria-hidden で補助に出ない', () => {
      const html = pages[3].html;
      expect(html).toContain('reference-page__chapter-link-index');
      expect(html).toContain('第1章');
      expect(html).toContain('第4章');
      expect(html).toContain('aria-label="章スキップ"');
      expect(html).toMatch(/aria-label="[^"]*章間ナビゲーション"/);
      expect(html).toMatch(/reference-page__chapter-position[^>]*aria-hidden="true"/);
    });

    it('章ページでは見出しと章カードの説明文を重複表示しない', () => {
      for (const { chapter, html } of pages) {
        const document = new DOMParser().parseFromString(html, 'text/html');
        expect(document.querySelectorAll('h1, h2')).not.toHaveLength(0);
        const headings = [...document.querySelectorAll('h1, h2')].map((node) => node.textContent);
        expect(headings.filter((text) => text === chapter.title)).toHaveLength(1);
        expect(document.body.textContent?.split(chapter.description).length).toBe(2);
      }
    });

    it('スタイルは ReferencePage.css に集約されており TSX に inline style が無い', () => {
      // TASK-203 の局所化方針: コンポーネント側に style= 属性を持たせない
      expect(source).not.toMatch(/\sstyle=\{/);
    });

    it('全 12 章で関連案件パターン（/patterns/:id）への内部リンクが章本文に1件以上存在する', () => {
      for (const { html } of pages) {
        const article = html.slice(
          html.indexOf('<article'),
          html.indexOf('reference-page__chapter-pager'),
        );
        expect(article).toMatch(/href="\/patterns\/\d+"/);
      }
    });
  });

  it('一覧ページは章の本文を複製せず、全12章を学習段階ごとに案内する', () => {
    const document = new DOMParser().parseFromString(
      renderToStaticMarkup(<ReferencePage />),
      'text/html',
    );
    expect(document.querySelectorAll('article')).toHaveLength(0);
    expect([...document.querySelectorAll('h2')].map((node) => node.textContent)).toEqual([
      '入門',
      '基礎',
      '実践',
      '振り返り',
      '本番準備',
    ]);
    for (const chapter of REFERENCE_DATA) {
      expect(document.querySelector(`a[href="/reference/${chapter.id}"]`)).not.toBeNull();
      for (const goal of chapter.learningGoals) {
        expect(document.body.textContent).toContain(goal);
      }
    }
  });

  it('本文が広告掲載の内部基準に満たない章では広告枠を出さない', () => {
    for (const chapter of REFERENCE_DATA) {
      const expected = countChapterChars(chapter) >= MIN_BODY_CHAR_COUNT;
      expect(
        shouldShowAds({ kind: 'reference-chapter', bodyCharCount: countChapterChars(chapter) }),
      ).toBe(expected);
    }
  });
});
