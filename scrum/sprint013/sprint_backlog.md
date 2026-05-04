# スプリントバックログ - Sprint 013

## スプリント基本情報

| 項目           | 内容                                       |
| -------------- | ------------------------------------------ |
| スプリント期間 | 2026-07-22（水）〜 2026-07-28（火）        |
| 計画ポイント   | 8pt（主軸）                                |
| チーム         | 伊藤・田中（Dev）、山本・中村（助っ人Dev） |

## スプリントゴール

> **「PR レビューで再利用できる運用知見を固定化し、解説リファレンス画面と CSS 分割の初手を整えて、今後の画面拡張を安全に進められる状態にする」**

---

## PBI一覧

| PBI     | タイトル                                                           | Size | Status |
| ------- | ------------------------------------------------------------------ | ---- | ------ |
| PBI-058 | PRチェックリストへ `import.meta.env` 依存テスト規律を追記          | 1pt  | Done   |
| PBI-059 | PRチェックリストへサブパス公開参照規律を追記                       | 1pt  | Done   |
| PBI-060 | `styles.css` 分割方針決定と1画面試行導入                           | 3pt  | Done   |
| PBI-056 | インバスケット解説リファレンスエリア基本構造（chapter01/02・ナビ） | 3pt  | Done   |

### ストレッチ候補（投入済み）

| PBI     | タイトル                                                             | Size | 条件                                    |
| ------- | -------------------------------------------------------------------- | ---- | --------------------------------------- |
| PBI-057 | インバスケット解説コンテンツ拡充（chapter05/08・優先順位マトリクス） | 2pt  | Day4 余力判定を満たし投入、Day4 で Done |

---

## タスク一覧

### PBI-058: `import.meta.env` 依存テスト規律追記（1pt）

| タスクID | 内容                                                               | 担当 | 見積 | 状態 |
| -------- | ------------------------------------------------------------------ | ---- | ---- | ---- |
| TASK-101 | `pr_checklist.md` に `import.meta.env` 依存テスト規律の文案を追記  | 伊藤 | 1h   | Done |
| TASK-102 | props 注入 / 境界分離で検証する理由を既存文体に合わせて整える      | 田中 | 1h   | Done |
| TASK-103 | 追記位置とレビュー観点の妥当性を確認し、handoff 用に要点を要約する | 山本 | 0.5h | Done |

### PBI-059: サブパス公開参照規律追記（1pt）

| タスクID | 内容                                                                           | 担当 | 見積 | 状態 |
| -------- | ------------------------------------------------------------------------------ | ---- | ---- | ---- |
| TASK-201 | `pr_checklist.md` にベースパス配下のリンク / アセット / ルーティング確認を追記 | 田中 | 1h   | Done |
| TASK-202 | GitHub Pages 運用観点と既存 `vite.config.ts` / デプロイ方針との整合を確認      | 伊藤 | 1h   | Done |
| TASK-203 | サブパス公開時の見落とし観点をレビューし、表現の曖昧さを除去する               | 中村 | 0.5h | Done |

### PBI-060: `styles.css` 分割方針決定と1画面試行導入（3pt）

| タスクID | 内容                                                                                   | 担当 | 見積 | 状態 |
| -------- | -------------------------------------------------------------------------------------- | ---- | ---- | ---- |
| TASK-301 | `styles.css` の現状棚卸しと分割方針比較（ページ単位 / 機能単位）を行い、方針を短く記録 | 田中 | 2h   | Done |
| TASK-302 | 試行対象画面を PBI-056 の解説リファレンス画面に決定し、読込構成を設計                  | 伊藤 | 1h   | Done |
| TASK-303 | 最小1画面で CSS 分割を試行導入し、既存スタイルへの影響を調整                           | 田中 | 3h   | Done |
| TASK-304 | 375px / ライト・ダーク両テーマで表示崩れと横スクロール有無を確認                       | 山本 | 1h   | Done |
| TASK-305 | `pnpm tsc --noEmit` / `pnpm lint` / `pnpm build` の回帰確認とテスト影響整理            | 中村 | 1h   | Done |

### PBI-056: 解説リファレンスエリア基本構造（3pt）

