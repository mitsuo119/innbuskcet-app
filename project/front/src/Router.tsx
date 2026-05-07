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
import { ReferencePage } from './pages/ReferencePage';
import { NotFound } from './pages/NotFound';
import { NAVIGATE_EVENT, isPlainLeftClick, navigate, stripBase, withBase } from './nav';

const APP_NAME = 'インバスケット - 学習アプリ';

interface RouteSeo {
  title: string;
  description: string;
  /** soft 404 回避用の noindex 付与フラグ（PBI-076）。 */
  noindex?: boolean;
}

function resolveRouteSeo(state: RouterState): RouteSeo {
  switch (state.page) {
    case 'reference': {
      if (state.referenceChapterId) {
        const chapter = REFERENCE_DATA.find((item) => item.id === state.referenceChapterId);
        if (chapter) {
          return {
            title: `解説リファレンス：${chapter.title}`,
            description:
              'インバスケットの学習フレームワークを章別に確認できる解説リファレンスページです。',
          };
        }
      }
      return {
        title: '解説リファレンス',
        description:
          'インバスケットの基礎・採点基準・優先順位づけ・案件パターンを章構成で学べる解説ページです。',
      };
    }
    case 'patterns':
      return {
        title: 'パターン別解説',
        description:
          'インバスケット全20パターンの優先度傾向と回答の骨格を確認できるパターン別解説ページです。',
      };
    case 'pattern-detail': {
      const pattern = state.patternId ? findPatternById(state.patternId) : undefined;
      if (pattern) {
        return {
          title: `パターン${pattern.id}：${pattern.name}`,
          description:
            '案件パターンの特徴、優先度の目安、回答の骨格を確認し、実戦での優先順位判断に活かせます。',
        };
      }
      return {
        title: 'パターン詳細',
        description:
          'インバスケット案件のパターン詳細ページです。特徴と優先度判定の観点を確認できます。',
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

export type AppPage =
  | 'home'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'contact'
  | 'patterns'
  | 'pattern-detail'
  | 'reference'
  | 'not-found';

interface RouterState {
  page: AppPage;
  /** パターン詳細ページのみで使用するパターンID */
  patternId: number | null;
  /** 解説リファレンスページで注目表示する章ID */
  referenceChapterId: ReferenceChapterId | null;
}

const VALID_REFERENCE_IDS: ReadonlySet<string> = new Set([
  'chapter01',
  'chapter02',
  'chapter05',
  'chapter08',
]);

/** pathname（base prefix 剥がし済）から RouterState を解決する。 */
function parsePathname(): RouterState {
  const path = stripBase(window.location.pathname);
  if (path === '/' || path === '') {
    return { page: 'home', patternId: null, referenceChapterId: null };
  }
  if (path === '/privacy-policy') {
    return { page: 'privacy-policy', patternId: null, referenceChapterId: null };
  }
  if (path === '/terms-of-service') {
    return { page: 'terms-of-service', patternId: null, referenceChapterId: null };
  }
  if (path === '/contact') {
    return { page: 'contact', patternId: null, referenceChapterId: null };
  }
  if (path === '/patterns') {
    return { page: 'patterns', patternId: null, referenceChapterId: null };
  }
  if (path === '/reference') {
    return { page: 'reference', patternId: null, referenceChapterId: null };
  }

  const referenceMatch = path.match(/^\/reference\/([^/]+)$/);
  if (referenceMatch) {
    const id = referenceMatch[1];
    if (VALID_REFERENCE_IDS.has(id)) {
      return {
        page: 'reference',
        patternId: null,
        referenceChapterId: id as ReferenceChapterId,
      };
    }
    return { page: 'not-found', patternId: null, referenceChapterId: null };
  }

  const patternMatch = path.match(/^\/patterns\/(\d+)$/);
  if (patternMatch) {
    const id = parseInt(patternMatch[1], 10);
    if (Number.isFinite(id) && findPatternById(id)) {
      return { page: 'pattern-detail', patternId: id, referenceChapterId: null };
    }
    return { page: 'not-found', patternId: null, referenceChapterId: null };
  }

  return { page: 'not-found', patternId: null, referenceChapterId: null };
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

    syncRobotsMeta(seo.noindex === true);
  }, [state]);

  const handleBackToHome = () => navigate('/');
  const handleBackToPatternList = () => navigate('/patterns');

  switch (state.page) {
    case 'privacy-policy':
      return <PrivacyPolicy onBack={handleBackToHome} />;
    case 'terms-of-service':
      return <TermsOfService onBack={handleBackToHome} />;
    case 'contact':
      return <Contact onBack={handleBackToHome} />;
    case 'patterns':
      return (
        <PatternList
          onBack={handleBackToHome}
          onSelectPattern={(id) => navigate(`/patterns/${id}`)}
        />
      );
    case 'pattern-detail':
      return <PatternDetail patternId={state.patternId ?? 1} onBack={handleBackToPatternList} />;
    case 'reference':
      return <ReferencePage onBack={handleBackToHome} focusChapterId={state.referenceChapterId} />;
    case 'not-found':
      return <NotFound onBack={handleBackToHome} />;
    default:
      return <App />;
  }
}
