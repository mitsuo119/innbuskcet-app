# デイリースクラム記録 - Sprint 005

> デイリースクラムは開発者のためのスプリントゴールに対する進捗を検査し、必要に応じてスプリントバックログを適応させる15分のイベントである。 — スクラムガイド 2020

## 基本情報

| 項目           | 内容                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| 参加者         | Dev: 伊藤・田中・山本（助っ人）・中村（助っ人） / SM: 高橋（必要時）/ PO: 鈴木（必要時） |
| タイムボックス | 15分                                                                                  |
| 形式           | スプリントゴール進捗・本日の計画・障害物確認                                          |

スプリントゴール: **「『判断・理由・アクション』の合格答案の型を、模範回答骨格との比較とセットで反復できるようにし、昇進試験合格に直結する学習価値へ踏み込む（DoD §10 入力検証・データ保護を初適用）」**

---

（Sprint005 期間中に日次追記）

## DAY 1 (2026-05-27 水)

### 進捗・計画・障害物

| 参加者 | 昨日やったこと | 今日やること | 障害物 |
| ------ | -------------- | ------------ | ------ |
| 伊藤（Dev） | プランニング参加 / DoD §10 適用方針確認 | TASK-001 (writing.ts) 完了 / TASK-002 レビュー支援 / TASK-008 着手準備 | なし |
| 田中（Dev） | プランニング参加 | TASK-004 (shortcut.ts textarea 判定) 着手 / TASK-002 設計レビュー | なし |
| 山本（Dev・助っ人） | handoff_for_helpers.md 確認 | TASK-002 (WritingInput 骨格) 着手 | aria-label 文言ガイドを伊藤に確認 → 解消 |
| 中村（Dev・助っ人） | handoff_for_helpers.md 確認 | TASK-007 (cases.json modelAnswer スキーマ案) 起草 | なし |
| 高橋（SM） | A-16 還流欄構造化 (TASK-013) | DoD §10 判定手順 (TASK-014) 整備 / 障害物受付 | なし |

### スプリントゴール進捗
- 計画ポイント 6pt / 残 6pt（DAY1 はインクリメント基盤の構築日）。
- 主要実装 2 件着地：
  - **TASK-001 完了**：domain/writing.ts（純粋関数・型定義）+ writing.test.ts（12 件追加 / 境界値 499・500・501、空・部分入力、型破壊）。DoD §10-1 のエビデンスを取得。
  - **TASK-002 レビュー中**：ui/WritingInput.tsx 骨格作成（textarea×3 / aria-label / maxLength=500 / placeholder 例示 / disabled 対応 / 文字数カウンタ aria-live）。styles.css に CSS 変数ベースのテーマ対応スタイル追加。dangerouslySetInnerHTML 不使用（DoD §10-2）。

### 検証結果（DAY1 時点）
- pnpm test: **90 passed (78 既存 + 12 新規)** ✅
- pnpm lint: エラー・警告なし ✅
- 	sc -b --noEmit: 型エラーなし ✅
- DoD §10-1 境界値テスト 4 件（空 / 499 / 500 / 501）取得 ✅

### 計画調整
- なし（バーンダウン計画通り：残タスク 12 → DAY2 朝点検時に再評価）。

### 障害物
- 当日新規発生なし（impediment_log.csv 追記なし）。

---

## DAY 2 (2026-05-28 木)

### 進捗・計画・障害物

| 参加者 | 昨日やったこと | 今日やること | 障害物 |
| ------ | -------------- | ------------ | ------ |
| 伊藤（Dev） | TASK-001 完了 / TASK-002 レビュー対応 | TASK-003 (WritingPreview) 着手・完了 / TASK-008 着手準備 | なし |
| 田中（Dev） | TASK-002 設計レビュー | TASK-004 (shortcut.ts textarea ガード) 完了 / shortcut.test 拡充 | なし |
| 山本（Dev・助っ人） | TASK-002 骨格 | TASK-007 (cases.json modelAnswer 5〜10件) 着手・完了 | なし |
| 中村（Dev・助っ人） | TASK-007 スキーマ案起草 | TASK-007 山本と協働 / TASK-012 準備 | なし |
| 高橋（SM） | A-16 還流欄 / DoD §10 判定手順 | DoD §10-2 / §10-3 のエビデンス収集様式整備 | なし |

