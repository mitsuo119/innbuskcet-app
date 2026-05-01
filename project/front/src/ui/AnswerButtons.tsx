import type { Priority } from '../domain/case';
import { PRIORITY_LABELS } from '../domain/priorityLabel';

interface Props {
  /** 現在選択中の優先度（未選択は null） */
  selected: Priority | null;
  /** 回答確定済みかどうか（true の場合は再選択不可） */
  locked: boolean;
  /** 選択時に呼ばれるコールバック */
  onSelect: (priority: Priority) => void;
}

/**
 * ボタン表示順（PBI-035 で priorityLabel.ts を唯一の定義源として参照）。
 */
const PRIORITY_ORDER: ReadonlyArray<Priority> = ['A', 'B', 'C'];

/**
 * A/B/C 優先度回答ボタン。`locked` が true の場合は再選択不可。
 * - 色だけでなく記号（◎/○/△）とテキスト（最優先/中優先/低優先）でも識別可能（DoD §9-2）
 * - ラベルは `domain/priorityLabel.ts` の `PRIORITY_LABELS` に統一（PBI-035）
 */
export function AnswerButtons({ selected, locked, onSelect }: Props) {
  return (
    <div className="answer-buttons" role="radiogroup" aria-label="優先度を選択">
      {PRIORITY_ORDER.map((value) => {
        const { symbol, name, meaning } = PRIORITY_LABELS[value];
        const isSelected = selected === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${value} ${name}（${meaning}）`}
            className={'answer-buttons__btn' + (isSelected ? ' answer-buttons__btn--selected' : '')}
            disabled={locked}
            onClick={() => onSelect(value)}
          >
            <span className="answer-buttons__label">
              <span className="answer-buttons__letter">{value}</span>
              <span className="answer-buttons__symbol" aria-hidden="true">
                {symbol}
              </span>
            </span>
            <span className="answer-buttons__name">{name}</span>
            <span className="answer-buttons__hint">{meaning}</span>
          </button>
        );
      })}
    </div>
  );
}
