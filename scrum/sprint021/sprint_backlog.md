# スプリントバックログ - Sprint021

## スプリント情報

| 項目             | 内容                                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スプリント       | Sprint021                                                                                                                                                                                                         |
| 期間             | 2026-09-16 〜 2026-09-22                                                                                                                                                                                          |
| スプリントゴール | 検索流入を実コンテンツへ展開する前段として、sitemap/robots 自動生成・内部遷移の `<a href>` 化・canonical/メタ重複自動検知の3つの構造的ゲートを確立し、以降のコンテンツ追加（PBI-079/080）が安全に進む土台を整える |
| 計画SP           | 8pt                                                                                                                                                                                                               |
| 参加開発者       | 伊藤、田中（コア）、山本、中村（助っ人）                                                                                                                                                                          |

---

## PBI一覧

| PBI     | タイトル                                         | SP  | 優先度 | 状態                                      |
| ------- | ------------------------------------------------ | --- | ------ | ----------------------------------------- |
| PBI-081 | sitemap.xml/robots.txt のビルド時自動生成        | 2   | Medium | 完了（DAY4 DoD 検証済）                   |
| PBI-077 | 内部遷移の `<a href>` 化とクローラ可視リンク監査 | 3   | High   | 完了（DAY3 タスク完了 / DAY4 DoD 検証済） |
| PBI-078 | canonical/メタ重複網羅レビューと自動テスト拡張   | 3   | Medium | 完了（DAY4 タスク完了）                   |

---

## タスクボード

### PBI-081 sitemap.xml/robots.txt のビルド時自動生成（2pt）

**受入基準:**

- Router 定義を単一ソースとしビルドスクリプトで sitemap.xml を生成する
- sitemap 掲載 URL と実ルートの不整合を検知するテスト（`sitemap-coverage.test`）を追加し FAIL 時 CI が落ちる
- robots.txt に Sitemap 参照が含まれビルド出力で `__SITE_URL__` が置換される
- ルート追加→自動反映までの手順を `seo_metadata_sitemap_guide.md` へ反映する
- PBI-076 完了を前提とする
- DoD 21 項目すべて「はい」

| タスクID   | 内容                                                                                                                                        | 担当 | 見積 | 状態 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ---- |
| TASK-081-1 | Router 定義（公開ルート一覧）を単一ソース化（`src/routes.ts` 等で SEO 対象 path/priority/changefreq を export）                             | 田中 | 2h   | 完了 |
| TASK-081-2 | ビルド時 sitemap.xml 生成スクリプト整備（`scripts/generate-sitemap.mjs` 新設または transform-seo-tokens.mjs 拡張・`__SITE_URL__` 置換含む） | 田中 | 2h   | 完了 |
| TASK-081-3 | `sitemap-coverage.test` 追加（実ルート vs `dist/sitemap.xml` 掲載 URL の差分検知・CI で FAIL）                                              | 伊藤 | 2h   | 完了 |
| TASK-081-4 | `seo_metadata_sitemap_guide.md` にルート追加→自動反映手順を追記＋pr_checklist §10 相互リンク確認                                            | 中村 | 1h   | 完了 |

---

### PBI-077 内部遷移の `<a href>` 化とクローラ可視リンク監査（3pt）

**受入基準:**

- 主要画面（ホーム/解説/パターン一覧・詳細/学習導線/Exam スタート/Quick・Deep）の遷移要素が `<a href="/...">` で実装されている
- onClick 単独でのナビゲーション箇所が 0 件（リンクとして機能する）
- 修飾キー（Ctrl/⌘+クリック・ミドルクリック）で新規タブ開ける挙動を回帰テストで担保
- 既存のキーボード操作テストおよび a11y テストが全て PASS
- PBI-076 完了を前提とする
- DoD 21 項目すべて「はい」

| タスクID   | 内容                                                                                                                    | 担当 | 見積 | 状態 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ---- |
| TASK-077-1 | onClick 単独遷移箇所の網羅監査（grep `navigate(` / `onClick.*push` 等）と移行対象一覧化（Quick/Deep/Exam スタート中心） | 伊藤 | 1h   | 完了 |
| TASK-077-2 | Quick / Deep スタートボタンの `<a href="/...">` 化＋既存 onClick の preventDefault/router delegate 連携                 | 山本 | 2h   | 完了 |
| TASK-077-3 | Exam スタート / 結果画面からの遷移要素の `<a href>` 化（残存 onClick 単独箇所を 0 件に）                                | 伊藤 | 2h   | 完了 |
| TASK-077-4 | 修飾キー新規タブ・ミドルクリック・キーボード操作の回帰テスト追加（`Router.history.test.tsx` 拡張）                      | 田中 | 2h   | 完了 |
| TASK-077-5 | a11y チェックリスト（`a11y_checklist.md`）に沿ってフォーカス順序・キーボード操作・コントラスト退行確認＋DoD 検証        | 伊藤 | 1h   | 完了 |