### スプリントゴール進捗
- 計画ポイント 6pt / 残 5pt（PBI-023 主要 UI 実装ほぼ揃い、PBI-024 データ基盤着手）。
- 主要実装 3 件着地：
  - **TASK-003 完了**：`ui/WritingPreview.tsx` 新設（読み取り専用プレビュー / `<dl>` セマンティクス / `aria-label="記述内容のプレビュー"` / 改行保持 `pre-wrap` / 全空時は「未記述」案内）。`dangerouslySetInnerHTML` 不使用（DoD §10-2 エビデンス取得）。styles.css に対応スタイルを CSS 変数ベースで追加。
  - **TASK-004 完了**：`domain/shortcut.ts` に `isEditableTarget()` を新設・export し App.tsx の重複ヘルパを撤去。判定対象を input/textarea/select に加え contenteditable も明示。`shortcut.test.ts` に 6 件のテストを追加（textarea / input / select / contenteditable / 非編集要素・null / textarea フォーカス時の A 押下統合確認）。
  - **TASK-007 完了**：`data/cases.json` の case-001〜case-010（A:4 / B:2 / C:4 = A/B/C 各 30% 維持）に `modelAnswer{judgment,reason,action}` を投入。`domain/case.ts` に `ModelAnswer` 型を追加し `Case.modelAnswer?` をオプショナル化。`domain/loader.ts` に `parseModelAnswer()` を新設し型・必須キー・非空文字列の検証を実施（DoD §10-3）。未整備案件は `undefined` フォールバック。

### 検証結果（DAY2 時点）
- pnpm test: **96 passed (90 既存 + 6 新規 shortcut)** ✅
- pnpm lint: エラー・警告なし ✅
- pnpm exec tsc -b --noEmit: 型エラーなし ✅
- DoD §10-2 エビデンス：WritingPreview にて React テキスト描画のみで実装・dangerouslySetInnerHTML 不使用を確認 ✅
- DoD §10-3 エビデンス：loader.ts で modelAnswer 型不正・キー欠落・空文字を例外化 ✅
- A/B/C 30% 維持：modelAnswer 投入 10 件の比率 A:4 / B:2 / C:4（30% 以上 / TASK-012 事前確認）✅

### 計画調整
- TASK-002 を「完了」に更新（DAY1 末時点で残作業はレビューのみ、TASK-003 連携で確認完了）。
- TASK-005（App.tsx 結線）は DAY3 着手で計画通り（TASK-003/004 完了でブロッカー解消）。
- バーンダウン：残タスク 9 → 6（計画値 9 を上回る進捗）。

### 障害物
- 当日新規発生なし（impediment_log.csv 追記なし）。

---

## DAY 3 (2026-05-29 金)

### 進捗・計画・障害物

| 参加者 | 昨日やったこと | 今日やること | 障害物 |
| ------ | -------------- | ------------ | ------ |
| 伊藤（Dev） | TASK-003 (WritingPreview) 完了 | TASK-005 (App.tsx 結線・PBI-023 完成) 着手・完了 | なし |
| 田中（Dev） | TASK-004 (shortcut textarea ガード) 完了 | TASK-008 (loader スキーマ検証 + undefined フォールバック) 着手・完了 | なし |
| 山本（Dev・助っ人） | TASK-007 (cases.json modelAnswer 投入) 完了 | TASK-005/008 統合確認・レビュー支援 / TASK-009 設計準備 | なし |
| 中村（Dev・助っ人） | TASK-007 山本と協働 | TASK-009 (ModelAnswerView 骨格) 準備 / TASK-012 PRチェック | なし |
| 高橋（SM） | DoD §10-2/§10-3 エビデンス様式整備 | DoD §10-3 不整合フォールバック運用確認・障害物受付 | なし |

### スプリントゴール進捗
- 計画ポイント 6pt / 残 3pt（**PBI-023 完成**）。PBI-024 はデータ基盤＋ローダ検証まで完了し、UI（TASK-009/010/011/012）が残作業。
- 主要実装 2 件着地：
  - **TASK-005 完了（PBI-023 Done）**：App.tsx に WritingInput / WritingPreview を統合。
    - state writingEntry: WritingEntry（createEmptyWritingEntry() 初期化）追加。
    - 配置：CaseView の直後に WritingInput（**回答前から入力可能**＝先に考えてから A/B/C を選べるフロー）。回答後（locked）は disabled=true で答えを変えられないようガード。
    - 回答後（judgement && selected）に WritingPreview を表示し ExplanationView の手前に並べる。isWritingEntryEmpty() で全空フォールバック表示。
    - handleNext / handleModeChange 時に setWritingEntry(createEmptyWritingEntry()) で初期化（次案件に持ち越さない）。handleRetry は同一案件再挑戦のため writingEntry を保持（編集して再回答可能）。
    - 既存の shortcut textarea ガード（DAY2 / TASK-004）と整合：textarea フォーカス中は A/B/C/Enter が誤発火しないことを統合確認。
  - **TASK-008 完了**：domain/loader.ts の parseModelAnswer を「不整合時 undefined フォールバック」方式に変更し export。
    - 旧実装（DAY2）は throw 方式だったが、TASK-008 仕様（DoD §10-3）に合わせ「undefined フォールバック + console.warn 通知」へ修正。段階移行中の cases.json でも Case ロード継続を保証。
    - loader.test.ts に **8 件のテスト追加**（正常 1 / undefined・null 1 / 空文字 1 / キー欠落 1 / 型不正 1 / 配列・文字列 1 / loadCases 経由整備済 1 / 未整備 1）。

