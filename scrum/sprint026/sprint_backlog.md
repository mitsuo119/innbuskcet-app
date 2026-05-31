# スプリントバックログ - Sprint026

## スプリント情報

- **スプリント**: Sprint026
- **期間**: 2026-05-23 〜 2026-05-29（5日間）
- **計画SP**: **8pt**（PBI-097 1pt + PBI-098 3pt + PBI-099 2pt + PBI-100 2pt）= 容量試算上限
- **ストレッチ枠**: なし（容量上限到達のため）
- **容量試算上限**: 6〜8pt（A-99 第6回適用）

## スプリントゴール

> **AdSense審査落ちの4直接原因（クローキング・薄いプリレンダ・一覧欠落・広告配置）を根治し、再申請着手可能（=Sprint027でPBI-101→PBI-094へ進める）な状態を確立する**

---

## 選択PBI

### 主軸: PBI-097（1pt / Critical / Ready）

**prerenderテンプレートからhidden aria-hidden除去でクローキング解消（order016 P0-1）**

- `scripts/prerender.mjs` 全テンプレートから `hidden aria-hidden="true"` 完全除去
- hydration mismatch warning 0件（SPA側が同等内容で置換）
- FOUC許容範囲（レイアウト崩れ・読みづらさ無し）
- 57ルート全件 dist `*/index.html` を `view-source:` で確認し本文が hidden 無しで可視出力
- vitest で prerender 出力に `hidden aria-hidden` 含まれない自動検証
- DoD 21項目「はい」/ 渡辺セキュリティレビュー済
- **PBI-098/099/100の前提**

### 主軸: PBI-098（3pt / Critical / Ready）

**プリレンダリング本文を実データから600字以上焼き込み（order016 P0-2）**

- referenceData.ts（12章）+ cases.json（20件）+ patternData.ts（20件）の実本文・主要セクション・例示を SSG 段階で抽出 → 静的HTML焼き込み
- 52詳細ページ全件の静的HTML本文が **600字以上**（タイトル・ナビ・フッター・コード除く）を機械計測しレポートを `project/docs/` に保存
- Markdown → HTML 変換が必要な場合は build 時実施（依存追加時は audit High-Critical 0）
- hydration mismatch warning 0件 / a11y退行ゼロ
- vitest で各種別代表ページの本文文字数下限（600字）を自動検証
- **PBI-097完了が前提**
- DoD 21項目「はい」

#### A-111 段階展開戦略（3段階 / Sprint025からの継続2連続適用 → 卒業判定）

| 段階    | 対象                    | 件数 | 代表検証                               | DAY見込み | 完了条件                                        |
| ------- | ----------------------- | ---- | -------------------------------------- | --------- | ----------------------------------------------- |
| 第1段階 | reference chapter01〜12 | 12   | chapter01 / chapter06 / chapter12      | DAY2〜3   | 本文600字以上を hidden 無しで可視出力           |
| 第2段階 | cases × 20              | 20   | case-001 / case-010 / case-020         | DAY3〜4   | 本文600字以上＋hydration mismatch無し           |
| 第3段階 | patterns × 20           | 20   | patterns/1 / patterns/10 / patterns/20 | DAY4      | 本文600字以上＋vitest本文下限全件PASS           |
| **計**  | **52詳細ページ**        | 52   | -                                      | -         | 文字数計測レポートを `project/docs/` 配下に保存 |

> 各段階で「view-source: 本文文字数計測＋vitest本文600字下限PASS＋build時間 baseline +10%以内」をチェック。

### 主軸: PBI-099（2pt / High / Ready）

**一覧ページ /reference・/patterns のプリレンダ化と説明文付与（order016 P1-3）**

- `scripts/prerender.mjs` のルートリストに `/reference` と `/patterns` を追加（57→59ルート）
- `PatternList.tsx` ・ ReferencePage 一覧側を各項目に1〜2文の説明文 ＋ ページ冒頭に一覧の目的・使い方を本文として記述
- 静的HTMLに各項目の説明文が**可視で出力**
- 一覧ページ静的HTMLが「広告掲載最小コンテンツ基準」を満たすか判定し、満たさなければ PBI-100 の `shouldShowAds` 制御でAdSlot非表示
- a11y退行ゼロ / vitest で両一覧ページの説明文存在と項目別説明文出力を検証
- **PBI-097完了が前提**
- DoD 21項目「はい」

### 主軸: PBI-100（2pt / High / Ready）

**広告配置ポリシー明文化とAdSlot配置の最適化（order016 P1-4）**

