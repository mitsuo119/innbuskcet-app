# 助っ人向け事前メモ - Sprint027（ルータ末尾スラッシュ根治＋本番アウトカム検証）

> Sprint027 Day0（2026-05-30）で本ファイル新設。
> 担当: 高橋（SM）・伊藤（開発者）
> 山本・中村はスプリントプランニング不参加（契約）ですが、本スプリントゴール **「本番でGooglebotが各コンテンツページを正しく認識できる状態（JS実行後も404化しない）を実現し、AdSense再申請の前提を整える」** の達成に向けてフル稼働します。

---

## 1. IMP-002 ステータス変更（重要）

- Sprint026 まで 4 スプリント連続 Open だった **IMP-002（GitHub Pages 本番 URL 404）** は、本番が `https://inbasket-app.com/` カスタムドメインで公開済となった事実をもって **Sprint027 Day0 で Resolved 化**。
- `impediment_log.csv` → `impediment_log_resolved.csv` 移送済（高橋実施・TASK-D0-4）。
- A-114 3点セット / A-110 オーナー権限再依頼経路は本SP内では発動不要。
- **A-119（別ホスティング移管 ADR-003）は本番公開済を前提に保留（凍結）判断**（TASK-D0-5）。

> ※本SP発生の本番 404 化（JS実行後トップ以外 NotFound）は**ホスティング起因ではなく**クライアントルータ `parsePathname()` の末尾スラッシュ非対応バグ。IMP-002 とは別問題で、本SP の PBI-102 で根治する。

---

## 2. PBI別 前提スナップショット（A-106 卒業反映後の通常運用）

| PBI         | 前提スナップショット                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PBI-102** | 修正対象は `project/front/src/Router.tsx#parsePathname()` 1 箇所。`stripBase()` 後の `path` に対し冒頭で `path !== '/' && path !== ''` の場合 `path = path.replace(/\/+$/, '') \|\| '/'` を実行する正規化を追加（root は除外）。SPA 内部リンクは末尾スラッシュなしで生成されているため、影響は本番（GitHub Pages カスタムドメインが付与する末尾スラッシュ）+ 直接URL入力 + 外部リンクのみ。**PBI-103/104 の前提（必須先行）**。                                                                   |
| **PBI-103** | 既存 Router 系 vitest を拡張。代表 URL（/about・/about/・/reference/chapter01・/reference/chapter01/・/cases/case-001・/cases/case-001/・/patterns/1・/patterns/1/）の各ペアが同一ページコンポーネントに解決することを `expect` で検証。root `/` は正規化対象外（既存挙動維持）。`not-found` ルート（/unknown/）も既存通り 404 解決を維持。                                                                                                                                                       |
| **PBI-104** | `front/scripts/check-prerender-outcome.mjs`（仮）新規。Playwright 等の devDep 追加（`audit High-Critical 0` 維持必須）。dist プレビューサーバ（`pnpm preview`）or 本番URL（`https://inbasket-app.com`）の両モードに対応。主要ルートは routes.ts の PUBLIC_ROUTES（59 ルート）を起点に末尾スラッシュ付きで訪問し hydration 後の NotFound 非検出 + h1 描画 を機械チェック。出力は `project/docs/outcome_verification_report.md`（routeごとに PASS/FAIL ＋ 検出 h1 テキスト or NotFound テキスト）。 |
| **PBI-105** | Day0 完結。`scrum/definition_of_done.md` §4-3 追記 + `definition_of_done_history.md` 履歴追記 + 渡辺書面合意。新 DoD 22 項目は本SP内の PBI-102/103/104 で初適用。                                                                                                                                                                                                                                                                                                                                 |

### A-106 通常運用フィードバック欄（Sprint末）

- **山本**: PBI-104 の前提スナップショット（既存スクリプト棚卸し + dist 直読 vs HTTP+JS 実行後 DOM の役割分離）が事前に明文化されていたため、Day2 着手即日で `check-routes-outcome.mjs` の方針確定→実装着手まで到達できた。文化定着後も継続機能している。
- **中村**: prod 計測リスク（外部レート制限・User-Agent ポリシー）の事前洗い出しを Day2 で共有できたことで Day3 の prod 実行が無事故。前提スナップショット運用は継続有用。
- **伊藤**: PBI-102 の修正対象が「`parsePathname()` 1 箇所・root 除外」と明示されていたため、副作用調査の所要を 30 分以内に圧縮できた。