### 検証結果（DAY3 時点）
- pnpm test: **104 passed (96 既存 + 8 新規 loader)** ✅
- pnpm lint: エラー・警告なし ✅
- pnpm exec tsc -b --noEmit: 型エラーなし ✅
- DoD §10-3 エビデンス：
  - parseModelAnswer の不整合時フォールバック挙動を 6 件のテストで証明（空文字・キー欠落・型不正・配列・文字列・undefined/null）✅
  - loadCases 経由でも整備済 / 未整備の両ケースが想定通りに動作することを確認 ✅
- DoD §10-1/§10-2 エビデンス（DAY1/DAY2 取得分）が App.tsx 統合後も維持されていることを統合確認 ✅
- PBI-023 受入基準：
  - 判断・理由・アクションを 3 ブロックで記述できる ✅
  - 回答前に記述できる（先に考えてから選択）✅
  - 回答後は記述を変えられない（disabled）✅
  - 回答後に WritingPreview で記述内容を確認できる ✅
  - 次の問題に進むと記述がリセットされる ✅

### 計画調整
- TASK-005 / TASK-008 を「完了」に更新。残タスク：TASK-006（a11y 検証）/ PBI-024 の TASK-009/010/011/012。
- バーンダウン：残タスク 6 → 4（計画値 6 を上回る進捗）。DAY4 で PBI-024 の UI（TASK-009/010）と a11y 検証（TASK-006）を集中投下する計画。
- 設計上の小修正：DAY2 で実装した parseModelAnswer の throw 方式を undefined フォールバックに変更（TASK-008 仕様に整合）。データ不備は console.warn で開発者通知に切替。

### 障害物
- 当日新規発生なし（impediment_log.csv 追記なし）。


---

## DAY 3 (2026-05-29 金)

### 進捗・計画・障害物

| 参加者 | 昨日やったこと | 今日やること | 障害物 |
| ------ | -------------- | ------------ | ------ |
| 伊藤（Dev） | TASK-003 (WritingPreview) 完了 | TASK-005 (App.tsx 結線・PBI-023 完成) 着手・完了 | なし |
| 田中（Dev） | TASK-004 (shortcut textarea ガード) 完了 | TASK-008 (loader スキーマ検証 + undefined フォールバック) 着手・完了 | なし |
| 山本（Dev・助っ人） | TASK-007 (cases.json modelAnswer 投入) 完了 | TASK-005/008 統合確認・レビュー支援 / TASK-009 設計準備 | なし |
| 中村（Dev・助っ人） | TASK-007 山本と協働 | TASK-009 (ModelAnswerView 骨格) 準備 / TASK-012 PRチェック | なし |
| 高橋（SM） | DoD §10-2/§10-3 エビデンス様式整備 | DoD §10-3 不整合フォールバック運用確認・障害物受付 | なし |

### スプリントゴール進捗
- 計画ポイント 6pt / 残 3pt（**PBI-023 完成**）。PBI-024 はデータ基盤＋ローダ検証まで完了し、UI（TASK-009/010/011/012）が残作業。
- 主要実装 2 件着地：
  - **TASK-005 完了（PBI-023 Done）**：App.tsx に WritingInput / WritingPreview を統合。
    - state writingEntry: WritingEntry（createEmptyWritingEntry() 初期化）追加。
    - 配置：CaseView の直後に WritingInput（**回答前から入力可能**＝先に考えてから A/B/C を選べるフロー）。回答後（locked）は disabled=true で答えを変えられないようガード。
    - 回答後（judgement && selected）に WritingPreview を表示し ExplanationView の手前に並べる。isWritingEntryEmpty() で全空フォールバック表示。
    - handleNext / handleModeChange 時に setWritingEntry(createEmptyWritingEntry()) で初期化（次案件に持ち越さない）。handleRetry は同一案件再挑戦のため writingEntry を保持（編集して再回答可能）。
    - 既存の shortcut textarea ガード（DAY2 / TASK-004）と整合：textarea フォーカス中は A/B/C/Enter が誤発火しないことを統合確認。
  - **TASK-008 完了**：domain/loader.ts の parseModelAnswer を「不整合時 undefined フォールバック」方式に変更し export。
    - 旧実装（DAY2）は throw 方式だったが、TASK-008 仕様（DoD §10-3）に合わせ「undefined フォールバック + console.warn 通知」へ修正。段階移行中の cases.json でも Case ロード継続を保証。
    - loader.test.ts に **8 件のテスト追加**（正常 1 / undefined・null 1 / 空文字 1 / キー欠落 1 / 型不正 1 / 配列・文字列 1 / loadCases 経由整備済 1 / 未整備 1）。

