# 次スプリント引き継ぎメモ - Sprint020 → Sprint021（DAY4 整備）

> Sprint Review/Retrospective 前に、公開後確認の責任分担と Sprint021 候補 PBI の事前情報を整理する。
> 作成: 2026-09-12（DAY4） 担当: 高橋（SM）／中村（PBI-077〜081 事前読み込み）／山本（公開後確認手順整備）

---

## 1. 公開後確認の責任分担（A-93 §公開後確認 4 項目）

> Sprint Review（2026-09-15）終了直後に GitHub Pages へデプロイし、本表に従って即時実行する。
> 結果は [scrum/sprint020/sprint_backlog.md](./sprint_backlog.md) の「受入確認メモ運用 §公開後確認」のチェックボックスを更新して記録する。

| #   | 確認項目                                                                                              | 主担当 | 副担当 | 手順 / 検証コマンド                                                                                                                                                                                       | 期待結果                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------- | ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| C1  | PBI-076: 本番URL `https://<domain>/<不存在ルート>` で 404 画面表示＋ `meta robots="noindex"` 反映     | 山本   | 伊藤   | デプロイ完了 → `https://katuz.github.io/ai-scrum-inbuscket/no-such-route` をブラウザで開き、DevTools `<head>` の meta robots を確認                                                                       | NotFound 画面描画／`<meta name="robots" content="noindex, follow">` が DOM 内に挿入                   |
| C2  | PBI-076: 本番URLで `#/privacy-policy` 等レガシー URL が新URL構造へ自動遷移                            | 山本   | 中村   | `https://katuz.github.io/ai-scrum-inbuscket/#/privacy-policy` をブラウザで開く                                                                                                                            | 即座に `https://katuz.github.io/ai-scrum-inbuscket/privacy-policy` へ replaceState／hash が空         |
| C3  | PBI-076: Search Console URL検査で主要ページがインデックス可能と判定                                   | 中村   | 田中   | Search Console（[seo_operations.md](../../project/docs/seo_operations.md) §3 参照）の「URL 検査」で `/`, `/reference`, `/patterns/8` を検査                                                               | いずれも「URL は Google に登録できます」と判定（タイミング次第で Sprint021 以降にずれ込む可能性あり） |
| C4  | PBI-082: 本ドキュメントに従って Lighthouse SEO 定点観測が次スプリントから運用開始可能であることを確認 | 中村   | 山本   | [seo_operations.md](../../project/docs/seo_operations.md) §4「Lighthouse SEO 定点観測手順」と [project/docs/lighthouse-sprint016.md](../../project/docs/lighthouse-sprint016.md) を Sprint021 DAY1 に試行 | 手順通りに 1 回スコア取得・記録できる／不足箇所があれば Sprint021 レトロで継続改善                    |

### 実施タイミングと完了報告

- C1 / C2: Sprint Review 終了 + デプロイ反映後 30 分以内に実施（即時項目）
- C3: デプロイ後 24〜72 時間でクロール済となるため Sprint021 DAY1〜2 で再確認可
- C4: Sprint021 DAY1 に試行し、Sprint021 sprint_backlog にチェックリスト記入欄を残す

---

## 2. Sprint021 候補 PBI（事前リファインメントメモ・DAY3 中村起票 / DAY4 整理）

> PBI-076 完了により依存解除。Sprint Review 内で PO 鈴木へ提示し優先度・SP の再確認に使用。
> 詳細な受入基準は [scrum/product_backlog.csv](../product_backlog.csv) を参照。

