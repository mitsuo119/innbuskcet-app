# 依頼事項メモ order014

## 依頼者

顧客: 佐藤

## 依頼概要

Google AdSense の審査が「**有用性の低いコンテンツ（Low value content）**」を理由に不合格となった。Google からの通知文では「コンテンツの最小要件」「独自性のある質の高いコンテンツと優れたユーザー エクスペリエンス」「ウェブマスター向けの品質に関するガイドライン（質の低いコンテンツ）」の 3 つが参照URLとして挙げられている。

**AdSense 審査に合格できる状態へサイトを引き上げるためのコンテンツ・UX・サイト構造の改善一式**をスクラムチームに依頼する。次スプリント以降の主軸テーマとして扱い、再申請までを 1 つの目標とする。

## 背景

- 現在の公開サイト: GitHub Pages 配信の Vite + React **SPA**（PBI-076 で History API ルーティング・SPA フォールバック対応済 / sitemap 41 ルート / canonical / OGP / Twitter Card 整備済）。
- AdSense 関連の既存実装:
  - `VITE_ADSENSE_CLIENT_ID` / `VITE_ADSENSE_SLOT_ID`（GitHub Secrets 経由・PBI-050 / PBI-052）。
  - 本番ビルド時のみ AdSense ローダーを `<head>` に注入する Vite プラグイン（[project/front/vite.config.ts](../../project/front/vite.config.ts)）。
  - `AdSlot` コンポーネントは未設定時に何も描画しない安全フォールバック。
- 既に整備済の AdSense 審査前提:
  - **プライバシーポリシー**（[project/front/src/pages/PrivacyPolicy.tsx](../../project/front/src/pages/PrivacyPolicy.tsx)）: Cookie・広告（AdSense / DoubleClick）・第三者提供・お子様のプライバシー等、ポリシー要件は記載済。
  - **お問い合わせ**（[project/front/src/pages/Contact.tsx](../../project/front/src/pages/Contact.tsx)）: GitHub Issues 経由の問い合わせ手段あり。
- 既に存在するコンテンツ資産:
  - リファレンス全 12 章（`/reference/chapter01..12`）。
  - 案件パターン詳細 20 件（`/patterns/:id`）。
  - 代表ケース解説（`/cases/:id` × 20）。
  - 学習機能（Quick / Deep / Exam モード）。
- それでも AdSense は「有用性の低いコンテンツ」と判定。SPA／コンテンツ／ E-E-A-T の観点で**クローラ可視性および独自性・信頼性の補強**が不足している可能性が高い。

## 想定される不合格要因（仮説）

スクラムチームで原因切り分けを行うが、佐藤側の仮説は以下のとおり。優先順位はおおむね上から。

1. **SPA のクローラ可視性不足（最有力）**: AdSense 審査クローラは Googlebot より JS レンダリング能力が弱い場合があり、`index.html` の `<body>` がほぼ空のまま審査されている可能性。Search Console の URL 検査（C1〜C3）でインデックス済みでも、AdSense クローラがレンダリング後の本文を取得できていないと「内容なし」と判定されやすい。
2. **E-E-A-T 不足（運営者・著者・連絡先の明示不足）**: 運営者情報（About / 運営者ページ）が未整備。Contact が GitHub Issues のみで「実体のあるサイト運営者」が読み取りにくい。
3. **コンテンツの独自性・深さの訴求不足**: ref/chapter01..12 と patterns/cases は元から独自テキストだが、トップページなど主要ランディングのテキスト本文が薄い／導線中心の構成になっており「サイトとして何を提供しているか」が一読で伝わりにくい可能性。
4. **利用規約（Terms of Service）／免責事項の未整備**: AdSense の運営ポリシー的に「必要十分なポリシー一式」とまでは言われていないが、品質シグナルとして整備しておきたい。
5. **ナビゲーション・サイト構造の弱さ**: パンくず（BreadcrumbList JSON-LD）未導入、グローバルナビからの主要ページ到達導線がレビュアー視点で分かりづらい可能性。
6. **コンテンツ量の不足感**: 各案件パターン詳細 / ケース詳細の本文ボリュームが章ページに比べて薄い箇所が混在している可能性（要計測）。
7. **AdSense スクリプト挿入と審査タイミングの噛み合わせ**: 審査用コードが head に挿入されている状態でクローラが「サイトに価値あるコンテンツがない」と判定するパターン。スクリプト挿入条件自体は変更不要だが、審査再申請までに上記 1〜6 を整えるのが本筋。

