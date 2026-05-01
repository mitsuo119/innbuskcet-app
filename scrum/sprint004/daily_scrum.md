# デイリースクラム記録 - Sprint 004

> スプリントゴール: **「夜間学習も快適にする視覚体験と、モード別の手応え可視化で『同僚共有に耐える完成度』へ近づける（テーマ切替・履歴件数選択・モード別正答率・履歴コントラストの 4 改善）」**

タイムボックス: 各日 15 分以内。フォーマット: 昨日 / 今日 / 障害物。

---

## Day 1 - 2026-05-20（水）

ファシリテーター: 高橋（SM） / 場所: オンライン / 開始: 09:30 / 終了: 09:42

### 共有事項（朝イチ）

- 高橋（SM）: `handoff_for_helpers.md`（双方向化反映済）を朝 09:00 に山本・中村へ共有済（A-8 適用）。応答 09:20 に受領、認識相違なし。
- 高橋（SM）: 本日は TASK-001（ThemeToggle UI）/ TASK-002（styles 変数化）/ TASK-005（モード別集計関数）/ TASK-007（履歴件数 UI）/ TASK-010（a11y 雛形）/ TASK-011（PR チェックリスト文書化）の 6 タスクに着手予定。バーンダウン計画は 残9タスク / 残5pt。

### 伊藤（開発者）

- **昨日**: スプリントプランニング参加（Why/What/How 合意、A-12 完了確認）。
- **今日**:
  - TASK-001（ThemeToggle UI 実装＋App 結線、4h）に着手し本日中に完了させる。
  - TASK-010（a11y チェックリスト雛形作成、2h）を高橋と共同で午後着手。
  - 余力で TASK-012（PBI-023〜028 リファインメント）の事前準備（鈴木と論点整理）。
- **障害物**: なし。

### 田中（開発者）

- **昨日**: スプリントプランニング参加。
- **今日**:
  - TASK-005（`score.ts` モード別集計関数＋テスト、3h）に着手し本日中に完了させる。
  - TASK-011（A-11 PR チェックリスト文書化、1h、中村と共同）。
  - TASK-001 のレビュアとして待機（依存メジャー更新は計画なし、A-7 適用）。
- **障害物**: なし。

### 山本（助っ人開発者）

- **昨日**: プランニング不参加（契約上不可）。`handoff_for_helpers.md` 受領・読了。
- **今日**:
  - TASK-002（styles.css のテーマ別変数化、5h）に着手。配色変数素案を伊藤と共有（PBI-019 → PBI-022 順序確保）。CSS Custom Properties 化のスナップショット差分を Day2 朝レビュー予定。
- **障害物**: なし。

### 中村（助っ人開発者）

- **昨日**: プランニング不参加。`handoff_for_helpers.md` 受領・読了。
- **今日**:
  - TASK-007（履歴件数 10/20 切替 UI ＋セッション内保持、3h）に着手。
  - TASK-011（A-11 文書化、1h、田中と共同、夕方）。
- **障害物**: なし。

### 高橋（SM）

- **昨日**: プランニング ファシリ。
- **今日**:
  - TASK-010（a11y 雛形）を伊藤と共同で午後対応（DoD §9-1/9-2/9-3 + コントラスト比測定手順を雛形化）。
  - 助っ人2名の handoff フォロー、障害物検知監視。
- **障害物**: なし。

### 計画の調整

- 順序の確認: PBI-019（テーマ変数整備）→ PBI-022（履歴コントラスト）の順序を厳守。PBI-020/021 は独立並列可能。
- 所感: 本日のキャパは合計約 17h（伊藤 6h / 田中 4h / 山本 5h / 中村 4h ※ 高橋は SM 兼務でバッファ）。Day1 完了見込み: TASK-001 / TASK-005 / TASK-010 / TASK-011 / TASK-007 着手・部分進行 / TASK-002 着手・部分進行。

### 障害物

- なし（初日）。`impediment_log.csv` への新規追加なし。

---

## Day 1 終了時インクリメント作成記録

09:42 のデイリースクラム後、各担当が並行作業に着手。Day1 終了時点（18:00）の達成状況を以下に記録する。

### 達成タスク（Done）

