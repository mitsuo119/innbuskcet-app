# Sprint016 handoff（助っ人向け）

## 1. 今スプリントで完了した内容

- **PBI-066（主軸 2pt）**：アイコン整備（ファビコン群 + PWA manifest）
  - `project/front/public/icon.svg`（ブランド SVG マスター）
  - `project/front/public/manifest.webmanifest`（name/short_name/icons 192・512/maskable/theme_color/background_color/start_url/scope/display 完備、`start_url`/`scope`/`icons[].src` は相対参照で GitHub Pages サブパス自動解決）
  - `project/front/scripts/generate-icons.mjs`（追加依存ゼロの SVG → PNG/ICO 派生スクリプト：favicon-16/32/48 / apple-touch-icon-180 / icon-192/512 / icon-maskable-512 / favicon.ico）
  - `index.html` に link rel="icon"/apple-touch-icon/manifest と theme-color light/dark を追加
- **PBI-067（主軸 2pt）**：SEO メタ整備
  - `index.html` に meta description（日本語 99 字）/ color-scheme="light dark" / OGP 6 種 / Twitter Card 4 種 / canonical（`__SITE_URL__` トークン）を設定
  - `src/seo.ts` に `resolveSiteUrl` / `replaceSeoTokens` / `SITE_URL_TOKEN` を集約（PBI-058 規律：`import.meta.env` 直参照ゼロ）
  - `vite.config.ts` に `seoMetaPlugin` を追加し `transformIndexHtml` でビルド時に `__SITE_URL__` を実 URL へ置換
  - `.github/workflows/deploy.yml` に `VITE_SITE_URL: https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/` を注入
- **PBI-068（主軸 2pt）**：構造化データ / robots.txt / sitemap.xml / 404 ページ整備
  - `index.html` に JSON-LD（`@type: WebApplication` / inLanguage=ja / applicationCategory=EducationalApplication / isAccessibleForFree=true 等）を静的埋め込み（`dangerouslySetInnerHTML` 不使用・DoD §10-2 順守）
  - `public/robots.txt`（User-agent: \* / Allow: / + Sitemap 行）
  - `public/sitemap.xml`（トップ + #/patterns + #/reference + #/privacy-policy + #/terms-of-service + #/contact の 6 URL）
  - `public/404.html`（インライン CSS で prefers-color-scheme light/dark 両対応・375px レスポンシブ・noindex メタ）
  - `scripts/transform-seo-tokens.mjs`（dist 後処理で `dist/{robots.txt, sitemap.xml, 404.html}` の `__SITE_URL__` を置換）
  - `scripts/copy-404.mjs` 廃止（hash ルーティング採用のため SPA 自動フォールバック不要・PBI-051 規律と整合）
- **PBI-069（ストレッチ 1pt）**：Lighthouse SEO/Best Practices/PWA 指摘改善 + 画像属性 / noscript 再点検
  - `index.html` `<body>` 直下に `<noscript role="alert">` ブロックを追加（プロダクト概要 + JS 有効化案内 + 外部参照ゼロ・インライン CSS のみ）
  - `project/docs/lighthouse-sprint016.md` を新設し SEO 11 項目 / Best Practices 12 項目 / PWA 7 項目について dist 成果物上で静的レビュー結果を一覧化（実 CLI 計測は GitHub Pages 公開後のフォローアップ）
  - `<img>` 属性再点検：アプリソース内 `<img>` ゼロを `seo-assets.test.ts` で空走前提保証 + og:image:alt/width/height 併記済を再確認

## 2. DAY5 最終確認結果

- 残タスク：TASK-301〜306 / 401〜406 / 501〜506 / 601〜603 全て Done。TASK-901（A-74）は Sprint017 リファインメントへ PO 鈴木が継続提出。TASK-902（沈黙チェック明示記録）は DAY2 / DAY4 で実施済み + DAY5 任意確認で完走。
- 品質ゲート（最終再実行）:
  - `pnpm tsc --noEmit`：pass（エラー 0）
  - `pnpm vitest run`：**44 files / 461 tests all pass**（Duration 8.50s）
  - `pnpm lint`：pass（warning 0 / error 0）
  - `pnpm build`：pass（60 modules / index.html 6.70 kB(gzip 2.31) / css 33.52 kB(gzip 5.42) / js 279.00 kB(gzip 86.93) + `transform-seo-tokens.mjs` で robots/sitemap/404 全置換ログ）
- DoD 21 項目 全て「はい」/ 障害物ログ追加なし / **16 スプリント連続障害物ゼロ**
- ストレッチ PBI-069 は DAY3 朝会で投入確定（主軸 6pt 完了 + 余力充足）→ DAY4 で完遂、DAY5 で Done 確定

## 3. 参照してほしいファイル

- `scrum/sprint016/sprint_backlog.md`（DAY5 更新済・Done 確定）
- `scrum/sprint016/daily_scrum.md`（DAY5 追記）
- `scrum/product_backlog_done.csv`（PBI-066/067/068/069 追加）
- `scrum/product_backlog.csv`（PBI-066/067/068/069 を削除済）
- `scrum/velocity.csv`（sprint016 追記：計画 6pt / 完了 7pt / 持越 0pt）
- `project/docs/lighthouse-sprint016.md`（Lighthouse カテゴリ別 audit 静的レビュー記録）

## 4. 次スプリントへの引継ぎメモ

- **持ち越しタスク（実装系）なし**。運用タスク TASK-901（A-74: chapter03/06/09 PBI 案）は Sprint017 リファインメントへ PO 鈴木が継続提出。
- **フォローアップ（GitHub Pages 公開後の手動確認）**：main マージ + `.github/workflows/deploy.yml` 完走後に山本が以下を実施：
  - TASK-406：Twitter Card Validator / OGP プレビューで実 URL 確認
  - TASK-506：`https://katuz.github.io/ai-scrum-inbuscket/robots.txt`、`/sitemap.xml`、存在しないパス踏みでの 404.html 表示確認
  - 実 CLI Lighthouse 計測（SEO/Best Practices/PWA カテゴリ）→ `project/docs/lighthouse-sprint016.md` の残課題セクションに追記
- **トークン置換規律（PBI-058 拡張）**：`__SITE_URL__` トークンは `index.html`（Vite プラグイン処理）と `public/{robots.txt, sitemap.xml, 404.html}`（後処理スクリプト処理）の 2 系統で扱う。新たに env 依存値を持つ静的アセットを追加する場合は `scripts/transform-seo-tokens.mjs` の対象配列に追加すること。
- **アイコン素材一元化**：`public/icon.svg` を更新したら `pnpm node scripts/generate-icons.mjs` で派生 PNG/ICO を再生成する運用。og:image / twitter:image は `icon-512.png` を流用しているため、ロゴ刷新時は SNS プレビューも自動追従する。
- **manifest.webmanifest の `start_url`/`scope`/`icons[].src` は必ず相対参照（`./` 始まり）**を維持すること。絶対パス（`/` 始まり）に変更すると GitHub Pages サブパス公開で manifest 解決が破綻する。
- **次スプリント候補**：プロダクトバックログ Ready PBI 群（PBI-025/026/028/031/032/053 等）から PO・SM・Dev で再優先付け。Sprint016 で公開サイトの外向き品質基盤が確立したため、次は学習体験深化（6 軸自己採点 / パターン別弱点分析 等）へシフトする余地あり。
