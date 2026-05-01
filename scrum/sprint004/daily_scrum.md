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

---

## Day 3 - 2026-05-22（金）

ファシリテーター: 高橋（SM） / 場所: オンライン / 開始: 09:30 / 終了: 09:42

### 共有事項（朝イチ）

- 高橋（SM）: 本日のメイン。TASK-003（A/B/C 記号併記、山本）/ TASK-007（履歴件数切替UI、中村）/ TASK-008（履歴件数切替テスト、中村）。Day2 終了時点で残タスク 6 / 残ポイント 3 の計画通り。
- 高橋（SM）: handoff_for_helpers.md を 09:00 に山本・中村へ再共有済（A-8 適用）、09:25 受領確認。

### 伊藤（開発者）

- **昨日**: TASK-006（ScoreCounter モード別表示拡張）完了。
- **今日**:
  - 山本の TASK-003（AnswerButtons 記号併記）／中村の TASK-007/008（履歴件数切替）のレビュア兼任。
  - 田中の TASK-004 結線テスト（PBI-019 最終結線）の支援。
  - 余力で TASK-012（PBI-023〜028 リファインメント）の鈴木との論点整理を継続。
- **障害物**: なし。

### 田中（開発者）

- **昨日**: TASK-011（PR チェックリスト文書化）完了、TASK-006 ペアレビュー完了。
- **今日**:
  - TASK-004（localStorage 永続化＋切替時状態保持の結線テスト、2h）に着手し Day3 中に完了させる。
  - 中村の TASK-007/008 レビュア兼任。
  - history.ts 拡張（pushHistory に max 引数追加・trimHistory 追加）の API 設計レビュー。
- **障害物**: なし。

### 山本（助っ人開発者）

- **昨日**: TASK-002（styles.css のテーマ別 CSS Custom Properties 化）完了。
- **今日**:
  - TASK-003（AnswerButtons 記号併記、3h）に着手し午前中に完了させる。
    - PRIORITIES に `symbol`（◎/○/△）と `name`（最優先/中優先/低優先）を追加。
    - ボタン内に letter＋symbol＋name＋hint の4階層を表示。aria-label を `「A 最優先（緊急かつ重要）」` 形式に。
    - 記号は `var(--color-primary)` 色を採用、選択時は `--color-text` に切替えコントラスト確保（AA 4.5:1 以上は a11y_checklist.md §4 で実測予定）。
  - 完了後、Day4 で TASK-009（履歴コントラスト改修）に着手予定。
- **障害物**: なし。一次情報として WCAG 2.1 AA SC 1.4.1（色の使用）と SC 1.4.11（非テキストコントラスト 3:1）を再確認、記号と本文両方で識別可能になることを確認済。

### 中村（助っ人開発者）

- **昨日**: TASK-007 骨格作成（推定 2.5h 進捗）。
- **今日**:
  - TASK-007（履歴件数 10/20 切替UI＋HistoryView 拡張＋セッション内保持、残 0.5h）を午前で完了。
    - HistoryView に `maxDisplay?: number` プロパティ追加（デフォルト MAX_HISTORY=10）。
    - App.tsx に `historyLimit: HistoryLimit (10|20)` state を追加し、ラジオボタン UI で切替（`fieldset` + `legend` + 各 input に `aria-label`）。
    - history.ts を拡張し `pushHistory(prev, item, max)` の第3引数で上限を受け取れるように（既存挙動は省略時 10 で完全互換）。`trimHistory` を追加し縮小時の補正に使用。
    - セッション内のみ保持（localStorage 不要）。リロードで 10件 復帰。
  - TASK-008（履歴件数切替テスト、2h）に午後着手。
    - HistoryView.test.tsx 新規作成（9件追加、合計 73 テスト）。
    - maxDisplay=10 / maxDisplay=20 / 切詰め / 0件 / aria-live を網羅。
    - history.ts 既定（max=10）下では maxDisplay=20 でも最大10件、pushHistory(max=20) で20件保持・表示できることを別ケースで確認（受入基準クリア）。
    - trimHistory（20→10 切替時の末尾優先補正）も同ファイルでテスト。
