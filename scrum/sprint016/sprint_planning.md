# スプリントプランニング記録 - Sprint 016

## 基本情報

| 項目           | 内容                                             |
| -------------- | ------------------------------------------------ |
| 日時           | 2026-08-12（水）09:00 - 10:00                    |
| 参加者         | PO: 鈴木 / SM: 高橋（ファシリ）/ Dev: 伊藤・田中 |
| 不在           | 山本・中村（助っ人。開発日には参加可能）         |
| タイムボックス | 最大8時間（1週間スプリントのため1時間目安）      |
| スプリント期間 | 2026-08-12（水）〜 2026-08-18（火）              |

---

## トピック1: Why（スプリントゴール）

### ゴール策定の議論

**高橋（SM）**: Sprint015 で PBI-065（ブランド日本語化）+ PBI-064（GlobalNav 6ページ展開）まで完了し、UI 露出の整合は固まりました。Sprint016 はリファインメントで Ready 化された PBI-066/067/068（各 2pt）を主軸に、公開サイトとしての「外向き品質」（アイコン・SEO メタ・構造化データ）を一気に底上げします。

**鈴木（PO）**: GitHub Pages 公開（Sprint011）+ AdSense 注入（Sprint012）+ ブランド日本語化（Sprint015）を経て、外部からの第一接点（タブアイコン・検索結果スニペット・SNS シェア OGP）の整備が公開サイトとしての仕上げに残った最後の大きな塊です。PBI-066（アイコン）→ PBI-067（メタ）→ PBI-068（構造化データ + robots/sitemap/404）の順で土台を積み、PBI-069（Lighthouse 改善）はストレッチとして Day3 で投入判定します。

**伊藤（Dev）**: 3 PBI とも GitHub Pages サブパス公開（`/ai-scrum-inbuscket/`）配下での解決が共通の鬼門です。PBI-059 で確立したベースパス規律（`import.meta.env.BASE_URL` 経由参照）を流用し、テストはモック注入（PBI-058 規律）で env 依存を排除します。

**田中（Dev）**: アイコン/manifest/OGP 画像はバイナリ生成が絡むため、SVG 1 枚から派生させて public 配下に格納する運用を統一します。canonical/og:url のサブパス解決はテストでガードを入れて再発防止します。

### スプリントゴール（確定）

> **「公開サイトとしての外向き品質（ブランドアイコン・SEO メタ・構造化データ）を整え、検索流入と SNS シェア時のブランド体験を成立させる」**

- PBI-066 / PBI-067 / PBI-068 を主軸として確実に Done させる
- ストレッチで PBI-069（Lighthouse SEO/Best Practices/PWA 指摘改善）を Day3 時点の余力判定で投入検討
- 全員合意: 鈴木 ✓ / 伊藤 ✓ / 田中 ✓

---

## トピック2: What（スコープ選択）

### ベロシティ参考

| 指標                 | 値                                     |
| -------------------- | -------------------------------------- |
| 直近スプリント完了   | 3pt（Sprint015、小粒主軸+ストレッチ）  |
| 直近3スプリント平均  | 6.67pt（Sprint013/014/015）            |
| 直近5スプリント平均  | 7.4pt                                  |
| 計画キャパシティ目安 | **6pt（主軸）+ 1pt（ストレッチ候補）** |

> 主軸 3 PBI が同領域（公開サイト品質）で相互依存（PBI-066 のアイコン素材を PBI-067 の og:image に流用、PBI-067 の canonical/og:url 設計を PBI-068 の sitemap.xml と整合）するため、まとめ投入の方が効率が良い。culture 項目 6（6〜9pt）の下限合致。

### PBI選択

| 優先 | PBI     | タイトル                                                                | Size | 選択理由                                                                           |
| ---- | ------- | ----------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------- |
| 1    | PBI-066 | アイコン整備（ファビコン群と PWA manifest）                             | 2pt  | High。ブランド第一接点（タブ/ブックマーク/ホーム画面）。PBI-067 の og:image に派生 |
| 2    | PBI-067 | SEO メタ整備（description/OGP/Twitter Card/canonical/lang/theme-color） | 2pt  | High。検索流入と SNS シェアでブランド体験を成立                                    |
| 3    | PBI-068 | 構造化データと robots.txt/sitemap.xml と 404 ページ整備                 | 2pt  | Medium。検索クロール可能性と公開サイト体裁。PBI-067 の URL 設計を踏襲              |
| ★    | PBI-069 | Lighthouse SEO/Best Practices/PWA 指摘改善と画像属性/noscript 再点検    | 1pt  | Low・ストレッチ。PBI-066/067/068 完了後の Lighthouse 計測で残った指摘を収束        |

**主軸合計: 6pt**（PBI-066 + PBI-067 + PBI-068）  
**ストレッチ含む最大: 7pt**

