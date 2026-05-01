import { WRITING_FIELDS, type WritingEntry } from '../domain/writing';

interface Props {
  /** 表示対象の記述内容（判断 / 理由 / アクション） */
  entry: WritingEntry;
  /** 全フィールドが未入力かどうか（呼び出し側で判定して渡す） */
  isEmpty: boolean;
}

/**
 * 各フィールドのラベル定義。WritingInput と表示順・ラベル名を一致させる。
 */
const FIELD_LABELS: Readonly<Record<keyof WritingEntry, string>> = {
  judgment: '判断',
  reason: '理由',
  action: 'アクション',
};

/**
 * 判断・理由・アクションの 3 ブロック記述プレビュー（PBI-023 / TASK-003）。
 *
 * - DoD §10-2: 表示は React のテキスト描画に限定し、`dangerouslySetInnerHTML` を使用しない。
 * - DoD §9-3: セクションに `aria-label` を付与し、各フィールドは `<dl>` で意味的に対応付け。
 * - 改行を保持して表示するため `white-space: pre-wrap` 相当のクラスを適用。
 * - 全空のときは「未記述」の案内を表示し、回答前のフローでも違和感なく確認できるようにする。
 */
export function WritingPreview({ entry, isEmpty }: Props) {
  if (isEmpty) {
    return (
      <section className="writing-preview writing-preview--empty" aria-label="記述内容のプレビュー">
        <p className="writing-preview__empty">
          未記述（判断・理由・アクションは入力されていません）
        </p>
      </section>
    );
  }

  return (
    <section className="writing-preview" aria-label="記述内容のプレビュー">
      <dl className="writing-preview__list">
        {WRITING_FIELDS.map((key) => {
          const value = entry[key];
          const label = FIELD_LABELS[key];
          return (
            <div key={key} className="writing-preview__item">
              <dt className="writing-preview__term">{label}</dt>
              <dd className="writing-preview__desc">
                {value.length > 0 ? (
                  value
                ) : (
                  <span className="writing-preview__blank">（未入力）</span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
