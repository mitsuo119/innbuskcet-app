/**
 * History API ベースルーター（PBI-076 / TASK-076-1）
 *
 * 旧仕様（Sprint011〜019）はハッシュベース（`#/...`）だったが、JavaScript SEO 観点で
 * 検索エンジンが正規 URL として扱いやすい pathname ベース（History API）へ移行する。
 *
 * 設計:
 * - SoT は `window.location.pathname`。`base` prefix（GitHub Pages サブパス）は
 *   `nav.ts#stripBase` で剥がしてから内部 path にマッチさせる。
 * - レガシー `#/...` ハッシュはマウント時／hashchange 時に検出し、`history.replaceState` で
 *   pathname へ書き換えてから状態を再計算する（外部ブックマーク互換を維持・TASK-076-4 の土台）。
 * - 戻る/進むは `popstate`、内部 push 遷移は `nav.ts#navigate` 経由の
 *   `NAVIGATE_EVENT` カスタムイベントで再描画する。
 * - 既存 `<a href="#/...">` の onClick は本ファイル内の delegated click handler で吸収し、
 *   pushState 化する（modifier キー併用や中央/右クリックは尊重）。
 *
 * ルート一覧（pathname / 旧ハッシュ → 互換）:
 *   /                            ← #/ または ハッシュ無し
 *   /privacy-policy              ← #/privacy-policy
 *   /terms-of-service            ← #/terms-of-service
 *   /contact                     ← #/contact
 *   /patterns                    ← #/patterns
 *   /patterns/:id                ← #/patterns/:id
 *   /reference                   ← #/reference
 *   /reference/:chapterId        ← #/reference/:chapterId
 *
 * 不一致 URL は 'not-found' に解決し、Router 側で meta robots noindex を付与する
 * （soft 404 回避の暫定実装。詳細な404画面コンポーネントは TASK-076-3 で拡張する）。
 */
import { useEffect, useState } from 'react';
import App from './App';
import { REFERENCE_DATA, type ReferenceChapterId } from './data/referenceData';
import { findPatternById } from './data/patternData';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Contact } from './pages/Contact';
import { PatternList } from './pages/PatternList';
import { PatternDetail } from './pages/PatternDetail';
import { CaseDetail } from './pages/CaseDetail';
import { ReferencePage } from './pages/ReferencePage';
import { NotFound } from './pages/NotFound';
import { NAVIGATE_EVENT, isPlainLeftClick, navigate, stripBase, withBase } from './nav';
import {
  CASE_DETAIL_META_BY_ID,
  SITEMAP_REFERENCE_CHAPTER_IDS,
  type CaseDetailMeta,
} from './routes';

const APP_NAME = 'インバスケット - 学習アプリ';

interface RouteSeo {
  title: string;
  description: string;
  /** soft 404 回避用の noindex 付与フラグ（PBI-076）。 */
  noindex?: boolean;
  /**
   * JSON-LD として `<head>` に注入する構造化データ（PBI-079 / TASK-079-3）。
   * `null` を返したルートでは既存の JSON-LD を撤去する。
   */
  jsonLd?: Record<string, unknown> | null;
  /**
   * `data-route-jsonld` 属性に書き込む routeKey（PBI-080 / TASK-080-5 / DAY5）。
   * 省略時は既定で `case-detail` を用いる（既存 PBI-079 互換）。
   * ルートを跨いで JSON-LD を切り替えるため、syncJsonLd は本キーで残留タグを管理する。
   */
  jsonLdKey?: string;
}

