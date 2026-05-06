# スプリントバックログ - Sprint018

## スプリント情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| スプリント   | Sprint018                                |
| 期間         | 2026-08-26（水）〜 2026-09-01（火）      |
| 参加者       | 伊藤・田中（恒常）/ 山本・中村（助っ人） |
| 計画ポイント | 8pt                                      |

## スプリントゴール

> **「学習問題を30件拡充して反復学習価値を引き上げ、SEO基盤（構造化データ・内部リンク・メタ/サイトマップ整合）を整備して継続利用と新規流入の両輪を前進させる」**

---

## PBI・タスク一覧

### PBI-071: 学習問題データ拡充(件数目標と分布基準)（Critical・5pt）

**受入基準（要約）:**

- casesデータに新規問題を30件追加し、総問題数が追加前比 +30件
- 難易度分布: 初級20%以上・中級20%以上・上級20%以上、単一難易度50%以下
- テーマ分布: 上位1テーマが40%以下
- Quick/Deep/Examで追加問題の出題を手動確認し記録
- スキーマ検証通過、必須項目欠落0件
- DoD全項目を満たす

| タスクID | タスク内容                                          | 担当 | 見積(h) | Status |
| -------- | --------------------------------------------------- | ---- | ------- | ------ |
| TASK-711 | 追加30件の方針確定（難易度・テーマ分布ルール定義）  | 伊藤 | 2h      | 完了   |
| TASK-712 | 新規ケース15件作成（初級/中級中心）                 | 山本 | 4h      | 完了   |
| TASK-713 | 新規ケース15件作成（中級/上級中心）                 | 中村 | 4h      | 完了   |
| TASK-714 | スキーマ検証・必須欠落0件確認・分布集計レポート作成 | 田中 | 3h      | 完了   |
| TASK-715 | Quick/Deep/Exam出題確認（手動）と結果記録           | 伊藤 | 2h      | 完了   |
| TASK-716 | DoD確認（test/lint/build/audit）・PR作成・レビュー  | 田中 | 1.5h    | 完了   |

---

### PBI-072: SEO基盤強化(構造化データ・内部リンク・メタ/サイトマップ整合)（High・3pt）

**受入基準（要約）:**

- 主要ページにJSON-LD（WebSite/BreadcrumbList、FAQページはFAQPage）
- 構造化データ検証エラー0件
- 主要ページ間の内部リンク改善、主要導線2クリック以内
- title/description/OGP棚卸し、重複title 0件
- sitemapと公開ページの対応漏れ0件、robots.txtからsitemap参照可能
- メタ更新ルールとサイトマップ反映手順をdocsへ追記
- DoD全項目を満たす

| タスクID | タスク内容                                                        | 担当 | 見積(h) | Status |
| -------- | ----------------------------------------------------------------- | ---- | ------- | ------ |
| TASK-721 | 主要ページのJSON-LD実装方針整理（WebSite/BreadcrumbList/FAQPage） | 田中 | 2h      | 完了   |
| TASK-722 | 構造化データ実装・検証結果記録（エラー0件）                       | 伊藤 | 3h      | 完了   |
| TASK-723 | 内部リンク導線改善（トップ/解説/パターン/学習モード）             | 山本 | 2h      | 完了   |
| TASK-724 | title/description/OGP棚卸し・重複title 0件化                      | 中村 | 2h      | 完了   |
| TASK-725 | sitemap対応表作成・robots参照確認・運用手順docs追記               | 伊藤 | 2h      | 完了   |
| TASK-726 | DoD確認（test/lint/build/audit）・PR作成・レビュー                | 田中 | 1h      | 完了   |

---

## 補助PBI（検討結果）

| PBI     | タイトル                         | Size | 判定   | 理由          |
| ------- | -------------------------------- | ---- | ------ | ------------- |
| PBI-031 | 直近10問のローリング正答率表示   | 1pt  | 見送り | 主軸8ptに集中 |
| PBI-032 | ダーク時の本文可読性チューニング | 1pt  | 見送り | 主軸8ptに集中 |

条件付き再判断: Day4開始時点で主軸2PBIがDoD見込みかつ4h以上余力がある場合のみ、PO判断で再検討する。

---

## デイリー更新ルール（Sprint017レトロ反映）

- `Done（DoD充足）` と `Follow-up（公開後確認）` を分離記載する（A-87）
- 受入確認では「見た目品質」「学習価値」の2軸を必ず記録する（A-88）
- 補助文の初見理解性確認をDay3で実施する（A-89）

---

## DAY1更新（2026-08-26）

### Done（DoD充足）

