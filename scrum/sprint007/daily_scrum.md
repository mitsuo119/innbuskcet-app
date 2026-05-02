# デイリースクラム - Sprint 007

## DAY 1 — 2026-06-10（水）

### 基本情報

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| 日時     | 2026-06-10（水）09:30 - 09:45                                             |
| 参加者   | 開発者: 伊藤・田中・山本・中村 / SM: 高橋（ファシリ）                     |
| タイムボックス | 15分                                                                |
| 沈黙チェック (A-30) | 未実施（Day2 / Day4 で初回実施予定）                          |

### 三つの問い

#### 伊藤（開発者）

- **昨日（プランニング）やったこと**:
  - Sprint007 プランニング参加。`domain/examTimer.ts` / `domain/feedback.ts` / `domain/feedbackKeywords.ts` の I/F 案を整理。
- **今日やること**:
  - **TASK-001**: `domain/examTimer.ts` 新設（純粋関数 + sessionStorage I/O 分離）+ vitest 境界値 20 件テスト。**完了**。
  - 並行で **TASK-002 着手分担**: `LearningStyle` 型 / `LEARNING_STYLES` の `'exam'` アクティベート（田中の `App.tsx` 状態遷移メモと突き合わせ）。**完了**。
  - 田中へ I/F 共有: `ExamSession`, `EXAM_TOTAL_QUESTIONS=20`, `EXAM_TIME_LIMIT_SECONDS=5400`, `createExamSession` / `getRemainingSeconds` / `isTimeUp` / `formatTime` / `saveExamSession` / `loadExamSession` / `clearExamSession`。
- **障害物**: なし。
- **メモ**: タイマー基準は当初 `performance.now()` 案だったが、「中断・再開を sessionStorage で復元する」要件と整合させるため、`Date.now()`（UNIX ms）ベースで `startedAt` を記録する設計に変更（タブ非表示でも実時間継続が成立。タイマー切替時の整合性が桁違いに楽になる）。タブ非表示中の挙動は Day2 にブラウザで確認予定。

#### 田中（開発者）

- **昨日（プランニング）やったこと**:
  - PBI-027 の `App.tsx` Exam 状態遷移整理メモを作成（Day1 共有）。
- **今日やること**:
  - **TASK-002 残**: Exam 開始確認モーダル「20 問 90 分の連続演習を開始します」の実装。伊藤の `LearningStyle = 'exam'` アクティベート完了を受けて結線着手。
  - **TASK-004 着手**: Exam セッション状態管理（`App.tsx` 状態遷移拡張・20 問固定ランダム出題・Quick/Deep 履歴非汚染）。`createExamSession()` を `pickNextCaseByMode` から独立した出題ループに組み込む方針。
- **障害物**: 中断・再開時の出題インデックス保持仕様を中村と Day1 終わりに 5 分すり合わせ希望（→ SM 高橋が場をセット）。

#### 山本（助っ人開発者）

- **昨日**: handoff_for_helpers.md（Day0）を確認。`ExamTimer.tsx` / `FeedbackView.tsx` の責務範囲を把握。
- **今日**: **TASK-003 着手**: `ui/ExamTimer.tsx` 新設のスケルトン作成。伊藤の `formatTime` / `getRemainingSeconds` を import して mm:ss 表示の最小実装まで進める。aria-live 警告（残 10/5/1 分）と CSS は Day2。
- **障害物**: なし。

#### 中村（助っ人開発者）

- **昨日**: handoff_for_helpers.md（Day0）を確認。`cases.json` 11〜20 件の modelAnswer 骨格を下書き開始。
- **今日**: **TASK-013 着手**: case-011〜020 の `modelAnswer{judgment / reason / action}` + `scoringPoints[]` 下書き。loader.ts スキーマ整合性確認は Day2。**TASK-005 / TASK-006**（中断・時間切れ）は伊藤の examTimer I/F が固まったので Day2 から本格着手。
- **障害物**: なし。

### スプリントゴールへの進捗

> 「Exam モード（20 問 90 分）で本番タイムマネジメントを体得できるようにし、ルールベースAI評価フィードバックで『判断・理由・アクション』記述を客観評価できる学習サイクルを実現する」

