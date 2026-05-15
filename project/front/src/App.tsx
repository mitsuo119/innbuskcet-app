import { useEffect, useMemo, useRef, useState } from 'react';
import { AdSlot } from './ui/AdSlot';
import { AnswerButtons } from './ui/AnswerButtons';
import { CaseView } from './ui/CaseView';
import { ExplanationView } from './ui/ExplanationView';
import { GlobalNav } from './ui/GlobalNav';
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
import { ExamResultView } from './ui/ExamResultView';
import { ConfirmDialog, type ConfirmDialogAction } from './ui/ConfirmDialog';
import { SelfScoreInput } from './ui/SelfScoreInput';
import { RadarChart } from './ui/RadarChart';
import { WeaknessPatternTop3 } from './ui/WeaknessPatternTop3';
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
  calcRollingScore,
  initialLearningStyleScores,
  initialModeScores,
  initialScore,
} from './domain/score';
import { resolveShortcut, isEditableTarget } from './domain/shortcut';
import { createEmptyWritingEntry, isWritingEntryEmpty, type WritingEntry } from './domain/writing';
import { type SelfScoreEntry, type SelfScoreHistory } from './domain/selfScore';
import {
  clearExamProgress,
  clearExamSession,
  createExamSession,
  loadExamProgress,
  loadExamSession,
  saveExamProgress,
  saveExamSession,
  type ExamSession,
} from './domain/examTimer';
import { buildRelatedCaseHighlights } from './domain/relatedCaseHighlight';

/** ConfirmDialog の表示状態（PBI-038）。 */
interface DialogState {
  open: boolean;
  title: string;
  description?: string;
  actions: readonly ConfirmDialogAction[];
  onAction: (id: string) => void;
}

