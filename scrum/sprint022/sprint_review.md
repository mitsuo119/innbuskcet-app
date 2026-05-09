# スプリントレビュー - Sprint022（DAY5 確定版）

## 基本情報

| 項目       | 内容                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| スプリント | Sprint022                                                                                                             |
| 期間       | 2026-09-23 〜 2026-09-29                                                                                              |
| 実施日     | 2026-09-29（DAY5）                                                                                                    |
| 参加者     | 鈴木（PO）、高橋（SM）、伊藤、田中、佐藤（顧客）                                                                      |
| ※          | 山本・中村は契約都合で不参加。田中・伊藤経由でフィードバックを反映                                                    |
| テーマ     | order010〜011 最終フェーズ：ロングテール検索の受け皿（パターン/ケース/解説章の単独URL）拡充と Search Console KPI 起動 |

---

## 1. スプリントゴール達成状況（高橋）

**スプリントゴール：**

> order010〜011 の最終フェーズとしてロングテール検索の受け皿を完成させる。全20パターン詳細＋代表ケース20件以上の単独URL化（PBI-079）と未公開8章解説ページ展開（PBI-080）を投入し、Search Console KPI 正式運用（K-1）を立ち上げる。

**達成度：完全達成（計画 10pt / 完了 10pt = 達成率 100%）**

| PBI     | タイトル                                                    | SP  | 状態 |
| ------- | ----------------------------------------------------------- | --- | ---- |
| PBI-079 | 全20パターン詳細・代表ケースの単独URL化と被リンク受け皿整備 | 5   | Done |
| PBI-080 | ref未公開8章（03/04/06/07/09/10/11/12）の解説ページ展開     | 5   | Done |

- **22 スプリント連続障害物ゼロ・全 PBI 受入を継続**。過去最大計画 8pt → 10pt 達成（A-99 容量試算が機能）。
- DoD 21 項目すべて「はい」。`pnpm test` 53 files / **565 tests PASS**（Sprint021 比 +8）、`pnpm exec tsc -b` 0、`pnpm lint` 0、`pnpm build` 成功（sitemap 41 ルート）、`pnpm audit --prod --audit-level high` クリーン。
- 横断: TASK-A97（A-93/A-95/A-96 の文化卒業反映）完了、TASK-K1（Search Console KPI 計測ログ追記＝クロール待ち初期記録）完了。TASK-A98／A-99 は本レビューで初運用。

---

## 2. インクリメントのデモ（伊藤・田中）

`pnpm preview` および `pnpm test` で D1〜D7 を実演し、すべて期待結果通りに動作することを確認。

| #   | デモ動線                                                                                                                           | 結果 | 関連PBI |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ---- | ------- |
| D1  | `/cases/case-001`〜`/cases/case-053` の 20 ルートに直接遷移→ パターン名＋難易度を含む一意な title/description が描画               | OK   | PBI-079 |
| D2  | `/cases/:id` で `<head>` に BreadcrumbList JSON-LD（`data-route-jsonld="case-detail"`）が 1 タグだけ注入され、他ルートで残留しない | OK   | PBI-079 |
| D3  | `cases.json` 20件の解説が 120 字以上のオリジナル＋末尾に `ref/chapter08-case-patterns.md` 参照を保持                               | OK   | PBI-079 |
| D4  | NotFound(404) に「パターン一覧（/patterns）」「解説リファレンス（/reference）」補助リンク 2 件追加・a11y 退行ゼロ                  | OK   | PBI-079 |
| D5  | `/reference/chapter03..12` の新規 8 章ページが h1〜h3 階層＋ 800 字以上で表示・既存 4 章と同フォーマット                           | OK   | PBI-080 |
| D6  | 全 12 章で `data-route-jsonld="reference-chapter"` の BreadcrumbList JSON-LD が一意・title 一意・description 非空                  | OK   | PBI-080 |
| D7  | `dist/sitemap.xml` 41 ルート（既存 13 ＋ `/patterns/:id` × 20 ＋ `/cases/:id` × 20 ＋新章 8、`__SITE_URL__` 置換済）               | OK   | 共通    |

### エビデンス