### 検証結果（DAY3 時点）
- pnpm test: **104 passed (96 既存 + 8 新規 loader)** ✅
- pnpm lint: エラー・警告なし ✅
- pnpm exec tsc -b --noEmit: 型エラーなし ✅
- DoD §10-3 エビデンス：
  - parseModelAnswer の不整合時フォールバック挙動を 6 件のテストで証明（空文字・キー欠落・型不正・配列・文字列・undefined/null）✅
  - loadCases 経由でも整備済 / 未整備の両ケースが想定通りに動作することを確認 ✅
- DoD §10-1/§10-2 エビデンス（DAY1/DAY2 取得分）が App.tsx 統合後も維持されていることを統合確認 ✅
- PBI-023 受入基準：
  - 判断・理由・アクションを 3 ブロックで記述できる ✅
  - 回答前に記述できる（先に考えてから選択）✅
  - 回答後は記述を変えられない（disabled）✅
  - 回答後に WritingPreview で記述内容を確認できる ✅
  - 次の問題に進むと記述がリセットされる ✅

### 計画調整
- TASK-005 / TASK-008 を「完了」に更新。残タスク：TASK-006（a11y 検証）/ PBI-024 の TASK-009/010/011/012。
- バーンダウン：残タスク 6 → 4（計画値 6 を上回る進捗）。DAY4 で PBI-024 の UI（TASK-009/010）と a11y 検証（TASK-006）を集中投下する計画。
- 設計上の小修正：DAY2 で実装した parseModelAnswer の throw 方式を undefined フォールバックに変更（TASK-008 仕様に整合）。データ不備は console.warn で開発者通知に切替。

### 障害物
- 当日新規発生なし（impediment_log.csv 追記なし）。

---

## DAY 4 (2026-06-01 月)

### 進捗・計画・障害物

| 参加者 | 昨日やったこと | 今日やること | 障害物 |
| ------ | -------------- | ------------ | ------ |
| 伊藤（Dev） | TASK-005 (App.tsx 結線・PBI-023 完成) | TASK-010 (ModelAnswerView を App.tsx 統合) 着手・完了 / TASK-006 a11y 検証協力 | なし |
| 田中（Dev） | TASK-008 (loader フォールバック) | レビュー支援 / DoD §10 エビデンス再確認 | なし |
| 山本（Dev・助っ人） | TASK-005/008 統合確認 | TASK-006 (WritingInput a11y 検証・調整) 着手・完了 | なし |
| 中村（Dev・助っ人） | TASK-009 設計準備 | TASK-009 (ModelAnswerView 実装) 着手・完了 | なし |
| 高橋（SM） | DoD §10-3 運用確認 | TASK-015 レビュー準備着手 / 障害物受付 | なし |

> Day0 担当割の小調整：TASK-006 を山本（実機 a11y 検証）/ TASK-009 を中村（一次情報＝既存 WritingPreview / cases.json 構造を踏まえた骨格実装）/ TASK-010 を伊藤（App.tsx 結線継続）にスワップして集中投下。バックログの TASK 説明（採点ポイントチェックボックス・左右並列レイアウト）は Sprint006 以降の拡張余地として残し、DAY4 では PBI-024 受入基準（回答後に模範骨格表示／未整備案件は「模範解答準備中」／DoD §10-2 準拠／テスト必須）に焦点を絞った。

