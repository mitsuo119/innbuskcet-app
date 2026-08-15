/**
 * 深掘り解説データ（patternDeepDive.json / caseDeepDive.json）の網羅性・分量・固有性の検証。
 *
 * AdSense「有用性の低いコンテンツ」判定の再発防止として、
 * - 全 20 パターン / 代表 20 ケースに解説が存在すること
 * - 各項目が実質的な分量を持つこと
 * - ページ間で使い回しの定型文になっていないこと
 * を機械的に担保する。
 */
import { describe, expect, it } from 'vitest';
import { PATTERN_DATA } from './patternData';
import { CASE_DETAIL_META } from '../routes';
import { findCaseDeepDive, findPatternDeepDive } from './deepDive';

describe('パターン深掘り解説', () => {
  it('全 20 パターンに解説が存在する', () => {
    expect(PATTERN_DATA).toHaveLength(20);
    for (const pattern of PATTERN_DATA) {
      expect(findPatternDeepDive(pattern.id), `pattern ${pattern.id}`).toBeDefined();
    }
  });

  for (const pattern of PATTERN_DATA) {
    it(`パターン${pattern.id} の各項目が必要な分量を満たす`, () => {
      const dd = findPatternDeepDive(pattern.id)!;
      expect(dd.situation.length).toBeGreaterThanOrEqual(200);
      expect(dd.priorityRationale.length).toBeGreaterThanOrEqual(200);
      expect(dd.commonMistakes.length).toBeGreaterThanOrEqual(3);
      // C優先パターン（有給申請など）は「短く処理するのが正解」のため回答例文は短い。
      expect(dd.answerExample.length).toBeGreaterThanOrEqual(80);
      expect(dd.evaluatorView.length).toBeGreaterThanOrEqual(150);
    });
  }

  it('パターン間で解説本文が重複していない', () => {
    const texts = PATTERN_DATA.map((p) => findPatternDeepDive(p.id)!.situation);
    expect(new Set(texts).size).toBe(texts.length);
  });
});

describe('代表ケース深掘り解説', () => {
  it('代表 20 ケースに解説が存在する', () => {
    expect(CASE_DETAIL_META).toHaveLength(20);
    for (const meta of CASE_DETAIL_META) {
      expect(findCaseDeepDive(meta.id), meta.id).toBeDefined();
    }
  });

  for (const meta of CASE_DETAIL_META) {
    it(`${meta.id} の各項目が必要な分量を満たす`, () => {
      const dd = findCaseDeepDive(meta.id)!;
      expect(dd.situationAnalysis.length).toBeGreaterThanOrEqual(150);
      expect(dd.priorityRationale.length).toBeGreaterThanOrEqual(150);
      expect(dd.pitfalls.length).toBeGreaterThanOrEqual(3);
      expect(dd.answerExample.length).toBeGreaterThanOrEqual(80);
      expect(dd.followUp.length).toBeGreaterThanOrEqual(80);
    });
  }

  it('ケース間で解説本文が重複していない', () => {
    const texts = CASE_DETAIL_META.map((m) => findCaseDeepDive(m.id)!.situationAnalysis);
    expect(new Set(texts).size).toBe(texts.length);
  });
});
