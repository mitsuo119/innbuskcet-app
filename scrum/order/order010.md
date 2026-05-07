# 依頼事項メモ order010

## 依頼者

顧客: 佐藤

## 依頼概要

Google検索からの自然流入を増やすため、**SEO（特にJavaScript SEO）対策を強化**し、あわせて**サイトのコンテンツボリュームを引き上げる**。検索ユーザーが「インバスケット 学習」「優先順位 判断 練習」等のキーワードで本サイトに到達できる状態を目指す。

## 背景

- 現状はSPA（Vite + React）構成で、クライアントサイドレンダリング比率が高い。Googlebotはレンダリング可能だが、レンダリング待ち・誤クロール・soft 404・リンク非認識等のリスクがある。
- order009で構造化データ・メタ・サイトマップの基盤整備は進行/取り込み済みだが、**「検索流入を生み出す」観点でのコンテンツ面とJSレンダリング面の対策が不足**している。
- 参考: [Google検索セントラル: JavaScript SEO の基本](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=ja)

## 目的

1. 検索エンジンが本サイトの**主要ページを正しくクロール・レンダリング・インデックス**できる状態にする。
2. **検索意図に応えるコンテンツ量・質**を増やし、ロングテールキーワードでの流入口を増設する。
3. SEO効果を**継続的に計測・改善できる運用基盤**を整える。

## 期待成果

- 検索エンジンから見た「インデックス可能ページ数」の増加。
- 主要学習導線・解説ページが**初回HTMLまたは安定したレンダリング後HTML**で検索エンジンに認識される。
- title / description / canonical / OGP / 構造化データが**ページ役割ごとに一意かつ適切**に設定される。
- 検索流入の計測（Search Console / sitemap送信）と効果検証ができる。

## 要求事項

### 1. JavaScript SEO対応（Google JS SEO基本に準拠）

- **クロール可能なリンク**（`<a href="...">` ベース）でページ間遷移できること。`onClick`のみで遷移するリンクは廃止/併設する。
- **History API（pushState）ベースのルーティング**を維持し、ハッシュ（`#`）依存ルートは避ける。
- **soft 404の回避**: 存在しないルート/ケースIDは適切な404レスポンス相当の挙動とインデックス除外（`noindex`）にする。
- **canonicalタグ**を全ページに設定し、重複コンテンツ判定を防ぐ。
- **title / meta description**をページ単位で動的に設定（既存仕組みがあれば網羅性を点検）。
- **lazy-load**画像/コンテンツが Googlebot から見えること（IntersectionObserver等の標準手法を使用）。
- **レンダリング遅延の最小化**: 主要コンテンツがJSエラーで欠落しないこと（フォールバックHTML/プリレンダリング検討）。
- **構造化データ**（Article/FAQPage/BreadcrumbList等）の妥当性を Rich Results Test で確認可能にする。

### 2. サイトボリューム拡充（検索流入の入口を増やす）

- **解説/参考コンテンツの拡充**: ref/chapter01〜chapter12をベースに、検索意図に対応する解説ページを段階的に増設する。
- **ロングテール対応**: 「インバスケット 例題」「優先順位 マトリクス」「インバスケット コツ」等のクエリに応える独立URL/見出し構造を設計する。
- **問題解説ページの単独URL化**: 個別ケース/パターンを単独URLで参照可能にし、内部リンクと外部被リンク双方の受け皿を作る。
- **helpful content原則**: 学習者にとって有用で独自性のある内容（オリジナル解説、例題、判断のコツ）を担保する。

### 3. SEO計測・運用基盤

- `sitemap.xml` を自動更新し、Search Console へ登録できる運用にする。
- `robots.txt` で不要パス除外・sitemap参照を明示する。
- 主要KPI（インデックス済ページ数、表示回数、クリック数、平均掲載順位）を定期確認できる手順を定義する。
- 必要に応じて Lighthouse SEO スコアを CI で参考値として測定（既存 `lighthouse-sprint016.md` 運用と整合）。

