/**
 * グローバルナビゲーション（PBI-064 / TASK-201）
 * - 主要ページ（問題回答 / 解説リファレンス / パターン別解説 / プライバシー）への
 *   表記・順序・アクティブ状態を統一する共通コンポーネント。
 * - アクティブページは aria-current="page" を付与し、CSS でも視覚区別する（DoD 9-3）。
 * - PBI-076 / TASK-076-4: History API 移行に伴い `href="/..."` 形式の pathname リンクを使用。
 *   レガシー `#/...` ハッシュリンクは Router.tsx の delegated click handler が後方互換維持。
 * - dangerouslySetInnerHTML 不使用（DoD 10-2）。
 */

export type GlobalNavPage =
  | 'home'
  | 'reference'
  | 'patterns'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'contact';

interface NavItem {
  /** 識別子（current との照合用）。 */
  id: GlobalNavPage;
  /** UI 表示ラベル（日本語）。 */
  label: string;
  /** pathname ベースの遷移先（PBI-076 / TASK-076-4）。 */
  href: string;
}

/**
 * ナビ項目定義（順序固定: 問題回答 → 解説 → パターン → 法務）。
 * - 「法務」枠はプライバシーポリシーを代表表示とし、規約・お問い合わせはページ内の
 *   既存リンクから辿れる構成（PBI-051 整合）。
 */
const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: '問題回答', href: '/' },
  { id: 'reference', label: '解説リファレンス', href: '/reference' },
  { id: 'patterns', label: 'パターン別解説', href: '/patterns' },
  { id: 'privacy-policy', label: 'プライバシー', href: '/privacy-policy' },
];

interface Props {
  /** 現在のページ。aria-current="page" 付与に利用する。 */
  current: GlobalNavPage;
}

export function GlobalNav({ current }: Props) {
  return (
    <nav className="global-nav" aria-label="グローバルナビゲーション">
      <ul className="global-nav__list">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === current;
          return (
            <li key={item.id} className="global-nav__item">
              <a
                href={item.href}
                className={
                  isActive ? 'global-nav__link global-nav__link--active' : 'global-nav__link'
                }
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
