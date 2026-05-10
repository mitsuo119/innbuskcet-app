# 依頼事項メモ order013

## 依頼者

顧客: 佐藤

## 依頼概要

Sprint022 で order010〜011 が完全クローズ（PBI-079 / PBI-080 を 10pt 完走、公開ルート 13 → 41）し、ロングテール検索の受け皿が整った。**Sprint023 は通常運用へ戻し（A-99 容量試算で上限 6〜8pt）、Sprint022 から持ち越した「本番デプロイ後の実計測ハンドオフ」を DAY1 必達で完了させつつ、佐藤フィードバック (b) を反映した PBI-083 と残小粒 PBI（PBI-073 / 074 / 075）を健全な容量で消化する**。あわせて Sprint022 レトロで決まった改善アクション A-100 / A-101 / A-102 を Sprint023 で初運用立ち上げする。

## 背景

- Sprint022 実績: 計画 10pt / 完了 10pt（達成率 100%・過去最大 SP）。`pnpm test` 565 PASS / tsc 0 / lint 0 / build 成功（sitemap 41 ルート）/ audit クリーン。**22 スプリント連続障害物ゼロ・全 PBI 受入** を継続。
- Sprint022 の 10pt 完走は **PBI-081（`src/routes.ts` 単一ソース基盤）流用の特殊条件** によるもの。A-99 容量試算では Sprint023 上限 **6〜8pt** が通常運用ライン（[sprint022/sprint_review.md §5](../sprint022/sprint_review.md)）。
- Sprint022 Sprint Review §3 で佐藤から 2 点：
  - (a) Lighthouse SEO 実スコア／Search Console KPI 4 種は本番デプロイ前のため未取得（A-98「測定前提条件」で吸収済）。**Sprint023 DAY1 に本番デプロイ後の実計測を必達**としてほしい。
  - (b) 新章 8 ページ（`/reference/chapter03..12`）の内部回遊（章末「次の章へ／前の章へ／一覧へ」と関連パターンへのリンク）を 1 段強化したい → **PBI-083（新規 1pt・Low・Ready）として起票済**（[product_backlog.csv](../product_backlog.csv) PBI-083 行）。
- Sprint022 レトロで Sprint023 適用の改善アクション 3 件決定（[sprint022/sprint_retrospective.md](../sprint022/sprint_retrospective.md)）：
  - **A-100**: 「本番デプロイ後の翌スプリント実計測」型ハンドオフ表（責任者・更新先ファイル・期限・完了条件）を `handoff_for_helpers.md` の固定セクションに標準化（高橋・中村、Sprint023 DAY1）
  - **A-101**: Sprint Review §7 ベロシティ実績に「達成 SP の特殊条件メモ（基盤流用 / 助っ人投入比率 / コンテンツ vs ロジック内訳）」1 行欄追加（高橋、Sprint023 Sprint Review から）
  - **A-102**: K-1 継続サイクル（毎／隔／月次）を `seo_operations.md` §9 の運用頻度欄に明記（鈴木・中村、Sprint023 DAY1〜Sprint Review）
- 継続運用: **A-98 / A-99**（Sprint022 で初運用完了）は 2 スプリント連続定着確認のため Sprint023 で継続適用、レトロで卒業反映を判断。**A-94**（DAY 単位完了件数明記）はコンテンツ拡充系で初適用済、他種別（API / データ移行系）適用後に卒業判定。

## 目的

1. **本番デプロイ後の実計測ハンドオフを DAY1 で確実に着地** させる（佐藤(a) 反映）。K-1（Search Console KPI 4 種）／Lighthouse SEO 実スコア／インデックス可能性確認 C1〜C3 を `seo_operations.md` §9 Sprint022 行 と `lighthouse-sprint016.md` 系列値へ実値で記録する。
2. **佐藤フィードバック (b) を PBI-083 として Sprint023 で消化** し、新章 8 ページの章末回遊・関連パターン導線を完成させる。
3. **A-99 容量試算（6〜8pt）の範囲で残小粒 PBI を健全に並走** させ、過剰投入によるキャリーオーバを防ぐ。
4. **改善アクション A-100 / A-101 / A-102 を Sprint023 で初運用** し、ハンドオフ標準化・容量試算精度向上・K-1 継続サイクル定型化を着地させる。

