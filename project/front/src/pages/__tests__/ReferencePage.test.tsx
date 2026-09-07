import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ReferencePage } from '../ReferencePage';
import scoringGuide from '../../data/scoringGuide.json';
import { REFERENCE_DATA } from '../../data/referenceData';
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
    expect(html).toContain('採点基準を逆算する');
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

  describe('PBI-062 章間導線（前/次/一覧へ戻る）', () => {
    it('全ての章に「前の章」「章一覧へ戻る」「次の章」の3導線が描画される', () => {
      const html = renderToStaticMarkup(<ReferencePage />);
      // 4章 × 3導線 = 12 件のページャーリンクが存在する
      const pagerCount = (html.match(/reference-page__pager-link/g) ?? []).length;
      expect(pagerCount).toBeGreaterThanOrEqual(12);
      // 章一覧へ戻るアンカー先が存在する
      expect(html).toContain('id="reference-chapter-nav"');
      expect(html).toContain('href="#reference-chapter-nav"');
    });

    it('先頭章（chapter01）の前の章は aria-disabled、末尾章（chapter12）の次の章は aria-disabled', () => {
      const html = renderToStaticMarkup(<ReferencePage />);

      // chapter01 セクションを取り出す
      const ch01Start = html.indexOf('id="reference-chapter01"');
      const ch01End = html.indexOf('id="reference-chapter02"');
      const ch01Block = html.slice(ch01Start, ch01End);
      // 先頭章: prev は disabled で aria-disabled が付与され、次の章リンクは chapter02
      expect(ch01Block).toMatch(
        /reference-page__pager-link--prev[^"]*reference-page__pager-link--disabled/,
      );
      expect(ch01Block).toContain('aria-disabled="true"');
      expect(ch01Block).toContain('（最初の章です）');
      expect(ch01Block).toContain('href="/reference/chapter02"');

      // chapter12 セクション（末尾章 / PBI-083 全12章展開後）
      const ch12Start = html.indexOf('id="reference-chapter12"');
      const ch12Block = html.slice(ch12Start);
      expect(ch12Block).toMatch(
        /reference-page__pager-link--next[^"]*reference-page__pager-link--disabled/,
      );
      expect(ch12Block).toContain('（最後の章です）');
      // 直前章 chapter11 へのリンクが存在する
      expect(ch12Block).toContain('href="/reference/chapter11"');
    });

    it('章スキップナビは番号バッジ＋章タイトルを表示する', () => {
      const html = renderToStaticMarkup(<ReferencePage />);
      expect(html).toContain('reference-page__chapter-link-index');
      expect(html).toContain('第1章');
      expect(html).toContain('第4章');
    });

    it('章ナビゲーションに aria-label が付与され、章ヘッダの位置情報が aria-hidden で補助に出ない', () => {
      const html = renderToStaticMarkup(<ReferencePage />);
      expect(html).toContain('aria-label="章スキップ"');
      expect(html).toMatch(/aria-label="[^"]*章間ナビゲーション"/);
      // 位置情報（第N章 / 全X章）は装飾扱いで aria-hidden
      expect(html).toMatch(/reference-page__chapter-position[^>]*aria-hidden="true"/);
    });

    it('スタイルは ReferencePage.css に集約されており TSX に inline style が無い', () => {
      // TASK-203 の局所化方針: コンポーネント側に style= 属性を持たせない
      expect(source).not.toMatch(/\sstyle=\{/);
    });
  });

  describe('PBI-083 全12章への章末ナビ展開', () => {
    it('全 12 章が描画され、章ごとに3導線（前/一覧/次）が確実に存在する', () => {
      const html = renderToStaticMarkup(<ReferencePage />);
      // 12 章 × 3 導線 = 36 件のページャーリンクが期待値
      const pagerCount = (html.match(/reference-page__pager-link/g) ?? []).length;
      expect(pagerCount).toBeGreaterThanOrEqual(36);

      const ids = [
        'chapter01',
        'chapter02',
        'chapter03',
        'chapter04',
        'chapter05',
        'chapter06',
        'chapter07',
        'chapter08',
        'chapter09',
        'chapter10',
        'chapter11',
        'chapter12',
      ] as const;
      for (const id of ids) {
        expect(html).toContain(`id="reference-${id}"`);
      }
    });

    it('chapter03〜chapter11 の中間章には disabled なページャーが現れず、前後章リンクが正しく配置される', () => {
      const html = renderToStaticMarkup(<ReferencePage />);
      const middle = [
        { id: 'chapter03', prev: 'chapter02', next: 'chapter04' },
        { id: 'chapter04', prev: 'chapter03', next: 'chapter05' },
        { id: 'chapter05', prev: 'chapter04', next: 'chapter06' },
        { id: 'chapter06', prev: 'chapter05', next: 'chapter07' },
        { id: 'chapter07', prev: 'chapter06', next: 'chapter08' },
        { id: 'chapter08', prev: 'chapter07', next: 'chapter09' },
        { id: 'chapter09', prev: 'chapter08', next: 'chapter10' },
        { id: 'chapter10', prev: 'chapter09', next: 'chapter11' },
        { id: 'chapter11', prev: 'chapter10', next: 'chapter12' },
      ] as const;

      for (const m of middle) {
        const start = html.indexOf(`id="reference-${m.id}"`);
        const nextIdx = html.indexOf(`id="reference-${m.next}"`);
        const block = html.slice(start, nextIdx);
        // 各中間章の章末ナビ内に prev/next の双方リンクが存在
        expect(block).toContain(`href="/reference/${m.prev}"`);
        expect(block).toContain(`href="/reference/${m.next}"`);
        // 中間章は disabled が付与されない（章末ナビ内の Pager で）
        const pagerSection = block.slice(block.lastIndexOf('reference-page__pager'));
        expect(pagerSection).not.toContain('reference-page__pager-link--disabled');
      }
    });

    it('末尾章 chapter12 の next は aria-disabled で「（最後の章です）」が表示される', () => {
      const html = renderToStaticMarkup(<ReferencePage />);
      const start = html.indexOf('id="reference-chapter12"');
      const block = html.slice(start);
      expect(block).toMatch(
        /reference-page__pager-link--next[^"]*reference-page__pager-link--disabled/,
      );
      expect(block).toContain('aria-disabled="true"');
      expect(block).toContain('（最後の章です）');
      // 直前章 chapter11 への prev リンクが存在
      expect(block).toContain('href="/reference/chapter11"');
    });

    it('全 12 章で関連案件パターン（/patterns/:id）への内部リンクが章本文末尾に1件以上存在する', () => {
      const html = renderToStaticMarkup(<ReferencePage />);
      const ids = [
        'chapter01',
        'chapter02',
        'chapter03',
        'chapter04',
        'chapter05',
        'chapter06',
        'chapter07',
        'chapter08',
        'chapter09',
        'chapter10',
        'chapter11',
        'chapter12',
      ] as const;
      // 各章の <article> 範囲（次の章の article 開始まで、最後の章は末尾まで）に
      // /patterns/:id への内部リンクが少なくとも1件出現する
      for (let i = 0; i < ids.length; i++) {
        const start = html.indexOf(`id="reference-${ids[i]}"`);
        const end = i < ids.length - 1 ? html.indexOf(`id="reference-${ids[i + 1]}"`) : html.length;
        const block = html.slice(start, end);
        // 章末ナビ（pager）より前の本文末尾セクションに /patterns/:id があること
        const pagerStart = block.indexOf('reference-page__chapter-pager');
        const beforePager = pagerStart >= 0 ? block.slice(0, pagerStart) : block;
        expect(beforePager).toMatch(/href="\/patterns\/\d+"/);
      }
    });
  });
});
