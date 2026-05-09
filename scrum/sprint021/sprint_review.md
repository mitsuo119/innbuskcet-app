# スプリントレビュー - Sprint021（DAY5 確定版）

## 基本情報

| 項目       | 内容                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| スプリント | Sprint021                                                                                             |
| 期間       | 2026-09-16 〜 2026-09-22                                                                              |
| 実施日     | 2026-09-22（DAY5）                                                                                    |
| 参加者     | 鈴木（PO）、高橋（SM）、伊藤、田中、佐藤（顧客）                                                      |
| ※          | 山本・中村は契約都合で不参加。田中・伊藤経由でフィードバックを反映                                    |
| テーマ     | コンテンツ拡充前の構造的SEOゲート3件確立（sitemap自動生成・`<a href>`化・canonical/メタ重複自動検知） |

---

## 1. スプリントゴール達成状況（高橋）

**スプリントゴール：**

> 検索流入を実コンテンツへ展開する前段として、sitemap/robots 自動生成・内部遷移の `<a href>` 化・canonical/メタ重複自動検知の3つの構造的ゲートを確立し、以降のコンテンツ追加（PBI-079/080）が安全に進む土台を整える

**達成度：完全達成（計画 8pt / 完了 8pt = 達成率 100%）**

| PBI     | タイトル                                         | SP  | 状態 |
| ------- | ------------------------------------------------ | --- | ---- |
| PBI-081 | sitemap.xml/robots.txt のビルド時自動生成        | 2   | Done |
| PBI-077 | 内部遷移の `<a href>` 化とクローラ可視リンク監査 | 3   | Done |
| PBI-078 | canonical/メタ重複網羅レビューと自動テスト拡張   | 3   | Done |

- 21 スプリント連続・障害物ゼロ・全 PBI 受入を継続。
- DoD 21 項目すべて「はい」。`pnpm test` 53 files / **557 tests PASS**（Sprint020 比 +29ケース）、`pnpm exec tsc -b` 0、`pnpm lint` 0、`pnpm build` 成功、`pnpm audit --prod --audit-level high` クリーン。

---

## 2. インクリメントのデモ（伊藤・田中）

`pnpm preview` および `pnpm test` で D1〜D6 を実演し、すべて期待結果通りに動作することを確認。

| #   | デモ動線                                                                                                                          | 結果 | 関連PBI |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ---- | ------- |
| D1  | ホーム→PatternList→PatternDetail を `<a href>` 経由で遷移／戻る導線も `<a href>` 化済                                             | OK   | PBI-077 |
| D2  | Ctrl+クリック・⌘+クリック・ミドルクリックで新規タブで開く（pushState 不発火）                                                     | OK   | PBI-077 |
| D3  | 全 13 公開ルートで DevTools `<head>` の `<link rel="canonical">` が `origin + pathname` 絶対URLに同期                             | OK   | PBI-078 |
| D4  | `pnpm test sitemap-coverage` で `routes.ts` ↔ `dist/sitemap.xml` 整合検証 PASS（差分注入で FAIL になることも確認）                | OK   | PBI-081 |
| D5  | `pnpm test Router.seo` で全公開ルート title/description の Set 一意性・noindex 限定付与・default 落下検知 PASS（+6ケース）        | OK   | PBI-078 |
| D6  | `dist/sitemap.xml` 13件 `<loc>` ＋ `dist/robots.txt` `Sitemap:` 行が `https://katuz.github.io/ai-scrum-inbuscket/...` 絶対URL化済 | OK   | PBI-081 |

### エビデンス

- 最終品質ゲート（DAY5）：test 557 PASS / tsc 0 / lint 0 / build 成功 / audit クリーン（[scrum/sprint021/daily_scrum.md](./daily_scrum.md) DAY5）
- onClick 単独遷移：アプリ層に **0件**（`Router.tsx` の delegated click と `nav.ts` の公開関数のみに集約）
- canonical：全 13 公開ルートで `__SITE_URL__` 残存 0 件・`origin + pathname` 同期
- DoD 21 項目すべて「はい」（[scrum/sprint021/sprint_backlog.md](./sprint_backlog.md) §受入確認メモ）

