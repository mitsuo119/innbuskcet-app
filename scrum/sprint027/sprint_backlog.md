# スプリントバックログ - Sprint027

## スプリント情報

- **スプリント**: Sprint027
- **期間**: 2026-05-30 〜 2026-06-05（5日間）
- **計画SP**: **5pt**（PBI-102 1pt + PBI-103 1pt + PBI-104 2pt + PBI-105 1pt）
- **ストレッチ枠**: なし（PBI-094 はDay4 EOD で次SP送り出しを基本線として判定）
- **容量試算上限**: 6〜8pt → **下限寄り 5pt** で設定（A-99 第7回適用 / Day0 改善アクション集約 + PBI-104 不確実性 + 再申請判断バッファ）

## スプリントゴール

> **本番でGooglebotが各コンテンツページを正しく認識できる状態（JS実行後も404化しない）を実現し、AdSense再申請の前提を整える**

---

## 選択PBI

### 主軸: PBI-102（1pt / Critical / Ready / order017 P0最優先）

**ルータ末尾スラッシュ正規化の根治**

- `project/front/src/Router.tsx` の `parsePathname()` 冒頭で **`stripBase()` 後の path に対し root（`/` または空）以外は `/\/+$/` で末尾スラッシュ除去**する正規化を 1 箇所追加。
- 影響範囲は全ルート: `/about` / `/privacy-policy` / `/terms-of-service` / `/terms` / `/contact` / `/reference` / `/reference/:chapterId` / `/patterns` / `/patterns/:id` / `/cases/:id`。
- `pnpm build` → `pnpm preview` で末尾スラッシュ付き代表 URL がトップ以外も NotFound に化けず hydration 後に正しいページが描画されることを目視確認しエビデンス（スクショ or ログ）を残す。
- **IMP-002 は本SPで Resolved 化判断**（本番カスタムドメインで公開済のため）。本PBIは別問題（クライアントルータ正規化）の根治。
- DoD 22項目「はい」（§4-3 アウトカム検証項目を PBI-105 で追加後に適用）。

### 主軸: PBI-103（1pt / High / Ready / order017 P0再発防止）

**末尾スラッシュURLのルータ回帰テスト追加**

- Router 系 vitest を拡張し、代表 URL（`/about`・`/about/`・`/reference/chapter01`・`/reference/chapter01/`・`/cases/case-001`・`/cases/case-001/`・`/patterns/1`・`/patterns/1/`）がそれぞれ同一ページコンポーネントに解決することを検証。
- ルート `/` は末尾スラッシュ正規化の対象外であることもテスト。
- **PBI-102 完了が前提**。
- vitest 全件 PASS / DoD 22項目「はい」。

### 主軸: PBI-104（2pt / High / Ready / order017 P0 + A-120/A-121具体化）

**本番同等での実機アウトカム検証スクリプト化**

- `front/scripts/check-prerender-outcome.mjs`（仮）を新設し、Playwright 等のヘッドレスブラウザで主要 59 ルートを **末尾スラッシュ付き** で訪問し、hydration 後に：
  - NotFound コンポーネントが表示されていないこと
  - 本文 `h1` または主要見出しが描画されていること
  - を機械チェック。
- 対象: `/about/` / `/privacy-policy/` / `/terms/` / `/terms-of-service/` / `/contact/` / `/reference/` / `/reference/chapterNN/`（12件）/ `/cases/` / `/cases/:id/`（代表 3 件以上）/ `/patterns/` / `/patterns/:id/`（代表 3 件以上）。
- dist プレビュー or 本番URL の両モードに対応。pnpm script 経由実行（`pnpm run check:outcome -- --target=preview|prod`）。
- 結果を `project/docs/outcome_verification_report.md` に保存。
- Sprint026 retro A-121「CI検測スクリプト」と A-120「DoD §4-3 アウトカム検証」の **具体化実装** として位置付け。CI への組込みは本SP内では任意（Sprint028 以降の継続課題）。
- **PBI-102 完了が前提**。
- 依存追加（Playwright 等）は `audit High-Critical 0` 維持。渡辺セキュリティレビュー要。
- DoD 22項目「はい」。

### 主軸: PBI-105（1pt / High / Ready / A-120 Day0）

