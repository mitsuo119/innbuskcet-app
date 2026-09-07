import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import App from './App';
import { saveLearningStyle } from './domain/learningStyle';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('記述チェックの即時表示', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    saveLearningStyle('deep');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<App />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    localStorage.clear();
  });

  it('回答確定前でもボタンを押すと結果と限界が表示される', () => {
    const input = container.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="判断を入力"]',
    )!;
    act(() => {
      input.value = 'Aとして本日中に確認します。';
      Simulate.change(input);
    });
    const check = container.querySelector<HTMLButtonElement>(
      'button[aria-label="記述の語句・形式をチェックする"]',
    )!;
    expect(check).not.toBeNull();
    act(() => check.click());
    const feedback = container.querySelector('[aria-label="記述の自動チェック"]');
    expect(feedback).not.toBeNull();
    expect(feedback!.textContent).toContain('試験の得点は判定しません');
    expect(container.querySelectorAll('[aria-label="記述の自動チェック"]')).toHaveLength(1);
    expect(
      Array.from(container.querySelectorAll('button')).some(
        (button) => button.textContent === '回答する',
      ),
    ).toBe(true);
  });
});
