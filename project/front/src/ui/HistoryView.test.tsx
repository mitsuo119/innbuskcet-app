import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HistoryView } from './HistoryView';
import type { HistoryItem } from '../domain/history';
import { MAX_HISTORY, pushHistory, trimHistory } from '../domain/history';

const mk = (caseId: string, judgement: HistoryItem['judgement']): HistoryItem => ({
  caseId,
  judgement,
  correctPriority: 'A',
});

/** ○/× セルの描画件数（li.history-view__item の出現数）を数える */
const countItems = (html: string): number => {
  const m = html.match(/history-view__item /g);
  return m ? m.length : 0;
};

/** N 件の履歴を pushHistory（最大 max 件保持）で構築 */
const buildHistory = (n: number, max: number): HistoryItem[] => {
  let h: readonly HistoryItem[] = [];
  for (let i = 0; i < n; i += 1) {
    h = pushHistory(h, mk(`case-${i}`, i % 2 === 0 ? 'correct' : 'incorrect'), max);
  }
  return [...h];
};

describe('HistoryView（PBI-020 表示件数切替）', () => {
  it('maxDisplay 省略時は MAX_HISTORY (=10) を上限として描画する', () => {
    const history = buildHistory(MAX_HISTORY, MAX_HISTORY);
    const html = renderToStaticMarkup(<HistoryView history={history} />);
    expect(countItems(html)).toBe(MAX_HISTORY);
    expect(html).toContain(`直近${MAX_HISTORY}問の履歴`);
    expect(html).toContain(`aria-label="直近${MAX_HISTORY}問の正誤履歴"`);
  });

  it('maxDisplay=10 の場合、配列が10件あれば10件表示する', () => {
    // pushHistory の既定上限は 10 件のため、配列も 10 件が上限
    const history = buildHistory(15, MAX_HISTORY);
    expect(history).toHaveLength(MAX_HISTORY);
    const html = renderToStaticMarkup(<HistoryView history={history} maxDisplay={10} />);
    expect(countItems(html)).toBe(10);
  });

  it('maxDisplay=20 でも、history.ts 既定（最大10件保持）下では最大10件しか描画されない', () => {
    // pushHistory に上限 10 を渡して構築 → 配列は 10 件で頭打ち
    const history = buildHistory(15, MAX_HISTORY);
    expect(history).toHaveLength(MAX_HISTORY);
    const html = renderToStaticMarkup(<HistoryView history={history} maxDisplay={20} />);
    // 表示は配列件数まで（10件）
    expect(countItems(html)).toBe(10);
    expect(html).toContain('直近20問の履歴');
  });

  it('maxDisplay=20 かつ pushHistory(max=20) で最大20件まで保持・表示する', () => {
    const history = buildHistory(25, 20);
    expect(history).toHaveLength(20);
    const html = renderToStaticMarkup(<HistoryView history={history} maxDisplay={20} />);
    expect(countItems(html)).toBe(20);
    expect(html).toContain('直近20問の履歴');
    expect(html).toContain('aria-label="直近20問の正誤履歴"');
  });

  it('maxDisplay より履歴が多い場合、末尾（最新）優先で切り詰めて描画する', () => {
    const history = buildHistory(20, 20);
    const html = renderToStaticMarkup(<HistoryView history={history} maxDisplay={5} />);
    expect(countItems(html)).toBe(5);
    // 古い側（case-0〜case-14）は描画されないことを確認するため、
    // aria-label の問目番号（1〜5問目）のみ含まれる
    expect(html).toContain('1問目');
    expect(html).toContain('5問目');
    expect(html).not.toContain('6問目');
  });

  it('履歴 0 件の場合はガイド文を表示する', () => {
    const html = renderToStaticMarkup(<HistoryView history={[]} maxDisplay={20} />);
    expect(html).toContain('まだ履歴はありません');
    expect(countItems(html)).toBe(0);
  });

  it('aria-live="polite" を維持しスクリーンリーダ通知に対応する', () => {
    const html = renderToStaticMarkup(<HistoryView history={[]} maxDisplay={10} />);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-relevant="additions"');
  });
});

describe('HistoryView（PBI-037 学習スタイルバッジ）', () => {
  it('learningStyle="quick" の履歴に [Q] バッジが表示される', () => {
    const history: HistoryItem[] = [
      { caseId: 'c1', judgement: 'correct', correctPriority: 'A', learningStyle: 'quick' },
    ];
    const html = renderToStaticMarkup(<HistoryView history={history} />);
    expect(html).toContain('[Q]');
    expect(html).toContain('history-view__style--quick');
    expect(html).toContain(' Quickモード');
  });

  it('learningStyle="deep" の履歴に [D] バッジが表示される', () => {
    const history: HistoryItem[] = [
      { caseId: 'c1', judgement: 'incorrect', correctPriority: 'B', learningStyle: 'deep' },
    ];
    const html = renderToStaticMarkup(<HistoryView history={history} />);
    expect(html).toContain('[D]');
    expect(html).toContain('history-view__style--deep');
    expect(html).toContain(' Deepモード');
  });

  it('learningStyle 未設定の履歴にはバッジが表示されない（後方互換）', () => {
    const history: HistoryItem[] = [{ caseId: 'c1', judgement: 'correct', correctPriority: 'C' }];
    const html = renderToStaticMarkup(<HistoryView history={history} />);
    expect(html).not.toContain('[Q]');
    expect(html).not.toContain('[D]');
    expect(html).not.toContain('history-view__style');
  });
});

describe('trimHistory（PBI-020 切替時の補正）', () => {
  it('履歴件数 ≤ max のときはそのまま新配列で返す', () => {
    const h = buildHistory(5, 20);
    const trimmed = trimHistory(h, 10);
    expect(trimmed).toHaveLength(5);
    expect(trimmed).not.toBe(h);
    expect(trimmed[0].caseId).toBe('case-0');
  });

  it('20件 → max=10 で末尾10件のみ残す（新しい側を優先）', () => {
    const h = buildHistory(20, 20);
    const trimmed = trimHistory(h, 10);
    expect(trimmed).toHaveLength(10);
    expect(trimmed[0].caseId).toBe('case-10');
    expect(trimmed[9].caseId).toBe('case-19');
  });
});
