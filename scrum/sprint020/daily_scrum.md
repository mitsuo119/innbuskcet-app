# デイリースクラム記録 - Sprint020

> Sprint020 のデイリースクラム記録（DAY1〜DAY5 を本ファイルへ追記）。
> スプリントゴール: JavaScript SEO の技術基盤（History API ルーティング・soft 404 回避）を確立し、SEO 計測運用ドキュメントで継続改善サイクルの土台を整える。

---

## DAY1（2026-09-09）

### 各メンバー報告

| メンバー       | 昨日（前スプリント）                                               | 今日（DAY1）                                                                                                                                                                                      | 障害物 |
| -------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 伊藤           | Sprint019 完了・受入確認メモ運用 A-93 をスプリントバックログに反映 | TASK-076-1: Router.tsx を History API（pushState/popstate/pathname）ベースに移行。`src/nav.ts` 共通ナビゲーション API 新規作成。レガシー `#/...` ハッシュ自動 replaceState による後方互換維持実装 | なし   |
| 田中           | Sprint019 受入確認メモ整理                                         | TASK-076-1 のレビュー・テスト追加（`Router.history.test.tsx` 7 件）。dist build で `transform-seo-tokens.mjs` の置換が引き続き機能することを確認                                                  | なし   |
| 山本（助っ人） | -                                                                  | TASK-076-3 着手前の設計確認のみ。DAY2 から 404 画面コンポーネントの本格実装を開始                                                                                                                 | なし   |
| 中村（助っ人） | -                                                                  | TASK-082-1: `project/docs/seo_operations.md` 新規作成（KPI／監視頻度／担当ロール／Search Console 登録手順／Lighthouse 定点観測手順／スプリント毎チェックリスト雛形）                              | なし   |

### 進捗・適応

- **PBI-076**: TASK-076-1 完了（Router History API 移行）。レガシー `#/...` 互換ロジックを Router 内部に組み込んだことで、TASK-076-4（外部リンク互換）の核機能を前倒し実装済み。残タスク（TASK-076-2/3/5/6）は DAY2 以降で計画通り進行可能。
- **PBI-082**: TASK-082-1 完了（ドキュメント新規作成）。残 TASK-082-2/3 を DAY2-3 で実施。
- **バーンダウン（残 SP）**: 7 → 7（PBI 単位完了は DAY3 以降想定のため、Day1 時点 SP 消化はゼロが計画通り）。
- **残タスク時間**: 22h → 13h（PBI-076: 16h → 12h、PBI-082: 6h → 4h と概算）。

### 障害物

- 新規発生なし。`scrum/impediment_log.csv` への追記不要。

### DAY1 で完了したタスク

- TASK-076-1（伊藤・4h 見積 → 完了）: Router.tsx History API 移行 + `nav.ts` 新規 + 暫定 404 画面 + meta robots noindex 同期 + レガシーハッシュ自動移行
- TASK-082-1（中村・2h 見積 → 完了）: `project/docs/seo_operations.md` 新規作成

### DAY1 検証結果

| 検証項目                                                                   | 結果                                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `pnpm exec tsc -b`                                                         | エラー 0                                                                    |
| `pnpm lint`                                                                | エラー 0                                                                    |
| `pnpm test`（vitest run）                                                  | **51 files / 527 tests PASS**（前 520 → +7：Router.history.test.tsx 新規）  |
| `pnpm build`（VITE_BASE_URL/VITE_SITE_URL 注入）                           | ビルド成功 / `__SITE_URL__` 置換成功（robots.txt / sitemap.xml / 404.html） |
| `seo-assets.test.ts` / `Router.seo.test.tsx` / `Router.reference.test.tsx` | レガシーハッシュ互換維持により全 PASS                                       |
| `pnpm audit`（High/Critical）                                              | DAY3 で Sprint Review 用に再実施予定（前スプリント末時点で 0）              |

### 明日の計画（DAY2）