## 目的

1. **AdSense 審査に合格する**（再申請して "approved" 判定を得る）。
2. その過程で、SEO・E-E-A-T・コンテンツ品質を**サイトの恒久的な底力として引き上げる**（一度合格して終わりにしない）。
3. SPA という技術選択を維持したまま、クローラから見たコンテンツ可視性を確保する（必要に応じて SSG / Pre-render を ADR で検討）。

## 期待成果

- AdSense 再申請を実施し、**合格判定を取得**する（最終ゴール）。
- 以下が公開・反映されている：
  - **運営者情報ページ（About / 運営者）**: サイトの目的・運営方針・運営者の立ち位置・連絡手段・コンテンツポリシー（出典・参考文献の扱い）を 1 ページに集約。
  - **利用規約ページ（Terms of Service）**: 利用条件・免責・著作権・準拠法を明記。
  - **トップページの本文強化**: 「このサイトは何か／誰のためのものか／何が学べるか／どう使うか」を**スクリプト無効でも読める静的テキスト**として `index.html` 経路で見える形に補強。
  - **パンくず（BreadcrumbList JSON-LD）**: 全主要ルートに導入。
  - **クローラ可視性の補強**: SPA を維持しつつ、主要 SEO 重点ページ（トップ・全 ref 章・全 patterns・全 cases・各 legal）について**プリレンダリング（SSG）または静的 HTML フォールバック**を導入し、`view-source` および JS 無効状態で見出し・本文要約・主要内部リンクが取得可能になっている。
  - **コンテンツ薄ページの底上げ**: cases / patterns の本文文字数下限ガイドライン（例: 800〜1200 字目安）を `pr_checklist.md` または `seo_operations.md` に明文化し、不足ページを補強。
- Search Console / Lighthouse SEO 計測で**退行ゼロ**（Performance / SEO / Accessibility / Best Practices）。
- 再申請前チェックリスト（AdSense ポリシー × 本サイト）を `project/docs/` 配下に新設し、再申請判定の根拠を残す。

## 要求事項

### 1. 原因切り分け（DAY1 〜 DAY2）

