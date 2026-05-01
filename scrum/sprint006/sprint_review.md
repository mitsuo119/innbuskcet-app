# スプリントレビュー - Sprint 006

> スプリントレビューの目的は、スプリントの成果を検査し、今後の適応を決定することである。
> — スクラムガイド 2020

## 基本情報

| 項目               | 内容                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| スプリント番号     | Sprint 006                                                             |
| 実施日             | 2026-06-09（火）                                                       |
| タイムボックス     | 60分                                                                   |
| 参加者             | PO: 鈴木 / SM: 高橋 / Dev: 伊藤・田中 / 顧客（ステークホルダー）: 佐藤 |
| 不参加（書面同期） | 山本（助っ人）・中村（助っ人）— 田中・伊藤経由で意見集約               |

## スプリントゴール

**「学習スタイル（Quick / Deep）切替と記述任意化を導入し、A/B/C 回答の意味ラベル（最優先/中優先/低優先）を全画面で統一表示することで、隙間時間と腰を据えた練習の双方で破綻なく合格答案の型を反復できる学習体験を実現する」**

### 達成判定: ✅ 達成

- 計画 3 PBI（7pt）すべて完了。Quick/Deep のヘッダー切替・記述任意化（スキップ動線・確認ダイアログ）・A/B/C 意味ラベル全画面統一表示・履歴/正答率の学習スタイル別整合まで一気通貫で着地。
- DoD 21 項目すべて「はい」を取得。§10-3 の適用範囲を `inbasket.learningStyle.v1` localStorage キーに拡張し、不正値・例外時の `'deep'` フォールバック＋ try/catch ラップを `learningStyle.test.ts` 10 件で証跡化。
- 障害物の発生はゼロ。**6 スプリント連続ゼロ**を継続。

---

## 1. インクリメントのデモ（伊藤・田中）

### 1-1. 学習フロー全体（Quick / Deep）

1. ヘッダー右上のセグメントコントロール `[Quick(5分) | Deep(じっくり) | Exam(準備中)]` で学習スタイルを 1 タップ切替（`aria-label="学習スタイル"` / `aria-pressed`）。
2. **Quick**: 案件本文 → A/B/C 回答 →「正解は A（最優先）— 即時着手すべき」解説 → 次問。記述・模範比較は非表示の最短フロー。
3. **Deep**: 案件本文 → 3 ブロック記述（「今回は書かない」リンクで折りたたみ可）→ A/B/C 回答 → 自分の記述プレビュー＋模範解答骨格 → 解説 → 次問。
4. モード切替時に未確定入力があれば `window.confirm('現在の入力内容を破棄してモード切替しますか?')` で保護。
5. リロード後も `localStorage` から学習スタイルを復元（記述本文・履歴は引き続きセッション内のみ保持）。

### 1-2. PBI-035: A/B/C 意味ラベル全画面統一表示（伊藤）

- `domain/priorityLabel.ts` を新設。`PRIORITY_LABELS`（A:◎/最優先/即時着手すべき・B:○/中優先/重要だが緊急ではない・C:△/低優先/リソースが余れば対応）を **唯一の定義源**とし、`getPriorityLabel(key)` / `formatPriorityLabel(key)` の純粋関数を実装。`priorityLabel.test.ts` 11 件で参照同一性・出力形式・型安全性を保証。
- `AnswerButtons.tsx` / `ExplanationView.tsx` / `HistoryView.tsx` / `ModelAnswerView.tsx` の 4 画面でリテラルを撤去し `PRIORITY_LABELS` 直接参照に DRY 化。
- SR 読み上げを `aria-label` で「エー、最優先、即時着手すべき」形式に全箇所統一（DoD §9-3）。`title` 属性でホバー補足、記号（◎/○/△）併記で色非依存（DoD §9-2 / WCAG 1.4.1）。

### 1-3. PBI-036: 学習スタイル切替（Quick/Deep）と記述欄任意化（田中・伊藤・山本・中村）

