/**
 * 代表ケース詳細ページ（PBI-079 / TASK-079-3 / Sprint022 DAY2）
 *
 * `/cases/:id` で表示する代表ケース 20 件用の単独 URL ページ。
 * - 入力 `caseId` は Router 側で `CASE_DETAIL_META_BY_ID` 検証済み（不一致時は not-found）。
 * - ケース本文・正答ランク・解説（120 字以上のオリジナル）・モデル回答を表示する。
 * - 戻る導線は `<a href="/patterns">` でパターン一覧へ復帰する（被リンク受け皿）。
 * - dangerouslySetInnerHTML 不使用（DoD §10-2）／コントラスト・フォーカス順序は既存スタイル踏襲。
 */
import casesData from '../data/cases.json';
import { CASE_DETAIL_META_BY_ID, type CaseDetailMeta } from '../routes';
import { GlobalNav } from '../ui/GlobalNav';

interface CaseRecord {
  id: string;
  title: string;
  body: string;
  correctPriority: string;
  explanation: string;
  characters?: string[];
  departments?: string[];
  difficulty?: string;
  modelAnswer?: {
    judgment: string;
    reason: string;
    action: string;
  };
}

const CASES: readonly CaseRecord[] = casesData as readonly CaseRecord[];

const PRIORITY_LABEL: Record<string, string> = {
  A: 'A優先（最重要・緊急）',
  B: 'B優先（重要）',
  C: 'C優先（低優先度）',
};

interface Props {
  caseId: string;
}

export function CaseDetail({ caseId }: Props) {
  const meta: CaseDetailMeta | undefined = CASE_DETAIL_META_BY_ID.get(caseId);
  const record = CASES.find((c) => c.id === caseId);

  if (!meta || !record) {
    return (
      <div className="container">
        <a href="/patterns" className="legal-back-btn" aria-label="パターン一覧に戻る">
          ← パターン一覧へ
        </a>
        <GlobalNav current="patterns" />
        <p>代表ケース「{caseId}」が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="legal-header">
        <a href="/patterns" className="legal-back-btn" aria-label="パターン一覧に戻る">
          ← パターン一覧へ
        </a>
        <GlobalNav current="patterns" />
        <h1 className="legal-title">
          ケース{record.id.replace('case-', '')}：{record.title}
        </h1>
        <p className="legal-updated">
          パターン{meta.patternId}「{meta.patternName}」／難易度：{meta.difficulty}
        </p>
      </header>

      <main className="legal-body">
        <section className="legal-section">
          <h2 className="legal-section__title">ケース本文</h2>
          <p>{record.body}</p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">正答ランクと解説</h2>
          <p>
            <strong>{PRIORITY_LABEL[record.correctPriority] ?? record.correctPriority}</strong>
          </p>
          <p>{record.explanation}</p>
        </section>

        {record.modelAnswer && (
          <section className="legal-section">
            <h2 className="legal-section__title">モデル回答</h2>
            <dl className="legal-list">
              <dt>判断</dt>
              <dd>{record.modelAnswer.judgment}</dd>
              <dt>理由</dt>
              <dd>{record.modelAnswer.reason}</dd>
              <dt>具体行動</dt>
              <dd>{record.modelAnswer.action}</dd>
            </dl>
          </section>
        )}

        <section className="legal-section">
          <h2 className="legal-section__title">関連リンク</h2>
          <ul className="legal-list">
            <li>
              <a href={`/patterns/${meta.patternId}`}>
                パターン{meta.patternId}「{meta.patternName}」の詳細を見る
              </a>
            </li>
            <li>
              <a href="/reference">解説リファレンス（章別の体系解説）</a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
