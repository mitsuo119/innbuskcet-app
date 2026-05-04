# Sprint016 スプリントレビュー

## 実施情報

- スプリント: Sprint016
- 期間: 2026-08-12（水）〜 2026-08-18（火）
- 実施日: 2026-08-17（月）
- 参加者: 鈴木（PO）, 高橋（SM）, 伊藤（Dev）, 田中（Dev）, 佐藤（顧客）
- 補足: 助っ人（山本・中村）は契約上レビュー不参加。成果は `daily_scrum.md` Day別記録から共有。

---

## 1. スプリントゴール達成状況（高橋）

**スプリントゴール**
「公開サイトとしての外向き品質（ブランドアイコン・SEO メタ・構造化データ）を整え、検索流入と SNS シェア時のブランド体験を成立させる」

**評価**: **達成（117%）**

- 主軸 PBI-066 / PBI-067 / PBI-068（各 2pt・計 6pt）を Day1〜Day3 で全タスククローズ
- ストレッチ PBI-069（1pt）を Day3 朝会で投入確定 → Day4 完遂
- 計画 6pt + ストレッチ 1pt = **完了 7pt 着地**（直近3スプリント平均 6.67pt → 主軸+ストレッチ満額消化）
- 最終品質ゲート: `pnpm tsc --noEmit` 0 / `pnpm lint` 0 warning / `pnpm exec vitest run` **44 files / 461 tests all pass** / `pnpm build` 成功（60 modules / gzip css 5.42 / js 86.93 kB / index.html 6.70 kB(gzip 2.31)）
- 16スプリント連続障害物ゼロ継続

---

## 2. 完了PBIのデモ要約（伊藤・田中）

### PBI-066: アイコン整備（ファビコン群と PWA manifest）（2pt / High）