function resolveRouteSeo(state: RouterState): RouteSeo {
  switch (state.page) {
    case 'reference': {
      if (state.referenceChapterId) {
        const chapter = REFERENCE_DATA.find((item) => item.id === state.referenceChapterId);
        if (chapter) {
          // PBI-078 / TASK-078-2: 章タイトルを description に注入し、`/reference` および
          // 他章ページとの description 重複を構造的に防止する。
          // PBI-080 / TASK-080-5（DAY5）: 各章ページに BreadcrumbList JSON-LD を注入し、
          // 受入基準「title/description/canonical/BreadcrumbList JSON-LD が一意」を満たす。
          const jsonLd = buildChapterBreadcrumbJsonLd(chapter.id, chapter.title);
          return {
            title: `解説リファレンス：${chapter.title}`,
            description: `インバスケット学習の「${chapter.title}」を中心に、要点とフレームワークを章別に確認できる解説リファレンスページです。`,
            jsonLd,
            jsonLdKey: 'reference-chapter',
          };
        }
      }
      return {
        title: '解説リファレンス',
        description:
          'インバスケットの基礎・採点基準・優先順位づけ・案件パターンを章構成で学べる解説リファレンスの目次ページです。',
      };
    }
    case 'patterns':
      return {
        title: 'パターン別解説',
        description:
          'インバスケット全20パターンの優先度傾向と回答の骨格を一覧で確認できるパターン別解説のトップページです。',
      };
    case 'pattern-detail': {
      const pattern = state.patternId ? findPatternById(state.patternId) : undefined;
      if (pattern) {
        // PBI-078 / TASK-078-2: パターン名・ID を description に注入し、他パターンページとの重複を防止する。
        return {
          title: `パターン${pattern.id}：${pattern.name}`,
          description: `インバスケット案件パターン${pattern.id}「${pattern.name}」の特徴・優先度の目安・回答の骨格を確認できる詳細ページです。`,
        };
      }
      return {
        title: 'パターン詳細',
        description:
          'インバスケット案件のパターン詳細ページです。特徴と優先度判定の観点を確認できます。',
      };
    }
    case 'case-detail': {
      // PBI-079 / TASK-079-3（DAY2）: 代表ケース 20 件の単独 URL SEO。
      // パターン名＋難易度を description に注入し title/description の重複を構造的に防ぐ（R-4 対策）。
      const meta = state.caseId ? CASE_DETAIL_META_BY_ID.get(state.caseId) : undefined;
      if (meta) {
        const num = meta.id.replace('case-', '');
        const title = `ケース${num}：パターン${meta.patternId}「${meta.patternName}」（${meta.difficulty}）`;
        const description = `インバスケット代表ケース${num}（パターン${meta.patternId}「${meta.patternName}」・難易度${meta.difficulty}）の本文と解説、模範回答の骨格を確認できる単独URLページです。`;
        const jsonLd = buildCaseBreadcrumbJsonLd(meta);
        return { title, description, jsonLd, jsonLdKey: 'case-detail' };
      }
      return {
        title: '代表ケース詳細',
        description:
          'インバスケット代表ケースの詳細ページです。パターン別の本文・解説・模範回答の骨格を確認できます。',
      };
    }
    case 'privacy-policy':
      return {
        title: 'プライバシーポリシー',
        description: 'インバスケット学習アプリの個人情報の取り扱い方針を記載しています。',
      };
    case 'terms-of-service':
      return {
        title: '利用規約',
        description: 'インバスケット学習アプリの利用条件と禁止事項を記載しています。',
      };
    case 'contact':
      return {
        title: 'お問い合わせ',
        description: 'インバスケット学習アプリへのお問い合わせ方法を案内するページです。',
      };
    case 'not-found':
      return {
        title: 'ページが見つかりません',
        description: 'お探しのページは存在しないか、移動・削除された可能性があります。',
        noindex: true,
      };
    default:
      return {
        title: APP_NAME,
        description:
          '管理職昇進試験のインバスケット演習を、案件処理・優先順位付け・委任判断などのフレームワークから模擬試験までブラウザで体系的に学べる無料の日本語学習Webアプリです。',
      };
  }
}

function setMetaByName(name: string, content: string): void {
  const element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  element?.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string): void {
  const element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  element?.setAttribute('content', content);
}

