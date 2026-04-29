import type { Case } from '../domain/case';

interface Props {
  caseItem: Case;
}

/**
 * 案件1件を出題形式で表示する。回答UIや解説は別コンポーネントで担当する。
 */
export function CaseView({ caseItem }: Props) {
  return (
    <article className="case-view" aria-labelledby="case-title">
      <h2 id="case-title" className="case-view__title">
        {caseItem.title}
      </h2>
      <p className="case-view__body">{caseItem.body}</p>
    </article>
  );
}
