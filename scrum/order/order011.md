# 依頼事項メモ order011

## 依頼者

顧客: 佐藤

## 依頼概要

order010（SEO / JavaScript SEO 強化）で確立した技術基盤（Sprint020 で PBI-076 / PBI-082 受入完了）を踏まえ、**「検索流入の入口を実際に増やす」フェーズ**へ段階を進める。残 PBI-077〜081 の消化を最優先とし、あわせて Sprint020 レビューで佐藤から提示した 2 点（404 画面の補助導線・Search Console 継続報告）を要件として明文化する。

## 背景

- Sprint020 で SEO 技術基盤（History API ルーティング・soft 404 回避・sitemap pathname 化・seo_operations.md による継続改善運用）が確立した。
- order010 リファインメント結果として、PBI-077 / PBI-078 / PBI-079 / PBI-080 / PBI-081 が Ready 状態で残っている（合計 18pt）。直近 3 スプリント平均は 6.67pt のため、おおむね 3 スプリント前後で消化できる規模。
- Sprint020 レビューで顧客（佐藤）から以下の追加観点が出ている：
  - (a) 404 画面で「トップへ戻る」だけでなく、リファレンス／パターン一覧への補助導線があると外部流入時の離脱を減らせる（緊急度：低）。
  - (b) Search Console での実インデックス状況・主要 KPI（表示回数・クリック数・平均掲載順位）の**継続報告**を希望（PBI-082 で運用基盤は整備済）。
- Sprint020 レトロにおいて、(a) は PBI-079（ケース単独 URL）/ PBI-080（未公開章解説）の自然導線整備で吸収する方針が合意済。新規 PBI 起票は不要との PO 判断あり。

## 目的

1. order010 の技術基盤を**「実コンテンツと運用」へ展開**し、検索エンジンから見たインデックス可能ページ数とクロール対象の質を引き上げる。
2. ロングテール検索に応える**オリジナル解説コンテンツ**（ref 未公開 8 章＋代表ケース 20 件以上）を提供し、検索流入の受け皿を増設する。
3. sitemap 更新漏れ・メタ重複を**構造的に防ぐ仕組み**（ビルド時自動生成・自動テスト）を Sprint021 早期に導入し、以降のコンテンツ追加コストを下げる。
4. Search Console / Lighthouse SEO の**定点観測サイクル**をスプリント運用へ組み込み、改善効果を可視化する。

## 期待成果

- 残 5 PBI（PBI-077〜081）が概ね 3 スプリント以内に Done となり、order010 が完全クローズする。
- パターン詳細・代表ケース・解説章の単独 URL がそろい、ホーム以外の入口（ロングテール）から学習者が直接到達できる状態になる。
- 内部遷移が完全に `<a href>` ベースになり、Googlebot が JS 無効でもサイト構造を辿れる。
- ルート追加時に sitemap.xml / robots.txt が自動更新され、CI が不整合を検知して落ちる。
- メタ重複（title / description / canonical / OGP）が自動テストで継続検証され、PR レビュー負担が下がる。
- Search Console のインデックス済ページ数・主要 KPI が**スプリント単位で報告**される（佐藤 (b)）。
- 404 画面に主要導線（リファレンス／パターン一覧）への補助リンクが追加され、外部流入の離脱を抑える（佐藤 (a) を PBI-079 / PBI-080 のついでに回収）。

## 要求事項

### 1. 残 PBI の消化（order010 延長線）

- **PBI-081（sitemap.xml/robots.txt ビルド時自動生成・2pt・Medium）を最優先で先行**：今後のコンテンツ追加（PBI-079 / PBI-080）で生まれる sitemap 更新漏れを構造的に防ぐため、Sprint021 DAY1〜2 で先行投入したい。
- **PBI-077（`<a href>` 化・3pt・High）**：Quick / Deep / Exam スタートの onClick 単独遷移箇所を整理し、修飾キー新規タブ・キーボード操作・a11y の回帰テストを担保する。
- **PBI-078（canonical / メタ重複網羅レビュー＋自動テスト・3pt・Medium）**：以降のコンテンツ追加 PBI（PBI-079 / PBI-080）で重複メタが発生しないよう、データ系 PBI 着手前に自動テストを敷く。
- **PBI-079（全 20 パターン詳細・代表ケース 20 件以上の単独 URL 化・5pt・High）**：PBI-076 / PBI-078 完了後に着手。各 120 字以上のオリジナル解説と BreadcrumbList JSON-LD を付与する。
- **PBI-080（ref 未公開 8 章解説ページ・5pt・High）**：5pt コンテンツ重 PBI のため、可能な限り**単独スプリント**で品質を確保したい（Sprint020 レトロ A-94 の継続観察対象）。

### 2. Sprint020 レビュー追加観点の織り込み（新規 PBI 起票なし）

- **佐藤(a) 404 画面の補助導線**：PBI-079 / PBI-080 の自然導線整備に**組み込む**。具体的には、以下のいずれかで充当できれば本件はクローズする。
  - PBI-079 着手時に NotFound 画面へ「パターン一覧」「解説リファレンス」の補助リンクを追加（軽微・受入基準補強で対応可）。
  - もしくは PBI-080 で ReferenceIndex への内部リンクが明確になった段階で 404 画面からの補助リンクを併記する。
- **佐藤(b) Search Console インデックス状況の継続報告**：PBI-082 で整備済の `seo_operations.md` の運用フローで継続観測する。具体的には：
  - スプリント単位で Search Console の「インデックス済ページ数 / 表示回数 / クリック数 / 平均掲載順位」を取得し、Sprint Review §5（環境変化の共有）または §6（プロダクトバックログ調整）に簡潔に共有する。
  - 取得タイミング・担当・記録先を `seo_operations.md` で再確認し、不足があれば軽微な追記で運用に乗せる（新規 PBI は不要）。

