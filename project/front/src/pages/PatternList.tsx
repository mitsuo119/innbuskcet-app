/**
 * パターン一覧ページ（PBI-055 / TASK-302）
 * - 全20パターンをカテゴリ別に表示
 * - PBI-077 / TASK-077-2: カードを `<a href="/patterns/:id">` 化（修飾キー新規タブ・ミドルクリックを尊重）
 * - PBI-077 / TASK-077-3: 戻る導線を `<a href="/">` 化
 * - SP対応（375px以上）/ ライト・ダーク両テーマ
 * - dangerouslySetInnerHTML 不使用（XSS対策）
 * - Sprint026 PBI-099 / TASK-099-2: ページ冒頭に導入文（一覧の目的・使い方）と、
 *   各パターン項目に1〜2文の説明文（patternData.characteristics）を追加し、
 *   AdSense「広告掲載最小コンテンツ基準」（本文600字以上）を満たす SPA 一覧化。
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
        <section className="legal-section" aria-label="パターン一覧の目的と使い方">
          <p className="pattern-list__intro">
            本ページはインバスケット試験で頻出する案件20パターンの索引です。対外対応・人事マネジメント・業務プロジェクト・リスクトラブル・組織方針・その他の6カテゴリに分類し、緊急度×重要度の判定、関係者への指示、報告タイミングの設計など、採点6軸（判断力・統率力・問題分析力・計画組織力・対人関係力・主体性）に直結する行動を学べる構成です。
          </p>
          <p className="pattern-list__intro">
            使い方の目安：まず各パターンの「優先度傾向」と「特徴」を一覧で押さえ、本番で迷いなくマトリクス分類できる状態を作ります。その上で頻出パターン（顧客クレーム・部下退職相談・プロジェクト遅延・情報セキュリティインシデント等）の回答骨格を反復し、代表ケース20件で実戦演習する流れが効果的です。
          </p>
        </section>
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
                  <p className="pattern-list__description">{pattern.characteristics}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
