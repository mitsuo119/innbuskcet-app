/**
 * シンプルハッシュベースルーター（PBI-051 / TASK-104）
 * - react-router 不要のゼロ依存実装
 * - ハッシュ: #/privacy-policy, #/terms-of-service, #/contact, #/patterns, #/patterns/:id,
 *   #/reference, #/reference/:chapterId
 * - デフォルト（ハッシュなし）はメインアプリを表示
 */
import { useEffect, useState } from 'react';
import App from './App';
import { type ReferenceChapterId } from './data/referenceData';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Contact } from './pages/Contact';
import { PatternList } from './pages/PatternList';
import { PatternDetail } from './pages/PatternDetail';
import { ReferencePage } from './pages/ReferencePage';

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