- `domain/learningStyle.ts`：`LearningStyle = 'quick' | 'deep'` 型 ＋ `LEARNING_STYLES` 定数 ＋ `loadLearningStyle()` / `saveLearningStyle()` / `isDeepMode()` の純粋関数。localStorage キー `inbasket.learningStyle.v1`（**渡辺と DoD §10-3 適用範囲拡張を事前合意**）。不正値・キー未設定・想定外値・localStorage 不可環境すべて `'deep'` フォールバック（try/catch ラップ）。`learningStyle.test.ts` 10 件で境界値検証（DoD §10-3）。
- `ui/LearningStyleToggle.tsx`：2 ボタンセグメントコントロール（`role="group"` / `aria-label="学習スタイル"` / `aria-pressed`）。同値クリックで `onChange` 非呼出。Toggle テスト 6 件 PASS。
- `ui/WritingInput.tsx`：Deep モードで「今回は書かない」リンクボタン（`aria-label="今回は記述を書かずに進む"`）。空入力時は非表示、次問題で自動展開リセット。
- `App.tsx` 結線：Quick 時は `<WritingInput>` / `<WritingPreview>` / `<ModelAnswerView>` を `{isDeep && ...}` でガード。`handleLearningStyleChange` で未確定入力時は確認ダイアログ、OK で WritingEntry リセット＋ `saveLearningStyle()`。起動時 `loadLearningStyle()` で復元。

### 1-4. PBI-037: 学習スタイル別の履歴・正答率の整合（中村・伊藤）

- `domain/history.ts`：`HistoryItem.learningStyle?: LearningStyle` を追加（既存履歴互換のため optional）。`App.tsx` の `pushHistory` 結線で現在の learningStyle を記録。
- `domain/score.ts`：`LearningStyleScores` 型 ＋ `initialLearningStyleScores` ＋ `addLearningStyleScore(scores, style, judgement)` を新設。イミュータブル更新で 5 件のテストを追加（合計 score 系 18 件）。
- `ui/ScoreCounter.tsx`：`learningStyleScores` / `currentStyle` props を追加（後方互換）。現在モードの正答率を `score-counter__style` バッジで `Quick 3 / 5 (60%)` 形式に強調表示。`aria-live="polite"` で SR 通知（DoD §9-3）。出題 0 件は `-/- (--%)` 安全表示で除算エラー防止。
- `ui/HistoryView.tsx`：行内に `learningStyle === 'quick'` で `[Q]`、`'deep'` で `[D]` バッジ。`aria-label`/`title` に「Quickモード」「Deepモード」連結。`HistoryView.test.tsx` に 3 件追加（quick / deep / 後方互換）。

### 1-5. 範囲外（明示）

- Exam モード（PBI-027）はセグメントコントロール上は「準備中」グレイアウト表示のみ。本実装は Sprint007 候補。
- TASK-018（A-20 PBI-033 分割起票）/ TASK-019（A-21 PBI-029 Ready 化）は Sprint007 リファインメントへ持ち越し（合意済）。

---

## 2. DoD 21 項目チェック（田中）

### サマリ

**全 21 項目「はい」。PBI-035 / PBI-036 / PBI-037 ともに完成の定義を満たした。**

| §        | 項目                                           | 判定 | エビデンス                                                                |
| -------- | ---------------------------------------------- | ---- | ------------------------------------------------------------------------- |
| 1-1      | TS 型エラーゼロ                                | はい | `tsc -b --noEmit` 成功                                                    |
| 1-2      | ESLint/Prettier ゼロ                           | はい | `pnpm lint` warning 0                                                     |
| 1-3      | チーム内ペア確認                               | はい | DAY1〜5 で実施（伊藤・田中・山本・中村）                                  |
| 2-1      | 単体テスト全件成功                             | はい | **144 passed (15 files)**（priorityLabel 11 / learningStyle 10 / Toggle 6 / score +5 / HistoryView +3 等） |
| 2-2      | 受入基準の手動確認                             | はい | 山本: Quick/Deep × ライト/ダーク × A/B/C 全フィルタ × 履歴 10/20 の組合せ |
| 3-1      | README 起動手順                                | はい | 既存維持                                                                  |
| 3-2      | 案件データのスキーマ説明                       | はい | 変更なし                                                                  |
| 4-1      | 最新 Chrome で動作                             | はい | `pnpm dev` / `pnpm build` 動作                                            |
| 4-2      | 出題→回答→解説→次問サイクル破綻なし            | はい | Quick / Deep 双方で確認                                                   |
| 5-1      | `pnpm audit` High/Critical なし                | はい | No known vulnerabilities found                                            |
| 5-2      | シークレット情報のハードコードなし             | はい | 全ソース確認                                                              |
| 6-1      | 出題切替 1 秒以内                              | はい | ローカル動作確認                                                          |
| 7-1      | スマホ〜PC 表示崩れなし                        | はい | LearningStyleToggle / スキップ動線 / バッジ含む                           |
| 7-2      | 主要操作 1〜2 タップ                           | はい | A/B/C + 次問 + モード切替                                                 |
| 8-1      | JSON で管理・追加修正容易                      | はい | 変更なし                                                                  |
| 9-1      | キーボード完結                                 | はい | Tab / A/B/C / Enter / Space で全操作可能                                  |
| 9-2      | フォーカス可視                                 | はい | `:focus-visible` 維持・ライト/ダーク両テーマ                              |
| 9-3      | role / aria 属性                               | はい | `aria-pressed` / `aria-label` / `aria-live` / `role="group"`              |
| **10-1** | 入力検証 + 境界値テスト                        | はい | learningStyle 10 件 / score 系 18 件 / writing 既存 12 件                 |
| **10-2** | `dangerouslySetInnerHTML` / `innerHTML` 不使用 | はい | 全コンポーネント React テキスト描画                                       |
| **10-3** | スキーマ整合性検証 + 安全フォールバック        | はい | `inbasket.learningStyle.v1` 不正値・例外時 `'deep'` フォールバック＋ try/catch |

