/**
 * 3 ブロック記述（判断・理由・アクション）ドメイン関数（PBI-023 / TASK-001）。
 *
 * - DoD §10-1: ユーザ入力に対し最大長（500 文字）・型・必須/任意の妥当性検証を提供する。
 * - 各フィールドは「任意（空も許容）」だが、入力時は最大長を超えないこと。
 * - 純粋関数のみで構成し、UI 層から独立して単体テスト可能とする。
 */

/** 1 ケース分の記述回答（判断 / 理由 / アクション） */
export interface WritingEntry {
  /** 判断（最大 {@link WRITING_MAX_LENGTH} 文字） */
  judgment: string;
  /** 理由（最大 {@link WRITING_MAX_LENGTH} 文字） */
  reason: string;
  /** アクション（最大 {@link WRITING_MAX_LENGTH} 文字） */
  action: string;
}

/** 各フィールドの最大文字数（DoD §10-1） */
export const WRITING_MAX_LENGTH = 500;

/** WritingEntry のフィールド一覧（順序は UI の表示順と一致） */
export const WRITING_FIELDS: readonly (keyof WritingEntry)[] = [
  'judgment',
  'reason',
  'action',
] as const;

/** 妥当性検証の結果（フィールドごとに最大長以内なら true） */
export type WritingValidation = Record<keyof WritingEntry, boolean>;

/**
 * 各フィールドが最大長以内かを検証する。
 * - string でない（型が壊れた）場合も false 扱い。
 * - 空文字は true（任意項目のため許容）。
 */
export function validateWritingEntry(entry: WritingEntry): WritingValidation {
  const result = {} as WritingValidation;
  for (const field of WRITING_FIELDS) {
    const value = entry[field];
    result[field] = typeof value === 'string' && value.length <= WRITING_MAX_LENGTH;
  }
  return result;
}

/** 全フィールドが空（length === 0）であれば true */
export function isWritingEntryEmpty(entry: WritingEntry): boolean {
  return WRITING_FIELDS.every((field) => entry[field].length === 0);
}

/** 少なくとも 1 フィールドが入力済み（非空）であれば true */
export function isWritingEntryPartiallyFilled(entry: WritingEntry): boolean {
  return WRITING_FIELDS.some((field) => entry[field].length > 0);
}

/** 全フィールド空の WritingEntry を生成 */
export function createEmptyWritingEntry(): WritingEntry {
  return { judgment: '', reason: '', action: '' };
}