- 伊藤: TASK-076-6 のうち手動動作確認シナリオの素案化（Day3 から本格実施）
- 田中: TASK-076-2（GitHub Pages SPA フォールバック整備：404.html → index.html リダイレクト戦略整理）
- 山本: TASK-076-3（404 画面コンポーネント本格実装：暫定実装の差し替え + Router 連携 + ユニットテスト）
- 中村: TASK-082-2（Search Console 登録手順 + Lighthouse SEO 定点観測手順を `seo_operations.md` で `lighthouse-sprint016.md` と相互参照付き整合）

### 残タスクと持越し方針

- 持越し: なし（DAY1 計画通り完了）
- 残 SP: 7pt（PBI-076: 5pt + PBI-082: 2pt）。バーンダウン平滑化は DAY2 / DAY3 で確認。

---

## DAY2（2026-09-10）

### 各メンバー報告

| メンバー | 昨日（DAY1）                                      | 今日（DAY2）                                                                                                                                                                                                                                                                               | 障害物 |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 伊藤     | TASK-076-1 完了（Router History API 移行）        | TASK-076-6 シナリオ素案を `project/docs/pbi076_manual_verification.md` に起票（S1〜S13 + 公開後検証）。本格実施は DAY3                                                                                                                                                                     | なし   |
| 田中     | DAY1 レビュー・`Router.history.test.tsx` 7 件追加 | TASK-076-2: `404.html` SPA フォールバック inline script + `index.html` 復元 inline script 実装。`__SITE_URL__` トークン経由で base path を解決。TASK-082-3: `pr_checklist.md` §10 SEO 節新設＋`seo_operations.md` 双方向リンク。TASK-076-5 一部: 内部 href 移行に伴うテスト更新 5 ファイル | なし   |
| 山本     | TASK-076-3 設計確認                               | TASK-076-3: `src/pages/NotFound.tsx` + `NotFound.css` に分離（Router 内 NotFoundView 撤去）。a11y/タップ領域/両テーマ対応。TASK-082-2: `seo_operations.md` §6 に `lighthouse-sprint016.md` との横断ドキュメントセット明記、`lighthouse-sprint016.md` 末尾に逆参照追記                      | なし   |
| 中村     | TASK-082-1 完了                                   | TASK-076-4: 内部 `href="#/..."` を `href="/..."` 形式へ段階移行（App.tsx footer / GlobalNav / ExplanationView / ReferencePage / referenceData / explanationPatternLinks）。Router の delegated click handler が両形式を吸収するため外部ブックマーク互換は維持                              | なし   |

### 進捗・適応

- **PBI-076**: TASK-076-2/3/4 完了。TASK-076-5 は内部 href 移行に伴うテスト更新を実施（GlobalNav.test / LegalPages.test / ReferencePage.test / explanationPatternLinks.test / Router.reference.test）。`sitemap.xml` URL 構造刷新と整合チェック追加は DAY3。TASK-076-6 はシナリオ起票済 → DAY3 実施。
- **PBI-082**: TASK-082-2/3 完了。`seo_operations.md` ↔ `lighthouse-sprint016.md` ↔ `pr_checklist.md` の三角リンクが完成。**PBI-082 の DoD 範囲はソフト完了**（DAY3 でビルド最終確認のみ）。
- **バーンダウン（残 SP）**: 7 → 2（PBI-082 ソフト完了 2pt 消化扱い → DAY3 のレビュー判定で確定）。PBI-076 は受入基準 1〜5 のうち 1/3/4/5 ソフト完了（実 URL 互換は DAY3 手動検証で最終確定、受入基準 2 の CI 配信はデプロイ完走で完了）。
- **残タスク時間**: 13h → 4h（PBI-076: 12h → 4h（TASK-076-5 残＋TASK-076-6）、PBI-082: 4h → 0h）。

### 障害物

- 新規発生なし。`scrum/impediment_log.csv` への追記不要。

### DAY2 で完了したタスク