**DoD §4-3 アウトカム検証項目追記**

- `scrum/definition_of_done.md` の §4「動作確認」に **4-3** を新設：
  > 「プリレンダ/SSG対象ページは `view-source:` に隠蔽属性（`hidden` / `aria-hidden` 等）なしで本文が出力され、本文下限（現行 600字）を満たし、**JS実行後も主要ルートが404化しない**」
- 判定根拠として PBI-104 の検証スクリプト結果または dist 静的解析を参照する旨を併記。
- `definition_of_done_history.md` に変更履歴追記。
- **Sprint027 Day0 で全員合意のうえ反映**（渡辺書面合意必須）。
- DoD 21項目 → 22項目に拡張。Sprint027 内の他PBI（102/103/104）は新DoD 22項目で判定。

---

## タスクリスト

### Day0（2026-05-30 / SM・PO 中心 / Planning直後）

| ID        | 内容                                                                                                                                                                           | 担当             | 見積  | 状態                             | A     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ----- | -------------------------------- | ----- |
| TASK-D0-1 | **A-118**: A-111 段階展開戦略を `scrum/scrum_team_culture.md` へ卒業反映（Sprint025 PBI-087 4段階 + Sprint026 PBI-098 3段階で2連続成功）                                       | 高橋             | 30min | ✅完了                           | A-118 |
| TASK-D0-2 | **A-120 / PBI-105**: `scrum/definition_of_done.md` §4-3 追記 + `definition_of_done_history.md` 追記 + 渡辺書面合意                                                             | 高橋・伊藤・渡辺 | 1h    | ✅完了                           | A-120 |
| TASK-D0-3 | **A-122**: リファインメント Ready 判定テンプレに「プリレンダ/SSG/クローラー出力関与PBIはアウトカム検証手段（計測スクリプト・閾値）が定義されているか」を追加                   | 鈴木・高橋       | 30min | 持ち越し（次リファインメント時） | A-122 |
| TASK-D0-4 | **IMP-002 Resolved化判断**: 本番 `inbasket-app.com` カスタムドメインで公開済を確認の上 `impediment_log.csv` から `impediment_log_resolved.csv` へ移送（resolution に経緯記録） | 高橋             | 30min | ✅完了                           | A-117 |
| TASK-D0-5 | **A-119 優先度見直し**: 本番公開済を前提に「別ホスティング移管 ADR-003」起票は**保留（凍結）**と判断・本ファイルに記録                                                         | 高橋・鈴木       | 30min | ✅完了                           | A-119 |

### Day1（2026-05-31 / PBI-102 根治・最優先 + PBI-103 並走）

| ID         | 内容                                                                                                                                                                             | 担当 | 見積 | 状態                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------------------------------------------------------------ |
| TASK-102-1 | PBI-102: `parsePathname()` 冒頭で末尾スラッシュ正規化を実装（`stripBase` 後の `path` に対し `path !== '/' && path !== ''` の場合 `path = path.replace(/\/+$/, '') \|\| '/'`）    | 伊藤 | 2h   | ✅完了                                                       |
| TASK-102-2 | PBI-102: `pnpm build` → `pnpm preview` で末尾スラッシュ付き代表URL（/about/・/privacy-policy/・/reference/chapter01/・/cases/case-001/・/patterns/1/）を目視確認＋エビデンス保存 | 伊藤 | 1h   | ✅完了（11 URL 機械HTTP検証 PASS / daily_scrum.md 記録）     |
| TASK-103-1 | PBI-103: Router 系 vitest 拡張（代表 8 URL × スラッシュ有無の同一ページ解決 + root `/` は正規化対象外 + `not-found` ルートが末尾スラッシュ正規化後も既存通り 404 維持）          | 田中 | 3h   | ✅完了（`Router.trailingSlash.test.tsx` 25 ケース・全 PASS） |

### Day2（2026-06-01 / PBI-102/103 クローズ + PBI-104 着手）

