# 依頼事項メモ order012

## 依頼者

顧客: 佐藤

## 依頼概要

Sprint021 で SEO 構造的ゲート 3 件（PBI-077 / PBI-078 / PBI-081）が完成（計画 8pt / 完了 8pt・100% 達成・21 スプリント連続障害物ゼロ）したことを受け、**Sprint022 では order010〜011 の最終フェーズである「実コンテンツの本格展開」へ進む**。残 PBI-079 / PBI-080（いずれも 5pt・High・Ready）の確実な消化と、Sprint021 レビューで佐藤から新規に提示された **(b) 代表ケース 20 件選定の難易度・パターン分布バランス** を要件として明文化する。あわせて、Sprint022 DAY5 に予定されている **K-1（Search Console KPI 取得運用の正式開始）** をスプリント終了時の必達タスクとして固める。

## 背景

- Sprint021 で構造的 SEO ゲート 3 件が確立し、**今後コンテンツ系 PBI（PBI-079 / PBI-080）でルートを追加するだけで sitemap.xml / canonical / メタ重複 / `<a href>` 整合が CI で自動担保される設計** が成立した（`src/routes.ts` 単一ソース化）。
- 残る High 優先 PBI は **PBI-079（代表ケース 20 件 + 全 20 パターン詳細の単独 URL 化・5pt）** と **PBI-080（ref 未公開 8 章解説ページ・5pt）** の 2 本のみ。直近 3 スプリント平均は **7.0pt**（S019=6 / S020=7 / S021=8）。コア開発者キャパは 6h × 5 日＝30h、助っ人加味で上限約 10pt。
- Sprint021 レビュー（[sprint_review.md §3](../sprint021/sprint_review.md)）で佐藤から新規に 2 点：
  - (a) Search Console KPI（インデックス数／表示回数／クリック数／平均掲載順位）の継続報告希望。**公開後 14 日未満は測定 0 期** につき Sprint022 以降の正式取得開始で良い。→ K-1（中村・Sprint022 DAY5）で対応継続。
  - (b) **新規**：PBI-079 の代表ケース 20 件選定で **難易度（初級／中級／上級）と 20 パターンの分布バランス** を意識してほしい。
- Sprint021 レトロで **A-97（A-93 / A-95 / A-96 を scrum_team_culture.md へ卒業反映）／A-98（Sprint Review §公開後確認テンプレに「測定前提条件欄」追加）／A-99（Sprint Review §6 で「次スプリント容量試算」簡易表提示）** が決定済。Sprint022 から運用開始する。
- 公開後確認 C1'〜C4'（PBI-081 / 077 / 078 の本番反映後の最終裏取り）は Sprint021 Sprint Review 直後 30 分以内に山本・中村が実施済の想定。**万一不整合検出時のみ Sprint022 で緊急修正 PBI を起票** する運用となっている。

## 目的

1. **order010〜011 を Sprint022 で完全クローズ** する。残 PBI-079 / PBI-080 を消化し、ロングテール検索の受け皿（パターン詳細・代表ケース・解説章の単独 URL）を完成させる。
2. **PBI-079 の代表ケース 20 件選定品質を上げる**：佐藤(b) の難易度・パターン分布バランスを着手手順（TASK-079-1）の選定基準として明文化し、後工程に振り戻しを発生させない。
3. **K-1（Search Console KPI 取得運用）を Sprint022 DAY5 で正式立ち上げ** し、`seo_operations.md` §9 計測ログへの定点記録サイクルへ昇華する。
4. **Sprint022 容量設計を健全化**：PBI-079（5pt）／ PBI-080（5pt）の両投入か、単独投入＋小粒（PBI-073 / PBI-074 / PBI-075）併走かを、A-99 容量試算を参考に PO 鈴木がプランニングで決定。

## 期待成果

- PBI-079 / PBI-080 が Done となり `product_backlog_done.csv` に sprint=sprint022 で記録される（または分割投入の場合は最低 1 本 Done＋もう 1 本を Sprint023 へ確定送り）。
- 全 20 パターン詳細・代表ケース 20 件以上・ref 未公開 8 章の単独 URL がそろい、ホーム以外の入口（ロングテール）から直接到達できる状態が完成する。
- PBI-079 の代表ケース 20 件が **難易度（初級／中級／上級）を概ね均等配分** し、**20 パターンに対し偏りなく対応**（同一パターンに 3 件以上集中させない方針が共有される）した状態で公開される。
- K-1 で Search Console の主要 KPI（インデックス済ページ数・表示回数・クリック数・平均掲載順位）が `seo_operations.md` §9 計測ログに 1 回目の値として記録され、Sprint022 Sprint Review §5 で共有される（測定 0 期明けの初回値）。
- Sprint022 Sprint Review §6 で **A-99 容量試算簡易表** が初運用され、Sprint023 候補 PBI のプランニング前判断材料として機能する。
- Sprint022 Sprint Review §公開後確認テンプレに **A-98「測定前提条件欄」** が追加運用されている。

## 要求事項

### 1. PBI-079（5pt・High・Ready）の確実な消化

