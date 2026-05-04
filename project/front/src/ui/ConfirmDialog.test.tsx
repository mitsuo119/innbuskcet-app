import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ConfirmDialog } from './ConfirmDialog';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('ConfirmDialog（PBI-038）', () => {
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

  function renderDialog(onAction = vi.fn(), onClose = vi.fn()) {
    act(() => {
      root.render(
        <ConfirmDialog
          open
          title="確認"
          description="この操作を実行しますか"
          actions={[
            { id: 'cancel', label: 'キャンセル' },
            { id: 'confirm', label: '実行', variant: 'primary', autoFocus: true },
          ]}
          onAction={onAction}
          onClose={onClose}
        />,
      );
    });
    return { onAction, onClose };
  }

  it('open=false のとき描画しない', () => {
    act(() => {
      root.render(
        <ConfirmDialog
          open={false}
          title="確認"
          actions={[]}
          onAction={() => {}}
          onClose={() => {}}
        />,
      );
    });
    expect(container.textContent).toBe('');
  });

  it('role="dialog" と aria-modal が付与される', () => {
    renderDialog();
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
  });

  it('タイトルと説明文が表示される', () => {
    renderDialog();
    const text = container.textContent ?? '';
    expect(text).toContain('確認');
    expect(text).toContain('この操作を実行しますか');
  });

  it('ボタン押下で onAction が呼ばれる', () => {
    const onAction = vi.fn();
    renderDialog(onAction);
    const confirm = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('実行'),
    ) as HTMLButtonElement;
    act(() => {
      confirm.click();
    });
    expect(onAction).toHaveBeenCalledWith('confirm');
  });

  it('Escape で onClose が呼ばれる', () => {
    const onClose = vi.fn();
    renderDialog(vi.fn(), onClose);
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('autoFocus のボタンに初期フォーカスが移る', () => {
    renderDialog();
    const active = document.activeElement as HTMLButtonElement | null;
    expect(active?.textContent).toContain('実行');
  });

  it('Tab で末尾から先頭へ focus trap する', () => {
    renderDialog();
    const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
    const first = buttons[0];
    const last = buttons[1];
    act(() => {
      last.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    });
    expect(document.activeElement).toBe(first);
  });

  it('Shift+Tab で先頭から末尾へ focus trap する', () => {
    renderDialog();
    const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
    const first = buttons[0];
    const last = buttons[1];
    act(() => {
      first.focus();
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(last);
  });

  it('ボタンバリアント class が付与される', () => {
    renderDialog();
    const confirm = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('実行'),
    ) as HTMLButtonElement;
    expect(confirm.className).toContain('confirm-dialog__button--primary');
  });

  it('dangerouslySetInnerHTML を使わず XSS 文字列を text として描画する', () => {
    act(() => {
      root.render(
        <ConfirmDialog
          open
          title={'<script>alert(1)</script>'}
          description={'<img src=x onerror="alert(2)">'}
          actions={[{ id: 'ok', label: 'OK', autoFocus: true }]}
          onAction={() => {}}
          onClose={() => {}}
        />,
      );
    });
    // script / img 要素として実際に DOM に挿入されていないことを確認
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    // React は text として描画するため、実行可能なタグとして解釈されていないことを確認
    const panel = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel).not.toBeNull();
    // タイトル h2 の textContent が XSS 文字列そのままであること（text node として安全に描画）
    const h2 = panel.querySelector('h2') as HTMLElement;
    expect(h2.textContent).toBe('<script>alert(1)</script>');
    // description の textContent も同様
    const desc = panel.querySelector('p') as HTMLElement;
    expect(desc.textContent).toBe('<img src=x onerror="alert(2)">');
  });
});
