import type { Priority } from './case';

export type ShortcutAction =
  | { type: 'answer'; priority: Priority }
  | { type: 'next' }
  | { type: 'ignore' };

interface ShortcutContext {
  /** 回答確定済み（解説表示中）かどうか */
  locked: boolean;
  /** 出題中の案件があるか */
  hasCurrent: boolean;
  /** 入力欄等にフォーカス中か（誤発火抑制） */
  isEditable: boolean;
  /** 修飾キー（Ctrl/Meta/Alt）が押されているか */
  hasModifier: boolean;
}

/**
 * キーボードショートカットの解釈（純粋関数）。
 * - A/B/C: 未回答状態かつ案件あり → answer 確定
 * - Enter: 回答確定済み → 次の問題
 * - 入力欄フォーカス中・修飾キー併用は ignore
 */
export function resolveShortcut(key: string, ctx: ShortcutContext): ShortcutAction {
  if (ctx.hasModifier || ctx.isEditable) return { type: 'ignore' };
  const k = key.toLowerCase();
  if (k === 'a' || k === 'b' || k === 'c') {
    if (ctx.locked || !ctx.hasCurrent) return { type: 'ignore' };
    return { type: 'answer', priority: k.toUpperCase() as Priority };
  }
  if (key === 'Enter') {
    if (!ctx.locked) return { type: 'ignore' };
    return { type: 'next' };
  }
  return { type: 'ignore' };
}
