# スプリントレビュー - Sprint026

- **日付**: 2026-05-29
- **参加者**: 鈴木（PO）/ 高橋（SM / ファシリ）/ 伊藤・田中（開発者）/ 佐藤（顧客）
  - 山本・中村（助っ人）は契約上不参加。事前に伊藤・田中経由でフィードバック収集済
  - 渡辺（セキュリティ監査担当）はPBI-097/098/099/100の書面レビュー済として参加扱い

---

## 1. スプリントゴール達成状況（高橋）

> **AdSense審査落ちの4直接原因（クローキング・薄いプリレンダ・一覧欠落・広告配置）を根治し、再申請着手可能な状態を確立する**

- 達成度: **100%（コンテンツ面の根治は完遂）**
- 計画 8pt / 完了 8pt / 持ち越し 0pt（過去最大タイ・容量試算上限）
- 4直接原因すべてに対応:
  1. クローキング → PBI-097（hidden aria-hidden 8箇所→0）
  2. 薄いプリレンダ → PBI-098（52ページ実本文 600字以上焼き込み・最小705/最大2732/平均1045字）
  3. 一覧欠落 → PBI-099（/reference・/patterns プリレンダ化、57→59ルート）
  4. 広告配置 → PBI-100（adsense_placement_policy.md 6条件 + shouldShowAds + AdSlot統合）
- 最終品質ゲート全PASS: tsc 0 / lint 0 / vitest 1121PASS（59 Test Files） / build成功 / dist 59件 hidden 0件 / audit High-Critical 0（moderate 2のみ） / 52ページ機械計測 600字未満 0件

### ただし重大な物理ブロッカーが残存

- **IMP-002（GitHub Pages 本番URL 404）が4スプリント連続Open継続**
- A-114 3点セット（事前通知・SLA・顧客経由督促）初運用もオーナー応答未達
- **本番が404のままではAdSense再申請（PBI-094）は審査自体が物理的に不可能**
- A-117 本計測一気実施（K-1/Lighthouse/C1〜C3/A-112初運用）はSprint027へ持ち越し

---

## 2. インクリメントのデモと検査（伊藤・田中）

### PBI-097（1pt / Critical）クローキング解消（伊藤デモ）

- `scripts/prerender.mjs` 全テンプレートから `hidden aria-hidden="true"` を機械的に8箇所→0
- 59ルート全件 dist 出力で `hidden`/`aria-hidden` 0件（PowerShell `Select-String` 全件grep）
- vitest 専用describe（57ルート × 2it = 114件 + bodyHtml文字列検査1件）追加
- createRoot使用のためhydration mismatch warning は設計上発生不可。FOUCはSPA即置換で許容範囲合意
- 渡辺セキュリティレビュー書面OK（ref/配下固定MD読込のみ・XSS導線なし）

### PBI-098（3pt / Critical）52ページ実本文 600字以上焼き込み（田中デモ）

- 3段階展開戦略（A-111 2連続適用）で reference 12 + cases 20 + patterns 20 = 52ページ
- `mdToHtml` 純関数（frontmatter除去 / h2,h3 / ul,li / table / **bold** / `code` + HTMLエスケープ）実装
- buildChapterRoute / buildCaseRoute / buildPatternRoute で実データから本文焼き込み
- 文字数実績: reference 1365〜2732字 / cases 772〜975字 / patterns 705〜859字（全52件 600字以上）
- 計測レポート: `project/docs/prerender_content_length_report.md`
- vitest 600字下限 52件全PASS

### PBI-099（2pt / High）一覧プリレンダ化（伊藤・山本ハンドオフ）

- prerender ROUTES に `/reference`・`/patterns` 追加（57→59ルート）
- 一覧プリレンダ本文: `/reference` 1491字 / `/patterns` 1778字
- `PatternList.tsx` に導入文＋項目別 characteristics 1〜2文表示、`ReferencePage` 章ナビに summary 付与
- vitest 6件（prerender）+ 3件（PatternList）追加 PASS

### PBI-100（2pt / High）広告配置ポリシー＋shouldShowAds（伊藤デモ）

- `project/docs/adsense_placement_policy.md` 新設（6条件 C1〜C6 + 配置可否マトリクス + 配置パターン）
- `src/ui/adPolicy.ts` に `shouldShowAds(pageMeta)` 純関数 / `adPolicy.test.ts` 28件 PASS
- 主力SEOページ（reference-chapter / case-detail / pattern-detail）に AdSlot配置
- 一覧（reference-list/pattern-list）/ 法務（about/terms/privacy/contact）/ 検索 / 404 から非表示
- 渡辺セキュリティレビュー書面OK（純関数・副作用なし・XSS導線なし）

### 完成の定義（DoD）

- 全PBI 21項目「はい」 / 渡辺セキュリティレビュー書面OK / 機械計測レポート保存済

---

## 3. ステークホルダーフィードバック（佐藤）

### 機能性

- 「コンテンツ面でAdSense再申請に必要な根治はやっと揃った印象。view-source: で本文が読めるのは前回の隠しテキストの反省として正しい方向」（高評価）
- 「広告配置ポリシーの6条件は明確で、薄ページから外す判断も筋が通っている」

### ユーザビリティ

- 「/reference や /patterns の一覧ページに導入文と項目別説明が付いたことで、検索流入時の迷子率が下がりそう」
- 「学習者として読む側の体験は前回比で明確に良くなった」

