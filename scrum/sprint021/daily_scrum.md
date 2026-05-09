# デイリースクラム - Sprint021

## DAY1（2026-09-16）

### スプリントゴール再確認

検索流入を実コンテンツへ展開する前段として、sitemap/robots 自動生成・内部遷移の `<a href>` 化・canonical/メタ重複自動検知の3つの構造的ゲートを確立し、以降のコンテンツ追加（PBI-079/080）が安全に進む土台を整える。

### 各メンバー報告

| メンバー | 昨日                   | 今日                                                                                                                                       | 障害物 |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 田中     | （Sprint020 クローズ） | TASK-081-1 着手・完了（`src/routes.ts` 単一ソース新設＋Router の `VALID_REFERENCE_IDS` 導出化）。残: TASK-081-2 設計着手                   | なし   |
| 伊藤     | （Sprint020 クローズ） | TASK-077-1 監査完了（下記まとめ）。明日 TASK-081-3 着手＋TASK-077-3 準備                                                                   | なし   |
| 山本     | —                      | DAY3 着手予定（TASK-077-2）。本日は handoff 確認まで                                                                                       | なし   |
| 中村     | —                      | C4（Lighthouse SEO 試行）DAY1 中に実施予定／order011(b) Search Console 現状確認／seo_metadata_sitemap_guide.md に routes.ts 手順節を追記済 | なし   |

### 進捗（バーンダウン）

| PBI     | 状態        | 完了タスク | 残タスク                                |
| ------- | ----------- | ---------- | --------------------------------------- |
| PBI-081 | In Progress | TASK-081-1 | TASK-081-2 / 3 / 4（4 残中 1 部分着手） |
| PBI-077 | In Progress | TASK-077-1 | TASK-077-2 / 3 / 4 / 5                  |
| PBI-078 | In Progress | （無し）   | TASK-078-1〜5                           |

### TASK-081-1 完了報告（田中）

- `project/front/src/routes.ts` を新設し `PUBLIC_ROUTES` / `SITEMAP_REFERENCE_CHAPTER_IDS` / `SITEMAP_PATTERN_IDS` を export。SEO 単一ソース化を実体化。
- `Router.tsx` の `VALID_REFERENCE_IDS` を `SITEMAP_REFERENCE_CHAPTER_IDS` から導出し、Router と sitemap のズレを構造的に防止。
- 検証用テスト `routes.test.ts`（6 ケース）を追加：path 一意性・形式・priority レンジ・章ID整合・pattern ID 整合・主要静的ルート存在。
- ドキュメント `seo_metadata_sitemap_guide.md` に「ルート追加手順（PBI-081 単一ソース化以降）」節を追記。
- 結果: vitest 534/534 PASS / `tsc -b` エラー 0 / `eslint .` 警告 0。

### TASK-077-1 監査結果（伊藤・onClick 単独遷移箇所）

`grep navigate(` / `onClick=` の網羅結果。**href 化対象は Router.tsx 経由の遷移ハンドラに集約**しており、Sprint020 で主要画面 `<a href>` 化は先行済の前提が確認できた。

| ファイル                                                  | 箇所                                                                      | 種別                                          | 移行方針                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| `Router.tsx:313`                                          | `handleBackToHome = () => navigate('/')`                                  | onClick 経由（各ページの `onBack` prop 配線） | TASK-077-3 で `<a href="/">` 化＋ delegated click が pushState 化         |
| `Router.tsx:314`                                          | `handleBackToPatternList = () => navigate('/patterns')`                   | 同上（PatternDetail `onBack`）                | TASK-077-3 で `<a href="/patterns">` 化                                   |
| `Router.tsx:327`                                          | `onSelectPattern={(id) => navigate(`/patterns/${id}`)}`                   | PatternList の項目クリック                    | TASK-077-2 候補（パターンカード自体を `<a href>` 化）                     |
| `App.tsx`（home の Quick / Deep / Exam スタート）         | 既存 `<a href>` ベースで Sprint020 移行済を確認（onClick 単独遷移は無し） | —                                             | TASK-077-2 では `state` 注入用 onClick の preventDefault 連携を再確認のみ |
| `pages/*` の `<button onClick={onBack}>`                  | ホーム/一覧復帰                                                           | onClick 単独遷移として残存（onBack 経由）     | TASK-077-3 で `<a href>` 化（button → anchor 置換）                       |
| `ui/*`（AnswerButtons / ConfirmDialog / ScoreCounter 等） | 状態操作のみ（遷移なし）                                                  | —                                             | href 化対象外                                                             |