### 最終品質確認（DAY5）

- `pnpm test`: **144 passed (15 files)** ✅
- `pnpm lint`: 0 error / 0 warning ✅
- `pnpm exec tsc -b --noEmit`: 型エラーゼロ ✅
- `pnpm build`: 成功（**gzip 約 60.0kB** / Sprint005 比 +1.13kB）✅
- `pnpm audit`: No known vulnerabilities found ✅

---

## 3. 受入判定（PO 鈴木）

| PBI ID  | タイトル                                          | 受入基準充足 | 判定        |
| ------- | ------------------------------------------------- | ------------ | ----------- |
| PBI-035 | A/B/C 回答の意味ラベル全画面統一表示              | すべて充足   | **受入** ✅ |
| PBI-036 | 学習スタイル切替（Quick/Deep）と記述欄任意化      | すべて充足   | **受入** ✅ |
| PBI-037 | 学習スタイル別の履歴・正答率の整合（PBI-022 拡張） | すべて充足   | **受入** ✅ |

### PBI-035 受入基準充足の確認

- `domain/priorityLabel.ts` 新設＋ `PRIORITY_LABELS` 唯一定義源 ✅
- `AnswerButtons.tsx` リテラル撤去 ＋ DRY 化 ✅
- `ExplanationView.tsx` 「正解は A（最優先）— 即時着手すべき」表記 ✅
- `HistoryView.tsx` 行内併記＋ `aria-label`/`title` ✅
- `ModelAnswerView.tsx` ヘッダー優先度バッジ ✅
- SR 読み上げ統一（DoD §9-3）✅
- ライト/ダーク両テーマ AA ✅
- 単体テスト追加（priorityLabel 11 件 + コンポーネント表示）✅
- DoD 21 項目「はい」 ✅

### PBI-036 受入基準充足の確認

- `domain/learningStyle.ts` ＋ localStorage キー定義 ✅
- セグメントコントロール `[Quick | Deep | Exam(準備中)]` ＋ `aria-label="学習スタイル"` ✅
- Quick 時 `WritingInput` / `WritingPreview` / `ModelAnswerView` 非表示 ✅
- Deep 時「今回は書かない」スキップ動線 ✅（次問で自動展開リセット）
- 記述欄常時任意 ✅
- モード切替時の確認ダイアログ ✅
- localStorage 永続化＋復元 ✅（DoD §10-3 で吸収・新規 DoD 項目追加なし）
- 記述本文はセッション内のみ保持（永続化対象は学習スタイル設定のみ）✅
- 既存 FilterMode と独立軸併存 ✅
- 純粋関数 vitest（10 件 + Toggle 6 件）✅
- キーボード完結 ✅
- DoD 21 項目「はい」 ✅

### PBI-037 受入基準充足の確認

- `HistoryItem.learningStyle` フィールド追加 ＋ `HistoryView` 行内 `[Q]`/`[D]` バッジ ✅
- LearningStyle 別正答率集計（ScoreCounter Quick/Deep バッジ）✅（既存 FilterMode 別と独立軸で両立）
- 出題 0 件の安全表示（`-/- (--%)`）✅
- セッション内のみ保持（localStorage は学習スタイル設定のみ）✅
- `aria-live="polite"` で SR 読み上げ ✅
- 純粋関数 vitest（score +5 件 / HistoryView +3 件）✅
- DoD 21 項目「はい」 ✅

**3 PBI とも差戻なし。Sprint006 完了 PBI: 3 件 / 7pt（計画＝実績）。**

