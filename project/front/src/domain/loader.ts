import casesData from '../data/cases.json';
import type { Case, Priority } from './case';

const VALID_PRIORITIES: ReadonlySet<Priority> = new Set<Priority>(['A', 'B', 'C']);

/**
 * 生JSONから Case 配列に検証付きで変換する。
 * 不正レコードはスキップせずエラーとし、データ不備に早期に気付けるようにする。
 */
export function loadCases(): Case[] {
  if (!Array.isArray(casesData)) {
    throw new Error('cases.json はトップレベルが配列である必要があります');
  }

  return casesData.map((raw, index) => {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error(`cases.json[${index}] がオブジェクトではありません`);
    }
    const c = raw as Partial<Record<keyof Case, unknown>>;

    const { id, title, body, correctPriority, explanation } = c;

    if (typeof id !== 'string' || id.length === 0) {
      throw new Error(`cases.json[${index}] の id が不正です`);
    }
    if (typeof title !== 'string' || title.length === 0) {
      throw new Error(`cases.json[${index}] の title が不正です (id=${id})`);
    }
    if (typeof body !== 'string' || body.length === 0) {
      throw new Error(`cases.json[${index}] の body が不正です (id=${id})`);
    }
    if (typeof correctPriority !== 'string' || !VALID_PRIORITIES.has(correctPriority as Priority)) {
      throw new Error(
        `cases.json[${index}] の correctPriority は A/B/C のいずれかである必要があります (id=${id})`,
      );
    }
    if (typeof explanation !== 'string' || explanation.length === 0) {
      throw new Error(`cases.json[${index}] の explanation が不正です (id=${id})`);
    }

    return {
      id,
      title,
      body,
      correctPriority: correctPriority as Priority,
      explanation,
    };
  });
}
