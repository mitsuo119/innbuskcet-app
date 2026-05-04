import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ConfirmDialog } from './ConfirmDialog';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * PBI-047 / Sprint010 TASK-301・302: ConfirmDialog モバイル幅レイアウト検証 / A-56 初期フォーカス。
 *
 * - TASK-301: 375px 幅で max-width 440px パネルが収まる CSS 設定を機械検証する。
 *   モバイル幅（max-width: 480px）でボタンが 100% 幅縦並びになる @media クエリを確認。
 *   ボタンの最小タップ領域 44×44px（PBI-045 TASK-102）を CSS 文字列上で確認。
 * - TASK-302: 破壊的アクションが confirm 側のとき、初期フォーカスは安全側（cancel）に当たる
 *   （a11y_checklist §6-D 3-34 / A-56 初運用）。
 */

const stylesPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'styles.css');
const css = readFileSync(stylesPath, 'utf-8');

describe('ConfirmDialog 375px 幅レイアウト（PBI-047 / TASK-301 / PBI-045 TASK-102）', () => {
  it('confirm-dialog__panel に max-width が定義されている（375px に収まる）', () => {
    // .confirm-dialog__panel { ... max-width: 440px; ... } を検出
    const panelBlock = css.match(/\.confirm-dialog__panel\s*\{[\s\S]*?\}/);
    expect(panelBlock).not.toBeNull();
    expect(panelBlock![0]).toMatch(/max-width:\s*440px/);
    expect(panelBlock![0]).toMatch(/width:\s*100%/);
  });

  it('confirm-dialog__viewport の padding により左右 1rem の余白を確保（375px - 32px = 343px に収まる）', () => {
    const viewportBlock = css.match(/\.confirm-dialog__viewport\s*\{[\s\S]*?\}/);
    expect(viewportBlock).not.toBeNull();
    expect(viewportBlock![0]).toMatch(/padding:\s*1rem/);
  });

  it('@media (max-width: 480px) で confirm-dialog__button が縦並び 100% 幅になる', () => {
    const mediaBlock = css.match(
      /@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?\.confirm-dialog__button[\s\S]*?\}\s*\}/,
    );
    expect(mediaBlock).not.toBeNull();
    expect(mediaBlock![0]).toMatch(/flex-direction:\s*column/);
    expect(mediaBlock![0]).toMatch(/width:\s*100%/);
  });

  it('confirm-dialog__button が最小タップ領域 44×44px を満たす（PBI-045 TASK-102）', () => {
    const buttonBlock = css.match(/\.confirm-dialog__button\s*\{[\s\S]*?\}/);
    expect(buttonBlock).not.toBeNull();
    // min-height: 44px / min-width: 44px のいずれか定義されている
    expect(buttonBlock![0]).toMatch(/min-height:\s*44px/);
  });
});

describe('ConfirmDialog 初期フォーカス安全側（PBI-047 / TASK-302 / A-56）', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('破壊的アクションが confirm のとき、autoFocus はキャンセル側に当たる（§6-D 3-34）', () => {
    act(() => {
      root.render(
        <ConfirmDialog
          open
          title="Examを中断しますか？"
          description="Examを中断すると、現在の進捗は失われます。"
          actions={[
            { id: 'cancel', label: 'キャンセル', variant: 'secondary', autoFocus: true },
            { id: 'confirm', label: '中断する', variant: 'danger' },
          ]}
          onAction={() => {}}
          onClose={() => {}}
        />,
      );
    });
    const focused = document.activeElement as HTMLElement | null;
    expect(focused).not.toBeNull();
    expect(focused!.tagName).toBe('BUTTON');
    expect(focused!.getAttribute('data-action-id')).toBe('cancel');
    expect(focused!.textContent).toBe('キャンセル');
  });

  it('破壊的アクションが入力破棄のときも、初期フォーカスはキャンセル側', () => {
    act(() => {
      root.render(
        <ConfirmDialog
          open
          title="入力内容を破棄しますか？"
          description="現在の入力内容を破棄してモードを切り替えます。"
          actions={[
            { id: 'cancel', label: 'キャンセル', variant: 'secondary', autoFocus: true },
            { id: 'confirm', label: '破棄して切替', variant: 'danger' },
          ]}
          onAction={() => {}}
          onClose={() => {}}
        />,
      );
    });
    const focused = document.activeElement as HTMLElement | null;
    expect(focused?.getAttribute('data-action-id')).toBe('cancel');
  });

  it('非破壊的（primary 開始する）ダイアログは primary 側に autoFocus が当たって良い', () => {
    act(() => {
      root.render(
        <ConfirmDialog
          open
          title="Examモードを開始しますか？"
          description="20問・90分タイマーのExamが開始されます。"
          actions={[
            { id: 'cancel', label: 'キャンセル', variant: 'secondary' },
            { id: 'confirm', label: '開始する', variant: 'primary', autoFocus: true },
          ]}
          onAction={() => {}}
          onClose={() => {}}
        />,
      );
    });
    const focused = document.activeElement as HTMLElement | null;
    expect(focused?.getAttribute('data-action-id')).toBe('confirm');
  });
});
