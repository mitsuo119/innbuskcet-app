import type { ModelAnswer, Priority } from '../domain/case';
import { PRIORITY_LABELS } from '../domain/priorityLabel';

interface Props {
  /** 表示対象の模範回答骨格（未整備案件は undefined） */
  modelAnswer: ModelAnswer | undefined;
  /** 表示可否（回答後のみ true を期待） */
  visible: boolean;
  /**
   * 当該案件の正解優先度（PBI-035）。
   * 渡された場合、ヘッダーに「記号＋名称＋意味」を持つ優先度バッジを表示する。
   */
  correctPriority?: Priority;
}

/**
 * 模範回答骨格の各フィールド表示順とラベル。
 * WritingPreview と同順・同名で並べ、視覚的に対応を取りやすくする。
 */
const FIELDS: ReadonlyArray<{ key: keyof ModelAnswer; label: string }> = [
  { key: 'judgment', label: '判断' },
  { key: 'reason', label: '理由' },
  { key: 'action', label: 'アクション' },
];

/**
 * 模範回答骨格表示コンポーネント（PBI-024 / TASK-009、PBI-035 で優先度バッジ追加）。
 *
 * - 回答後（visible=true）のみ表示。未回答時は呼び出し側で非表示とする想定だが、
 *   visible=false が渡されたときも安全側に「模範解答準備中」を返す。
 * - modelAnswer が undefined の場合（cases.json で段階移行中の未整備案件）は
 *   「模範解答準備中」のプレースホルダを表示。
 * - PBI-035: `correctPriority` が渡された場合、ヘッダー右に
 *   「A ◎ 最優先 — 即時着手すべき」のバッジを表示し、`priorityLabel.ts` を唯一の定義源として参照する。
 *   `aria-label` には `formatPriorityLabel` 相当の SR 読み上げ文を格納（DoD §9-3）。
 * - DoD §10-2: 表示は React のテキスト描画のみで構成し、`dangerouslySetInnerHTML` 不使用。
 * - DoD §9-3: `aria-label="模範解答"` をセクションに付与し、`<dl>` で項目と内容を意味的に対応付け。
 * - CSS は CSS 変数ベースでライト/ダーク両テーマに自動追従。
 */
export function ModelAnswerView({ modelAnswer, visible, correctPriority }: Props) {
  if (!visible || !modelAnswer) {
    return (
      <section className="model-answer model-answer--empty" aria-label="模範解答">
        <p className="model-answer__empty">
          模範解答準備中（この案件はまだ模範回答骨格が整備されていません）
        </p>
      </section>
    );
  }

  const priorityBadge = correctPriority ? PRIORITY_LABELS[correctPriority] : null;

  return (
    <section className="model-answer" aria-label="模範解答">
      <header className="model-answer__header">
        <h3 className="model-answer__title">模範解答（骨格）</h3>
        {priorityBadge && correctPriority && (
          <span
            className={`model-answer__priority model-answer__priority--${correctPriority}`}
            aria-label={`正解優先度 ${correctPriority}（${priorityBadge.name}）${priorityBadge.meaning}`}
          >
            <span className="model-answer__priority-letter" aria-hidden="true">
              {correctPriority}
            </span>
            <span className="model-answer__priority-symbol" aria-hidden="true">
              {priorityBadge.symbol}
            </span>
            <span className="model-answer__priority-name">{priorityBadge.name}</span>
            <span className="model-answer__priority-meaning">— {priorityBadge.meaning}</span>
          </span>
        )}
      </header>
      <dl className="model-answer__list">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="model-answer__item">
            <dt className="model-answer__term">{label}</dt>
            <dd className="model-answer__desc">{modelAnswer[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
