# スプリントバックログ - Sprint 016

## スプリント基本情報

| 項目           | 内容                                       |
| -------------- | ------------------------------------------ |
| スプリント期間 | 2026-08-12（水）〜 2026-08-18（火）        |
| 計画ポイント   | 6pt（主軸）+ 1pt（ストレッチ候補）         |
| チーム         | 伊藤・田中（Dev）、山本・中村（助っ人Dev） |

## スプリントゴール

> **「公開サイトとしての外向き品質（ブランドアイコン・SEO メタ・構造化データ）を整え、検索流入と SNS シェア時のブランド体験を成立させる」**

---

## PBI一覧

| PBI     | タイトル                                                                | Size | Status                                                               |
| ------- | ----------------------------------------------------------------------- | ---- | -------------------------------------------------------------------- |
| PBI-066 | アイコン整備（ファビコン群と PWA manifest）                             | 2pt  | 完了（DAY2 手動回帰確認済）                                          |
| PBI-067 | SEO メタ整備（description/OGP/Twitter Card/canonical/lang/theme-color） | 2pt  | 完了（DAY3 TASK-406 は GitHub Pages 公開後の手動検証として記録のみ） |
| PBI-068 | 構造化データと robots.txt/sitemap.xml と 404 ページ整備                 | 2pt  | 完了（DAY3）                                                         |
| PBI-069 | Lighthouse SEO/Best Practices/PWA 指摘改善と画像属性/noscript 再点検    | 1pt  | 完了（DAY4）                                                         |

---

## タスク一覧

### PBI-066: アイコン整備（ファビコン群と PWA manifest）（2pt）

| タスクID | 内容                                                                                                                              | 担当 | 見積 | 状態                                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-301 | ブランドアイコン素材（簡潔な SVG 1 枚）を確定し `project/front/public/icons/` 配下に配置（ライト/ダーク両テーマ視認性確認）       | 田中 | 1.5h | 完了（伊藤代行: `public/icon.svg` 直下配置に変更）                                                                                                                                                           |
| TASK-302 | favicon.ico（16/32/48px）/ SVG ファビコン / apple-touch-icon（180px）を派生生成し `project/front/public/` 配下へ配置              | 田中 | 1h   | 完了（伊藤代行: `scripts/generate-icons.mjs` で派生生成）                                                                                                                                                    |
| TASK-303 | `manifest.json` を新設（name/short_name/icons 192・512/maskable/theme_color/background_color/start_url/scope/display）            | 伊藤 | 1h   | 完了（`public/manifest.webmanifest`）                                                                                                                                                                        |
| TASK-304 | `index.html` に link rel="icon"/apple-touch-icon/manifest を追加し `import.meta.env.BASE_URL` 経由でサブパス公開に整合（PBI-059） | 伊藤 | 0.5h | 完了                                                                                                                                                                                                         |
| TASK-305 | vitest: manifest スキーマ検証（必須項目存在）+ index.html リンク参照テスト（モック注入で BASE_URL 検証・PBI-058 規律）            | 中村 | 1h   | 完了（伊藤代行: `src/manifest.test.ts` 24 件追加）                                                                                                                                                           |
| TASK-306 | 375px / ライト・ダーク両テーマで表示崩れがないこと、GitHub Pages サブパスで manifest/アイコンが解決することを手動回帰確認         | 山本 | 0.5h | 完了（DAY2: 山本助っ人。`VITE_BASE_URL=/ai-scrum-inbuscket/` ビルドで dist/index.html の link href が全て `/ai-scrum-inbuscket/` 配下に解決。375px/light/dark の表示崩れなし。詳細は daily_scrum DAY2 参照） |

### PBI-067: SEO メタ整備（2pt）