| タスクID | 内容                                                                                  | 担当 | 見積 | 状態 |
| -------- | ------------------------------------------------------------------------------------- | ---- | ---- | ---- |
| TASK-401 | `src/data/referenceData.ts` に chapter01 / 02 の解説コンテンツを定義源として構造化    | 山本 | 3h   | Done |
| TASK-402 | ヘッダー / ナビゲーションに「解説」導線を追加し、既存学習導線と並列アクセス可能にする | 伊藤 | 3h   | Done |
| TASK-403 | 解説画面本体（目次 / スキップリンク / 章立てレンダリング）を実装                      | 田中 | 3h   | Done |
| TASK-404 | vitest: コンテンツレンダリング / ナビゲーション / aria 属性 / XSS 安全性を検証        | 中村 | 2h   | Done |
| TASK-405 | 375px / 両テーマ / キーボード操作の手動確認を行い、PBI-060 の試行対象としても確認する | 山本 | 1h   | Done |

### PBI-057: 解説コンテンツ拡充（chapter05 / chapter08）（2pt）

| タスクID | 内容                                                                                     | 担当 | 見積 | 状態 |
| -------- | ---------------------------------------------------------------------------------------- | ---- | ---- | ---- |
| TASK-501 | `referenceData.ts` に chapter05 / chapter08 の要点（優先順位マトリクス・代表分類）を追加 | 山本 | 1.5h | Done |
| TASK-502 | `ReferencePage.tsx` に chapter05 / chapter08 の表示と目次導線拡張を追加                  | 田中 | 1h   | Done |
| TASK-503 | 参照導線（`#/patterns` / `#/patterns/:id`）と最小CSSを追加し、既存挙動への影響を確認     | 伊藤 | 0.5h | Done |
| TASK-504 | テスト更新と回帰検証（test / tsc / lint / build）を実施                                  | 中村 | 1h   | Done |

---

## 5日間スプリント計画

| Day  | 日程        | 伊藤                           | 田中                                   | 山本（助っ人）                          | 中村（助っ人）                  |
| ---- | ----------- | ------------------------------ | -------------------------------------- | --------------------------------------- | ------------------------------- |
| Day1 | 07/22（水） | TASK-101 + TASK-202 + TASK-302 | TASK-102 + TASK-201 + TASK-301（前半） | TASK-103                                | TASK-203                        |
| Day2 | 07/23（木） | TASK-402（前半）               | TASK-301（後半）+ TASK-403（前半）     | TASK-401（前半）                        | -                               |
| Day3 | 07/24（金） | TASK-402（後半）               | TASK-303 + TASK-403（後半）            | TASK-401（後半）+ TASK-404 補助レビュー | TASK-404（前半）                |
| Day4 | 07/25（土） | 主軸PBI統合確認・相互レビュー  | DoD確認 + 微修正                       | TASK-304 + TASK-405                     | TASK-404（後半）+ TASK-305      |
| Day5 | 07/26（日） | 最終仕上げ・受入観点確認       | PR 集約・DoD最終確認                   | 余力時のみ PBI-057 追加着手             | 主軸完了時のみ PBI-057 付議準備 |

---

## 完了判定の観点

- `pr_checklist.md` の2項目追記が簡潔で既存文体と整合している
- CSS 分割方針に短い理由が残り、最小1画面の試行導入が完了している
- 解説エリアが既存学習導線と並列アクセスでき、chapter01 / 02 を参照できる
- `pnpm tsc --noEmit` / `pnpm lint` / `pnpm build` が成功する
- 375px 幅・ライト / ダーク両テーマ・キーボード操作で破綻がない

---

## 備考

- `PBI-057` は今回の主軸には含めず、余力判定後にのみ投入する
- 助っ人向けの詳細引き継ぎは `handoff_for_helpers.md` で補完する

---

## DAY1（07/22 水）更新

- `project/docs/pr_checklist.md` に `import.meta.env` 依存テスト規律とサブパス公開参照規律を追加し、PBI-058 / PBI-059 を完了
- `project/front/src/data/referenceData.ts` を新設し、chapter01 / chapter02 の定義源を安全な TypeScript 定数として構造化
- CSS 分割試行対象は PBI-056 の解説リファレンス画面に固定し、TASK-302 を完了
- DAY2 は `TASK-402` / `TASK-403` 着手と、`TASK-301` の方針確定を優先する