- 最終品質ゲート（DAY5 EOD）：test 565 PASS / tsc 0 / lint 0 / build 成功 / audit クリーン（[scrum/sprint022/daily_scrum.md](./daily_scrum.md) DAY5）
- メタ重複検知：`Router.seo.test.tsx` 13 ケース（PBI-080 用 +2 ケース含む）／`routes.test.ts` 10 ケース／`seo-assets.test.ts` 33 ケース／`sitemap-coverage.test.ts` 5 ケース 全 PASS
- helpful content 自己点検：`pr_checklist.md` §10.5（7 項目）を新設し PBI-079 で初運用（中村）
- DoD 21 項目すべて「はい」（[scrum/sprint022/sprint_backlog.md](./sprint_backlog.md) §受入確認メモ）

---

## 3. ステークホルダーフィードバック（佐藤）

| 観点           | フィードバック                                                                                                                                                                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能性         | 全20パターン×20代表ケース×新章8 の単独URL化が想定通り動作。BreadcrumbList JSON-LD が `case-detail`／`reference-chapter` で routeKey 切替されて残留しない設計が安心。要求通り。                                                                                                          |
| ユーザビリティ | NotFound 補助リンクで迷子からの復帰導線ができたのは良い体験。新章ページの章間導線（PBI-062 で確立済）と相性が良い。                                                                                                                                                                     |
| ビジネス価値   | order010〜011 が Sprint022 で完全クローズ。ロングテール検索の受け皿が一気に拡充（公開ルート 13 → 41）し、被リンク獲得・helpful content 評価の前提が整った。                                                                                                                             |
| 改善提案       | (a) Lighthouse SEO 実スコアと Search Console KPI 4 種は本番デプロイ前のため未取得（A-98 運用「測定前提条件」で吸収済）。Sprint023 DAY1 に本番デプロイ後の実計測を必達としてほしい。(b) 新章 8 ページの内部回遊（章末「次の章へ」/関連パターンへのリンク）を Sprint023 で1段強化したい。 |

> (a) は Sprint023 DAY1 にハンドオフ済（[seo_operations.md §9](../../project/docs/seo_operations.md) Sprint022 行に「クロール待ち＝0期」を記録、Sprint023 DAY1 で更新）。
> (b) は Sprint023 候補の小粒 PBI として新規起票（§6 参照）。

---

## 4. 受入判定（鈴木）

| PBI     | タイトル                                                    | 判定     | 根拠                                                                                                                                                                                                                                                                                                                 |
| ------- | ----------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PBI-079 | 全20パターン詳細・代表ケースの単独URL化と被リンク受け皿整備 | **受入** | 受入基準8項目充足／代表ケース 20 件選定（難易度 5/8/7・全 20 パターン × 各 1）PO レビュー OK／`/cases/:id` 単独URL × 20＋ JSON-LD／`cases.json` 120 字以上オリジナル × 20／NotFound 補助リンク 2 件＋ a11y 退行ゼロ／`pr_checklist.md` §10.5 helpful content 7 項目／DoD 21 項目「はい」                             |
| PBI-080 | ref未公開8章（03/04/06/07/09/10/11/12）の解説ページ展開     | **受入** | 受入基準8項目充足／新章 8 ページ × 800 字以上のオリジナル／全 12 章で title/description/canonical/BreadcrumbList JSON-LD 一意／ReferenceIndex から全章リンク／sitemap 41 ルート反映／Lighthouse SEO 既存水準維持（技術 SEO 要素退行ゼロを `seo-assets.test` 33 ＋ `Router.seo.test` 13 で検証）／DoD 21 項目「はい」 |

- 差戻なし。2 PBI とも `product_backlog_done.csv` へ移動（status=Done, sprint=sprint022, updated_at=2026-09-29）。

---

## 5. 環境変化の共有

- **技術的変化**: Sprint022 で公開ルートが 13 → **41**（+28）に拡張。`/cases/:id` × 20、`/patterns/:id` × 20、`/reference/chapter03..12` × 8 が単独URL化され、すべて sitemap 自動掲載・canonical/メタ重複検知・JSON-LD 配信下に入った。
- **ビジネス環境**: order010〜011（SEO 受け皿構築）が Sprint022 で完全クローズ。Sprint023 以降は order012 / 残小粒 PBI（PBI-073/074/075）と佐藤フィードバック (b) 起因の新規 PBI を中心に進められる。
- **K-1（Search Console KPI 正式運用）の状態**: 本番デプロイ前のためクロール／インデックス反映 0 件。A-98 運用「公開後 N 日未満／クロール待ち」を `seo_operations.md` §9 Sprint022 行に明示済。**Sprint023 DAY1 に本番デプロイ後の 4 KPI を再計測し当該行を更新**する運用に決定。
- **A-98／A-99 初運用**:
  - **A-98 測定前提条件欄**: 本 Sprint Review §公開後確認テンプレで「公開後 14 日未満／クロール待ち／本番未デプロイ」のいずれかを明記する欄を Sprint023 から正式運用。
  - **A-99 次スプリント容量試算**: コア 30h（伊藤・田中 6h × 5 日）＋助っ人加味で **Sprint023 上限約 6〜8pt** を提示（Sprint022 の 10pt 達成は PBI-079/080 が単一ソース基盤を流用できた特殊条件）。

