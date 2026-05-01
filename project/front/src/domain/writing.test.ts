import { describe, expect, it } from 'vitest';
import {
  WRITING_FIELDS,
  WRITING_MAX_LENGTH,
  createEmptyWritingEntry,
  isWritingEntryEmpty,
  isWritingEntryPartiallyFilled,
  validateWritingEntry,
  type WritingEntry,
} from './writing';

const entry = (overrides: Partial<WritingEntry> = {}): WritingEntry => ({
  ...createEmptyWritingEntry(),
  ...overrides,
});

describe('WRITING_MAX_LENGTH / WRITING_FIELDS（PBI-023 / TASK-001）', () => {
  it('最大長は 500 である（DoD §10-1）', () => {
    expect(WRITING_MAX_LENGTH).toBe(500);
  });

  it('フィールドは judgment / reason / action の 3 つ（順序固定）', () => {
    expect(WRITING_FIELDS).toEqual(['judgment', 'reason', 'action']);
  });
});

describe('createEmptyWritingEntry()', () => {
  it('全フィールドが空文字の WritingEntry を返す', () => {
    expect(createEmptyWritingEntry()).toEqual({ judgment: '', reason: '', action: '' });
  });
});

describe('validateWritingEntry()（DoD §10-1 境界値）', () => {
  it('全フィールド空は true（任意項目のため許容）', () => {
    expect(validateWritingEntry(entry())).toEqual({
      judgment: true,
      reason: true,
      action: true,
    });
  });

  it('499 文字は OK（境界値: max - 1）', () => {
    const v = 'a'.repeat(WRITING_MAX_LENGTH - 1);
    const result = validateWritingEntry(entry({ judgment: v, reason: v, action: v }));
    expect(result).toEqual({ judgment: true, reason: true, action: true });
  });

  it('500 文字は OK（境界値: max ぴったり）', () => {
    const v = 'a'.repeat(WRITING_MAX_LENGTH);
    const result = validateWritingEntry(entry({ judgment: v, reason: v, action: v }));
    expect(result).toEqual({ judgment: true, reason: true, action: true });
  });

  it('501 文字は NG（境界値: max + 1）', () => {
    const v = 'a'.repeat(WRITING_MAX_LENGTH + 1);
    const result = validateWritingEntry(entry({ judgment: v, reason: v, action: v }));
    expect(result).toEqual({ judgment: false, reason: false, action: false });
  });

  it('フィールドごとに独立して判定される（一部超過のみ NG）', () => {
    const result = validateWritingEntry(
      entry({
        judgment: 'a'.repeat(WRITING_MAX_LENGTH),
        reason: 'a'.repeat(WRITING_MAX_LENGTH + 1),
        action: 'ok',
      }),
    );
    expect(result).toEqual({ judgment: true, reason: false, action: true });
  });

  it('string 以外（型破壊）は false 扱い', () => {
    const broken = { judgment: 'ok', reason: 123 as unknown as string, action: '' };
    expect(validateWritingEntry(broken as WritingEntry)).toEqual({
      judgment: true,
      reason: false,
      action: true,
    });
  });
});

describe('isWritingEntryEmpty() / isWritingEntryPartiallyFilled()', () => {
  it('全空は empty=true / partiallyFilled=false', () => {
    const e = entry();
    expect(isWritingEntryEmpty(e)).toBe(true);
    expect(isWritingEntryPartiallyFilled(e)).toBe(false);
  });

  it('1 フィールドのみ入力で empty=false / partiallyFilled=true', () => {
    const e = entry({ reason: 'なぜなら…' });
    expect(isWritingEntryEmpty(e)).toBe(false);
    expect(isWritingEntryPartiallyFilled(e)).toBe(true);
  });

  it('全フィールド入力でも partiallyFilled=true（少なくとも 1 件の意味）', () => {
    const e = entry({ judgment: 'A', reason: 'B', action: 'C' });
    expect(isWritingEntryEmpty(e)).toBe(false);
    expect(isWritingEntryPartiallyFilled(e)).toBe(true);
  });
});
