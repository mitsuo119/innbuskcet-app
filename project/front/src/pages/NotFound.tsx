/**
 * 404 画面コンポーネント（PBI-076 / TASK-076-3）
 *
 * 暫定実装（Router.tsx 内 `NotFoundView`）から本ファイルへ分離する。
 * - meta robots noindex 同期は Router 側 `syncRobotsMeta(true)` が担う（soft 404 回避）。
 * - スタイルは `NotFound.css` に集約し、TSX に inline `style=` を持たない（A-75 / DoD §9.6）。
 * - dangerouslySetInnerHTML 不使用（DoD §10-2）。
 * - role="main" + aria-labelledby で a11y を担保（DoD §9-3）。
 * - PBI-077 / TASK-077-3: トップへ戻る導線を `<a href="/">` 化（onClick 単独遷移 0 件・修飾キーで新規タブ可）。
 */
import './NotFound.css';

export function NotFound() {
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
      <a href="/" className="not-found-view__home-button">
        トップへ戻る
      </a>
      {/* PBI-079 / TASK-079-5: 補助リンク（パターン一覧・解説リファレンス）。a11y は `<nav aria-label>` で識別、視覚順序＝DOM 順序＝Tab 順序を維持。 */}
      <nav className="not-found-view__suggestions" aria-label="関連ページへの補助リンク">
        <p className="not-found-view__suggestions-lead">こちらもお試しください：</p>
        <ul className="not-found-view__suggestions-list">
          <li>
            <a href="/patterns" className="not-found-view__suggestion-link">
              パターン一覧（/patterns）
            </a>
          </li>
          <li>
            <a href="/reference" className="not-found-view__suggestion-link">
              解説リファレンス（/reference）
            </a>
          </li>
        </ul>
      </nav>
    </main>
  );
}