**結論**: 残存対象は Router.tsx の `handleBackToHome` / `handleBackToPatternList` / `onSelectPattern` 経由の3系統と、各 `pages/*.tsx` の `onBack` button の `<a href>` 化の合計 4 系統。TASK-077-2/3 で着実に消化可能。`<a href>` 化後は Router の delegated click handler（既存）が pushState 化を吸収するため新規ハンドラ追加不要。

### 障害物

- 識別 0 件。`scrum/impediment_log.csv` 追加更新なし。

### 適応

- 計画変更なし。DAY2 は TASK-081-2（sitemap 生成スクリプト）と TASK-081-3（coverage test）を田中／伊藤で並走着手予定。
- C3（Search Console URL 検査・期限 DAY2）と C4（Lighthouse SEO 試行・期限 DAY1）は中村が DAY1 中に対応（本日中の完了見込み）。

### 残課題（DAY2 引継）

1. TASK-081-2: `scripts/generate-sitemap.mjs` 新設。`routes.ts` の `PUBLIC_ROUTES` を読み込み `dist/sitemap.xml` を生成し `__SITE_URL__` を置換する（または `transform-seo-tokens.mjs` 拡張）。
2. TASK-081-3: 実ルート（routes.ts）と `dist/sitemap.xml` 掲載 URL の差分検知テストを追加し CI で FAIL するようにする。
3. TASK-078-1: PBI-078 メタマトリクス棚卸しを `routes.ts` を参照しつつ着手。
4. C3 / C4 の中村実施記録を `seo_operations.md` または handoff へ反映。

---

## DAY2（2026-09-17）

### スプリントゴール再確認

sitemap/robots 自動生成・内部遷移の `<a href>` 化・canonical/メタ重複自動検知の 3 ゲートを Sprint022 コンテンツ拡充前に確立する。DAY2 は PBI-081 完走と PBI-078 棚卸し着手が中心。

### 各メンバー報告

| メンバー | 昨日                                                                                   | 今日                                                                                                                                            | 障害物 |
| -------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 田中     | TASK-081-1 完了                                                                        | TASK-081-2 完了（`scripts/generate-sitemap.mjs` 新設＋`prebuild`/`pretest` フック）／TASK-078-1 完了（メタマトリクス棚卸しを SEO ガイドに追記） | なし   |
| 伊藤     | TASK-077-1 完了                                                                        | TASK-081-3 完了（`sitemap-coverage.test.ts` 追加・5 ケース／PUBLIC_ROUTES と public/sitemap.xml の差分検知 CI FAIL 化）                         | なし   |
| 山本     | DAY3 着手予定                                                                          | DAY3 から TASK-077-2 着手予定。本日は handoff 確認                                                                                              | なし   |
| 中村     | C4（Lighthouse SEO 試行）DAY1 実施／seo_metadata_sitemap_guide.md routes.ts 手順節追記 | C3（Search Console URL 検査）DAY2 実施・記録（`seo_operations.md` §4 へ反映予定）／TASK-081-4 仕上げ準備                                        | なし   |

### 進捗（バーンダウン）

| PBI     | 状態        | 完了タスク                 | 残タスク               |
| ------- | ----------- | -------------------------- | ---------------------- |
| PBI-081 | In Progress | TASK-081-1 / 081-2 / 081-3 | TASK-081-4（一部着手） |
| PBI-077 | In Progress | TASK-077-1                 | TASK-077-2 / 3 / 4 / 5 |
| PBI-078 | In Progress | TASK-078-1                 | TASK-078-2 / 3 / 4 / 5 |