- **障害物**: なし。

### 高橋（SM）

- **昨日**: 助っ人2名 handoff フォローと TASK-002 完了後の手動コントラスト比測定ペア試行を実施。
- **今日**:
  - 助っ人 2 名の handoff フォロー継続。
  - TASK-003 完了後に AnswerButtons の記号＋色＋テキスト3冗長化を a11y_checklist.md §5（色非依存識別）で再点検。
  - 障害物検知監視と PBI-023〜028 リファインメントの場のセッティング（Day4 集中対応）。
- **障害物**: なし。

### 計画の調整

- 順序確認: TASK-003（PBI-019）/ TASK-007・008（PBI-020）を Day3 で並列消化、TASK-004（PBI-019 最終結線）は Day3 後半 〜 Day4 朝。Day4 で TASK-009（PBI-022）に山本が集中、伊藤・鈴木で TASK-012 リファインメント。
- バーンダウン目標: Day3 終了時点で残タスク 3 / 残ポイント 1（計画通り）。今日のキャパは合計約 13h（伊藤 3h / 田中 3h / 山本 3h / 中村 4h）。

### 障害物

- なし。`impediment_log.csv` への新規追加なし。

---

## Day 3 終了時インクリメント作成記録

09:42 のデイリースクラム後、各担当が並行作業に着手。Day3 終了時点（18:00）の達成状況を以下に記録する。

### 達成タスク（Done）

| タスクID | タイトル                                                                       | 担当   | 実績(h) | 成果物                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------ | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-003 | A/B/C 表示の色＋記号(◎/○/△)・テキスト併記対応                                 | 山本   | 3       | [project/front/src/ui/AnswerButtons.tsx](../../project/front/src/ui/AnswerButtons.tsx) を拡張し PRIORITIES に `symbol` と `name` を追加。ボタン内を letter（A/B/C）＋symbol（◎/○/△）＋name（最優先/中優先/低優先）＋hint（緊急かつ重要…）の4階層表示に。`aria-label` を `「A 最優先（緊急かつ重要）」` 形式へ。[styles.css](../../project/front/src/styles.css) に `.answer-buttons__letter` `.answer-buttons__symbol` `.answer-buttons__name` を新設し、記号は `var(--color-primary)` ベース／選択時は `var(--color-text)` でコントラスト切替。佐藤フィードバック4（色覚多様性配慮）を反映。 |
| TASK-007 | 履歴件数 10/20 切替UI＋HistoryView 拡張＋セッション内保持                      | 中村   | 3       | [project/front/src/domain/history.ts](../../project/front/src/domain/history.ts) を拡張し `HISTORY_LIMIT_OPTIONS` `HistoryLimit` 型を追加、`pushHistory(prev, item, max=MAX_HISTORY)` で上限を引数化（既存テスト 8 件は完全互換維持）。`trimHistory(history, max)` を追加。[HistoryView.tsx](../../project/front/src/ui/HistoryView.tsx) に `maxDisplay?: number` プロパティ追加（既定 10）。[App.tsx](../../project/front/src/App.tsx) に `historyLimit` state ＋ラジオボタン `<fieldset>` UI 追加（`aria-label` 必須）。縮小時 `trimHistory` で末尾優先補正、カウンタ・モードは非リセット。[styles.css](../../project/front/src/styles.css) に `.history-limit` 系クラスを CSS 変数ベースで追加。 |
| TASK-008 | 履歴件数切替UIテスト＋切替時の履歴・カウンタ非初期化テスト                     | 中村   | 2       | [project/front/src/ui/HistoryView.test.tsx](../../project/front/src/ui/HistoryView.test.tsx) を新規作成（9 件、合計 73 テスト）。①maxDisplay 省略時の MAX_HISTORY 等価動作 ②maxDisplay=10 で10件表示 ③history.ts 既定（max=10）下では maxDisplay=20 でも最大10件 ④`pushHistory(max=20)` で 20件保持・表示 ⑤切詰め時の末尾（最新）優先 ⑥0件時のガイド文 ⑦`aria-live="polite"` 維持 ⑧`trimHistory` ≤max ⑨`trimHistory` 20→10 末尾優先 を網羅。`react-dom/server.renderToStaticMarkup` ベースで外部testing依存ゼロ。 |

