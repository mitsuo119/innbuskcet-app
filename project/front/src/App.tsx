import { useEffect, useMemo, useState } from 'react';
import { AnswerButtons } from './ui/AnswerButtons';
import { CaseView } from './ui/CaseView';
import { ExplanationView } from './ui/ExplanationView';
import { HistoryView } from './ui/HistoryView';
import { LearningStyleToggle } from './ui/LearningStyleToggle';
import { ModeSelector } from './ui/ModeSelector';
import { ScoreCounter } from './ui/ScoreCounter';
import { ThemeToggle } from './ui/ThemeToggle';
import { ModelAnswerView } from './ui/ModelAnswerView';
import { WritingInput } from './ui/WritingInput';
import { WritingPreview } from './ui/WritingPreview';
import { ExamTimer } from './ui/ExamTimer';
import { FeedbackView } from './ui/FeedbackView';
import type { Case, Priority } from './domain/case';
import { evaluateWriting, type WritingFeedback } from './domain/feedback';
import {
  initialHistory,
  pushHistory,
  trimHistory,
  type HistoryItem,
  type HistoryLimit,
  HISTORY_LIMIT_OPTIONS,
} from './domain/history';
import { judge, type Judgement } from './domain/judge';
import {
  loadLearningStyle,
  saveLearningStyle,
  isDeepMode,
  type LearningStyle,
} from './domain/learningStyle';
import { loadCases } from './domain/loader';
import { applyModeChange, initialMode } from './domain/mode';
import { pickNextCaseByMode, type FilterMode } from './domain/random';
import {
  addLearningStyleScore,
  addModeScore,
  addScore,
  initialLearningStyleScores,
  initialModeScores,
  initialScore,
} from './domain/score';
import { resolveShortcut, isEditableTarget } from './domain/shortcut';
import { createEmptyWritingEntry, isWritingEntryEmpty, type WritingEntry } from './domain/writing';
import {
  clearExamSession,
  createExamSession,
  saveExamSession,
  type ExamSession,
} from './domain/examTimer';