### TASK-081-2 完了報告（田中）

- `project/front/scripts/generate-sitemap.mjs` を新設。`src/routes.ts` の `PUBLIC_ROUTES` リテラルを regex で安全パースし、`<loc>__SITE_URL__<path>` 形式の `public/sitemap.xml` を自動生成。
- `package.json` に `prebuild` / `pretest` を追加し、build / vitest 双方で生成スクリプトが先行実行される構成へ。`build` 末尾の `transform-seo-tokens.mjs` が dist/ 上で `__SITE_URL__` を GitHub Pages URL に置換する流れは PBI-058 規律維持。
- `public/sitemap.xml` 冒頭に AUTO-GENERATED ヘッダーコメントを付与し手動編集を構造的に抑止。
- 検証: `pnpm build` 成功・dist/sitemap.xml の `<loc>` が `https://katuz.github.io/ai-scrum-inbuscket/...` 形式に置換済を確認。dist/robots.txt の `Sitemap:` 行も絶対 URL 化済。

### TASK-081-3 完了報告（伊藤）

- `project/front/src/sitemap-coverage.test.ts` を新設・5 ケース PASS。
  1. sitemap.xml 件数が `PUBLIC_ROUTES` と一致
  2. `<loc>` 集合が `PUBLIC_ROUTE_PATHS` と完全一致（順序非依存）
  3. 全 path について `changefreq` / `priority` が routes.ts 定義と一致
  4. `<loc>` がすべて `__SITE_URL__` トークン始まり（http(s) 直書き 0 件）
  5. AUTO-GENERATED ヘッダーコメント残存（手動編集防止の明示）
- `pretest` で `generate-sitemap.mjs` を先行実行することで、CI 環境でも routes.ts と sitemap.xml の整合を構造的に強制（再生成漏れ即 FAIL）。

### TASK-078-1 完了報告（田中）

- `seo_metadata_sitemap_guide.md` に「公開ルート × メタマトリクス棚卸し（PBI-078 / TASK-078-1）」節を追記。13 公開ルート ＋ not-found の title / description 要旨 / canonical / noindex を一覧化。
- DAY3 で TASK-078-2/3/4 が自動化対象とする観点（title 一意性・description 差分・canonical 絶対 URL・noindex 限定付与・新規ルート未登録検知）を明示。
- 棚卸し結果から重複・欠落は現時点で 0 件と確認（resolveRouteSeo の case 完備）。

### C3 / C4 公開後確認フォロー（中村）

- **C4（DAY1 期限・完了）**: Lighthouse SEO 試行を `seo_operations.md` §4 手順で 1 回実施。スコアと所見は DAY3 中に同ドキュメント／handoff_for_helpers.md へ追記予定（試行値の正式記録は DAY3 セクションで反映）。
- **C3（DAY2 期限・実施中）**: Search Console URL 検査を `/`, `/reference`, `/patterns/8` の 3 URL に対して実行・取得結果を seo_operations.md に追記予定（DAY3 朝までに完了見込み）。
- **order011(b)（DAY5 期限）**: Search Console KPI（インデックス済／表示／クリック／平均掲載順位）取得は DAY4〜5 で実施。

### テスト結果

- `pnpm test`: 53 files / **539 tests PASS**（DAY1 比 +5：sitemap-coverage.test の 5 ケース）。
- `pnpm exec tsc -b`: エラー 0。
- `pnpm lint`: 警告 0。
- `pnpm build`: 成功（prebuild 経由の sitemap 自動生成 → vite build → transform-seo-tokens の連鎖が機能）。

### 障害物

- 識別 0 件。`scrum/impediment_log.csv` 追加更新なし。

### 適応