### 進行中タスク（Day4 へ継続）

- TASK-004（田中・2h 計画）: 17:30 時点で結線テスト雛形作成中（推定 1h 進捗）。Day4 朝までに完了見込み。
- TASK-009（山本・3h 計画）: TASK-003 完了済のため Day4 朝着手。
- TASK-012（鈴木・伊藤・3h 計画）: Day4 集中対応。

### Day3 完成の定義（DoD）チェック - TASK-003 / TASK-007 / TASK-008 観点

- 1-1 型エラーゼロ: ✅（`pnpm build` = `tsc -b && vite build` 成功 / dist/assets/index-*.js 170.12 kB）
- 1-2 ESLint 0 エラー 0 警告: ✅（`pnpm lint` パス）
- 1-3 ペアレビュー: ✅（TASK-003 は山本→伊藤レビュー、TASK-007/008 は中村↔田中相互レビュー）
- 2-1 主要ロジックの単体テスト全件成功: ✅（`pnpm test` = 9 files / 73 tests passed、HistoryView 9 件新規追加で 64→73。既存 64 件は全件継続 PASS）
- 2-2 受入基準の手動動作確認: ✅（A/B/Cボタンが記号◎/○/△＋名称＋ヒントで色非依存に識別可能、履歴件数 10⇔20 ラジオ切替でカウンタ・モード非初期化、20→10 縮小時に末尾10件のみ残ることを確認。Day4 で a11y チェックリスト全項目を最終点検）
- 5-2 シークレット非ハードコード: ✅
- 7-1 レスポンシブ: ✅（既存 `@media (max-width: 480px)` ブロック維持。`.history-limit` は `flex-wrap` で折返し対応）
- 9-1 キーボード操作完結: ✅（ラジオボタンは Tab 移動＋ Space で選択切替、HTML ネイティブ挙動）
- 9-2 フォーカス可視: ✅（`.history-limit__option input[type='radio']:focus-visible` で `var(--color-focus-ring)` アウトライン定義）
- 9-3 適切な role/aria: ✅（`<fieldset>` ＋ `<legend>` ＋ 各 input に `aria-label`、AnswerButtons の `aria-label` を意味込み形式に変更）
- 9-2 色のみで意味を伝えない: ✅（A/B/C ボタンに記号◎/○/△＋名称テキスト併記、履歴の○/×＋優先度文字併記と合わせ Sprint004 の 9-2 観点は全面解消）

### 障害物（追加なし）

- なし。`impediment_log.csv` への記録は不要。

### Day4 申し送り（高橋まとめ）

- PBI-020 は TASK-007・008 完了で受入基準クリア。Day4 朝の a11y 最終点検後に Done 判定。
- PBI-019 は TASK-003 完了済、残 TASK-004（田中、進行中）。Day4 朝完了見込みで PBI-019 Done 判定可能。
- PBI-022（履歴コントラスト改修・TASK-009）は Day4 朝から山本が着手、TASK-003 で確立した「色＋記号＋テキスト」3冗長化パターンを履歴セルにも適用予定。
- TASK-012（PBI-023〜028 リファインメント）は Day4 午後に鈴木・伊藤で集中対応。
- 73 テスト全件 PASS / lint 0 / build OK。Day3 時点でバーンダウンは計画通り（残3タスク・残1pt）。





---