- TASK-076-2（田中・2h 見積 → 完了）: GitHub Pages SPA フォールバック inline script を 404.html / index.html に追加、dist 配信検証済
- TASK-076-3（山本・3h 見積 → 完了）: `pages/NotFound.tsx` + `NotFound.css` 分離、a11y/レスポンシブ対応
- TASK-076-4（中村・2h 見積 → 完了）: 内部 href 6 ファイルを pathname 形式へ移行
- TASK-082-2（山本・2h 見積 → 完了）: Lighthouse 手順と SC 手順を seo_operations.md / lighthouse-sprint016.md で双方向参照化
- TASK-082-3（田中・2h 見積 → 完了）: pr_checklist.md §10 SEO 節新設、seo_operations.md §7 に pr_checklist リンク追記
- TASK-076-5 一部（田中）: 内部 href テスト 5 ファイル更新（残: sitemap.xml URL 刷新・整合追加テスト）
- TASK-076-6 起票（伊藤）: `pbi076_manual_verification.md` 新規作成（S1〜S13 + 公開後検証）

### DAY2 検証結果

| 検証項目                                                                | 結果                                                                                          |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm exec tsc -b`                                                      | エラー 0                                                                                      |
| `pnpm lint`                                                             | エラー 0                                                                                      |
| `pnpm test`（vitest run）                                               | **51 files / 527 tests PASS**（DAY1 と同件数維持）                                            |
| `pnpm build`（VITE_BASE_URL=/ai-scrum-inbuscket/ + VITE_SITE_URL 注入） | 成功 / `__SITE_URL__` 置換が robots.txt / sitemap.xml / 404.html で正常                       |
| dist 配信ファイル確認                                                   | dist/404.html に SPA fallback script 含む / dist/index.html に復元 script 含む（grep で確認） |
| `pnpm audit --prod --audit-level high`                                  | `No known vulnerabilities found`                                                              |

### 明日の計画（DAY3）

- 伊藤: TASK-076-6 本格実施（`pnpm preview` でローカル S1〜S13 シナリオ実施→結果記録）
- 田中: TASK-076-5 残（`sitemap.xml` を `#/...` から pathname 形式へ刷新＋`seo-assets.test.ts` の sitemap 整合チェックを新URL構造で更新）
- 山本: PBI-076 / PBI-082 横断 DoD 検証＋受入確認メモ運用（A-93）の §スプリント内完了確認 を順次チェック
- 中村: 手動検証で発見された不具合があれば修正対応／余裕があれば次スプリント PBI 候補（PBI-077〜081）の事前読み込み
- SM 高橋: バーンダウン更新／DAY4 以降の Sprint Review 準備（`sprint_review.md` 雛形整備）

### 残タスクと持越し方針

- 残: TASK-076-5（sitemap URL 刷新＋整合テスト）／TASK-076-6（手動検証実施）
- 残 SP: 0pt 相当（PBI-076 のスプリント内タスクは DoD 検証段階のみ）
- 持越しリスク: なし。R-3（手動確認重さ）は DAY3〜DAY4 で吸収可。

---

## DAY3（2026-09-11）

### 各メンバー報告

| メンバー       | 昨日（DAY2）                                                       | 今日（DAY3）                                                                                                                                                                                                                 | 障害物 |
| -------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 伊藤           | TASK-076-6 シナリオ起票（`pbi076_manual_verification.md` S1〜S13） | TASK-076-6 本格実施: `pnpm preview --port 4173` で S1〜S13 を実機検証→全件 PASS。実施記録を §3 に追記。インタラクション系（S7〜S13）は Router.history.test / Router.seo.test / nav.ts の既存テスト群で恒常検証済             | なし   |
| 田中           | TASK-076-2 / TASK-082-3 / TASK-076-5 一部完了                      | TASK-076-5 残対応: `public/sitemap.xml` を `#/...` から pathname 形式へ刷新（13 件すべて）。`seo-assets.test.ts` の sitemap 整合チェックを新URL構造で更新＋hash URL 不在の保証テストを 1 件追加。robots.txt は変更不要を確認 | なし   |
| 山本（助っ人） | TASK-076-3 / TASK-082-2 完了                                       | DoD 21 項目横断検証。tsc/lint/vitest/build/audit/手動検証/a11y/入力検証 全て「はい」を確認しスプリントバックログのチェックリストを更新                                                                                       | なし   |
| 中村（助っ人） | TASK-076-4 完了                                                    | 不具合監視（実機検証で不具合検出ゼロ）／次スプリント候補 PBI-077〜081 の事前読み込み                                                                                                                                         | なし   |