---

## 6. プロダクトバックログ調整（鈴木）

| 種別       | 内容                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 完了反映   | PBI-079 / PBI-080 を `product_backlog_done.csv` へ移動（status=Done, sprint=sprint022, updated_at=2026-09-29）。                                                                                                                                                                                                                                       |
| 新規起票   | **PBI-083（新規・Low・1pt）**: 新章 8 ページの章末「次の章へ／前の章へ／一覧へ戻る」導線と関連パターンへの内部リンク強化（佐藤フィードバック (b) 反映）。受入基準: 全 12 章で章末ナビゲーションが PBI-062 と同フォーマット／関連パターンへのリンクが各章 1 件以上／a11y 退行ゼロ／DoD 21 項目「はい」。                                                |
| 優先度調整 | Sprint023 主軸候補: **PBI-073（2pt・Medium）案件 50 件超／PBI-074（1pt・Low）Exam タイムライン基準線／PBI-075（1pt・Low）案件間関連ハイライト初回ツールチップ／PBI-083（1pt・Low）新章回遊強化**。容量試算 6〜8pt（A-99）の範囲で PO 鈴木が Sprint023 プランニングで決定。Sprint023 DAY1 は K-1 実計測（中村）と Lighthouse SEO 実スコア追記を最優先。 |
| Ready 確認 | PBI-073／074／075 は Sprint019 起票時点で Ready。PBI-083 は受入基準明確で粒度 1pt のため Sprint023 プランニング前に Ready 化可。                                                                                                                                                                                                                       |

---

## 7. ベロシティ実績

| 項目                | 値                                      |
| ------------------- | --------------------------------------- |
| 計画SP              | 10pt                                    |
| 完了SP              | 10pt                                    |
| キャリーオーバ      | 0pt                                     |
| 直近3スプリント平均 | **8.33pt**（S020=7 / S021=8 / S022=10） |

`scrum/velocity.csv` に sprint022 行として記録。

---

## 8. 公開後確認（A-95 §公開後確認 ／ A-98 測定前提条件）

> 詳細な責任分担は [sprint_backlog.md §受入確認メモ運用](./sprint_backlog.md) を参照。本セクションでは Sprint Review 直後／Sprint023 DAY1 の取り扱いを明確化する。

| #    | 確認項目                                                                              | 主担当 | 実施タイミング                            | 測定前提条件（A-98）           | Sprint022 受入への影響                                                    |
| ---- | ------------------------------------------------------------------------------------- | ------ | ----------------------------------------- | ------------------------------ | ------------------------------------------------------------------------- |
| C1   | PBI-079: 本番で `/cases/:id` 20 ルートがインデックス可能（Search Console URL 検査）   | 山本   | Review 終了＋デプロイ反映後 **30 分以内** | 公開後 0 日／クロール待ち初期  | **受入の前提に含めない**（DAY5 ローカル合格済）                           |
| C2   | PBI-079: 本番で `/patterns/:id` 20 ルートが新生成 sitemap に掲載                      | 山本   | Review 終了＋デプロイ反映後 **30 分以内** | 公開後 0 日                    | **受入の前提に含めない**（同上）                                          |
| C3   | PBI-080: 本番で `/reference/chapter03..12` 8 章がインデックス可能                     | 中村   | Review 終了＋デプロイ反映後 **30 分以内** | 公開後 0 日／クロール待ち初期  | **受入の前提に含めない**（同上）                                          |
| K-1  | order011(b): Search Console KPI（インデックス／表示／クリック／平均掲載順位）4 種実値 | 中村   | **Sprint023 DAY1**（本番デプロイ後）      | クロール反映 ≥ 14 日が望ましい | **Sprint022 受入の前提に含めない**（クロール待ち 0 期として §9 に記録済） |
| K-1' | Lighthouse SEO 実スコア計測（本番）                                                   | 中村   | **Sprint023 DAY1**（本番デプロイ後）      | 本番デプロイ済                 | **Sprint022 受入の前提に含めない**（技術 SEO 要素退行ゼロを代理検証済）   |