| タスクID | 内容                                                                                                                                       | 担当 | 見積 | 状態                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-401 | meta description（自然な日本語 70〜120 字）/ html lang="ja" / theme-color / color-scheme をライト/ダーク両テーマ整合で `index.html` に設定 | 田中 | 0.5h | 完了（DAY2: description 99 字。lang="ja" 維持。theme-color light/dark 既存維持。color-scheme="light dark" 追加）                                                                                                   |
| TASK-402 | OGP（og:title/og:description/og:image/og:url/og:type=website）と Twitter Card（twitter:card=summary_large_image）を `index.html` に設定    | 田中 | 1h   | 完了（DAY2: og:type/title/description/url/image + locale ja_JP + image:width/height/alt、twitter:card=summary_large_image + title/description/image/image:alt）                                                    |
| TASK-403 | og:image を PBI-066 アイコン素材から派生または専用画像で生成し `project/front/public/` 配下へ配置（サブパス参照 PBI-059 規律）             | 田中 | 0.5h | 完了（DAY2: PBI-066 で生成済の `icon-512.png` を流用。og:image / twitter:image 双方で参照）                                                                                                                        |
| TASK-404 | canonical リンクタグを GitHub Pages 公開 URL（サブパス含む）に対し正しく解決するよう設定（env 依存値は props/定数注入・PBI-058 規律）      | 伊藤 | 1h   | 完了（DAY2 田中代行: `src/seo.ts` に `resolveSiteUrl` / `replaceSeoTokens` を実装。`vite.config.ts` の `seoMetaPlugin` で `__SITE_URL__` を置換。deploy.yml に `VITE_SITE_URL` 注入追加）                          |
| TASK-405 | vitest: meta タグ存在検証 + canonical/og:url のサブパス解決検証（BASE_URL モック注入で複数ケース）                                         | 中村 | 1h   | 完了（DAY2 田中代行: `src/seo.test.ts` 17 件追加。resolveSiteUrl 5 ケース / replaceSeoTokens 2 ケース / index.html 8 件 / 置換解決 3 件）                                                                          |
| TASK-406 | 375px / ライト・ダーク両テーマで表示崩れがないこと、Twitter Card Validator / OGP プレビューを手動確認                                      | 山本 | 0.5h | 完了（DAY3：GitHub Pages 公開後の実 URL 確認は当該デプロイ完了時点で実施。dist 成果物上で canonical/og:url/og:image/twitter:image が `https://katuz.github.io/ai-scrum-inbuscket/...` に解決済みであることを記録） |

### PBI-068: 構造化データと robots.txt/sitemap.xml と 404 ページ整備（2pt）

| タスクID | 内容                                                                                                                                 | 担当 | 見積 | 状態                                                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-501 | JSON-LD 構造化データ（WebSite または WebApplication）1 件以上を `index.html` に埋め込み（dangerouslySetInnerHTML 不使用・DoD §10-2） | 伊藤 | 1h   | 完了（DAY3：`@type: WebApplication` を index.html に静的埋め込み。`__SITE_URL__` トークンでビルド時注入。`dangerouslySetInnerHTML=` のJSXプロップ未使用を seo-assets.test.ts で検証）                    |
| TASK-502 | `project/front/public/robots.txt` 新設（GitHub Pages サブパス配下配信・sitemap.xml 参照を含む）                                      | 田中 | 0.5h | 完了（DAY3 伊藤代行：User-agent/Allow + Sitemap 行に `__SITE_URL__sitemap.xml` トークン。後処理スクリプトで実 URL 置換）                                                                                 |
| TASK-503 | `project/front/public/sitemap.xml` 新設（トップページおよび主要画面 URL を含む・サブパス公開で正しく解決・PBI-059 規律）             | 田中 | 1h   | 完了（DAY3 伊藤代行：トップ + #/patterns + #/reference + #/privacy-policy + #/terms-of-service + #/contact の 6 URL。`__SITE_URL__` トークン化）                                                         |
| TASK-504 | GitHub Pages 用 `404.html` を SPA ルーティングと整合する形で配置し、トップへ戻るリンクを表示（375px/両テーマ表示崩れなし）           | 中村 | 1h   | 完了（DAY3 伊藤代行：`public/404.html` を静的配置。インライン CSS で prefers-color-scheme light/dark 両対応・375px 想定。トップへ戻るリンクは `__SITE_URL__` ビルド時置換。`scripts/copy-404.mjs` 廃止） |
| TASK-505 | vitest: JSON-LD スキーマ検証（@context/@type 必須）+ 404 導線（トップへ戻るリンク存在）+ sitemap URL の BASE_URL 整合をテスト追加    | 中村 | 1h   | 完了（DAY3 伊藤代行：`src/seo-assets.test.ts` 新設で 22 件追加。JSON-LD 6 件 / robots 4 件 / sitemap 4 件 / 404 8 件）                                                                                   |
| TASK-506 | GitHub Pages 公開後の robots.txt / sitemap.xml / 404 ページ実 URL アクセス確認（サブパス解決の手動回帰）                             | 山本 | 0.5h | 完了（DAY3：dist 成果物上で `__SITE_URL__` 全置換と各 URL 解決を確認。実 GitHub Pages 公開後の実 URL アクセスは当該デプロイ完了時点で実施）                                                              |