### 進捗・適応

- **PBI-076**: 全タスク（TASK-076-1〜6）完了。受入基準 1〜6 すべて充足（基準 2 のデプロイ配信は GitHub Pages 反映後の §公開後確認 で最終確定）。**Done（レビュー待ち）**へ遷移。
- **PBI-082**: DAY2 で実装完了済。DAY3 はビルド/テスト最終確認のみで **Done（レビュー待ち）**を維持。
- **バーンダウン（残 SP）**: 2 → 0（PBI-076 5pt + PBI-082 2pt = 7pt 全て消化扱い／受入は Sprint Review で確定）。
- **残タスク時間**: 4h → 0h。

### 障害物

- 新規発生なし。`scrum/impediment_log.csv` への追記不要。

### DAY3 で完了したタスク

- TASK-076-5（田中・3h 見積 → 完了）: sitemap.xml の pathname 化（13 URL）／seo-assets.test.ts の sitemap 整合テスト更新＋hash URL 不在検証を追加（+1 test）
- TASK-076-6（伊藤・2h 見積 → 完了）: ローカル `pnpm preview` で S1〜S13 全件 PASS／pbi076_manual_verification.md §3 へ実施記録追記

### DAY3 検証結果

| 検証項目                                                                | 結果                                                                       |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm exec tsc -b`                                                      | エラー 0                                                                   |
| `pnpm lint`                                                             | エラー 0                                                                   |
| `pnpm test`（vitest run）                                               | **51 files / 528 tests PASS**（DAY2 比 +1: sitemap hash 不在テスト）       |
| `pnpm build`（VITE_BASE_URL=/ai-scrum-inbuscket/ + VITE_SITE_URL 注入） | 成功 / `__SITE_URL__` を robots.txt / sitemap.xml / 404.html で置換        |
| dist/sitemap.xml `<loc>` 全 13 件                                       | すべて pathname 形式（`#/` 不在）／公開 URL 化済                           |
| `pnpm audit --prod --audit-level high`                                  | `No known vulnerabilities found`                                           |
| TASK-076-6 手動検証 S1〜S13                                             | **全件 PASS**（実施記録: `project/docs/pbi076_manual_verification.md` §3） |
| DoD 21 項目横断確認                                                     | 全て「はい」（§1〜§10 / 詳細は sprint_backlog.md 受入確認メモ参照）        |

### 明日の計画（DAY4）

- 伊藤: Sprint Review 用デモシナリオの整理（History API 移行・404 noindex・legacy hash 互換のデモ動線）
- 田中: PR 仕上げ（変更ファイル一覧・PRチェックリスト §10 SEO 節記入・Issue クロスリンク）
- 山本: 公開後検証準備（GitHub Pages 反映後の §公開後確認 4 項目を Sprint Review 直後に実行できるよう手順整理）
- 中村: 次スプリント候補 PBI-077〜081 のリファインメントメモ起票（Sprint Review 内で PO 鈴木へ共有）
- SM 高橋: `sprint_review.md` / `sprint_retrospective.md` 雛形整備、velocity.csv 反映準備

### 残タスクと持越し方針

- 残: なし（PBI-076 / PBI-082 ともスプリント内タスク完了）
- 残 SP: 0pt
- 持越しリスク: GitHub Pages 反映後の §公開後確認 4 項目は Sprint Review 後の実機反映タイミングに依存（A-93 運用通り次スプリント以降でも追跡可能）

---

## DAY4（2026-09-12）

### 各メンバー報告