**鈴木（PO）**: 6pt 主軸で確定。PBI-069 は Day3 時点で主軸 3 PBI が Done 近傍かつ 4h 以上の余力がある場合のみ投入します。  
**全員合意: ✓**

---

## トピック3: How（タスク分解・実装計画）

### PBI-066: アイコン整備（ファビコン群と PWA manifest）（2pt）

| タスクID | 内容                                                                                                                              | 担当 | 見積 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| TASK-301 | ブランドアイコン素材（簡潔な SVG 1 枚）を確定し `project/front/public/icons/` 配下に配置（ライト/ダーク両テーマ視認性確認）       | 田中 | 1.5h |
| TASK-302 | favicon.ico（16/32/48px）/ SVG ファビコン / apple-touch-icon（180px）を派生生成し `project/front/public/` 配下へ配置              | 田中 | 1h   |
| TASK-303 | `manifest.json` を新設（name/short_name/icons 192・512/maskable/theme_color/background_color/start_url/scope/display）            | 伊藤 | 1h   |
| TASK-304 | `index.html` に link rel="icon"/apple-touch-icon/manifest を追加し `import.meta.env.BASE_URL` 経由でサブパス公開に整合（PBI-059） | 伊藤 | 0.5h |
| TASK-305 | vitest: manifest スキーマ検証（必須項目存在）+ index.html リンク参照テスト（モック注入で BASE_URL 検証・PBI-058 規律）            | 中村 | 1h   |
| TASK-306 | 375px / ライト・ダーク両テーマで表示崩れがないこと、GitHub Pages サブパスで manifest/アイコンが解決することを手動回帰確認         | 山本 | 0.5h |

### PBI-067: SEO メタ整備（2pt）

| タスクID | 内容                                                                                                                                       | 担当 | 見積 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ---- |
| TASK-401 | meta description（自然な日本語 70〜120 字）/ html lang="ja" / theme-color / color-scheme をライト/ダーク両テーマ整合で `index.html` に設定 | 田中 | 0.5h |
| TASK-402 | OGP（og:title/og:description/og:image/og:url/og:type=website）と Twitter Card（twitter:card=summary_large_image）を `index.html` に設定    | 田中 | 1h   |
| TASK-403 | og:image を PBI-066 アイコン素材から派生または専用画像で生成し `project/front/public/` 配下へ配置（サブパス参照 PBI-059 規律）             | 田中 | 0.5h |
| TASK-404 | canonical リンクタグを GitHub Pages 公開 URL（サブパス含む）に対し正しく解決するよう設定（env 依存値は props/定数注入・PBI-058 規律）      | 伊藤 | 1h   |
| TASK-405 | vitest: meta タグ存在検証 + canonical/og:url のサブパス解決検証（BASE_URL モック注入で複数ケース）                                         | 中村 | 1h   |
| TASK-406 | 375px / ライト・ダーク両テーマで表示崩れがないこと、Twitter Card Validator / OGP プレビューを手動確認                                      | 山本 | 0.5h |

### PBI-068: 構造化データと robots.txt/sitemap.xml と 404 ページ整備（2pt）

| タスクID | 内容                                                                                                                                 | 担当 | 見積 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---- | ---- |
| TASK-501 | JSON-LD 構造化データ（WebSite または WebApplication）1 件以上を `index.html` に埋め込み（dangerouslySetInnerHTML 不使用・DoD §10-2） | 伊藤 | 1h   |
| TASK-502 | `project/front/public/robots.txt` 新設（GitHub Pages サブパス配下配信・sitemap.xml 参照を含む）                                      | 田中 | 0.5h |
| TASK-503 | `project/front/public/sitemap.xml` 新設（トップページおよび主要画面 URL を含む・サブパス公開で正しく解決・PBI-059 規律）             | 田中 | 1h   |
| TASK-504 | GitHub Pages 用 `404.html` を SPA ルーティングと整合する形で配置し、トップへ戻るリンクを表示（375px/両テーマ表示崩れなし）           | 中村 | 1h   |
| TASK-505 | vitest: JSON-LD スキーマ検証（@context/@type 必須）+ 404 導線（トップへ戻るリンク存在）+ sitemap URL の BASE_URL 整合をテスト追加    | 中村 | 1h   |
| TASK-506 | GitHub Pages 公開後の robots.txt / sitemap.xml / 404 ページ実 URL アクセス確認（サブパス解決の手動回帰）                             | 山本 | 0.5h |

### PBI-069: Lighthouse SEO/Best Practices/PWA 指摘改善（1pt）★ストレッチ

| タスクID | 内容                                                                                                            | 担当 | 見積 |
| -------- | --------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| TASK-601 | Lighthouse の SEO/Best Practices/PWA カテゴリを計測し `project/docs/` 配下にスコアと指摘内容を記録              | 伊藤 | 1h   |
| TASK-602 | critical/serious 相当の主要指摘を解消（Performance カテゴリは対象外）+ 画像 alt/width/height 付与漏れ再点検     | 伊藤 | 1h   |
| TASK-603 | noscript フォールバック文言をプロダクト概要を伝える日本語に整理 + prefers-reduced-motion 配慮の既存実装回帰確認 | 田中 | 0.5h |

