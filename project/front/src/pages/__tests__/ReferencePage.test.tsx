import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ReferencePage } from '../ReferencePage';

const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'ReferencePage.tsx');
const source = readFileSync(sourcePath, 'utf-8');

describe('PBI-056 解説リファレンス画面', () => {
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
    expect(html).toContain('緊急度×重要度マトリクス');
    expect(html).toContain('30秒優先度チェック');
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

    it('先頭章（chapter01）の前の章は aria-disabled、末尾章（chapter08）の次の章は aria-disabled', () => {
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

      // chapter08 セクション（末尾章）
      const ch08Start = html.indexOf('id="reference-chapter08"');
      const ch08Block = html.slice(ch08Start);
      expect(ch08Block).toMatch(
        /reference-page__pager-link--next[^"]*reference-page__pager-link--disabled/,
      );
      expect(ch08Block).toContain('（最後の章です）');
      // 直前章 chapter05 へのリンクが存在する
      expect(ch08Block).toContain('href="/reference/chapter05"');
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
});