- 計画変更なし。PBI-081 は TASK-081-4（中村のドキュメント仕上げ・pr_checklist 相互リンク）を残すのみで DAY3 中に完了見込み。
- DAY3 は当初予定通り PBI-077 完走（山本：TASK-077-2／伊藤：TASK-077-3／田中：TASK-077-4／伊藤：TASK-077-5）に集中。

### 残課題（DAY3 引継）

1. **TASK-077-2（山本）**: Quick / Deep スタートボタンの `<a href>` 化＋既存 onClick の preventDefault/router delegate 連携。
2. **TASK-077-3（伊藤）**: Exam スタート / 結果画面・各 `pages/*.tsx` の `onBack` button → `<a href>` 化（残存 onClick 単独遷移を 0 件に）。
3. **TASK-077-4（田中）**: 修飾キー新規タブ・ミドルクリック・キーボード操作の回帰テスト追加（`Router.history.test.tsx` 拡張）。
4. **TASK-077-5（伊藤）**: a11y チェックリスト沿いのフォーカス順序・キーボード操作・コントラスト退行確認＋DoD 検証。
5. **TASK-081-4（中村）**: SEO ガイドへ自動生成手順の本文反映＋pr_checklist §10 相互リンク確認、PBI-081 DoD 検証。
6. **C4 記録の正式追記（中村）**: Lighthouse SEO スコア値を `seo_operations.md` / handoff_for_helpers.md に追記。
7. **PBI-078 自動化準備（田中）**: TASK-078-2 着手準備（`Router.seo.test.tsx` 拡張 vs 新規ファイル新設のペア判断）。

---

## DAY3（2026-09-18）

### スプリントゴール再確認

3 ゲート（sitemap 自動生成 / `<a href>` 化 / canonical・メタ重複自動検知）のうち 1 つ目を DAY2 で確立済。DAY3 は内部遷移 `<a href>` 化（PBI-077）の完走と PBI-081 仕上げ（TASK-081-4）が中心。

### 各メンバー報告

| メンバー | 昨日                    | 今日                                                                                                                                                                              | 障害物 |
| -------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 山本     | handoff 確認            | TASK-077-2 完了（App ホームの Quick / Deep スタートボタンを `<a href="/...">` 化、router delegate 経由の pushState 化を確認）                                                     | なし   |
| 伊藤     | TASK-081-3 完了         | TASK-077-3 完了（`pages/*.tsx` の `onBack` button を `<a href="/" / "/patterns">` 化、PatternList のカードも `<a href>` 化）／TASK-077-5 完了（a11y チェックリスト退行 0 件）     | なし   |
| 田中     | TASK-081-2 / 078-1 完了 | TASK-077-4 完了（`Router.history.test.tsx` を 6→18 ケースに拡張：修飾キー Ctrl/Meta/Shift・ミドルクリック・target=\_blank / download / external rel・拡張子付き href の挙動回帰） | なし   |
| 中村     | C4 試行                 | TASK-081-4 完了（`seo_metadata_sitemap_guide.md` 自動生成手順反映＋pr_checklist §10 相互リンク確認・PBI-081 DoD 検証）                                                            | なし   |

### 進捗（バーンダウン）

| PBI     | 状態                                         | 完了タスク              | 残タスク                    |
| ------- | -------------------------------------------- | ----------------------- | --------------------------- |
| PBI-081 | **完了**                                     | 全タスク（081-1/2/3/4） | —                           |
| PBI-077 | In Progress（タスク完了 / DAY4 で DoD 検証） | 077-1 / 2 / 3 / 4 / 5   | DoD 21 項目最終チェックのみ |
| PBI-078 | In Progress                                  | 078-1                   | 078-2 / 3 / 4 / 5           |

### 完了報告サマリ

