import { useEffect, useId, useMemo, useRef } from 'react';

export interface ConfirmDialogAction {
  /** 呼び出し側が識別するアクションID。 */
  id: string;
  /** ボタン表示ラベル。 */
  label: string;
  /** 視覚バリアント。 */
  variant?: 'primary' | 'danger' | 'secondary';
  /** 初期フォーカス対象。 */
  autoFocus?: boolean;
}

export interface ConfirmDialogProps {
  /** 表示制御。false 時は何も描画しない。 */
  open: boolean;
  /** ダイアログ見出し。 */
  title: string;
  /** 補助説明。 */
  description?: string;
  /** フッターの選択肢。 */
  actions: readonly ConfirmDialogAction[];
  /** ボタン押下時の通知。 */
  onAction: (actionId: string) => void;
  /** Escape 押下時や閉じる操作。 */
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function isHTMLElement(value: EventTarget | null): value is HTMLElement {
  return value instanceof HTMLElement;
}

/**
 * 共通 ConfirmDialog（PBI-038）。
 *
 * - `role="dialog"` / `aria-modal="true"` / `aria-labelledby` / `aria-describedby`
 * - open 時に初期フォーカス移動・close 時に元フォーカスへ復帰
 * - Tab / Shift+Tab の focus trap
 * - Escape で onClose
 * - `dangerouslySetInnerHTML` 不使用
 */
export function ConfirmDialog({
  open,
  title,
  description,
  actions,
  onAction,
  onClose,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const describedBy = description ? descriptionId : undefined;
  const initialActionId = useMemo(
    () => actions.find((a) => a.autoFocus)?.id ?? actions[0]?.id,
    [actions],
  );

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = isHTMLElement(document.activeElement)
      ? document.activeElement
      : null;

    const panel = panelRef.current;
    if (!panel) return;

    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const initial =
      focusables.find((el) => el.getAttribute('data-action-id') === initialActionId) ??
      focusables[0] ??
      panel;
    initial.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const currentPanel = panelRef.current;
      if (!currentPanel) return;
      const currentFocusables = Array.from(
        currentPanel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (currentFocusables.length === 0) {
        event.preventDefault();
        currentPanel.focus();
        return;
      }

      const first = currentFocusables[0];
      const last = currentFocusables[currentFocusables.length - 1];
      const active = isHTMLElement(document.activeElement) ? document.activeElement : null;

      if (event.shiftKey) {
        if (active === first || active === currentPanel) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [initialActionId, onClose, open]);

  if (!open) return null;

  return (
    <div className="confirm-dialog" role="presentation">
      <div className="confirm-dialog__backdrop" />
      <div className="confirm-dialog__viewport">
        <div
          ref={panelRef}
          className="confirm-dialog__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={describedBy}
          tabIndex={-1}
        >
          <header className="confirm-dialog__header">
            <h2 id={titleId} className="confirm-dialog__title">
              {title}
            </h2>
          </header>
          {description && (
            <p id={descriptionId} className="confirm-dialog__description">
              {description}
            </p>
          )}
          <div className="confirm-dialog__actions">
            {actions.map((action) => {
              const variant = action.variant ?? 'secondary';
              return (
                <button
                  key={action.id}
                  type="button"
                  data-action-id={action.id}
                  className={`confirm-dialog__button confirm-dialog__button--${variant}`}
                  onClick={() => onAction(action.id)}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