- **Day 1 進捗**:
  - PBI-027 の基盤（`examTimer.ts` ドメイン純粋関数 + sessionStorage I/O）が完成し、UI 層・状態遷移層からの結線準備が整った。
  - LearningStyle `'exam'` が型レベル / 永続化レベルで活性化し、UI トグルから選択可能になった（A-22 卒業の Exam セグメント本実装の起点）。
  - DoD §10-3 適用範囲（sessionStorage Exam 一時保存）の挙動を境界値テスト（不正 JSON / 必須キー欠落 / 型不一致）で先行担保。
- **計画上の Day1 マイルストーン（残タスク 18 / 残ポイント 7）に対する実績**:
  - TASK-001 完了 ✅、TASK-002 完了 ✅、TASK-003 着手 ✅、TASK-013 着手 ✅。残タスク **16** / 残ポイント **7**（pt はタスクではなく PBI 単位なので未消化）。
  - 計画より 1 タスク先行（TASK-002 を Day1 に取り込めた）。

### 検査と適応（スクラムガイド 2020）

- 計画の調整は不要。Day2 に予定どおり TASK-001/008 完了 + TASK-009 進行 + TASK-002/003 結線へ進む。
- A-26（巻取上限ガイド）は Day3-4 戦術判断時に運用するため、Day1 では未適用。
- A-30（沈黙の障害物確認）は Day2 / Day4 に SM 高橋が「困ってないけど時間がかかっている作業はある？」「PR が滞留しそうな兆しは？」と意図的に問いかけ、`daily_scrum.md` に「沈黙チェック実施」を明記する。

### Day 1 作業サマリ（伊藤・コミット内容）

| 種別     | 内容                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| 新規     | `project/front/src/domain/examTimer.ts`（純粋関数 + sessionStorage I/O・DoD §10-1 / §10-3）                   |
| 新規     | `project/front/src/domain/examTimer.test.ts`（vitest 20 件・境界値・ラウンドトリップ・不正 JSON/型 不一致）   |
| 更新     | `project/front/src/domain/learningStyle.ts`（`LearningStyle` に `'exam'` 追加・`LEARNING_STYLES.exam` 追加）  |
| 更新     | `project/front/src/domain/learningStyle.test.ts`（`'exam'` 受理ケース追加・フォールバック分岐更新）           |
| 更新     | `project/front/src/ui/LearningStyleToggle.tsx`（ORDER に `'exam'` 追加・グレイアウト解除）                    |
| 更新     | `project/front/src/ui/LearningStyleToggle.test.tsx`（3 ボタン化 / Exam クリックで onChange 検証）             |
| 更新     | `project/front/src/domain/score.ts`（`initialLearningStyleScores.exam` 追加）                                 |
| 更新     | `project/front/src/domain/score.test.ts`（exam 集計の初期値テスト更新）                                       |
| テスト   | `pnpm test`：**16 ファイル / 166 件 全 PASS**（うち examTimer 20 件 / LearningStyleToggle 7 件 / learningStyle 11 件） |

### 次回（Day 2）に向けた合意

1. 伊藤: TASK-008（`domain/feedbackKeywords.ts`）着手 + TASK-009（`domain/feedback.ts`）I/F 確定 → 山本の `FeedbackView.tsx` スケルトン着手に必要なシグネチャを朝までに共有。
2. 田中: TASK-004 進行（Exam 状態遷移結線）+ TASK-002 確認モーダル実装。
3. 山本: TASK-003 進行（aria-live 警告 + モバイル CSS）。
4. 中村: TASK-013 進行（loader.ts 整合性確認）+ TASK-005 / TASK-006 着手（伊藤の `examTimer` I/F 確定済み）。
5. 高橋（SM）: **A-30 沈黙チェック初回実施**（Day2）。中断・再開仕様（出題インデックス保持）の田中・中村すり合わせを Day1 終わりに 5 分セット。
6. 鈴木（PO）: 不在（Day3-4 のリファインメント A-27 / A-29 / A-31 準備）。

---

## DAY 2 — 2026-06-11（木）

### 基本情報

| 項目                | 内容                                                  |
| ------------------- | ----------------------------------------------------- |
| 日時                | 2026-06-11（木）09:30 - 09:45                         |
| 参加者              | 開発者: 伊藤・田中・山本・中村 / SM: 高橋（ファシリ） |
| タイムボックス      | 15分                                                  |
| 沈黙チェック (A-30) | **実施**（初回・SM 高橋から「困ってないけど時間がかかっている作業はある？」「PR が滞留しそうな兆しは？」を全員に問いかけ） |

