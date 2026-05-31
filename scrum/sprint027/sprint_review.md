# スプリントレビュー - Sprint027

## 基本情報

- **スプリント**: Sprint027
- **期間**: 2026-05-30 〜 2026-06-05（5日間）
- **実施日**: 2026-06-05
- **参加者**: 鈴木（PO）/ 高橋（SM）/ 伊藤・田中（開発）/ 佐藤（顧客）/ 渡辺（書面合意のみ）
- **欠席（契約上）**: 山本・中村（助っ人）— 田中・伊藤経由で意見反映済

## 1. スプリントゴール達成状況（高橋）

> **本番でJS実行後もトップ以外の全ページが404化しない状態を実現し、AdSense再申請の前提を整える**

- 判定: **達成（暫定）**
- 根拠:
  - クライアントルータ末尾スラッシュ正規化を根治（PBI-102）、回帰25ケース追加（PBI-103）で再発防止策まで具備
  - 本番同等での実機アウトカム検証スクリプト `check:outcome` を新設し、preview全43ルートで **PASS=43 / FAIL=0**（PBI-104）
  - DoD §4-3 を新設し21→22項目化、本SP内で全PBIを新DoDで判定済（PBI-105）
- 留保点: 本番デプロイは別工程のため未反映。prod計測は **PASS=1 / FAIL=42**（旧ビルド）。本番反映後の再計測で解消見込みである旨を `outcome_verification_report.md` の既知事項節で明示済。
- 計画/実績: 5pt計画 / 5pt完遂（連続27スプリントPBI完遂）

## 2. インクリメント検査・デモ（伊藤・田中）

previewでのデモを実施。本番デモは本番反映後にPBI-094再申請直前ゲートとして実施予定。

### PBI-102 デモ（伊藤）
- `Router.tsx` の `parsePathname()` 冒頭で root 以外の末尾スラッシュを正規化（1箇所追加）。
- preview で `/about/`・`/privacy-policy/`・`/reference/chapter01/`・`/cases/case-001/`・`/patterns/1/` がhydration後に正規ページ表示。`/` は退行ゼロ。

### PBI-103 デモ（田中）
- `Router.trailingSlash.test.tsx` 25ケース全PASS（代表8URL×スラッシュ有無 + `/` 正規化対象外 + `not-found` 末尾スラッシュ後も404維持）。

### PBI-104 デモ（田中・山本代理）
- `front/scripts/check-routes-outcome.mjs` を Playwright で実装、`pnpm run check:outcome -- --target=preview|prod` で全43ルートを末尾スラッシュ付き訪問・hydration後にNotFound非検出/h1描画を機械チェック。
- Day4でh1抽出を `[data-prerender]` 配下に限定し`<noscript>` 誤検知を解消。
- `project/docs/outcome_verification_report.md` に preview/prod 両セクション + 既知事項節整備済。

### PBI-105 デモ（高橋）
- `definition_of_done.md` §4-3「プリレンダ/SSGページは隠蔽属性なしで本文出力・本文下限充足・JS実行後も主要ルートが404化しない」を追記。
- `definition_of_done_history.md` 追記済 / 渡辺書面合意済 / Sprint027 内PBI 全て22項目で判定。

### 完成の定義（22項目）
- PBI-102/103/104/105 すべて 22/22「はい」
- 品質ゲート: vitest 60files 1147 PASS / tsc 0 / lint 0 / build 59ルート完遂 / audit High,Critical 0（moderate 2 のみ継続） / `check:outcome --target=preview` 43/0 PASS

## 3. ステークホルダーフィードバック（佐藤）

### 機能性
- 「致命的なルーティングバグの根治は最優先案件として期待通り。previewで代表ルートがどれも404化しないのは確認できた」
- 「`check:outcome` を pnpm script から1コマンドで回せるのは運用上ありがたい」

### ユーザビリティ
- 「previewデモでは末尾スラッシュ付きURLでもページ内容が正しく出る。コピペで共有されたURLが落ちないのは利用者視点で重要」
- 改善提案: 「prod反映後に主要ルートでブラウザ実機の見え方も併せて見せてほしい（再申請直前ゲート時）」

### ビジネス価値
- 「AdSense再申請の物理ブロッカー（クローラがトップ以外を404と認識）解消の道筋がついた点を高く評価」
- 「本番未反映でprod検証FAIL=42なのは『既知事項+本番反映で解消見込み』という説明で納得。再申請を急いで撃ち落とされるより、本番反映→prod PASS確認→申請 の順で堅実に行く方針に同意」