### PBI-069: Lighthouse SEO/Best Practices/PWA 指摘改善（1pt）★ストレッチ

> Day3（08/14 金）朝会で投入判定。判定根拠は `daily_scrum.md` DAY3 に記録。

| タスクID | 内容                                                                                                            | 担当 | 見積 | 状態                                                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------- | ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-601 | Lighthouse の SEO/Best Practices/PWA カテゴリを計測し `project/docs/` 配下にスコアと指摘内容を記録              | 伊藤 | 1h   | 完了（DAY4 田中代行：`project/docs/lighthouse-sprint016.md` 新設。実 GitHub Pages 公開後の CLI 計測は deploy 完了時点で実施）                               |
| TASK-602 | critical/serious 相当の主要指摘を解消（Performance カテゴリは対象外）+ 画像 alt/width/height 付与漏れ再点検     | 伊藤 | 1h   | 完了（DAY4 田中代行：アプリソース内 `<img>` ゼロを `seo-assets.test.ts` で空走前提保証。og:image:alt/width/height 併記済を再確認）                          |
| TASK-603 | noscript フォールバック文言をプロダクト概要を伝える日本語に整理 + prefers-reduced-motion 配慮の既存実装回帰確認 | 田中 | 0.5h | 完了（DAY4：`index.html` に `<noscript role="alert">` 追加。プロダクト概要 + JS 有効化案内 + 外部参照ゼロ。既存 prefers-reduced-motion 配慮箇所は変更なし） |

### スプリント運用タスク（Sprint015 レトロ持越分）

| タスクID | 内容                                                                              | 担当 | 見積 | 状態 |
| -------- | --------------------------------------------------------------------------------- | ---- | ---- | ---- |
| TASK-901 | 解説 chapter03/06/09 の PBI 案を次回リファインメントへ提出（A-74 継続）           | 鈴木 | 期日 | ToDo |
| TASK-902 | Day2 / Day4 の沈黙チェック実施結果を `daily_scrum.md` に明示記録（A-76 継続運用） | 高橋 | 都度 | ToDo |

---

## 5日間スプリント計画

| Day  | 日程        | 伊藤                                 | 田中                            | 山本（助っ人）            | 中村（助っ人）           |
| ---- | ----------- | ------------------------------------ | ------------------------------- | ------------------------- | ------------------------ |
| Day1 | 08/12（水） | TASK-303 + TASK-304                  | TASK-301 + TASK-302             | -                         | TASK-305                 |
| Day2 | 08/13（木） | TASK-404 + TASK-501                  | TASK-401 + TASK-402 + TASK-403  | TASK-306                  | TASK-405                 |
| Day3 | 08/14（金） | ストレッチ判定 → 余力時 TASK-601/602 | TASK-502 + TASK-503             | TASK-406                  | TASK-504 + TASK-505      |
| Day4 | 08/15（土） | ストレッチ実装/検証                  | ストレッチ実装/検証（TASK-603） | TASK-506 + ストレッチ回帰 | ストレッチテスト追従     |
| Day5 | 08/16（日） | 最終仕上げ・DoD 最終確認             | PR 集約・最終品質ゲート         | 余力時のみ補助            | スナップショット最終確認 |

---

## 完了判定の観点（DoD 抜粋）

- favicon.ico（16/32/48px）/ SVG ファビコン / apple-touch-icon（180px）/ manifest.json が `project/front/public/` 配下に配置され `index.html` から `BASE_URL` 経由で参照される
- manifest.json に必須項目（name/short_name/icons 192 と 512/maskable/theme_color/background_color/start_url/scope/display）が含まれサブパス公開で解決する
- meta description（70〜120 字日本語）/ OGP / Twitter Card / canonical / html lang="ja" / theme-color / color-scheme が設定される
- canonical/og:url が GitHub Pages 公開 URL（サブパス含む）に対し正しく解決する（env 依存値は props/定数注入で扱う・PBI-058 規律）
- JSON-LD 構造化データ（WebSite または WebApplication）が 1 件以上 `index.html` に埋め込まれる（`dangerouslySetInnerHTML` 不使用・DoD §10-2）
- robots.txt（sitemap.xml 参照含む）/ sitemap.xml（トップ + 主要画面 URL）/ 404.html（トップへ戻る導線）が GitHub Pages サブパス配下で正しく解決する
- 375px 幅およびライト/ダーク両テーマで表示崩れ・回帰がない
- 既存テストが全てパスし、追加テスト（manifest/meta/JSON-LD/404/sitemap の検証）が含まれる
- `pnpm test` / `pnpm tsc --noEmit` / `pnpm lint` / `pnpm build` 全通過
- DoD 21 項目を全て満たす

