import { useId } from 'react';
import {
  WRITING_MAX_LENGTH,
  type WritingEntry,
} from '../domain/writing';

interface Props {
  /** 現在の記述内容（判断 / 理由 / アクション） */
  entry: WritingEntry;
  /** 入力変更時に呼ばれるコールバック（不変更新） */
  onChange: (entry: WritingEntry) => void;
  /** 入力無効化（優先度未選択時など） */
  disabled?: boolean;
}

/**
 * 1 フィールドの設定（判断 / 理由 / アクション）。
 * - aria-label / placeholder / 見出しを集約し、3 textarea を一貫したマークアップで描画する。
 */
const FIELDS: ReadonlyArray<{
  key: keyof WritingEntry;
  label: string;
  ariaLabel: string;
  placeholder: string;
}> = [
  {
    key: 'judgment',
    label: '判断',
    ariaLabel: '判断を入力',
    placeholder: '例：本件はAランクとして本日中に対応する。',
  },
  {
    key: 'reason',
    label: '理由',
    ariaLabel: '理由を入力',
    placeholder: '例：顧客影響が大きく、放置すると損失が拡大するため。',
  },
  {
    key: 'action',
    label: 'アクション',
    ariaLabel: 'アクションを入力',
    placeholder: '例：担当部長に即時連絡し、対応チームを招集する。',
  },
];

/**
 * 判断・理由・アクションの 3 ブロック記述入力（PBI-023 / TASK-002）。
 *
 * - DoD §10-1: maxLength=500 で UI レベルの最大長を強制し、超過入力を抑止する。
 * - DoD §10-2: 表示は React のテキスト描画に限定し、`dangerouslySetInnerHTML` を使用しない。
 * - DoD §9-3: 各 textarea に `aria-label` を付与し、文字数補助は `aria-live="polite"` で読み上げ。
 * - 無効化（disabled）は readonly ではなく `disabled` 属性を使用（操作不可・フォーカス不可）。
 */
export function WritingInput({ entry, onChange, disabled = false }: Props) {
  const idPrefix = useId();

  const handleChange = (key: keyof WritingEntry, value: string) => {
    onChange({ ...entry, [key]: value });
  };

  return (
    <div className="writing-input" role="group" aria-label="判断・理由・アクションを入力">
      {FIELDS.map(({ key, label, ariaLabel, placeholder }) => {
        const id = `${idPrefix}-${key}`;
        const value = entry[key];
        const length = value.length;
        const isOver = length > WRITING_MAX_LENGTH; // maxLength で抑止されるため通常は false
        return (
          <div key={key} className="writing-input__field">
            <label className="writing-input__label" htmlFor={id}>
              {label}
            </label>
            <textarea
              id={id}
              className="writing-input__textarea"
              aria-label={ariaLabel}
              placeholder={placeholder}
              maxLength={WRITING_MAX_LENGTH}
              rows={4}
              value={value}
              disabled={disabled}
              onChange={(e) => handleChange(key, e.target.value)}
            />
            <div
              className={
                'writing-input__count' + (isOver ? ' writing-input__count--over' : '')
              }
              aria-live="polite"
            >
              {length} / {WRITING_MAX_LENGTH}
            </div>
          </div>
        );
      })}
    </div>
  );
}