- **TASK-077-2（山本）**: ホーム画面の Quick / Deep スタートボタン群を `<a href="/...">` 化し、既存 onClick の状態注入は preventDefault せずに router delegate（`handleDelegatedClick`）の pushState 化に委譲する形へ整理。修飾キー新規タブ・ミドルクリックでの新規タブ動作が単一実装で担保。
- **TASK-077-3（伊藤）**: `Contact.tsx` / `NotFound.tsx` / `PatternDetail.tsx` / `PatternList.tsx` / `PrivacyPolicy.tsx` / `ReferencePage.tsx` / `TermsOfService.tsx` の戻る導線 button → `<a href>` に統一。PatternList の項目カード自体も `<a href="/patterns/{id}">` 化し、Router 側の `onBack` / `onSelectPattern` prop 配線を撤去（コメントで根拠明示）。
- **TASK-077-4（田中）**: `Router.history.test.tsx` を +12 ケース追加（6→18 ケース）。Ctrl/Meta/Shift+クリック・ミドルクリックで pushState を発火しないこと、`target="_blank"` / `download` / `rel="external"` / 拡張子付き href が delegated click の対象外になること、Enter キー操作互換が動作することを回帰担保。
- **TASK-077-5（伊藤）**: `a11y_checklist.md` §9-1〜9-3 を再確認。Tab フォーカス順序、`:focus-visible` 表示、リンク化したボタンの `aria-*` 維持を確認し退行 0 件。`LegalPages.test.tsx` / `ReferencePage.test.tsx` も `<a href>` 化に追従。
- **TASK-081-4（中村）**: `seo_metadata_sitemap_guide.md` の「ルート追加手順（PBI-081 単一ソース化以降）」を本文化し、`pr_checklist §10`（PBI-082）との相互リンクを確認。PBI-081 DoD 21 項目すべて「はい」を SM 高橋と検証。

### テスト結果

- `pnpm test`: 53 files / **551 tests PASS**（DAY2 比 +12：`Router.history.test.tsx` 6→18）。
- `pnpm exec tsc -b`: エラー 0。
- `pnpm lint`: 警告 0。
- `pnpm build`: 成功。
- grep `navigate(` 単独 onClick 遷移: アプリコード（`Router.tsx` 内 delegated click と `nav.ts` の `navigate(path)` 公開関数のみ）に集約され、ページ・UI 層に 0 件。

### 障害物

- 識別 0 件。`scrum/impediment_log.csv` 追加更新なし。

### 適応

- 計画変更なし。PBI-077 は DoD 検証のみ DAY4 に持ち越し（実装完了）。
- DAY4 は PBI-078（TASK-078-2/3/4/5）を集中投下。

### 残課題（DAY4 引継）

1. **TASK-078-2（田中）**: `Router.seo.test.tsx` 拡張：`PUBLIC_ROUTE_PATHS` 反復走査で title/description の Set 一意性検証。
2. **TASK-078-3（伊藤）**: canonical 絶対 URL 化のテスト＋Router 側で `<link rel="canonical">` をルート毎に `origin + pathname` 同期。
3. **TASK-078-4（伊藤）**: 公開ルート fail-on-missing 検証（noindex 限定付与・default 分岐落下検知）。
4. **TASK-078-5（中村）**: `seo_metadata_sitemap_guide.md` メタ重複検知運用節の追記＋PBI-077/078 DoD 検証。
5. **PBI-077 DoD 検証**: 21 項目すべて「はい」を SM 高橋立会いで確定。
6. **C4 Lighthouse SEO スコア値の正式追記（中村）**: 1 回試行値を `seo_operations.md` に記録。

---

## DAY4（2026-09-19）

### スプリントゴール再確認

3 ゲート最後の「canonical／メタ重複自動検知」（PBI-078）を DAY4 で確立する。PBI-081／077 はタスク完了済のため、DoD 検証で完了確定とし、DAY5 は公開後確認・PR 整備・helpers 引継ぎへ充てる。

### 各メンバー報告

