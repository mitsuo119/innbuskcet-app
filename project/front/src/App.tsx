import { useMemo, useState } from 'react';
import { AnswerButtons } from './components/AnswerButtons';
import { CaseView } from './components/CaseView';
import { ExplanationView } from './components/ExplanationView';
import type { Case, Priority } from './domain/case';
import { judge, type Judgement } from './domain/judge';
import { loadCases } from './domain/loader';
import { pickNextCase } from './domain/random';

export default function App() {
  const allCases = useMemo<Case[]>(() => loadCases(), []);
  const [current, setCurrent] = useState<Case | null>(() => pickNextCase(allCases, undefined));
  const [selected, setSelected] = useState<Priority | null>(null);
  const [judgement, setJudgement] = useState<Judgement | null>(null);

  const locked = judgement !== null;

  const handleSelect = (priority: Priority) => {
    if (locked || !current) return;
    setSelected(priority);
  };

  const handleSubmit = () => {
    if (!current || selected === null || locked) return;
    setJudgement(judge(selected, current.correctPriority));
  };

  const handleNext = () => {
    setCurrent(pickNextCase(allCases, current?.id));
    setSelected(null);
    setJudgement(null);
  };

  return (
    <main className="container">
      <header className="app-header">
        <h1>InBusket</h1>
        <p className="app-subtitle">インバスケット学習アプリ（MVP 開発中 - Sprint 001 Day 4）</p>
      </header>

      {current ? (
        <>
          <CaseView caseItem={current} />
          <AnswerButtons selected={selected} locked={locked} onSelect={handleSelect} />
          {judgement && selected && (
            <ExplanationView caseItem={current} answer={selected} judgement={judgement} />
          )}
        </>
      ) : (
        <p>表示できる案件がありません。</p>
      )}

      <div className="actions">
        {!locked ? (
          <button type="button" onClick={handleSubmit} disabled={selected === null || !current}>
            回答する
          </button>
        ) : (
          <button type="button" onClick={handleNext} disabled={allCases.length === 0}>
            次の問題
          </button>
        )}
      </div>
    </main>
  );
}