---

## 3. ステークホルダーフィードバック（佐藤）

| 観点           | フィードバック                                                                                                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能性         | `<a href>` 化で修飾キー新規タブが自然に動作。canonical 同期・sitemap 自動生成も期待通り。要求通り。                                                                                                                                             |
| ユーザビリティ | a11y 退行ゼロ・キーボード操作互換維持を確認。リンク化したことで「リンクとして見える／触れる」体験が直感的。                                                                                                                                     |
| ビジネス価値   | 構造的ゲート3件確立により、PBI-079（ケース単独URL化）・PBI-080（ref 8章展開）でルートが増えても sitemap・メタ重複・href が CI で自動検知される土台が整った。                                                                                    |
| 改善提案       | (a) Search Console KPI（インデックス数／表示／クリック／平均掲載順位）の継続報告は引き続き希望。公開後14日未満は測定0期で次スプリント以降に正式取得開始でよい。(b) PBI-079 の代表ケース20件選定で難易度・パターン分布バランスを意識してほしい。 |

> 上記 (a) は order011(b) として継続運用中（[seo_operations.md §9](../../project/docs/seo_operations.md) 計測ログ運用）。Sprint022 DAY5 で本番計測値を正式追記予定。
> (b) は Sprint022 PBI-079 リファインメント時に着手手順へ織り込む（[handoff_for_helpers.md §2](./handoff_for_helpers.md) 推定タスク粒度参照）。

---

## 4. 受入判定（鈴木）

| PBI     | タイトル                                         | 判定     | 根拠                                                                                                                                                                |
| ------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PBI-081 | sitemap.xml/robots.txt のビルド時自動生成        | **受入** | 受入基準4項目充足／単一ソース化（`src/routes.ts`）／`sitemap-coverage.test` 5ケース／`prebuild`/`pretest` フック／DoD 21 項目「はい」                               |
| PBI-077 | 内部遷移の `<a href>` 化とクローラ可視リンク監査 | **受入** | 受入基準5項目充足／onClick 単独遷移0件／`Router.history.test.tsx` 6→18ケース（修飾キー・ミドルクリック・拡張子付き等）／a11y 退行0件／DoD 21 項目「はい」           |
| PBI-078 | canonical/メタ重複網羅レビューと自動テスト拡張   | **受入** | 受入基準5項目充足／`Router.seo.test.tsx` +6ケース／全13公開ルート canonical 絶対URL同期／title/description 重複0件／not-found noindex 限定付与／DoD 21 項目「はい」 |

- 差戻なし。3 PBI とも `product_backlog_done.csv` へ移動（status=Done, sprint=sprint021）。

---

## 5. 環境変化の共有

- **技術的変化**：構造的SEOゲート3件確立により、Sprint022 以降のコンテンツ拡充 PBI（PBI-079/080）でルート追加→sitemap/canonical/メタ重複/href 整合が CI で自動担保される。
- **ビジネス環境**：本番デプロイ後の Search Console 観測は公開後14日未満につき「測定0期」。order011(b) KPI 取得運用は Sprint022 DAY5 で正式開始。
- **公開後確認の残置**：PBI-081 本番デプロイ後の sitemap.xml/robots.txt 絶対URL化確認（C1'/C2'）、PBI-077 修飾キー新規タブ本番確認（C3'）、PBI-078 canonical 同期本番確認（C4'）を Sprint Review 直後30分以内に山本・中村が実行（[handoff_for_helpers.md §1](./handoff_for_helpers.md)）。
- **次の焦点**：PBI-079（5pt・全20パターン詳細＋代表ケース20件単独URL化）／PBI-080（5pt・ref 未公開8章展開）／余力に応じ PBI-073（2pt）／PBI-074（1pt）／PBI-075（1pt）。