## 期待成果

- Sprint023 DAY1 終了時点で次の 4 件が完了し、`seo_operations.md` §9 Sprint022 行と `lighthouse-sprint016.md` の系列値が実値更新されている：
  - (a) 本番デプロイ実施
  - (b) Search Console KPI 4 種（インデックス済ページ数／表示回数／クリック数／平均掲載順位）の取得・記録（中村）
  - (c) Lighthouse SEO 実スコア計測・記録（中村）
  - (d) インデックス可能性確認 C1（`/cases/:id` × 20）／C2（`/patterns/:id` × 20）／C3（`/reference/chapter03..12` × 8）の Search Console URL 検査（山本・中村）
- **PBI-083 が Done** となり、全 12 章で章末ナビゲーション（PBI-062 同フォーマット）と関連パターンへの内部リンク（各章 1 件以上）が反映され、a11y 退行ゼロで `product_backlog_done.csv` に sprint=sprint023 で記録される。
- A-99 容量試算の **6〜8pt 上限内** で残小粒 PBI（PBI-073 / 074 / 075）から 1〜2 件が PBI-083 と併走完了し、Sprint023 持越 0pt を維持。
- **A-100 ハンドオフ表** が `handoff_for_helpers.md` 固定セクションとして整備され、Sprint023 DAY1 で K-1／K-1' に初運用される。
- **A-101 特殊条件メモ欄** が Sprint023 Sprint Review §7 ベロシティ実績で初運用され、達成 SP 内訳（基盤流用 / 助っ人投入比率 / コンテンツ vs ロジック）が 1 行で記録される。
- **A-102 K-1 継続サイクル**（毎／隔／月次のいずれか）が Sprint023 Sprint Review までに `seo_operations.md` §9 の運用頻度欄へ確定明記される。

## 要求事項

### 1. Sprint023 DAY1 必達ハンドオフ（佐藤(a) 反映 / A-100 初運用）

- **(a) 本番デプロイ実施**（伊藤・田中もしくは PO 鈴木が指示）。
- **(b) K-1 実計測**: Search Console から「インデックス済ページ数 / 表示回数 / クリック数 / 平均掲載順位」を取得し、`seo_operations.md` §9 Sprint022 行を実値で更新（中村）。クロール反映に時間を要する KPI は「公開後 N 日」を A-98 測定前提条件欄に明記。
- **(c) Lighthouse SEO 実スコア計測**: 本番ドメインで Lighthouse 実行し、`lighthouse-sprint016.md` の系列値に Sprint022／Sprint023 公開時点の値を追記（中村）。
- **(d) C1〜C3 公開後確認**: `/cases/:id` × 20（C1・山本）／`/patterns/:id` × 20（C2・山本）／`/reference/chapter03..12` × 8（C3・中村）のインデックス可能性を Search Console URL 検査で確認し、Sprint022 [sprint_backlog.md §受入確認メモ](../sprint022/sprint_backlog.md) 「公開後確認」へ追記。
- **A-100 ハンドオフ表**: 上記 (a)〜(d) の責任者・更新先ファイル・期限・完了条件を `handoff_for_helpers.md` の固定セクションに整備（高橋・中村）。Sprint023 DAY1 で初運用、Sprint024 まで 2 スプリント連続で機能すれば卒業反映候補。

### 2. PBI-083（1pt・Low・Ready）の Sprint023 投入（佐藤(b) 反映）