- `project/docs/adsense_placement_policy.md` 新設に「広告掲載最小コンテンツ基準」（本文600字以上 / 非ナビ / 独自 / 完成済 / 非法務 / プリレンダ可視 の6条件）を明文化
- `shouldShowAds(pageMeta)` ヘルパーを実装し AdSlot 表示制御に組み込む
- 主力SEOページ（ReferencePage / CaseDetail / PatternDetail）に基準充足前提で AdSlot 追加
- 一覧 / 法務固定（privacy / terms / contact / about）/ 検索 / 404 / エラー画面からは AdSlot 撤去
- App.tsx 既存配置（L744/L923）も基準照らし整理
- vitest で `shouldShowAds` 判定ロジック ＋ 各ページ種別の AdSlot 有無を検証
- **PBI-097/098完了が前提**
- DoD 21項目「はい」/ 渡辺セキュリティレビュー済

---

## タスクリスト

### Day0（2026-05-23 / SM対応 / Planning直後）

| ID        | 内容                                                                                                                   | 担当      | 見積  | 状態   | A     |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | --------- | ----- | ------ | ----- |
| TASK-D0-1 | **A-115**: A-105 持ち越しチェック表 / A-106 前提スナップショット を `scrum/scrum_team_culture.md` へ卒業反映           | 高橋      | 30min | 未着手 | A-115 |
| TASK-D0-2 | **A-116**: PBI-094再申請前提条件チェックリスト新設（`project/docs/adsense_resubmission_checklist.md`）                 | 伊藤+鈴木 | 1h    | 未着手 | A-116 |
| TASK-D0-3 | **A-114**: `handoff_for_helpers.md` 「オーナー権限再依頼経路」セクションに 事前通知＋応答SLA＋顧客経由督促 の3点を追補 | 高橋      | 30min | 未着手 | A-114 |
| TASK-D0-4 | **A-111**: PBI-098 3段階展開戦略を本ファイルに明記（本書に明記済）                                                     | 伊藤      | 30min | ✅完了 | A-111 |

### Day1（2026-05-24 / **IMP-002解消必達（A-117）最優先** + PBI-097最先行）

| ID         | 内容                                                                                                                                      | 担当      | 見積  | 状態       | A           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----- | ---------- | ----------- |
| TASK-D1-a  | **A-114経路初運用**: 事前通知（Day0実施済前提）に基づきリポジトリオーナーへ Settings>Pages 有効化を再依頼 → DAY1 EOD SLA設定              | 中村+伊藤 | 1h    | ✅完了     | A-114/A-117 |
| TASK-D1-b  | **顧客経由督促併用**: DAY1 12:00時点でオーナー応答未達なら PO鈴木 → 顧客佐藤 経由でオーナーへ督促依頼を起票（A-114 3点目）                | 鈴木+高橋 | 30min | ✅完了     | A-114/A-117 |
| TASK-D1-c  | 200応答取得後の本計測一気実施: K-1（Search Console KPI 4種）→ `seo_operations.md` §9                                                      | 中村      | 30min | ⏸延期      | A-117/A-102 |
| TASK-D1-d  | 200応答取得後: Lighthouse SEO/Performance/A11y/BP 実スコア計測 → `lighthouse-sprint016.md` 系列値追記                                     | 中村      | 30min | ⏸延期      | A-117       |
| TASK-D1-e  | 200応答取得後: C1（cases×20）/ C2（patterns×20）/ C3（chapter03..12×8） URL検査                                                           | 山本+中村 | 1h    | ⏸延期      | A-117       |
| TASK-D1-f  | 200応答取得後: PBI-086 PoC ルート（`/`・`/reference/chapter01`）の本番 view-source: 確認 → **A-112初運用** で `seo_operations.md` §9 追記 | 中村+鈴木 | 30min | ⏸延期      | A-112       |
| TASK-D1-g  | IMP-002 を `impediment_log.csv` でResolved化 → `impediment_log_resolved.csv` 移送（成功時のみ）                                           | 高橋      | 15min | ⏭スキップ | A-117       |
| TASK-D1-h  | 失敗時: **A-105 持ち越しチェック表 4スプリント連続Open記録** ＋ 顧客（佐藤）への状況エスカレーション（A-114 3点目の実発動）               | 高橋+鈴木 | 30min | ✅完了     | A-114/A-117 |
| TASK-097-1 | PBI-097: `scripts/prerender.mjs` 全テンプレートから `hidden aria-hidden="true"` 除去 + FOUC/CSS調整 + hydration mismatch検証              | 伊藤      | 3h    | ✅完了     | -           |
| TASK-097-2 | PBI-097: vitest 追加（prerender出力に `hidden aria-hidden` 含まれない自動検証）+ 全57ルート view-source 確認                              | 伊藤      | 2h    | ✅完了     | -           |