/**
 * PBI-078 / TASK-078-3: ルート別 canonical を絶対 URL（origin + pathname）で同期する。
 * `<link rel="canonical">` が存在しなければ生成し、href を自ルート相当に更新する。
 * クエリ・ハッシュは canonical の対象外（重複URL収斂目的）。
 */
function syncCanonicalLink(absoluteUrl: string): void {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', absoluteUrl);
}

/**
 * `meta[name="robots"]` を指定値に同期する。要素が無ければ noindex 付与時のみ生成する。
 * 通常ルートでは `index, follow`（デフォルト相当）を維持する。
 */
function syncRobotsMeta(noindex: boolean): void {
  let element = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!element) {
    if (!noindex) return;
    element = document.createElement('meta');
    element.setAttribute('name', 'robots');
    document.head.appendChild(element);
  }
  element.setAttribute('content', noindex ? 'noindex, follow' : 'index, follow');
}

/**
 * PBI-079 / TASK-079-3: ルート別 JSON-LD（構造化データ）を `<head>` に同期する。
 *
 * - `data-route-jsonld` 属性付きの `<script type="application/ld+json">` を
 *   ルートごとに 1 タグだけ管理する（複数注入回避・残留防止）。
 * - `data` が `null` の場合、既存の data-route-jsonld タグをすべて撤去する。
 * - PBI-080 / TASK-080-5（DAY4）: routeKey を引数化し case-detail 以外の
 *   ルート（reference-chapter 等）でも BreadcrumbList JSON-LD を注入できるよう拡張。
 */
const JSON_LD_DATA_ATTR = 'data-route-jsonld';

function syncJsonLd(
  data: Record<string, unknown> | null | undefined,
  routeKey: string = 'case-detail',
): void {
  // ルート切替時に異なる routeKey の残留タグが残らないよう、まず全 data-route-jsonld を撤去する。
  const allExisting = document.querySelectorAll<HTMLScriptElement>(`script[${JSON_LD_DATA_ATTR}]`);
  allExisting.forEach((node) => {
    if (data == null || node.getAttribute(JSON_LD_DATA_ATTR) !== routeKey) {
      node.remove();
    }
  });
  if (data == null) return;
  const existing = document.querySelector<HTMLScriptElement>(
    `script[${JSON_LD_DATA_ATTR}="${routeKey}"]`,
  );
  const json = JSON.stringify(data);
  if (existing) {
    if (existing.textContent !== json) existing.textContent = json;
    return;
  }
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute(JSON_LD_DATA_ATTR, routeKey);
  script.textContent = json;
  document.head.appendChild(script);
}

/**
 * 解説リファレンス章ページの BreadcrumbList JSON-LD を生成する（PBI-080 / TASK-080-5 / DAY5）。
 * 階層: トップ → 解説リファレンス → 章タイトル
 */
function buildChapterBreadcrumbJsonLd(
  chapterId: ReferenceChapterId,
  chapterTitle: string,
): Record<string, unknown> {
  const origin = window.location.origin;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: '解説リファレンス', item: `${origin}/reference` },
      {
        '@type': 'ListItem',
        position: 3,
        name: chapterTitle,
        item: `${origin}/reference/${chapterId}`,
      },
    ],
  };
}

/**
 * 代表ケース詳細ページの BreadcrumbList JSON-LD を生成する。
 * 階層: トップ → パターン別解説 → パターン{N} → ケース{NNN}
 */