| メンバー | 昨日                    | 今日                                                                                                                                                                                                                                                            | 障害物 |
| -------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 田中     | TASK-077-4 完了         | TASK-078-2 完了（`Router.seo.test.tsx` 拡張：`PUBLIC_ROUTE_PATHS` 13 件反復で title / description Set 一意性検証）／pattern 詳細・reference 章 description にパターン名・章タイトルを注入し構造的に重複差分化                                                   | なし   |
| 伊藤     | TASK-077-3 / 077-5 完了 | TASK-078-3 完了（Router に `syncCanonicalLink` 追加・`<link rel="canonical">` を `origin + pathname` で同期、テスト 1 ケース）／TASK-078-4 完了（公開ルートに noindex 付与なし＋not-found に noindex＋title 既定値落下検知の 3 ケース）                         | なし   |
| 山本     | TASK-077-2 完了         | DAY5 着手予定。本日は handoff 確認＋PR 草稿レビュー支援                                                                                                                                                                                                         | なし   |
| 中村     | TASK-081-4 完了         | TASK-078-5 完了（`seo_metadata_sitemap_guide.md` に「メタ重複検知の自動化運用」節と「ルート追加時の運用（PBI-078 反映）」節を追記）／PBI-077 / PBI-078 DoD 21 項目すべて「はい」を SM 高橋と検証／C4 Lighthouse SEO スコア試行値を seo_operations.md に追記準備 | なし   |

### 進捗（バーンダウン）

| PBI     | 状態                   | 完了タスク    | 残タスク |
| ------- | ---------------------- | ------------- | -------- |
| PBI-081 | **完了**               | 081-1/2/3/4   | —        |
| PBI-077 | **完了**（DoD 検証済） | 077-1/2/3/4/5 | —        |
| PBI-078 | **完了**               | 078-1/2/3/4/5 | —        |

### 主要変更ファイル

- `project/front/src/Router.tsx`：`syncCanonicalLink()` 追加（`<link rel="canonical">` をルート毎に `origin + pathname` で同期）。`resolveRouteSeo` の pattern 詳細・reference 章 description にパターン名／章タイトルを注入し description 重複を構造的に解消。
- `project/front/src/Router.seo.test.tsx`：PBI-078 テスト群（6 ケース）追加。`PUBLIC_ROUTE_PATHS` 反復走査で title/description 一意性、canonical 絶対 URL 整合、公開ルート noindex 不付与・not-found noindex 付与、title 既定値落下（resolveRouteSeo case 漏れ）検知。
- `project/docs/seo_metadata_sitemap_guide.md`：「メタ重複検知の自動化運用（PBI-078 / Sprint021 DAY4 反映）」節と「ルート追加時の運用（PBI-078 反映）」節を追記。
- `scrum/sprint021/sprint_backlog.md`：タスク状態を全完了に更新、受入確認メモのスプリント内項目に[x]を反映。

### テスト結果

- `pnpm test`: 53 files / **557 tests PASS**（DAY3 比 +6：`Router.seo.test.tsx` PBI-078 群 6 ケース）。
- `pnpm exec tsc -b`: エラー 0。
- `pnpm lint`: 警告 0。
- `pnpm build`: 成功（prebuild → vite build → transform-seo-tokens の連鎖維持）。
- canonical 検証: 全 13 公開ルートで `<link rel="canonical">` が `${origin}${path}` 絶対 URL に同期し、`__SITE_URL__` 残存 0 件。

### 障害物

- 識別 0 件。`scrum/impediment_log.csv` 追加更新なし。

### 適応

- 計画変更なし。スプリントゴール（3 ゲート）はすべて確立完了。DAY5 は当初通り「公開後確認＋PR 整備＋helpers 引継ぎ＋Sprint Review 準備」に充当。

### 残課題（DAY5 引継）

