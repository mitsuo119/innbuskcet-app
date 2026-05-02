import { describe, expect, it } from 'vitest';
import {
  evaluateAction,
  evaluateJudgment,
  evaluateReason,
  evaluateWriting,
} from './feedback';
import type { WritingEntry } from './writing';

describe('evaluateJudgment', () => {
  it('A 一致は ◎', () => {
    const r = evaluateJudgment('Aランクとして即時対応', 'A');
    expect(r.score).toBe('◎');
    expect(r.category).toBe('判断');
  });

  it('B 一致は ◎', () => {
    expect(evaluateJudgment('Bランクで対応する', 'B').score).toBe('◎');
  });

  it('A↔B（1 段差）は ○', () => {
    expect(evaluateJudgment('Bランクで対応', 'A').score).toBe('○');
  });

  it('B↔C（1 段差）は ○', () => {
    expect(evaluateJudgment('Cランクで対応', 'B').score).toBe('○');
  });

  it('A↔C（2 段差）は △', () => {
    expect(evaluateJudgment('Cランクで対応', 'A').score).toBe('△');
  });

  it('判断が読み取れないときは △', () => {
    expect(evaluateJudgment('未記入です', 'A').score).toBe('△');
  });

  it('correctPriority が不正なら △', () => {
    expect(evaluateJudgment('Aランクで対応', 'X').score).toBe('△');
  });
});

describe('evaluateReason', () => {
  it('キーワード 0 件は全観点 △', () => {
    const r = evaluateReason('特に何もなし');
    expect(r).toHaveLength(3);
    expect(r.every((x) => x.score === '△')).toBe(true);
  });

  it('5W1H 観点でキーワード 3 件以上は ◎', () => {
    const r = evaluateReason('誰がいつどこで対応するかを明確にする');
    const fiveW1H = r.find((x) => x.category === '5W1H');
    expect(fiveW1H?.score).toBe('◎');
  });

  it('優先度観点でキーワード 1〜2 件は ○', () => {
    const r = evaluateReason('緊急性が高いため');
    const yusen = r.find((x) => x.category === '優先度');
    expect(yusen?.score).toBe('○');
  });

  it('空文字は全観点 △', () => {
    const r = evaluateReason('');
    expect(r.every((x) => x.score === '△')).toBe(true);
  });
});

describe('evaluateAction', () => {
  it('短文かつキーワードなしは全観点 △', () => {
    const r = evaluateAction('対応する');
    expect(r.every((x) => x.score === '△')).toBe(true);
  });

  it('80 字以上かつキーワード豊富で ◎ になる観点を含む', () => {
    const long =
      '担当者へ依頼し連絡を入れたうえで本日中に状況確認を行い、明日朝に報告する。さらに優先して関係者へ相談し追跡する体制を整え、今週中にフォロー会議を設定して進捗を共有する。';
    expect(long.length).toBeGreaterThanOrEqual(80);
    const r = evaluateAction(long);
    expect(r.some((x) => x.score === '◎')).toBe(true);
  });

  it('80 字未満でもキーワード 3 件以上で ◎', () => {
    const r = evaluateAction('依頼し相談し連絡する');
    const inin = r.find((x) => x.category === '委任');
    expect(inin?.score).toBe('◎');
  });
});

describe('evaluateWriting (統合)', () => {
  it('全項目が良好な記述は overall ◎', () => {
    const entry: WritingEntry = {
      judgment: 'Aランクとして本日中に対応する',
      reason: '誰がいつどこで対応するかを明確にし、緊急かつ重要なため最優先する',
      action:
        '担当者へ依頼し連絡を入れたうえで本日中に状況確認を行い、明日朝に報告する。優先して関係者へ相談し追跡する。',
    };
    const fb = evaluateWriting(entry, 'A');
    expect(fb.judgment.score).toBe('◎');
    expect(fb.overall).toBe('◎');
    expect(fb.reason).toHaveLength(3);
    expect(fb.action).toHaveLength(3);
  });

  it('全項目が空 / 不適切な記述は overall △', () => {
    const entry: WritingEntry = { judgment: '', reason: '', action: '' };
    const fb = evaluateWriting(entry, 'A');
    expect(fb.overall).toBe('△');
    expect(fb.judgment.score).toBe('△');
  });
});
