import { describe, expect, it } from 'vitest';
import { resolveShortcut } from './shortcut';

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