| メンバー       | 昨日（DAY3）                                                                 | 今日（DAY4）                                                                                                                                                                                                                           | 障害物 |
| -------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 伊藤           | TASK-076-6 手動検証 S1〜S13 全件 PASS／pbi076_manual_verification.md §3 記録 | Sprint Review 用デモシナリオ整理（D1〜D8）を `sprint_review.md` §2 に起票。`pnpm preview` 動線を D1 直接URL → D2 pushState → D3 popstate → D4 soft 404 → D5 legacy hash → D6 修飾キー → D7 sitemap → D8 SEO 運用ドキュメントの順に整列 | なし   |
| 田中           | TASK-076-5 sitemap pathname 化＋整合テスト追加（528 tests PASS）             | PR 仕上げ準備：変更ファイル一覧整理／`pr_checklist.md` §10（SEO/サイトマップ整合）チェック項目を本スプリント PR で初運用予定としてドラフト記入。Issue クロスリンクは PR 作成時に最終付与                                               | なし   |
| 山本（助っ人） | DoD 21 項目横断検証（全て「はい」）                                          | 公開後確認 4 項目の責任分担と手順を整備：`pbi076_manual_verification.md` §4 を表形式に再構成（主担当/期限/結果欄）。`handoff_for_next_sprint.md` §1 を新規作成し C1〜C4 の手順・コマンド・期待結果を明文化                             | なし   |
| 中村（助っ人） | 不具合監視（検出 0）／PBI-077〜081 事前読み込み                              | 次スプリント候補 PBI-077〜081 のリファインメントメモを `handoff_for_next_sprint.md` §2 に整備（Sprint020 完了状況を踏まえた残作業観点・依存関係・プランニング議論ポイントを記述）                                                      | なし   |

### 進捗・適応

- **PBI-076 / PBI-082**: DAY3 で Done(レビュー待ち) 確定済。DAY4 は実装変更なし、レビュー準備・公開後確認準備・引き継ぎ整備に集中。
- **バーンダウン（残 SP）**: 0 → 0（DAY3 から維持）。Sprint Review での受入判定で確定。
- **残タスク時間**: 0h → 0h。
- **DAY4 で完了したドキュメント整備**: `sprint_review.md`（雛形＋デモシナリオ D1〜D8）／`sprint_retrospective.md`（雛形＋ Keep/Problem/Try ドラフト＋A-93/A-94 中間ステータス）／`handoff_for_next_sprint.md`（公開後確認責任分担＋Sprint021 候補 PBI 事前メモ）／`pbi076_manual_verification.md` §4 の表形式化。

### 障害物

- 新規発生なし。`scrum/impediment_log.csv` への追記不要。

### DAY4 で完了した作業

- 伊藤: Sprint Review デモシナリオ D1〜D8 整理（`sprint_review.md` §2）
- 田中: PR 仕上げ準備（変更ファイル一覧整理／pr_checklist §10 ドラフト記入）
- 山本: 公開後確認 4 項目の責任分担・手順整備（`handoff_for_next_sprint.md` §1／`pbi076_manual_verification.md` §4）
- 中村: Sprint021 候補 PBI-077〜081 のリファインメントメモ整備（`handoff_for_next_sprint.md` §2）
- SM 高橋: `sprint_review.md` / `sprint_retrospective.md` 雛形整備、velocity.csv 反映準備（DAY5 確定）

### DAY4 検証結果（変更なし確認）

| 検証項目                               | 結果（DAY3 同等を維持確認）                 |
| -------------------------------------- | ------------------------------------------- |
| `pnpm exec tsc -b`                     | エラー 0（DAY3 状態を維持。コード変更なし） |
| `pnpm lint`                            | エラー 0（同上）                            |
| `pnpm test`（vitest run）              | 51 files / 528 tests PASS（同上）           |
| `pnpm build`                           | 成功（同上）                                |
| `pnpm audit --prod --audit-level high` | `No known vulnerabilities found`（同上）    |

### 明日の計画（DAY5）

