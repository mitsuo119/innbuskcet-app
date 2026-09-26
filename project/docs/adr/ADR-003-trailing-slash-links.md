# ADR-003: 内部リンクと構造化データの URL を末尾スラッシュ付きに統一する

- ステータス: **Accepted**
- 日付: 2026-09-26
- 関連: PBI-110 / 有用性監査 P-18（project/docs/usefulness_audit_2026-09-26.md）

## コンテキスト

GitHub Pages は `/about` を `/about/` へ 301 転送する。canonical・og:url・sitemap は既に `/about/` 形式だが、画面と静的HTMLの内部リンク、BreadcrumbList JSON-LD は `/about` 形式のままで、クローラと利用者は毎回転送を経由していた。

## 検討した選択肢

| 案 | 内容 | 評価 |
| --- | --- | --- |
| A | 内部リンク・BreadcrumbList を末尾スラッシュ付きに揃える | 既存の出力（`path/index.html`）と canonical をそのまま使える。変更はリンク文字列のみ |
| B | `path.html` 出力に切り替え、URL を `/about` 形式にする | canonical・sitemap・出力構成・404 処理の変更が必要。既に登録済みの URL も変わる |

## 決定

案 A を採用する。

- 内部リンクは `/` またはパス末尾が `/` の形で書く（クエリ・ハッシュはその後ろ）。
- BreadcrumbList の `item` も canonical と同じ末尾スラッシュ付きにする。
- Router は末尾スラッシュを取り除いて照合するため、ルート定義（`routes.ts` の `path`）は変えない。

## 影響

- `StaticParity.test.tsx` で全 60 ルートの画面と静的HTMLの内部リンクを検査し、末尾スラッシュのないリンクを検出する。
- 新しい内部リンクを追加するときは末尾スラッシュを付ける。
