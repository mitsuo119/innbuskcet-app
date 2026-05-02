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
