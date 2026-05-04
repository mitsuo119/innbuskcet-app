# Sprint015 handoff（助っ人向け）

## 1. 今スプリントで完了した内容

- PBI-065（主軸 1pt）: アプリタイトル日本語化（InBusket → インバスケット）と MVP 文言削除
  - `App.tsx` h1=「インバスケット」/ subtitle=「インバスケット学習アプリ」
  - `index.html` `<title>`=「インバスケット - 学習アプリ」
  - UI 上の「MVP 開発中」「Sprint 0XX」表記を撤去（法務本文の固有名「InBusket」/ localStorage キー / コメントはスコープ外）
  - `App.header.test.tsx` 新規追加（h1 / subtitle / 非残存検証 計 3 ケース）
- PBI-064（ストレッチ 2pt）: パターン解説 / 法務 / ナビゲーションの一貫性と回遊性向上
  - 共通 `src/ui/GlobalNav.tsx` 新規作成（4 リンク：問題回答 / 解説リファレンス / パターン別解説 / プライバシー、`current` props で `aria-current="page"` 制御）
  - 6 ページへ展開（PrivacyPolicy / TermsOfService / Contact / PatternList / PatternDetail / ReferencePage）。導線順序「戻る → グローバル → h1」で統一
  - `legal-section` をカード化（border + 12px radius + surface-muted / padding 1rem 1.1rem / gap 0.75rem / 見出し 1.05rem 700）して解説リファレンスと整合
  - `GlobalNav.test.tsx` 6 ケース・`LegalPages.test.tsx` GlobalNav 検証 +1 ケース・`Router.reference.test.tsx` 章ナビ内 querySelector 修正

## 2. DAY5 最終確認結果

- 残タスク: TASK-101〜105 / 201〜203 全て Done。TASK-901（A-74 chapter03/06/09 PBI 案）は次回リファインメント期日タスクとして PO 鈴木が継続提出。TASK-902（沈黙チェック明示記録）は Day2 / Day4 で実施済み。
- 品質ゲート（最終再実行）:
  - `pnpm tsc --noEmit`: pass（エラー 0）
  - `pnpm test` (vitest): **41 files / 389 tests all pass**（7.02s）
  - `pnpm lint`: pass（warning 0）
  - `pnpm build`: pass（60 modules / index.html 0.43 kB(gzip 0.32) / css 33.52 kB(gzip 5.42) / js 278.84 kB(gzip 86.89) / 404.html コピー含む）
- DoD 21 項目 全て「はい」/ 障害物ログ追加なし / **15 スプリント連続障害物ゼロ**
- ストレッチ PBI-064 は Day3 朝会で投入確定（PBI-065 Done 近傍 + 4h 余力充足）→ Day4 までに完遂、Day5 で Done 確定

## 3. 参照してほしいファイル

- `scrum/sprint015/sprint_backlog.md`（DAY5 更新済・Done 確定）
- `scrum/sprint015/daily_scrum.md`（DAY5 追記）
- `scrum/product_backlog_done.csv`（PBI-065 / 064 追加）
- `scrum/product_backlog.csv`（PBI-065 / 064 を削除済）
- `scrum/velocity.csv`（sprint015 追記: 計画 1pt / 完了 3pt / 持越 0pt）

## 4. 次スプリントへの引継ぎメモ

- 持ち越しタスクなし（実装系）。運用タスク TASK-901（A-74: chapter03/06/09 PBI 案）は Sprint016 リファインメントへ PO 鈴木が継続提出。
- `GlobalNav.tsx` は今後の新規ページ追加時に再利用すること。新規ページの `current` 値を追加する際は、`Router.tsx` の `parseHash` と整合させる。
- `legal-section` カード境界は解説リファレンス（`reference-page__section`）と同じ視覚言語に整合済み。今後も両者の見え方を二重メンテせず CSS 変数経由で統一維持する。
- `aria-current="page"` の二重付与（GlobalNav + 章リンク等）は既存テストで検出される可能性があるため、テストでは対象スコープを限定（querySelector スコープ）する運用を継続する。
- 次スプリントは PBI-053（Exam90 分ミニタイムライン表示・Low / 2pt）を含むプロダクトバックログ Ready PBI 群から PO・SM・Dev で再優先付け。
