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
  { path: '/reference/chapter03', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter04', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter05', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter06', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter07', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter08', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter09', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter10', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter11', changefreq: 'monthly', priority: 0.7 },
  { path: '/reference/chapter12', changefreq: 'monthly', priority: 0.7 },
  { path: '/patterns/1', changefreq: 'monthly', priority: 0.6 },
  { path: '/patterns/8', changefreq: 'monthly', priority: 0.6 },
  { path: '/patterns/20', changefreq: 'monthly', priority: 0.6 },
  // PBI-079 / TASK-079-2 後半（DAY2）: 代表ケース 20 件を /cases/:id 単独 URL として sitemap 掲載。
  { path: '/cases/case-001', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-002', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-004', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-010', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-012', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-013', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-015', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-016', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-017', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-018', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-019', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-021', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-029', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-031', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-035', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-037', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-039', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-042', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-048', changefreq: 'monthly', priority: 0.5 },
  { path: '/cases/case-053', changefreq: 'monthly', priority: 0.5 },
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
  'chapter03',
  'chapter04',
  'chapter05',
  'chapter06',
  'chapter07',
  'chapter08',
  'chapter09',
  'chapter10',
  'chapter11',
  'chapter12',
];

/** sitemap 掲載対象の pattern ID（数値）。 */
export const SITEMAP_PATTERN_IDS: readonly number[] = [1, 8, 20];

/**
 * sitemap 掲載対象の case ID（PBI-079 / TASK-079-2 / Sprint022 DAY1）。
 *
 * 代表ケース 20 件（難易度均等・全 20 パターン偏りなし）。選定根拠は
 * `scrum/sprint022/sprint_backlog.md` §代表ケース20件選定一覧 を参照。
 *
 * DAY1 時点では `PUBLIC_ROUTES` への `/cases/:id` 拡張は行わず、データ定義のみを先行投入する。
 * `PUBLIC_ROUTES` への組込・Router/CaseDetail 実装は TASK-079-2 後半（DAY2）以降で実施する。
 */
export const SITEMAP_CASE_IDS: readonly string[] = [
  'case-001',
  'case-053',
  'case-017',
  'case-010',
  'case-015',
  'case-042',
  'case-019',
  'case-004',
  'case-029',
  'case-035',
  'case-016',
  'case-002',
  'case-018',
  'case-013',
  'case-039',
  'case-048',
  'case-012',
  'case-037',
  'case-021',
  'case-031',
];

/** 公開ルートの path のみを抽出した一覧（テスト・sitemap 生成での突合用）。 */
export const PUBLIC_ROUTE_PATHS: readonly string[] = PUBLIC_ROUTES.map((route) => route.path);

/**
 * 代表ケース 20 件のメタデータ（PBI-079 / TASK-079-3 / Sprint022 DAY2）。
 *
 * `/cases/:id` で表示する際の SEO（title/description）にパターン名と難易度を注入し、
 * 他ケース／他ルートとの description 重複を構造的に防ぐ（R-4 対策）。
 *
 * 選定根拠は `scrum/sprint022/sprint_backlog.md` §代表ケース20件選定一覧を参照。
 */
export type CaseDifficulty = '初級' | '中級' | '上級';

export interface CaseDetailMeta {
  /** ケース ID（cases.json と一致）。 */
  id: string;
  /** 主要パターン番号（1〜20）。 */
  patternId: number;
  /** 主要パターン名（patternData.ts と一致）。 */
  patternName: string;
  /** 難易度判定（初級／中級／上級）。 */
  difficulty: CaseDifficulty;
}

export const CASE_DETAIL_META: readonly CaseDetailMeta[] = [
  { id: 'case-001', patternId: 1, patternName: '顧客クレーム', difficulty: '上級' },
  { id: 'case-002', patternId: 12, patternName: '会議・セミナーへの参加依頼', difficulty: '初級' },
  { id: 'case-004', patternId: 8, patternName: 'ハラスメント報告', difficulty: '上級' },
  { id: 'case-010', patternId: 4, patternName: '部下の退職・異動の相談', difficulty: '上級' },
  { id: 'case-012', patternId: 17, patternName: '上位方針の伝達・対応', difficulty: '中級' },
  {
    id: 'case-013',
    patternId: 14,
    patternName: '情報セキュリティインシデント',
    difficulty: '上級',
  },
  {
    id: 'case-015',
    patternId: 5,
    patternName: '部下間の対立・人間関係トラブル',
    difficulty: '中級',
  },
  { id: 'case-016', patternId: 11, patternName: '業務改善提案', difficulty: '中級' },
  { id: 'case-017', patternId: 3, patternName: '新規取引・営業案件', difficulty: '中級' },
  { id: 'case-018', patternId: 13, patternName: '事故・災害報告', difficulty: '中級' },
  { id: 'case-019', patternId: 7, patternName: '部下の有給・休暇申請', difficulty: '初級' },
  { id: 'case-021', patternId: 19, patternName: '前任者の未完了案件', difficulty: '上級' },
  { id: 'case-029', patternId: 9, patternName: 'プロジェクト遅延・品質問題', difficulty: '上級' },
  {
    id: 'case-031',
    patternId: 20,
    patternName: '複合案件（複数パターンの組み合わせ）',
    difficulty: '上級',
  },
  { id: 'case-035', patternId: 10, patternName: '予算承認・経費申請', difficulty: '初級' },
  { id: 'case-037', patternId: 18, patternName: '他部署からの依頼・調整', difficulty: '初級' },
  {
    id: 'case-039',
    patternId: 15,
    patternName: 'コンプライアンス違反（不正行為）',
    difficulty: '中級',
  },
  { id: 'case-042', patternId: 6, patternName: '部下のパフォーマンス問題', difficulty: '中級' },
  { id: 'case-048', patternId: 16, patternName: '組織変更・人員配置', difficulty: '中級' },
  {
    id: 'case-053',
    patternId: 2,
    patternName: '取引先からの要求（値引き・仕様変更等）',
    difficulty: '初級',
  },
];

/** ケース ID → メタデータの O(1) ルックアップ用 Map。 */
export const CASE_DETAIL_META_BY_ID: ReadonlyMap<string, CaseDetailMeta> = new Map(
  CASE_DETAIL_META.map((meta) => [meta.id, meta]),
);
