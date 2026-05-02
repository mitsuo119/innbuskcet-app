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

  it('role="group" と aria-label="学習スタイル" を持ち、3つのボタン（Quick/Deep/Exam）を描画する', () => {
    act(() => {
      root.render(<LearningStyleToggle style="deep" onChange={() => {}} />);
    });
    const group = container.querySelector('[role="group"]');
    expect(group).not.toBeNull();
    expect(group!.getAttribute('aria-label')).toBe('学習スタイル');
    const btns = container.querySelectorAll('button');
    expect(btns.length).toBe(3);
    const labels = Array.from(btns).map((b) => b.textContent);
    expect(labels.some((t) => t?.includes('Quick'))).toBe(true);
    expect(labels.some((t) => t?.includes('Deep'))).toBe(true);
    expect(labels.some((t) => t?.includes('Exam'))).toBe(true);
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
    expect(labels.some((l) => l?.includes('Exam') && l.includes('20問90分'))).toBe(true);
  });

  it('Exam 未選択時、クリックで onChange("exam") が呼ばれる（グレイアウト解除確認）', () => {
    const onChange = vi.fn<(s: LearningStyle) => void>();
    act(() => {
      root.render(<LearningStyleToggle style="deep" onChange={onChange} />);
    });
    const examBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Exam'),
    ) as HTMLButtonElement;
    expect(examBtn).toBeDefined();
    expect(examBtn.disabled).toBe(false);
    act(() => {
      examBtn.click();
    });
    expect(onChange).toHaveBeenCalledWith('exam');
  });

  describe('ツールチップ（PBI-036b / TASK-010）', () => {
    function renderToggle(style: LearningStyle = 'deep') {
      act(() => {
        root.render(<LearningStyleToggle style={style} onChange={() => {}} />);
      });
    }

    function findBtn(label: string): HTMLButtonElement {
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes(label),
      ) as HTMLButtonElement | undefined;
      expect(btn).toBeDefined();
      return btn as HTMLButtonElement;
    }

    it('Quick ボタンに非空の title 属性が設定されている', () => {
      renderToggle();
      const btn = findBtn('Quick');
      const title = btn.getAttribute('title');
      expect(title).not.toBeNull();
      expect((title ?? '').length).toBeGreaterThan(0);
      expect(title).toContain('速習');
    });

    it('Deep ボタンに非空の title 属性が設定されている', () => {
      renderToggle();
      const btn = findBtn('Deep');
      const title = btn.getAttribute('title');
      expect(title).not.toBeNull();
      expect((title ?? '').length).toBeGreaterThan(0);
      expect(title).toContain('じっくり');
    });

    it('Exam ボタンに非空の title 属性が設定されている', () => {
      renderToggle();
      const btn = findBtn('Exam');
      const title = btn.getAttribute('title');
      expect(title).not.toBeNull();
      expect((title ?? '').length).toBeGreaterThan(0);
      expect(title).toContain('20問90分');
    });

    it('各ボタンに aria-describedby が設定され、参照先 hidden span のテキストが title と一致する', () => {
      renderToggle();
      for (const label of ['Quick', 'Deep', 'Exam']) {
        const btn = findBtn(label);
        const id = btn.getAttribute('aria-describedby');
        expect(id).not.toBeNull();
        const tip = container.querySelector(`#${id}`);
        expect(tip).not.toBeNull();
        expect(tip!.textContent).toBe(btn.getAttribute('title'));
      }
    });
  });
});
