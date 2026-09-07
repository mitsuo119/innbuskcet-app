/**
 * 広告配置ポリシー（adPolicy.ts）の真値表検証（PBI-100 / TASK-100-2）。
 */
import { describe, expect, it } from 'vitest';
import { shouldShowAds, type AdPageKind } from './adPolicy';

describe('shouldShowAds（PBI-100 / Sprint026 DAY4）', () => {
  describe('SHOWABLE_KINDS（home / reference-chapter / case-detail / pattern-detail）', () => {
    const kinds: AdPageKind[] = ['home', 'reference-chapter', 'case-detail', 'pattern-detail'];
    for (const kind of kinds) {
      it(`${kind}: bodyCharCount 省略 → true`, () => {
        expect(shouldShowAds({ kind })).toBe(true);
      });
      it(`${kind}: bodyCharCount=1000 → true（内部基準の境界値）`, () => {
        expect(shouldShowAds({ kind, bodyCharCount: 1000 })).toBe(true);
      });
      it(`${kind}: bodyCharCount=999 → false（本文欠落検知）`, () => {
        expect(shouldShowAds({ kind, bodyCharCount: 999 })).toBe(false);
      });
      it(`${kind}: bodyCharCount=2000 → true`, () => {
        expect(shouldShowAds({ kind, bodyCharCount: 2000 })).toBe(true);
      });
    }
  });

  describe('NON_SHOWABLE_KINDS（一覧 / 法務 / 検索 / 404 / エラー）', () => {
    const kinds: AdPageKind[] = [
      'reference-list',
      'pattern-list',
      'legal',
      'search',
      'not-found',
      'error',
    ];
    for (const kind of kinds) {
      it(`${kind}: bodyCharCount 省略 → false`, () => {
        expect(shouldShowAds({ kind })).toBe(false);
      });
      it(`${kind}: bodyCharCount=5000 でも false（C2/C5/種別違反）`, () => {
        expect(shouldShowAds({ kind, bodyCharCount: 5000 })).toBe(false);
      });
    }
  });

  it.each([NaN, Infinity, -Infinity])('不正な文字数 %s は広告を許可しない', (bodyCharCount) => {
    expect(shouldShowAds({ kind: 'home', bodyCharCount })).toBe(false);
  });
});