## Day 4 - 2026-05-25（月）

ファシリテーター: 高橋（SM） / 場所: オンライン / 開始: 09:30 / 終了: 09:43

### 共有事項（朝イチ）

- 高橋（SM）: 本日のメイン。TASK-004（テーマ永続化テスト, 田中）/ TASK-009（履歴コントラスト改修, 山本）/ TASK-012（PBI-023〜028 リファインメント, 鈴木・伊藤）。Day3 終了時点で残タスク 3 / 残ポイント 1 の計画通り。
- 高橋（SM）: handoff_for_helpers.md を 09:00 に山本・中村へ再共有済（A-8 適用）、09:25 受領確認。
- 高橋（SM）: Day4 完了で計画 6pt 全消化見込み。Day5 はスプリントレビュー／レトロに専念。

### 伊藤（開発者）

- **昨日**: TASK-003/007/008 のレビュア兼任完了、PBI-021 の最終確認完了。
- **今日**:
  - TASK-012（PBI-023〜028 リファインメント、鈴木と共同 3h）に午後集中。scrum/product_backlog.csv の受入基準・備考更新を担当。
  - 田中の TASK-004（ThemeToggle 永続化テスト）/ 山本の TASK-009（履歴コントラスト改修）のレビュア兼任。
  - Day5 スプリントレビュー資料の準備（PBI-019/020/021/022 の Done 報告）。
- **障害物**: なし。

### 田中（開発者）

- **昨日**: 結線テスト雛形作成（Day3 17:30 時点で 1h 進捗）。
- **今日**:
  - TASK-004（ThemeToggle 永続化・状態保持テスト、残 1h）を午前で完了。
    - project/front/src/ui/ThemeToggle.test.tsx を新規作成（5 件追加、合計 78 テスト）。
    - localStorage からの dark/light 復元、無効値フォールバック、クリックでの切替、ria-checked と <html data-theme> と localStorage の同期、ole=\"switch\" ＋ ria-label の SSR 検証を網羅。
    - jsdom + eact-dom/client + ct で useEffect の永続化処理まで検証（IS_REACT_ACT_ENVIRONMENT=true を設定し warning を解消）。
    - テストの分離（eforeEach/fterEach で localStorage と <html data-theme> をクリーン化）を徹底し副作用混入なし。
  - 一次情報重視で React 18.3 の ct 仕様（react 直接 export）と vitest jsdom 環境の対応を再確認。
  - TASK-012 の伊藤・鈴木のレビュア兼任（cases.json 拡張方針への影響評価）。
- **障害物**: なし。

### 山本（助っ人開発者）

- **昨日**: TASK-003（A/B/C 記号併記）完了。
- **今日**:
  - TASK-009（履歴コントラスト改修、3h）に着手し本日中に完了。
    - project/front/src/styles.css のテーマトークンに履歴セル専用変数を 5 種追加（--color-history-icon-correct/incorrect、--color-history-priority-correct/incorrect/neutral）。ライト/ダーク双方で一次情報（WebAIM Contrast Checker）に基づき実測。
    - 正答セル: ライト 9.3:1（icon）/ 8.4:1（priority）、ダーク 9.0:1（icon）/ 11.2:1（priority）。誤答セル: ライト 9.7:1 / 8.6:1、ダーク 8.1:1 / 9.5:1。すべて WCAG AA 4.5:1 を上回る。
    - .history-view__priority を従来の --color-text-muted（背景非依存）から状態別の専用変数へ切替。ont-size を 0.8 → 0.85rem に微増し可読性向上。
    - 色非依存（DoD 9-2）は既存の judgementLabel（○/×）＋優先度文字（A/B/C）＋ ria-label（「○問目 正解 正解優先度A」）の3冗長化を維持。
  - PBI-019（テーマ設計）と PBI-022（履歴コントラスト）が同じ CSS Custom Properties 体系で統合され、二重メンテにならないことを伊藤と確認。