| ID         | 内容                                                                                                                                                                                                   | 担当       | 見積 | 状態                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---- | ------------------------------------------------------------------------------------------------------ |
| TASK-102-3 | PBI-102 DoD 22項目チェック + PR提出（hydration mismatch 0件・末尾スラッシュ付き代表URL目視PASS）                                                                                                       | 伊藤       | 1h   | ✅完了（22/22「はい」/ `product_backlog.csv` Done 化済 / Review 最終承認待ち）                         |
| TASK-103-2 | PBI-103 vitest 全件 PASS + DoD 22項目チェック + PR提出                                                                                                                                                 | 田中       | 1h   | ✅完了（22/22「はい」/ `product_backlog.csv` Done 化済 / Review 最終承認待ち）                         |
| TASK-104-1 | PBI-104: `front/scripts/check-routes-outcome.mjs` 新設 + ヘッドレスブラウザ（Playwright 等）devDep 追加（audit Hi/Cr 0 維持） + preview 全 43 ルート PASS（レポート `outcome_verification_report.md`） | 田中・山本 | 4h   | ✅完了（`playwright@1.60.0` devDep + Chromium 1223 / `check:outcome` script / preview PASS 43/FAIL 0） |

### Day3（2026-06-02 / PBI-104 完遂）

| ID         | 内容                                                                                                                                                                                                                                                          | 担当             | 見積  | 状態   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----- | ------ |
| TASK-104-2 | PBI-104: `--target=prod` 実機検証（`https://inbasket-app.com` 全 43 ルート）→ **PASS=1 / FAIL=42**。原因は本番ホスティングが旧ビルド（PBI-098/102 未反映）であること。Day4 で本番反映後に再計測予定の既知事項として `outcome_verification_report.md` に明記。 | 山本・田中       | 4h    | ✅完了 |
| TASK-104-3 | PBI-104: pnpm スクリプト（`check:outcome -- --target=preview\|prod`）動作確認 + `outcome_verification_report.md` を preview/prod 両セクション併記＋既知事項節へ整備                                                                                           | 山本             | 1h    | ✅完了 |
| TASK-104-4 | PBI-104 DoD 22 項目チェック完了（§4-3 は preview PASS 43/0 + スクリプト動作確認で根拠提示）+ 渡辺セキュリティレビュー（依存追加妥当性 + XSS/SSRF 導線なし）合意 → `product_backlog.csv` Done 化                                                               | 田中・渡辺・高橋 | 1h    | ✅完了 |
| TASK-105-A | PBI-105 最終クローズ確認（DoD §4-3 + history + 渡辺合意 全て Day0 完了済を再点検）→ `product_backlog.csv` Done 化                                                                                                                                             | 伊藤・高橋       | 30min | ✅完了 |
| TASK-D4-2A | `adsense_resubmission_checklist.md` §4-7「`check:outcome` でトップ以外も 404 化しないこと」追記（Day4 タスクを前倒し実施）                                                                                                                                    | 鈴木・伊藤・高橋 | 30min | ✅完了 |

### Day4（2026-06-04 / 本番デプロイ後の実機検証 + PBI-094 着手判断）

| ID        | 内容                                                                                                                                                                                   | 担当       | 見積  | 状態                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----- | ----------------------------------------------------------- |
| TASK-D4-1 | 本番 `inbasket-app.com` デプロイ後に `pnpm run check:outcome -- --target=prod` を実行 → 全主要ルート PASS 確認 + `outcome_verification_report.md` に本番計測行追記                     | 中村       | 2h    | 持越し（本番デプロイ完了待ち / Day5 or Sprint028 着手日）   |
| TASK-D4-2 | `project/docs/adsense_resubmission_checklist.md` に「本番JS実行後にトップ以外の代表ページが404化していないこと」項目追加 + 本SP実機検証結果（リンク or 抜粋）反映                      | 鈴木・伊藤 | 1h    | ✅完了（DAY3 で §4-7 追記済 / Day4 で再申請可否方針も追記） |
| TASK-D4-3 | PBI-094（再申請）着手可否を Day4 EOD 判定（基本線: Sprint028 投入。当SPで投入する場合は 1pt 追加で計6pt着地・直近実績 8pt 内）。鈴木・高橋・佐藤で合意                                 | 鈴木・高橋 | 30min | ✅完了（Sprint028 投入確定 / 理由: 本番未反映）             |
| TASK-D4-4 | **PBI-104 スクリプト改善**: `check-routes-outcome.mjs` の `<h1>` 判定を `[data-prerender]` 配下（無ければ `<main>` 内）に限定し、`<noscript>` フォールバック h1 を誤検知しないよう修正 | 山本       | 1h    | ✅完了                                                      |
| TASK-D4-5 | 改善後 preview 再検証 `pnpm run check:outcome -- --target=preview` → **PASS=43 / FAIL=0** 維持 + サーバ h1 列に実プリレンダ h1 を正しく表示                                            | 山本・田中 | 30min | ✅完了                                                      |
| TASK-D4-6 | 改善後 prod 暫定計測（本番未反映時点・参考値）: サーバ h1 列が noscript ではなく実プリレンダ領域内 h1（=「ページが見つかりません」）を抽出することを確認                               | 中村       | 30min | ✅完了                                                      |
| TASK-D4-7 | `outcome_verification_report.md` 整備（サマリ表 DAY4 行追加 + 改善履歴節新設 + 既知事項節更新）                                                                                        | 山本・田中 | 30min | ✅完了                                                      |
| TASK-D4-8 | 全 PBI クローズ最終確認: `product_backlog.csv` 上 PBI-102/103/104/105 が `status=Done, sprint=sprint027` で整合していること再点検                                                      | 高橋       | 30min | ✅完了                                                      |

