import { describe, expect, it } from 'vitest';
import { isEditableTarget, resolveShortcut } from './shortcut';

const base = { locked: false, hasCurrent: true, isEditable: false, hasModifier: false };

describe('resolveShortcut()', () => {
  it('未回答時に A/B/C で answer を返す（大文字小文字どちらも）', () => {
    expect(resolveShortcut('a', base)).toEqual({ type: 'answer', priority: 'A' });
    expect(resolveShortcut('B', base)).toEqual({ type: 'answer', priority: 'B' });
    expect(resolveShortcut('c', base)).toEqual({ type: 'answer', priority: 'C' });
  });

  it('回答済み（locked）に A/B/C は ignore', () => {
    expect(resolveShortcut('a', { ...base, locked: true })).toEqual({ type: 'ignore' });
  });

  it('回答済みに Enter で next を返す', () => {
    expect(resolveShortcut('Enter', { ...base, locked: true })).toEqual({ type: 'next' });
  });

  it('未回答時の Enter は ignore', () => {
    expect(resolveShortcut('Enter', base)).toEqual({ type: 'ignore' });
  });

  it('入力欄フォーカス中は誤発火しない', () => {
    expect(resolveShortcut('a', { ...base, isEditable: true })).toEqual({ type: 'ignore' });
    expect(resolveShortcut('Enter', { ...base, locked: true, isEditable: true })).toEqual({
      type: 'ignore',
    });
  });

  it('修飾キー併用（Ctrl/Meta/Alt）は ignore', () => {
    expect(resolveShortcut('a', { ...base, hasModifier: true })).toEqual({ type: 'ignore' });
  });

  it('案件未読込（hasCurrent=false）時の A/B/C は ignore', () => {
    expect(resolveShortcut('a', { ...base, hasCurrent: false })).toEqual({ type: 'ignore' });
  });

  it('対象外キーは ignore', () => {
    expect(resolveShortcut('d', base)).toEqual({ type: 'ignore' });
    expect(resolveShortcut(' ', base)).toEqual({ type: 'ignore' });
  });
});

describe('isEditableTarget()（PBI-023 / TASK-004：textarea ガード）', () => {
  it('textarea は編集中とみなす（DoD §10-1：3 ブロック記述 UI で誤発火を抑止）', () => {
    const el = document.createElement('textarea');
    expect(isEditableTarget(el)).toBe(true);
  });

  it('input は編集中とみなす（既存挙動）', () => {
    const el = document.createElement('input');
    expect(isEditableTarget(el)).toBe(true);
  });

  it('select は編集中とみなす（既存挙動）', () => {
    const el = document.createElement('select');
    expect(isEditableTarget(el)).toBe(true);
  });

  it('contenteditable=true の div は編集中とみなす', () => {
    const el = document.createElement('div');
    el.setAttribute('contenteditable', 'true');
    expect(isEditableTarget(el)).toBe(true);
  });

  it('button / 通常 div / null は編集中ではない', () => {
    expect(isEditableTarget(document.createElement('button'))).toBe(false);
    expect(isEditableTarget(document.createElement('div'))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });

  it('textarea にフォーカスがある状態を再現すると A/B/C ショートカットは ignore される', () => {
    const ta = document.createElement('textarea');
    const action = resolveShortcut('a', {
      ...base,
      isEditable: isEditableTarget(ta),
    });
    expect(action).toEqual({ type: 'ignore' });
  });
});