---

## 6. プロダクトバックログ調整（鈴木）

| 種別       | 内容                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 完了反映   | PBI-081 / PBI-077 / PBI-078 を `product_backlog_done.csv` へ移動（status=Done, sprint=sprint021, updated_at=2026-09-22）。                                                                  |
| 新規起票   | 本レビュー時点では新規 PBI 起票なし。佐藤フィードバック (a)(b) は既存運用・既存 PBI-079 リファインメントで吸収。                                                                            |
| 優先度調整 | Sprint022 候補は **PBI-079（5pt・High）／PBI-080（5pt・High）** を主軸とし、両 PBI を同時投入するか単独投入＋小粒（PBI-073/074/075）併走とするかは Sprint022 プランニングで PO 鈴木が決定。 |
| Ready 確認 | PBI-079 / PBI-080 は Ready で受入基準・SP 確定済（[handoff_for_helpers.md §2](./handoff_for_helpers.md) で事前リファインメント済）。                                                        |

---

## 7. ベロシティ実績

| 項目                | 値                                    |
| ------------------- | ------------------------------------- |
| 計画SP              | 8pt                                   |
| 完了SP              | 8pt                                   |
| キャリーオーバ      | 0pt                                   |
| 直近3スプリント平均 | **7.0pt**（S019=6 / S020=7 / S021=8） |

`scrum/velocity.csv` に sprint021 行として記録。

---

## 8. 公開後確認（A-95 §公開後確認）の扱い

> 詳細な責任分担と手順は [handoff_for_helpers.md §1](./handoff_for_helpers.md) を参照。本セクションでは Sprint Review 直後の取り扱いを明確化する。

| #   | 確認項目                                                                                      | 主担当 | 実施タイミング                            | Sprint021 受入への影響                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------- | ------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| C1' | PBI-081: 本番 sitemap.xml が新生成版で配信（13件全件絶対URL化）                               | 山本   | Review 終了＋デプロイ反映後 **30 分以内** | **受入の前提に含めない**（DAY5 ローカル `pnpm build` 結果でドライラン合格済）。本番反映後の最終裏取り扱い。                                   |
| C2' | PBI-081: 本番 robots.txt の `Sitemap:` 行が絶対URL                                            | 山本   | Review 終了＋デプロイ反映後 **30 分以内** | **受入の前提に含めない**（同上ドライラン合格済）。                                                                                            |
| C3' | PBI-077: 本番で `<a href>` 経由の修飾キー新規タブ・ミドルクリック動作                         | 山本   | Review 終了＋デプロイ反映後 **30 分以内** | **受入の前提に含めない**（DAY3 `Router.history.test.tsx` 18ケース PASS で代理検証済）。                                                       |
| C4' | PBI-078: 全公開ルートの `<link rel="canonical">` が `origin + pathname` 絶対URLに同期         | 中村   | Review 終了＋デプロイ反映後 **30 分以内** | **受入の前提に含めない**（DAY4 `Router.seo.test.tsx` PBI-078群 6ケース PASS で代理検証済）。                                                  |
| K-1 | order011(b): Search Console KPI（インデックス数／表示／クリック数／平均掲載順位）取得運用開始 | 中村   | **Sprint022 DAY5**                        | **Sprint021 受入の前提に含めない**（公開後14日未満で測定0期）。Sprint Review §5 で「測定0期につき次スプリント以降に正式取得開始」を口頭共有。 |

### 結論