---

## 3. 本番アウトカム検証 ハンドオフ（Day3〜Day4）

| #    | 責任者    | 更新先ファイル                                    | 期限     | 完了条件                                                                                                               |
| ---- | --------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| D3-a | 田中+山本 | `front/scripts/check-prerender-outcome.mjs`       | Day3 EOD | dist プレビューモードで 59 ルート末尾スラッシュ付き全 PASS（NotFound 非検出 / h1 描画）                                |
| D3-b | 山本      | `project/docs/outcome_verification_report.md`     | Day3 EOD | preview モード結果を初回保存（route, status, h1 抜粋）                                                                 |
| D4-a | 中村      | `project/docs/outcome_verification_report.md`     | Day4 EOD | 本番 `inbasket-app.com` デプロイ後 `pnpm run check:outcome -- --target=prod` PASS 結果を「Sprint027 本番計測」行で追記 |
| D4-b | 中村      | `scrum/sprint027/sprint_backlog.md §受入確認メモ` | Day4 EOD | 本番実機検証 PASS を ✅ で確定 + エビデンスリンク                                                                      |
| D4-c | 鈴木+伊藤 | `project/docs/adsense_resubmission_checklist.md`  | Day4 EOD | 「本番JS実行後にトップ以外の代表ページが404化していないこと」項目追加 + 本SP結果反映                                   |

### 結果反映欄（Day3 EOD / Day4 EOD / Day5 EOD）

- **Day3 EOD（田中・山本）**: preview PASS=43 / FAIL=0、prod PASS=1 / FAIL=42（本番未デプロイ既知事項。サーバ h1 全件「JavaScript を有効にしてください」=旧ビルド配信）。
- **Day4 EOD（中村・山本）**: スクリプトの h1 抽出を `[data-prerender]` 配下に限定する改善実施。改善後 preview PASS=43 / FAIL=0 維持、改善後 prod 暫定計測も PASS=1 / FAIL=42 不変（サーバ h1 列は「ページが見つかりません」=旧ビルドの NotFound プリレンダを正しく抽出）。
- **Day5 EOD（高橋）**: 最終 preview 再計測 PASS=43 / FAIL=0 維持を確認。prod 再計測は **本番デプロイ未完了** のため Sprint028 着手日に持ち越し（PBI-094 再申請直前ゲート）。

---

## 4. 不明点起票枠（助っ人 → SM）

> Day1 朝までに山本・中村が起票。SM 高橋が当日中に回答。

- _（起票なし）_

---

## 5. レビュー要点還流欄（スプリント末 / 構造化還流欄）

> Sprint027 Day5（2026-06-05）に伊藤・田中・山本記入。

### 5.1 技術的な学び（実装）

- **伊藤**: `parsePathname()` の `stripBase()` 後パスに対する 1 行正規化（`path = path.replace(/\/+$/, '') || '/'` を root 除外条件で実施）で全 43 ルートが救済できた。SPA 内部リンクは末尾スラッシュなしで生成しているため、影響は外部リンク + 直接 URL 入力 + GitHub Pages 由来の末尾スラッシュのみで限定的。1 行修正 + 25 ケース回帰テストで Critical を根治できる典型例として再利用可能。
- **田中**: `Router.trailingSlash.test.tsx` 25 ケース（代表 10 ルート × スラッシュ有無 20 + root `/` + 不存在 3 + 多重スラッシュ 1）の構成で十分なカバレッジを実現。今後ルータ系の正規化追加時にも同パターンを流用できる。
- **山本**: Playwright `page.evaluate` での JS 実行後 DOM 検査と、`fetch` ベースのサーバ HTML 静的検査（(a)(b)）の二段構えで、サーバ側プリレンダの実在と JS 実行後の NotFound 非検出を独立に検証できる構成にしたのが効いた。サーバ h1 抽出スコープを `[data-prerender]` 配下に限定する改善で `<noscript>` フォールバック h1 の誤検知も解消。