---

## 4. ステークホルダーフィードバック

### 4-1. 佐藤（顧客 / 学習者）— 「昇進試験合格直結か」の視点

#### 高評価（合格に効く）

1. **「ようやく自分の使い方に合う形になった」**：通勤の 5 分で Quick、夜に腰を据えて Deep、というモード分けが直感的。今までは「短時間で軽くやりたい時」と「がっつり書きたい時」のどちらかを我慢する必要があった。
2. **A/B/C ＋「最優先/中優先/低優先」＋ 1 行の意味の 3 点セット**：全画面で統一されたことで、特に解説画面で「正解は A（最優先）— 即時着手すべき」と読めるのが大きい。記号や色の感覚的識別から「意味」での識別へ脳が切り替わる。
3. **記述「今回は書かない」スキップ動線**：Deep にしてはいるが今は時間がない、という時に折りたたみで逃せるのが実用的。次問題で自動展開に戻るのも親切。
4. **モード切替時の確認ダイアログ**：書きかけて間違ってモードを変えても保護される。安心して切替できる。
5. **ScoreCounter の Quick/Deep 別バッジ ＋ 履歴の `[Q]`/`[D]` バッジ**：モードを混ぜると手応え判断が不正確になる懸念があったが、独立軸で集計されているので「Deep の方が当たる」「Quick だと焦って外す」が見える。chapter11 の弱点反復学習の前提整備として有効。

#### 改善提案（次スプリント以降）

1. **時間制限モード（Exam）の本実装を Sprint007 で必ず（最重要）**：セグメントが「準備中」と見えていることで期待値が上がっている。chapter12 タイムマネジメントの本丸であり、ここまで来たら次で完走したい。**PBI-027 を Sprint007 最優先**。
2. **記述自己採点チェックリスト（PBI-029）も同じ Sprint007 で**：模範を眺めるだけでなく、判断/5W1H/委任/フォローを自分でチェックしたい。`scoringPoints[]` のデータが既に投入済みなのに UI が無いのは引き続きもったいない。
3. **模範解答骨格 30 件の段階整備（PBI-033）を分割起票で計画的に**：Sprint006 の TASK-018（A-20）で 1 ポイント単位 3 分割の合意ができたので、Sprint007/008/009 で着実に消化したい。
4. **Quick で何問解いたかが見えづらい瞬間がある**：モード別バッジは見えるが、ヘッダー左肩のグローバルカウンタとの併存で混乱することがあった。次回レトロ／リファインメントで導線整理を要望。
5. **Quick/Deep の説明ツールチップが欲しい**：初回利用者向けに「Quick: 5分・優先順位のみ／Deep: じっくり・記述あり」を hover/長押しで読めるとよい。

### 4-2. 山本・中村（書面フィードバック / 田中・伊藤経由）

- **山本**：DAY3 田中の前倒し並行着手（TASK-006/007/008）と DAY4 中村のオール巻取（TASK-009/010/011/012/014/015）により、自分は CSS 仕上げと最終目視確認に集中できた。`handoff_for_helpers.md` の A-16 還流欄構造化は 2 スプリント連続で機能。Sprint007 でも継続採用希望。
- **中村**：DAY4 オール巻取の戦術判断が功を奏した。`App.tsx` への 6 タスク統合で PBI-036/037 連動の整合性確認を一気に進められた。一方で「一人に集約しすぎ」のレビュー負荷増加が次の課題。レトロでバランスを議論したい。

### 4-3. 渡辺（セキュリティ監査担当 / 書面）

- DoD §10-3 の適用範囲を `inbasket.learningStyle.v1` localStorage キーに拡張した運用は事前合意通り。`learningStyle.ts` 側の try/catch ラップ＋不正値時 `'deep'` フォールバックは適切。`learningStyle.test.ts` 10 件で空・不正値・想定外値・例外環境を網羅した点は監査適合性が高い。Sprint007 で Exam モードを本実装する場合、タイマーと履歴の永続化方針（セッション内のみ維持）を引き続き堅持し、§10-3 の対象が増える場合は再点検すること。

---

## 5. プロダクトバックログの調整

### 5-1. 完了 PBI のクローズ

- **PBI-035** → status: Done / sprint: sprint006 / 完了日: 2026-06-09
- **PBI-036** → status: Done / sprint: sprint006 / 完了日: 2026-06-09
- **PBI-037** → status: Done / sprint: sprint006 / 完了日: 2026-06-09

