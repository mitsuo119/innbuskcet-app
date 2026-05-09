/**
 * パターン一覧ページ（PBI-055 / TASK-302）
 * - 全20パターンをカテゴリ別に表示
 * - PBI-077 / TASK-077-2: カードを `<a href="/patterns/:id">` 化（修飾キー新規タブ・ミドルクリックを尊重）
 * - PBI-077 / TASK-077-3: 戻る導線を `<a href="/">` 化
 * - SP対応（375px以上）/ ライト・ダーク両テーマ
 * - dangerouslySetInnerHTML 不使用（XSS対策）
 */
import { PATTERN_DATA, type PatternPriority } from '../data/patternData';
import { GlobalNav } from '../ui/GlobalNav';

const PRIORITY_LABEL: Record<PatternPriority, string> = {
  A: 'A優先',
  B: 'B優先',
  C: 'C優先',
  situational: '状況依存',
};

/** パターンカテゴリの表示順（patternData.ts の出現順に合わせる） */
const CATEGORIES = [...new Set(PATTERN_DATA.map((p) => p.category))];

export function PatternList() {
  return (
    <div className="container">
      <header className="legal-header">
        <a href="/" className="legal-back-btn" aria-label="ホームに戻る">
          ← ホームに戻る
        </a>
        <GlobalNav current="patterns" />
        <h1 className="legal-title">パターン別解説</h1>
        <p className="legal-updated">インバスケット全20パターンの優先度・対応フレームワーク</p>
      </header>

      <main className="legal-body">
        {CATEGORIES.map((cat) => (
          <section key={cat} className="legal-section">
            <h2 className="legal-section__title">{cat}</h2>
            <ul className="pattern-list">
              {PATTERN_DATA.filter((p) => p.category === cat).map((pattern) => (
                <li key={pattern.id} className="pattern-list__item-wrap">
                  <a
                    href={`/patterns/${pattern.id}`}
                    className="pattern-list__item"
                    aria-label={`パターン${pattern.id} ${pattern.name} 詳細を見る`}
                  >
                    <span className="pattern-list__num">パターン{pattern.id}</span>
                    <span className="pattern-list__name">{pattern.name}</span>
                    <span
                      className={`pattern-list__badge pattern-list__badge--${pattern.typicalPriority}`}
                    >
                      {PRIORITY_LABEL[pattern.typicalPriority]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
