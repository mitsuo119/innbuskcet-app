import { describe, expect, it } from 'vitest';
import casesData from './cases.json';

type Difficulty = '初級' | '中級' | '上級';

interface Pbi071Case {
  id: string;
  difficulty?: Difficulty;
  theme?: string;
}

function getPbi071AddedCases(): Pbi071Case[] {
  return (casesData as Pbi071Case[]).filter((c) => {
    const no = Number.parseInt(c.id.replace('case-', ''), 10);
    return Number.isFinite(no) && no >= 41 && no <= 70;
  });
}

describe('PBI-071 追加30件の受入基準チェック', () => {
  it('case-041〜case-070 が30件存在し、id重複がない', () => {
    const added = getPbi071AddedCases();
    expect(added).toHaveLength(30);

    const idSet = new Set(added.map((c) => c.id));
    expect(idSet.size).toBe(30);
  });

  it('難易度分布: 初級/中級/上級が各20%以上かつ単一難易度50%以下', () => {
    const added = getPbi071AddedCases();
    const total = added.length;

    const counts: Record<Difficulty, number> = {
      初級: 0,
      中級: 0,
      上級: 0,
    };

    for (const c of added) {
      expect(c.difficulty).toBeTruthy();
      expect(['初級', '中級', '上級']).toContain(c.difficulty);
      counts[c.difficulty as Difficulty] += 1;
    }

    const ratios = Object.values(counts).map((count) => count / total);
    for (const ratio of ratios) {
      expect(ratio).toBeGreaterThanOrEqual(0.2);
      expect(ratio).toBeLessThanOrEqual(0.5);
    }
  });

  it('テーマ分布: 上位1テーマが40%以下', () => {
    const added = getPbi071AddedCases();
    const total = added.length;
    const themeCounts = new Map<string, number>();

    for (const c of added) {
      expect(c.theme).toBeTruthy();
      const t = c.theme as string;
      themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1);
    }

    const maxCount = Math.max(...themeCounts.values());
    expect(maxCount / total).toBeLessThanOrEqual(0.4);
  });
});
