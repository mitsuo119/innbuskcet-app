# Sprint013 handoff（助っ人向け）

## 1. 今スプリントで完了した内容

- PBI-056: 解説リファレンス基本構造（chapter01/02、目次・スキップ導線）
- PBI-058: `import.meta.env` 依存テスト規律を `project/docs/pr_checklist.md` へ追記
- PBI-059: サブパス公開参照規律を `project/docs/pr_checklist.md` へ追記
- PBI-060: `ReferencePage.css` へのページ単位 CSS 分割試行を導入
- PBI-057（ストレッチ）: chapter05/08 を解説リファレンスへ拡張、`#/patterns` 系導線を追加

## 2. DAY5 最終確認結果

- 残タスク: 0件（TASK-101〜504 すべて Done）
- 品質ゲート:
  - `pnpm test`: 36 files / 362 tests passed
  - `pnpm tsc --noEmit`: passed
  - `pnpm lint`: passed
  - `pnpm build`: passed
- `deploy.yml` 確認:
  - PR は verify のみ
  - main push 時のみ build→deploy
  - `pages:write` / `id-token:write` は deploy job 限定
  - DAY5 で push は未実施

## 3. 参照してほしいファイル

- `scrum/sprint013/sprint_backlog.md`（DAY5更新あり）
- `scrum/sprint013/daily_scrum.md`（DAY5更新あり）
- `scrum/product_backlog_done.csv`（PBI-056/057/058/059/060 追加）
- `scrum/velocity.csv`（sprint013 追記）

## 4. 次スプリントへの引継ぎメモ

- 本スプリント由来の持ち越しタスクはなし
- 解説リファレンス拡張時は `referenceData.ts` を唯一の定義源として維持する
- PR では `project/docs/pr_checklist.md` の2新規規律（env依存テスト / サブパス参照）を必ず確認する