| タスクID | タイトル                             | 担当       | 実績(h) | 成果物                                                                                                                                                                                                                              |
| -------- | ------------------------------------ | ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-001 | ThemeToggle UI 実装＋App 結線        | 伊藤       | 4       | [project/front/src/ui/ThemeToggle.tsx](../../project/front/src/ui/ThemeToggle.tsx) 新規 / [App.tsx](../../project/front/src/App.tsx) 結線 / [styles.css](../../project/front/src/styles.css) `.theme-toggle` 追加。`role="switch"` ＋ `aria-checked` ＋ `aria-label`、`<html data-theme="...">` 切替、`localStorage` 永続化（キー `inbusket.theme`）、try/catch でプライベートモード安全。 |
| TASK-005 | `score.ts` モード別集計関数＋テスト  | 田中       | 3       | [project/front/src/domain/score.ts](../../project/front/src/domain/score.ts) に `ModeScores` 型・`initialModeScores`・`addModeScore`・`ratePercent` 追加。除算ガード／全モード独立集計／イミュータブル。[score.test.ts](../../project/front/src/domain/score.test.ts) に 7 件追加（合計 13 件）。                       |
| TASK-010 | a11y チェックリスト雛形（A-10）      | 伊藤・高橋 | 2       | [project/docs/a11y_checklist.md](../../project/docs/a11y_checklist.md) 新規。DoD §9-1/9-2/9-3 を WCAG 2.1 AA 基準に展開（キーボード完結 1-1〜1-2 / フォーカス可視 2 / role/aria 3 / コントラスト比測定 4 / 色非依存 5 / レスポンシブ 6 / アニメーション 7 / SR 実機 8）。Sprint004 の試行スプリントで使用、Sprint004 レトロで運用化判断。 |

### 進行中タスク（Day2 へ継続）

- TASK-002（山本・5h 計画）: 配色変数素案完了、styles.css の Custom Properties 化途中（推定 3h 進捗）。
- TASK-007（中村・3h 計画）: HistoryView 件数切替 UI の骨格作成途中（推定 1.5h 進捗）。
- TASK-011（田中・中村・1h 計画）: 文書骨子合意。明朝 30 分で確定予定。

### Day1 完成の定義（DoD）チェック - TASK-001 / TASK-005 観点

- 1-1 型エラーゼロ: ✅（`tsc -b` 正常終了）
- 1-2 ESLint 0 エラー 0 警告: ✅（`pnpm lint` パス）
- 1-3 ペアレビュー: ✅（伊藤↔田中で相互確認、TASK-001 は田中レビュー、TASK-005 は伊藤レビュー）
- 2-1 主要ロジックの単体テスト全件成功: ✅（`pnpm test` = 7 files / 59 tests passed）
- 2-2 受入基準の手動動作確認: ✅（テーマ切替で `<html data-theme>` 反映、リロードで永続化、状態非リセット確認。Day3〜4 で a11y チェックリスト全項目を再点検予定）
- 5-2 シークレット非ハードコード: ✅
- 9-1 キーボード操作完結: ✅（テーマ切替トグル Tab → Space/Enter で動作）
- 9-2 フォーカス可視: ✅（`:focus-visible` アウトライン定義済）
- 9-3 適切な role/aria: ✅（`role="switch"` ＋ `aria-checked` ＋ `aria-label`）

> ※ TASK-001 のうち WCAG AA コントラスト比検証は TASK-002（テーマ別変数化）完了後の Day2 〜 Day3 に a11y_checklist.md §4 で実施。テーマ切替自体の Done 判定は PBI-019 全体（TASK-001〜004）完了時に行う。

### 障害物（追加なし）

- なし。`impediment_log.csv` への記録は不要。

### Day2 申し送り（高橋まとめ）

- TASK-002 / TASK-007 / TASK-011 を Day2 に継続。
- TASK-005 完了により PBI-021 の UI 結線（TASK-006）に Day2 早朝着手可能（伊藤）。
- TASK-001 完了により PBI-019 の最終結線（TASK-004 localStorage 結線テスト）が Day2 中盤以降に可能（田中）。
- a11y チェックリスト（§4 コントラスト比）は TASK-002 完了直後から段階的に試行する。

---

## Day 2 - 2026-05-21（木）

ファシリテーター: 高橋（SM） / 場所: オンライン / 開始: 09:30 / 終了: 09:43

### 共有事項（朝イチ）

- 高橋（SM）: 本日のメイン。TASK-002（CSS 変数化, 山本）/ TASK-006（ScoreCounter 拡張, 伊藤）/ TASK-011（PR チェックリスト文書化, 田中・中村）。Day1 の TASK-005 完了で PBI-021 の UI 結線が即着手可能。
- 高橋（SM）: handoff_for_helpers.md を 09:00 に山本・中村へ再共有済（A-8 適用）、09:25 受領確認。

### 伊藤（開発者）