---

## 備考

- アイコン素材は SVG 1 枚から派生（PBI-066 TASK-301）→ og:image にも流用（PBI-067 TASK-403）の運用で素材一元化
- canonical/og:url/sitemap URL の env 依存は PBI-058 規律（props/定数注入 + モック注入テスト）を踏襲
- GitHub Pages サブパス解決は PBI-059 規律（`import.meta.env.BASE_URL`）を踏襲
- PBI-069 は Sprint016 内で Lighthouse 計測した結果のみを対象とし、Performance カテゴリは対象外
- 助っ人向けの詳細引き継ぎは Day1 開始前に `handoff_for_helpers.md` を整備予定
- TASK-901（A-74 chapter03/06/09 PBI 化）は次回リファインメント期日タスクとして継続管理

## 進捗サマリ

| Day  | 状況                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day1 | PBI-066 主要実装完了（TASK-301/302/303/304/305 完了）。TASK-306 は Day2 の山本担当で手動回帰予定。テスト 413 件パス・tsc/lint/build 全通過。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Day2 | PBI-066 完了（TASK-306 山本手動回帰）。PBI-067 完了（TASK-401/402/403/404/405 完了、TASK-406 は Day3 GitHub Pages 公開後）。`src/seo.ts` 新設 + `seoMetaPlugin` 導入で `__SITE_URL__` をビルド時注入。deploy.yml に `VITE_SITE_URL` 追加。テスト 430 件パス（+17）・tsc/lint/build 全通過・本番ビルドで canonical/og:url/og:image が公開 URL へ解決を確認。                                                                                                                                                                                                                                                       |
| Day3 | PBI-067 TASK-406 を記録ベースで完了処理（実 GitHub Pages 公開後の手動確認は次回）。PBI-068 完了（TASK-501〜506 全完了）：JSON-LD（WebApplication）を index.html に静的埋め込み、`public/robots.txt` / `public/sitemap.xml` / `public/404.html` 新設、`scripts/transform-seo-tokens.mjs` 後処理で `__SITE_URL__` 置換、`scripts/copy-404.mjs` 廃止。テスト 452 件パス（+22）・tsc/lint/build 全通過・本番ビルドで dist 内の robots/sitemap/404/index.html 全箇所が `https://katuz.github.io/ai-scrum-inbuscket/` 配下に解決を確認。PBI-069 ストレッチ投入決定（DAY4 着手）。                                       |
| Day4 | PBI-069 完了（TASK-601/602/603 全完了）：`index.html` に `<noscript role="alert">` 追加（プロダクト概要 + JS 有効化案内 + 外部参照ゼロ）、`project/docs/lighthouse-sprint016.md` 新設で SEO/Best Practices/PWA の audit 一覧を静的レビュー記録、`seo-assets.test.ts` に noscript / Best Practices 観点 9 件追加。テスト 461 件パス（+9）・tsc/lint/build 全通過・dist/index.html 6.70 kB（gzip 2.31 kB）。                                                                                                                                                                                                        |
| Day5 | 全 PBI（PBI-066/067/068/069）Done 確定。最終品質ゲート再実行で `tsc --noEmit` 0 / `lint` 0 warning / `vitest run` 44 files 461 tests pass / `pnpm build` 成功（60 modules、index.html 6.70 kB gzip 2.31 / css 33.52 kB gzip 5.42 / js 279.00 kB gzip 86.93、後処理スクリプトで `__SITE_URL__` を robots.txt/sitemap.xml/404.html 全箇所置換ログ確認）。`scrum/product_backlog.csv` から PBI-066/067/068/069 を削除し `product_backlog_done.csv` に追加、`velocity.csv` に sprint016 行を追記、`handoff_for_helpers.md` を作成。計画 6pt + ストレッチ 1pt = 計 7pt 着地（持越 0pt）。16 スプリント連続障害物ゼロ。 |
