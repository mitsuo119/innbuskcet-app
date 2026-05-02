import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ExamTimer } from './ExamTimer';
import {
  EXAM_TIME_LIMIT_SECONDS,
  EXAM_TOTAL_QUESTIONS,
  type ExamSession,
} from '../domain/examTimer';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function makeSession(startedAt: number): ExamSession {
  return {
    totalQuestions: EXAM_TOTAL_QUESTIONS,
    timeLimit: EXAM_TIME_LIMIT_SECONDS,
    startedAt,
    questionIds: Array.from({ length: EXAM_TOTAL_QUESTIONS }, (_, i) => `case-${i + 1}`),
  };
}

describe('ExamTimer（PBI-027 / TASK-003）', () => {
  let container: HTMLDivElement;
  let root: Root;
  const FIXED_NOW = 1_700_000_000_000; // ms

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it('role="timer" / aria-label="残り時間" / aria-live="polite" を付与する', () => {
    const session = makeSession(FIXED_NOW);
    act(() => {
      root.render(<ExamTimer session={session} onTimeUp={() => {}} />);
    });
    const timer = container.querySelector('[role="timer"]');
    expect(timer).not.toBeNull();
    expect(timer!.getAttribute('aria-label')).toBe('残り時間');
    expect(timer!.getAttribute('aria-live')).toBe('polite');
  });

  it('開始直後は mm:ss 表示が "90:00"（90 分残）', () => {
    const session = makeSession(FIXED_NOW);
    act(() => {
      root.render(<ExamTimer session={session} onTimeUp={() => {}} />);
    });
    expect(container.textContent).toContain('90:00');
  });

  it('5 分以下になると warning クラスが付与される', () => {
    // 開始から 86 分経過 → 残 4 分 = 240 秒
    const session = makeSession(FIXED_NOW - 86 * 60 * 1000);
    act(() => {
      root.render(<ExamTimer session={session} onTimeUp={() => {}} />);
    });
    const timer = container.querySelector('[role="timer"]') as HTMLElement;
    expect(timer.className).toContain('exam-timer--warning');
    expect(container.textContent).toContain('04:00');
  });

  it('5 分超では warning クラスが付与されない', () => {
    // 開始から 84 分経過 → 残 6 分 = 360 秒
    const session = makeSession(FIXED_NOW - 84 * 60 * 1000);
    act(() => {
      root.render(<ExamTimer session={session} onTimeUp={() => {}} />);
    });
    const timer = container.querySelector('[role="timer"]') as HTMLElement;
    expect(timer.className).not.toContain('exam-timer--warning');
  });

  it('setInterval で毎秒残時間が更新される', () => {
    const session = makeSession(FIXED_NOW);
    act(() => {
      root.render(<ExamTimer session={session} onTimeUp={() => {}} />);
    });
    expect(container.textContent).toContain('90:00');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.textContent).toContain('89:59');
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(container.textContent).toContain('89:57');
  });

  it('残 0 秒到達で onTimeUp が一度だけ呼ばれ、以降は呼ばれない', () => {
    // 開始から 89:59 経過させて残 1 秒の状態にする
    const session = makeSession(FIXED_NOW - (EXAM_TIME_LIMIT_SECONDS - 1) * 1000);
    const onTimeUp = vi.fn();
    act(() => {
      root.render(<ExamTimer session={session} onTimeUp={onTimeUp} />);
    });
    // まだ残 1 秒
    expect(onTimeUp).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onTimeUp).toHaveBeenCalledTimes(1);
    // 以降何回 tick しても増えない
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it('アンマウントで interval がクリーンアップされる（onTimeUp も再発火しない）', () => {
    const session = makeSession(FIXED_NOW);
    const onTimeUp = vi.fn();
    act(() => {
      root.render(<ExamTimer session={session} onTimeUp={onTimeUp} />);
    });
    act(() => {
      root.unmount();
    });
    act(() => {
      vi.advanceTimersByTime(EXAM_TIME_LIMIT_SECONDS * 1000 + 5000);
    });
    expect(onTimeUp).not.toHaveBeenCalled();
    // 二重 unmount を afterEach が呼ばないよう、container/root を作り直す
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
});
