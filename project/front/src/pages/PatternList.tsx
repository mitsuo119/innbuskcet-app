/**
 * パターン一覧ページ（PBI-055 / TASK-302）
 * - 全20パターンをカテゴリ別に表示
 * - クリックでPatternDetailへ遷移
 * - SP対応（375px以上）/ ライト・ダーク両テーマ
 * - dangerouslySetInnerHTML 不使用（XSS対策）
 */
import { PATTERN_DATA, type PatternPriority } from '../data/patternData';
import { GlobalNav } from '../ui/GlobalNav';

interface Props {
  onSelectPattern: (id: number) => void;
  onBack: () => void;
}

const PRIORITY_LABEL: Record<PatternPriority, string> = {
  A: 'A優先',
  B: 'B優先',
  C: 'C優先',
  situational: '状況依存',
};

/** パターンカテゴリの表示順（patternData.ts の出現順に合わせる） */
const CATEGORIES = [...new Set(PATTERN_DATA.map((p) => p.category))];

export function PatternList({ onSelectPattern, onBack }: Props) {
  return (
    <div className="container">
      <header className="legal-header">
        <button type="button" className="legal-back-btn" onClick={onBack} aria-label="ホームに戻る">
          ← ホームに戻る
        </button>
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
                  <button
                    type="button"
                    className="pattern-list__item"
                    onClick={() => onSelectPattern(pattern.id)}
                    aria-label={`パターン${pattern.id} ${pattern.name} 詳細を見る`}
                  >
                    <span className="pattern-list__num">パターン{pattern.id}</span>
                    <span className="pattern-list__name">{pattern.name}</span>
                    <span
                      className={`pattern-list__badge pattern-list__badge--${pattern.typicalPriority}`}
                    >
                      {PRIORITY_LABEL[pattern.typicalPriority]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
