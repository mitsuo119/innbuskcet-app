import { useEffect, useMemo, useState } from 'react';
import { AnswerButtons } from './ui/AnswerButtons';
import { CaseView } from './ui/CaseView';
import { ExplanationView } from './ui/ExplanationView';
import { HistoryView } from './ui/HistoryView';
import { ModeSelector } from './ui/ModeSelector';
import { ScoreCounter } from './ui/ScoreCounter';
import { ThemeToggle } from './ui/ThemeToggle';
import { ModelAnswerView } from './ui/ModelAnswerView';
import { WritingInput } from './ui/WritingInput';
import { WritingPreview } from './ui/WritingPreview';
import type { Case, Priority } from './domain/case';
import {
  initialHistory,
  pushHistory,
  trimHistory,
  type HistoryItem,
  type HistoryLimit,
  HISTORY_LIMIT_OPTIONS,
} from './domain/history';
import { judge, type Judgement } from './domain/judge';
import { loadCases } from './domain/loader';
import { applyModeChange, initialMode } from './domain/mode';
import { pickNextCaseByMode, type FilterMode } from './domain/random';
import { addModeScore, addScore, initialModeScores, initialScore } from './domain/score';
import { resolveShortcut, isEditableTarget } from './domain/shortcut';
import { createEmptyWritingEntry, isWritingEntryEmpty, type WritingEntry } from './domain/writing';

export default function App() {
  const allCases = useMemo<Case[]>(() => loadCases(), []);
  const [mode, setMode] = useState<FilterMode>(initialMode);
  const [current, setCurrent] = useState<Case | null>(() =>
    pickNextCaseByMode(allCases, undefined, initialMode),
  );
  const [selected, setSelected] = useState<Priority | null>(null);
  const [judgement, setJudgement] = useState<Judgement | null>(null);
  const [score, setScore] = useState(initialScore);
  const [modeScores, setModeScores] = useState(initialModeScores);
  const [history, setHistory] = useState<readonly HistoryItem[]>(initialHistory);
  const [historyLimit, setHistoryLimit] = useState<HistoryLimit>(10);
  const [writingEntry, setWritingEntry] = useState<WritingEntry>(() => createEmptyWritingEntry());

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
    setModeScores((prev) => addModeScore(prev, current.correctPriority, result));
    setHistory((prev) =>
      pushHistory(
        prev,
        {
          caseId: current.id,
          judgement: result,
          correctPriority: current.correctPriority,
        },
        historyLimit,
      ),
    );
  };

  const handleNext = () => {
    setCurrent(pickNextCaseByMode(allCases, current?.id, mode));
    setSelected(null);
    setJudgement(null);
    setWritingEntry(createEmptyWritingEntry());
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
    setWritingEntry(createEmptyWritingEntry());
  };

  /**
   * 履歴表示件数の切替（PBI-020）。
   * - 同値再選択は no-op。
   * - 縮小（20 → 10）時は既存履歴を末尾優先で切り詰める（カウンタ・モードは非リセット）。
   * - 拡大（10 → 20）時は履歴を維持し、以降のpushで上限が広がる。
   * - セッション内のみ保持（永続化なし）。
   */
  const handleHistoryLimitChange = (next: HistoryLimit) => {
    if (next === historyLimit) return;
    setHistoryLimit(next);
    setHistory((prev) => trimHistory(prev, next));
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
        <p className="app-subtitle">インバスケット学習アプリ（MVP 開発中 - Sprint 005）</p>
        <ScoreCounter score={score} modeScores={modeScores} currentMode={mode} />
      </header>

      <ModeSelector mode={mode} onChange={handleModeChange} />

      <fieldset className="history-limit" aria-label="履歴表示件数">
        <legend className="history-limit__legend">履歴表示件数</legend>
        {HISTORY_LIMIT_OPTIONS.map((n) => (
          <label key={n} className="history-limit__option">
            <input
              type="radio"
              name="history-limit"
              value={n}
              checked={historyLimit === n}
              onChange={() => handleHistoryLimitChange(n)}
              aria-label={`直近${n}件を表示`}
            />
            <span>{n}件</span>
          </label>
        ))}
      </fieldset>

      <HistoryView history={history} maxDisplay={historyLimit} />

      {current ? (
        <>
          <CaseView caseItem={current} />
          <WritingInput entry={writingEntry} onChange={setWritingEntry} disabled={locked} />
          <AnswerButtons selected={selected} locked={locked} onSelect={handleSelect} />
          {judgement && selected && (
            <>
              <WritingPreview entry={writingEntry} isEmpty={isWritingEntryEmpty(writingEntry)} />
              <ModelAnswerView
                modelAnswer={current.modelAnswer}
                visible={!!judgement}
                correctPriority={current.correctPriority}
              />
              <ExplanationView
                caseItem={current}
                answer={selected}
                judgement={judgement}
                onRetry={handleRetry}
              />
            </>
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