### ビジネス価値

- 「ただし**本番が404のままでは何も始まらない**というのが率直な評価。コンテンツの根治は素晴らしいが、AdSense審査は本番URLでしか走らない。Sprint026の価値はSprint027でIMP-002が解けて初めて現金化される」
- 「4スプリント連続Openは異常事態。オーナー権限ブロッカーが私経由督促でも動かないなら、Sprint027は別経路（リポジトリ移管／別ホスティング検討）も俎上に載せて欲しい」

### 改善提案

- (a) Sprint027でIMP-002解消が**それでも**できなかった場合の代替経路（Cloudflare Pages等別ホスティング移管）をADRで早めに俎上に載せる
- (b) 再申請後のフィードバック（合否・理由）を `seo_operations.md` に必ず構造化記録（PBI-094受入基準で既定済を再確認）
- (c) PBI-101（本番AdSense環境変数確認）はIMP-002解消後にしか実機検証できないため、Sprint027の優先順位は「IMP-002→PBI-101→PBI-094」の直列で固定
- (d) PBI-098の3段階展開戦略（A-111）は2スプリント連続成功なのでretroで文化卒業反映を支持

---

## 4. 受入判定（鈴木 / PO）

| PBI     | タイトル                           | SP  | 判定     | 備考                                                    |
| ------- | ---------------------------------- | --- | -------- | ------------------------------------------------------- |
| PBI-097 | クローキング解消（hidden除去）     | 1   | **受入** | 59ルート全件 hidden 0件・vitest 114件PASS・渡辺書面OK   |
| PBI-098 | 52ページ本文600字以上焼き込み      | 3   | **受入** | 機械計測 600字未満0件・vitest 52件PASS・A-111 2連続成功 |
| PBI-099 | /reference・/patterns プリレンダ化 | 2   | **受入** | 59ルート整合・一覧本文1491/1778字・vitest 9件PASS       |
| PBI-100 | 広告配置ポリシー+shouldShowAds     | 2   | **受入** | 6条件明文化・adPolicy.test 28件PASS・渡辺書面OK         |

- **計 8pt 全件受入**（差戻なし）
- product_backlog_done.csv へ移送済（DAY5 TASK-D5-3）

---

## 5. 環境変化の共有

- AdSenseの審査基準（特にコンテンツ品質・広告配置）は変動が大きく、本番404のまま日数が経過するとさらに不利になる懸念（佐藤指摘）
- IMP-002はオーナー権限という組織的ブロッカーであり、技術的解決ではなく経路設計の問題に変質している
- 競合学習サイトはAdSense運用継続中。Sprint027でIMP-002が解けないとマネタイズ前提全体の見直しが必要

---

## 6. プロダクトバックログの調整（鈴木）

### 今スプリントの結果に基づく調整

- PBI-097/098/099/100 を `status=Done` で `product_backlog_done.csv` に移送済（変更なし）
- PBI-101（本番AdSense環境変数設定確認 / Medium / 1pt）は既存Readyのまま据え置き
- PBI-094（再申請実施 / Critical / 1pt）は既存Newのまま据え置き

### Sprint027 の最優先順位（再確認）

1. **IMP-002解消（オーナー対応・代替経路ADR含む / 物理ブロッカー）** — Sprint027 DAY1必達
2. PBI-101（本番AdSense環境変数+本番HTML出力検証 / 1pt）— IMP-002解消後即実施
3. PBI-094（ads.txt配置+再申請前チェックリスト+再申請実施 / 1pt）— PBI-101後

### 新規PBI起票

- 今レビューでは新規PBIなし（佐藤フィードバック(a)〜(d)はすべて既存PBI/Aの運用範囲内）
- ただし佐藤フィードバック(a)「Sprint027でもIMP-002が解けない場合の代替ホスティング移管ADR」は、Sprint027プランニングで**条件付きPBI**として起票検討（IMP-002 DAY1未解消の場合のみ発動）

---

## 7. 次スプリントへの調整事項

- **Sprint027は IMP-002解消を最優先・DAY1必達** とする
- 解消できない場合は代替経路（別ホスティング移管ADR）をDAY2に必ず俎上
- A-117 本計測一気実施（K-1/Lighthouse/C1〜C3/A-112）はIMP-002解消後すぐ
- A-114 3点セットの実効性はSprint026 retroで評価（4連続Openを許してしまった事実から運用見直し）
- A-111 段階展開戦略は2スプリント連続成功のため文化卒業反映候補（retroで決定）

---

## 8. メトリクス

- 計画SP: 8pt / 完了SP: 8pt / 持ち越し: 0pt
- ベロシティ直近3スプリント平均: 7.33pt（24→6 / 25→8 / 26→8）
- 連続障害物Open: IMP-002 4スプリント連続（Sprint023起票以降）
- 26スプリント中24スプリント目で障害物継続Open中、PBI完遂率は維持

---

## 9. 記録更新（DAY5 TASK-D5-3 にて完了済）

- `scrum/product_backlog.csv`: PBI-097/098/099/100 を Done として `product_backlog_done.csv` へ移送済
- `scrum/velocity.csv`: sprint026 行追記済（planned 8 / completed 8 / carried 0）
- `scrum/impediment_log.csv`: IMP-002 4スプリント連続Open更新済
- `project/docs/adsense_resubmission_checklist.md`: 本スプリント進捗反映済
