/**
 * 広告配置ポリシー判定ヘルパー（PBI-100 / TASK-100-2 / Sprint026 DAY4）。
 *
 * `project/docs/adsense_placement_policy.md` の「広告掲載最小コンテンツ基準（6条件）」を
 * 1 つの純関数 `shouldShowAds(pageMeta)` に集約する。AdSlot.tsx 側はこの判定の上位レイヤーで
 * 呼び出し、true の場合のみ `<AdSlot />` をレンダリングする。
 *
 * - C1（内部の本文欠落検知）: `bodyCharCount` で判定（省略時はビルド時検証を利用）。
 * - C2（非ナビゲーション）: `kind` が一覧（reference-list / pattern-list）の場合は false。
 * - C3（独自）/ C4（完成済）: 運営側が `kind` 単位で保証（コードでは kind 別に許可）。
 * - C5（非法務固定）: `kind = legal` は false。
 * - C6（プリレンダ可視）: PBI-097 で全ルート対応済（hidden 0件 / 退行は vitest で検知）。
 *
 * 副作用なし・依存なし。テストしやすいよう純関数。
 */

/** 広告表示対象ページの分類 */
export type AdPageKind =
  | 'home' // `/`（学習トップ・演習画面）
  | 'reference-chapter' // `/reference/chapterXX`（全12章）
  | 'case-detail' // `/cases/case-XXX`（代表ケース20件）
  | 'pattern-detail' // `/patterns/N`（パターン詳細20件）
  | 'reference-list' // `/reference`（章一覧）
  | 'pattern-list' // `/patterns`（パターン一覧）
  | 'legal' // `/about` `/terms` `/terms-of-service` `/privacy-policy` `/contact`
  | 'search'
  | 'not-found'
  | 'error';

/** 広告表示判定の入力メタ */
export interface AdPageMeta {
  /** ページ種別 */
  kind: AdPageKind;
  /**
   * プリレンダ本文文字数（C1 判定）。
   * 省略時は kind の既定値で判断する（本文は別途ビルド時に検証）。
   */
  bodyCharCount?: number;
}

/** 広告表示が許可される kind 集合（C2 / C5 を満たす種別） */
const SHOWABLE_KINDS = new Set<AdPageKind>([
  'home',
  'reference-chapter',
  'case-detail',
  'pattern-detail',
]);

/** 本文欠落検知の内部基準。Googleの審査基準ではない。 */
export const MIN_BODY_CHAR_COUNT = 1000;

/**
 * 広告掲載の可否を判定する純関数（広告配置ポリシーの単一判定窓口）。
 *
 * - SHOWABLE_KINDS に含まれる kind かつ
 * - bodyCharCount が省略または有限数で >= 1000 の場合のみ true。
 *
 * それ以外（一覧 / 法務 / 検索 / 404 / エラー / 本文不足）は false。
 */
export function shouldShowAds(pageMeta: AdPageMeta): boolean {
  if (!SHOWABLE_KINDS.has(pageMeta.kind)) return false;
  if (
    pageMeta.bodyCharCount !== undefined &&
    (!Number.isFinite(pageMeta.bodyCharCount) || pageMeta.bodyCharCount < MIN_BODY_CHAR_COUNT)
  ) {
    return false;
  }
  return true;
}