### 三つの問い

#### 伊藤（開発者）

- **昨日**: TASK-001（`domain/examTimer.ts` + 20 件テスト）完了 / TASK-002 のうち `LearningStyle = 'exam'` アクティベート完了。
- **今日**:
  - **TASK-008**: `domain/feedbackKeywords.ts` 新設（REASON 3 観点 / ACTION 3 観点 + `countKeywordMatches` 純粋関数 + vitest 8 件・空文字／空配列／空キーワード境界値含む・DoD §10-1）。**完了**。
  - **TASK-009 着手**: `domain/feedback.ts` 評価ロジック純粋関数の I/F 確定（`evaluateFeedback(writingEntry, scoringPoints, modelAnswer)` 雛形・3 ブロック × 4 観点 × ◎/○/△ の判定マップ草稿）。山本へ FeedbackView の props シグネチャを夕方に共有予定。
- **障害物**: なし。
- **A-30 への応答**: 「TASK-009 のスコア合算アルゴリズム（部分一致 vs scoringPoints[] 部分一致の重み付け）が未確定。Day3 の合流時に PO 鈴木へ確認する」。

#### 田中（開発者）

- **昨日**: PBI-027 の `App.tsx` 状態遷移整理メモ作成。
- **今日**:
  - **TASK-002 残**: 山本の追加した `LearningStyleToggle.disabled` プロパティを使い、`App.tsx` で Exam 切替時 `window.confirm("Examモード: 20問・90分タイマーが開始されます。よろしいですか？")` を実装。OK で `createExamSession` + `saveExamSession`、キャンセルで `'deep'` に戻す動線を結線。Exam 中は Toggle を無効化。**山本が代行で着手・完了**（田中は TASK-004 に集中）。
  - **TASK-004 進行**: Exam セッション状態管理（`examSession` 状態 / `App.tsx` 出題ループ拡張・Quick/Deep 履歴非汚染）の骨格を実装。Day3 で `pickNextCaseByMode` から独立した出題ハンドラ完成予定。
- **障害物**: なし。
- **A-30 への応答**: 「TASK-007 a11y 検証はキーボード経路（Toggle → 確認モーダル → タイマー開始）の SR 読み上げ順序を実機確認したい。Day3 朝に 30 分確保したい」→ SM 高橋が場をセット。

#### 山本（助っ人開発者）

- **昨日**: TASK-003 スケルトン（mm:ss 表示）。
- **今日**:
  - **TASK-003 完了**: `ui/ExamTimer.tsx` 本実装（`getRemainingSeconds` / `formatTime` 連携・`setInterval` 毎秒更新・`useEffect` クリーンアップ・残 5 分以下で warning スタイル + 「残りわずか」テキスト併記（DoD §9-2 色のみ依存しない）・`role="timer"` / `aria-label="残り時間"` / `aria-live="polite"`・`dangerouslySetInnerHTML` 不使用 DoD §10-2）+ vitest 7 件（fakeTimers 進行 / 警告閾値 / 残 0 秒で `onTimeUp` 一度だけ呼ばれる / アンマウントで interval クリーンアップ）。
  - **TASK-002 田中代行**: `LearningStyleToggle` に `disabled` プロパティ追加 + `App.tsx` の `handleLearningStyleChange` を Exam 分岐対応（確認モーダル / キャンセル時 Deep 戻し / 候補不足時の安全フォールバック alert）。
- **障害物**: なし。
- **A-30 への応答**: 「TASK-003 の警告スタイルはモバイル幅で `flex-wrap` を効かせて崩れを回避済み。実機検証は Day4 の a11y 検証セッションに統合可」。

#### 中村（助っ人開発者）

- **昨日**: TASK-013 着手（case-011〜020 modelAnswer 下書き）。
- **今日**:
  - **TASK-013 進行**: case-011〜015 の modelAnswer + scoringPoints[] を確定。loader.ts スキーマ整合性確認（既存 cases.json と同形）。Day3 朝に case-016〜020 を完了予定。
  - **TASK-005/006 着手**: 伊藤の `examTimer` I/F が確定したので、中断ボタン UI 雛形 + 時間切れ自動終了処理の純粋関数化検討に入った。`onTimeUp` は山本の `ExamTimer` から流れてくる契約で合意済み。
