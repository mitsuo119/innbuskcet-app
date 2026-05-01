import { useEffect, useMemo, useState } from 'react';
import { AnswerButtons } from './ui/AnswerButtons';
import { CaseView } from './ui/CaseView';
import { ExplanationView } from './ui/ExplanationView';
import { HistoryView } from './ui/HistoryView';
import { ModeSelector } from './ui/ModeSelector';
import { ScoreCounter } from './ui/ScoreCounter';
import { ThemeToggle } from './ui/ThemeToggle';
import type { Case, Priority } from './domain/case';
import { initialHistory, pushHistory, type HistoryItem } from './domain/history';
import { judge, type Judgement } from './domain/judge';
import { loadCases } from './domain/loader';
import { applyModeChange, initialMode } from './domain/mode';
import { pickNextCaseByMode, type FilterMode } from './domain/random';
import { addScore, initialScore } from './domain/score';
import { resolveShortcut } from './domain/shortcut';

/** 入力中の要素ではショートカットを誤発火させない */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

export default function App() {
  const allCases = useMemo<Case[]>(() => loadCases(), []);
  const [mode, setMode] = useState<FilterMode>(initialMode);
  const [current, setCurrent] = useState<Case | null>(() =>
    pickNextCaseByMode(allCases, undefined, initialMode),
  );
  const [selected, setSelected] = useState<Priority | null>(null);
  const [judgement, setJudgement] = useState<Judgement | null>(null);
  const [score, setScore] = useState(initialScore);
  const [history, setHistory] = useState<readonly HistoryItem[]>(initialHistory);

  const locked = judgement !== null;

  const handleSelect = (priority: Priority) => {
    if (locked || !current) return;
    setSelected(priority);
  };

  const handleSubmit = (priority?: Priority) => {
    if (!current || locked) return;
    const answer = priority ?? selected;
    if (answer === null) return;
    const result: Judgement = judge(answer, current.correctPriority);
    setSelected(answer);
    setJudgement(result);
    setScore((prev) => addScore(prev, result));
    setHistory((prev) =>
      pushHistory(prev, {
        caseId: current.id,
        judgement: result,
        correctPriority: current.correctPriority,
      }),
    );
  };

  const handleNext = () => {
    setCurrent(pickNextCaseByMode(allCases, current?.id, mode));
    setSelected(null);
    setJudgement(null);
  };

  /**
   * 同一案件をもう一度解き直す。current は維持し、回答/解説のみ未回答状態へ戻す。
   * カウンタ（score）は意図的に加算しない（PBI-014 受入基準）。
   */
  const handleRetry = () => {
    if (!current) return;
    setSelected(null);
    setJudgement(null);
  };

  /**
   * 出題モード切替（PBI-018）。
   * - 履歴・カウンタを初期化し、新モードでフィルタした候補から次の1件を選び直す。
   * - 同モード再選択は no-op。
   */
  const handleModeChange = (next: FilterMode) => {
    if (next === mode) return;
    const reset = applyModeChange(allCases, next);
    setMode(reset.mode);
    setHistory(reset.history);
    setScore(reset.score);
    setCurrent(reset.current);
    setSelected(null);
    setJudgement(null);
  };

  // キーボードショートカット: A/B/C で回答即確定、Enter で次の問題
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const action = resolveShortcut(e.key, {
        locked,
        hasCurrent: current !== null,
        isEditable: isEditableTarget(e.target),
        hasModifier: e.ctrlKey || e.metaKey || e.altKey,
      });
      if (action.type === 'ignore') return;
      e.preventDefault();
      if (action.type === 'answer') {
        handleSubmit(action.priority);
      } else if (action.type === 'next') {
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, current?.id]);

  return (
    <main className="container">
      <header className="app-header">
        <div className="app-header__top">
          <h1>InBusket</h1>
          <ThemeToggle />
        </div>
        <p className="app-subtitle">インバスケット学習アプリ（MVP 開発中 - Sprint 004 Day 1）</p>
        <ScoreCounter score={score} />
      </header>

      <ModeSelector mode={mode} onChange={handleModeChange} />

      <HistoryView history={history} />

      {current ? (
        <>
          <CaseView caseItem={current} />
          <AnswerButtons selected={selected} locked={locked} onSelect={handleSelect} />
          {judgement && selected && (
            <ExplanationView
              caseItem={current}
              answer={selected}
              judgement={judgement}
              onRetry={handleRetry}
            />
          )}
        </>
      ) : (
        <p>該当する優先度の案件がありません。モードを切替えてください。</p>
      )}

      <div className="actions">
        {!locked ? (
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={selected === null || !current}
          >
            回答する
          </button>
        ) : (
          <button type="button" onClick={handleNext} disabled={allCases.length === 0}>
            次の問題（Enter）
          </button>
        )}
      </div>

      <footer className="app-footer" aria-label="キーボードショートカット">
        <small>
          ショートカット: <kbd>A</kbd> / <kbd>B</kbd> / <kbd>C</kbd> で回答、<kbd>Enter</kbd>{' '}
          で次の問題
        </small>
      </footer>
    </main>
  );
}