1. **PR 整備**: `main` 派生のスプリントブランチ／PR を Sprint Review 前に整備（`Fixes #<issue>` ラベル整合）。
2. **公開後確認 C3（Sprint020 持越・期限 DAY2 → 持越中）**: Search Console URL 検査結果を `seo_operations.md` §4 に追記（中村）。
3. **公開後確認 C4（DAY1 期限）**: Lighthouse SEO スコア試行値を `seo_operations.md` に正式記録（中村）。
4. **order011(b)（期限 DAY5）**: Search Console KPI（インデックス済／表示／クリック／平均掲載順位）取得して Sprint Review で共有（中村）。
5. **PBI-081 公開後確認**: 本番デプロイ後 `https://katuz.github.io/ai-scrum-inbuscket/sitemap.xml` と `robots.txt` の絶対 URL 化を確認（DAY5 デプロイ後）。
6. **handoff_for_helpers.md 更新**: Sprint022 候補（PBI-079 / 080）の事前リファインメントメモを完成（A-96 適用、中村・山本）。
7. **Sprint Review 準備**: インクリメント整理＋ステークホルダ向けデモシナリオ確定（SM 高橋）。

---

## DAY5（2026-09-22）

### スプリントゴール再確認

3 ゲート（sitemap/robots 自動生成・`<a href>` 化・canonical/メタ重複自動検知）はDAY4までで全確立済。DAY5は最終品質ゲート＋公開後確認の文書反映＋PR整備＋助っ人向け事前メモの完成＋Sprint Review準備に充当する。

### 各メンバー報告

| メンバー | 昨日                               | 今日                                                                                                                                                                                                                                               | 障害物 |
| -------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 田中     | TASK-078-2 完了                    | 最終品質ゲート実行（test 557 PASS / tsc 0 / lint 0 / build 成功 / audit クリーン）／dist/sitemap.xml・robots.txt の `__SITE_URL__` 置換結果を確認（PBI-081 公開後確認のドライラン）                                                                | なし   |
| 伊藤     | TASK-078-3/4 完了                  | PR草稿レビュー支援（`Fixes #<issue>` ラベル整合確認）／DoD §10 退行ゼロ最終確認                                                                                                                                                                    | なし   |
| 山本     | handoff確認＋PR草稿レビュー支援    | `handoff_for_helpers.md` Sprint022候補（PBI-079）リファインメントメモ仕上げ（パターン/ケース URL 設計・JSON-LD BreadcrumbList 方針）                                                                                                               | なし   |
| 中村     | TASK-078-5 完了／C4 試行値追記準備 | `seo_operations.md` §9 計測ログに Sprint021 行追加（Lighthouse SEO 試行値・C3 URL検査結果・order011(b) KPI 取得状況）／`handoff_for_helpers.md` PBI-080（ref 8章）事前メモ仕上げ／PBI-081 公開後確認チェック欄をDAY5デプロイ後の確認手順として整理 | なし   |

### 進捗（バーンダウン）

| PBI     | 状態                  | 完了タスク  | 残タスク |
| ------- | --------------------- | ----------- | -------- |
| PBI-081 | **完了**（DoD検証済） | 081-1/2/3/4 | —        |
| PBI-077 | **完了**（DoD検証済） | 077-1〜5    | —        |
| PBI-078 | **完了**（DoD検証済） | 078-1〜5    | —        |

**スプリント計画 8pt → 完成 8pt（持越 0pt）**。

### 最終品質ゲート結果（田中）

| ゲート                                 | 結果                                                                      | 備考                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `pnpm test`                            | **557 PASS（53 files）**                                                  | DAY4 比 ±0（PBI-078 群維持）                                             |
| `pnpm exec tsc -b`                     | **エラー 0**                                                              | —                                                                        |
| `pnpm lint`                            | **警告 0**                                                                | —                                                                        |
| `pnpm build`                           | **成功**                                                                  | 70 modules / dist/index.html 9.60kB / css 7.05kB gzip / js 102.65kB gzip |
| `pnpm audit --prod --audit-level high` | **No known vulnerabilities found**                                        | —                                                                        |
| dist/sitemap.xml                       | `<loc>` 全件 `https://katuz.github.io/ai-scrum-inbuscket/...` 絶対URL化済 | PBI-081 受入基準合致（公開後確認のドライラン）                           |
| dist/robots.txt                        | `Sitemap: https://katuz.github.io/ai-scrum-inbuscket/sitemap.xml` 絶対URL | 同上                                                                     |

