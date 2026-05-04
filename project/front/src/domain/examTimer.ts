/**
 * Exam モード（PBI-027）のタイマー / セッション管理ドメイン。
 *
 * - 20 問固定 / 90 分固定。
 * - 純粋関数（残時間計算 / 時間切れ判定 / mm:ss フォーマット）と
 *   sessionStorage I/O を分離（DoD §10-3 適用範囲：Exam 中断・再開）。
 * - sessionStorage はタブクローズで消失する仕様を許容し、永続化は意図的にしない。
 * - 不正値（必須キー欠落 / 型不一致 / JSON parse エラー）は安全に null フォールバック。
 */

/** Exam セッションの最小スナップショット（中断・再開用）。 */
export interface ExamSession {
  /** 出題総数（固定 20）。 */
  readonly totalQuestions: number;
  /** 制限時間（秒・固定 5400）。 */
  readonly timeLimit: number;
  /** セッション開始時刻（`Date.now()` ベース・UNIX ms）。 */
  readonly startedAt: number;
  /** 出題対象の caseId 配列（出題順序を固定）。 */
  readonly questionIds: readonly string[];
}

/** Exam モードの問題数（固定 20 問）。 */
export const EXAM_TOTAL_QUESTIONS = 20;

/** Exam モードの制限時間（秒・90 分）。 */
export const EXAM_TIME_LIMIT_SECONDS = 90 * 60;

/** sessionStorage 保存キー（DoD §10-3 適用範囲）。 */
const STORAGE_KEY = 'inbasket.examSession.v1';

/** Exam 進行状況の保存キー（PBI-041）。 */
const PROGRESS_STORAGE_KEY = 'examProgress';

/**
 * Exam 進行状況スナップショット（PBI-041 / 中断・再開用 / PBI-046 拡張）。
 *
 * - PBI-046: 再開後の振り返り精度を完全化するため `examAnswers`（回答配列フル）を追加。
 *   旧スナップショット互換のため optional とし、未保有時は呼び出し側で空配列扱い。
 * - DoD §10-3: sessionStorage 復元時の整合性検証ポリシーを `examAnswers` 配列要素にも拡張。
 */
export interface ExamProgressSnapshot {
  /** 現在の出題インデックス（0 始まり）。 */
  examIndex: number;
  /** 回答済み caseId 配列（旧互換 / 表示には examAnswers を優先利用）。 */
  answeredIds: string[];
  /** 経過時間（ms）。 */
  elapsedMs: number;
  /** 回答エントリ配列（PBI-046）。 */
  examAnswers?: ExamAnswerEntry[];
}

/** Exam 回答エントリ（PBI-046・PBI-044 拡張）。 */
export interface ExamAnswerEntry {
  /** 該当 caseId。 */
  caseId: string;
  /** 採点結果（PBI-046 で未回答 'unanswered' を追加）。 */
  judgement: ExamAnswerJudgement;
  /** その案件の正解優先度。 */
  correctPriority: 'A' | 'B' | 'C';
  /** ユーザが回答した優先度（未回答時は省略）。 */
  answeredPriority?: 'A' | 'B' | 'C';
  /** 記述回答（PBI-023 / Deep / Exam 入力。各フィールド最大 500 文字）。 */
  userInput?: ExamAnswerUserInput;
  /**
   * 当該設問に費やした所要時間（ミリ秒・PBI-044）。
   * - 設問表示時刻から回答確定時刻までの経過 ms。
   * - 旧スナップショット互換のため optional。未保有時は表示側で「-」フォールバック。
   * - 不正値（負値・非数値）は loadExamProgress の検証で破棄される（DoD §10-3）。
   */
  elapsedMs?: number;
}

/** Exam 回答エントリの judgement 列挙値（PBI-046）。 */
export type ExamAnswerJudgement = 'correct' | 'incorrect' | 'unanswered';

/** Exam 回答エントリのユーザ記述入力（PBI-023 互換）。 */
export interface ExamAnswerUserInput {
  judgment: string;
  reason: string;
  action: string;
}

/** ExamAnswerEntry の userInput 各フィールド最大文字数（DoD §10-1 / writing.ts と同値）。 */
export const EXAM_ANSWER_USER_INPUT_MAX_LENGTH = 500;

/**
 * 候補 caseId 配列からランダムに `EXAM_TOTAL_QUESTIONS` 件を選び、
 * 新しい `ExamSession` を生成する純粋関数（時刻のみ `Date.now()` を参照）。
 *
 * @throws 候補件数が `EXAM_TOTAL_QUESTIONS` 未満のとき。
 */
export function createExamSession(allCaseIds: readonly string[]): ExamSession {
  if (allCaseIds.length < EXAM_TOTAL_QUESTIONS) {
    throw new Error(
      `createExamSession: 候補が不足しています（必要 ${EXAM_TOTAL_QUESTIONS} / 実際 ${allCaseIds.length}）`,
    );
  }
  // Fisher–Yates 部分シャッフル（先頭 EXAM_TOTAL_QUESTIONS 件のみ確定すれば十分）。
  const pool = allCaseIds.slice();
  for (let i = 0; i < EXAM_TOTAL_QUESTIONS; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const questionIds = pool.slice(0, EXAM_TOTAL_QUESTIONS);
  return {
    totalQuestions: EXAM_TOTAL_QUESTIONS,
    timeLimit: EXAM_TIME_LIMIT_SECONDS,
    startedAt: Date.now(),
    questionIds,
  };
}

/** 経過秒数（小数点以下切り捨て / 0 以上）。 */
export function getElapsedSeconds(session: ExamSession, now: number = Date.now()): number {
  const elapsedMs = Math.max(0, now - session.startedAt);
  return Math.floor(elapsedMs / 1000);
}

/** 残り秒数（0 未満は 0 にクランプ）。 */
export function getRemainingSeconds(session: ExamSession, now: number = Date.now()): number {
  const remaining = session.timeLimit - getElapsedSeconds(session, now);
  return remaining < 0 ? 0 : remaining;
}

/** 時間切れ判定（残 0 秒で true）。 */
export function isTimeUp(session: ExamSession, now: number = Date.now()): boolean {
  return getRemainingSeconds(session, now) <= 0;
}

/**
 * 秒数を "MM:SS" 形式で整形する。
 * - 負値は "00:00" にクランプ。
 * - 60 分以上（試験 90 分など）は MM が 2 桁を超えてもそのまま表示（例: "90:00"）。
 */
export function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const mm = Math.floor(safe / 60);
  const ss = safe % 60;
  const mmStr = mm < 10 ? `0${mm}` : String(mm);
  const ssStr = ss < 10 ? `0${ss}` : String(ss);
  return `${mmStr}:${ssStr}`;
}