- **障害物**: なし。

### 中村（助っ人開発者）

- **昨日**: TASK-007/008（履歴件数切替 UI ＋テスト）完了。
- **今日**:
  - 自分の担当タスクは Day3 までに全完了（TASK-007/008/011）。
  - 田中の TASK-004（ThemeToggle テスト）レビュア兼任、jsdom + eact-dom/client + ct パターンの一次情報確認（React 公式ドキュメント ct API、vitest jsdom 環境設定）に協力。
  - 山本の TASK-009（履歴コントラスト改修）レビュア兼任、CSS 変数命名と既存テーマトークンとの整合確認。WebAIM Contrast Checker の実測値を独立検証し AA 基準クリアを確認。
  - 余力で Day5 スプリントレビュー用の動作確認シナリオ（PBI-019/020/021/022 受入基準ベース）を伊藤と共有。
- **障害物**: なし。

### 高橋（SM）

- **昨日**: 助っ人 2 名 handoff フォロー、AnswerButtons 記号併記の a11y_checklist.md §5 再点検完了。
- **今日**:
  - 助っ人 2 名の handoff フォロー継続。
  - TASK-009 完了後にライト/ダーク双方で 11y_checklist.md §4（コントラスト比測定手順）を最終試行。Sprint004 の §9 a11y 適用を完結。
  - TASK-012 ファシリ（鈴木・伊藤の論点整理 → product_backlog.csv 反映）。
  - Day5 のスプリントレビュー／レトロ準備。
- **障害物**: なし。

### 計画の調整

- 順序確認: TASK-004 → TASK-009 → TASK-012 の順で午前→午後に消化。テスト・lint・build を都度回し回帰なしを担保。
- バーンダウン目標: Day4 終了時点で残タスク 0 / 残ポイント 0（計画通り）。今日のキャパは合計約 8h（伊藤 3h / 田中 2h / 山本 3h、中村は予備）。

### 障害物

- なし。impediment_log.csv への新規追加なし。

---

## Day 4 終了時インクリメント作成記録

09:43 のデイリースクラム後、各担当が並行作業に着手。Day4 終了時点（18:00）の達成状況を以下に記録する。

### 達成タスク（Done）

| タスクID | タイトル                                                                       | 担当       | 実績(h) | 成果物                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------ | ---------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-004 | ThemeToggle 永続化・状態保持テスト                                             | 田中       | 2       | [project/front/src/ui/ThemeToggle.test.tsx](../../project/front/src/ui/ThemeToggle.test.tsx) 新規（5 件、合計 78 テスト）。jsdom + eact-dom/client + ct で useEffect も含めて検証。①dark 復元 ②light 復元 ③無効値→light フォールバック ④クリックで light↔dark トグル＋localStorage＋<html data-theme> 同期 ⑤role=\"switch\" / aria-label の SSR 維持。IS_REACT_ACT_ENVIRONMENT=true 設定で warning ゼロ。各テスト前後で localStorage と <html data-theme> をクリーン化。 |
| TASK-009 | 履歴○/×・正解優先度ラベルのライト/ダーク両対応コントラスト改修＋色非依存       | 山本       | 3       | [project/front/src/styles.css](../../project/front/src/styles.css) に履歴セル専用変数 5 種を追加（--color-history-icon-correct/incorrect、--color-history-priority-correct/incorrect/neutral）。ライト/ダーク双方で WCAG AA 4.5:1 以上を一次測定で確認（最低 8.1:1 / 最高 11.2:1）。.history-view__item--correct/incorrect 配下で mark と priority を独立変数で上書き、PBI-019 のテーマトークン体系と統合（二重メンテなし）。色非依存（○/× ＋ A/B/C ＋ aria-label）の 3 冗長化維持。 |
| TASK-012 | PBI-023〜028 リファインメント                                                  | 鈴木・伊藤 | 3       | [scrum/product_backlog.csv](../../scrum/product_backlog.csv) を更新。①PBI-023: localStorage スコープ外で確定（order004 確認事項1）、Refinement→**Ready** ②PBI-024: cases.json 拡張で確定（確認事項2）、オプショナルフィールド明示、Ready ③PBI-025: 回答後都度入力で確定（確認事項3）、入力スキップ可、Ready ④PBI-026: PBI-025 との役割分担明示、Ready ⑤PBI-027: 20 問・90 分固定で確定（確認事項4）、visibilitychange 対応追加、Ready ⑥PBI-028: cases.json 拡張・PBI-024 と整合、Ready。PBI-029/030 は依存先 PBI 完了後の段階導入として Refinement 維持。 |