→ `product_backlog.csv` から削除し、`product_backlog_done.csv` に追加。

### 5-2. Sprint007 最優先（佐藤フィードバック反映）

- **PBI-027（時間制限モード 20問90分基本機能 / 3pt）を Sprint007 最優先**で投入。優先度を **Medium → High** に昇格（リファインメントで反映予定）。
- **PBI-029（記述自己採点チェックリスト / 2pt）を Sprint007 同時投入候補**。Sprint006 で持ち越した TASK-019（A-21）の Ready 化を Sprint007 プランニング前に完了する。
- **PBI-033 分割起票**（TASK-018 / A-20）を Sprint007 プランニング前リファインメントで実施。1pt × 3 子 PBI（PBI-033a/b/c 各 10 件）として投入計画化。

### 5-3. 既存 PBI の処遇

| PBI ID  | タイトル                         | 現在優先度 | 次スプリント方針                                                |
| ------- | -------------------------------- | ---------- | --------------------------------------------------------------- |
| PBI-027 | 時間制限モード 20問90分          | Medium     | **Sprint007 最優先**。優先度 High に昇格予定                    |
| PBI-029 | 記述自己採点チェックリスト       | High       | **Refinement で Ready 化**。Sprint007 投入候補                  |
| PBI-033 | 模範解答骨格の整備拡充（残30件） | Medium     | **PBI-033a/b/c 1pt × 3 に分割起票**（Sprint007 で 033a 投入）   |
| PBI-025 | 6 軸自己採点レーダー             | Medium     | Sprint008 以降                                                  |
| PBI-026 | パターン別弱点 Top3              | Medium     | Sprint008 以降                                                  |
| PBI-030 | 時間制限モード総合フィードバック | Medium     | PBI-027 完了後に Refinement → Ready                             |
| PBI-028 | 案件間関連の気づき支援           | Low        | 据え置き                                                        |
| PBI-031 | 直近10問ローリング正答率         | Low        | 据え置き                                                        |
| PBI-032 | ダーク時本文可読性チューニング   | Low        | 据え置き                                                        |
| PBI-034 | 記述リロード消失注意表示         | Low        | PBI-029 と機能統合方針（A-23）で Close 候補                     |

### 5-4. 新規 PBI（佐藤フィードバックから）

今回はスプリントレビューに伴う新規起票なし。佐藤フィードバック④（カウンタ導線整理）は次回レトロ／リファインメントで議論し、必要に応じて起票判断する（PBI-031 で吸収可能性あり）。

---

## 6. 全体まとめ

### 達成したこと

- スプリントゴール達成（Quick/Deep 切替＋記述任意化＋ A/B/C 意味ラベル全画面統一表示）。
- 計画 7pt = 実績 7pt（**6 スプリント連続で計画通り完走**）。
- DoD 21 項目「はい」継続（Sprint005 から 2 スプリント連続）。テスト 144 件 PASS / lint 0 / build OK / audit クリーン。
- §10-3 適用範囲を localStorage 学習スタイルキーに拡張、渡辺と事前合意通りに着地。
- DAY3 前倒し並行着手（田中）／ DAY4 オール巻取（中村）の戦術判断によりバーンダウン Day3-4 計画を上回り、DAY5 を最終仕上げと品質確認に充てる余裕を確保。
- 6 スプリント連続障害物ゼロを継続。

### Sprint006 ベロシティ

- 計画ポイント: 7pt
- 完了ポイント: 7pt
- 持越ポイント: 0pt
- 6 スプリント平均: (21+13+7+6+6+7) / 6 = **10.0pt**

### 次スプリントへの引き継ぎ

- **Sprint007 主軸**: PBI-027（時間制限モード 20問90分・3pt）＋ PBI-029（記述自己採点チェックリスト・2pt）。容量があれば PBI-033a（1pt）。
- **リファインメント**: PBI-027 優先度昇格 / PBI-029 Ready 化 / PBI-033 分割起票（033a/b/c）。
- **プロセス継続**: A-16 handoff 構造化還流欄、PR チェックリスト v0.3.0、a11y_checklist.md。
- **レトロ論点**: ①中村オール巻取の負荷集中バランス、②田中の前倒し並行着手の再現性、③佐藤フィードバック④（カウンタ導線整理）の取扱い。

---

## 更新履歴

| 日付       | 内容                                             | 更新者           |
| ---------- | ------------------------------------------------ | ---------------- |
| 2026-06-09 | スプリントレビュー実施・PBI-035/036/037 受入確定 | 鈴木エージェント |