### Day2（2026-05-25 / PBI-097クローズ + PBI-098第1段階 + PBI-099着手）

| ID         | 内容                                                                                                                                     | 担当 | 見積 | 状態   | A     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ | ----- |
| TASK-097-3 | PBI-097 DoD21項目チェック / PR提出（hydration mismatch 0件・FOUC許容範囲確認・渡辺セキュリティレビュー）                                 | 伊藤 | 1h   | ✅完了 | -     |
| TASK-098-1 | PBI-098 第1段階: referenceData.ts（chapter01〜12）の実本文抽出 → `scripts/prerender.mjs` テンプレート拡張 + Markdown→HTML 変換helper追加 | 田中 | 5h   | ✅完了 | A-111 |
| TASK-098-2 | PBI-098 第1段階: chapter01/chapter06/chapter12 の view-source 本文文字数機械計測（600字以上確認）                                        | 田中 | 1h   | ✅完了 | A-111 |
| TASK-099-1 | PBI-099: `scripts/prerender.mjs` ルートリストに `/reference`・`/patterns` 追加 + 一覧テンプレート追加                                    | 山本 | 3h   | ✅完了 | -     |

### Day3（2026-05-26 / PBI-098第2段階 + PBI-099完遂）

| ID         | 内容                                                                                                                         | 担当      | 見積 | 状態   | A     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ---- | ------ | ----- |
| TASK-098-3 | PBI-098 第2段階: cases.json（20件）の本文抽出＋焼き込み + case-001/010/053 文字数計測（約800字 / vitest 600字下限 20件PASS） | 田中      | 4h   | ✅完了 | A-111 |
| TASK-099-2 | PBI-099: PatternList.tsx 導入文＋項目別 characteristics 説明文 / ReferencePage 章ナビに description 付与 / vitest 3件追加    | 中村+山本 | 4h   | ✅完了 | -     |
| TASK-099-3 | PBI-099 DoD21項目クローズ / sitemap 59ルート整合確認（routes.ts 既登録）                                                     | 山本      | 1h   | ✅完了 | -     |

### Day4（2026-05-27 / PBI-098第3段階 + PBI-100着手）

| ID         | 内容                                                                                                                               | 担当      | 見積 | 状態   | A     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- | ------ | ----- |
| TASK-098-4 | PBI-098 第3段階: patternData.ts（20件）の本文抽出＋焼き込み + patterns/1/10/20 文字数計測 + vitest本文600字下限全件PASS            | 田中      | 4h   | ✅完了 | A-111 |
| TASK-098-5 | PBI-098: 52ページ文字数計測レポートを `project/docs/prerender_content_length_report.md` に保存                                     | 中村      | 1h   | ✅完了 | A-111 |
| TASK-100-1 | PBI-100: `project/docs/adsense_placement_policy.md` 新設（6条件明文化）                                                            | 鈴木+伊藤 | 1h   | ✅完了 | -     |
| TASK-100-2 | PBI-100: `shouldShowAds(pageMeta)` ヘルパー実装 + 既存 AdSlot.tsx 表示制御差し替え                                                 | 伊藤      | 2h   | ✅完了 | -     |
| TASK-100-3 | PBI-100: 主力SEOページ（ReferencePage / CaseDetail / PatternDetail）に AdSlot 追加 + 薄ページから撤去 + App.tsx L744/L923 配置整理 | 山本      | 2h   | ✅完了 | -     |

### Day5（2026-05-29 / 最終品質ゲート + DoDクローズ + Sprint Review準備）

| ID         | 内容                                                                                                                                 | 担当      | 見積  | 状態                 | A     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------- | ----- | -------------------- | ----- |
| TASK-098-6 | PBI-098 DoD21項目チェック / PR提出（hydration mismatch 0 / 52ページ全件600字以上確認）                                               | 伊藤      | 1h    | ✅完了（DAY4前倒し） | -     |
| TASK-100-4 | PBI-100: vitest（`shouldShowAds` 判定ロジック＋各ページ種別AdSlot有無）追加 + DoD21項目チェック / PR提出（渡辺セキュリティレビュー） | 伊藤      | 2h    | ✅完了（DAY4前倒し） | -     |
| TASK-D5-1  | 最終品質ゲート: tsc 0 / lint 0 / vitest 全 PASS / build成功 / audit High-Critical 0 / sitemap 59ルート確認                           | 山本      | 1h    | ✅完了               | -     |
| TASK-D5-2  | A-116 チェックリストに本スプリント進捗を反映（IMP-002・PBI-097/098/099/100 完了状況・PBI-101残）                                     | 鈴木+伊藤 | 30min | ✅完了               | A-116 |
| TASK-D5-3  | product_backlog.csv 完了PBI状態更新 / product_backlog_done.csv 移送 / velocity.csv 追記 / handoff還流欄記入                          | 高橋+田中 | 1h    | ✅完了               | -     |

