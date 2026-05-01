import { FILTER_MODES, type FilterMode } from '../domain/random';

interface Props {
  mode: FilterMode;
  onChange: (mode: FilterMode) => void;
}

const labelOf = (m: FilterMode): string => (m === 'all' ? '全件' : `${m}のみ`);

const ariaOf = (m: FilterMode): string => (m === 'all' ? '全件から出題' : `優先度${m}のみ出題`);

/**
 * 出題モード切替UI（PBI-018）。
 * - role="radiogroup" + role="radio" + aria-checked でスクリーンリーダ対応
 * - 各ボタンは Tab でフォーカス移動・Enter/Space で確定（HTML <button> 既定）
 * - 選択中はスタイル＆ aria-checked="true" で明示
 * - キー A/B/C は回答ショートカットと衝突するため、本UIはマウス/Tab+Space/Enter操作に限定
 *   （切替後の履歴・カウンタ初期化は呼び出し側 onChange の責務）
 */
export function ModeSelector({ mode, onChange }: Props) {
  return (
    <div className="mode-selector" role="radiogroup" aria-label="出題モード">
      <span className="mode-selector__label" aria-hidden="true">
        出題モード:
      </span>
      {FILTER_MODES.map((m) => {
        const selected = m === mode;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={ariaOf(m)}
            className={'mode-selector__btn ' + (selected ? 'mode-selector__btn--selected' : '')}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              if (!selected) onChange(m);
            }}
            onKeyDown={(e) => {
              // 矢印キーで radiogroup 内を移動（WAI-ARIA Radio Group パターン）
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              e.preventDefault();
              const idx = FILTER_MODES.indexOf(mode);
              const next =
                e.key === 'ArrowRight'
                  ? FILTER_MODES[(idx + 1) % FILTER_MODES.length]
                  : FILTER_MODES[(idx - 1 + FILTER_MODES.length) % FILTER_MODES.length];
              onChange(next);
            }}
          >
            {labelOf(m)}
          </button>
        );
      })}
    </div>
  );
}