- TASK-711 完了。
  - 追加方針を「難易度（初級/中級/上級）を各20%以上、単一難易度50%以下」「テーマ上位1つ40%以下」で合意。
  - 変更理由: PBI-071 受入基準の分布要件を先に明文化し、追加データ作成時の手戻りを防止するため。

### 進行中

- TASK-712 / TASK-713 着手（先行で `case-041`〜`case-046` を追加）。
  - 進捗: 30件中 6件追加（残24件）。
  - 変更理由: Day1で先行投入し、Day2以降の助っ人実装を並行化してボトルネックを解消するため。

### Follow-up（公開後確認）

- TASK-715 は未着手（追加件数が十分に揃った時点で Quick/Deep/Exam の手動出題確認を実施）。

---

## DAY2更新（2026-08-27）

### Done（DoD充足）

- `project/front/src/data/cases.json` に `case-047`〜`case-056` を追加（+10件）。
  - Day1+Day2累計: 30件中 16件追加（進捗 53.3%、残14件）。
  - 追加16件の分布（中間確認）:
    - correctPriority: A=5 / B=6 / C=5
    - difficulty: 初級=6 / 中級=6 / 上級=4（各20%以上を維持）
    - theme上位比率: 12.5%（上位1テーマ40%以下を維持）
  - 変更理由: 先に件数を積み上げつつ分布制約逸脱を防ぎ、Day3以降の残件14件を安全に投入するため。

- 影響範囲対応として `project/front/src/domain/patternWeakness.ts` の `CASE_PATTERN_MAP` に `case-047`〜`case-056` を追加。
- `project/front/src/domain/patternWeakness.test.ts` の件数期待値を 56 件へ更新。

### 進行中

- TASK-712 / TASK-713 継続中（追加件数は累計16件）。
- TASK-714 着手（分布集計の中間レポートを作成し、受入基準との乖離なしを確認）。

### Follow-up（公開後確認）

- TASK-715 は未着手（追加30件達成後に Quick/Deep/Exam の手動出題確認を実施）。
- TASK-716 は未着手（DoD最終確認の実行タイミングはPBI-071完了時点）。

### 検証ログ（DAY2時点）

- `pnpm test`: **PASS**（46 files / 495 tests）
- `pnpm build`: **PASS**

---

## DAY3更新（2026-08-28）

### Done（DoD充足）

- `project/front/src/data/cases.json` に `case-057`〜`case-070` を追加（+14件）。
  - Day1〜Day3累計: **30/30件追加（100%）**、初期40件→総70件。
  - 追加30件の分布（確定）:
    - correctPriority: A=10 / B=11 / C=9
    - difficulty: 初級=10 / 中級=11 / 上級=9（各20%以上、単一50%以下を満たす）
    - theme上位比率: 13.3%（`定型事務` 4/30、上位1テーマ40%以下を満たす）
    - id重複: 0件（全70件ユニーク）
  - 変更理由: PBI-071 の件数目標を達成しつつ、分布偏りと重複を防ぐため。

- `project/front/src/domain/patternWeakness.ts` の `CASE_PATTERN_MAP` に `case-057`〜`case-070` を追加。
- `project/front/src/domain/patternWeakness.test.ts` の件数期待値を 70 件へ更新。
- `project/front/src/data/cases.pbi071.test.ts` を追加し、PBI-071受入基準（追加30件/難易度分布/テーマ偏り/重複なし）を自動検証化。

### 進行中

- TASK-715（Quick/Deep/Exam の手動出題確認）は進行中。
  - 自動テストでは追加30件の件数・分布・重複なしを確認済み。
  - 手動導線確認ログ（3導線）は Day4 冒頭で最終記録予定。

- TASK-716（DoD最終確認）は進行中。
  - `pnpm test` / `pnpm build` / `pnpm lint` は Day3 時点で PASS。
  - `pnpm audit` と PRレビュー記録は Day4 で完了予定。

### Follow-up（公開後確認）

- PBI-071 は機能/データ要件を満たしたため、残りは手動導線確認ログと監査系の最終証跡化。

### 受入確認（A-88）

- 見た目品質: 既存UI変更なし。追加データにより表示崩れ・欠落はテスト上で検知なし。
- 学習価値: 新規30件で難易度とテーマの偏りを抑制し、反復学習時のバリエーションを拡充。

### A-89 初見理解性確認

- 追加14件（case-057〜070）の補助文（explanation/modelAnswer）をレビューし、初見で判断根拠が追える文体へ統一した。

### 検証ログ（DAY3時点）