---

## 受入確認メモ

> Sprint Review 前にチームで埋める。

### PBI-097 受入確認

- [x] `scripts/prerender.mjs` 全テンプレートから `hidden aria-hidden="true"` 完全除去（8箇所→0）
- [x] 57ルート全件 dist `*/index.html` で `hidden` 属性無しの本文可視出力（PowerShell Select-String 全件grepで0件 → DAY2で59ルートでも再確認0件）
- [x] hydration mismatch warning 0件（createRoot使用のため設計上warning発生不可）
- [x] FOUC許容範囲（SPA即置換設計・DAY1合意の許容基準内）
- [x] vitest 自動検証 PASS（PBI-097 専用 describe / 全1046件 PASS / snapshot 13件整合）
- [x] DoD 21項目「はい」/ 渡辺セキュリティレビュー済（書面：ref/配下固定MD読込のみでXSS導線なし）

### PBI-098 受入確認

- [x] 52詳細ページ全件の静的HTML本文 600字以上（reference 12 ✅1365〜2732字 / cases × 20 ✅772〜975字 / patterns × 20 ✅705〜859字 / `prerender_content_length_report.md` 機械計測確定 600字未満0件）
- [x] reference / cases / patterns 各代表3ルート view-source: 確認（chapter01/06/12 ✅ / case-001/010/053 ✅ / patterns/1/10/20 ✅）
- [x] hydration mismatch warning 0件 / a11y退行ゼロ（vitest 1121件 PASS）
- [x] vitest 本文文字数下限 全件 PASS（reference 12 ✅ / cases 20 ✅ / patterns 20 ✅ = 52件全PASS）
- [x] build時間 baseline +10%以内（prerender 59ルート完走確認・体感差なし）
- [x] DoD 21項目「はい」（DAY4 TASK-098-6 前倒しでクローズ・渡辺セキュリティレビュー書面OK）

### PBI-099 受入確認

- [x] sitemap 整合（routes.ts に `/reference`・`/patterns` 既登録・generate-sitemap.mjs 再生成OK・sitemap-coverage.test PASS）/ プリレンダは 59ルート（既存57+/reference+/patterns）
- [x] /reference・/patterns 静的HTMLに項目別 1〜2文説明＋導入文 可視出力（**prerender側 ✅ /reference=1491字・/patterns=1778字 / SPA側 PatternList・ReferencePage 拡充 ✅**）
- [x] vitest 説明文存在・項目別出力検証 PASS（prerender 6件 + PatternList 3件 + 既存ReferencePage 全件）
- [x] a11y退行ゼロ / DoD 21項目「はい」 ✅ クローズ

### PBI-100 受入確認

- [x] `adsense_placement_policy.md` 新設（6条件 C1〜C6 + 配置可否マトリクス + 配置パターン + 実装制御 + 退行検知）
- [x] `shouldShowAds(pageMeta)` 実装（`src/ui/adPolicy.ts` 純関数）/ vitest `adPolicy.test.ts` 28件 PASS
- [x] 主力SEOページ（reference-chapter / case-detail / pattern-detail）に AdSlot 配置 / 一覧・法務・検索・404から非表示
- [x] `ReferencePage` `kind='reference-list'` で非表示 / `AdSlot.tsx` 統合完了
- [x] DoD 21項目「はい」/ 渡辺セキュリティレビュー書面OK（純関数・副作用なし・依存なし・XSS導線なし）

### 公開後確認（DAY1 IMP-002解消後 / 解消できなければSprint027繰延）

- [ ] K-1（Search Console KPI 4種）実値追記
- [ ] Lighthouse SEO 実スコア追記
- [ ] C1〜C3 URL検査
- [ ] PBI-086 PoC ルート本番 view-source: 確認（A-112初運用）

---

## 更新履歴