- ブランドアイコン素材（`public/icon.svg`：`#0969da` 角丸正方形 + 白の3段「用紙」モチーフ）を確定
- `scripts/generate-icons.mjs` を新設し追加依存ゼロで派生 PNG 群を生成（`favicon-16/32/48.png` / `apple-touch-icon.png`(180px) / `icon-192.png` / `icon-512.png` / `icon-maskable-512.png` / `favicon.ico`(16/32/48 ICO）
- `public/manifest.webmanifest` を新設（name/short_name/icons 192・512/maskable/theme_color/background_color/start_url/scope/display=standalone・全て相対参照で GitHub Pages サブパスに自動解決）
- `index.html` に link rel=icon / apple-touch-icon / manifest と theme-color light/dark 2件を追加
- `src/manifest.test.ts` 24件追加（manifest スキーマ・public 配置・index.html リンク参照）

### PBI-067: SEO メタ整備（2pt / High）

- meta description（日本語 99 字、要件 70〜120 字内）/ html lang="ja" / color-scheme="light dark" / theme-color light/dark を整備
- OGP（og:type=website / title / description / url / image / locale=ja_JP / site_name / image:type/width/height/alt）+ Twitter Card（summary_large_image）を `index.html` に設定
- og:image / twitter:image は PBI-066 の `icon-512.png` を流用
- `src/seo.ts` に `resolveSiteUrl` / `replaceSeoTokens` / `SITE_URL_TOKEN` を実装。`vite.config.ts` の `seoMetaPlugin` で `__SITE_URL__` をビルド時置換
- `.github/workflows/deploy.yml` に `VITE_SITE_URL` 注入を追加（PBI-058 規律：env 依存値は props/定数注入）
- `src/seo.test.ts` 17件追加（resolveSiteUrl 5 / replaceSeoTokens 2 / index.html 検証 8 / 置換解決 2）

### PBI-068: 構造化データと robots.txt / sitemap.xml / 404 ページ整備（2pt / Medium）

- `index.html` に JSON-LD（`@type: WebApplication`・name / url / description / inLanguage=ja / applicationCategory / offers price=0/JPY / image）を `<script type="application/ld+json">` で静的埋め込み（DoD §10-2：dangerouslySetInnerHTML 不使用）
- `public/robots.txt` 新設（User-agent: \* / Allow: / + Sitemap 行・`__SITE_URL__` トークン化）
- `public/sitemap.xml` 新設（トップ + #/patterns + #/reference + #/privacy-policy + #/terms-of-service + #/contact の 6 URL）
- `public/404.html` 新設（インライン CSS / prefers-color-scheme light/dark / 375px レスポンシブ / `noindex` / トップへ戻るリンク）
- `scripts/transform-seo-tokens.mjs` を新設し `dist/{robots.txt,sitemap.xml,404.html}` の `__SITE_URL__` を後処理置換。SPA フォールバック用 `scripts/copy-404.mjs` は静的 404 へ置換のため廃止削除
- `src/seo-assets.test.ts` 22件追加（JSON-LD 6 / robots 4 / sitemap 4 / 404 8）

### PBI-069: Lighthouse SEO/Best Practices/PWA 指摘改善（1pt / Low・ストレッチ）

- `project/docs/lighthouse-sprint016.md` 新設：SEO 11 / Best Practices 12 / PWA 7 項目を audit ID 単位で静的レビュー記録（`csp-xss` のみ△：GitHub Pages 制約・代替担保で根拠記録）。実 CLI 計測は GitHub Pages 公開後フォローアップ
- `index.html` `<body>` 直下に `<noscript role="alert">` ブロックを新設。プロダクト概要 + JS 有効化案内 + 外部参照ゼロ・インライン CSS のみ・AAA 21:1 コントラスト
- `seo-assets.test.ts` に noscript 6件 + Best Practices 3件（charset/viewport/doctype・og:image:alt 非空・将来 `<img>` 混入時の alt/width/height 検証）を追加
- prefers-reduced-motion：既存 grep 0件・Sprint016 変更点はアニメーション無のため回帰無し

### スプリント運用タスクの状況

| タスク   | 内容                                                                              | 状態                               |
| -------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| TASK-901 | 解説 chapter03/06/09 の PBI 案を次回リファインメントへ提出（A-74 継続）           | 持越（PO 鈴木継続担当）            |
| TASK-902 | Day2 / Day4 の沈黙チェック実施結果を `daily_scrum.md` に明示記録（A-76 継続運用） | 完了（Day2/Day4 必須日に明示記録） |

---

## 3. 佐藤（顧客）フィードバック

### 機能性

- order007 が掲げた「公開サイトとしての仕上げ」が、アイコン → メタ → 構造化データ → 公開サイト体裁（robots/sitemap/404）→ Lighthouse 指摘収束まで一気通貫で揃った
- ブラウザタブ・ブックマーク・ホーム画面追加・SNS シェア時のブランド体験が日本語で成立し、外部ユーザに紹介しやすい状態が完成

### ユーザビリティ

- ファビコン / apple-touch-icon が配置され、タブ・ブックマーク識別性が向上
- `<noscript>` フォールバックで JS 無効環境でもプロダクト概要が伝わる（role="alert" で SR 即時通知）
- 404 ページが light/dark 両対応・375px 崩れ無し・トップへ戻る導線付きで公開サイト体裁が整った

### ビジネス価値

- 検索エンジンクロール可能性（robots.txt + sitemap.xml + JSON-LD）が成立し、検索流入の前提条件が整った
- SNS シェア時の OGP / Twitter Card プレビューが崩れない設計で、共有経由の集客導線が確保された
- env 依存値の `__SITE_URL__` トークン化（PBI-058 規律 + ビルド時置換）で、別オーナー・別リポへの流用も低コスト化

### 改善提案

- 解説 chapter03 / 06 / 09 の追加（A-74 継続）。次スプリントでの起票・着手を希望（前回からの継続要望）
- 実 GitHub Pages 公開後の手動検証（Twitter Card Validator / OGP / robots.txt / sitemap.xml / 404 の実 URL アクセス）はデプロイ完走時にフォローアップとして実施希望

---

## 4. 受入判定（鈴木）

| PBI     | 判定       | DoD適合 | 受入基準充足 | 根拠                                                                                                                                                                                     |
| ------- | ---------- | ------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PBI-066 | **Accept** | 適合    | 充足         | favicon群 / SVG / apple-touch-icon / manifest.webmanifest が public 配下配置・index.html 参照・GitHub Pages サブパス解決を `manifest.test.ts` 24件で検証。375px / 両テーマ回帰なし       |
| PBI-067 | **Accept** | 適合    | 充足         | description 99字 / OGP / Twitter Card / canonical / lang / theme-color / color-scheme が `seo.test.ts` 17件で検証。`resolveSiteUrl`+`seoMetaPlugin` で env 依存集約（PBI-058 規律）      |
| PBI-068 | **Accept** | 適合    | 充足         | JSON-LD（WebApplication・dangerouslySetInnerHTML 不使用）/ robots.txt / sitemap.xml(6 URL) / 404.html を `seo-assets.test.ts` 22件で検証。サブパス全置換ログ確認                         |
| PBI-069 | **Accept** | 適合    | 充足         | Lighthouse カテゴリ別レビュー記録（`project/docs/lighthouse-sprint016.md`）+ noscript 整理 + 画像属性 / Best Practices テスト 9件追加。csp-xss は GitHub Pages 制約で△・代替担保根拠記録 |

**総評**: Sprint016 完了 PBI（066 / 067 / 068 / 069）は全て受入。Reject なし。最終品質ゲート全通過、DoD 21 項目すべて「はい」。

### 品質ゲート結果（Day5 最終再実行）

| 項目                | 結果                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`         | ✅ 44 files / 461 tests passed                                                                                                                                    |
| `pnpm tsc --noEmit` | ✅ エラーなし                                                                                                                                                     |
| `pnpm lint`         | ✅ エラーなし（warning 0）                                                                                                                                        |
| `pnpm build`        | ✅ 成功（60 modules / index.html 6.70kB(gzip 2.31) / css 33.52kB(gzip 5.42) / js 279.00kB(gzip 86.93) / robots/sitemap/404 後処理 `__SITE_URL__` 全置換ログ確認） |
| `pnpm audit`        | ✅ High/Critical 0（DoD §5-1 充足）                                                                                                                               |

---

## 5. 未完項目・繰越

| 項目                 | 状態     | 備考                                                                                                                                   |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-406 / TASK-506  | フォロー | GitHub Pages 公開後の実 URL 手動検証（Twitter Card Validator / OGP / robots.txt / sitemap.xml / 404）。dist 成果物上の解決確認は完了済 |
| TASK-601 実 CLI 計測 | フォロー | 実 GitHub Pages 公開 URL での Lighthouse CLI 計測。本スプリント内は静的レビュー記録で受入                                              |
| TASK-901             | 持越     | A-74: chapter03/06/09 解説 PBI 案を Sprint017 リファインメントへ提出（PO 鈴木継続担当）                                                |
| 実装系               | なし     | 主軸・ストレッチとも完遂。実装系の繰越事項なし                                                                                         |

スプリント内の実装系繰越ポイントは 0pt。フォロー項目は全て GitHub Pages 公開（main マージ → deploy.yml 完走）依存の手動確認のみ。

---

## 6. プロダクトバックログ調整方針

- `product_backlog_done.csv` 反映済み: **PBI-066 / PBI-067 / PBI-068 / PBI-069**（Sprint016 / 2026-08-16 / status=Done）
- `product_backlog.csv` 残置: PBI-025 / 026 / 028 / 031 / 032 / 039 / 053（Ready 5件・New 2件）
- 新規 PBI 起票方針:
  - 佐藤フィードバックの「Sprint015 持越：パターン詳細の前後/一覧導線」候補は次回リファインメントで価値・サイズ・依存（PBI-055 / PBI-062 章ナビ）を確認後に起票判断
  - chapter03 / 06 / 09 解説拡張（A-74）も次回リファインメントで起票判断
  - 既存 PBI-066〜069 のスコープに収まる追加要望は確認されず、新規起票は次回リファインメントに集約

---

## 7. 次アクション

1. **Sprint017 プランニング前まで（PO 鈴木）**: TASK-901（A-74）を継続消化し、chapter03/06/09 解説 PBI 案をリファインメント資料として提出。「パターン詳細の前後/一覧導線」候補も準備
2. **GitHub Pages 公開フォロー（伊藤・山本）**: main マージ → deploy.yml 完走後に TASK-406 / TASK-506 / TASK-601 実 URL 手動確認を実施し、結果を Sprint017 daily_scrum 冒頭に記録
3. **Sprint017 候補（チーム）**: 直近3スプリント平均 6.67pt（sprint014/015/016＝7/3/7 → ※sprint016 で 7pt に更新）を目安に Ready PBI（PBI-025 / 026 / 031 / 032 等）から優先順位を確認
4. **共通基盤の活用（Dev）**: 今回確立した `__SITE_URL__` トークン置換規律（`seoMetaPlugin` + `transform-seo-tokens.mjs`）を新規静的アセット追加時に再利用。`pr_checklist.md` §PBI-058/059 規律も継続運用
5. **a11y/モバイル回帰の継続（山本）**: 375px・両テーマ・キーボードのみ手動回帰を Sprint017 でも実施
6. **障害物管理（SM 高橋）**: 16スプリント連続ゼロを維持。Day2/Day4 沈黙チェック（A-76）は Sprint017 も継続

---

## 8. レビュー結論

- **Accept**: PBI-066（2pt）/ PBI-067（2pt）/ PBI-068（2pt）/ PBI-069（1pt）— 4 PBI とも DoD 21 項目・受入基準を充足、品質ゲート全通過
- **Reject**: なし
- **完了ポイント**: 計画 6pt + ストレッチ 1pt = **7pt**（`velocity.csv` sprint016 反映済み）
- **障害物**: なし（16スプリント連続ゼロ継続）
- **プロダクトバックログ整合**: `product_backlog_done.csv` に 4 件反映済み・`product_backlog.csv` 側に PBI-066/067/068/069 残置なしで整合