- 伊藤: Sprint Review 実施（デモ D1〜D8）／佐藤フィードバック収集
- 田中: PR 最終化・マージ準備（Sprint Review 後に GitHub Pages デプロイトリガ）／公開後確認 C1〜C2 のサポート
- 山本: 公開後確認 C1（noindex 反映）／C2（legacy hash 自動遷移）の即時実行＋結果記録
- 中村: 公開後確認 C3（Search Console URL 検査）の起動／C4（Lighthouse 定点観測）の Sprint021 DAY1 試行準備
- 鈴木（PO）: 受入判定確定／Sprint021 候補 PBI の優先度再確認
- SM 高橋: Sprint Review / Retrospective ファシリテーション／`velocity.csv` 反映／`product_backlog.csv` 状態更新（PBI-076/082 を Done へ）／Sprint Retrospective 確定

### 残課題と DAY5 計画

- 残: 受入判定確定（鈴木）／公開後確認 C1〜C4 の実行（山本・中村中心）／PR マージ・デプロイ（田中）／レビュー・レトロ確定（高橋）／velocity.csv / product_backlog.csv 反映（高橋）
- 残 SP: 0pt（受入確定で 7pt 完了）
- 持越しリスク: C3 Search Console URL 検査はクロール反映タイミング依存で Sprint021 DAY1〜2 にずれ込む可能性あり。`handoff_for_next_sprint.md` §1 に明記済で追跡可。

---

## DAY5（2026-09-13）

### 各メンバー報告

| メンバー       | 昨日（DAY4）                                                     | 今日（DAY5）                                                                                                                                                                                                                                       | 障害物 |
| -------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 伊藤           | Sprint Review デモシナリオ D1〜D8 整理（`sprint_review.md` §2）  | Sprint Review 用 final smoke：`pnpm test`(528 PASS)／`pnpm build`／dist 検証（404.html noindex+spa-fallback、index.html restore script、sitemap.xml 13件 `<loc>`）を再実行し受入証跡として確定。デモ動線 D1〜D8 を `pnpm preview` で最終リハーサル | なし   |
| 田中           | PR 仕上げ準備（変更ファイル一覧整理／pr_checklist §10 ドラフト） | PR 最終化 & マージ準備完了。`pr_checklist.md` §10 SEO/サイトマップ整合チェック項目をすべて充足確認。Sprint Review 後デプロイ起動準備（GitHub Actions ワークフロー再確認）                                                                          | なし   |
| 山本（助っ人） | 公開後確認 4 項目の責任分担・手順整備                            | C1（noindex 反映）／C2（legacy hash 自動遷移）の **ローカル代理検証** を `pnpm preview` で実施し全件期待結果通り。本番 C1/C2 はデプロイ反映後に即時実行（責任分担表通り）                                                                          | なし   |
| 中村（助っ人） | Sprint021 候補 PBI-077〜081 リファインメントメモ整備             | C3（Search Console URL 検査）／C4（Lighthouse 定点観測）の起動準備完了。Sprint021 DAY1 試行手順を `handoff_for_next_sprint.md` §1 と相互参照済                                                                                                     | なし   |

### 進捗・適応

- **PBI-076 / PBI-082**: DAY5 で受入判定確定見込（Sprint Review 内）。実装変更なし、最終証跡確定とローカル代理検証に集中。
- **バーンダウン（残 SP）**: 0 → 0（受入判定で 7pt 完了確定見込）。
- **残タスク時間**: 0h → 0h。
- **DAY5 で実行した検証**: `pnpm exec tsc -b`(0)／`pnpm lint`(0)／`pnpm test`(51 files / 528 tests PASS)／`pnpm build`(成功・`__SITE_URL__` 置換 OK)／`pnpm audit --prod --audit-level high`(`No known vulnerabilities found`)／dist 配信物 grep 確認（404.html `meta robots="noindex"` + spa-fallback save script ／ index.html restore script + replaceState ／ sitemap.xml `<loc>` 13 件）。

### 障害物

