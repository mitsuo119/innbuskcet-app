# デイリースクラム記録 - Sprint 009

## 基本情報

| 項目           | 内容                                       |
| -------------- | ------------------------------------------ |
| スプリント番号 | Sprint 009                                 |
| 期間           | 2026-06-24（水）～ 2026-06-30（火）        |
| 参加者         | 伊藤・田中・山本（助っ人）・中村（助っ人） |
| SM / PO        | 高橋 / 鈴木                                |

> 15分のタイムボックスで、スプリントゴールに向けた進捗と障害物を毎日検査し適応する。

---

## Day1（2026-06-24）

### スプリントゴールへの進捗確認

PBI-038（ConfirmDialog 内製コンポーネント）を本日中に完了。計画通りの進捗。

### 各メンバーの報告

**伊藤**

- 昨日やったこと（前提）：Sprint009 プランニング完了
- 今日やること：TASK-001（ConfirmDialog コンポーネント新設）
- 完了：`src/ui/ConfirmDialog.tsx` を新設。`role="dialog"` / `aria-modal="true"` / 見出し関連付け（`aria-labelledby`）/ description 関連付け（`aria-describedby`）/ focus trap（Tab・Shift+Tab）/ Esc 閉じる / 初期フォーカス制御を実装。ライト/ダーク両テーマ対応も完了。
- 障害物：なし

**田中**

- 昨日やったこと（前提）：Sprint009 プランニング完了
- 今日やること：TASK-002（App.tsx の window.confirm/alert を ConfirmDialog へ置換）
- 完了：`handleLearningStyleChange` 内 3 箇所（Exam 中断・WritingEntry 破棄・Exam 開始）と Exam 起動失敗フォールバックを ConfirmDialog へ完全移行。`window.confirm` / `window.alert` への依存を完全解消。
- 障害物：なし

**山本（助っ人）**

- 今日やること：TASK-003（ConfirmDialog vitest + a11y チェック）
- 完了：`src/ui/ConfirmDialog.test.tsx` に 10 件のテスト作成（open=false 非描画 / role+aria-modal / タイトル+説明 / onAction / Esc / autoFocus / focus trap Tab / focus trap Shift+Tab / バリアント class / XSS 安全）。全件 PASS 確認。
- 障害物：XSS テスト検証方式を修正（DOM 要素存在確認＋textContent 検証に変更）

**中村（助っ人）**

- 今日やること：TASK-007 前半（case-031〜035 の modelAnswer + scoringPoints 追加）
- ステータス：Day2 に回す

### 本日の障害物

なし

### 翌日（Day2）の計画

- TASK-007（PBI-033c）：case-031〜040 全 10 件の modelAnswer + scoringPoints 追加（中村）
- TASK-004（PBI-041）：examTimer.ts 拡張（残時間・出題 index・回答履歴の永続化）着手（伊藤）

---

## Day2（2026-06-25）

### スプリントゴールへの進捗確認

PBI-033c 完了 + PBI-041 前半（TASK-004）完了。計画前倒し。

### 各メンバーの報告

**伊藤**

- 昨日やったこと：TASK-001（ConfirmDialog 新設）完了
- 今日やること：TASK-004（examTimer 進行状況保存）
- 完了：`domain/examTimer.ts` に `ExamProgressSnapshot` インターフェースと `saveExamProgress` / `loadExamProgress` / `clearExamProgress` を追加（key: `examProgress`）。スキーマ検証で不正値は null フォールバック。`examTimer.test.ts` に 9 件のテストを追加し、全 29 件 PASS。
- 障害物：なし

**田中**

- 今日やること：TASK-005 着手準備
- ステータス：Day3 から本格着手

**山本（助っ人）**

- 今日やること：TASK-006 設計検討
- ステータス：TASK-004 完了を受けて Day3 から境界値テスト整備

**中村（助っ人）**