### 進行中タスク（Day5 へ継続）

- なし。Sprint004 計画タスク（TASK-001〜012）すべて Done。Day5 はスプリントレビュー／レトロに専念。

### Day4 完成の定義（DoD）チェック - TASK-004 / TASK-009 観点

- 1-1 型エラーゼロ: ✅（pnpm build = 	sc -b && vite build 成功 / dist/assets/index-*.js 170.12 kB / dist/assets/index-*.css 9.19 kB）
- 1-2 ESLint 0 エラー 0 警告: ✅（pnpm lint パス）
- 1-3 ペアレビュー: ✅（TASK-004 は田中→中村レビュー、TASK-009 は山本→中村レビュー、TASK-012 は鈴木↔伊藤相互レビュー）
- 2-1 主要ロジックの単体テスト全件成功: ✅（pnpm test = 10 files / 78 tests passed、ThemeToggle 5 件新規追加で 73→78。既存 73 件は全件継続 PASS）
- 2-2 受入基準の手動動作確認: ✅（テーマ切替で localStorage 永続化＋リロード復元、ライト/ダーク双方で履歴セルのコントラストが視認しやすく改善されたことを目視確認、a11y_checklist.md §4 で実測値ライト 8.4-9.7:1 / ダーク 8.1-11.2:1 を記録）
- 5-2 シークレット非ハードコード: ✅
- 7-1 レスポンシブ: ✅（既存 @media (max-width: 480px) ブロック維持。履歴セル font-size 微増の影響なし）
- 9-1 キーボード操作完結: ✅（テーマ切替トグル Tab → Space/Enter で動作、リグレッションなし）
- 9-2 フォーカス可視: ✅（既存 :focus-visible で ar(--color-focus-ring) アウトライン維持）
- 9-3 適切な role/aria: ✅（テスト 5 件目で ole=\"switch\" ＋ ria-label 必須化を SSR で恒久検証）
- 9-2 色のみで意味を伝えない: ✅（履歴セル ○/× ＋ 優先度文字 ＋ aria-label の 3 冗長化を CSS 変数刷新後も維持）

### Sprint004 計画 PBI 完了判定

| PBI ID  | タイトル                       | 受入基準クリア | 完成の定義 18 項目 | Done 判定 |
| ------- | ------------------------------ | -------------- | ------------------ | --------- |
| PBI-019 | ダーク/ライトテーマ切替        | ✅ 全 7 基準   | ✅ 18/18           | **Done**  |
| PBI-020 | 履歴表示件数の選択 10/20       | ✅ 全 7 基準   | ✅ 18/18           | **Done**  |
| PBI-021 | モード別正答率の集計表示       | ✅ 全 6 基準   | ✅ 18/18           | **Done**  |
| PBI-022 | 履歴コントラスト見直し WCAG AA | ✅ 全 5 基準   | ✅ 18/18           | **Done**  |

> 計画 6pt 全消化（PBI-019: 2pt + PBI-020: 1pt + PBI-021: 2pt + PBI-022: 1pt）。Day5 スプリントレビューでステークホルダー（顧客 佐藤）に提示。

### 障害物（追加なし）

- なし。impediment_log.csv への記録は不要（Sprint004 中の障害物発生はゼロ）。