### Day5（2026-06-05 / 最終品質ゲート + Sprint Review 準備）

| ID        | 内容                                                                                                                    | 担当                   | 見積 | 状態                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---- | ----------------------------------------------------------------------------------- |
| TASK-D5-1 | 最終品質ゲート: tsc 0 / lint 0 / vitest 全 PASS / build 成功 / audit High-Critical 0 / `pnpm run check:outcome` 全 PASS | 山本                   | 1h   | ✅完了                                                                              |
| TASK-D5-2 | `product_backlog.csv` 完了PBI状態更新 / `product_backlog_done.csv` 移送 / `velocity.csv` 追記 / handoff 還流欄記入      | 高橋・田中             | 1h   | ✅完了                                                                              |
| TASK-D5-3 | Sprint Review 準備（本番URLでの代表ルート目視デモ＋ `outcome_verification_report.md` 提示）                             | 伊藤・田中・山本・高橋 | 1h   | ✅完了（preview 代用デモ + outcome レポート 両提示準備完了 / 本番デモは本番反映後） |

---

## 受入確認メモ

> Sprint Review 前にチームで埋める。

### PBI-102 受入確認

- [ ] `parsePathname()` 冒頭で末尾スラッシュ正規化（root 除外）が 1 箇所追加されている
- [ ] 末尾スラッシュ付き代表URL（/about/・/privacy-policy/・/reference/chapter01/・/cases/case-001/・/patterns/1/）が hydration 後も正しいページに解決（preview 目視 + エビデンス）
- [ ] root `/` の解決は退行ゼロ
- [ ] DoD 22項目「はい」

### PBI-103 受入確認

- [ ] 代表 8 URL × スラッシュ有無 = 16 件の vitest が全 PASS
- [ ] root `/` の正規化対象外テスト PASS
- [ ] `not-found` ルート（`/unknown/` 等）が末尾スラッシュ正規化後も既存通り 404 解決
- [ ] DoD 22項目「はい」

### PBI-104 受入確認

- [ ] `front/scripts/check-prerender-outcome.mjs` 新設・pnpm script 化（`check:outcome`）
- [ ] dist プレビュー / 本番URL 両モード対応
- [ ] 主要ルート（59 ルートのうち末尾スラッシュ運用対象）末尾スラッシュ付き訪問 → NotFound 非検出 / h1 描画 全件 PASS
- [ ] `project/docs/outcome_verification_report.md` 出力
- [ ] 渡辺セキュリティレビュー済（依存追加・XSS導線なし）
- [ ] DoD 22項目「はい」

### PBI-105 受入確認

- [ ] `scrum/definition_of_done.md` §4-3 追記済（21→22項目）
- [ ] `definition_of_done_history.md` 変更履歴追記済
- [ ] 渡辺書面合意済
- [ ] Sprint027 内の PBI-102/103/104 を 22 項目で判定済

### 公開後確認（Day4 / 中村実施）