- **障害物**: なし。
- **A-30 への応答**: 「PR 滞留兆しなし。TASK-013 / TASK-005 のレビュー依頼が Day3 に集中する見込み。伊藤・田中とレビュー時間枠を共有したい」→ SM 高橋がデイリー後にスロット調整。

### スプリントゴールへの進捗

- **Day 2 進捗**:
  - **PBI-027** UI 主要部品（`ExamTimer.tsx`）が完成し、確認モーダル・Toggle 無効化までの起動経路が結線完了。Exam モード起動の主要パスがエンドツーエンドでつながった（出題ループは TASK-004 で Day3 完成予定）。
  - **PBI-029** キーワード辞書（TASK-008）が完成し、TASK-009 評価ロジックの I/F が確定。山本の TASK-010（FeedbackView）着手に必要なシグネチャは Day2 夕方に共有合意。
  - DoD §10-1（境界値）/ §10-2（XSS 不使用）/ §10-3（sessionStorage Exam 保存）の適用範囲は順調。
- **計画上の Day2 マイルストーン（残タスク 14 / 残ポイント 6）に対する実績**:
  - TASK-001/008 完了 ✅、TASK-003 完了 ✅（前倒し）、TASK-002 完了 ✅（前倒し）、TASK-009 進行 ✅、TASK-013 進行 ✅、TASK-005/006 着手 ✅。
  - 残タスク **11** / 残ポイント **6**（Day2 計画 14 タスクに対し 3 タスク先行）。

### A-30 沈黙チェック実施記録

- **問いかけ**: 「困ってないけど時間がかかっている作業はある？」「PR が滞留しそうな兆しは？」（高橋 SM・全員へ）。
- **抽出された潜在課題**:
  1. 伊藤: TASK-009 のスコア合算アルゴリズム（部分一致重み付け）が未確定 → Day3 で PO 鈴木へ確認（A-29 リファインメントに統合）。
  2. 田中: TASK-007 a11y 検証（Exam 起動経路 SR 読み上げ順序）の実機確認時間が未確保 → Day3 朝に 30 分確保（高橋が場をセット）。
  3. 中村: TASK-013 / TASK-005 のレビュー依頼が Day3 に集中する見込み → 伊藤・田中とレビュー時間枠を Day2 終わりに調整。
- **A-30 効果**: 沈黙していたら Day3-4 で顕在化していた可能性が高い 3 件を Day2 中に表出化。SM 高橋・PO 鈴木のリファインメント枠（A-29）に確実に流せる状態を作れた。

### 検査と適応（スクラムガイド 2020）

- 計画調整は不要。TASK-002 / TASK-003 を Day2 で完了させたことで、Day3 は TASK-004（Exam 出題ループ）/ TASK-009（評価ロジック）/ TASK-010（FeedbackView）/ TASK-013 残（case-016〜020）に集中できる。
- A-26（巻取上限ガイド）は Day3-4 戦術判断時に運用。TASK-005/006 は中村が単独で進行可能と判断され、現時点で巻取不要。

### Day 2 作業サマリ

| 種別     | 内容                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| 新規     | `project/front/src/ui/ExamTimer.tsx`（mm:ss 表示・残 5 分以下 warning・aria-live・DoD §9-2 / §9-3 / §10-2）           |
| 新規     | `project/front/src/ui/ExamTimer.test.tsx`（vitest 7 件・fakeTimers 進行 / 警告閾値 / onTimeUp 一度のみ / アンマウント） |
| 新規     | `project/front/src/domain/feedbackKeywords.ts`（REASON 3 観点 / ACTION 3 観点 / `countKeywordMatches` 純粋関数）       |
| 新規     | `project/front/src/domain/feedbackKeywords.test.ts`（vitest 8 件・部分一致 / 重複加算 / 空文字 / 空配列 / 空キーワード境界値・DoD §10-1） |
| 更新     | `project/front/src/ui/LearningStyleToggle.tsx`（`disabled` prop 追加・Exam 中の途中切替防止）                          |
| 更新     | `project/front/src/App.tsx`（Exam 切替時の確認モーダル・`createExamSession` / `saveExamSession` 結線・候補不足時 alert フォールバック・Toggle 無効化） |
| 更新     | `project/front/src/styles.css`（`.exam-timer` / `.exam-timer--warning` / `.learning-style-toggle__btn:disabled`）      |
| テスト   | `pnpm test`：**18 ファイル / 181 件 全 PASS**（DAY1 比 +15 件・うち ExamTimer 7 / feedbackKeywords 8）                  |

