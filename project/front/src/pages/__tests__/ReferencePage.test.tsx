import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ReferencePage } from '../ReferencePage';

const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'ReferencePage.tsx');
const source = readFileSync(sourcePath, 'utf-8');

describe('PBI-056 解説リファレンス画面', () => {
  it('chapter01 / chapter02 / chapter05 / chapter08 の主要見出しと導線を表示する', () => {
    const html = renderToStaticMarkup(<ReferencePage onBack={vi.fn()} />);

    expect(html).toContain('解説リファレンス');
    expect(html).toContain('chapter01 / chapter02 / chapter05 / chapter08 解説リファレンス');
    expect(html).toContain('インバスケットとは何か');
    expect(html).toContain('採点基準を逆算する');
    expect(html).toContain('優先順位づけの技術');
    expect(html).toContain('案件パターン別攻略');
    expect(html).toContain('href="#/reference/chapter01"');
    expect(html).toContain('href="#/reference/chapter02"');
    expect(html).toContain('href="#/reference/chapter05"');
    expect(html).toContain('href="#/reference/chapter08"');
  });

  it('テーブル・箇条書き・補足メモ・参照導線を安全にレンダリングする', () => {
    const html = renderToStaticMarkup(
      <ReferencePage onBack={vi.fn()} focusChapterId="chapter08" />,
    );

    expect(html).toContain('<table');
    expect(html).toContain('緊急度×重要度マトリクス');
    expect(html).toContain('30秒優先度チェック');
    expect(html).toContain('代表パターン分類（要点）');
    expect(html).toContain('href="#/patterns"');
    expect(html).toContain('href="#/patterns/14"');
    expect(html).toContain('aria-current="page"');
  });

  it('dangerouslySetInnerHTML を使わず、React の通常レンダリングのみで構成している', () => {
    expect(source).not.toContain('dangerouslySetInnerHTML');
  });
});