- 既存受入基準（[product_backlog.csv](../product_backlog.csv) PBI-083 行）を維持。要点：
  - 全 12 章で章末ナビ（次の章へ／前の章へ／一覧へ戻る）が PBI-062 同フォーマット
  - 各章で関連する案件パターン（`/patterns/:id`）への内部リンクが 1 件以上
  - 端の章は `aria-disabled` 付与で無効化（PBI-062 整合）
  - キーボードのみで主要導線完結（DoD §9-1）／375px 横スクロールなし・タップ領域 44px 以上（PBI-045 整合）／コントラスト AA／a11y 退行ゼロ
  - vitest で章末ナビと関連パターンリンクのテスト追加
  - PBI-080 完了を前提（Sprint022 で完了済）／DoD 21 項目すべて「はい」
- Sprint023 主軸候補の 1 件として投入（投入是非は PO 鈴木がプランニングで決定）。

### 3. Sprint023 容量設計（A-99 第 2 回適用 / 6〜8pt 上限）

- A-99 容量試算により **Sprint023 上限の目安は 6〜8pt**。Sprint022 の 10pt は単一ソース基盤流用の特殊条件であり、Sprint023 は通常運用に戻す。
- Sprint023 DAY1 は中村の工数 1〜2h が K-1 実計測＋ Lighthouse SEO 計測＋本番デプロイ立会いに充当される前提。
- 投入候補（[sprint022/sprint_review.md §6](../sprint022/sprint_review.md)）：
  - **PBI-073（2pt・Medium・Ready）**: 案件数 50 件超への拡充
  - **PBI-074（1pt・Low・Ready）**: Exam タイムラインへの基準線追加
  - **PBI-075（1pt・Low・Ready）**: 案件間関連ハイライト初回ツールチップ
  - **PBI-083（1pt・Low・Ready）**: 解説リファレンス新章 8 ページの章末回遊強化（佐藤(b) 反映）
- 推奨パターン（リファインメント材料）：
  - **パターン X（推奨・6pt）**: PBI-073 + PBI-083 + PBI-074（または PBI-075）。中村工数の DAY1 充当を吸収しつつ A-99 上限内に収まる。
  - **パターン Y（やや攻め・7〜8pt）**: PBI-073 + PBI-083 + PBI-074 + PBI-075。上限直撃。中村 DAY1 工数次第で持越リスクあり。
  - **パターン Z（保守・4pt）**: PBI-073 + PBI-083。残 2 件は Sprint024 へ送り。
- PO 鈴木が Sprint023 プランニングで決定。本要望の優先度は **DAY1 ハンドオフ > PBI-083 > PBI-073 > PBI-074 / PBI-075** とする。

### 4. プロセス改善 3 件（A-100 / A-101 / A-102）の Sprint023 適用

- **A-100**: §1 のとおり Sprint023 DAY1 で初運用（高橋・中村）。
- **A-101**: Sprint023 Sprint Review §7 ベロシティ実績に「達成 SP の特殊条件メモ（基盤流用 / 助っ人投入比率 / コンテンツ vs ロジック内訳）」1 行欄を追加運用開始（高橋）。3〜4 スプリント分のデータ蓄積後に容量試算式を見直す。
- **A-102**: K-1 継続サイクル（毎スプリント／隔スプリント／月次）を Sprint023 DAY1 〜 Sprint Review の間に PO 鈴木が決定し、`seo_operations.md` §9 の運用頻度欄に明記（鈴木・中村）。

### 5. 継続運用アクション（A-98 / A-99 / A-94）

- **A-98**: Sprint Review §公開後確認テンプレに「測定前提条件欄」を Sprint023 でも継続適用。2 スプリント連続定着で Sprint023 レトロ時に卒業反映を判断（高橋・中村）。
- **A-99**: Sprint Review §6 で「次スプリント容量試算」簡易表提示を Sprint023 でも継続適用。2 スプリント連続定着で Sprint023 レトロ時に卒業反映を判断（高橋）。
- **A-94**: DAY 単位完了件数明記をコンテンツ拡充系以外の他種別（API / データ移行系 PBI）着手時にも適用してから卒業判定（田中・伊藤）。Sprint023 で該当 PBI が投入される場合のみ運用。