### スプリント運用タスク（Sprint015 レトロ持越分）

| タスクID | 内容                                                                              | 担当 | 見積 |
| -------- | --------------------------------------------------------------------------------- | ---- | ---- |
| TASK-901 | 解説 chapter03/06/09 の PBI 案を次回リファインメントへ提出（A-74 継続）           | 鈴木 | 期日 |
| TASK-902 | Day2 / Day4 の沈黙チェック実施結果を `daily_scrum.md` に明示記録（A-76 継続運用） | 高橋 | 都度 |

---

## 5日間スプリント計画

| Day  | 日程        | 伊藤                                 | 田中                            | 山本（助っ人）            | 中村（助っ人）           |
| ---- | ----------- | ------------------------------------ | ------------------------------- | ------------------------- | ------------------------ |
| Day1 | 08/12（水） | TASK-303 + TASK-304                  | TASK-301 + TASK-302             | -                         | TASK-305                 |
| Day2 | 08/13（木） | TASK-404 + TASK-501                  | TASK-401 + TASK-402 + TASK-403  | TASK-306                  | TASK-405                 |
| Day3 | 08/14（金） | ストレッチ判定 → 余力時 TASK-601/602 | TASK-502 + TASK-503             | TASK-406                  | TASK-504 + TASK-505      |
| Day4 | 08/15（土） | ストレッチ実装/検証                  | ストレッチ実装/検証（TASK-603） | TASK-506 + ストレッチ回帰 | ストレッチテスト追従     |
| Day5 | 08/16（日） | 最終仕上げ・DoD 最終確認             | PR 集約・最終品質ゲート         | 余力時のみ補助            | スナップショット最終確認 |

> PBI-069 は Day3 時点で主軸 3 PBI が Done 近傍、かつ 4h 以上の余力がある場合のみ投入する。投入見送り時は Day3 以降を主軸品質固めとバックログリファインメント支援に充てる。

---

## リスク・留意事項

| リスク                                                                        | 対応方針                                                                                              |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GitHub Pages サブパス（`/ai-scrum-inbuscket/`）配下でアイコン/manifest が 404 | PBI-059 規律踏襲。`import.meta.env.BASE_URL` 経由参照 + vitest で BASE_URL モック注入の参照解決テスト |
| canonical/og:url の env 依存でテストが脆くなる                                | PBI-058 規律踏襲。env 依存値は props/定数注入で扱い、テストはモック注入で複数ケース検証               |
| アイコン素材確定の遅延で TASK-302 以降が止まる                                | TASK-301 を Day1 午前で確定。代替案を 2〜3 案事前列挙し、PO 30 分以内にレビュー                       |
| OGP 画像生成の品質不足で SNS シェアプレビューが崩れる                         | TASK-403 で Twitter Card Validator / Facebook Sharing Debugger 手動確認を TASK-406 に組込             |
| sitemap.xml / robots.txt のサブパス解決ミスで検索エンジン側で 404             | TASK-505 で BASE_URL 整合テスト + TASK-506 で公開後の実 URL アクセス確認                              |
| Lighthouse 指摘の収束範囲が読めずストレッチが膨張                             | PBI-069 受入基準に従い Performance カテゴリは対象外と明記。critical/serious のみ対象とし時間厳守      |
| JSON-LD で `dangerouslySetInnerHTML` 誤用                                     | TASK-501 で `<script type="application/ld+json">` を直接 `index.html` に静的埋め込み（DoD §10-2）     |
| 既存テスト（meta/canonical/icon の文字列）の追従漏れ                          | TASK-305/405/505 を独立タスク化し、`pnpm test` / `pnpm tsc --noEmit` の日次回帰で早期検知             |

---

## プランニング合意事項

1. 主軸 3 PBI（PBI-066/067/068・各 2pt・計 6pt）を Day3 終了時に Done 近傍まで進める
2. ストレッチ PBI-069（1pt）は Day3 時点で 4h 以上の余力がある場合のみ投入
3. GitHub Pages サブパス解決は PBI-059 規律（`import.meta.env.BASE_URL`）を踏襲、env 依存テストは PBI-058 規律（モック注入）を踏襲
4. アイコン素材は SVG 1 枚から派生し `project/front/public/icons/` に集約
5. JSON-LD は `<script type="application/ld+json">` で静的埋め込み（DoD §10-2 遵守）
6. 公開後の実 URL 動作確認（robots.txt/sitemap.xml/404）は TASK-506 で必ず実施
7. Day2/Day4 の沈黙チェック（A-76）と次回リファインメント chapter03/06/09 PBI 化（A-74）は継続運用