---

### PBI-078 canonical/メタ重複網羅レビューと自動テスト拡張（3pt）

**受入基準:**

- 公開全ルートに対し title・description・canonical が一意であることを自動テスト（`seo.test.ts` 拡張）で重複 0 件検証
- canonical は絶対 URL で自身のルート相当を指す
- 404 相当ページには noindex メタが付与される
- ルート追加時にメタ未定義を検知して失敗するテストを追加
- `seo_metadata_sitemap_guide.md` を更新する
- PBI-076 完了を前提とする
- DoD 21 項目すべて「はい」

| タスクID   | 内容                                                                                                                | 担当 | 見積 | 状態 |
| ---------- | ------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ---- |
| TASK-078-1 | 公開ルート × メタ（title/description/canonical/OGP）のマトリクス棚卸し（PBI-081 単一ソースを利用）                  | 田中 | 1h   | 完了 |
| TASK-078-2 | `Router.seo.test.tsx` 拡張: 全公開ルートを反復走査し title/description/canonical の一意性を Set で検証（重複 0 件） | 田中 | 2h   | 完了 |
| TASK-078-3 | canonical 絶対 URL 化検証（`__SITE_URL__` 置換済かつ自ルート整合）テスト追加                                        | 伊藤 | 1h   | 完了 |
| TASK-078-4 | 新規ルート追加時にメタ未定義を検知する fail-on-missing テスト追加（applySEO 呼出有無の網羅検証）                    | 伊藤 | 2h   | 完了 |
| TASK-078-5 | `seo_metadata_sitemap_guide.md` 更新（メタ重複検知運用・追加方法）＋DoD 検証                                        | 中村 | 1h   | 完了 |

---

## スプリントゴール達成戦略

1. **DAY1 で TASK-081-1（Router 単一ソース化）を最優先で確定**: PBI-077（href 対象棚卸し）と PBI-078（メタマトリクス棚卸し）の前提となるため、田中が午前で完了させる。
2. **DAY1〜2 で PBI-081 を完走**: sitemap/robots 自動生成基盤を早期に立ち上げ、Sprint022 以降のコンテンツ拡充 PBI への波及効果を最大化。
3. **DAY3 で PBI-077 を完走**: マークアップ変更中心のため UI 退行リスク低。回帰テストで修飾キー新規タブ・キーボード操作を恒常化。
4. **DAY4 で PBI-078 完走＋全 PBI DoD 検証**: メタ重複検知の自動テストを Sprint022（PBI-079/080）前に確実に敷く。
5. **DAY5 を最終品質ゲート＋ハンドオフ整備に充当**: A-95/A-96 で標準化した「公開後確認」「助っ人事前メモ」テンプレで持越なく着地。

---

## リスク／依存

- **R-1（中）**: TASK-081-1（Router 単一ソース化）が DAY1 内に終わらないと、PBI-077/PBI-078 の棚卸し精度が落ちる。SM が DAY1 デイリーで進捗確認。
- **R-2（小）**: PBI-077 の `<a href>` 化で Quick/Deep の状態保持（modeToggle 等）が href 経由遷移で初期化されないか要確認。TASK-077-2 で sessionStorage 連携の回帰確認。
- **R-3（小）**: PBI-078 の重複メタ検知テストは既存テストとの二重定義リスクあり。TASK-078-2 で `Router.seo.test.tsx` 拡張 vs 新規ファイル新設をペア判断。
- **D-1**: PBI-079 / PBI-080 は Sprint021 では着手しない。Sprint022 以降の単独スプリント候補（A-94 観点で DAY 単位タスク粒度を再設計）。

---

## 受入確認メモ運用（A-93 継続適用）

> Sprint019 レトロ Try A-93 を Sprint020 に続き Sprint021 でも継続適用。Sprint Review 前に各 PBI ごとに以下 2 区分で確認メモを本ファイル末尾に追記する。

### スプリント内完了確認（ローカル / CI で検証可能な範囲）

