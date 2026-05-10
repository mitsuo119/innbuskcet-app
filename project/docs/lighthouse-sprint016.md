# Lighthouse 計測記録 - Sprint 016 / PBI-069

> 対象: GitHub Pages 公開予定の `dist/` 本番ビルド成果物（`VITE_BASE_URL=/ai-scrum-inbuscket/` + `VITE_SITE_URL=https://katuz.github.io/ai-scrum-inbuscket/`）。
> 計測カテゴリ: SEO / Best Practices / PWA（Performance は対象外・Sprint016 スコープ外）。

## 静的レビュー結果サマリ（DAY4 時点）

実 GitHub Pages 公開後の Lighthouse CLI 計測は deploy.yml 完走後に実施するため、本ドキュメントでは **dist 成果物に対する静的レビュー** で `audit ID` 単位の合否を記録する。各項目の根拠は対応ファイル/テストへのリンクで担保する。

### SEO（想定スコア: 100）

| audit ID                          | 項目                                 | 状態 | 根拠                                                                           |
| --------------------------------- | ------------------------------------ | ---- | ------------------------------------------------------------------------------ |
| `document-title`                  | `<title>` を持つ                     | ✅   | [index.html](../front/index.html) `<title>インバスケット - 学習アプリ</title>` |
| `meta-description`                | meta description（70〜120 字日本語） | ✅   | PBI-067 / TASK-401（99 字）                                                    |
| `html-has-lang`                   | `<html lang="ja">`                   | ✅   | [index.html](../front/index.html#L2)                                           |
| `html-lang-valid`                 | lang コードが BCP-47 準拠            | ✅   | `ja`                                                                           |
| `link-text`                       | リンクテキストが意味的               | ✅   | 404.html / PrivacyPolicy / TermsOfService 等で確認                             |
| `crawlable-anchors`               | クロール可能なアンカー               | ✅   | hash ルートのみ。robots/sitemap で全ルート公開                                 |
| `is-crawlable`                    | robots.txt が許可                    | ✅   | [robots.txt](../front/public/robots.txt) `Allow: /`                            |
| `robots-txt`                      | robots.txt 妥当性                    | ✅   | PBI-068 / TASK-502                                                             |
| `canonical`                       | canonical リンクが解決               | ✅   | PBI-067 / TASK-404 + `seoMetaPlugin` ビルド時注入                              |
| `structured-data`（手動チェック） | 構造化データ妥当                     | ✅   | PBI-068 / TASK-501 JSON-LD `WebApplication`                                    |
| `viewport`                        | `<meta name="viewport">`             | ✅   | `width=device-width, initial-scale=1.0`                                        |

### Best Practices（想定スコア: 100）

| audit ID                                         | 項目                                 | 状態 | 根拠                                                                                                                                                                                             |
| ------------------------------------------------ | ------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `is-on-https`                                    | HTTPS で配信                         | ✅   | GitHub Pages デフォルト                                                                                                                                                                          |
| `geolocation-on-start` / `notification-on-start` | 起動時にパーミッションを求めない     | ✅   | アプリは Geolocation/Notifications API を呼び出さない（ソース全体で参照ゼロ）                                                                                                                    |
| `no-vulnerable-libraries`                        | 既知脆弱性ライブラリ不使用           | ✅   | Sprint015 で Dependabot/`pnpm audit` クリーン（PBI-064 完了済み）                                                                                                                                |
| `errors-in-console`                              | コンソールエラーなし                 | ✅   | 既存 vitest 480+ 件 + ローカル `pnpm preview` で `console.error` 未観測                                                                                                                          |
| `image-alt`                                      | 画像に alt 属性                      | ✅   | アプリは `<img>` を使用しない（インライン SVG のみ）。og:image:alt も併記                                                                                                                        |
| `image-size-responsive`                          | 適切なサイズの画像                   | N/A  | アプリ内 `<img>` ゼロ                                                                                                                                                                            |
| `unsized-images`                                 | width/height 属性                    | ✅   | og:image:width/height 併記。アプリ内 `<img>` ゼロ                                                                                                                                                |
| `csp-xss`                                        | CSP                                  | △    | GitHub Pages では `Content-Security-Policy` ヘッダ設定不可（メタタグ方式は inline-style 影響大）。リスクは XSS 対策（`dangerouslySetInnerHTML` 不使用 / React エスケープ / DoD §10-2）で代替担保 |
| `deprecations`                                   | 非推奨 API 不使用                    | ✅   | React 19 + Vite 7 系で deprecated API 参照なし                                                                                                                                                   |
| `paste-preventing-inputs`                        | 貼り付けを禁止する入力フィールドなし | ✅   | 全 textarea/input は通常入力                                                                                                                                                                     |
| `valid-source-maps`                              | source map が妥当                    | ✅   | Vite 既定で生成                                                                                                                                                                                  |
| `inspector-issues`                               | DevTools Issue 0 件                  | ✅   | `pnpm preview` ローカル確認で警告なし                                                                                                                                                            |

### PWA（想定スコア: インストール可能要件を満たす）

> Lighthouse 11 系で PWA カテゴリは廃止予定だが、Sprint016 は manifest 整備を含むため等価な audit を手動チェックで記録する。

| 項目                                                                                        | 状態 | 根拠                                                                |
| ------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------- |
| manifest.webmanifest が `<link rel="manifest">` で参照される                                | ✅   | PBI-066 / TASK-304                                                  |
| name / short_name / start_url / scope / display=standalone / theme_color / background_color | ✅   | PBI-066 / TASK-303 + `manifest.test.ts` 24 件で検証                 |
| icons に 192/512 PNG（any）+ maskable + SVG                                                 | ✅   | PBI-066 / TASK-302                                                  |
| theme-color が `<meta>` に設定（light/dark）                                                | ✅   | PBI-066 / TASK-304                                                  |
| HTTPS 配信                                                                                  | ✅   | GitHub Pages 既定                                                   |
| viewport meta                                                                               | ✅   | `width=device-width, initial-scale=1.0`                             |
| Service Worker                                                                              | △    | Sprint016 スコープ外（オフライン要件は PO 未要請。将来 PBI 化候補） |

## DAY4 で対応した改善

| TASK     | 内容                                                                                        | 結果                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-601 | Lighthouse カテゴリ別の audit を本ドキュメントで一覧化（実 CLI 計測は GitHub Pages 公開後） | 上記のとおり                                                                                                                                        |
| TASK-602 | critical/serious 相当の主要指摘を解消 + 画像 alt/width/height 再点検                        | アプリソース内 `<img>` がゼロであることを `seo-assets.test.ts` で空走前提保証。og:image に alt/width/height 併記済（PBI-067 で対応済 / 再点検合格） |
| TASK-603 | noscript フォールバック日本語整理 + prefers-reduced-motion 配慮の既存実装回帰確認           | [index.html](../front/index.html) `<noscript>` 追加（プロダクト概要 + 有効化案内 + role="alert" + 外部参照ゼロ）。既存 motion 配慮箇所に変更なし    |

## 残課題（GitHub Pages 公開後の手動計測対象）

- `lighthouse https://katuz.github.io/ai-scrum-inbuscket/ --only-categories=seo,best-practices --view` を実行し、本ドキュメントのスコアを実測値で更新する。
- `chrome://inspect` の Manifest タブで installable 判定が成立することを確認する（Service Worker 未導入のため一部 PWA audit は欠落想定）。

## 参考

- DoD §10-2: `dangerouslySetInnerHTML` 不使用
- PBI-058 規律: env 依存値はビルド時注入（src 側 `import.meta.env` 直参照禁止）
- PBI-059 規律: `import.meta.env.BASE_URL` でサブパス解決
- PBI-082 / Sprint020: 本ドキュメントを継続活用しつつ、KPI 監視・スプリント横断 SEO チェックリストは [seo_operations.md](./seo_operations.md) に集約。本 §6 audit ID 台帳は同 §6（Lighthouse 定点観測手順）から参照される。

## 公開時点系列値（A-100 ハンドオフ反映）

> Sprint022 公開（PBI-079/080 で 41 ルート公開）と Sprint023 公開（PBI-073/083/074 計画）後の Lighthouse SEO 系列値を本表に追記する。
> Sprint023 DAY1 D1-c（中村）：本番 URL 404（`IMP-002`）のため、A-98「本番未到達」運用で **dist 計測継続採用**（§6.1 手順）を「公開時点代理値」として記録。本番到達次第、対象行の値を実測値で上書き更新する。

| スプリント | 公開時点   | 計測モード        | SEO スコア  | Best Practices | メモ                                                                                                                                                                                                                                                                                                            |
| ---------- | ---------- | ----------------- | ----------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sprint022  | 2026-09-30 | dist 代理（§6.1） | 100（推定） | 100（推定）    | sprint022 完了時点の本番計測予定が `IMP-002`（GitHub Pages 本番 URL 404）でブロック。A-98「本番未到達」運用に従い dist 計測値（公開コードと同一）を「公開時点代理値」として記録。技術 SEO 退行ゼロは `seo-assets.test.ts` 33 ＋ `Router.seo.test.tsx` 13 で代理担保。実測値への置換は `IMP-002` 解消後。        |
| Sprint023  | 2026-09-30 | dist 代理（§6.1） | 100（推定） | 100（推定）    | Sprint023 DAY1 D1-c（中村）：本スプリントは PBI-073（cases.json 整備）/ PBI-083（章末回遊）/ PBI-074（基準線）で 41 ルート維持。コード追加は内部リンク・コンテンツ拡充中心で SEO 退行リスクは低。実測スコアは Sprint023 Sprint Review 直前の DAY5 dist 計測で再確認し、`IMP-002` 解消後に本行を実測値で上書き。 |

> **注**: 「dist 代理」とは本番 URL 計測の代わりに `pnpm build` 出力を `pnpm preview` で配信し Lighthouse CLI を実行する手法（§6.1）を指す。本番未到達期間中は本系列値を継続的に「公開時点代理値」として運用する。

## 更新履歴

| 日付       | 更新内容                                                                                                                                                                                                                        | 更新者         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 2026-09-30 | Sprint023 DAY1 D1-c：「公開時点系列値（A-100 ハンドオフ反映）」セクション新設。本番 URL 404（`IMP-002`）のため A-98「本番未到達」運用で Sprint022/Sprint023 公開時点行を dist 代理値として追記。実測値置換は `IMP-002` 解消後。 | 中村（助っ人） |