## 受入観点

- **DAY1 ハンドオフ完了判定**: Sprint023 DAY1 終了時点で `seo_operations.md` §9 Sprint022 行が実値更新されている／`lighthouse-sprint016.md` に系列値が追記されている／Sprint022 [sprint_backlog.md](../sprint022/sprint_backlog.md) §受入確認メモ「公開後確認」に C1〜C3 の結果が追記されている／`handoff_for_helpers.md` 固定セクションに A-100 ハンドオフ表が整備されている。
- **PBI-083 受入基準充足**: 章末ナビ全 12 章 PBI-062 同フォーマット／関連パターンリンク各章 1 件以上／aria-disabled 端処理／キーボードのみ完結／375px 横スクロールなし・タップ領域 44px 以上／コントラスト AA／a11y 退行ゼロ／vitest テスト追加／DoD 21 項目「はい」。
- **Sprint023 容量健全性**: 完了 SP が 6〜8pt 範囲内（パターン X / Y）または保守 4pt（パターン Z）で持越 0pt。Sprint Review §7 で A-101 特殊条件メモが記載される。
- **A-100 / A-101 / A-102 初運用**: Sprint023 Sprint Review 議事録および `seo_operations.md` §9 運用頻度欄／`handoff_for_helpers.md` 固定セクション／Sprint Review §7 特殊条件メモ欄が確認できる。
- **PBI-073 / 074 / 075 受入基準**: それぞれの既存受入基準（[product_backlog.csv](../product_backlog.csv)）を充足し、DoD 21 項目「はい」。

## 制約・非機能

- **技術スタック現状維持**（Vite + React SPA・GitHub Pages 配信）。SSR / SSG 採用是非は ADR で別検討（order010〜011 と同方針）。
- **パフォーマンス**: Lighthouse Performance / SEO スコアを Sprint022 計測値（公開時点）から下げない。
- **アクセシビリティ**: [a11y_checklist.md](../../project/docs/a11y_checklist.md) を遵守。PBI-083 の章末ナビ・関連パターンリンク追加で a11y 退行を出さない。
- **モバイルファースト**: 375px 対応を維持（PBI-045 整合）。
- **DoD**: 21 項目すべて「はい」を全 PBI で達成。`pr_checklist.md` §10（SEO / サイトマップ整合）／§10.5（helpful content 7 項目）を継続適用。
- **計測**: Search Console KPI は本番ドメイン前提。Lighthouse SEO 実スコアも本番ドメインで計測。ローカル / CI では構造的検証（`Router.seo.test.tsx` / `routes.test.ts` / `seo-assets.test.ts` / `sitemap-coverage.test.ts`）に留める。
- **キャパシティ**: コア 30h（伊藤・田中 6h × 5 日）＋助っ人加味で **上限 6〜8pt**（A-99）。Sprint023 DAY1 中村工数 1〜2h は計測作業に充当。
- **新規 PBI 起票**: 本要望時点で不要（PBI-083 は Sprint022 レトロで起票済）。

## 優先度

- 優先度: **High**（DAY1 ハンドオフが Sprint022 受入の最終裏取りに直結し、佐藤(a) 必達要件のため）
- 依頼方針:
  - Sprint023 DAY1 ハンドオフ（K-1 実計測＋ Lighthouse SEO ＋ C1〜C3）が **最優先**。
  - 開発主軸は **PBI-083（佐藤(b) 反映・1pt）** ＋ **PBI-073（2pt）** を基本線とし、容量に余裕があれば PBI-074 / PBI-075 を 1〜2 件併走。
  - パターン選定（X / Y / Z）は PO 鈴木が Sprint023 プランニングで決定。
  - 改善アクション A-100 / A-101 / A-102 を Sprint023 で初運用立ち上げ。

