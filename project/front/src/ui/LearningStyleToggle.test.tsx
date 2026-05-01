import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { LearningStyleToggle } from './LearningStyleToggle';
import type { LearningStyle } from '../domain/learningStyle';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('LearningStyleToggle（PBI-036 / TASK-008）', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('role="group" と aria-label="学習スタイル" を持ち、2つのボタンを描画する', () => {
    act(() => {
      root.render(<LearningStyleToggle style="deep" onChange={() => {}} />);
    });
    const group = container.querySelector('[role="group"]');
    expect(group).not.toBeNull();
    expect(group!.getAttribute('aria-label')).toBe('学習スタイル');
    const btns = container.querySelectorAll('button');
    expect(btns.length).toBe(2);
  });

  it('選択中のボタンのみ aria-pressed="true" を持つ（style="deep"）', () => {
    act(() => {
      root.render(<LearningStyleToggle style="deep" onChange={() => {}} />);
    });
    const btns = Array.from(container.querySelectorAll('button'));
    const pressed = btns.filter((b) => b.getAttribute('aria-pressed') === 'true');
    expect(pressed.length).toBe(1);
    expect(pressed[0].textContent).toContain('Deep');
  });

  it('選択中のボタンのみ aria-pressed="true" を持つ（style="quick"）', () => {
    act(() => {
      root.render(<LearningStyleToggle style="quick" onChange={() => {}} />);
    });
    const btns = Array.from(container.querySelectorAll('button'));
    const pressed = btns.filter((b) => b.getAttribute('aria-pressed') === 'true');
    expect(pressed.length).toBe(1);
    expect(pressed[0].textContent).toContain('Quick');
  });

  it('未選択ボタンをクリックすると onChange が呼ばれる', () => {
    const onChange = vi.fn<(s: LearningStyle) => void>();
    act(() => {
      root.render(<LearningStyleToggle style="deep" onChange={onChange} />);
    });
    const quickBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Quick'),
    ) as HTMLButtonElement;
    act(() => {
      quickBtn.click();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('quick');
  });

  it('選択中ボタン（同値）をクリックしても onChange は呼ばれない', () => {
    const onChange = vi.fn<(s: LearningStyle) => void>();
    act(() => {
      root.render(<LearningStyleToggle style="deep" onChange={onChange} />);
    });
    const deepBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Deep'),
    ) as HTMLButtonElement;
    act(() => {
      deepBtn.click();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('各ボタンに aria-label（ラベル＋説明）が設定される', () => {
    act(() => {
      root.render(<LearningStyleToggle style="quick" onChange={() => {}} />);
    });
    const btns = Array.from(container.querySelectorAll('button'));
    const labels = btns.map((b) => b.getAttribute('aria-label'));
    expect(labels.some((l) => l?.includes('Quick') && l.includes('優先順位のみ'))).toBe(true);
    expect(labels.some((l) => l?.includes('Deep') && l.includes('記述あり'))).toBe(true);
  });
});