- [ ] 本番 `inbasket-app.com` 代表ルート末尾スラッシュ付きで `pnpm run check:outcome -- --target=prod` PASS
- [ ] `adsense_resubmission_checklist.md` に項目追加＋本SP結果反映

---

## 更新履歴

| 日付       | 更新内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 更新者     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 2026-05-30 | 初版作成（計画 5pt = PBI-102 1pt + PBI-103 1pt + PBI-104 2pt + PBI-105 1pt / ストレッチ枠なし / Day0 で A-118/A-120(PBI-105)/A-122/IMP-002 Resolved化/A-119凍結 を一括処理 / Day1〜3 で PBI-102→103/104 を直列遂行 / Day4 本番実機検証 + PBI-094判断 / Day5 最終品質ゲート＋Review準備）                                                                                                                                                                                                                                                                                                                                                                                                                               | 高橋（SM） |
| 2026-05-31 | Day0 タスク状態更新（TASK-D0-1/2/4/5 ✅完了、TASK-D0-3 A-122 は次リファインメントへ持ち越し） / DAY1 タスク状態更新（TASK-102-1/2 ✅ 伊藤、TASK-103-1 ✅ 田中） / 品質ゲート PASS: test 1147 / tsc 0 / lint 0 / build 59ルート / 末尾スラッシュ実機 11 URL HTTP 200 + プリレンダ HTML 返却 / 障害物 Open 0（IMP-002 終結）                                                                                                                                                                                                                                                                                                                                                                                             | 高橋（SM） |
| 2026-06-02 | DAY3 タスク状態更新（TASK-104-2/3/4 ✅完了・PBI-104 DoD 22/22 + 渡辺セキュリティレビュー合意 / TASK-105-A ✅完了・PBI-105 Done 化 / TASK-D4-2A ✅完了（Day4 前倒し・`adsense_resubmission_checklist.md` §4-7 追記）/ prod 実機検証 PASS=1/FAIL=42 は本番未デプロイ既知事項 / 品質ゲート test 1147 / tsc 0 / lint 0 / build 59 ルート / 障害物 Open 0 / Sprint027 計画 5pt 全 PBI クローズ判定完了）                                                                                                                                                                                                                                                                                                                    | 高橋（SM） |
| 2026-06-04 | DAY4 タスク状態更新（TASK-D4-4 `check-routes-outcome.mjs` の h1 抽出を `[data-prerender]` 配下に限定する改善実施 / TASK-D4-5 改善後 preview 再 PASS 43/0 / TASK-D4-6 改善後 prod 暫定計測 PASS 1/FAIL 42 不変・サーバ h1 列が実プリレンダ領域内 h1 を正しく抽出 / TASK-D4-7 `outcome_verification_report.md` 整備 / TASK-D4-8 PBI-102/103/104/105 が `product_backlog.csv` 上 Done で整合済 / TASK-D4-2 ✅（DAY3 で前倒し + Day4 で再申請可否方針追記） / TASK-D4-3 ✅ PBI-094 は Sprint028 投入確定 / TASK-D4-1 のみ本番反映待ちで持越し / 品質ゲート test 1147 / tsc 0 / lint 0 / build 59 / check:outcome preview 43/0 全 PASS / 障害物 Open 0）                                                                    | 高橋（SM） |
| 2026-06-05 | DAY5 タスク状態更新（TASK-D5-1/2/3 すべて ✅完了）。最終品質ゲート再走査済み: vitest **60 files / 1147 passed** / tsc 0 / lint 0 / build 59 ルートプリレンダ完走 / audit High-Critical 0（moderate 2 のみ / Sprint026 からの継続） / `pnpm run check:outcome -- --target=preview` **PASS=43 / FAIL=0**。`product_backlog.csv` から PBI-102/103/104/105 を4 行 `product_backlog_done.csv` へ移送完了（UTF-8 BOM 維持）。`velocity.csv` に sprint027 追記（planned 5 / completed 5 / carried 0 / 27 スプリント連続 PBI 完遂）。handoff 還流欄 5.1〜5.4 + §6 次SP引継ぎ記入。障害物 Open 0 維持。残課題は本番デプロイ完了後の prod `check:outcome` PASS 確認（→ PBI-094 再申請直前ゲートとして Sprint028 着手日に実施）。 | 高橋（SM） |