### Day5 申し送り（高橋まとめ）

- Sprint004 計画タスク 12 件すべて Done。バーンダウン計画通り（残 0）。
- Day5 はスプリントレビュー（午前）／レトロ（午後）に専念。レビューは PBI-019/020/021/022 の受入確認をライト・ダーク両テーマで実機デモ。
- PBI-023〜028 が Ready 化済（PBI-023: 3pt / PBI-024: 3pt / PBI-025: 3pt / PBI-026: 2pt / PBI-027: 3pt / PBI-028: 2pt = 計 16pt の Ready 在庫）。Sprint005 プランニングはこの中から PO 鈴木が選択する。
- 78 テスト全件 PASS / lint 0 / build OK。Sprint004 の品質ゲートは全クリア。
- a11y チェックリスト雛形（A-10）の試行運用が完結。レトロで運用化判断する。
- A-11（PR チェックリスト）も Sprint004 で運用試行完了。レトロで継続運用判断する。




---

## Day 5 - 2026-05-26（火）

ファシリテーター: 高橋（SM） / 場所: オンライン / 開始: 09:30 / 終了: 09:40

### 共有事項（朝イチ・最終日）

- 高橋（SM）: Sprint004 最終日。計画タスク 12 件すべて Day4 までに Done。本日は最終品質確認・微修正・スプリントレビュー/レトロに専念する。
- 高橋（SM）: handoff_for_helpers.md は Day4 までで運用完結。Day5 は助っ人 2 名（山本・中村）も最終確認に協力するが新規実装は実施しない方針。

### 伊藤（開発者）

- **昨日**: TASK-012（PBI-023〜028 リファインメント）完了、Day4 申し送りで Sprint004 計画 PBI 全 Done 確認。
- **今日**:
  - 最終品質ゲート（pnpm test / lint / build / audit）の通し確認を全担当の見ている前で 1 回実施。
  - 全実装ファイルの最終チェック（未使用 import / console.* 残骸 / 不要コメント / サブタイトル日付ズレ等）。
  - スプリントレビュー（午前）で PBI-019/020/021/022 をライト/ダーク両テーマで実機デモ。
  - レトロ（午後）参加。
- **障害物**: なし。

### 田中（開発者）

- **昨日**: TASK-004（ThemeToggle 永続化テスト 5 件）完了。
- **今日**:
  - 78 テストの最終 PASS 確認、依存ライブラリ更新の差分なし確認（pnpm-lock.yaml 無変更）。
  - スプリントレビュー / レトロ参加。
- **障害物**: なし。

### 山本（助っ人開発者）

- **昨日**: TASK-009（履歴コントラスト改修）完了。
- **今日**:
  - レビュー / レトロは契約上不参加。
  - 最終品質確認のみ協力（a11y_checklist.md §4 のライト/ダーク両テーマの再測定値が Day4 記録から後退していないことを確認）。
- **障害物**: なし。

### 中村（助っ人開発者）

- **昨日**: 田中・山本のペアレビュー兼任。
- **今日**:
  - レビュー / レトロは契約上不参加。
  - 最終品質確認のみ協力（HistoryView の 10/20 切替がライト/ダーク両テーマで動作することを目視確認）。
- **障害物**: なし。

### 高橋（SM）

- **昨日**: TASK-009 完了後の a11y_checklist.md §4 最終試行、TASK-012 ファシリ完了。
- **今日**:
  - 最終品質ゲートの立会い記録、スプリントレビュー / レトロのファシリ。
  - impediment_log の最終確認（Sprint004 中の障害物発生ゼロを記録維持）。
- **障害物**: なし。

### 計画の調整

- Sprint004 計画 12 タスクすべて Done のため、Day5 はインクリメントの追加実装なし。最終品質確認と軽微な仕上げのみ実施。
- バーンダウン: Day5 終了時点で残タスク 0 / 残ポイント 0（計画通り）。

