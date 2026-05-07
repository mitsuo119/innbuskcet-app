# スプリントレビュー - Sprint020（DAY5 確定版）

## 基本情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| スプリント | Sprint020                                                          |
| 期間       | 2026-09-09 〜 2026-09-15                                           |
| 実施日     | 2026-09-15（DAY5）                                                 |
| 参加者     | 鈴木（PO）、高橋（SM）、伊藤、田中、佐藤（顧客）                   |
| ※          | 山本・中村は契約都合で不参加。田中・伊藤経由でフィードバックを反映 |
| テーマ     | Google SEO対策と検索流入拡大基盤                                   |

---

## 1. スプリントゴール達成状況（高橋）

**スプリントゴール：**

> JavaScript SEO の技術基盤（History API ルーティング・soft 404 回避）を確立し、SEO 計測運用ドキュメントで継続改善サイクルの土台を整える

**達成度：完全達成（計画 7pt / 完了 7pt = 達成率 100%）**

| PBI     | タイトル                                           | SP  | 状態 |
| ------- | -------------------------------------------------- | --- | ---- |
| PBI-076 | Hashルーティング撤廃とHistory API移行+soft 404対応 | 5   | Done |
| PBI-082 | SEO計測運用ドキュメント整備                        | 2   | Done |

- 20 スプリント連続・障害物ゼロ・全 PBI 受入を継続。
- DoD 21 項目すべて「はい」。`pnpm test` 51 files / **528 tests PASS**、`pnpm lint` 0、`pnpm exec tsc -b` 0、`pnpm build` 成功、`pnpm audit --prod --audit-level high` クリーン。

---

## 2. インクリメントのデモ（伊藤・田中）

`pnpm preview --port 4173`（dist 配信、base path `/ai-scrum-inbuscket/`、`__SITE_URL__` 注入済）で D1〜D8 を実演し、すべて期待結果通りに動作することを確認。

| #   | デモ動線                                                                                    | 結果 | 関連PBI |
| --- | ------------------------------------------------------------------------------------------- | ---- | ------- |
| D1  | `/ai-scrum-inbuscket/` 直接アクセス → ホーム表示・URL バーが pathname 形式・reload 不発火   | OK   | PBI-076 |
| D2  | 「解説リファレンス」リンク click → pushState 遷移                                           | OK   | PBI-076 |
| D3  | ブラウザ「戻る」「進む」→ popstate で再描画                                                 | OK   | PBI-076 |
| D4  | `/no-such-route` 直接アクセス → 404 画面＋ `meta robots="noindex,follow"` 反映              | OK   | PBI-076 |
| D5  | `#/privacy-policy` → `/privacy-policy` へ replaceState（hash が空に）                       | OK   | PBI-076 |
| D6  | Ctrl+クリック / 中央クリック → 新規タブで開く（pushState されない）                         | OK   | PBI-076 |
| D7  | `dist/sitemap.xml` 13 件の `<loc>` がすべて pathname 形式で `__SITE_URL__` 置換済           | OK   | PBI-076 |
| D8  | `seo_operations.md` の KPI 表／Search Console 手順／Lighthouse 定点観測手順／三角リンク提示 | OK   | PBI-082 |

### エビデンス

- TASK-076-6 手動検証 **S1〜S13 全件 PASS**（[project/docs/pbi076_manual_verification.md](../../project/docs/pbi076_manual_verification.md) §3）
- DoD 21 項目すべて「はい」（[scrum/sprint020/sprint_backlog.md](./sprint_backlog.md) 受入確認メモ）

---

## 3. ステークホルダーフィードバック（佐藤）

| 観点           | フィードバック                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能性         | 直接URL・戻る進む・legacy `#/` 互換が違和感なく動作。404 画面も意図通り。要求通り。                                                           |
| ユーザビリティ | 404 画面の「トップへ戻る」リンクは十分。ただし将来的に「解説リファレンス」「パターン一覧」への誘導も検討余地あり（緊急度低）。                |
| ビジネス価値   | Google SEO の技術的前提条件（pushState・soft 404 回避・sitemap pathname 化）が揃い、検索流入拡大の出発点として期待通り。                      |
| 改善提案       | (a) 404 画面に主要導線（リファレンス／パターン一覧）への補助リンク追加を将来検討。(b) Search Console での実インデックス状況の継続報告を希望。 |

> 上記 (a) は緊急度低のため新規 PBI を即起票せず、PBI-080（解説章展開）または PBI-079（ケース単独 URL）と合わせて自然導線を強化する方針。Sprint021 リファインメントで再評価する（バックログ調整 §6 参照）。

---

## 4. 受入判定（鈴木）

| PBI     | タイトル                                           | 判定     | 根拠                                                                                             |
| ------- | -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| PBI-076 | Hashルーティング撤廃とHistory API移行+soft 404対応 | **受入** | 受入基準 1〜6 充足／DoD 21 項目すべて「はい」／S1〜S13 PASS／sitemap pathname 化検証済           |
| PBI-082 | SEO計測運用ドキュメント整備                        | **受入** | 受入基準 1〜4 充足／三角リンク（seo_operations / lighthouse-sprint016 / pr_checklist §10）整備済 |

- 差戻なし。両 PBI とも `product_backlog_done.csv` へ移動済（sprint=sprint020）。

---

## 5. 環境変化の共有