function isValidExamSession(value: unknown): value is ExamSession {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.totalQuestions !== 'number' || v.totalQuestions <= 0) return false;
  if (typeof v.timeLimit !== 'number' || v.timeLimit <= 0) return false;
  if (typeof v.startedAt !== 'number' || !Number.isFinite(v.startedAt)) return false;
  if (!Array.isArray(v.questionIds)) return false;
  if (!v.questionIds.every((id) => typeof id === 'string')) return false;
  return true;
}

/**
 * Exam セッションを sessionStorage に保存する（DoD §10-3）。
 * - storage 不可環境（プライベートモード等）では黙って失敗（呼び出し側を巻き込まない）。
 */
export function saveExamSession(session: ExamSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // no-op
  }
}

/**
 * sessionStorage から Exam セッションを読み込む（DoD §10-3）。
 * - キー未設定 / 不正 JSON / スキーマ不一致 はすべて `null` フォールバック。
 */
export function loadExamSession(): ExamSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidExamSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** sessionStorage の Exam セッションを削除する（中断・終了時の後始末用）。 */
export function clearExamSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

function isValidProgressSnapshot(value: unknown): value is ExamProgressSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.examIndex !== 'number' || !Number.isFinite(v.examIndex) || v.examIndex < 0) {
    return false;
  }
  if (typeof v.elapsedMs !== 'number' || !Number.isFinite(v.elapsedMs) || v.elapsedMs < 0) {
    return false;
  }
  if (!Array.isArray(v.answeredIds)) return false;
  if (!v.answeredIds.every((id) => typeof id === 'string')) return false;
  // examAnswers は optional。存在する場合のみ Array チェックをする（要素の妥当性は別関数で行う）。
  if (v.examAnswers !== undefined && !Array.isArray(v.examAnswers)) return false;
  return true;
}

const VALID_PRIORITIES: ReadonlySet<string> = new Set(['A', 'B', 'C']);
const VALID_JUDGEMENTS: ReadonlySet<string> = new Set(['correct', 'incorrect', 'unanswered']);

/**
 * 単一 ExamAnswerEntry の妥当性を検証する（PBI-046 / DoD §10-3）。
 * - 必須キー欠落 / 型不一致 / judgement 列挙値外 / userInput 最大長超過は無効。
 * - 無効要素は呼び出し側で破棄する（null フォールバックではなく当該要素のみ削除）。
 */
function isValidExamAnswerEntry(value: unknown): value is ExamAnswerEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.caseId !== 'string' || v.caseId.length === 0) return false;
  if (typeof v.judgement !== 'string' || !VALID_JUDGEMENTS.has(v.judgement)) return false;
  if (typeof v.correctPriority !== 'string' || !VALID_PRIORITIES.has(v.correctPriority)) {
    return false;
  }
  if (v.answeredPriority !== undefined) {
    if (typeof v.answeredPriority !== 'string' || !VALID_PRIORITIES.has(v.answeredPriority)) {
      return false;
    }
  }
  if (v.userInput !== undefined) {
    if (typeof v.userInput !== 'object' || v.userInput === null) return false;
    const u = v.userInput as Record<string, unknown>;
    for (const key of ['judgment', 'reason', 'action'] as const) {
      const s = u[key];
      if (typeof s !== 'string') return false;
      if (s.length > EXAM_ANSWER_USER_INPUT_MAX_LENGTH) return false;
    }
  }
  // PBI-044: elapsedMs は optional・非負の有限数値のみ許容（DoD §10-3）。
  if (v.elapsedMs !== undefined) {
    if (typeof v.elapsedMs !== 'number' || !Number.isFinite(v.elapsedMs) || v.elapsedMs < 0) {
      return false;
    }
  }
  return true;
}

/**
 * Exam 進行状況を sessionStorage に保存する（PBI-041 / DoD §10-3）。
 * - storage 不可環境では黙って失敗する。
 */
export function saveExamProgress(snapshot: ExamProgressSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // no-op
  }
}

/**
 * sessionStorage から Exam 進行状況を読み込む（PBI-041 / DoD §10-3 / PBI-046 拡張）。
 * - キー未設定 / 不正 JSON / トップレベルスキーマ不一致 はすべて `null` フォールバック。
 * - `examAnswers` 配列の各要素は個別に検証し、無効要素のみ破棄する（PBI-046）。
 */
export function loadExamProgress(): ExamProgressSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidProgressSnapshot(parsed)) return null;
    if (Array.isArray(parsed.examAnswers)) {
      const valid = parsed.examAnswers.filter(isValidExamAnswerEntry);
      return { ...parsed, examAnswers: valid };
    }
    return parsed;
  } catch {
    return null;
  }
}

/** sessionStorage の Exam 進行状況を削除する（PBI-041）。 */
export function clearExamProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // no-op
  }
}