## 受入観点

- Google Search Console の「URL検査」で主要ページが**インデックス登録可能**と判定される。
- すべての内部遷移が `<a href>` で実装され、JS無効環境でもURLが取得できる（リンクとして見える）。
- 主要ページで title / description / canonical / 構造化データが**重複なく**設定されている。
- 404/存在しないIDでアクセスした際、soft 404にならず適切に扱われる（noindex / 404相当レンダリング）。
- 解説/参考コンテンツが**新規にN件以上追加**され、各ページが単独URLでアクセス可能（件数はリファインメントで決定）。
- `sitemap.xml` / `robots.txt` が最新状態に追従している。

## 制約・非機能

- **技術スタック現状維持**を原則とする（Vite + React SPA）。SSR/SSG導入は別途ADRで検討（Sprint内では結論を出さなくてよい）。
- **パフォーマンス**: Lighthouse Performance / SEO スコアを既存水準から下げない。
- **アクセシビリティ**: `a11y_checklist.md` を遵守。リンク化に伴うa11y退行を出さない。
- **モバイルファースト**: 既存の375px対応を維持（Mobile-Friendly前提）。
- **計測**: Search Console連携は本番ドメイン前提のためFollow-up許容。ローカル/CIでは構造的検証（HTMLメタ・構造化データJSON-LD・sitemap生成）に留める。
- **コンテンツ品質**: 既存 ref/ 配下の章立てとの整合を保ち、重複を避ける。

## 優先度

- 優先度: High
- 依頼方針: 次スプリントのリファインメント対象として優先的に分割・見積もりを実施

## リファインメント用メモ（次ステップで分割したい単位）

- 候補A: **JSクロール対応の点検と是正**（`<a href>`化・History API確認・soft 404対策・canonical網羅）
- 候補B: **メタ/構造化データの網羅レビュー**（ページ単位の重複・欠落チェックと自動テスト追加）
- 候補C: **解説/参考コンテンツ拡充（ロングテール）**（ref/chapterを起点に独立URLの解説ページをN件増設）
- 候補D: **個別ケース/パターン単独URL化**（深いリンクを生成し、被リンク受け皿と内部回遊を強化）
- 候補E: **sitemap.xml / robots.txt 自動更新**（CIまたはビルド時生成、Search Console登録手順整備）
- 候補F: **SEO計測運用ドキュメント整備**（KPI定義・モニタリング頻度・改善サイクル）

上記A〜Fを独立PBIとして分割可能な粒度で、PO/開発者にて見積もり・優先順位付けを実施したい。

## 参考

- [Google検索セントラル: JavaScript SEO の基本](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=ja)
- 関連既存資産: `project/docs/seo_metadata_sitemap_guide.md`, `project/docs/lighthouse-sprint016.md`
- 既存PBI完了: PBI-072（SEO基盤強化: 構造化データ・内部リンク・メタ/サイトマップ整合）

---

## リファインメント反映記録（2026-05-07 / Sprint020 前）

候補 A〜F を以下 7 PBI に分割し product_backlog.csv に Ready 化：

- 候補A → PBI-076（History API 移行＋soft 404, High, 5pt） / PBI-077（`<a href>` 化, High, 3pt）
- 候補B → PBI-078（canonical・メタ網羅レビュー＋自動テスト, Medium, 3pt）
- 候補C → PBI-080（ref 未公開 8 章解説ページ, High, 5pt）
- 候補D → PBI-079（全 20 パターン・代表ケース単独 URL 化, High, 5pt）
- 候補E → PBI-081（sitemap.xml/robots.txt ビルド時自動生成, Medium, 2pt）
- 候補F → PBI-082（SEO 計測運用ドキュメント, Low, 2pt）

合計 25pt。PBI-076 が他 6 PBI の前提（依存）。佐藤エージェントとしては候補 A→D→C の順で価値が立ち上がる想定で本要望は取り込み完了と判断する。SSR/SSG 採用是非は ADR で別途検討（Sprint 内結論不要）。