const DIALOG_CLOSED: DialogState = {
  open: false,
  title: '',
  actions: [],
  onAction: () => {},
};

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
  /**
   * Exam セッション中の回答履歴（出題順・PBI-030 / Sprint008 TASK-002）。
   * 既存 `history` は表示件数 10/20 で切り詰められるため、Exam 振り返り表示専用に
   * 別 state として保持する。Exam 終了 → ExamResultView 表示時に参照される。
   */
  const [examAnswers, setExamAnswers] = useState<readonly HistoryItem[]>([]);
  /**
   * Exam セッション中の各設問所要時間（ms 配列・出題順・PBI-044）。
   * - examAnswers と同じインデックスで対応する。
   * - 設問表示開始から回答確定までの経過 ms。
   */
  const [examElapsedMs, setExamElapsedMs] = useState<readonly number[]>([]);
  /** 現在の Exam 設問の表示開始時刻（PBI-044・経過時間計測の基準点）。 */
  const questionStartedAtRef = useRef<number>(Date.now());
  /**
   * Exam 終了時に表示する結果画面用スナップショット（PBI-030 / Sprint008 TASK-004）。
   * - `null` の間は通常 UI（出題画面）を表示する。
   * - 値がセットされたタイミングで ExamResultView を排他表示する。
   */
  const [examResult, setExamResult] = useState<{
    session: ExamSession;
    history: readonly HistoryItem[];
    elapsedMsList: readonly number[];
  } | null>(null);
  /** AI 評価フィードバック表示用 state（PBI-029 / TASK-011・新ケース移動でリセット）。 */
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback | null>(null);
  /** ConfirmDialog の表示 state（PBI-038）。 */
  const [dialogState, setDialogState] = useState<DialogState>(DIALOG_CLOSED);
  /**
   * PBI-025: 6軸自己採点履歴（セッション内のみ保持・リロードで初期化）。
   * - 採点済みエントリを順番に蓄積し RadarChart の平均計算に使用する。
   */
  const [selfScoreHistory, setSelfScoreHistory] = useState<SelfScoreHistory>([]);
  /**
   * PBI-025: 現在の問題に対して自己採点が完了（または スキップ）したかどうか。
   * - true の場合は SelfScoreInput を非表示にする。
   */
  const [selfScoreInputDone, setSelfScoreInputDone] = useState(false);

  const locked = judgement !== null;
  const isDeep = isDeepMode(learningStyle);
  const isExam = learningStyle === 'exam';

  /** 直近10問ローリング正答率（PBI-031）。Exam モードは表示しない（undefined）。 */
  const rollingScore = useMemo(
    () => (isExam ? undefined : calcRollingScore(history, 10, learningStyle)),
    [history, isExam, learningStyle],
  );

  /** caseId 逆引きマップ（PBI-028: 既出案件参照のため）。 */
  const caseMap = useMemo(() => {
    const map = new Map<string, Case>();
    for (const item of allCases) map.set(item.id, item);
    return map;
  }, [allCases]);

  /**
   * PBI-028: セッション内の既出案件との関連（同一人物/同一部署）を算出する。
   * - handleSubmit で history 末尾に「現在回答」が追加されるため、slice(0, -1) で除外。
   * - ハイライト対象がない場合は空配列（解説表示は通常動作）。
   */
  const relatedHighlights = useMemo(() => {
    if (!current || judgement === null) return [];
    const previousCases = history
      .slice(0, -1)
      .map((h) => caseMap.get(h.caseId))
      .filter((c): c is Case => c !== undefined);
    return buildRelatedCaseHighlights(current, previousCases);
  }, [caseMap, current, history, judgement]);

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
          answeredPriority: answer,
        },
        historyLimit,
      ),
    );
    // Exam モード中は別 state に出題順で蓄積し、結果画面で参照する（PBI-030 / TASK-002）。
    if (isExam && examSession) {
      const newItem: HistoryItem = {
        caseId: current.id,
        judgement: result,
        correctPriority: current.correctPriority,
        learningStyle,
        answeredPriority: answer,
      };
      const nextAnswers = [...examAnswers, newItem];
      setExamAnswers(nextAnswers);
      // PBI-044: 設問別経過時間（表示〜確定）を記録する。
      const elapsedForThisQuestion = Math.max(0, Date.now() - questionStartedAtRef.current);
      const nextElapsed = [...examElapsedMs, elapsedForThisQuestion];
      setExamElapsedMs(nextElapsed);
      // PBI-046 / TASK-201: 回答確定時に Exam 進捗スナップショットを保存する（中断・再開用）。
      // examAnswers をフルで保存し、再開時のスタブ復元を解消する（PBI-041 トレードオフ解消）。
      saveExamProgress({
        examIndex,
        answeredIds: nextAnswers.map((a) => a.caseId),
        elapsedMs: Date.now() - examSession.startedAt,
        examAnswers: nextAnswers.map((a, i) => ({
          caseId: a.caseId,
          judgement: a.judgement,
          correctPriority: a.correctPriority,
          ...(a.answeredPriority !== undefined && { answeredPriority: a.answeredPriority }),
          // 記述（writingEntry）は最後に確定した問のみ保持。最大 500 文字制限は writing.ts で担保。
          ...(current.id === a.caseId && !isWritingEntryEmpty(writingEntry)
            ? { userInput: { ...writingEntry } }
            : {}),
          // PBI-044: 設問別経過時間（ms）を保存。再開時に完全復元できる。
          ...(nextElapsed[i] !== undefined && { elapsedMs: nextElapsed[i] }),
        })),
      });
    }
  };

  const handleNext = () => {
    // Exam モード: questionIds を順番に消費。最終問を越えたらセッション終了。
    if (isExam && examSession) {
      const nextIdx = examIndex + 1;
      if (nextIdx >= examSession.questionIds.length) {
        finalizeExamSession();
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
      setSelfScoreInputDone(false);
      // PBI-044: 次設問の表示開始時刻にリセットし、設問別所要時間を計測する。
      questionStartedAtRef.current = Date.now();
      return;
    }
    setCurrent(pickNextCaseByMode(allCases, current?.id, mode));
    setSelected(null);
    setJudgement(null);
    setWritingEntry(createEmptyWritingEntry());
    setWritingFeedback(null);
    setSelfScoreInputDone(false);
  };

  /**
   * PBI-025: 自己採点記録ハンドラ。
   * - 入力スコアを selfScoreHistory に追加し、入力フォームを閉じる。
   */
  const handleSelfScoreSubmit = (entry: SelfScoreEntry) => {
    setSelfScoreHistory((prev) => [...prev, entry]);
    setSelfScoreInputDone(true);
  };

  /**
   * PBI-025: 自己採点スキップハンドラ。
   * - 採点しないまま入力フォームを閉じる（履歴には追加しない）。
   */
  const handleSelfScoreSkip = () => {
    setSelfScoreInputDone(true);
  };

  /**
   * Exam セッションを終了させ ExamResultView を表示する（PBI-030 / Sprint008 TASK-004）。
   * - sessionStorage をクリアし、出題用 state を初期化する。
   * - examResult に session/answers のスナップショットを保存し ExamResultView を表示する。
   * - learningStyle は Exam のまま据え置き、結果画面の「Deep で学習に戻る」で Deep へ復帰する。
   */
  const finalizeExamSession = () => {
    if (!examSession) return;
    const snapshot = {
      session: examSession,
      history: examAnswers,
      elapsedMsList: examElapsedMs,
    };
    clearExamSession();
    clearExamProgress(); // PBI-041 / TASK-005: Exam 終了時に進捗スナップショットも削除する。
    setExamSession(null);
    setExamIndex(0);
    setWritingFeedback(null);
    setSelected(null);
    setJudgement(null);
    setWritingEntry(createEmptyWritingEntry());
    setExamResult(snapshot);
  };

  /**
   * ExamResultView「Deep で学習に戻る」ハンドラ（PBI-030 / Sprint008 TASK-004）。
   * - learningStyle を 'deep' にリセットし、examSession / examAnswers / examResult を全クリアする。
   * - Quick / Deep 履歴非汚染のため、表示用 history は変更せずそのまま残す。
   */
  const handleBackToStudyFromExamResult = () => {
    setExamResult(null);
    setExamAnswers([]);
    setExamElapsedMs([]);
    setLearningStyle('deep');
    saveLearningStyle('deep');
    setSelected(null);
    setJudgement(null);
    setWritingEntry(createEmptyWritingEntry());
    setCurrent(pickNextCaseByMode(allCases, undefined, mode));
  };

  /** ExamTimer からの時間切れコールバック（PBI-027 / TASK-006）。 */
  const handleExamTimeUp = () => {
    if (!examSession) return;
    finalizeExamSession();
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
   * 学習スタイル切替（PBI-036 / PBI-027 / PBI-038）。
   * - 同値再選択は no-op。
   * - WritingEntry が空でない場合は ConfirmDialog で確認。
   * - `'exam'` への切替時は ConfirmDialog で確認し、OK 時に createExamSession を実行。
   * - Exam 中は中断確認 ConfirmDialog を表示し、OK 時に clearExamSession を実行。
   */
  const handleLearningStyleChange = (next: LearningStyle) => {
    if (next === learningStyle) return;

    /** Exam 以外への切替（ウォークスルー後の共通処理）。 */
    const switchToNonExam = (to: LearningStyle) => {
      setExamSession(null);
      setExamIndex(0);
      setExamAnswers([]);
      setExamElapsedMs([]);
      setExamResult(null);
      clearExamSession();
      setLearningStyle(to);
      saveLearningStyle(to);
      setWritingEntry(createEmptyWritingEntry());
      setWritingFeedback(null);
    };

    /** Exam セッション起動処理。失敗時は Deep に戻すダイアログを出す。 */
    const startExam = () => {
      const allCaseIds = allCases.map((c) => c.id);
      try {
        const session = createExamSession(allCaseIds);
        setExamSession(session);
        setExamIndex(0);
        setExamAnswers([]);
        setExamElapsedMs([]);
        setExamResult(null);
        saveExamSession(session);
        const firstId = session.questionIds[0];
        const first = allCases.find((c) => c.id === firstId) ?? null;
        setCurrent(first);
        setSelected(null);
        setJudgement(null);
        setWritingFeedback(null);
        setLearningStyle('exam');
        saveLearningStyle('exam');
        setWritingEntry(createEmptyWritingEntry());
        setDialogState(DIALOG_CLOSED);
        // PBI-044: 設問表示開始時刻を初期化。
        questionStartedAtRef.current = Date.now();
      } catch {
        // 候補不足。フォールバックダイアログ表示。
        setDialogState({
          open: true,
          title: 'Examモードを開始できません',
          description: '問題数が不足しています。Deepモードを継続します。',
          actions: [{ id: 'ok', label: 'OK', variant: 'primary', autoFocus: true }],
          onAction: () => {
            setDialogState(DIALOG_CLOSED);
            setLearningStyle('deep');
            saveLearningStyle('deep');
            setWritingEntry(createEmptyWritingEntry());
          },
        });
      }
    };

    // Exam 中に他モードへ切替る場合は中断確認（PBI-027 / TASK-005）。
    if (learningStyle === 'exam' && examSession) {
      setDialogState({
        open: true,
        title: 'Examを中断しますか？',
        description: 'Examを中断すると、現在の進捗は失われます。',
        // PBI-047 / A-56（§6-D 3-34）: 破壊的アクションは安全側（キャンセル）に初期フォーカス。
        actions: [
          { id: 'cancel', label: 'キャンセル', variant: 'secondary', autoFocus: true },
          { id: 'confirm', label: '中断する', variant: 'danger' },
        ],
        onAction: (id) => {
          setDialogState(DIALOG_CLOSED);
          if (id !== 'confirm') return;
          switchToNonExam(next);
          setCurrent(pickNextCaseByMode(allCases, undefined, mode));
        },
      });
      return;
    }

    // WritingEntry に記述がある場合は破棄確認。
    if (!isWritingEntryEmpty(writingEntry)) {
      setDialogState({
        open: true,
        title: '入力内容を破棄しますか？',
        description: '現在の入力内容を破棄してモードを切り替えます。',
        // PBI-047 / A-56（§6-D 3-34）: 破壊的アクションは安全側（キャンセル）に初期フォーカス。
        actions: [
          { id: 'cancel', label: 'キャンセル', variant: 'secondary', autoFocus: true },
          { id: 'confirm', label: '破棄して切替', variant: 'danger' },
        ],
        onAction: (id) => {
          setDialogState(DIALOG_CLOSED);
          if (id !== 'confirm') return;
          if (next === 'exam') {
            // 破棄確認OK → Exam 開始確認へ進む
            setDialogState({
              open: true,
              title: 'Examモードを開始しますか？',
              description: '20問・90分タイマーのExamが開始されます。',
              actions: [
                { id: 'cancel', label: 'キャンセル', variant: 'secondary' },
                { id: 'confirm', label: '開始する', variant: 'primary', autoFocus: true },
              ],
              onAction: (actionId) => {
                if (actionId !== 'confirm') {
                  setDialogState(DIALOG_CLOSED);
                  setLearningStyle('deep');
                  saveLearningStyle('deep');
                  setWritingEntry(createEmptyWritingEntry());
                  return;
                }
                startExam();
              },
            });
            return;
          }
          switchToNonExam(next);
        },
      });
      return;
    }

    // Exam へ切替る場合は開始確認（PBI-027 / TASK-002）。
    if (next === 'exam') {
      setDialogState({
        open: true,
        title: 'Examモードを開始しますか？',
        description: '20問・90分タイマーのExamが開始されます。',
        actions: [
          { id: 'cancel', label: 'キャンセル', variant: 'secondary' },
          { id: 'confirm', label: '開始する', variant: 'primary', autoFocus: true },
        ],
        onAction: (id) => {
          if (id !== 'confirm') {
            setDialogState(DIALOG_CLOSED);
            setLearningStyle('deep');
            saveLearningStyle('deep');
            setWritingEntry(createEmptyWritingEntry());
            return;
          }
          startExam();
        },
      });
      return;
    }

    // 通常のモード切替（Quick ↔ Deep）。
    switchToNonExam(next);
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

  /**
   * マウント時の Exam 中断・再開導線（PBI-041 / TASK-005 / PBI-046 拡張）。
   * - sessionStorage に Exam セッション + 進捗スナップショットの両方が残っていれば
   *   ConfirmDialog で「続行 / 新規開始 / キャンセル」を提示する。
   * - 続行: 旧セッション・旧進捗から状態復元し中断点から再開する。
   *   PBI-046: examAnswers がスナップショットに含まれていれば、judgement / answeredPriority を
   *   完全復元する。古い形式（answeredIds のみ）の場合のみ後方互換でスタブ再構築する。
   * - 新規開始: 旧セッションと旧スナップショットをクリアし新規 Exam を起動する。
   * - キャンセル: Deep モードへ戻し Exam は開始しない。
   */
  useEffect(() => {
    const savedSession = loadExamSession();
    const savedProgress = loadExamProgress();
    if (!savedSession || !savedProgress) return;

    const continueExam = () => {
      const reconstructed: HistoryItem[] =
        savedProgress.examAnswers && savedProgress.examAnswers.length > 0
          ? // PBI-046: 完全復元パス。
            savedProgress.examAnswers.map((a) => ({
              caseId: a.caseId,
              judgement: a.judgement === 'unanswered' ? 'incorrect' : a.judgement,
              correctPriority: a.correctPriority,
              learningStyle: 'exam',
              ...(a.answeredPriority !== undefined && { answeredPriority: a.answeredPriority }),
            }))
          : // 旧スナップショット互換（answeredIds のみ）。
            savedProgress.answeredIds.map((cid) => {
              const c = allCases.find((x) => x.id === cid);
              return {
                caseId: cid,
                judgement: 'correct',
                correctPriority: c?.correctPriority ?? 'A',
                learningStyle: 'exam',
              };
            });
      setExamSession(savedSession);
      setExamIndex(savedProgress.examIndex);
      setExamAnswers(reconstructed);
      // PBI-044: スナップショットから設問別経過時間を復元（未保有要素は 0 フォールバック）。
      const restoredElapsed: number[] =
        savedProgress.examAnswers && savedProgress.examAnswers.length > 0
          ? savedProgress.examAnswers.map((a) =>
              typeof a.elapsedMs === 'number' && a.elapsedMs >= 0 ? a.elapsedMs : 0,
            )
          : reconstructed.map(() => 0);
      setExamElapsedMs(restoredElapsed);
      setExamResult(null);
      const cid = savedSession.questionIds[savedProgress.examIndex] ?? null;
      setCurrent(cid ? (allCases.find((c) => c.id === cid) ?? null) : null);
      setSelected(null);
      setJudgement(null);
      setWritingEntry(createEmptyWritingEntry());
      setWritingFeedback(null);
      setLearningStyle('exam');
      saveLearningStyle('exam');
      // PBI-044: 再開設問の表示開始時刻を now にセット。
      questionStartedAtRef.current = Date.now();
    };

    const restartExam = () => {
      clearExamSession();
      clearExamProgress();
      const ids = allCases.map((c) => c.id);
      try {
        const session = createExamSession(ids);
        saveExamSession(session);
        setExamSession(session);
        setExamIndex(0);
        setExamAnswers([]);
        setExamElapsedMs([]);
        setExamResult(null);
        const firstId = session.questionIds[0];
        setCurrent(allCases.find((c) => c.id === firstId) ?? null);
        setSelected(null);
        setJudgement(null);
        setWritingFeedback(null);
        setWritingEntry(createEmptyWritingEntry());
        setLearningStyle('exam');
        saveLearningStyle('exam');
        questionStartedAtRef.current = Date.now();
      } catch {
        // 候補不足のときは Deep に戻す。
        setLearningStyle('deep');
        saveLearningStyle('deep');
      }
    };

    const cancelResume = () => {
      // Exam は開始せず Deep モードへ戻す。旧セッション/進捗はそのまま残す
      // （ユーザが後でブラウザを再ロードしたときに再度ダイアログが出る挙動）。
      setLearningStyle('deep');
      saveLearningStyle('deep');
    };

    setDialogState({
      open: true,
      title: 'Exam の続きから再開しますか？',
      description: '前回中断した Exam セッションが残っています。',
      actions: [
        { id: 'cancel', label: 'キャンセル', variant: 'secondary' },
        { id: 'restart', label: '新規開始', variant: 'danger' },
        { id: 'continue', label: '続行', variant: 'primary', autoFocus: true },
      ],
      onAction: (id) => {
        setDialogState(DIALOG_CLOSED);
        if (id === 'continue') continueExam();
        else if (id === 'restart') restartExam();
        else cancelResume();
      },
    });
    // マウント時のみ実行（allCases は useMemo で安定）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <main className="container">
        <header className="app-header">
          <div className="app-header__top">
            <h1>インバスケット</h1>
            <div className="app-header__controls">
              <LearningStyleToggle style={learningStyle} onChange={handleLearningStyleChange} />
              <ThemeToggle />
            </div>
          </div>
          <p className="app-subtitle">インバスケット学習アプリ</p>
          <ScoreCounter
            score={score}
            modeScores={modeScores}
            currentMode={mode}
            learningStyleScores={learningStyleScores}
            currentStyle={learningStyle}
            rollingScore={rollingScore}
            rollingN={10}
          />
          <GlobalNav current="home" />
          {isExam && examSession !== null && (
            <ExamTimer session={examSession} onTimeUp={handleExamTimeUp} />
          )}
        </header>

        {/*
          PBI-090 / TASK-090-1: トップ本文「このサイトについて」段落（200〜400字）。
          AdSense クローラ・JS 無効環境向けに、本サイトの目的・対象読者・無料学習である旨と、
          主要コンテンツ（全12章解説 / 20パターン / 20ケース / Quick/Deep/Exam の3モード）を
          プレーンテキスト中心で表示する。h1（既存「インバスケット」）→ h2（本セクション）の
          見出し階層を維持し、a11y 退行ゼロを担保する。
        */}
        <section className="home-about" aria-labelledby="home-about-heading">
          <h2 id="home-about-heading" className="home-about__title">
            このサイトについて
          </h2>
          <p className="home-about__lead">
            InBusket（インバスケット学習アプリ）は、管理職昇進試験などで出題されるインバスケット演習を、
            案件処理・優先順位付け・委任判断・意思決定フレームワーク・模擬試験まで、
            ブラウザ上で体系的に<strong>無料</strong>で学べる日本語の学習Webサービスです。
          </p>
          <p className="home-about__lead">
            想定読者は、管理職昇進試験を控える社会人や、優先順位判断・委任・意思決定スキルを
            体系的に学びたい方です。コンテンツは、全12章の解説リファレンス、
            全20パターンのケース別解説、代表ケース20件の単独URL演習、
            <strong>Quick（速習）</strong>／<strong>Deep（記述）</strong>／
            <strong>Exam（模試）</strong>
            の3つの学習モードで構成され、繰り返しの訓練を通じて合格水準の判断力と回答骨格を身につけられます。
          </p>
          <p className="home-about__links">
            詳細は
            <a href="/about" className="home-about__link">
              運営者情報
            </a>
            ／
            <a href="/terms" className="home-about__link">
              サービス利用規約
            </a>
            をご覧ください。
          </p>
        </section>

        <AdSlot label="広告（ヘッダー下バナー）" className="ad-slot--header" />

        {examResult ? (
          <ExamResultView
            session={examResult.session}
            history={examResult.history}
            elapsedMsList={examResult.elapsedMsList}
            onBackToStudy={handleBackToStudyFromExamResult}
            cases={allCases}
          />
        ) : (
          <>
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
                        <FeedbackView
                          feedback={writingFeedback}
                          visible={writingFeedback !== null}
                        />
                      </>
                    )}
                    <ExplanationView
                      caseItem={current}
                      answer={selected}
                      judgement={judgement}
                      relatedHighlights={relatedHighlights}
                      onRetry={handleRetry}
                    />
                    {/* PBI-025: 自己採点入力UI（回答後・スキップまたは採点完了まで表示） */}
                    {!selfScoreInputDone && (
                      <SelfScoreInput
                        onSubmit={handleSelfScoreSubmit}
                        onSkip={handleSelfScoreSkip}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <p>該当する優先度の案件がありません。モードを切替えてください。</p>
            )}

            {/* PBI-025: 6軸レーダーチャート（1問以上採点済みのときに表示） */}
            {selfScoreHistory.length > 0 && <RadarChart history={selfScoreHistory} />}

            {/* PBI-026: パターン別弱点Top3（3問以上回答済みのときに表示） */}
            {history.length >= 3 && <WeaknessPatternTop3 history={history} />}

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
              <nav className="app-footer__legal" aria-label="法務・サポートページ">
                <a href="/privacy-policy" className="app-footer__legal-link">
                  プライバシーポリシー
                </a>
                <span className="app-footer__legal-sep" aria-hidden="true">
                  |
                </span>
                <a href="/terms-of-service" className="app-footer__legal-link">
                  利用規約
                </a>
                <span className="app-footer__legal-sep" aria-hidden="true">
                  |
                </span>
                <a href="/contact" className="app-footer__legal-link">
                  お問い合わせ
                </a>
              </nav>
              {/* PBI-088 / 089 (TASK-088-1 / TASK-089-1): AdSense再申請向け運営者情報・利用規約 短URL動線 */}
              <nav className="app-footer__legal" aria-label="運営者情報・規約（短URL）">
                <a href="/about" className="app-footer__legal-link">
                  運営者情報
                </a>
                <span className="app-footer__legal-sep" aria-hidden="true">
                  |
                </span>
                <a href="/terms" className="app-footer__legal-link">
                  サービス利用規約
                </a>
                <span className="app-footer__legal-sep" aria-hidden="true">
                  |
                </span>
                <a href="/privacy-policy" className="app-footer__legal-link">
                  プライバシー
                </a>
                <span className="app-footer__legal-sep" aria-hidden="true">
                  |
                </span>
                <a href="/contact" className="app-footer__legal-link">
                  お問い合わせ
                </a>
              </nav>
              <nav className="app-footer__legal" aria-label="学習サポートページ">
                <a href="/reference" className="app-footer__legal-link">
                  解説リファレンス
                </a>
                <span className="app-footer__legal-sep" aria-hidden="true">
                  |
                </span>
                <a href="/patterns" className="app-footer__legal-link">
                  パターン別解説
                </a>
              </nav>
            </footer>
          </>
        )}
        <AdSlot label="広告（メインコンテンツ下）" className="ad-slot--footer" />
      </main>
      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        description={dialogState.description}
        actions={dialogState.actions}
        onAction={dialogState.onAction}
        onClose={() => setDialogState(DIALOG_CLOSED)}
      />
    </>
  );
}