### スプリントゴール進捗
- 計画ポイント 6pt / 残 0pt（**PBI-023 / PBI-024 主要実装完了**）。残作業は a11y チェックリスト最終転記・TASK-011/012/013/014/015。
- 主要実装 3 件着地：
  - **TASK-009 完了（中村）**：`ui/ModelAnswerView.tsx` 新設（`ModelAnswer` 型を受け取り判断/理由/アクションを `<dl>` 構造で表示）。
    - `modelAnswer` undefined または `visible=false` のとき「模範解答準備中（この案件はまだ模範回答骨格が整備されていません）」のプレースホルダを表示。
    - `aria-label="模範解答"` をセクションに付与。`<dl>/<dt>/<dd>` で意味的にラベルと内容を対応付け（DoD §9-3）。
    - React テキスト描画のみで構成し `dangerouslySetInnerHTML` 不使用（DoD §10-2）。XSS 文字列のエスケープを vitest で証明。
    - styles.css に `.model-answer*` を CSS 変数ベースで追加（左ボーダーで模範を視覚的に強調 / ライト・ダーク自動追従 / 改行 `pre-wrap` 保持）。
    - `ui/ModelAnswerView.test.tsx` を新設（**5 件**：visible=false プレースホルダ / undefined プレースホルダ / 整備済み表示 / dangerouslySetInnerHTML 不使用 / dl 構造 3 項目）。
  - **TASK-010 完了（伊藤）**：App.tsx に `ModelAnswerView` を統合。回答後（`judgement && selected`）の `WritingPreview` 直後・`ExplanationView` の手前に配置し、`modelAnswer={current.modelAnswer}` / `visible={!!judgement}` を渡す。`handleNext` / `handleModeChange` で writingEntry 初期化済みのため次案件へは自動的に持ち越されない。`handleRetry` では judgement=null となり ModelAnswerView は自然に非表示（受入基準「未入力でも閲覧可能」は再回答後に再表示される導線で担保）。
  - **TASK-006 完了（山本）**：`ui/WritingInput.tsx` の a11y を `project/docs/a11y_checklist.md` に照らし検証。修正不要であることを確認。
    - §1-1-h（textarea 内で A/B/C/Enter 誤発火しない）：DAY2 の TASK-004 で実装済み・shortcut.test.ts のテストで OK。
    - §2（フォーカス可視）：`.writing-input__textarea:focus-visible` で 2px outline + offset 2px、`--color-focus-ring` でテーマ追従 OK。
    - §3（aria）：各 textarea に `aria-label` / `<label htmlFor>` で関連付け、`role="group"` + `aria-label="判断・理由・アクションを入力"`、文字数カウンタは `aria-live="polite"`。OK。
    - §1-2 キートラップ：通常の Tab フローで textarea 間および後続要素へ抜けられる。OK。

### 検証結果（DAY4 時点）
- pnpm test: **109 passed (104 既存 + 5 新規 ModelAnswerView)** ✅
- pnpm lint: エラー・警告なし ✅
- pnpm exec tsc -b --noEmit: 型エラーなし ✅
- DoD §10-2 エビデンス：ModelAnswerView の React テキスト描画限定 + `<script>` / `<img onerror>` / `<b>` のエスケープを 1 件のテストで証明 ✅
- DoD §10-3 エビデンス：未整備案件（modelAnswer=undefined）でもプレースホルダが安全に表示され、Case ロード継続 ✅
- DoD §9-1/§9-3 エビデンス：a11y チェックリスト §1-1/§1-2/§2/§3 を WritingInput 観点で再点検し OK 確認 ✅
- PBI-024 受入基準：
  - 回答後に模範骨格が表示される ✅
  - 未設定案件は「模範解答準備中」プレースホルダ ✅
  - DoD §10-2 準拠（dangerouslySetInnerHTML 不使用） ✅
  - テスト必須 ✅（ModelAnswerView 5 件）

### 計画調整
- TASK-006 / TASK-009 / TASK-010 を「完了」に更新。**PBI-023 / PBI-024 の主要受入基準を満たす状態に到達**。
- バーンダウン：残タスク 4 → 1（TASK-011 a11y / TASK-012 A-15 PR チェック / TASK-013 A-16 還流欄 / TASK-014 §10 判定手順 / TASK-015 レビュー準備が DAY5 残）。実体は DAY1〜DAY3 で先行着手済みのものが多く、DAY5 はチェックリスト転記＋レビュー準備に集中可能。
- 実装スコープ調整メモ：バックログの TASK-009 説明にあった「採点ポイントチェックボックス」「左右並列レイアウト（モバイル縦積み）」は PBI-024 受入基準に直接含まれないため Sprint006 以降の拡張余地として残置。本スプリントは「模範骨格を比較できる」最小限の価値提供にフォーカス。

### 障害物
- 当日新規発生なし（impediment_log.csv 追記なし）。
