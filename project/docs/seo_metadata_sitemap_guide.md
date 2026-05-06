# SEOメタ更新・サイトマップ運用ガイド（PBI-072）

## 目的

主要ページの `title/description/OGP` と `sitemap.xml` の整合を維持し、公開URL漏れを防ぐ。

## 対象ファイル

- `project/front/src/Router.tsx`（ルート別 title/description/OGP 同期）
- `project/front/index.html`（共通メタ・JSON-LD）
- `project/front/public/sitemap.xml`（公開ルート一覧）
- `project/front/public/robots.txt`（Sitemap参照）

## 変更時チェック手順

1. ルート追加/変更時、`Router.tsx` の `resolveRouteSeo` にタイトル・説明文を追加する。
2. `sitemap.xml` に対応する `#/route` を追加する。
3. `robots.txt` に `Sitemap: __SITE_URL__sitemap.xml` があることを確認する。
4. `pnpm test` で `seo.test.ts` / `seo-assets.test.ts` / `Router.seo.test.tsx` がPASSすることを確認する。
5. `pnpm build` 実行後、`dist/sitemap.xml` と `dist/robots.txt` の `__SITE_URL__` が置換済みであることを確認する。

## 公開ページ対応表（Sprint018 DAY4時点）

| 画面                     | ルート                           | sitemap掲載 |
| ------------------------ | -------------------------------- | ----------- |
| ホーム                   | `#/`（実体はルート）             | 済          |
| 解説リファレンス         | `#/reference`                    | 済          |
| 解説章（主要）           | `#/reference/chapter01,02,05,08` | 済          |
| パターン一覧             | `#/patterns`                     | 済          |
| パターン詳細（主要導線） | `#/patterns/1,8,20`              | 済          |
| プライバシーポリシー     | `#/privacy-policy`               | 済          |
| 利用規約                 | `#/terms-of-service`             | 済          |
| お問い合わせ             | `#/contact`                      | 済          |