- (a) **AdSense クローラ可視性の現状把握**: `view-source:` で本番 URL を見て `<body>` の静的内容を確認。Google の **Mobile-Friendly Test / Rich Results Test / URL 検査ツール**で主要ページ（`/`・`/reference/chapter01`・`/patterns/1`・`/cases/<代表>`・`/privacy-policy`・`/contact`）のレンダリング済み HTML スナップショットを取得し、`project/docs/` 配下に保存（中村・山本）。
- (b) **AdSense ポリシー逐次マッピング**: Google が通知文で参照した 3 ガイドライン（[コンテンツの最小要件](https://support.google.com/adsense/answer/9261909) / [独自性のある質の高いコンテンツ](https://support.google.com/adsense/answer/1348688) / [質の低いコンテンツ](https://developers.google.com/search/docs/essentials/spam-policies)）を逐項目で本サイトに照合し、ギャップ表を作成（渡辺・PO 鈴木合意）。
- (c) **原因仮説の確定**: §背景の仮説 1〜7 のうち、(a)(b) を踏まえて確度の高い要因を 1〜3 件に絞り込み、Sprint プランニングの主軸 PBI 選定に反映。

### 2. 必須対応（合格に直結するもの・優先度 High）

#### 2-1. SPA のクローラ可視性補強（最重要）

- **SSG / Pre-render 採否を ADR で確定**:
  - 候補: vite-plugin-ssg 系 / vite-plugin-prerender / 自前の静的 HTML 生成スクリプト（`scripts/` 配下）／ SSR 全面移行（react-router + framework）／現状維持 + `<noscript>` 強化。
  - 評価軸: AdSense クローラへの可視性 / 既存 SPA 挙動の維持 / ビルド時間 / 保守コスト / バンドル肥大化 / a11y・テスト退行リスク。
  - 既存方針: order010〜011 では「SSR / SSG は ADR で別検討」としていた。本 order で**当該 ADR を起票・決定する**ところまでを範囲に含める。
- **採用案に基づき主要ルートをプリレンダリング**: トップ / 全 ref 章 12 / 全 patterns 20 / 全 cases 20 / `/privacy-policy` / `/contact` / `/about`（新設）/ `/terms`（新設）の計 57+ ルートで、JS 無効でも以下が見える：
  - `<h1>` および 1〜2 段落の本文要約
  - パンくず
  - 主要内部リンク（同章の次/前、関連パターン、ホームへの戻り）
  - canonical / description / OGP（既存）

#### 2-2. 運営者情報ページ（About / 運営者）新設

- 新規ルート `/about`。
- 必須記載: サイト目的 / 想定読者 / コンテンツ作成方針（参考文献 ref/chapter01..12 の自前再構成である旨）/ 運営者（個人 or チーム）/ 連絡手段（Contact ページへの導線）/ 更新ポリシー。
- グローバルナビ・フッターからの導線追加。
- sitemap / canonical / OGP・Twitter Card メタ整備。

#### 2-3. 利用規約ページ（Terms of Service）新設

- 新規ルート `/terms`。
- 必須記載: 利用条件 / 免責 / 著作権・知的財産（ref テキストの取り扱い）/ 禁止事項 / 準拠法 / 改定。
- フッター legal リンク群に追加（プライバシー / 利用規約 / お問い合わせの 3 点セット）。

#### 2-4. トップページの本文強化（"Above the fold" の意味性）

- 既存導線中心構成を維持しつつ、トップに「**このサイトについて**」段落（200〜400 字程度）を追加し、サイト目的・対象読者・無料学習である旨・主要コンテンツ（全 12 章解説 / 20 パターン / 20 ケース / Quick/Deep/Exam モード）を**プレーンテキストで**説明。
- AdSense クローラに対して「ここは何のサイトか」が `<body>` 直下のテキストで判別可能になることを目的とする。

### 3. 推奨対応（合格確率を引き上げるもの・優先度 Medium）

- **パンくず（BreadcrumbList JSON-LD）**: トップ / リファレンス / 章詳細、トップ / パターン / パターン詳細、トップ / ケース / ケース詳細 の 3 系統で JSON-LD `BreadcrumbList` を出力。視覚的パンくず UI も併設。
- **構造化データ拡張**: 各章・パターン・ケースに `Article` または `LearningResource` の JSON-LD を付与（datePublished / dateModified / author / publisher を含む）。
- **コンテンツ薄ページの底上げ**: cases / patterns で本文文字数が下限（例: 800 字）未満のページを洗い出し補強。`pr_checklist.md` §10.5 に「本文 800 字以上」のチェックを追加。
- **`<noscript>` ブロックの整備**: SSG 採用までの暫定として、主要ページの `<noscript>` に最低限の説明文を出す。
- **`robots.txt` / `sitemap.xml`**: 既存運用維持。AdSense 用 `ads.txt`（[support.google.com/adsense/answer/7532444](https://support.google.com/adsense/answer/7532444)）の配置を確認。未配置なら追加。

### 4. 検証・再申請（優先度 High）

- 再申請前チェックリスト（新規）: `project/docs/adsense_reapply_checklist.md` を作成し、§1〜§3 の各項目に「完了 / 未完了 / 該当なし」を入れて根拠リンクを残す。
- セキュリティ監査（渡辺）が外部スクリプト（AdSense ローダー）・追加ページの XSS 経路に新たな問題がないことを確認（PBI-050 / PBI-052 路線維持）。
- Lighthouse SEO 実スコア・Search Console KPI が**退行していない**ことを確認（A-98 / A-102 サイクルに乗せる）。
- AdSense 管理画面から**再申請を実施**し、結果（合格 / 再不合格＋理由）を `seo_operations.md` に記録。再不合格の場合は本 order を継続更新し、追加対策を起票する。

### 5. 容量・チームへの注意

- A-99 容量試算で Sprint 上限は **6〜8pt（通常運用）**。本 order は主軸テーマ 1 件に相当するボリュームのため、**1 スプリントで全部はやらない前提**で PO 鈴木にバックログ起票・分割・優先順位付けを依頼。
- 想定分割（リファインメント材料・新規 PBI 候補）:
  - **PBI-086（仮称）**: SSG / Pre-render 採否 ADR 起票 + 採用案 PoC（**2〜3pt**）。
  - **PBI-087（仮称）**: 主要 57+ ルートのプリレンダリング実装（**3〜5pt** ADR 結論次第）。
  - **PBI-088（仮称）**: `/about`（運営者情報）ページ新設（**1pt**）。
  - **PBI-089（仮称）**: `/terms`（利用規約）ページ新設（**1pt**）。
  - **PBI-090（仮称）**: トップページ本文強化（"このサイトについて" セクション）（**1pt**）。
  - **PBI-091（仮称）**: パンくず BreadcrumbList JSON-LD + 視覚 UI（**2pt**）。
  - **PBI-092（仮称）**: 構造化データ拡張（Article / LearningResource JSON-LD）（**2pt**）。
  - **PBI-093（仮称）**: コンテンツ薄ページ底上げ（**1〜2pt**・対象本数次第）。
  - **PBI-094（仮称）**: `ads.txt` 配置 + 再申請前チェックリスト整備 + 再申請（**1pt**）。
- 上記の見積もり / 分割粒度 / 採番は PO 鈴木が**バックログリファインメント**で確定する。先頭 1〜2 スプリントは「§2-1 SPA 可視性補強」を最優先とする。

## 受入観点（最終ゴール）

- **AdSense 再申請に合格**している（最重要）。
- `/about`・`/terms` が公開され、フッター legal リンク・サイトマップ・canonical・OGP が整っている。
- トップページ「このサイトについて」段落が JS 無効でも表示される（SSG 採用後）。
- 主要 57+ ルートの `view-source:` で `<h1>` と本文要約段落・パンくず・主要内部リンクが存在する。
- パンくず BreadcrumbList / 各章・各パターン・各ケースの Article(or LearningResource) JSON-LD が Rich Results Test で検証 OK。
- `pr_checklist.md` に「本文 800 字以上」「AdSense 再申請前チェック項目」が追記され、レビュー時に運用されている。
- Lighthouse SEO / Performance / Accessibility / Best Practices が**退行していない**。
- DoD 21 項目すべて「はい」。

## 制約・非機能

- **技術スタック現状維持**: Vite + React / GitHub Pages 配信。フレームワーク移行（Next.js 等）は**今回の範囲外**（ADR で代替案として検討するのは可だが、合格優先のため最小侵襲な SSG / Pre-render を推奨）。
- **既存テスト緑維持**: vitest 全 PASS / tsc 0 / lint 0 / build 成功 / pnpm audit クリーン。
- **a11y**: [a11y_checklist.md](../../project/docs/a11y_checklist.md) を遵守。新規 about / terms はキーボードのみ完結・375px 横スクロールなし・コントラスト AA。
- **セキュリティ**: AdSense ローダー周りで XSS 経路を増やさない（PBI-050 / PBI-052 規律踏襲）。`dangerouslySetInnerHTML` 不使用。外部リンクは `rel="noopener noreferrer"`。
- **SEO**: 既存 sitemap / canonical / OGP / Twitter Card / hash → History 規律を退行させない（order010〜011 で確立済）。
- **ライセンス**: ref/chapter01..12 は自前再構成テキストだが、外部出典がある場合の表記方針を `/about` のコンテンツポリシー欄で明示。

## 優先度

- 優先度: **Critical**（収益化計画に直結し、合格までは AdSense 広告が表示できないため）
- 依頼方針:
  - **先頭スプリントの主軸を §2-1（SPA クローラ可視性補強・SSG / Pre-render ADR + PoC）に置く**ことを推奨。
  - 次スプリントで §2-2 / 2-3 / 2-4（about / terms / トップ本文強化）と §3（パンくず / 構造化データ拡張）を消化。
  - その後 §4（再申請）に着手し、合格 or 再不合格判定をプロダクトバックログに反映する。

## リファインメント用メモ

- 候補 M: **SSG 採否 ADR の評価軸を 6 軸**（クローラ可視性・既存 SPA 挙動維持・ビルド時間・保守コスト・バンドル影響・テスト退行リスク）で固定し、各候補に 1〜5 点を付けて合計で決める運用にする。
- 候補 N: **「コンテンツ薄ページ」の定義**を本文文字数 800 字未満で機械的に判定するか、Reading time（例: 3 分未満）で判定するかをリファインメントで決める。
- 候補 O: **再申請のタイミング**を「§2 必須対応 4 件完了直後」「§3 推奨対応も完了後」「Search Console で全主要 URL がインデックス済になってから」のいずれにするかを PO 鈴木 + 渡辺で合意。
- 候補 P: **ads.txt の配置可否**を GitHub Pages 配信構成で確認（`public/ads.txt` 配置 + Vite ビルドでルート出力できるか）。

## 参考

- 親要望: [order010.md](./order010.md)（JavaScript SEO 対応・完全クローズ）／ [order011.md](./order011.md)（検索流入の入口拡大・完全クローズ）／ [order012.md](./order012.md)（ロングテール受け皿）／ [order013.md](./order013.md)（Sprint023 ハンドオフ & PBI-083）
- 既存 AdSense 周り資産:
  - [project/front/vite.config.ts](../../project/front/vite.config.ts)（AdSense ローダー Vite プラグイン）
  - [project/front/.env.example](../../project/front/.env.example)（`VITE_ADSENSE_*` 仕様）
  - [project/front/src/pages/PrivacyPolicy.tsx](../../project/front/src/pages/PrivacyPolicy.tsx)
  - [project/front/src/pages/Contact.tsx](../../project/front/src/pages/Contact.tsx)
  - [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml)（Secrets 注入）
- AdSense 公式参照:
  - コンテンツの最小要件: <https://support.google.com/adsense/answer/9261909>
  - 独自性のある質の高いコンテンツ: <https://support.google.com/adsense/answer/1348688>
  - ウェブマスター品質ガイドライン: <https://developers.google.com/search/docs/essentials>
  - 質の低いコンテンツ（スパムポリシー）: <https://developers.google.com/search/docs/essentials/spam-policies>
  - ads.txt ガイド: <https://support.google.com/adsense/answer/7532444>

---

## 補足: 上長との対話前提について

本メモは Google からの AdSense 不合格通知（「有用性の低いコンテンツ」「コンテンツの最小要件」「独自性のある質の高いコンテンツ」「質の低いコンテンツ」）を一次情報とし、佐藤エージェント単独で整理した一次ドラフトである。次回のバックログリファインメント前に上長（ユーザ）と以下を確認したい：

1. **SSG / Pre-render 採否方針**: ADR 起票は確定としつつ、フレームワーク移行（Next.js / Astro 等）まで踏み込んで良いか／最小侵襲（vite-plugin-prerender 等）で済ませるかの方向感。
2. **運営者情報（/about）の記載粒度**: 個人運営として実名 or ハンドル / 連絡先公開範囲をどこまで踏み込むか（AdSense では「運営者の透明性」がシグナルとして扱われやすい）。
3. **再申請のタイミング基準**: §候補 O のとおり、必須対応完了後すぐ申請するか、推奨対応とインデックス反映を待ってから申請するか。
4. **広告表示位置の見直し是非**: 合格後の話だが、現状の `AdSlot` 配置（学習画面内 / 解説下）が AdSense ポリシー（誘導クリック・コンテンツ近接）に抵触しないかを再点検したい（本 order の範囲外でも別 order として切り出す候補）。