- 既存受入基準（[product_backlog.csv](../product_backlog.csv) の PBI-079 行）はそのまま維持。
- **佐藤(b) を着手手順（TASK-079-1）に織り込む**（新規 PBI 起票なし・既存 PBI の着手手順補強で対応）：
  - 代表ケース 20 件の選定基準として「難易度（初級／中級／上級）の分布が概ね均等」「20 パターンに対し偏りなく対応（同一パターンへの集中を避ける）」を明示。
  - 選定一覧（ID / 難易度 / 主要パターン番号）を Sprint022 sprint_backlog の TASK-079-1 ドキュメントに添付し、PO 鈴木がレビュー OK を出してから後工程（単独 URL ページ実装）へ進む。
- order011(a) で吸収済の **NotFound(404) 補助導線（パターン一覧 / 解説リファレンス への 2 件以上）** は受入基準にすでに反映済（[product_backlog.csv](../product_backlog.csv) 参照）。実装漏れがないことを Sprint022 DAY5 受入時に再確認する。

### 2. PBI-080（5pt・High・Ready）の単独スプリント化是非を判断

- order011 リファインメント用メモ「候補 I」として懸念されていた **PBI-080 の単独スプリント化** は Sprint022 プランニングで判断する。
- 投入パターン候補：
  - **パターン A（両投入 10pt）**：PBI-079 / PBI-080 を同時投入。コア＋助っ人で並走。リスク：いずれか持越時にコンテンツ品質が低下しやすい。
  - **パターン B（単独投入 5pt + 小粒 1〜2 件）**：PBI-079 を主軸に、PBI-073（2pt）／PBI-074（1pt）／PBI-075（1pt）から 1〜2 件併走。PBI-080 は Sprint023 へ確定送り。リスク：order010〜011 完全クローズが Sprint023 にずれる。
- PO 鈴木が Sprint022 プランニングで決定。本要望の優先度は **PBI-079 > PBI-080 > 小粒 PBI** とする。

### 3. K-1（Search Console KPI 取得運用の正式開始・佐藤(a) 継続）

- **Sprint022 DAY5（2026-09-29 想定）** に中村が実行：Search Console から「インデックス数 / 表示回数 / クリック数 / 平均掲載順位」を取得し、[seo_operations.md](../../project/docs/seo_operations.md) §9 計測ログに 1 回目の正式値を追記する。
- Sprint022 sprint_backlog にチェック欄を組み込み、**未完で持ち越さない運用**（Sprint021 レトロ §Sprint022 への引継ぎ事項 §1 継続）。
- Sprint022 Sprint Review §5 で測定 0 期明けの初回値として共有する。

### 4. プロセス改善 3 件（A-97 / A-98 / A-99）の Sprint022 適用

- **A-97**: Sprint022 Day0（プランニング前）までに高橋が A-93 / A-95 / A-96 を [scrum_team_culture.md](../scrum_team_culture.md) へ卒業反映する。
- **A-98**: Sprint022 Sprint Review §公開後確認テンプレに **「測定前提条件欄」**（公開後 N 日未満／クロール待ち／本番計測値未取得 等を PBI 横断で明示する欄）を追加運用開始（高橋・中村）。
- **A-99**: Sprint022 Sprint Review §6（プロダクトバックログ調整）で **「次スプリント容量試算（コア 30h ＋助っ人加味の上限 pt）」簡易表** を初運用提示（高橋）。

## 受入観点

- **order010〜011 完全クローズ判定**：Sprint022 終了時点で PBI-079 が Done。PBI-080 は Sprint022 完了がベスト、最低でも Sprint023 へ確定送りで Ready 維持。
- **PBI-079 受入基準の充足**：単独 URL 化／120 字以上のオリジナル解説／JSON-LD（BreadcrumbList または Article）／helpful content 自己点検（pr_checklist.md）／NotFound 補助導線 2 件以上／既存テスト全 PASS／DoD 21 項目すべて「はい」。
- **PBI-079 代表ケース選定品質**：選定一覧が PO 鈴木にレビューされ、難易度分布の均等性・パターン分布の偏りなさが TASK-079-1 ドキュメントで確認可能。
- **K-1 完了**：Sprint022 DAY5 までに Search Console KPI 4 種が `seo_operations.md` §9 計測ログへ記録され、Sprint Review §5 で共有される。
- **A-98 / A-99 初運用**：Sprint022 Sprint Review 議事録で「測定前提条件欄」と「次スプリント容量試算簡易表」が確認できる。
- **A-97 反映**：Sprint022 Day0 時点で `scrum_team_culture.md` に A-93 / A-95 / A-96 由来の文化追記が反映されている。

## 制約・非機能