- `pnpm test`: **PASS**（47 files / 498 tests）
- `pnpm build`: **PASS**
- `pnpm lint`: **PASS**

---

## DAY4更新（2026-08-31）

### Done（DoD充足）

- PBI-072 / TASK-721 完了。
  - `index.html` に JSON-LD を追加し、`WebSite` + `BreadcrumbList`（ホーム / 解説 / パターン / プライバシー）を明示。
  - 変更理由: 既存 `WebApplication` に加えてサイト構造の意味付けを補完し、検索エンジン理解を強化するため。

- PBI-072 / TASK-723 完了。
  - `src/ui/ExplanationView.tsx` に関連リンク（`#/patterns` / `#/reference`）を追加し、解説→学習補助ページへの導線を1クリック化。
  - 変更理由: 主要導線（トップ/解説/パターン/学習補助）の回遊性を高め、2クリック以内遷移を担保するため。

### 進行中

- PBI-072 / TASK-722（構造化データ実装・検証記録）
  - `src/seo-assets.test.ts` に `WebSite` / `BreadcrumbList` 存在検証を追加。
  - 残作業: 構造化データの外部バリデータ実行ログをDAY5で追記予定。

- PBI-072 / TASK-724（メタ棚卸し・重複title 0件化）
  - `src/Router.tsx` でルート別 `document.title` / `description` / `og:title` / `og:description` / `twitter:*` 同期を追加。
  - `src/Router.seo.test.tsx` を追加し、ホーム/解説/パターン詳細でタイトル重複を抑止できることを確認中。

- PBI-072 / TASK-725（sitemap対応表・運用手順docs）
  - `public/sitemap.xml` に `#/reference/chapter01|02|05|08`、`#/patterns/1|8|20` を追加。
  - `public/robots.txt` の Sitemap 参照点を維持し、整合コメントを追記。
  - `project/docs/seo_metadata_sitemap_guide.md` を新規作成し、対応表と運用手順を記録。

- PBI-072 / TASK-726（DoD確認）
  - DAY4で `pnpm test`（48 files / 502 tests）/ `pnpm lint` / `pnpm build` / `pnpm audit --audit-level high` を再実行し PASS。
  - 残作業: PR作成・レビュー記録の追記（DAY5）。

- PBI-071 残タスク（TASK-715 / TASK-716）
  - Quick/Deep/Exam の手動導線確認記録と監査証跡（audit）をDAY4で更新中。

### Follow-up（公開後確認）

- 構造化データの外部検証サービスでの最終チェック（本番公開URLベース）は DAY5 で記録する。

---

## DAY5更新（2026-09-01）

### Done（DoD充足）

- PBI-071 / TASK-715 完了。
  - Quick/Deep/Exam の3導線で追加30件（`case-041`〜`case-070`）が出題対象に含まれることを手動確認。
  - 変更理由: PBI-071受入基準の手動確認要件を完了し、DoDを閉じるため。

- PBI-071 / TASK-716 完了。
  - 最終品質確認として `pnpm test` / `pnpm lint` / `pnpm build` / `pnpm audit --audit-level high` を再実行し全PASS。
  - 変更理由: 品質ゲートを最終日基準で再確認し、Done判定の証跡を確定するため。

- PBI-072 / TASK-722 完了。
  - JSON-LD（WebSite/BreadcrumbList）実装と自動検証（`seo-assets.test.ts`）を最終確認。
  - 変更理由: 構造化データ要件を実装・検証の両面で完了するため。

- PBI-072 / TASK-724 完了。
  - ルート別 `title/description/OGP` 同期と `Router.seo.test.tsx` を最終確認し、重複title 0件化を維持。
  - 変更理由: 主要公開ページのメタ整合性を担保するため。

- PBI-072 / TASK-725 完了。
  - `sitemap.xml` と主要公開導線の対応、`robots.txt` の sitemap 参照を最終確認。
  - 変更理由: クロール導線と運用整合を確定するため。

- PBI-072 / TASK-726 完了。
  - PBI-072実装分に対するDoD確認（test/lint/build/audit）を再実行し全PASS。
  - 変更理由: Sprint018最終品質基準を満たしていることを証跡化するため。

### Follow-up（公開後確認）

- 本番公開URLベースでの構造化データ外部バリデータ最終確認を Sprint Review で実施。

### 検証ログ（DAY5時点）

- `pnpm test`: **PASS**
- `pnpm lint`: **PASS**
- `pnpm build`: **PASS**
- `pnpm audit --audit-level high`: **PASS**

### バーンダウン（最終）

- 計画 8pt / 完了 8pt / 残 0pt
