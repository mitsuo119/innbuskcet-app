import casesData from '../data/cases.json';
import type { Case, ModelAnswer, Priority } from './case';

const VALID_PRIORITIES: ReadonlySet<Priority> = new Set<Priority>(['A', 'B', 'C']);

/**
 * raw な modelAnswer を検証して返す（DoD §10-3：受領データの整合性検証）。
 *
 * 設計方針（TASK-008 / Sprint005）:
 * - 必須キー（judgment / reason / action）が揃った非空文字列のオブジェクトでない場合は
 *   undefined を返す「フォールバック」方式で、`Case` 自体のロードは継続させる。
 * - これにより modelAnswer の段階移行（一部案件のみ整備）を妨げずに、UI 側で
 *   「模範解答準備中」プレースホルダ表示にフォールバックできる（PBI-024 / TASK-010）。
 * - 不整合は開発者向けに `console.warn` で通知し、データ不備の早期発見を支援する。
 *
 * @returns 妥当な ModelAnswer、または undefined（未指定 / 不整合）
 */
export function parseModelAnswer(
  raw: unknown,
  index?: number,
  id?: string,
): ModelAnswer | undefined {
  if (raw === undefined || raw === null) return undefined;
  const ctx =
    index !== undefined && id !== undefined ? `cases.json[${index}] (id=${id})` : 'modelAnswer';

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    console.warn(
      `${ctx}: modelAnswer はオブジェクトである必要があります（undefined にフォールバック）`,
    );
    return undefined;
  }
  const m = raw as Partial<Record<keyof ModelAnswer, unknown>>;
  const keys: (keyof ModelAnswer)[] = ['judgment', 'reason', 'action'];
  for (const key of keys) {
    const value = m[key];
    if (typeof value !== 'string' || value.length === 0) {
      console.warn(
        `${ctx}: modelAnswer.${key} は非空文字列である必要があります（undefined にフォールバック）`,
      );
      return undefined;
    }
  }
  return {
    judgment: m.judgment as string,
    reason: m.reason as string,
    action: m.action as string,
  };
}

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

    const { id, title, body, correctPriority, explanation, modelAnswer } = c;

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

    const parsedModel = parseModelAnswer(modelAnswer, index, id);

    const result: Case = {
      id,
      title,
      body,
      correctPriority: correctPriority as Priority,
      explanation,
    };
    if (parsedModel) result.modelAnswer = parsedModel;
    return result;
  });
}