### 3. 公開後確認の継続運用

- Sprint020 引継ぎ（[handoff_for_next_sprint.md §1](../sprint020/handoff_for_next_sprint.md)）の C1〜C4 のうち、C3（Search Console URL 検査）／C4（Lighthouse SEO 定点観測）が **Sprint021 DAY1〜2 で中村実施**として残っている。Sprint021 sprint_backlog の受入確認メモにチェック欄を必ず設けて持ち越さない運用とする。

## 受入観点

- PBI-077〜081 がすべて Done となり、`product_backlog_done.csv` に sprint=sprint021 以降で記録される。
- PBI-081 完了後、ルート追加 PR は sitemap.xml / robots.txt が自動更新され、`sitemap-coverage.test` が CI で動作する。
- PBI-078 完了後、新規ルート追加時に title / description / canonical の重複・欠落があれば自動テストが失敗する。
- PBI-079 / PBI-080 完了後、Search Console「URL 検査」で代表ケース・未公開章ページの少なくとも各 1 件が**インデックス登録可能**と判定される。
- 404 画面に主要導線への補助リンクが少なくとも 2 件（パターン一覧・解説リファレンス）追加され、a11y 退行（フォーカス順序・キーボード操作・コントラスト）がない。
- Sprint021 以降、Sprint Review 議題に Search Console の主要 KPI 値が継続的に記録される。

## 制約・非機能

- **技術スタック現状維持**（Vite + React SPA）。SSR/SSG 採用是非は ADR で別検討（order010 と同方針）。
- **パフォーマンス**: Lighthouse Performance / SEO スコアを既存水準（Sprint020 計測値）から下げない。
- **アクセシビリティ**: `a11y_checklist.md` を遵守。`<a href>` 化・404 補助導線追加で a11y 退行を出さない。
- **モバイルファースト**: 375px 対応を維持。
- **DoD**: 21 項目すべて「はい」を全 PBI で達成。`pr_checklist.md §10`（SEO / サイトマップ整合）を継続適用。
- **コンテンツ品質（PBI-080 / PBI-079）**: 既存 ref/ 配下章立てとの整合・helpful content 原則を遵守し、AI 生成丸写しでなくオリジナル解説とする。
- **計測**: Search Console 連携は本番ドメイン前提のため、ローカル/CI では構造的検証（HTML メタ・JSON-LD・sitemap 生成）に留める。

## 優先度

- 優先度: **High**（order010 のクローズと検索流入実効化を 3 スプリント以内に達成したい）
- 依頼方針:
  - Sprint021 はリファインメント済みの PBI-077〜081 から**依存関係順**で投入（推奨順序: PBI-081 → PBI-077 → PBI-078 → PBI-079 → PBI-080）。
  - 新規 PBI 起票は本要望時点で不要。佐藤 (a) は PBI-079 / PBI-080 の受入基準補強で吸収、佐藤 (b) は PBI-082 で整備済の運用フローで継続観測。

## リファインメント用メモ

- 候補 G: **PBI-079 受入基準への補強**（NotFound 画面に「パターン一覧」「解説リファレンス」補助リンクを追加する観点を 1 行追記する。新規 PBI ではなく既存 PBI の受入基準改定で対応）
- 候補 H: **`seo_operations.md` 運用追記**（Sprint Review でのインデックス済ページ数・主要 KPI の共有タイミング・担当・記録先を明記。軽微な運用追記）
- 候補 I（再確認）: **PBI-080 の単独スプリント化**（5pt・コンテンツ重のため、Sprint022 想定で単独投入できるよう SP / 期間配分を再検討）

候補 G / H は新規 PBI 起票せずに、Sprint021 リファインメントで既存 PBI の受入基準補強・運用文書追記として処理してよい。候補 I は Sprint021 プランニング時に PO / 開発者で議論。

## 参考

- 親要望: [order010.md](./order010.md)（SEO 強化・JavaScript SEO 対応）
- Sprint020 成果: [scrum/sprint020/sprint_review.md](../sprint020/sprint_review.md), [scrum/sprint020/sprint_retrospective.md](../sprint020/sprint_retrospective.md), [scrum/sprint020/handoff_for_next_sprint.md](../sprint020/handoff_for_next_sprint.md)
- 関連既存資産: [project/docs/seo_operations.md](../../project/docs/seo_operations.md), [project/docs/seo_metadata_sitemap_guide.md](../../project/docs/seo_metadata_sitemap_guide.md), [project/docs/lighthouse-sprint016.md](../../project/docs/lighthouse-sprint016.md), [project/docs/pr_checklist.md](../../project/docs/pr_checklist.md)（§10 SEO / サイトマップ整合）
- 関連既存 PBI: PBI-077 / PBI-078 / PBI-079 / PBI-080 / PBI-081（いずれも Ready）

---

## 補足: 上長との対話前提について

本メモは Sprint020 sprint_review.md §3 の佐藤フィードバック (a)(b)、handoff_for_next_sprint.md §2 の Sprint021 候補 PBI 整理、sprint_retrospective.md §Sprint021 への引継ぎ事項 §4「顧客フィードバック回収方針」を一次情報として、佐藤エージェント単独で整理した一次ドラフトである。Sprint021 リファインメント前に上長（ユーザ）と以下を確認したい：

1. PBI-080 を**単独スプリント**で投入する優先度（Sprint022 想定）に同意するか。
2. Search Console KPI（表示回数・クリック数・平均掲載順位）を Sprint Review でどの粒度・頻度で共有するか（毎スプリント / 隔スプリント等）。
3. 404 画面の補助導線追加は PBI-079 受入基準補強で吸収する方針で問題ないか（独立 PBI 化は不要との認識でよいか）。