- **昨日**: TASK-001（ThemeToggle UI 実装＋App 結線）完了、TASK-010（a11y 雛形）完了。
- **今日**:
  - TASK-006（`ScoreCounter` モード別表示拡張、3h）に着手し本日中に完了させる。
  - 田中による TASK-002 styles.css 変数化のレビュア兼任。
  - 余力で TASK-012（PBI-023〜028 リファインメント）の鈴木との論点整理を継続。
- **障害物**: なし。

### 田中（開発者）

- **昨日**: TASK-005（`score.ts` モード別集計関数＋テスト 7 件追加）完了。
- **今日**:
  - TASK-011（A-11 PR チェックリスト文書化、1h、中村と共同）を午前中に確定。
  - 山本がスタイル本体に集中するため、`ScoreCounter` 用テスト追加（react-dom/server `renderToStaticMarkup` 利用）と App.tsx 結線（modeScores state 化）を伊藤と分担して支援。
  - 一次情報重視の方針で WCAG 2.1 AA コントラスト比基準と GitHub Primer のテーマトークン設計を再確認、styles 変数命名へフィードバック。
- **障害物**: なし。

### 山本（助っ人開発者）

- **昨日**: TASK-002 着手・配色変数素案（推定 3h 進捗）。
- **今日**:
  - TASK-002（styles.css の CSS Custom Properties 化、残 2h）を午前で完了予定。
  - `:root[data-theme="light"]` / `:root[data-theme="dark"]` 切替で全コンポーネントを変数参照に置換。WCAG 2.1 AA コントラスト比 4.5:1 以上を確保。
  - 完了後 Day3 で TASK-003（A/B/C 記号併記）と TASK-009（履歴コントラスト改修）に着手予定。
- **障害物**: なし。

### 中村（助っ人開発者）

- **昨日**: TASK-007（履歴件数 10/20 切替 UI）骨格作成（推定 1.5h 進捗）。
- **今日**:
  - TASK-011（A-11 文書化、1h、田中と共同）を午前で完了。
  - TASK-007 の残実装（HistoryView 拡張・セッション内保持・モバイル幅レイアウト）を午後継続、Day3 朝までに結線完了見込み。
- **障害物**: なし。

### 高橋（SM）

- **昨日**: TASK-010（a11y 雛形）完了。
- **今日**:
  - 助っ人 2 名の handoff フォロー継続。
  - TASK-002 完了後にライト/ダーク双方の手動コントラスト比測定をペア試行（a11y_checklist.md §4 の試行運用）。
  - 障害物検知監視と PBI-023〜028 リファインメントの場のセッティング（Day4 集中対応）。
- **障害物**: なし。

### 計画の調整

- 順序確認: PBI-019 の TASK-002（CSS 変数化）を本日先行完了させ、後続の TASK-003 / TASK-009 / TASK-004 を Day3〜Day4 で消化する。
- バーンダウン目標: Day2 終了時点で残タスク 6 / 残ポイント 3（計画通り）。今日のキャパは合計約 13h（伊藤 4h / 田中 3h / 山本 3h / 中村 3h）。

### 障害物

- なし。`impediment_log.csv` への新規追加なし。

---

## Day 2 終了時インクリメント作成記録

09:43 のデイリースクラム後、各担当が並行作業に着手。Day2 終了時点（18:00）の達成状況を以下に記録する。

### 達成タスク（Done）

| タスクID | タイトル                                       | 担当         | 実績(h) | 成果物                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------- | ---------------------------------------------- | ------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-002 | styles.css のテーマ別 CSS Custom Properties 化 | 山本         | 5       | [project/front/src/styles.css](../../project/front/src/styles.css) を全面リライト。`:root[data-theme="light"]` / `:root[data-theme="dark"]` でテーマトークン（`--color-bg` / `--color-text` / `--color-text-muted` / `--color-surface` / `--color-primary` / `--color-success` / `--color-danger` 等 計 17 種）を定義。全コンポーネント（ScoreCounter / CaseView / AnswerButtons / ExplanationView / HistoryView / ModeSelector / ThemeToggle / actions / footer）の色値を変数参照へ置換。コントラスト比は §4 a11y チェックリストで一次測定（ライト本文 12.6:1、ダーク本文 14.5:1、ライト muted 4.83:1、ダーク muted 6.7:1、いずれも AA 4.5:1 を上回る）。 |
| TASK-006 | `ScoreCounter` モード別表示拡張                | 伊藤・田中   | 3       | [project/front/src/ui/ScoreCounter.tsx](../../project/front/src/ui/ScoreCounter.tsx) に `modeScores?: ModeScores` ＋ `currentMode?: FilterMode` プロパティ追加。現在モードに応じて「`<モードラベル>` 正答 / 出題 (正答率%)」を表示。0 件モードは `(-)` 表記で NaN 回避。`aria-live="polite"` 維持・`aria-label` にモード名・正答数・出題数・正答率を含めて SR 通知。後方互換のため `modeScores` 未指定時は従来表示。[App.tsx](../../project/front/src/App.tsx) に `modeScores` state（`initialModeScores`）と `addModeScore` 結線を追加。新規テスト 5 件（[ScoreCounter.test.tsx](../../project/front/src/ui/ScoreCounter.test.tsx)）を `react-dom/server.renderToStaticMarkup` ベースで追加（外部 testing ライブラリ非依存）。 |
| TASK-011 | A-11 PR チェックリスト文書化                   | 田中・中村   | 1       | [project/docs/pr_checklist.md](../../project/docs/pr_checklist.md) 新規。前提 / DoD §1〜§9 / 案件データ追加時の A・B・C 30% 以上比率検証 / `case_pattern_mapping.md` 更新ルール / コミット体裁を 9 セクションで網羅。Sprint004 レトロで運用化判断する試行版（v0.1.0）。 |

