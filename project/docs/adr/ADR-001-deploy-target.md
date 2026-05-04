# ADR-001: 公開デプロイ先として GitHub Pages を採用する

- ステータス: Accepted
- 日付: 2026-07-09（Sprint011 / Day2）
- 起票: 中村（助っ人開発者）
- 関連: PBI-049 / TASK-101
- レビュー: 渡辺（セキュリティ）／ 高橋（SM）

## コンテキスト

PBI-049 で「main push で自動本番反映される基盤」を整える必要がある。本アプリは

- React + TypeScript + Vite による **クライアントサイドのみ**（サーバ・DB・外部 API なし）
- データは `cases.json` 静的バンドル
- 状態は `useState` / `sessionStorage` / `localStorage` のみ
- Sprint009 までで pnpm + ESLint + vitest の CI 化が完了している
- リポジトリは公開 GitHub。学習コスト・運用コストは極小化したい

という条件で、**静的ホスティング先**を選定する必要がある。

## 検討した選択肢

| 選択肢                | 主なメリット                                                         | 主なデメリット                                                             |
| --------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| GitHub Pages          | 同一リポジトリで完結／OIDC で Secrets 不要／追加課金なし／HTTPS 自動 | サブパス配信が既定（`/<repo>/`）／カスタムサーバ機能不可（本要件では不要） |
| Cloudflare Pages      | グローバル CDN／プレビュー URL                                       | 外部サービス契約・APIトークン管理が増える／本件はオーバースペック          |
| Vercel / Netlify      | DX が良い／プレビュー URL                                            | 無料枠の規約・帯域制限／外部サービス依存／APIトークン管理コスト            |
| Azure Static Web Apps | 既存 Azure テナントとの統合                                          | 本リポジトリに Azure テナント前提なし／IaC が増える／要件に対し過剰        |
| 自前 VPS / S3+CF      | 自由度が高い                                                         | インフラ運用・コスト・脆弱性管理が発生／クライアントのみの本要件には不要   |

## 決定

**GitHub Pages を採用する。**

- リポジトリ単一ホストでスクラム成果物と本番配信を同居させ、運用面・監査面の単純さを最優先する。
- `actions/deploy-pages@v4` を OIDC（`id-token: write`）で利用し、**長期 Secrets を発行しない**。
- 本番配信パスは `/<repo>/` 固定。`vite.config.ts` の `base` を `VITE_BASE_URL` 環境変数で切替（dev/test は `/`、本番ビルドのみサブパス）。
- SPA フォールバックは `dist/index.html` を `dist/404.html` にコピーする方式（`scripts/copy-404.mjs`）。

## 結果（影響）

### ポジティブ

- 追加の外部サービス契約・課金・トークン管理なし。
- `GITHUB_TOKEN` を最小権限（既定 `contents: read`、`deploy` ジョブのみ `pages: write` / `id-token: write`）で運用可能。シークレット流出リスクを構造的に縮小。
- main push のみ自動デプロイ／PR は検証のみで本番影響なし、という二段構えがワークフロー定義のみで完結。

### ネガティブ／受容するトレードオフ

- カスタムドメイン未使用時は URL がサブパス前提になるため、ベース URL を絶対参照しているコードを書かない規律が必要（`vite.config.ts` の `base` を経由）。
- アクセスログ・エッジルールなど CDN 系の高度機能は持たない。本要件では不要。
- 大規模なトラフィック分散・WAF 連携は不可。学習用途の MVP で十分。

## 検証

- `VITE_BASE_URL=/ai-scrum-inbuscket/ pnpm build` 実行で `dist/index.html` のアセット参照がサブパス化されることを確認済（Day1）。
- `dist/404.html` が `index.html` のコピーで生成されることを確認済（Day1）。
- `pnpm tsc --noEmit` / `pnpm vitest run`（329 件） / `pnpm lint` クリーン（Day1）。

## 再検討トリガー

以下のいずれかが発生した場合、本 ADR を再評価する。

1. ファーストパーティのバックエンド（API/DB）が必要になる。
2. 独自ドメイン＋WAF/エッジ機能が要件化される。
3. GitHub Pages の月次帯域制限（ソフト 100GB）に近接する見込みが立つ。

## 参考

- 完成の定義: [definition_of_done.md](../../../scrum/definition_of_done.md)（特に §5-1 / §5-2）
- ワークフロー: [.github/workflows/deploy.yml](../../../.github/workflows/deploy.yml)
- Sprint011 バックログ: [sprint_backlog.md](../../../scrum/sprint011/sprint_backlog.md)