## DAY2（07/23 木）更新

- `project/front/src/pages/ReferencePage.tsx` を追加し、chapter01 / chapter02 を 1 画面で参照できる解説リファレンス画面を実装
- ルート `#/reference` と章スキップ用の `#/reference/chapter01` / `#/reference/chapter02` を追加し、ホーム画面から「解説リファレンス」へ遷移できるようにした
- CSS 分割は **ページ単位で新規画面に限定して切り出す** 方針を採用し、`ReferencePage.css` へ画面固有スタイルを分離した
- 既存 `styles.css` にはホーム画面の導線ピルなど **横断UIの最小差分のみ** 追加し、副作用の局所化を優先した
- `ReferencePage.test.tsx` / `Router.reference.test.tsx` を追加し、コンテンツ表示・ナビゲーション・aria 属性・`dangerouslySetInnerHTML` 不使用を検証した
- `pnpm test` / `pnpm tsc --noEmit` / `pnpm lint` / `pnpm build` を通過し、DAY3 は 375px / 両テーマ / キーボード操作の手動確認を継続する

## DAY3（07/24 金）更新

- `TASK-304` として、`ReferencePage` を 375px 幅・ライト/ダーク両テーマで確認し、章ナビ/メタ情報の1列化・表領域の横スクロール内包によりページ全体の横スクロールが発生しないことを確認
- `TASK-405` として、キーボード操作（Tab移動・章スキップリンク・フォーカス可視性）を確認し、章スキップ遷移後の見出しフォーカス視認性を補う最小修正を `ReferencePage.css` に追加
- 変更は `reference-page__chapter-title:focus` のアウトライン追加のみとし、既存挙動への副作用を最小化
- `pnpm test` / `pnpm tsc --noEmit` / `pnpm lint` / `pnpm build` を再実行して通過し、PBI-056 / PBI-060 を Done 判定
- Day4 のストレッチ判定は、主軸4PBIがDone到達のため「余力4h以上を満たす場合のみ PBI-057 着手可」と記録（DAY3時点で実装着手は行わない）

## DAY4（07/25 土）更新

- 主軸4PBI Done を前提に余力4h以上を確認し、ストレッチ `PBI-057` を投入
- `project/front/src/data/referenceData.ts` に chapter05 / chapter08 を追加し、緊急度×重要度マトリクスと代表パターン分類を定義源へ反映
- `project/front/src/pages/ReferencePage.tsx` の目次・章表示を chapter05 / chapter08 まで拡張し、参照導線（`#/patterns` / `#/patterns/1` / `#/patterns/9` / `#/patterns/14`）を追加
- `project/front/src/pages/ReferencePage.css` はリンク表示の最小差分のみ追記し、既存分離方針（画面単位）を維持
- `project/front/src/Router.tsx` を更新し、`#/reference/chapter05` / `#/reference/chapter08` のアンカー遷移を有効化
- `ReferencePage.test.tsx` / `Router.reference.test.tsx` を更新し、chapter05/08 表示・導線・現在位置表示を検証
- `pnpm test` / `pnpm tsc --noEmit` / `pnpm lint` / `pnpm build` を通過し、`PBI-057` を Done 判定

## DAY5（07/26 日）更新

- 残タスクを最終点検し、TASK-101〜504 の未完了がないことを確認（未完了 0 件）
- 最終品質ゲートとして `pnpm test` / `pnpm tsc --noEmit` / `pnpm lint` / `pnpm build` を再実行し全通過（362 tests passed）
- `.github/workflows/deploy.yml` を確認し、main push 時のみ deploy / PR は verify のみであること、最小権限（pages:write/id-token:write は deploy job 限定）を再確認（push 操作は未実施）
- `scrum/sprint013/handoff_for_helpers.md` を作成し、助っ人向けの完了内容・確認観点・次スプリントへの引継ぎを明記
- Sprint013 完了 PBI（056/057/058/059/060）を `product_backlog_done.csv` へ移送し、`product_backlog.csv` から削除
- `velocity.csv` に Sprint013 実績（計画 8pt / 完了 10pt / 持越 0pt）を追記
