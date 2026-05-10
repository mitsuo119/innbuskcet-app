import { describe, expect, it } from 'vitest';
import casesData from './cases.json';

type Difficulty = '初級' | '中級' | '上級';

interface Pbi073Case {
  id: string;
  difficulty?: Difficulty;
  theme?: string;
  explanation: string;
  characters?: string[];
  departments?: string[];
}

/**
 * PBI-073: 案件数 50 件超への拡充（Sprint023 / TASK-073-1 方針転換版）。
 *
 * 「総 50 件以上」は既達 (70 件) のため、本スプリントでは新規追加ではなく
 * 既存 70 件全件への difficulty / theme 整備を完走する設計に振り替えた
 * （PO 鈴木 OK / Sprint023 sprint_backlog.md TASK-073-1 完了報告参照）。
 *
 * 受入基準対応:
 * - 総数 50 件以上: 70 件存在で達成
 * - 難易度分布が初級／中級／上級で偏りなく分布: max-min ≤ 5 ポイント
 * - 必須項目欠落 0 件: 全件 difficulty / theme が非空文字列
 * - スキーマ検証: loader.ts は difficulty / theme を未認識でも optional として読み飛ばすため退行なし
 */
describe('PBI-073 全 70 件の難易度均等化', () => {
  const all = casesData as readonly Pbi073Case[];

  it('総ケース数が 50 件以上である（受入基準: 50 件超）', () => {
    expect(all.length).toBeGreaterThanOrEqual(50);
    // Sprint023 時点では 70 件で固定
    expect(all.length).toBe(70);
  });

  it('全件で difficulty / theme が非空文字列である（必須項目欠落 0 件）', () => {
    const missingDifficulty = all.filter(
      (c) => !c.difficulty || !['初級', '中級', '上級'].includes(c.difficulty),
    );
    const missingTheme = all.filter((c) => !c.theme || c.theme.length === 0);
    expect(missingDifficulty).toEqual([]);
    expect(missingTheme).toEqual([]);
  });

  it('難易度分布が初級／中級／上級で 5 ポイント以内に収まる（均等分布）', () => {
    const counts: Record<Difficulty, number> = { 初級: 0, 中級: 0, 上級: 0 };
    for (const c of all) counts[c.difficulty as Difficulty] += 1;
    const values = Object.values(counts);
    const range = Math.max(...values) - Math.min(...values);
    expect(range).toBeLessThanOrEqual(5);
    // 各難易度が 1 件以上存在
    for (const v of values) expect(v).toBeGreaterThan(0);
  });

  it('テーマ分布で上位 1 テーマが全体の 40% 以下に収まる', () => {
    const themeCounts = new Map<string, number>();
    for (const c of all) {
      const t = c.theme as string;
      themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1);
    }
    const max = Math.max(...themeCounts.values());
    expect(max / all.length).toBeLessThanOrEqual(0.4);
  });

  it('id が一意で case-001..case-070 の通番である', () => {
    const ids = all.map((c) => c.id);
    expect(new Set(ids).size).toBe(all.length);
    for (let i = 0; i < all.length; i += 1) {
      expect(all[i].id).toBe(`case-${String(i + 1).padStart(3, '0')}`);
    }
  });
});