### 進行中タスク（Day3 へ継続）

- TASK-003（山本・3h 計画）: TASK-002 完了直後の Day3 朝に着手予定（A/B/C 表示の色＋記号 ◎/○/△ 併記）。
- TASK-004（田中・2h 計画）: localStorage 永続化＋切替時状態保持の結線テスト、Day3 で TASK-002 上に実施。
- TASK-007（中村・3h 計画）: HistoryView 件数切替 UI、骨格＋αまで進行（推定 2.5h 進捗）。Day3 朝に完了見込み。
- TASK-008（中村・2h 計画）: TASK-007 完了後 Day3 で着手。
- TASK-009（山本・3h 計画）: TASK-003 完了後 Day3〜Day4 で着手。
- TASK-012（鈴木・伊藤・3h 計画）: PBI-023〜028 リファインメント、Day4 集中対応。

### Day2 完成の定義（DoD）チェック - TASK-002 / TASK-006 / TASK-011 観点

- 1-1 型エラーゼロ: ✅（`pnpm build` = `tsc -b && vite build` 成功 / dist/assets/index-*.js 169.08 kB）
- 1-2 ESLint 0 エラー 0 警告: ✅（`pnpm lint` パス）
- 1-3 ペアレビュー: ✅（TASK-002 は山本→伊藤レビュー、TASK-006 は伊藤↔田中相互レビュー、TASK-011 は田中↔中村相互レビュー）
- 2-1 主要ロジックの単体テスト全件成功: ✅（`pnpm test` = 8 files / 64 tests passed、ScoreCounter 5 件追加で 59→64）
- 2-2 受入基準の手動動作確認: ✅（テーマ切替で `<html data-theme>` がライト/ダーク双方で全コンポーネント反映、モード切替で ScoreCounter ラベル・正答率連動、0 件モードで `(-)` 表示。Day3〜4 で a11y チェックリスト全項目を最終点検予定）
- 5-2 シークレット非ハードコード: ✅
- 7-1 レスポンシブ: ✅（既存 `@media (max-width: 480px)` ブロック維持）
- 9-1 キーボード操作完結: ✅（Day1 から後退なし）
- 9-2 フォーカス可視: ✅（`:focus-visible` を `var(--color-focus-ring)` 化、ライト #0969da / ダーク #79c0ff）
- 9-3 適切な role/aria: ✅（ScoreCounter の `aria-label` をモード情報込みに動的生成、`aria-live="polite"` 維持）
- 9-2 色のみで意味を伝えない: 🟡 部分対応（履歴は ○/× 記号 + 優先度テキスト併記済。A/B/C 回答ボタンの記号併記は TASK-003 / Day3 で完了予定）

### 障害物（追加なし）

- なし。`impediment_log.csv` への記録は不要。

### Day3 申し送り（高橋まとめ）

- TASK-002 完了により、PBI-019 完了に必要な残作業は TASK-003（山本）/ TASK-004（田中）の 2 タスクのみ。
- TASK-006 完了により PBI-021 は受入基準ベースで完了見込み（Day3 a11y 最終点検後に Done 判定）。
- TASK-007 を Day3 朝に完了 → TASK-008 着手で PBI-020 を Day3 内に完了見通し。
- 一次情報確認方針（WCAG 2.1 AA / GitHub Primer トークン）が機能。Day3 もコントラスト比は a11y_checklist.md §4 手順で都度実測する。