### 次回（Day 3）に向けた合意

1. 伊藤: TASK-009（`domain/feedback.ts` 評価ロジック）本実装。スコア合算アルゴリズム（部分一致重み付け）を朝イチで PO 鈴木に確認。
2. 田中: TASK-004（Exam 出題ループ完成）+ TASK-007 a11y 検証（朝 30 分・高橋セット済）。
3. 山本: TASK-010（`ui/FeedbackView.tsx`）着手。伊藤の TASK-009 I/F を受けて骨格実装。
4. 中村: TASK-013 残（case-016〜020）+ TASK-005（中断機能）+ TASK-006（時間切れ自動終了）。レビュー時間枠を Day2 終わりに調整済。
5. 高橋（SM）: A-26 巻取判断（Day3-4）に向けて各タスクの進捗監視。Day4 で A-30 第 2 回実施。
6. 鈴木（PO）: A-29 リファインメント朝イチで TASK-009 スコア合算質問を伊藤と詰める。


---

## DAY 3 — 2026-06-12（金）

### 基本情報

| 項目                | 内容                                                  |
| ------------------- | ----------------------------------------------------- |
| 日時                | 2026-06-12（金）09:30 - 09:45                         |
| 参加者              | 開発者: 伊藤・田中・山本・中村 / SM: 高橋（ファシリ） |
| タイムボックス      | 15分                                                  |
| 沈黙チェック (A-30) | 本日は未実施（次回 Day4 で第 2 回実施予定）           |
| A-26 巻取判断       | 実施。現時点で巻取不要と判断（後述）                  |

### 三つの問い

#### 伊藤（開発者）

- **昨日**: TASK-008（feedbackKeywords.ts）完了 / TASK-009（feedback.ts）I/F 確定。
- **今日**:
  - **TASK-009 完了**: `domain/feedback.ts` 本実装＋ vitest 16 件 PASS。`evaluateJudgment` / `evaluateReason` / `evaluateAction` / `evaluateWriting` の 4 純粋関数を提供。スコア合算は「観点別 ◎=2 / ○=1 / △=0 を平均し、avg≥1.6 →◎、avg≥0.8 →○、それ未満→△」とシンプル化（朝イチで PO 鈴木と合意）。
  - 山本へ TASK-010 用シグネチャ最終共有（`WritingFeedback { judgment / reason[] / action[] / overall }`）。
- **障害物**: なし。

#### 田中（開発者）

- **昨日**: TASK-004 骨格 + TASK-007 a11y 検証時間枠予約。
- **今日**:
  - **TASK-004 進行**: Exam 出題ループの `App.tsx` 結線。`questionIds` を順次消費する出題ハンドラ実装中。Day4 で完了予定。
  - **TASK-007 a11y 検証 朝 30 分**: Exam 起動経路（Toggle → 確認モーダル → タイマー開始）を NVDA で確認。読み上げ順序問題なし。`a11y_checklist.md` への記録は Day4 にまとめる。
  - **TASK-009 レビュー**: 伊藤の feedback.ts PR をレビュー（境界値の抜け漏れなし・XSS 観点で `dangerouslySetInnerHTML` 不使用確認・DoD §10-1 / §10-2 適合）。
- **障害物**: なし。

#### 山本（助っ人開発者）

- **昨日**: TASK-003 完了 + TASK-002 田中代行完了。
- **今日**: **TASK-010 着手**: `ui/FeedbackView.tsx` 骨格実装。伊藤の `evaluateWriting` をそのまま import し、観点ごとに `<dl>` 形式で表示（XSS 安全・テキストノードのみ）。Day4 で aria-live と総合スコアバッジ仕上げ。
- **障害物**: なし。

#### 中村（助っ人開発者）