- [x] PBI-081: tsc 0 / lint 0 / vitest 全件 PASS（`sitemap-coverage.test` 含む） / build 成功 / `pnpm audit --prod --audit-level high` クリーン
- [x] PBI-081: `dist/sitemap.xml` が pathname 形式で全公開ルートを掲載・`__SITE_URL__` 置換済を確認
- [x] PBI-081: `dist/robots.txt` に `Sitemap: <絶対URL>/sitemap.xml` 行が存在し `__SITE_URL__` 置換済を確認
- [x] PBI-077: tsc 0 / lint 0 / vitest 全件 PASS（`Router.history.test.tsx` 拡張含む） / build 成功
- [x] PBI-077: 主要画面の遷移要素を grep で確認し onClick 単独遷移が 0 件
- [x] PBI-077: a11y チェックリスト（フォーカス順序・キーボード操作・コントラスト AA）退行 0 件
- [x] PBI-078: tsc 0 / lint 0 / vitest 全件 PASS（`Router.seo.test.tsx` 拡張含む） / build 成功
- [x] PBI-078: 全公開ルートの title/description/canonical 重複 0 件・メタ未定義 0 件をテストで検証
- [x] PBI-078: `seo_metadata_sitemap_guide.md` 更新確認

### 公開後確認（GitHub Pages 反映後／Sprint020 持越分含む）

- [x] **C3（Sprint020 持越）**: Search Console URL 検査で `/`, `/reference`, `/patterns/8` がインデックス可能と判定（中村・DAY2 完了 → DAY5 で `seo_operations.md` §9 へ反映）
- [x] **C4（Sprint020 持越）**: Lighthouse SEO 定点観測手順（`seo_operations.md` §4）を試行し 1 回スコア取得・記録（中村・DAY1 試行 → DAY5 で `seo_operations.md` §9 へ反映）
- [x] **order011 (b)**: Search Console の主要 KPI（インデックス済ページ数／表示回数／クリック数／平均掲載順位）取得運用を整理し Sprint Review §5 で「公開後 14 日未満は測定 0 期」を口頭共有する方針を確定（中村・DAY5）
- [ ] PBI-081: 本番デプロイ後 `https://katuz.github.io/ai-scrum-inbuscket/sitemap.xml` が新生成版で配信されている（Sprint Review 後 30 分以内に山本が確認 → `handoff_for_helpers.md` で追跡）
- [ ] PBI-081: `https://katuz.github.io/ai-scrum-inbuscket/robots.txt` の Sitemap 参照が絶対 URL であることを確認（同上）

> ※ PBI-081 公開後確認 2 項目はDAY5ローカル `pnpm build` 結果（dist/sitemap.xml・robots.txt が `https://katuz.github.io/ai-scrum-inbuscket/` で絶対 URL 化済）でドライラン合格を確認済。本番デプロイ後の最終確認のみ Sprint Review 直後タスクとして残置。

---

## 助っ人向け事前メモ（A-96 標準化適用・DAY3 着手 / DAY4 完成）

> Sprint022 候補 PBI（PBI-079 / PBI-080）の事前リファインメントメモを `handoff_for_helpers.md` に DAY3〜4 で整備する。SM 高橋が DAY3 デイリーで進捗を口頭確認。

---

## 更新履歴

| 日付       | 更新内容                                                                                                                                                                                                                                                                                                                                  | 更新者     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 2026-09-16 | 初版作成（PBI-081/077/078 を Sprint021 に投入・8pt 計画／公開後確認 C3/C4 持越組込／A-95/A-96 反映）                                                                                                                                                                                                                                      | 高橋（SM） |
| 2026-09-17 | DAY2 進捗反映：TASK-081-2 / 081-3 / 078-1 完了。PBI-081 残は TASK-081-4 のみ（DAY3 完了見込み）。                                                                                                                                                                                                                                         | 高橋（SM） |
| 2026-09-18 | DAY3 進捗反映：TASK-077-2/3/4/5 完了（onClick 単独遷移 0 件・Router.history.test.tsx 12 ケース追加）／TASK-081-4 完了で PBI-081 完走。                                                                                                                                                                                                    | 高橋（SM） |
| 2026-09-19 | DAY4 進捗反映：TASK-078-2/3/4/5 完了（Router.seo.test.tsx +6 ケース・canonical 自ルート同期）。PBI-081/077/078 すべて完了。残は DAY5 公開後確認・PR 整備。                                                                                                                                                                                | 高橋（SM） |
| 2026-09-22 | DAY5 最終化：最終品質ゲート全緑（test 557 / tsc 0 / lint 0 / build 成功 / audit クリーン）／公開後確認 C3/C4/order011(b) を §9 計測ログへ反映方針確定／`handoff_for_helpers.md` 新規作成（Sprint022 候補 PBI-079/080 事前メモ）／PBI-081 本番デプロイ後確認のみ Sprint Review 後タスクへ残置。スプリント計画 8pt → 完成 8pt（持越 0pt）。 | 高橋（SM） |