- C1'〜C4' / K-1 はいずれも **Sprint021 の受入判定（§4）の前提条件に含めない**。
- C1'〜C4' は本番反映後の最終裏取りとして Review 直後30分以内に山本・中村が実行し、結果を [scrum/sprint021/sprint_backlog.md](./sprint_backlog.md) 「受入確認メモ運用 §公開後確認」に追記。
- K-1 は Sprint022 へ正式にハンドオフ。Sprint022 sprint_backlog にチェック欄を組み込み、未完で持ち越さない運用とする（A-95 継続）。
- 万一 C1'〜C4' で本番不整合が検出された場合のみ、Sprint022 で緊急修正 PBI を起票する。

---

## 9. Sprint022への調整事項（DAY5 議論結果）

1. **PBI 投入方針**: PBI-079（5pt）／PBI-080（5pt）の両投入か、単独投入＋小粒併走（PBI-073/074/075）かを Sprint022 プランニングで PO 鈴木が決定。コア開発者キャパは6h×5日＝30h、助っ人加味で上限約10pt。
2. **A-93/A-95/A-96 の継続適用**: 受入確認メモ2区分運用／Sprint Review §公開後確認テンプレ／助っ人事前メモ（DAY3 着手・DAY4 完成）を Sprint022 でも継続適用。Sprint019 レトロから3スプリント連続定着のため、次回レトロで「文化卒業（暗黙ルール化）」を判断候補に。
3. **新規 Try 候補**: 公開後確認 K-1（order011(b) Search Console KPI）を `seo_operations.md` §9 のテンプレ運用へ昇華（Sprint022 レトロで議論）。
4. **PBI-079 リファインメント反映**: 佐藤フィードバック (b)「代表ケース20件選定で難易度・パターン分布バランス」を着手手順へ織り込む（[handoff_for_helpers.md §2](./handoff_for_helpers.md) TASK-079-1 補強）。
5. **公開後確認の即時実行**: C1'〜C4' は Sprint Review 直後30分以内、K-1 は Sprint022 DAY5 で実施（[handoff_for_helpers.md §1](./handoff_for_helpers.md) 責任分担表）。

---

## 10. 議事メモ

- 鈴木：「3ゲート確立で PBI-079/080 のコンテンツ拡充がコスト構造的に下がる。Sprint022 では PO 観点で両投入か単独投入かを判断する」
- 佐藤：「`<a href>` 化で修飾キー新規タブが自然に動く点、sitemap が自動更新される点が安心。Search Console KPI は次スプリント以降の正式運用で問題ない」
- 高橋：「21 スプリント連続障害物ゼロ。Sprint Review §公開後確認テンプレ（A-95）が Sprint020→021 の2スプリントで定着、助っ人事前メモ（A-96）も DAY3 着手・DAY4 完成・DAY5 最終仕上げの運用が安定」
- 伊藤・田中：「`src/routes.ts` 単一ソース化が3PBIの共通基盤として機能。今後コンテンツ系PBIで routes 追加するだけで sitemap/canonical/メタ重複検知が自動追従する設計が確立」

---

## 11. 関連ファイル

- [sprint_backlog.md](./sprint_backlog.md)
- [sprint_planning.md](./sprint_planning.md)
- [daily_scrum.md](./daily_scrum.md)
- [handoff_for_helpers.md](./handoff_for_helpers.md)
- [project/front/src/routes.ts](../../project/front/src/routes.ts)
- [project/front/src/Router.tsx](../../project/front/src/Router.tsx)
- [project/front/src/sitemap-coverage.test.ts](../../project/front/src/sitemap-coverage.test.ts)
- [project/front/src/Router.seo.test.tsx](../../project/front/src/Router.seo.test.tsx)
- [project/front/src/Router.history.test.tsx](../../project/front/src/Router.history.test.tsx)
- [project/front/scripts/generate-sitemap.mjs](../../project/front/scripts/generate-sitemap.mjs)
- [project/docs/seo_metadata_sitemap_guide.md](../../project/docs/seo_metadata_sitemap_guide.md)
- [project/docs/seo_operations.md](../../project/docs/seo_operations.md)
- [project/docs/pr_checklist.md](../../project/docs/pr_checklist.md)
