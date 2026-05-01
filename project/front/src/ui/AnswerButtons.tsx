import type { Priority } from '../domain/case';

interface Props {
  /** 現在選択中の優先度（未選択は null） */
  selected: Priority | null;
  /** 回答確定済みかどうか（true の場合は再選択不可） */
  locked: boolean;
  /** 選択時に呼ばれるコールバック */
  onSelect: (priority: Priority) => void;
}

/**
 * 優先度ごとの記号・名称・ヒント（DoD §9-2 色非依存識別 / Sprint004 TASK-003）。
 * - symbol: 色に依存せず識別可能な記号（◎/○/△）
 * - name: 優先度の意味を示すテキスト（最優先/中優先/低優先）
 * - hint: 判断軸の補足
 */
const PRIORITIES: ReadonlyArray<{
  value: Priority;
  label: string;
  symbol: string;
  name: string;
  hint: string;
}> = [
  { value: 'A', label: 'A', symbol: '◎', name: '最優先', hint: '緊急かつ重要' },
  { value: 'B', label: 'B', symbol: '○', name: '中優先', hint: '重要 or 緊急のいずれか' },
  { value: 'C', label: 'C', symbol: '△', name: '低優先', hint: '緊急でも重要でもない' },
];

/**
 * A/B/C 優先度回答ボタン。`locked` が true の場合は再選択不可。
 * - 色だけでなく記号（◎/○/△）とテキスト（最優先/中優先/低優先）でも識別可能（DoD §9-2）
 */
export function AnswerButtons({ selected, locked, onSelect }: Props) {
  return (
    <div className="answer-buttons" role="radiogroup" aria-label="優先度を選択">
      {PRIORITIES.map(({ value, label, symbol, name, hint }) => {
        const isSelected = selected === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${label} ${name}（${hint}）`}
            className={'answer-buttons__btn' + (isSelected ? ' answer-buttons__btn--selected' : '')}
            disabled={locked}
            onClick={() => onSelect(value)}
          >
            <span className="answer-buttons__label">
              <span className="answer-buttons__letter">{label}</span>
              <span className="answer-buttons__symbol" aria-hidden="true">
                {symbol}
              </span>
            </span>
            <span className="answer-buttons__name">{name}</span>
            <span className="answer-buttons__hint">{hint}</span>
          </button>
        );
      })}
    </div>
  );
}
