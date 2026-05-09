/**
 * パターン詳細ページ（PBI-055 / TASK-303）
 * - URL `/patterns/:id` で表示するパターンIDを指定
 * - 「一覧に戻る」リンク付き
 * - PBI-077 / TASK-077-3: 戻る導線を `<a href="/patterns">` 化（onClick 単独遷移 0 件）
 * - SP対応（375px以上）/ ライト・ダーク両テーマ
 * - dangerouslySetInnerHTML 不使用（XSS対策）
 */
import { findPatternById, type PatternPriority } from '../data/patternData';
import { GlobalNav } from '../ui/GlobalNav';

interface Props {
  patternId: number;
}

const PRIORITY_LABEL: Record<PatternPriority, string> = {
  A: 'A優先（最重要・緊急）',
  B: 'B優先（重要）',
  C: 'C優先（低優先度）',
  situational: '状況依存',
};

export function PatternDetail({ patternId }: Props) {
  const pattern = findPatternById(patternId);

  if (!pattern) {
    return (
      <div className="container">
        <a href="/patterns" className="legal-back-btn" aria-label="パターン一覧に戻る">
          ← 一覧に戻る
        </a>
        <GlobalNav current="patterns" />
        <p>パターン{patternId}が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="legal-header">
        <a href="/patterns" className="legal-back-btn" aria-label="パターン一覧に戻る">
          ← 一覧に戻る
        </a>
        <GlobalNav current="patterns" />
        <h1 className="legal-title">
          パターン{pattern.id}：{pattern.name}
        </h1>
        <p className="legal-updated">{pattern.category}</p>
      </header>

      <main className="legal-body">
        <section className="legal-section">
          <h2 className="legal-section__title">優先度の目安</h2>
          <p>
            <span
              className={`pattern-detail__badge pattern-detail__badge--${pattern.typicalPriority}`}
            >
              {PRIORITY_LABEL[pattern.typicalPriority]}
            </span>
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">特徴・優先度判定理由</h2>
          <p>{pattern.characteristics}</p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">回答の骨格</h2>
          <ol className="legal-list">
            {pattern.answerSkeleton.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {pattern.keyPhrases && pattern.keyPhrases.length > 0 && (
          <section className="legal-section">
            <h2 className="legal-section__title">キーフレーズ例</h2>
            <ul className="legal-list">
              {pattern.keyPhrases.map((phrase, i) => (
                <li key={i}>「{phrase}」</li>
              ))}
            </ul>
          </section>
        )}

        {pattern.notes && (
          <section className="legal-section">
            <h2 className="legal-section__title">対応ポイント・注意事項</h2>
            <p>{pattern.notes}</p>
          </section>
        )}
      </main>
    </div>
  );
}