- 新規発生なし。`scrum/impediment_log.csv` への追記不要。20 スプリント連続障害物ゼロを維持。

### DAY5 で完了した作業

- 伊藤: Sprint Review final smoke（528 PASS／dist 検証）+ デモ D1〜D8 リハーサル
- 田中: PR 最終化準備（pr_checklist §10 充足確認）／デプロイ起動準備
- 山本: C1/C2 ローカル代理検証（`pnpm preview` で 404 noindex / legacy hash replaceState 確認）／本番即時実行手順最終確認
- 中村: C3/C4 起動準備（Search Console URL 検査 + Lighthouse 定点観測の Sprint021 DAY1 試行段取り）
- SM 高橋: Sprint Review / Retrospective ファシリテーション準備、`velocity.csv`／`product_backlog.csv`／`product_backlog_done.csv`／`sprint_backlog.md` 受入確認メモへの反映を DAY5 中に確定

### 受入判定証跡（Sprint Review 提示用・最終確定）

| 受入確認項目（A-93 §スプリント内完了確認）                 | 証跡                                                                    | 結果         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- | ------------ |
| PBI-076: tsc 0 / lint 0 / vitest 全件 PASS / build / audit | DAY5 検証ログ（51 files / 528 tests PASS）                              | 充足         |
| PBI-076: 直接URL／戻る進む／修飾キー手動確認（S1〜S13）    | `pbi076_manual_verification.md` §3                                      | 充足         |
| PBI-076: 404 画面 noindex メタ反映（dist/404.html）        | dist/404.html 6 行目 `<meta name="robots" content="noindex" />`         | 充足         |
| PBI-082: ドキュメント新規＋三角リンク整合                  | `seo_operations.md` ↔ `lighthouse-sprint016.md` ↔ `pr_checklist.md` §10 | 充足         |
| DoD 21 項目                                                | `sprint_backlog.md` DAY3 補足                                           | 全て「はい」 |

### ローカル代理検証（公開後確認 C1/C2 の前倒し確認）

| #       | 内容                                                                 | コマンド                                                | 結果                                            |
| ------- | -------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| C1 代理 | dist/404.html に `noindex` メタが含まれる                            | `Select-String dist\404.html -Pattern 'noindex'`        | `<meta name="robots" content="noindex" />` 検出 |
| C2 代理 | dist/index.html に legacy hash 復元 script（replaceState）が含まれる | `Select-String dist\index.html -Pattern 'replaceState'` | `history.replaceState(null, '', saved);` 検出   |

> 本番 C1/C2 は Sprint Review 終了 → GitHub Pages デプロイ反映後 30 分以内に山本（主担当）が実行し、`sprint_backlog.md` 受入確認メモ §公開後確認 のチェックボックスを更新する（責任分担: `handoff_for_next_sprint.md` §1）。C3 はクロール反映待ち（Sprint021 DAY1〜2）、C4 は Sprint021 DAY1 試行。

### 明日（Sprint Review 当日 / Sprint021 DAY1）の計画

- 鈴木（PO）: Sprint Review で受入確定（PBI-076 / PBI-082）／Sprint021 候補優先度確定
- 高橋（SM）: Sprint Review・Retrospective 実施／`velocity.csv`・`product_backlog_done.csv` 反映確定（DAY5 中に下書き完了）
- 田中: マージ → デプロイ起動 → C1/C2 監視サポート
- 山本: 本番 C1（noindex）／C2（legacy hash）即時実行
- 中村: 本番 C3（Search Console URL 検査）起動／C4（Lighthouse）Sprint021 DAY1 試行

### 残課題（Sprint Review 後フォロー）

- 本番 C1 / C2 実行（Sprint Review 終了 + デプロイ後 30 分以内・山本主担当）
- 本番 C3 結果記録（Sprint021 DAY1〜2・中村主担当・クロール反映タイミング依存）
- 本番 C4 試行（Sprint021 DAY1・中村主担当）
- これらは `handoff_for_next_sprint.md` §1 表で追跡。Sprint020 内タスクとしては完結。