- **技術スタック現状維持**（Vite + React SPA・GitHub Pages 配信）。SSR / SSG 採用是非は ADR で別検討（order010〜011 と同方針）。
- **パフォーマンス**: Lighthouse Performance / SEO スコアを既存水準（Sprint020 / 021 計測値）から下げない。コンテンツ追加で gzip サイズが膨らむ場合は code-split / lazy-load を検討。
- **アクセシビリティ**: [a11y_checklist.md](../../project/docs/a11y_checklist.md) を遵守。新規ページ（パターン詳細・代表ケース・未公開章）追加で a11y 退行を出さない。
- **モバイルファースト**: 375px 対応を維持。
- **DoD**: 21 項目すべて「はい」を全 PBI で達成。`pr_checklist.md` §10（SEO / サイトマップ整合）を継続適用。
- **コンテンツ品質（PBI-079 / PBI-080）**: 既存 ref/ 配下章立てとの整合・helpful content 原則を遵守。AI 生成丸写しでなく **オリジナル解説**（PBI-079: 各 120 字以上 / PBI-080: 各章 800 字以上）。
- **計測**: Search Console 連携は本番ドメイン前提のため、ローカル / CI では構造的検証（HTML メタ・JSON-LD・sitemap 生成）に留める（K-1 のみ本番計測値）。
- **キャパシティ**: コア 30h ＋助っ人加味で上限約 10pt。両投入（PBI-079+080=10pt）は理論上限のため、A-99 容量試算でリスク評価してから決定。

## 優先度

- 優先度: **High**（order010〜011 を Sprint022 でクローズしたい）
- 依頼方針:
  - Sprint022 主軸は **PBI-079（5pt・High）** で確定。
  - PBI-080 は Sprint022 / Sprint023 のいずれで投入するかを A-99 容量試算を踏まえて PO 鈴木が判断。
  - 小粒 PBI（PBI-073 / 074 / 075）はパターン B 採用時の併走候補。パターン A 採用時は Sprint023 以降へ送る。
  - 新規 PBI 起票は本要望時点で不要。佐藤(b) は PBI-079 の TASK-079-1 着手手順補強で吸収。

## リファインメント用メモ

- 候補 J: **PBI-079 の TASK-079-1 着手手順への佐藤(b) 反映**（代表ケース 20 件選定で「難易度均等」「パターン偏りなし」を選定基準として明文化。新規 PBI 起票せず handoff_for_helpers.md / sprint_backlog.md TASK-079-1 で対応）
- 候補 K: **PBI-080 投入時期の判断材料整理**（コンテンツ重 5pt のため Sprint022 単独投入か Sprint023 送りか。ref 未公開 8 章 × 各 800 字＝計 6,400 字以上の執筆コストを A-99 容量試算で見積もる）
- 候補 L: **K-1 運用の seo_operations.md §9 への昇華判断**（Sprint022 DAY5 初回計測後、定点観測を毎スプリント / 隔スプリントどちらで運用するかを Sprint022 レトロで議論）

候補 J は新規 PBI 起票せず、Sprint022 リファインメントで既存 PBI の着手手順補強として処理する。候補 K / L は Sprint022 プランニング・レトロで PO / 開発者で議論。

## 参考

- 親要望: [order010.md](./order010.md)（SEO 強化・JavaScript SEO 対応）／ [order011.md](./order011.md)（検索流入の入口拡大フェーズ）
- Sprint021 成果: [scrum/sprint021/sprint_review.md](../sprint021/sprint_review.md)・[sprint_retrospective.md](../sprint021/sprint_retrospective.md)・[handoff_for_helpers.md](../sprint021/handoff_for_helpers.md)
- 関連既存資産: [project/docs/seo_operations.md](../../project/docs/seo_operations.md)（§9 計測ログ運用）／ [seo_metadata_sitemap_guide.md](../../project/docs/seo_metadata_sitemap_guide.md)／ [pr_checklist.md](../../project/docs/pr_checklist.md)（§10 SEO / サイトマップ整合）／ [a11y_checklist.md](../../project/docs/a11y_checklist.md)
- 関連既存 PBI: PBI-079（Ready・5pt）／ PBI-080（Ready・5pt）／ 小粒併走候補 PBI-073（2pt）・PBI-074（1pt）・PBI-075（1pt）

---

## 補足: 上長との対話前提について

本メモは Sprint021 の sprint_review.md §3（佐藤フィードバック (a)(b)）／ sprint_retrospective.md §Sprint022 への引継ぎ事項 §1〜§4 ／ handoff_for_helpers.md §1（公開後確認）・§2（PBI-079 / 080 事前リファインメント）を一次情報として、佐藤エージェント単独で整理した一次ドラフトである。Sprint022 リファインメント前に上長（ユーザ）と以下を確認したい：

1. **Sprint022 投入パターン**: パターン A（PBI-079+080=10pt 両投入）／パターン B（PBI-079 単独 + 小粒 1〜2 件併走、PBI-080 は Sprint023 送り）のどちらを基本線とするか（A-99 容量試算を踏まえた判断）。
2. **PBI-079 代表ケース選定の難易度・パターン配分粒度**: 「概ね均等」の許容範囲（例：難易度ごとに最低 5 件以上 / 1 パターンあたり最大 2 件まで 等）を具体化するか、PO 鈴木裁量で運用するか。
3. **K-1 計測サイクル**: Sprint022 DAY5 で初回取得後、毎スプリント取得 / 隔スプリント取得 / 月次取得のいずれで継続するか（候補 L をどこまで先に決めておくか）。
