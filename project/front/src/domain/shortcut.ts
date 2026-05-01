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

/** ショートカット誤発火を抑止すべき編集系タグ名（大文字比較） */
const EDITABLE_TAG_NAMES: ReadonlySet<string> = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * イベントターゲットが「ユーザー入力中」と見なすべき要素か判定する。
 * - input / textarea / select は対象（PBI-023 で textarea を追加：DoD §9-1）
 * - contenteditable 領域も対象
 * - それ以外（button, div, body 等）は false
 *
 * 純粋関数として shortcut.ts に集約し、UI 層と独立にテスト可能とする。
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (EDITABLE_TAG_NAMES.has(target.tagName)) return true;
  // jsdom では HTMLElement.isContentEditable が未実装のため属性値でフォールバック判定する
  if (target.isContentEditable === true) return true;
  const attr = target.getAttribute('contenteditable');
  return attr === '' || attr === 'true' || attr === 'plaintext-only';
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