- 昨日やったこと：Day2 持ち越し
- 今日やること：TASK-007（case-031〜040 模範解答整備）
- 完了：case-031〜040 全 10 件に modelAnswer（judgment/reason/action）+ scoringPoints（各 4 件）を追加。`pnpm tsc --noEmit` エラー 0 / `pnpm vitest run` 全 280 件 PASS。累計 40 件で A=13(32.5%) / B=14(35%) / C=13(32.5%) と 30%±10% 範囲内を確認。
- 障害物：loader.test.ts の暫定テスト「未整備案件が存在することを確認」が役目を終えたため、「全 40 件 modelAnswer 整備済み」を確認する内容に更新（PBI-033c 完了に伴う必然対応）。

### 本日の障害物

なし

### 翌日（Day3）の計画

- TASK-005（PBI-041）：Exam 再起動時の「続行 / 新規開始 / キャンセル」ConfirmDialog 導線（田中）
- TASK-006（PBI-041）：4 シナリオ手動確認 + 境界値 vitest（山本）

---

## Day3（2026-06-26）

### スプリントゴールへの進捗確認

PBI-041 の TASK-005 完了。Exam 中断・再開導線が実装され、再開ダイアログ＋進捗保存／クリアが動作。計画通り。

### 各メンバーの報告

**伊藤**

- 昨日やったこと：TASK-004 完了
- 今日やること：TASK-008 着手準備（PBI-042）
- ステータス：Day4 から本格着手

**田中**

- 昨日やったこと：TASK-005 着手準備
- 今日やること：TASK-005（Exam 再起動時の 3 択 ConfirmDialog 導線実装）
- 完了：`App.tsx` にマウント時 useEffect を追加し、`loadExamSession()` + `loadExamProgress()` 双方ある場合に「続行 / 新規開始 / キャンセル」の ConfirmDialog を表示。続行は examSession・examIndex・examAnswers（最小スタブ）を復元、新規開始は両ストレージをクリアし `createExamSession` 再起動、キャンセルは Deep へ戻す。`handleSubmit` で回答確定時に `saveExamProgress` を呼び、`finalizeExamSession` で `clearExamProgress` を呼ぶよう拡張。`pnpm tsc --noEmit` エラー 0 / `pnpm vitest run` 全 280 件 PASS / `pnpm build` 成功。
- 障害物：なし（answeredIds のみ永続化のため examAnswers は judgement='correct' のスタブで再構築する仕様トレードオフをコメントで明記）

**山本（助っ人）**

- 今日やること：TASK-006 着手準備（境界値テスト設計）
- ステータス：Day4 で本格着手

**中村（助っ人）**

- 今日やること：レビュー協力待機
- ステータス：手空き

### 本日の障害物

なし

### 翌日（Day4）の計画

- TASK-006（PBI-041）：4 シナリオ手動確認 + 境界値 vitest（山本）
- TASK-008（PBI-042）：filterMode / learningStyle ラベル定義源新設（伊藤）

---

## Day4（2026-06-29）

### スプリントゴールへの進捗確認

PBI-041 の TASK-006（境界値テスト）と PBI-042 の TASK-008（ラベル定義源新設）を完了。残るは TASK-009（既存 UI の参照置換）のみで、計画通りの進捗。

### 各メンバーの報告

**伊藤**

- 昨日やったこと：TASK-008 着手準備
- 今日やること：TASK-008（PBI-042）を山本にハンドオフ済み（伊藤は TASK-009 の置換準備に着手予定）
- ステータス：Day5 で TASK-009 を本格着手

**田中**

- 昨日やったこと：TASK-005 完了
- 今日やること：TASK-009 設計検討（Day5 着手）
- ステータス：手空き、レビュー協力

**山本（助っ人）**

- 昨日やったこと：TASK-006 設計検討
- 今日やること：TASK-006（PBI-041 境界値テスト）+ TASK-008（PBI-042 ラベル定義源新設）
- 完了：
  - TASK-006: `examTimer.test.ts` に 7 件追加（examIndex=0/19/10 のラウンドトリップ、elapsedMs=0 と MAX_SAFE_INTEGER 境界、answeredIds 空配列、clearExamProgress 後の null 確認）。examTimer 計 36 件 PASS。
  - TASK-008: `domain/filterModeLabel.ts`（`FILTER_MODE_LABELS: Record<FilterMode, FilterModeLabel>`）と `domain/learningStyleLabel.ts`（`LEARNING_STYLE_LABELS: Record<LearningStyle, LearningStyleLabel>`）を新設。文言は現行 `ModeSelector.tsx`/`LearningStyleToggle.tsx` と完全一致。各 vitest（4 件 / 5 件）を追加し全 296 件 PASS。`pnpm tsc --noEmit` エラー 0。
