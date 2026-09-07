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

  it('振り返りの観点は実際の採点者や配点を断定しない', () => {
    for (const pattern of PATTERN_DATA) {
      expect(findPatternDeepDive(pattern.id)!.evaluatorView).not.toMatch(
        /採点者|加点|減点|満点|高評価/,
      );
    }
  });

  it('回答例は調査未了の確約や休暇中の報告を要求しない', () => {
    expect(findPatternDeepDive(1)!.answerExample).toContain('次回の経過報告時刻');
    expect(findPatternDeepDive(7)!.answerExample).toContain('休暇中の定例報告は不要');
    expect(findPatternDeepDive(8)!.answerExample).toContain('匿名性を完全には保証できない');
  });
});

describe('代表ケース深掘り解説', () => {
  it('重大な不具合は未確認事項と安全を確認し、解決日ではなく経過報告を約束する', () => {
    const detail = findCaseDeepDive('case-001')!;
    expect(detail.situationAnalysis).toContain('未確認');
    expect(detail.priorityRationale).toContain('安全');
    expect(detail.answerExample).toContain('次回の経過報告時刻');
    expect(detail.answerExample).not.toContain('正式回答は明後日中');
    expect(detail.situationAnalysis).not.toContain('不具合の内容そのものではなく');
  });

  it('匿名相談は守秘の限界と共有範囲を説明し、結論を断定しない', () => {
    const detail = findCaseDeepDive('case-004')!;
    expect(detail.answerExample).toContain('匿名性を完全には保証できない');
    expect(detail.answerExample).toContain('誰に何を共有してよいか');
    expect(detail.priorityRationale).not.toContain('唯一の正解');
  });

  it('休暇の引き継ぎは勤務時間内に終え、休暇当日の報告を求めない', () => {
    const detail = findCaseDeepDive('case-019')!;
    expect(detail.answerExample).toContain('休暇前の勤務時間内');
    expect(detail.answerExample).toContain('休暇中の定例報告は不要');
    expect(detail.answerExample).not.toContain('当日朝に引き継ぎ状況を本人から一報');
  });

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
