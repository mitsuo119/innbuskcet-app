import { describe, expect, it } from 'vitest';
import { ACTION_KEYWORDS, REASON_KEYWORDS, countKeywordMatches } from './feedbackKeywords';

describe('feedbackKeywords（PBI-029 / TASK-008）', () => {
  describe('辞書定義', () => {
    it('REASON_KEYWORDS は 5W1H / 優先度 / 論理 の 3 観点を持つ', () => {
      expect(Object.keys(REASON_KEYWORDS).sort()).toEqual(['5W1H', '優先度', '論理'].sort());
      expect(REASON_KEYWORDS['5W1H']).toContain('なぜ');
      expect(REASON_KEYWORDS['優先度']).toContain('期限');
      expect(REASON_KEYWORDS['論理']).toContain('なぜなら');
    });

    it('ACTION_KEYWORDS は 委任 / フォロー / 具体性 の 3 観点を持つ', () => {
      expect(Object.keys(ACTION_KEYWORDS).sort()).toEqual(['委任', 'フォロー', '具体性'].sort());
      expect(ACTION_KEYWORDS['委任']).toContain('依頼');
      expect(ACTION_KEYWORDS['フォロー']).toContain('確認');
      expect(ACTION_KEYWORDS['具体性']).toContain('本日中');
    });
  });

  describe('countKeywordMatches', () => {
    it('単純一致を 1 とカウントする', () => {
      expect(countKeywordMatches('期限が迫っている', ['期限'])).toBe(1);
    });

    it('複数キーワードの合計を返す', () => {
      // '緊急' x1 + '重要' x1 + '期限' x1 = 3
      const text = '緊急かつ重要であり、期限が今週中に迫る案件である';
      expect(countKeywordMatches(text, REASON_KEYWORDS['優先度'] as string[])).toBe(3);
    });

    it('同一キーワードの複数回出現を加算する', () => {
      expect(countKeywordMatches('確認して、もう一度確認する', ['確認'])).toBe(2);
    });

    it('空文字 / 空配列 / 空キーワードはすべて 0 を返す（DoD §10-1）', () => {
      expect(countKeywordMatches('', ['期限'])).toBe(0);
      expect(countKeywordMatches('期限', [])).toBe(0);
      expect(countKeywordMatches('期限', [''])).toBe(0);
    });

    it('該当しないテキストは 0 を返す', () => {
      expect(countKeywordMatches('週末は読書をしました', REASON_KEYWORDS['5W1H'] as string[])).toBe(
        0,
      );
    });

    it('部分一致でカウントする（"いつまでに" 内の "いつ" を 1 件として数える）', () => {
      expect(countKeywordMatches('いつまでに完了させるかを決める', ['いつ'])).toBe(1);
    });
  });
});
