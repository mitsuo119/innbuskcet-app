import type { Priority } from '../domain/case';

interface Props {
  /** 現在選択中の優先度（未選択は null） */
  selected: Priority | null;
  /** 回答確定済みかどうか（true の場合は再選択不可） */
  locked: boolean;
  /** 選択時に呼ばれるコールバック */
  onSelect: (priority: Priority) => void;
}

const PRIORITIES: ReadonlyArray<{ value: Priority; label: string; hint: string }> = [
  { value: 'A', label: 'A', hint: '緊急かつ重要' },
  { value: 'B', label: 'B', hint: '重要 or 緊急のいずれか' },
  { value: 'C', label: 'C', hint: '緊急でも重要でもない' },
];

/**
 * A/B/C 優先度回答ボタン。`locked` が true の場合は再選択不可。
 */
export function AnswerButtons({ selected, locked, onSelect }: Props) {
  return (
    <div className="answer-buttons" role="radiogroup" aria-label="優先度を選択">
      {PRIORITIES.map(({ value, label, hint }) => {
        const isSelected = selected === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={'answer-buttons__btn' + (isSelected ? ' answer-buttons__btn--selected' : '')}
            disabled={locked}
            onClick={() => onSelect(value)}
          >
            <span className="answer-buttons__label">{label}</span>
            <span className="answer-buttons__hint">{hint}</span>
          </button>
        );
      })}
    </div>
  );
}
