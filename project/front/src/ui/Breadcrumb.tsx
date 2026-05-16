/**
 * パンくず視覚UIコンポーネント（PBI-091 / TASK-091-1 / Sprint025 DAY5）
 *
 * 階層リンクを `<nav aria-label="パンくず">` + `<ol>` で表現し、
 * 現在地は `aria-current="page"` を付与した非リンクのテキストとして描画する。
 *
 * - 内部リンクは `<a href>` を使用（SPAクローラ可視性・PBI-077 整合）。
 * - キーボード操作はネイティブ `<a>` で完結。タップ領域は CSS で 44px 以上を確保。
 * - ライト/ダーク両テーマ・375px 横スクロールなし・コントラスト AA は styles.css 側で担保。
 */
export interface BreadcrumbItem {
  /** リンク表示テキスト。 */
  label: string;
  /** リンク先 URL（最終項目（現在地）は省略）。 */
  href?: string;
}

interface Props {
  /** 階層順のパンくず項目（最低 2 件、最後が現在地）。 */
  items: readonly BreadcrumbItem[];
}

export function Breadcrumb({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <nav className="breadcrumb" aria-label="パンくず">
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li
              key={`${index}-${item.label}`}
              className={`breadcrumb__item${isCurrent ? ' breadcrumb__item--current' : ''}`}
            >
              {isCurrent || !item.href ? (
                <span className="breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a className="breadcrumb__link" href={item.href}>
                  {item.label}
                </a>
              )}
              {!isCurrent && (
                <span className="breadcrumb__sep" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
