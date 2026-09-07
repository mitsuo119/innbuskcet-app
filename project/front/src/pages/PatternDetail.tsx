/**
 * パターン詳細ページ（PBI-055 / TASK-303）
 * - URL `/patterns/:id` で表示するパターンIDを指定
 * - 「一覧に戻る」リンク付き
 * - PBI-077 / TASK-077-3: 戻る導線を `<a href="/patterns">` 化（onClick 単独遷移 0 件）
 * - SP対応（375px以上）/ ライト・ダーク両テーマ
 * - dangerouslySetInnerHTML 不使用（XSS対策）
 */
import { findPatternById, type PatternPriority } from '../data/patternData';
import { findPatternDeepDive } from '../data/deepDive';
import { Breadcrumb } from '../ui/Breadcrumb';
import { GlobalNav } from '../ui/GlobalNav';
import { AdSlot } from '../ui/AdSlot';
import contentNotice from '../data/learningContentNotice.json';

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
  const deepDive = findPatternDeepDive(patternId);

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
        <Breadcrumb
          items={[
            { label: 'ホーム', href: '/' },
            { label: 'パターン別解説', href: '/patterns' },
            { label: `パターン${pattern.id}「${pattern.name}」` },
          ]}
        />
        <h1 className="legal-title">
          パターン{pattern.id}：{pattern.name}
        </h1>
        <p className="legal-updated">{pattern.category}</p>
      </header>

      <main className="legal-body">
        <p className="legal-note">
          {contentNotice.text} <a href={contentNotice.href}>{contentNotice.label}</a>
        </p>
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

        {deepDive && (
          <section className="legal-section">
            <h2 className="legal-section__title">出題される場面の読み解き</h2>
            <p>{deepDive.situation}</p>
          </section>
        )}

        {deepDive && (
          <section className="legal-section">
            <h2 className="legal-section__title">なぜこの優先度になるのか</h2>
            <p>{deepDive.priorityRationale}</p>
          </section>
        )}

        <section className="legal-section">
          <h2 className="legal-section__title">回答の骨格</h2>
          <ol className="legal-list">
            {pattern.answerSkeleton.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {deepDive && (
          <section className="legal-section">
            <h2 className="legal-section__title">よくある失敗</h2>
            <ul className="legal-list">
              {deepDive.commonMistakes.map((mistake, i) => (
                <li key={i}>{mistake}</li>
              ))}
            </ul>
          </section>
        )}

        {deepDive && (
          <section className="legal-section">
            <h2 className="legal-section__title">回答例文</h2>
            <p>{deepDive.answerExample}</p>
          </section>
        )}

        {deepDive && (
          <section className="legal-section">
            <h2 className="legal-section__title">答案を振り返る観点</h2>
            <p>{deepDive.evaluatorView}</p>
          </section>
        )}

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
        {/* PBI-100 / TASK-100-3: パターン詳細は kind='pattern-detail' で広告表示。 */}
        <AdSlot
          label="広告（コンテンツ下）"
          className="ad-slot--footer"
          pageMeta={{ kind: 'pattern-detail' }}
        />
      </main>
    </div>
  );
}