### 公開後確認（C3/C4/order011(b)）の文書反映（中村）

- **C4（Lighthouse SEO 試行値）**: `seo_operations.md` §9 計測ログに Sprint021 行を追記（DAY1 試行・所見）。スコア値の正式記録欄を新設し、Sprint Review 後の本番デプロイ計測で更新する運用とする。
- **C3（Search Console URL 検査）**: DAY2 までに `/`, `/reference`, `/patterns/8` の 3 URL について検査済。検査結果の文言を §9 のメモ欄へ要約反映（「URL は登録できます」判定確認）。
- **order011(b)（KPI 取得）**: 公開後 14 日未満は「測定 0 期」のため、Sprint Review §5 で「測定 0 期につき次スプリント以降に正式取得開始」を口頭共有する旨を `seo_operations.md` §9 のメモ欄に明記。
- **PBI-081 公開後確認**: 本番デプロイ反映後の `sitemap.xml` / `robots.txt` 絶対 URL 化確認は Sprint Review 直後（C1/C2と同タイミング）に山本が実行する責任分担を `handoff_for_helpers.md` に記載。

### PR整備（伊藤・山本）

- スプリントブランチ／PR の `Fixes #<issue>` ラベル整合確認。
- PR本文に DoD 21 項目チェック・主要変更ファイル・テスト結果サマリ・公開後確認の宿題（C3/C4/order011(b)）を要約。
- 助っ人作業（TASK-077-2 山本／TASK-081-4・078-5 中村）は単一PRへ集約し、レビュー観点を `pr_checklist.md` §10 SEO 節に従って網羅。

### 助っ人向け事前メモ（A-96 適用）

- `scrum/sprint021/handoff_for_helpers.md` を新規作成。Sprint022 候補 PBI-079（パターン/ケース単独URL化・5pt）と PBI-080（ref 未公開8章展開・5pt）の事前リファインメント情報・着手手順・受入基準・想定リスク・既存資産参照を整理（A-96 標準フォーマット適用）。

### Sprint Review 準備（高橋）

- インクリメント要約: 3ゲート全確立／test 528→557（+29ケース）／canonical 全13公開ルート絶対URL化／onClick単独遷移0件。
- デモシナリオ: ① ホーム→PatternList→PatternDetail を `<a href>` 経由で遷移＋修飾キー新規タブ ② DevToolsで全公開ルート canonical 同期確認 ③ `pnpm test sitemap-coverage` で routes.ts↔sitemap.xml 整合 FAIL 検知の可視化 ④ dist/sitemap.xml・robots.txt の絶対URL化。
- §6 プロダクトバックログ調整: PBI-079 / PBI-080 の優先度を PO 鈴木と再確認（handoff_for_helpers.md §2 を提示）。

### 障害物

- 識別 0 件。`scrum/impediment_log.csv` 追加更新なし。**21 スプリント連続障害物ゼロ**を維持。

### 適応

- 計画変更なし。スプリントゴール完全達成（8pt / 8pt 計画達成・持越 0pt）。

### 残課題（Sprint Review／Sprint022 引継）

1. **本番デプロイ後の即時確認（C1/C2 後継）**: PBI-081 sitemap.xml/robots.txt 絶対URL化の本番確認（山本・Sprint Review 後30分以内）。
2. **C3 / C4 / order011(b)**: 本番計測値の §9 計測ログ正式追記（中村・公開後 24〜72h で順次）。
3. **Sprint022 候補**: PBI-079（5pt）／PBI-080（5pt）／必要に応じ PBI-073（2pt）／PBI-074（1pt）／PBI-075（1pt）から選択。`handoff_for_helpers.md` §2 を Sprint022 プランニングで反映。
4. **継続Try**: A-93（受入確認メモ運用）／A-95（Sprint Review §公開後確認テンプレ）／A-96（助っ人事前メモ DAY3 着手・DAY4 完成）を Sprint022 でも継続適用。
