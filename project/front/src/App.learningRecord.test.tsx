import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import App from './App';
import { saveLearningStyle } from './domain/learningStyle';
import { LEARNING_RECORD_STORAGE_KEY, loadLearningRecord } from './domain/learningRecord';
import { CASE_PATTERN_MAP } from './domain/patternWeakness';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const buttonByText = (text: string) =>
  Array.from(document.querySelectorAll('button')).find((b) => b.textContent === text);

describe('学習記録の保存と出題範囲（PBI-107 / PBI-109）', () => {
  let container: HTMLDivElement;
  let root: Root;

  const mount = () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<App />));
  };
  const unmount = () => {
    act(() => root.unmount());
    container.remove();
  };

  beforeEach(() => {
    localStorage.clear();
    saveLearningStyle('quick');
    mount();
  });

  afterEach(() => {
    unmount();
    localStorage.clear();
  });

  it('回答は再読み込み後も残り、確認後に消去できる', () => {
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(loadLearningRecord().answers).toHaveLength(1);

    unmount();
    mount();
    expect(container.textContent).toContain('回答 1 件');

    act(() => buttonByText('学習記録を消去')!.click());
    act(() => buttonByText('消去する')!.click());
    expect(localStorage.getItem(LEARNING_RECORD_STORAGE_KEY)).toBeNull();
    expect(container.textContent).toContain('回答 0 件');
  });

  it('正答（A/B/C）では絞り込まず、パターンで出題範囲を選べる', () => {
    expect(container.textContent).not.toContain('A問題のみ');
    const select = container.querySelector<HTMLSelectElement>('.practice-filter__select')!;
    act(() => {
      select.value = '3';
      Simulate.change(select);
    });
    const count = Object.values(CASE_PATTERN_MAP).filter((id) => id === 3).length;
    expect(container.textContent).toContain(`対象：${count}問`);
  });
});
