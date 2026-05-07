/**
 * 404 画面コンポーネント（PBI-076 / TASK-076-3）
 *
 * 暫定実装（Router.tsx 内 `NotFoundView`）から本ファイルへ分離する。
 * - meta robots noindex 同期は Router 側 `syncRobotsMeta(true)` が担う（soft 404 回避）。
 * - スタイルは `NotFound.css` に集約し、TSX に inline `style=` を持たない（A-75 / DoD §9.6）。
 * - dangerouslySetInnerHTML 不使用（DoD §10-2）。
 * - role="main" + aria-labelledby で a11y を担保（DoD §9-3）。
 */
import './NotFound.css';

interface NotFoundProps {
  /** 「トップへ戻る」ボタン押下時のハンドラ。 */
  onBack: () => void;
}

export function NotFound({ onBack }: NotFoundProps) {
  return (
    <main className="not-found-view" role="main" aria-labelledby="not-found-title">
      <p className="not-found-view__code" aria-hidden="true">
        404
      </p>
      <h1 id="not-found-title" className="not-found-view__title">
        ページが見つかりません
      </h1>
      <p className="not-found-view__description">
        お探しのページは存在しないか、移動・削除された可能性があります。URL
        をご確認のうえ、トップページからお探しください。
      </p>
      <button type="button" className="not-found-view__home-button" onClick={onBack}>
        トップへ戻る
      </button>
    </main>
  );
}