function buildCaseBreadcrumbJsonLd(meta: CaseDetailMeta): Record<string, unknown> {
  const num = meta.id.replace('case-', '');
  const origin = window.location.origin;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'パターン別解説', item: `${origin}/patterns` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `パターン${meta.patternId}「${meta.patternName}」`,
        item: `${origin}/patterns/${meta.patternId}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `ケース${num}（${meta.difficulty}）`,
        item: `${origin}/cases/${meta.id}`,
      },
    ],
  };
}

export type AppPage =
  | 'home'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'contact'
  | 'patterns'
  | 'pattern-detail'
  | 'case-detail'
  | 'reference'
  | 'not-found';

interface RouterState {
  page: AppPage;
  /** パターン詳細ページのみで使用するパターンID */
  patternId: number | null;
  /** 代表ケース詳細ページのみで使用するケースID（PBI-079 / TASK-079-3） */
  caseId: string | null;
  /** 解説リファレンスページで注目表示する章ID */
  referenceChapterId: ReferenceChapterId | null;
}

// PBI-081 / TASK-081-1: 公開ルート単一ソース（src/routes.ts）から導出する。
// sitemap.xml と Router の有効ルート集合をズレなく同期させるための単一ソース化。
const VALID_REFERENCE_IDS: ReadonlySet<string> = new Set(SITEMAP_REFERENCE_CHAPTER_IDS);

/** pathname（base prefix 剥がし済）から RouterState を解決する。 */
function parsePathname(): RouterState {
  const path = stripBase(window.location.pathname);
  if (path === '/' || path === '') {
    return { page: 'home', patternId: null, caseId: null, referenceChapterId: null };
  }
  if (path === '/privacy-policy') {
    return { page: 'privacy-policy', patternId: null, caseId: null, referenceChapterId: null };
  }
  if (path === '/terms-of-service') {
    return { page: 'terms-of-service', patternId: null, caseId: null, referenceChapterId: null };
  }
  if (path === '/contact') {
    return { page: 'contact', patternId: null, caseId: null, referenceChapterId: null };
  }
  if (path === '/patterns') {
    return { page: 'patterns', patternId: null, caseId: null, referenceChapterId: null };
  }
  if (path === '/reference') {
    return { page: 'reference', patternId: null, caseId: null, referenceChapterId: null };
  }

  const referenceMatch = path.match(/^\/reference\/([^/]+)$/);
  if (referenceMatch) {
    const id = referenceMatch[1];
    if (VALID_REFERENCE_IDS.has(id)) {
      return {
        page: 'reference',
        patternId: null,
        caseId: null,
        referenceChapterId: id as ReferenceChapterId,
      };
    }
    return { page: 'not-found', patternId: null, caseId: null, referenceChapterId: null };
  }

  const patternMatch = path.match(/^\/patterns\/(\d+)$/);
  if (patternMatch) {
    const id = parseInt(patternMatch[1], 10);
    if (Number.isFinite(id) && findPatternById(id)) {
      return { page: 'pattern-detail', patternId: id, caseId: null, referenceChapterId: null };
    }
    return { page: 'not-found', patternId: null, caseId: null, referenceChapterId: null };
  }

  // PBI-079 / TASK-079-3: 代表ケース詳細 `/cases/:id`。CASE_DETAIL_META_BY_ID で検証。
  const caseMatch = path.match(/^\/cases\/([^/]+)$/);
  if (caseMatch) {
    const id = caseMatch[1];
    if (CASE_DETAIL_META_BY_ID.has(id)) {
      return { page: 'case-detail', patternId: null, caseId: id, referenceChapterId: null };
    }
    return { page: 'not-found', patternId: null, caseId: null, referenceChapterId: null };
  }

  return { page: 'not-found', patternId: null, caseId: null, referenceChapterId: null };
}

/**
 * レガシー `#/...` ハッシュを pathname に変換し replaceState する。
 * - hash が空または `#section` のような純粋なフラグメントの場合は何もしない。
 * - 変換後は `parsePathname()` で再評価可能になる。
 */
function migrateLegacyHash(): boolean {
  const hash = window.location.hash;
  if (!hash.startsWith('#/')) return false;
  const tail = hash.slice(1); // "#/foo" → "/foo"
  const newPathname = withBase(tail === '/' ? '/' : tail);
  const newUrl = `${newPathname}${window.location.search}`;
  window.history.replaceState(null, '', newUrl);
  return true;
}

/** 初期状態算出（hash 変換 → pathname 解決）。 */
function resolveInitialState(): RouterState {
  migrateLegacyHash();
  return parsePathname();
}

/**
 * `<a href="#/...">` および `<a href="/...">` の同一オリジン内部遷移を pushState 化する
 * delegated click handler。modifier キー併用・中央/右クリック・target/_blank・download 属性は尊重する。
 */
function handleDelegatedClick(event: MouseEvent): void {
  if (!isPlainLeftClick(event)) return;
  const target = event.target as Element | null;
  if (!target) return;
  const anchor = target.closest('a');
  if (!anchor) return;
  if (anchor.target && anchor.target !== '' && anchor.target !== '_self') return;
  if (anchor.hasAttribute('download')) return;
  const rel = anchor.getAttribute('rel') ?? '';
  if (rel.split(/\s+/).includes('external')) return;

  const href = anchor.getAttribute('href');
  if (!href) return;

  // レガシー `#/...` ハッシュリンク
  if (href.startsWith('#/')) {
    event.preventDefault();
    const tail = href.slice(1); // "#/foo" → "/foo"
    navigate(tail === '/' ? '/' : tail);
    return;
  }

  // 同一オリジン pathname リンク（base prefix 含む）
  if (href.startsWith('/')) {
    // 拡張子付き（静的ファイル）はブラウザ既定動作に任せる
    if (/\.[a-zA-Z0-9]+$/.test(href)) return;
    event.preventDefault();
    navigate(stripBase(href));
    return;
  }
}

export function Router() {
  const [state, setState] = useState<RouterState>(resolveInitialState);

  useEffect(() => {
    const update = () => {
      migrateLegacyHash();
      setState(parsePathname());
    };
    window.addEventListener('popstate', update);
    window.addEventListener(NAVIGATE_EVENT, update);
    window.addEventListener('hashchange', update);
    document.addEventListener('click', handleDelegatedClick);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(NAVIGATE_EVENT, update);
      window.removeEventListener('hashchange', update);
      document.removeEventListener('click', handleDelegatedClick);
    };
  }, []);

  useEffect(() => {
    const seo = resolveRouteSeo(state);
    const title = seo.title === APP_NAME ? APP_NAME : `${seo.title} | ${APP_NAME}`;
    document.title = title;

    setMetaByName('description', seo.description);
    setMetaByProperty('og:title', title);
    setMetaByProperty('og:description', seo.description);
    setMetaByName('twitter:title', title);
    setMetaByName('twitter:description', seo.description);

    const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    setMetaByProperty('og:url', currentUrl);

    // PBI-078 / TASK-078-3: canonical はクエリ・ハッシュを除いた origin + pathname を採用。
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    syncCanonicalLink(canonicalUrl);

    syncRobotsMeta(seo.noindex === true);
    // PBI-079 / TASK-079-3: ケース詳細以外のルートでは JSON-LD を撤去する（残留防止）。
    // PBI-080 / TASK-080-5（DAY5）: routeKey は seo.jsonLdKey から取得（既定 'case-detail'）。
    syncJsonLd(seo.jsonLd ?? null, seo.jsonLdKey);
  }, [state]);

  // PBI-077 / TASK-077-2/3: 各ページの戻る導線・カードを `<a href>` 化したため、
  // Router 側で onBack / onSelectPattern を渡す必要は無くなった。
  // 内部 `<a href>` クリックは Router マウント時に登録した
  // `handleDelegatedClick` が pushState 化する。

  switch (state.page) {
    case 'privacy-policy':
      return <PrivacyPolicy />;
    case 'terms-of-service':
      return <TermsOfService />;
    case 'contact':
      return <Contact />;
    case 'patterns':
      return <PatternList />;
    case 'pattern-detail':
      return <PatternDetail patternId={state.patternId ?? 1} />;
    case 'case-detail':
      return <CaseDetail caseId={state.caseId ?? ''} />;
    case 'reference':
      return <ReferencePage focusChapterId={state.referenceChapterId} />;
    case 'not-found':
      return <NotFound />;
    default:
      return <App />;
  }
}