### 障害物

- なし。impediment_log.csv への新規追加なし。

---

## Day 5 終了時インクリメント作成記録（最終仕上げ）

09:40 のデイリースクラム後、最終品質確認と軽微な仕上げを実施。Day5 終了時点（17:00）の達成状況を以下に記録する。

### 最終品質ゲート結果

| 項目                          | 結果                                                    |
| ----------------------------- | ------------------------------------------------------- |
| pnpm test（vitest run）       | ✅ 10 files / **78 tests** passed（全件 PASS、回帰なし） |
| pnpm lint（eslint .）         | ✅ 0 エラー / 0 警告                                    |
| pnpm build（tsc -b && vite）  | ✅ 成功 / dist/assets/index-*.js 170.11 kB / index-*.css 9.19 kB |
| pnpm audit                    | ✅ No known vulnerabilities found                       |
| TypeScript 型エラー           | ✅ ゼロ（pnpm build が tsc -b で先行検証）              |
| 未使用 import / console.*     | ✅ 残骸なし（grep で console.log/debug/warn/error ゼロ）|

### Day5 軽微修正（最終仕上げ）

| ファイル                                                                 | 変更内容                                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| [project/front/src/App.tsx](../../project/front/src/App.tsx)             | サブタイトル「MVP 開発中 - Sprint 004 Day 3」→「MVP 開発中 - Sprint 004」に修正（Day3 表記の取り残しを除去）。再実行で 78 テスト / lint / build いずれも回帰なし。 |

### Sprint004 全 PBI 完了確認（最終）

| PBI ID  | タイトル                       | 受入基準 | DoD 18 項目 | Done 判定 |
| ------- | ------------------------------ | -------- | ----------- | --------- |
| PBI-019 | ダーク/ライトテーマ切替        | ✅       | ✅ 18/18    | **Done**  |
| PBI-020 | 履歴表示件数の選択 10/20       | ✅       | ✅ 18/18    | **Done**  |
| PBI-021 | モード別正答率の集計表示       | ✅       | ✅ 18/18    | **Done**  |
| PBI-022 | 履歴コントラスト見直し WCAG AA | ✅       | ✅ 18/18    | **Done**  |

> 計画 6pt 全消化。スプリントレビューでステークホルダー（顧客 佐藤）に提示する準備が整った。

### DoD 18 項目セルフチェック（Sprint004 全体）

- 1-1 型エラーゼロ: ✅ / 1-2 ESLint 0/0: ✅ / 1-3 ペアレビュー: ✅
- 2-1 単体テスト全件 PASS: ✅（78/78）/ 2-2 受入基準手動確認: ✅（PBI-019/020/021/022）
- 3-1 README 起動手順: ✅（既存維持）/ 3-2 案件JSONスキーマ: ✅（既存維持）
- 4-1 Chrome 動作: ✅ / 4-2 出題サイクル: ✅
- 5-1 pnpm audit: ✅ / 5-2 シークレット非ハードコード: ✅
- 6-1 出題切替 1秒以内: ✅
- 7-1 レスポンシブ: ✅ / 7-2 1〜2タップ完結: ✅
- 8-1 案件 JSON 管理: ✅
- 9-1 キーボード完結: ✅ / 9-2 フォーカス可視: ✅ / 9-3 role/aria: ✅

### 障害物（最終）

- なし。Sprint004 を通じて impediment_log.csv への新規追加ゼロ。

### Sprint004 完了サマリ

- 計画 12 タスク / 6pt すべて Done（Day4 までで完了、Day5 は最終仕上げのみ）。
- テスト 78 件 / lint 0 / build OK / audit クリーン。
- a11y チェックリスト（A-10）/ PR チェックリスト（A-11）の運用試行完了 → レトロで運用化判断。
- PBI-023〜028 が Ready（計 16pt）→ Sprint005 プランニングの選択肢として準備済。
