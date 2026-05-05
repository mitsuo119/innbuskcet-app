import { describe, it, expect } from 'vitest';
import {
  aggregateSelfScores,
  findWeakestAxis,
  clampSelfScore,
  createDefaultSelfScoreEntry,
  SELF_SCORE_AXES,
  type SelfScoreEntry,
} from './selfScore';

describe('createDefaultSelfScoreEntry', () => {
  it('全軸がスコア3の初期エントリを返す', () => {
    const entry = createDefaultSelfScoreEntry();
    for (const axis of SELF_SCORE_AXES) {
      expect(entry[axis]).toBe(3);
    }
  });

  it('呼び出しごとに独立したオブジェクトを返す（参照が異なる）', () => {
    const a = createDefaultSelfScoreEntry();
    const b = createDefaultSelfScoreEntry();
    expect(a).not.toBe(b);
  });
});

describe('aggregateSelfScores', () => {
  it('空配列の場合は null を返す', () => {
    expect(aggregateSelfScores([])).toBeNull();
  });

  it('1件のエントリの場合はそのスコアをそのまま返す', () => {
    const entry: SelfScoreEntry = {
      problemDiscovery: 4,
      analysis: 3,
      decisionMaking: 5,
      insight: 2,
      orgUtilization: 3,
      humanSkill: 1,
    };
    const result = aggregateSelfScores([entry]);
    expect(result).not.toBeNull();
    expect(result!.problemDiscovery).toBe(4);
    expect(result!.analysis).toBe(3);
    expect(result!.decisionMaking).toBe(5);
    expect(result!.insight).toBe(2);
    expect(result!.orgUtilization).toBe(3);
    expect(result!.humanSkill).toBe(1);
  });

  it('2件の平均を正しく計算する', () => {
    const entry1: SelfScoreEntry = {
      problemDiscovery: 2,
      analysis: 4,
      decisionMaking: 2,
      insight: 4,
      orgUtilization: 2,
      humanSkill: 4,
    };
    const entry2: SelfScoreEntry = {
      problemDiscovery: 4,
      analysis: 2,
      decisionMaking: 4,
      insight: 2,
      orgUtilization: 4,
      humanSkill: 2,
    };
    const result = aggregateSelfScores([entry1, entry2]);
    expect(result).not.toBeNull();
    for (const axis of SELF_SCORE_AXES) {
      expect(result![axis]).toBe(3);
    }
  });

  it('小数点の平均も正確に計算する', () => {
    const entry1: SelfScoreEntry = {
      problemDiscovery: 1,
      analysis: 1,
      decisionMaking: 1,
      insight: 1,
      orgUtilization: 1,
      humanSkill: 1,
    };
    const entry2: SelfScoreEntry = {
      problemDiscovery: 2,
      analysis: 2,
      decisionMaking: 2,
      insight: 2,
      orgUtilization: 2,
      humanSkill: 2,
    };
    const result = aggregateSelfScores([entry1, entry2]);
    expect(result).not.toBeNull();
    expect(result!.problemDiscovery).toBe(1.5);
  });

  it('入力配列を変更しない（イミュータブル）', () => {
    const entries: SelfScoreEntry[] = [
      createDefaultSelfScoreEntry(),
      createDefaultSelfScoreEntry(),
    ];
    const original = [...entries];
    aggregateSelfScores(entries);
    expect(entries).toEqual(original);
  });
});

describe('findWeakestAxis', () => {
  it('最も低いスコアの軸を返す', () => {
    const averages = {
      problemDiscovery: 3,
      analysis: 4,
      decisionMaking: 5,
      insight: 2,
      orgUtilization: 3,
      humanSkill: 4,
    };
    expect(findWeakestAxis(averages)).toBe('insight');
  });

  it('同率の場合はSELF_SCORE_AXES配列の先頭側を返す', () => {
    const averages = {
      problemDiscovery: 2,
      analysis: 2,
      decisionMaking: 3,
      insight: 4,
      orgUtilization: 5,
      humanSkill: 3,
    };
    // problemDiscovery と analysis が同率2 → 先頭の problemDiscovery を返す
    expect(findWeakestAxis(averages)).toBe('problemDiscovery');
  });

  it('全軸が最大値(5)のとき最初の軸を返す', () => {
    const averages = {
      problemDiscovery: 5,
      analysis: 5,
      decisionMaking: 5,
      insight: 5,
      orgUtilization: 5,
      humanSkill: 5,
    };
    expect(findWeakestAxis(averages)).toBe('problemDiscovery');
  });

  it('humanSkillが最低のとき正しく特定する', () => {
    const averages = {
      problemDiscovery: 4,
      analysis: 4,
      decisionMaking: 4,
      insight: 4,
      orgUtilization: 4,
      humanSkill: 1,
    };
    expect(findWeakestAxis(averages)).toBe('humanSkill');
  });
});

describe('clampSelfScore', () => {
  it('1〜5の範囲内の値はそのまま返す', () => {
    expect(clampSelfScore(1)).toBe(1);
    expect(clampSelfScore(3)).toBe(3);
    expect(clampSelfScore(5)).toBe(5);
  });

  it('0以下は1に丸める（境界値）', () => {
    expect(clampSelfScore(0)).toBe(1);
    expect(clampSelfScore(-10)).toBe(1);
  });

  it('6以上は5に丸める（境界値）', () => {
    expect(clampSelfScore(6)).toBe(5);
    expect(clampSelfScore(100)).toBe(5);
  });

  it('小数は四捨五入する', () => {
    expect(clampSelfScore(2.4)).toBe(2);
    expect(clampSelfScore(2.5)).toBe(3);
  });
});
