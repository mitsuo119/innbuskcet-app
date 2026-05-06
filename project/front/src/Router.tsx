/**
 * シンプルハッシュベースルーター（PBI-051 / TASK-104）
 * - react-router 不要のゼロ依存実装
 * - ハッシュ: #/privacy-policy, #/terms-of-service, #/contact, #/patterns, #/patterns/:id,
 *   #/reference, #/reference/:chapterId
 * - デフォルト（ハッシュなし）はメインアプリを表示
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

const APP_NAME = 'インバスケット - 学習アプリ';

interface RouteSeo {
  title: string;
  description: string;
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

export type AppPage =
  | 'home'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'contact'
  | 'patterns'
  | 'pattern-detail'
  | 'reference';

interface RouterState {
  page: AppPage;
  /** パターン詳細ページのみで使用するパターンID */
  patternId: number | null;
  /** 解説リファレンスページで注目表示する章ID */
  referenceChapterId: ReferenceChapterId | null;
}

function parseHash(): RouterState {
  const hash = window.location.hash;
  if (hash === '#/privacy-policy') {
    return { page: 'privacy-policy', patternId: null, referenceChapterId: null };
  }
  if (hash === '#/terms-of-service') {
    return { page: 'terms-of-service', patternId: null, referenceChapterId: null };
  }
  if (hash === '#/contact') return { page: 'contact', patternId: null, referenceChapterId: null };
  if (hash === '#/patterns') return { page: 'patterns', patternId: null, referenceChapterId: null };
  if (hash === '#/reference') {
    return { page: 'reference', patternId: null, referenceChapterId: null };
  }

  const referenceMatch = hash.match(/^#\/reference\/(chapter01|chapter02|chapter05|chapter08)$/);
  if (referenceMatch) {
    return {
      page: 'reference',
      patternId: null,
      referenceChapterId: referenceMatch[1] as ReferenceChapterId,
    };
  }

  const patternMatch = hash.match(/^#\/patterns\/(\d+)$/);
  if (patternMatch) {
    const id = parseInt(patternMatch[1], 10);
    if (!isNaN(id)) {
      return { page: 'pattern-detail', patternId: id, referenceChapterId: null };
    }
  }
  return { page: 'home', patternId: null, referenceChapterId: null };
}

function navigateBack(): void {
  window.location.hash = '';
}

function navigateToPatternList(): void {
  window.location.hash = '/patterns';
}

export function Router() {
  const [state, setState] = useState<RouterState>(parseHash);

  useEffect(() => {
    const onHashChange = () => {
      setState(parseHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
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

    const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    setMetaByProperty('og:url', currentUrl);
  }, [state]);

  const handleBackToHome = () => navigateBack();
  const handleBackToPatternList = () => navigateToPatternList();

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
          onSelectPattern={(id) => {
            window.location.hash = `/patterns/${id}`;
          }}
        />
      );
    case 'pattern-detail':
      return <PatternDetail patternId={state.patternId ?? 1} onBack={handleBackToPatternList} />;
    case 'reference':
      return <ReferencePage onBack={handleBackToHome} focusChapterId={state.referenceChapterId} />;
    default:
      return <App />;
  }
}