### 改善提案・要望
- (a) prod反映後の `check:outcome --target=prod` PASS確認をPBI-094の **再申請直前ゲート** として明文化してほしい → 受領
- (b) 本番デプロイ作業自体を可視化したい（手順・所要時間・ロールバック手順）。次SPで作業PBI化を提案 → 受領（後述PBO調整）
- (c) `check:outcome` の月次定期実行（既存検出網）も将来検討してほしい → バックログ候補としてメモ

## 4. 受入判定（鈴木）

| PBI | サイズ | 受入判定 | 根拠 |
| --- | --- | --- | --- |
| PBI-102 ルータ末尾スラッシュ正規化の根治 | 1pt | **受入** | 受入確認4項目すべて充足。1箇所追加で副作用なし、`/` 退行ゼロ確認。 |
| PBI-103 末尾スラッシュ回帰テスト追加 | 1pt | **受入** | 25ケース全PASS、`not-found` 維持テストも含む。 |
| PBI-104 本番同等アウトカム検証スクリプト | 2pt | **受入** | preview 43/0 PASS、両モード対応、レポート整備、渡辺セキュリティレビュー済。prod FAIL=42 は本番未反映の既知事項として `outcome_verification_report.md` に明記済。 |
| PBI-105 DoD §4-3 追記 | 1pt | **受入** | DoD 22項目化、履歴追記、渡辺書面合意、本SP内PBI全て22項目で判定済。 |

- **差戻し: なし**
- 完了合計: **5pt / 5pt（100%）**

## 5. 環境変化・状況共有

- 本番ホスティングへのデプロイは別工程として残存（IMP-002 はDay0でResolved化されたカスタムドメイン公開の確認とは別軸の話）。
- AdSense再申請（PBI-094）は本番デプロイ→prod PASS確認を前提とするため Sprint028 トップ枠固定。
- moderate脆弱性 2件はSprint026から継続。High/Critical 0 維持で再申請ゲート条件は満たす。

## 6. プロダクトバックログ調整

### Sprint028 トップ枠（確定）
- **PBI-094 ads.txt配置+AdSense再申請前チェックリスト+再申請実施（1pt / Critical）**
  - 受入基準に **「`pnpm run check:outcome -- --target=prod` 全43ルート PASS を再申請着手の必須ゲートとする」** を追加（佐藤要望(a)反映）。
  - 前提条件: PBI-106（本番デプロイ）完了。
  - sprintフィールドを `sprint028` に設定（本レビューで反映）。

### 新規PBI起票
- **PBI-106 本番デプロイ実施と prod アウトカム検証ゲート通過（新規 / High / 1pt 想定）**
  - 内容: Sprint027 で完成したルータ修正+アウトカム検証スクリプトを **本番ホスティング** に反映し、`pnpm run check:outcome -- --target=prod` で全43ルートPASSを確認する。手順・所要時間・ロールバック手順を `project/docs/` に追記。
  - 受入基準（案）: ①本番ビルド成果物が本番に反映されている / ②`check:outcome --target=prod` PASS=43/FAIL=0 / ③デプロイ手順・ロールバック手順が文書化されている / ④`outcome_verification_report.md` に本番計測行追記 / ⑤DoD 22項目「はい」
  - 優先度: High（PBI-094 の前提 / Sprint028 着手）
  - 起票理由: 佐藤要望(b)。本番反映作業を可視化・追跡可能にし、再申請ゲートとの依存関係を明示するため。

### バックログ候補メモ（未起票）
- `check:outcome` の定期実行/CI組込（Sprint026 retro A-121 の継続課題と統合検討） — 佐藤要望(c)。Sprint028 リファインメントで起票要否を判断。

### 更新対象ファイル
- `scrum/product_backlog.csv`
  - PBI-094: `sprint` 列に `sprint028` を設定、受入基準に prod `check:outcome` ゲート追加
  - PBI-106: 新規追加
- `scrum/product_backlog_done.csv`: PBI-102/103/104/105 移送済（Day5反映済）
- `scrum/velocity.csv`: sprint027 行追記済（Day5反映済）

## 7. 次スプリントへの示唆

- Sprint028 は **PBI-106（本番デプロイ）→ prod `check:outcome` PASS → PBI-094（再申請）** の直列で再申請完遂を狙う。
- 容量試算は A-99 第7回適用で 6〜8pt 範囲、PBI-094(1pt)+PBI-106(1pt)+リファインメント候補 を含め下限寄り構成を Planning で確定。

## 8. 記録物

- 本ファイル: `scrum/sprint027/sprint_review.md`
- 更新: `scrum/product_backlog.csv`（PBI-094 sprint割当 + PBI-106 新規）
- 既反映: `scrum/product_backlog_done.csv`, `scrum/velocity.csv`
- 参照: `project/docs/outcome_verification_report.md`, `scrum/definition_of_done.md` §4-3