/** Exam モードを終了し Deep へ戻すための状態リセット用ヘルパは setter を直接呼ぶ。 */

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
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(() => loadLearningStyle());
  const [learningStyleScores, setLearningStyleScores] = useState(initialLearningStyleScores);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  /** Exam モードでの現在の出題インデックス（0 始まり・examSession.questionIds に対応）。 */
  const [examIndex, setExamIndex] = useState<number>(0);
  /** AI 評価フィードバック表示用 state（PBI-029 / TASK-011・新ケース移動でリセット）。 */
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback | null>(null);

  const locked = judgement !== null;
  const isDeep = isDeepMode(learningStyle);
  const isExam = learningStyle === 'exam';

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
    setLearningStyleScores((prev) => addLearningStyleScore(prev, learningStyle, result));
    setHistory((prev) =>
      pushHistory(
        prev,
        {
          caseId: current.id,
          judgement: result,
          correctPriority: current.correctPriority,
          learningStyle,
        },
        historyLimit,
      ),
    );
  };

  const handleNext = () => {
    // Exam モード: questionIds を順番に消費。最終問を越えたらセッション終了。
    if (isExam && examSession) {
      const nextIdx = examIndex + 1;
      if (nextIdx >= examSession.questionIds.length) {
        finalizeExamSession('Examモード完了！お疲れ様でした。');
        return;
      }
      setExamIndex(nextIdx);
      const nextId = examSession.questionIds[nextIdx];
      const next = allCases.find((c) => c.id === nextId) ?? null;
      setCurrent(next);
      setSelected(null);
      setJudgement(null);
      setWritingEntry(createEmptyWritingEntry());
      setWritingFeedback(null);
      return;
    }
    setCurrent(pickNextCaseByMode(allCases, current?.id, mode));
    setSelected(null);
    setJudgement(null);
    setWritingEntry(createEmptyWritingEntry());
    setWritingFeedback(null);
  };

  /**
   * Exam セッションを終了させ Deep モードへ復帰させる共通処理（PBI-027 / TASK-005-006）。
   * - sessionStorage をクリアし、examSession / index / writingFeedback を初期化。
   * - alert で簡易にユーザへ通知し、Deep モードとして 1 問目を提示する。
   */
  const finalizeExamSession = (message: string) => {
    clearExamSession();
    setExamSession(null);
    setExamIndex(0);
    setWritingFeedback(null);
    setLearningStyle('deep');
    saveLearningStyle('deep');
    setSelected(null);
    setJudgement(null);
    setWritingEntry(createEmptyWritingEntry());
    setCurrent(pickNextCaseByMode(allCases, undefined, mode));
    window.alert(message);
  };

  /** ExamTimer からの時間切れコールバック（PBI-027 / TASK-006）。 */
  const handleExamTimeUp = () => {
    if (!examSession) return;
    finalizeExamSession('時間終了！お疲れ様でした。');
  };

  /**
   * 「AI に見てもらう」ボタンハンドラ（PBI-029 / TASK-011）。
   * - 現在の WritingEntry と current.correctPriority を evaluateWriting に渡し評価結果を反映。
   * - feedback.ts の契約上 correctPriority は 'A'|'B'|'C' 一文字を要求するため、
   *   modelAnswer.judgment（長文）ではなく current.correctPriority を一次情報として使用する。
   */
  const handleEvaluateWriting = () => {
    if (!current) return;
    if (isWritingEntryEmpty(writingEntry)) return;
    const result = evaluateWriting(writingEntry, current.correctPriority);
    setWritingFeedback(result);
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
    setWritingFeedback(null);
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

  /**
   * 学習スタイル切替（PBI-036 / PBI-027）。
   * - 同値再選択は no-op。
   * - WritingEntry が空でない（Deep で記述あり）の場合は確認ダイアログ。
   * - `'exam'` への切替時は「Examモード: 20問・90分タイマーが開始されます。よろしいですか？」を確認し、
   *   OK 時に `createExamSession` で 20 問固定セッションを生成して `saveExamSession` で sessionStorage に保存する。
   *   キャンセル時は `'deep'` に戻す（PBI-027 / TASK-002）。
   * - Exam 中は `LearningStyleToggle` を無効化するため、原則ここから他モードへ切替されない。
   * - 切替時は WritingEntry をリセットし、localStorage へ永続化する。
   */
  const handleLearningStyleChange = (next: LearningStyle) => {
    if (next === learningStyle) return;
    // Exam 中に他モードへ切替る場合は中断確認を出す（PBI-027 / TASK-005）。
    if (learningStyle === 'exam' && examSession) {
      const ok = window.confirm(
        'Examを中断します。進捗は失われます。よろしいですか？',
      );
      if (!ok) return;
      clearExamSession();
      setExamSession(null);
      setExamIndex(0);
      setWritingFeedback(null);
      setLearningStyle(next);
      saveLearningStyle(next);
      setSelected(null);
      setJudgement(null);
      setWritingEntry(createEmptyWritingEntry());
      setCurrent(pickNextCaseByMode(allCases, undefined, mode));
      return;
    }
    if (!isWritingEntryEmpty(writingEntry)) {
      const ok = window.confirm('現在の入力内容を破棄してモード切替しますか?');
      if (!ok) return;
    }
    if (next === 'exam') {
      const ok = window.confirm(
        'Examモード: 20問・90分タイマーが開始されます。よろしいですか？',
      );
      if (!ok) {
        // キャンセル時は明示的に Deep に戻す（PBI-027 / TASK-002）。
        setLearningStyle('deep');
        saveLearningStyle('deep');
        setWritingEntry(createEmptyWritingEntry());
        return;
      }
      const allCaseIds = allCases.map((c) => c.id);
      try {
        const session = createExamSession(allCaseIds);
        setExamSession(session);
        setExamIndex(0);
        saveExamSession(session);
        // 初問を questionIds[0] で上書きする。
        const firstId = session.questionIds[0];
        const first = allCases.find((c) => c.id === firstId) ?? null;
        setCurrent(first);
        setSelected(null);
        setJudgement(null);
        setWritingFeedback(null);
      } catch {
        // 候補不足など。Exam 起動を諦め Deep に戻す（A-23 安全側フォールバック）。
        window.alert('Examモードの開始に必要な問題数が不足しています。Deepモードを継続します。');
        setLearningStyle('deep');
        saveLearningStyle('deep');
        setWritingEntry(createEmptyWritingEntry());
        return;
      }
    } else {
      // Exam 以外への切替時は念のため sessionStorage の Exam 残骸を掃除する。
      setExamSession(null);
      setExamIndex(0);
      clearExamSession();
    }
    setLearningStyle(next);
    saveLearningStyle(next);
    setWritingEntry(createEmptyWritingEntry());
    setWritingFeedback(null);
  };

  /** 「今回は書かない」スキップ（PBI-036 / TASK-010）: WritingEntry をクリアするのみ。 */
  const handleSkipWriting = () => {
    setWritingEntry(createEmptyWritingEntry());
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
          <div className="app-header__controls">
            <LearningStyleToggle
              style={learningStyle}
              onChange={handleLearningStyleChange}
            />
            <ThemeToggle />
          </div>
        </div>
        <p className="app-subtitle">インバスケット学習アプリ（MVP 開発中 - Sprint 006）</p>
        <ScoreCounter
          score={score}
          modeScores={modeScores}
          currentMode={mode}
          learningStyleScores={learningStyleScores}
          currentStyle={learningStyle}
        />
        {isExam && examSession !== null && (
          <ExamTimer session={examSession} onTimeUp={handleExamTimeUp} />
        )}
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
          {isDeep && (
            <WritingInput
              entry={writingEntry}
              onChange={setWritingEntry}
              disabled={locked}
              onSkip={isWritingEntryEmpty(writingEntry) ? undefined : handleSkipWriting}
            />
          )}
          {isDeep && !isWritingEntryEmpty(writingEntry) && (
            <div className="writing-input__ai-row">
              <button
                type="button"
                className="writing-input__ai"
                onClick={handleEvaluateWriting}
                aria-label="AIに評価を依頼する"
              >
                AIに見てもらう
              </button>
            </div>
          )}
          <AnswerButtons selected={selected} locked={locked} onSelect={handleSelect} />
          {judgement && selected && (
            <>
              {isDeep && (
                <>
                  <WritingPreview
                    entry={writingEntry}
                    isEmpty={isWritingEntryEmpty(writingEntry)}
                  />
                  <ModelAnswerView
                    modelAnswer={current.modelAnswer}
                    visible={!!judgement}
                    correctPriority={current.correctPriority}
                  />
                  <FeedbackView feedback={writingFeedback} visible={writingFeedback !== null} />
                </>
              )}
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
