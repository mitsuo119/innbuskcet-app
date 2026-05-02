import { useEffect, useState } from 'react';
import { formatTime, getRemainingSeconds, type ExamSession } from '../domain/examTimer';

/** 残時間警告のしきい値（秒）。5 分を切ったら警告スタイルへ切替（PBI-027 / TASK-003）。 */
export const EXAM_TIMER_WARNING_THRESHOLD_SECONDS = 300;

export interface ExamTimerProps {
  /** 進行中の Exam セッション。 */
  session: ExamSession;
  /** 残時間 0 秒到達時に一度だけ呼ばれるコールバック。 */
  onTimeUp: () => void;
}

/**
 * Exam モードの残時間表示コンポーネント（PBI-027 / TASK-003）。
 *
 * - `getRemainingSeconds` で毎秒残時間を更新し、`formatTime` で mm:ss 表示する。
 * - 残時間 5 分（300 秒）以下で警告 CSS クラスへ切替（DoD §9-2 色のみに依存しない＋テキスト併記）。
 * - 残時間 0 で `onTimeUp` を呼び、自身の interval をクリアして以降呼ばない。
 * - `role="timer"` / `aria-label="残り時間"` / `aria-live="polite"` を付与（DoD §9-3）。
 * - `dangerouslySetInnerHTML` 不使用（DoD §10-2）。
 */
export function ExamTimer({ session, onTimeUp }: ExamTimerProps) {
  const [remaining, setRemaining] = useState<number>(() => getRemainingSeconds(session));

  useEffect(() => {
    // session 切替時は即時に再計算しておく。
    setRemaining(getRemainingSeconds(session));

    let firedTimeUp = false;
    const id = window.setInterval(() => {
      const r = getRemainingSeconds(session);
      setRemaining(r);
      if (r <= 0 && !firedTimeUp) {
        firedTimeUp = true;
        window.clearInterval(id);
        onTimeUp();
      }
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [session, onTimeUp]);

  const isWarning = remaining <= EXAM_TIMER_WARNING_THRESHOLD_SECONDS;
  const className = isWarning ? 'exam-timer exam-timer--warning' : 'exam-timer';

  return (
    <div className={className} role="timer" aria-label="残り時間" aria-live="polite">
      <span className="exam-timer__caption">残り</span>
      <span className="exam-timer__value">{formatTime(remaining)}</span>
      {isWarning && <span className="exam-timer__badge">残りわずか</span>}
    </div>
  );
}
