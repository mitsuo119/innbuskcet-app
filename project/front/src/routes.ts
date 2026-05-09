/**
 * 公開ルート単一ソース定義（PBI-081 / TASK-081-1）
 *
 * SEO 関連の参照源として機能する公開ルート一覧。以下の利用箇所の単一ソースとなる。
 * - `scripts/generate-sitemap.mjs`（TASK-081-2）の sitemap.xml 自動生成
 * - `Router.seo.test.tsx` 拡張（TASK-078-2/078-3/078-4）でのメタ重複/未定義検知
 * - `sitemap-coverage.test`（TASK-081-3）での実ルートと sitemap 掲載 URL の差分検知
 *
 * 動的セグメント（`/patterns/:id` / `/reference/:chapterId`）は、sitemap 掲載対象として
 * 採用する代表値のみを export する（フル列挙ではなく、SEO 露出する代表ルート）。
 *
 * ルート追加手順は `project/docs/seo_metadata_sitemap_guide.md` を参照すること。
 */

/** sitemap.xml の changefreq に許される値。 */
export type SitemapChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

/** 公開ルート 1 件分の SEO メタデータ。 */
export interface PublicRoute {
  /** アプリ内パス（先頭 `/` 必須・末尾 `/` なし。トップは `/` のみ）。 */
  path: string;
  /** sitemap.xml の `<changefreq>` に書き込む値。 */
  changefreq: SitemapChangeFreq;
  /** sitemap.xml の `<priority>` に書き込む値（0.0〜1.0）。 */
  priority: number;
}

/**
 * sitemap 掲載対象の公開ルート一覧（SEO 単一ソース）。
 *
 * 並び順: トップ → 主要静的ルート（patterns / reference）→
 *         主要動的ルート（reference 章 / pattern 詳細）→ 法務・連絡系。
 * ※ ここに新ルートを追加すると、TASK-081-2 で sitemap.xml に自動反映される予定。
 */
export const PUBLIC_ROUTES: readonly PublicRoute[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/patterns', changefreq: 'monthly', priority: 0.8 },
  { path: '/reference', changefreq: 'monthly', priority: 0.8 },
  { path: '/reference/chapter01', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter02', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter05', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter08', changefreq: 'monthly', priority: 0.7 },
  { path: '/patterns/1', changefreq: 'monthly', priority: 0.6 },
  { path: '/patterns/8', changefreq: 'monthly', priority: 0.6 },
  { path: '/patterns/20', changefreq: 'monthly', priority: 0.6 },
  { path: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
  { path: '/terms-of-service', changefreq: 'yearly', priority: 0.3 },
  { path: '/contact', changefreq: 'yearly', priority: 0.3 },
] as const;

/**
 * sitemap 掲載対象の reference 章 ID。
 * Router.tsx の `VALID_REFERENCE_IDS` と一致させること（PBI-081 単一ソース化）。
 */
export const SITEMAP_REFERENCE_CHAPTER_IDS: readonly string[] = [
  'chapter01',
  'chapter02',
  'chapter05',
  'chapter08',
];

/** sitemap 掲載対象の pattern ID（数値）。 */
export const SITEMAP_PATTERN_IDS: readonly number[] = [1, 8, 20];

/** 公開ルートの path のみを抽出した一覧（テスト・sitemap 生成での突合用）。 */
export const PUBLIC_ROUTE_PATHS: readonly string[] = PUBLIC_ROUTES.map((route) => route.path);