## リファインメント用メモ

- 候補 M: **A-100 ハンドオフ表のスキーマ確定**（責任者・更新先ファイル・期限・完了条件の 4 列で十分か、トリガ条件／前提デプロイ完了確認列も追加するかをリファインメントで議論）
- 候補 N: **PBI-083 の関連パターン選定基準**（各章ごとに「主要パターン 1 件」か「複数パターン許容」か。リファインメント時に PO 鈴木と章 × パターン対応の妥当性を確認）
- 候補 O: **A-102 K-1 継続サイクル決定タイミング**（Sprint023 DAY1 で初計測値が出てから決めるか、プランニング時に方針だけ決めて DAY1 計測で微調整するか）
- 候補 P: **PBI-073 着手時の A-94 適用判断**（案件追加 50 件超は内容次第でデータ系・コンテンツ系どちらにも該当しうる。DAY 単位件数明記を再適用するかをリファインメントで判断）

候補 M〜P はいずれも新規 PBI 起票不要。Sprint023 リファインメントで既存 PBI / アクションの着手手順補強として処理する。

## 参考

- 親要望: [order010.md](./order010.md)（SEO 強化・JavaScript SEO 対応・Sprint022 完全クローズ済）／ [order011.md](./order011.md)（検索流入の入口拡大・Sprint022 完全クローズ済）／ [order012.md](./order012.md)（Sprint022 ロングテール受け皿完成）
- Sprint022 成果: [scrum/sprint022/sprint_review.md](../sprint022/sprint_review.md)・[sprint_retrospective.md](../sprint022/sprint_retrospective.md)・[sprint_backlog.md](../sprint022/sprint_backlog.md)
- 関連既存資産: [project/docs/seo_operations.md](../../project/docs/seo_operations.md)（§9 計測ログ運用）／ [lighthouse-sprint016.md](../../project/docs/lighthouse-sprint016.md)（系列値）／ [pr_checklist.md](../../project/docs/pr_checklist.md)（§10 SEO / §10.5 helpful content）／ [a11y_checklist.md](../../project/docs/a11y_checklist.md)
- 関連既存 PBI: PBI-083（Ready・1pt・佐藤(b) 反映）／ PBI-073（Ready・2pt）／ PBI-074（Ready・1pt）／ PBI-075（Ready・1pt）

---

## 補足: 上長との対話前提について

本メモは Sprint022 [sprint_review.md §3 §6 §8 §9](../sprint022/sprint_review.md)／[sprint_retrospective.md](../sprint022/sprint_retrospective.md) Keep/Problem/Try ／改善アクション A-100/A-101/A-102 ／ Sprint023 への引継ぎ事項 §1〜§4 を一次情報として、佐藤エージェント単独で整理した一次ドラフトである。Sprint023 リファインメント前に上長（ユーザ）と以下を確認したい：

1. **Sprint023 投入パターン**: パターン X（PBI-073+083+074 or 075＝6pt・推奨）／パターン Y（4 件全投入＝7〜8pt・上限直撃）／パターン Z（PBI-073+083＝4pt・保守）のいずれを基本線とするか。
2. **A-100 ハンドオフ表のスキーマ粒度**: 責任者・更新先ファイル・期限・完了条件の 4 列で運用するか、トリガ条件／前提デプロイ完了確認列も含む 6 列で運用するか（候補 M）。
3. **A-102 K-1 継続サイクル方針**: Sprint023 DAY1 初計測後に決めるか、プランニング時点で「毎／隔／月次」のドラフトを置いて DAY1 で微調整するか（候補 O）。
4. **PBI-083 関連パターン選定方針**: 各章につき関連パターン 1 件必須なのか、複数許容で章ごと裁量とするか（候補 N）。