### 5.2 DoD 強化観点（§4-3 初運用フィードバック）

- §4-3「プリレンダ/SSG 対象ページは view-source に隠蔽属性なしで本文が出力され本文下限を満たし JS 実行後も主要ルートが 404 化しない」を PBI-102/103/104 に初適用。**機械計測（`check:outcome`）+ vitest（25 ケース）の二系統で根拠提示**できたため、DoD 22 項目自己点検が形式的にならず実効性ある運用となった。
- **過不足**: 「本番ホスティングへの反映確認」が §4-3 では弱い（preview PASS のみで Done 判定可能な書きぶり）。今 SP は prod FAIL=42 を「既知事項・障害物でない」と判定したが、再申請 PBI-094 のように **本番反映が直接の前提**となる PBI では §4-3 とは別に「本番 `check:outcome --target=prod` PASS」を独立した受入条件として明記する運用が望ましい（A-122 リファインメント Ready 判定と連動）。

### 5.3 プロセス改善（A-122 Ready 判定補強 初運用）

- A-122 は Day0 で「次リファインメント時に反映」として持ち越し。Sprint028 のリファインメントで PBI-094 を Ready 化する際に **「アウトカム検証手段（計測スクリプト・閾値）が定義されているか」** を初運用する想定。具体的には PBI-094 の受入条件に「本番 `check:outcome --target=prod` PASS=43/0」を必須化する形で運用開始予定。

### 5.4 技術的負債

- **playwright@1.60.0 devDep 追加に伴う Chromium ローカル 296MB**: 初回のみだが CI 影響評価は Sprint028 以降の継続課題（`outcome_verification_report.md` 既知事項節に明記済）。CI 組込時は `--with-deps` 不要・キャッシュ戦略要検討。
- **prod check:outcome の自動化未済**: 現在は手動 `pnpm run check:outcome -- --target=prod`。本番デプロイ後フックに組み込む案は Sprint028 以降のリファインメント候補。
- **`<noscript>` h1 と本文 h1 の構造的分離**: スクリプト側で `[data-prerender]` 限定にしたが、HTML 側でも `<noscript>` h1 を `aria-hidden` 等で明示する余地あり（DoD §4-3 のクローキング解釈には抵触しない範囲で）。

---

## 6. 次スプリント（Sprint028）への引継ぎ要点

> Sprint027 Day5（2026-06-05）追記。

### 6.1 物理ブロッカー（最優先・PBI-094 着手前ゲート）

1. **本番ホスティング (`inbasket-app.com`) へのデプロイ反映**: PBI-097/098/099/100（Sprint026）+ PBI-102（Sprint027）が本番未反映。GitHub Actions or 手動 push で main 反映 → デプロイ完了を待つ。
2. **本番 `check:outcome --target=prod` PASS 確認**: デプロイ完了後 `pnpm -C project/front run check:outcome -- --target=prod` を実行し **PASS=43 / FAIL=0** を確認。`outcome_verification_report.md` のサマリ表 prod 行を更新。
3. **`adsense_resubmission_checklist.md` §4-7 充足確認**: 上記 2 の PASS をもって §4-7「JS 実行後アウトカム検証でトップ以外も 404 化しないこと」を完了マーク。

### 6.2 PBI-094 再申請着手の前提（Sprint028 Day0〜Day1）

- 上記 6.1 が全て完了していることが PBI-094 投入の前提条件（Sprint027 Day4 で鈴木・高橋合意）。
- 万一 prod 計測で FAIL が残った場合は **PBI-094 投入見送り** → 残課題を Sprint028 内で別 PBI として処理 → PBI-094 は Sprint029 へ。

### 6.3 引継ぐ運用ツール

- `pnpm -C project/front run check:outcome -- --target=preview|prod`: 主要 43 ルート（末尾スラッシュ付き）に対し HTTP 200 / NotFound 非検出 / h1 描画 を機械検証。レポートは `project/docs/outcome_verification_report.md` に出力。
- `pnpm -C project/front run build`: 59 ルートプリレンダ（PBI-098 で焼き込んだ実本文 600 字以上が dist 出力に含まれる）。
- DoD §4-3（22 項目）: プリレンダ/SSG 関与 PBI で適用必須。