- **昨日**: TASK-013 case-011〜015 草稿。
- **今日**:
  - **TASK-013 完了**: case-016〜020 の modelAnswer + scoringPoints[] を確定し、case-011〜020 全 10 件を `cases.json` に反映。loader.ts の既存スキーマと整合（scoringPoints は将来拡張用フィールドで loader 検証外・DoD §10-3 への影響なし。Day4 で渡辺セキュリティへ事後共有）。A/B/C 分布: A=4 / B=4 / C=2（11〜20 件範囲）。
  - **TASK-005/006**: 中断ボタン UI 雛形と時間切れ自動終了の純粋関数化を進行中。Day4 完成見込み。
- **障害物**: なし。

### A-26 巻取判断（Day3 実施）

- **対象**: TASK-005 / TASK-006（中村単独進行・Day2 着手）。
- **判定**: **巻取不要**。中村は Day3 で TASK-013 を完了させ、TASK-005/006 に集中可能。残工数 6h は Day4 内に収まる見込み。伊藤・田中・山本は他 PBI のクローズに専念する方が並列効率が高い。
- **2 名同意**: 高橋 SM・伊藤で確認。

### スプリントゴールへの進捗

- **Day 3 進捗**:
  - **PBI-029** 評価ロジック（TASK-009）が完成し、`WritingFeedback` 型が確定。山本の TASK-010 着手完了でフィードバック表示までの結線見通しが立った。
  - **PBI-033a** TASK-013 完了。case-011〜020 の模範解答骨格と採点ポイントが整備され、PBI-029 の `scoringPoints` 部分一致拡張（将来）への布石も完了。
  - **PBI-027** TASK-004 進行中（Day4 完了予定）/ TASK-007 a11y 検証 朝枠で実機確認実施。
- **計画上の Day3 マイルストーン（残タスク 9 / 残ポイント 4）に対する実績**:
  - TASK-009 完了 ✅（前倒し）、TASK-013 完了 ✅、TASK-010 着手 ✅、TASK-007 a11y 検証 着手 ✅。
  - 残タスク **7** / 残ポイント **3**（PBI-029 / PBI-033a の主要部分が消化済。Day4 計画の残 4 タスクに対し 3 タスク先行）。

### 検査と適応（スクラムガイド 2020）

- 計画調整は不要。Day4 は TASK-004 / TASK-005 / TASK-006 / TASK-010 完了と TASK-007 a11y 検証記録 + TASK-011 / TASK-012 / TASK-014〜020 のクロージングに集中する。
- A-30 沈黙チェック第 2 回は Day4 朝に実施予定（高橋）。

### Day 3 作業サマリ

| 種別     | 内容                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| 新規     | `project/front/src/domain/feedback.ts`（評価ロジック純粋関数 4 種・FeedbackScore / FeedbackItem / WritingFeedback 型・DoD §10-1 / §10-2） |
| 新規     | `project/front/src/domain/feedback.test.ts`（vitest 16 件・判断 5 ケース / reason 4 ケース / action 3 ケース / 統合 2 ケース・境界値含む） |
| 更新     | `project/front/src/data/cases.json`（case-011〜020 に modelAnswer + scoringPoints[] 追加・全 10 件整備）       |
| テスト   | `pnpm test`：**19 ファイル / 197 件 全 PASS**（DAY2 比 +16 件・うち feedback 16）                              |

### 次回（Day 4）に向けた合意

1. 伊藤: TASK-009 完了済 → TASK-018（A-31 priorityLabel.ts 横断点検）へシフト。山本の TASK-010 レビュー対応。
2. 田中: TASK-004 完了 + TASK-007 a11y 検証記録（`a11y_checklist.md`） + TASK-011（記述消失注意書き） + TASK-012（XSS / a11y 検証）。
3. 山本: TASK-010 完了（aria-live + 総合スコアバッジ + ライト/ダーク両テーマ確認）。
4. 中村: TASK-005（中断機能）+ TASK-006（時間切れ自動終了）完了。
5. 高橋（SM）: A-30 沈黙チェック第 2 回 + TASK-014（A-26 巻取判断 振り返り共有）+ TASK-020（レビュー / レトロ準備着手）。
6. 鈴木（PO）: TASK-016 / TASK-017 / TASK-019 リファインメント。
