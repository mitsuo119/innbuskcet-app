# 助っ人向け handoff メモ - Sprint 005

> Sprint002 レトロ A-8 適用（双方向化）／Sprint004 レトロ A-16 適用（**還流欄構造化**）。
> プランニング/レビュー/レトロに参加できない山本・中村向けの 5分共有メモ。
> 共有日: 2026-05-27（水）朝のデイリー前。担当: 高橋（SM）／作成: 高橋・伊藤（TASK-013）。

## スプリントゴール

「『判断・理由・アクション』の合格答案の型を、模範回答骨格との比較とセットで反復できるようにし、昇進試験合格に直結する学習価値へ踏み込む（**DoD §10 入力検証・データ保護を初適用**）」

## 期間・コミット

- 2026-05-27（水）〜 2026-06-02（火）／実働5日。
- 計画 **6pt**（PBI-023 / PBI-024、2件）。A-18 容量バッファ枠の下限。
- ストレッチなし。PBI-027 は Sprint006 最優先で確定。

## 今スプリントの新ルール

- **DoD §10 入力検証・データ保護（10-1 / 10-2 / 10-3）を初適用**：全 PBI で判定（合計 19 項目→ §10 を含め 21 項目相当）。
  - 10-1: 入力境界値の単体テスト必須（最大長 500 / 型 / 必須・任意）
  - 10-2: `dangerouslySetInnerHTML` / `innerHTML` 禁止
  - 10-3: スキーマ整合性検証 + 不整合時の安全フォールバック
- **A-15 PR チェックリスト初運用**：cases.json 拡張 PR で `project/docs/pr_checklist.md` を初適用（A/B/C 30% 維持・スキーマ整合性確認）。
- **A-16 handoff 還流欄構造化（本ファイル）**：スプリント末申し送りをトピック別箇条書き＋PBI/TASK 紐付け形式で記録。

## 山本さん担当（合計 9h）

- TASK-002 (PBI-023, 5h): `WritingInput.tsx`：textarea×3（判断/理由/アクション）+ aria-label + 見出し + 例示 placeholder + 目安文字数補助
- TASK-003 (PBI-023, 4h): `WritingPreview.tsx`：3 ブロック並列プレビュー（React テキスト描画 / `dangerouslySetInnerHTML` 不使用 / DoD §10-2）

> Day4 で集中投下スワップ：a11y 検証担当の TASK-006 を山本へ移譲（実機 a11y 検証）／TASK-009 ModelAnswerView 実装は中村へ。

## 中村さん担当（合計 5h）

- TASK-007 (PBI-024, 4h): cases.json スキーマ拡張：`modelAnswer{judgment,reason,action}` + `scoringPoints[]` オプショナル追加（5〜10 件先行投入で段階移行検証）
- TASK-012 (PBI-024, 1h): A-15 初運用：cases.json 拡張 PR で `pr_checklist.md` を初適用（A/B/C 30% 維持＋スキーマ整合性確認）

> Day4 スワップで TASK-009 ModelAnswerView 実装も担当。

## 注意事項

- PBI-023 の `domain/writing.ts`（TASK-001 伊藤）は Day1 で完了予定。山本さんの TASK-002 は Day1 並走着手 OK。
- PBI-024 の `loader.ts` 検証（TASK-008 田中）は Day3 完了予定。中村さんの TASK-009 は完了後（Day4）に着手推奨。
- **DoD §10 が初適用です**：textarea の maxLength、入力欄の `<label htmlFor>` ＋ aria-label、プレビューは React テキスト描画限定。一次資料として React 公式の Forms ガイド（https://react.dev/reference/react-dom/components/textarea ）を参照してください。
- ショートカット A/B/C/Enter は textarea フォーカス中に**誤発火しない**実装（TASK-004 田中）が前提。WritingInput 実装時に動作確認を含めてください。
- 障害物に当たったら即 `scrum/impediment_log.csv` に追記、または高橋に連絡。

## 連絡窓口

- 仕様・優先度: 鈴木（PO）
- ブロッカー・調整: 高橋（SM）
- 実装相談: 伊藤・田中
- セキュリティ・DoD §10 解釈: 渡辺（必要時に高橋経由）

---

## Dev → 助っ人 申し送り欄（A-16 構造化還流欄／スプリント末に伊藤・田中が追記）

> Sprint005 のレビュー/レトロでの決定事項・佐藤フィードバックの要点を、Sprint006 開始前にここへトピック別箇条書き＋PBI/TASK 紐付けで追記してください。
> A-16 構造（Sprint004 レトロで合意）：
>
> - `[トピック] - [PBI/TASK 紐付け]: 内容` の形式
> - トピック例: 仕様変更 / 受入基準追加 / DoD 強化 / 技術的負債 / プロセス改善

### 仕様変更・受入基準追加

- _（Sprint005 レビューで佐藤・PO 鈴木から要望が出た場合に追記）_

### DoD 強化・新ルール適用

- _（Sprint005 レトロで DoD §10 適用評価・追加 §の合意がある場合に追記）_

### 技術的負債・スコープ調整

- **PBI-024 - TASK-009 (ModelAnswerView)**: バックログの「採点ポイントチェックボックス」「左右並列レイアウト（モバイル縦積み）」は Sprint005 の受入基準には含めず Sprint006 以降の拡張余地として残置（DAY4 計画調整 / 実装スコープ調整メモ）。
- **PBI-024 - TASK-008 (loader)**: DAY2 で throw 方式実装後、DAY3 で TASK-008 仕様（DoD §10-3 安全フォールバック）に整合させ undefined フォールバック + `console.warn` 通知に変更。

### プロセス改善

- **A-15 PR チェックリスト - TASK-012**: Sprint005 で初運用。`project/docs/pr_checklist.md` に DoD §10（§9 セクション）を追加し v0.2.0 に更新。cases.json 拡張 PR で A/B/C 30% 維持・スキーマ整合性検証を確認した。
- **A-16 handoff 還流欄構造化 - TASK-013**: 本ファイルでトピック別構造（仕様 / DoD / 負債 / プロセス）を試行。Sprint005 レトロで運用化を判断。
- **DoD §10 判定手順 - TASK-014**: 10-1（境界値テスト）/ 10-2（dangerouslySetInnerHTML 不使用）/ 10-3（スキーマ整合性）のエビデンスを daily_scrum.md に「DoD §10-X エビデンス」として日次記録する運用を整備。Sprint005 全 5 日で運用し、レトロで定着判断。