- 障害物：なし

**中村（助っ人）**

- 今日やること：レビュー協力待機
- ステータス：手空き

### 本日の障害物

なし

### 翌日（Day5）の計画

- TASK-009（PBI-042）：`ModeSelector.tsx` / `LearningStyleToggle.tsx` / `ScoreCounter.tsx` の既存リテラルを定義源参照へ置換（伊藤・田中）
- 横断タスク（TASK-010〜013）の最終確認、レビュー/レトロ準備

---

## Day5（2026-06-30）

### スプリントゴールへの進捗確認

PBI-042 の TASK-009 を完了し、計画 8pt をすべて達成。スプリントゴール「主要動線のダイアログ体験を統一し、Exam の中断・再開を含めて学習を安全に継続できる状態を完成させる」を達成。

### 各メンバーの報告

**中村（助っ人）**

- 今日やること：TASK-009（PBI-042 既存 UI を定義源参照へ置換）
- 完了：
  - `ModeSelector.tsx`：ローカル `labelOf` / `ariaOf` を削除し、`FILTER_MODE_LABELS[m].label` / `.aria` を参照。
  - `LearningStyleToggle.tsx`：ローカル `TOOLTIPS` 定数および `LEARNING_STYLES` 直接参照を削除し、`LEARNING_STYLE_LABELS[key].label` / `.tooltip` / `.ariaLabel` を参照。
  - `ScoreCounter.tsx`：learningStyle ラベル表示箇所を `LEARNING_STYLE_LABELS[currentStyle].label` 参照へ置換。
  - 文言は変更せず、既存テストは破壊なし：`pnpm tsc --noEmit` エラー 0、`pnpm vitest run` 全 296 件 PASS、`pnpm build` 成功。
- 障害物：なし

**伊藤・田中・山本**

- TASK-009 を中村が一括対応したため、レビュー協力＋ DoD 最終確認に従事。

### 横断タスクの確認

- **TASK-010**：Day0 handoff は実施済み（依存順序・分布観点を共有）。
- **TASK-011**：A-46 反映の運用（巻取上限ガイド / 沈黙チェック / 役割切替 5 分枠 / 障害物起票 3 軸）は今スプリントの各日で実施。
- **TASK-012**：`pr_checklist.md` の A-47 / A-48 / A-49（UTF-8 BOM なし、テストでの Node API 依存回避、案件追加時の A/B/C 30%±10% 目安）は本スプリントの全 PR で適用済み。PBI-033c は 40 件分布 A=32.5% / B=35% / C=32.5% で範囲内、PBI-038/041 はテストで `vi.mock` / fixture import を活用しており Node API 直接依存なし。
- **TASK-013**：Sprint010 候補の PBI-045 詳細化メモは PO/SM 側で整理予定。

### DoD 最終確認

- §1 コード品質：tsc エラー 0、lint 0、レビュー完了 ✅
- §2 テスト：vitest 296 件全 PASS、受入基準手動確認済み ✅
- §4 動作確認：Chrome で出題→回答→解説→次問サイクル維持 ✅
- §7 UI/UX：レスポンシブ／1〜2 タップ完結 ✅
- §9 a11y：キーボード完結／focus 可視／role / aria 適切（ConfirmDialog focus trap 含む）✅
- §10 入力検証・データ保護：sessionStorage（examProgress）スキーマ検証＋不整合時 null フォールバック、`dangerouslySetInnerHTML` 不使用 ✅

### 本日の障害物

なし

### 翌日の計画

- スプリントレビュー / レトロスペクティブ実施。

---