### 結論

- C1〜C3 / K-1 / K-1' はいずれも **Sprint022 の受入判定（§4）の前提条件に含めない**。技術 SEO 要素は `Router.seo.test.tsx` 13 ＋ `seo-assets.test.ts` 33 で退行ゼロを代理検証済。
- C1〜C3 は本番反映後の最終裏取りとして Review 直後 30 分以内に山本・中村が実行。
- K-1／K-1' は Sprint023 DAY1 へハンドオフ。`seo_operations.md` §9 Sprint022 行を当日中に実値で更新する運用とする。

---

## 9. Sprint023への調整事項（DAY5 議論結果）

1. **Sprint023 容量**: A-99 容量試算により **6〜8pt を上限の目安**とする。Sprint022 の 10pt は単一ソース基盤を流用できた特殊条件であり、Sprint023 は通常運用に戻す。
2. **PBI 投入候補**: PBI-073（2pt）／PBI-074（1pt）／PBI-075（1pt）／PBI-083（新規 1pt・佐藤フィードバック (b) 反映）。順序は Sprint023 プランニングで PO 鈴木が決定。
3. **Sprint023 DAY1 の最優先**: (a) 本番デプロイ実施、(b) K-1 実計測＋ `seo_operations.md` §9 Sprint022 行更新、(c) Lighthouse SEO 実スコア計測＋ `lighthouse-sprint016.md` の系列値追記。
4. **A-97 卒業反映の継続適用**: A-93／A-95／A-96 は Sprint022 で文化卒業反映済（→ `scrum_team_culture.md`）。Sprint023 以降は暗黙ルールとして適用継続、レトロでの再掲は不要。
5. **A-98／A-99 の Sprint023 本格運用**: Sprint Review §公開後確認テンプレに「測定前提条件欄」を組み込む運用と、プランニング時の容量試算簡易表提示を Sprint023 から定常化。
6. **K-1 継続サイクル**: Sprint022 レトロ（順送り）で「毎スプリント／隔スプリント／月次」の継続頻度を議論（order012 候補 L）。

---

## 10. 議事メモ

- 鈴木：「PBI-079/080 のクローズで order010〜011 が完全完了。公開ルート 13 → 41 でロングテールの土台が整った。Sprint023 は K-1 実計測を最優先に通常容量へ戻す」
- 佐藤：「BreadcrumbList JSON-LD の routeKey 切替で残留しない設計が安心できる。新章の章末ナビは Sprint023 で 1 段強化したい」
- 高橋：「22 スプリント連続障害物ゼロ。A-93/A-95/A-96 が Sprint022 で文化卒業反映済、A-98/A-99 を Sprint Review で初運用提示。**過去最大の 10pt 完走**は単一ソース基盤（PBI-081）の効果が大きい」
- 伊藤・田中：「`src/routes.ts` 単一ソース＋ `Router.seo.test.tsx`（routeKey 切替検証）＋ `routes.test.ts`（ID 整合）の三本柱で、コンテンツ拡充 PBI が CI ゲートで安全に追従できることを実証できた」
- 中村：「TASK-K1 はクロール待ち 0 期として `seo_operations.md` §9 に明示し、Sprint023 DAY1 で本計測を実施する。`pr_checklist.md` §10.5 helpful content 7 項目は今後のコンテンツ系 PBI で再利用したい」

---

## 11. 関連ファイル

- [sprint_backlog.md](./sprint_backlog.md)
- [sprint_planning.md](./sprint_planning.md)
- [daily_scrum.md](./daily_scrum.md)
- [project/front/src/routes.ts](../../project/front/src/routes.ts)
- [project/front/src/Router.tsx](../../project/front/src/Router.tsx)
- [project/front/src/pages/CaseDetail.tsx](../../project/front/src/pages/CaseDetail.tsx)
- [project/front/src/data/cases.json](../../project/front/src/data/cases.json)
- [project/front/src/data/referenceData.ts](../../project/front/src/data/referenceData.ts)
- [project/front/src/Router.seo.test.tsx](../../project/front/src/Router.seo.test.tsx)
- [project/front/src/routes.test.ts](../../project/front/src/routes.test.ts)
- [project/docs/pr_checklist.md](../../project/docs/pr_checklist.md)
- [project/docs/seo_operations.md](../../project/docs/seo_operations.md)