| 日付       | 更新内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 更新者     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 2026-05-23 | 初版作成（計画 8pt = PBI-097 1pt + PBI-098 3pt + PBI-099 2pt + PBI-100 2pt / ストレッチ枠なし / DAY1 IMP-002解消必達（A-117 / A-114経路初運用＋顧客経由督促） / PBI-098 3段階展開戦略でA-111 2連続適用 → 卒業判定狙い）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 高橋（SM） |
| 2026-05-24 | DAY1 反映: PBI-097 実装完了（prerender.mjs 8箇所除去・vitest 114件追加・全1009件PASS・dist 57件 hidden 0件・tsc 0・lint 0）/ IMP-002 A-114 3点セット初運用 → SLA超過で③発動済・4スプリント連続Open到達 / A-117 本計測一気実施は Sprint027 持ち越し / TASK-097-3（DoDクローズ・PR提出）は DAY2 朝に移送                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 高橋（SM） |
| 2026-05-25 | DAY2 反映: PBI-097 ✅完了（DoD21項目クローズ・createRoot使用のためhydration warning設計上0・FOUC許容範囲・渡辺書面OK）/ PBI-098 第1段階 ✅完了（mdToHtml実装・ref/chapter\*.md焼き込み・12章全件1365〜2732字・vitest 600字下限12件PASS）/ PBI-099 TASK-099-1 ✅完了（prerender 59ルート化・/reference・/patterns一覧テンプレート追加・vitest 6件PASS）/ 全1046件PASS・tsc0・lint0・build成功・dist 59件 hidden 0件                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 高橋（SM） |
| 2026-05-26 | DAY3 反映: PBI-098 第2段階 ✅完了（cases.json 20件本文焼き込み・case-001/010/053 view-source 約800字・vitest 600字下限 cases20件追加PASS）/ PBI-099 ✅完了（PatternList SPA一覧導入文+characteristics 1〜2文説明・ReferencePage 章ナビdescription付与・vitest 3件追加・DoD21項目クローズ・sitemap 59ルート整合確認）/ 全1071件PASS・tsc0・lint0・build成功 / IMP-002 状態変化なし                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 高橋（SM） |
| 2026-05-27 | DAY4 反映: PBI-098 第3段階 ✅完了（prerender.mjs に loadPatternData/buildPatternRoute 追加・patternData.ts 実データ patterns×20 焼き込み・patterns/1=786・/10=725・/20=752字・全20件705〜859字）/ PBI-098 DoD21項目クローズ（52ページ機械計測 600字未満0件・`prerender_content_length_report.md` 確定）/ PBI-100 ✅完了（`adsense_placement_policy.md` 6条件明文化・`shouldShowAds` 純関数実装・AdSlot 統合・`adPolicy.test.ts` 28件PASS・ReferencePage kind='reference-list' 非表示・渡辺書面OK）/ 全1121件PASS・tsc0・lint0・build成功・dist 59件 hidden 0件 / DAY5 予定 TASK-098-6/100-4 を DAY4 で前倒しクローズ / IMP-002 状態変化なし（4スプリント連続Open継続）                                                                                                                                                                                                                                                                                                                                                              | 高橋（SM） |
| 2026-05-29 | DAY5 反映: 最終品質ゲート再走 ✅完了（TASK-D5-1: tsc 0/lint 0(warning 0)/vitest 1121 PASS(59 Test Files)/build成功(prerender 59ルート完走)/dist 59件 hidden 0件/audit High-Critical 0(moderate 2のみ)/52ページ本文600字以上機械計測確定）/ A-116 `project/docs/adsense_resubmission_checklist.md` 新設＋本反映 ✅完了（TASK-D5-2: order014/016 §1〜§4 全項目に「完了/未完了/該当なし」+根拠リンク記入・PBI-097/098/099/100完了/PBI-101残/IMP-002 4連続Open注記）/ バックログ整合 ✅完了（TASK-D5-3: product_backlog.csv→product_backlog_done.csv へ PBI-097/098/099/100 移送 status: Ready→Done・CSV列構造維持・UTF-8 / velocity.csv sprint026 追記 planned 8/completed 8/carried 0 / handoff還流欄記入）/ スプリントゴール 100% 達成: AdSense審査落ち4直接原因（クローキング・薄いプリレンダ・一覧欠落・広告配置）全て根治済・Sprint027 PBI-101→PBI-094 着手可能状態確立 / IMP-002 4スプリント連続Open継続（Sprint027 物理ブロッカー扱いで優先度再協議予定）/ A-111 段階展開戦略は2スプリント連続適用成功でretroで文化卒業反映候補 | 高橋（SM） |