- **技術的変化**：JavaScript SEO の技術基盤確立により、PBI-077〜081 の段階展開が解禁。
- **ビジネス環境**：Search Console 登録・Lighthouse 定点観測の運用がスプリント単位で開始可能に。
- **次の焦点**：被リンク受け皿（PBI-079）、未公開章展開（PBI-080）、sitemap 自動生成（PBI-081）、`<a href>` 統一（PBI-077）、メタ重複自動検証（PBI-078）。

---

## 6. プロダクトバックログ調整（鈴木）

| 種別       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 完了反映   | PBI-076 / PBI-082 を `product_backlog_done.csv` へ移動済（status=Done, sprint=sprint020）。                                                                      |
| 新規起票   | 本レビュー時点では新規 PBI 起票なし。佐藤フィードバック (a) は既存 PBI-079/080 の枠で回収方針。同 (b) は PBI-082 で整備済の運用フローで継続観測。                |
| 優先度調整 | Sprint021 候補は依存関係順に **PBI-081（2pt）→ PBI-077（3pt）→ PBI-078（3pt）→ PBI-079（5pt）→ PBI-080（5pt）** を推奨。詳細は handoff_for_next_sprint §2 参照。 |
| Ready 確認 | PBI-077〜081 はすべて Ready で受入基準・SP 確定済（DAY3 中村起票／DAY4 整理）。                                                                                  |

---

## 7. ベロシティ実績

| 項目                | 値                                     |
| ------------------- | -------------------------------------- |
| 計画SP              | 7pt                                    |
| 完了SP              | 7pt                                    |
| キャリーオーバ      | 0pt                                    |
| 直近3スプリント平均 | **6.67pt**（S018=8 / S019=6 / S020=7） |

`scrum/velocity.csv` に sprint020 行として記録済。

---

## 8. 公開後確認（A-93 §公開後確認 4 項目）の扱い

> 詳細な責任分担と手順は [handoff_for_next_sprint.md](./handoff_for_next_sprint.md) §1 を参照。本セクションでは Sprint Review 直後の取り扱いを明確化する。

| #   | 確認項目                                                  | 主担当 | 実施タイミング                              | Sprint020 受入への影響                                                                                                                    |
| --- | --------------------------------------------------------- | ------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | 本番URLで `/no-such-route` → 404＋`meta robots="noindex"` | 山本   | Review 終了＋デプロイ反映後 **30 分以内**   | **受入の前提に含めない**（DAY5 ローカル代理検証 dist/404.html grep で `noindex` 検出済）。本番反映後の最終裏取り扱い。                    |
| C2  | 本番URLで `#/privacy-policy` → 新URLへ replaceState       | 山本   | Review 終了＋デプロイ反映後 **30 分以内**   | **受入の前提に含めない**（DAY5 ローカル代理検証 dist/index.html `history.replaceState` 復元 script 検出済）。本番反映後の最終裏取り扱い。 |
| C3  | Search Console URL 検査で主要ページがインデックス可能判定 | 中村   | デプロイ後 24〜72h（**Sprint021 DAY1〜2**） | **受入の前提に含めない**（クロール待ちの性質上、スプリント外で確認）。Sprint021 sprint_backlog にチェック欄を残す。                       |
| C4  | Lighthouse SEO 定点観測手順が運用開始可能であることを確認 | 中村   | **Sprint021 DAY1** 試行                     | **受入の前提に含めない**（PBI-082 は手順整備が完成定義のため、運用試行は次スプリント）。不足あれば Sprint021 レトロで継続改善。           |

### 結論

- C1〜C4 はいずれも **Sprint020 の受入判定（§4）の前提条件に含めない**。
- C1/C2 は本番反映後の最終裏取りとして Review 直後に山本が実行し、結果を [scrum/sprint020/sprint_backlog.md](./sprint_backlog.md) 「受入確認メモ運用 §公開後確認」に追記。
- C3/C4 は Sprint021 へ正式にハンドオフ。Sprint021 sprint_backlog にチェック欄を組み込み、未完で持ち越さない運用とする。
- 万一 C1/C2 で本番不整合が検出された場合のみ、Sprint021 で緊急修正 PBI を起票する。

---

## 9. 議事メモ

- 鈴木：「`#/...` 互換と pushState 統一が想定通り。Sprint021 では PBI-081（sitemap 自動生成）を最優先で構造的な再発防止を入れたい」
- 佐藤：「直接 URL アクセスが速く、404 で迷子にならないのは安心。SEO の効果は時間がかかるので、Search Console の数字を継続報告してほしい」
- 高橋：「20 スプリント連続障害物ゼロ。Sprint020 はテーマ（Google SEO 対策と検索流入拡大基盤）の出発点を完了。Sprint021 以降もテーマ継続」
- 伊藤・田中：「Router の delegated click handler が `href`／`onClick` 両形式を吸収するため、PBI-077 の段階移行は安全に進められる」

---

## 10. 関連ファイル

- [sprint_backlog.md](./sprint_backlog.md)
- [handoff_for_next_sprint.md](./handoff_for_next_sprint.md)
- [project/docs/pbi076_manual_verification.md](../../project/docs/pbi076_manual_verification.md)
- [project/docs/seo_operations.md](../../project/docs/seo_operations.md)
- [project/docs/pr_checklist.md](../../project/docs/pr_checklist.md)
- [project/docs/lighthouse-sprint016.md](../../project/docs/lighthouse-sprint016.md)
