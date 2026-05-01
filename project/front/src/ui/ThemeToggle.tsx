import { useEffect, useState } from 'react';

/** UI テーマ（PBI-019） */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'inbusket.theme';

/** 保存値が無効なら 'light' にフォールバック（システム設定は今回採用しない・PO 合意） */
function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'dark' || v === 'light' ? v : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * テーマ切替トグル（PBI-019 / TASK-001）。
 * - role="switch" + aria-checked でスクリーンリーダ対応
 * - aria-label 必須（DoD §9-3）
 * - <html data-theme="..."> を切替（CSS 側は TASK-002 で対応）
 * - localStorage 永続化（TASK-004 と統合）
 * - キーボード操作: Tab でフォーカス、Enter / Space で切替（HTML button 既定）
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage 利用不可（プライベートモード等）でもアプリは継続稼働
    }
  }, [theme]);

  const isDark = theme === 'dark';
  const toggle = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={
        isDark ? 'ダークテーマ（クリックでライトに切替）' : 'ライトテーマ（クリックでダークに切替）'
      }
      className="theme-toggle"
      onClick={toggle}
    >
      <span aria-hidden="true" className="theme-toggle__icon">
        {isDark ? '🌙' : '☀'}
      </span>
      <span className="theme-toggle__text">{isDark ? 'ダーク' : 'ライト'}</span>
    </button>
  );
}
