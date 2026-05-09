# SEOメタ更新・サイトマップ運用ガイド（PBI-072）

## 目的

主要ページの `title/description/OGP` と `sitemap.xml` の整合を維持し、公開URL漏れを防ぐ。

## 対象ファイル

- `project/front/src/routes.ts`（公開ルート単一ソース／PBI-081）
- `project/front/src/Router.tsx`（ルート別 title/description/OGP 同期）
- `project/front/index.html`（共通メタ・JSON-LD）
- `project/front/public/sitemap.xml`（公開ルート一覧）
- `project/front/public/robots.txt`（Sitemap参照）

## ルート追加手順（PBI-081 単一ソース化以降）

1. `project/front/src/routes.ts` の `PUBLIC_ROUTES` に新しい `path / changefreq / priority` を追加する。
2. reference 章 / pattern 詳細を増やす場合は併せて `SITEMAP_REFERENCE_CHAPTER_IDS` / `SITEMAP_PATTERN_IDS` を更新する（Router の有効ルート判定が同期する）。
3. `Router.tsx` の `resolveRouteSeo` に対応する title / description を追加する。
4. `pnpm test` で `routes.test.ts` / `Router.seo.test.tsx` / `seo-assets.test.ts` がPASSすることを確認する。
5. `pnpm build` 実行後、`dist/sitemap.xml` と `dist/robots.txt` の `__SITE_URL__` が置換済みであることを確認する。
   ※ TASK-081-2 完了後は `dist/sitemap.xml` 自体が `routes.ts` から自動生成される。

## 変更時チェック手順（旧手順・参考）

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

## 公開ルート × メタマトリクス棚卸し（PBI-078 / TASK-078-1）

`Router.tsx#resolveRouteSeo` を単一ソースとし、`PUBLIC_ROUTES`（routes.ts）と突合した現状一覧。
canonical / OGP は Router の useEffect で動的注入される（`og:url` は `window.location` 由来）。

| path                        | title（`                                  | インバスケット - 学習アプリ` 連結前） | description 要旨                  | canonical（自ルート） | noindex |
| --------------------------- | ----------------------------------------- | ------------------------------------- | --------------------------------- | --------------------- | ------- |
| `/`                         | `インバスケット - 学習アプリ`（連結なし） | 学習アプリ全体紹介                    | `__SITE_URL__`                    | -                     |
| `/patterns`                 | `パターン別解説`                          | 全20パターンの優先度と回答骨格        | `__SITE_URL__patterns`            | -                     |
| `/patterns/1`               | `パターン1：<name>`                       | パターン特徴・優先度の目安・回答骨格  | `__SITE_URL__patterns/1`          | -                     |
| `/patterns/8`               | `パターン8：<name>`                       | 同上                                  | `__SITE_URL__patterns/8`          | -                     |
| `/patterns/20`              | `パターン20：<name>`                      | 同上                                  | `__SITE_URL__patterns/20`         | -                     |
| `/reference`                | `解説リファレンス`                        | 章構成で学べる解説ページ              | `__SITE_URL__reference`           | -                     |
| `/reference/chapter01`      | `解説リファレンス：<chapter01.title>`     | 章別フレームワーク確認                | `__SITE_URL__reference/chapter01` | -                     |
| `/reference/chapter02`      | `解説リファレンス：<chapter02.title>`     | 同上                                  | `__SITE_URL__reference/chapter02` | -                     |
| `/reference/chapter05`      | `解説リファレンス：<chapter05.title>`     | 同上                                  | `__SITE_URL__reference/chapter05` | -                     |
| `/reference/chapter08`      | `解説リファレンス：<chapter08.title>`     | 同上                                  | `__SITE_URL__reference/chapter08` | -                     |
| `/privacy-policy`           | `プライバシーポリシー`                    | 個人情報の取り扱い方針                | `__SITE_URL__privacy-policy`      | -                     |
| `/terms-of-service`         | `利用規約`                                | 利用条件と禁止事項                    | `__SITE_URL__terms-of-service`    | -                     |
| `/contact`                  | `お問い合わせ`                            | お問い合わせ方法                      | `__SITE_URL__contact`             | -                     |
| `not-found`（ルート不一致） | `ページが見つかりません`                  | 不存在/移動済の旨                     | -                                 | あり                  |

**重複検知の観点（DAY3 で TASK-078-2/3/4 が自動化対象とする項目）:**

- title の連結後文字列（`<page> | インバスケット - 学習アプリ`）は全公開ルートで一意であること（連結前で一意なら自動的に一意）。
- description は意味が近接する `/reference` と `/reference/chapterXX` で 1 文字以上差分があること（章別はテンプレ化されているので章 title が混入することで差分担保）。
- canonical は絶対 URL 化（`__SITE_URL__` 置換済）かつ自ルート相当であること。
- noindex は `not-found` のみ付与、それ以外には付与されないこと。
- 新規ルート追加時に `resolveRouteSeo` の case が未追加のまま公開されないこと（fail-on-missing 検証で `applySEO 同等の document.title 変化がデフォルト分岐へ落ちない`ことを確認）。

## メタ重複検知の自動化運用（PBI-078 / Sprint021 DAY4 反映）

`Router.seo.test.tsx` を拡張し、`PUBLIC_ROUTE_PATHS`（`src/routes.ts`）を反復走査して以下を自動検証する。新規ルート追加時に検知漏れが発生しない構造を担保する。

| テスト ID                                                                     | 観点                                                                                                                                  |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-078-2: 全公開ルートで title が一意                                       | 全 `PUBLIC_ROUTE_PATHS` を mount し `document.title` を Set で集約。重複時 FAIL。                                                     |
| TASK-078-2: 全公開ルートで description が一意                                 | `<meta name="description">` の content を Set で集約。pattern 詳細・reference 章は名称/章タイトル注入で構造的に差分化。               |
| TASK-078-3: canonical が `origin + 自ルート pathname` の絶対URL               | `<link rel="canonical">` の href が `${window.location.origin}${path}` 一致＋`http(s)://` 始まり＋`__SITE_URL__` 残存無し。           |
| TASK-078-4: 公開ルートに noindex が付与されない                               | `<meta name="robots">` に `noindex` を含まないこと（noindex 限定付与）。                                                              |
| TASK-078-4: 不存在ルートでは noindex が付与される                             | `/no-such-route` 等で `noindex` が必ず付与され、`document.title` が「ページが見つかりません」を含むこと。                             |
| TASK-078-4: title が APP_NAME 単独に落ちない（resolveRouteSeo case 漏れ検知） | `/` 以外の全ルートで ` \| インバスケット - 学習アプリ` 連結形式となること（default 分岐に落ちると APP_NAME 単独となりホームと衝突）。 |

### ルート追加時の運用（PBI-078 反映）

1. `src/routes.ts` の `PUBLIC_ROUTES` に新ルートを追加。
2. `Router.tsx#resolveRouteSeo` に対応する `title` / `description` を追加（pattern/章のように動的セグメントを含む場合は `name` / `chapter.title` を description に注入し他ページとの重複を構造的に避ける）。
3. `pnpm test` で `Router.seo.test.tsx`（PBI-078 群）/ `routes.test.ts` / `sitemap-coverage.test.ts` が PASS することを確認。重複が出る場合は description のテンプレに名称/章タイトルを混入する。
4. `pnpm build` 後、`dist/sitemap.xml` / `dist/robots.txt` の `__SITE_URL__` が置換済みであることを確認。
5. PR チェックリスト §10（SEO / サイトマップ整合）の項目に従い、Sprint Review 前に `seo_operations.md §7` を記入する。