| PBI     | タイトル                                               | SP  | 優先度 | 状態  | 事前読み込みメモ                                                                                                                                                                                                                                                                        |
| ------- | ------------------------------------------------------ | --- | ------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PBI-077 | 内部遷移の `<a href>` 化とクローラ可視リンク監査       | 3   | High   | Ready | Sprint020 で `href="/..."` 化はパターン詳細／解説／legal／GlobalNav 等で先行済。残対象は Quick / Deep / Examスタートの onClick 単独遷移箇所と、回帰テスト（修飾キー新規タブ・キーボード操作・a11y）。`src/Router.tsx` delegated handler が両形式を吸収するため安全に段階移行可。        |
| PBI-078 | canonical/メタ重複網羅レビューと自動テスト拡張         | 3   | Medium | Ready | 既存 `seo-assets.test.ts` / `Router.seo.test.tsx` を拡張する形で重複検出（title/description/canonical の一意性）を追加。404 noindex 検証は Sprint020 で恒常化済のため重複しないようテスト粒度を整理。`seo_metadata_sitemap_guide.md` の更新セクションを事前に確認。                     |
| PBI-079 | 全20パターン詳細・代表ケースの単独URL化                | 5   | High   | Ready | パターン詳細は Sprint020 までに `/patterns/:id` 単独URL化済。残は代表ケース 20 件以上の `/cases/:id` 整備＋120 字以上のオリジナル解説。BreadcrumbList JSON-LD は既存 `applySEO` 拡張で実装可。lazy-load は IntersectionObserver で Googlebot 可視を担保。PBI-076 / PBI-078 完了が前提。 |
| PBI-080 | ref未公開章（03/04/06/07/09/10/11/12）の解説ページ展開 | 5   | High   | Ready | 既存 `/reference/chapter01,02,05,08` のフォーマットに準拠し 8 章を新規。各章 800 字以上のオリジナル解説。ReferenceIndex から内部リンク追加・sitemap.xml への追加は Sprint020 の pathname 化済構造に追記する形。Lighthouse SEO スコア既存水準維持を確認。                                |
| PBI-081 | sitemap.xml/robots.txt のビルド時自動生成              | 2   | Medium | Ready | Router 定義を単一ソースとし、`scripts/transform-seo-tokens.mjs` を拡張または新規スクリプトで sitemap 生成。`sitemap-coverage.test` で実ルートとの不整合を検知し CI を落とす。Sprint020 で `__SITE_URL__` 置換基盤が整っているため robots.txt 反映は容易。                               |

### Sprint021 プランニング時の議論ポイント

1. PBI-077（3pt）と PBI-079（5pt・PBI-078 完了前提）のいずれを先行するか。被リンク受け皿（PBI-079）は SEO インパクト大だが PBI-078 完了後が望ましい。順序候補：PBI-077 → PBI-078 → PBI-079 を 1 スプリントに 2〜3 PBI ずつ。
2. PBI-080（5pt・コンテンツ作成重め）は単独スプリント候補にしないと品質が落ちる懸念。
3. PBI-081（2pt）は PBI-076 で sitemap pathname 化済のため、Sprint021 で先行実装し以降の sitemap 更新漏れを構造的に防ぐと効果的。

### 助っ人（山本・中村）向けの先行情報

- 山本: PBI-079（パターン／ケース単独URL）の代表ケース 20 件選定とオリジナル解説 120 字 × 20 件のドラフトを Sprint021 DAY1 着手予定として確保しておく。
- 中村: PBI-080 の 8 章ドラフト（800 字 × 8 章）の素材調査を Sprint Review 後の空き時間で先行実施可。

---

## 3. Sprint Review/Retrospective 議題への反映ポイント（DAY5 で議論）

- レビュー: §6 プロダクトバックログ調整で本メモ §2 を提示し、Sprint021 候補の優先度確定。
- レトロ: §Try に「公開後確認の責任分担をハンドオフメモで標準化」を Sprint021 以降の継続 Try として追加するか議論。

---

## 更新履歴

| 日付       | 更新内容                                                                              | 更新者     |
| ---------- | ------------------------------------------------------------------------------------- | ---------- |
| 2026-09-12 | DAY4 で本ファイル新規作成（公開後確認 4 項目の責任分担＋Sprint021 候補 PBI 事前メモ） | 高橋（SM） |
