import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AdSlot } from './AdSlot';

// React 18 act 環境フラグ（jsdom 環境向け）。
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * AdSlot（PBI-050 / TASK-202）のテスト。
 *
 * - 環境変数または props のいずれも未設定／片方欠落時は **何もレンダリングしない**（DoD §10-1）。
 * - props で client/slot を指定すると `ins.adsbygoogle` 要素が描画され、
 *   `data-ad-client` / `data-ad-slot` が props 値で設定される（XSS 経路を作らない）。
 * - `window.adsbygoogle.push({})` は同一マウント内で 1 回だけ呼ばれる。
 * - `dangerouslySetInnerHTML` を使用していないこと。
 */
describe('AdSlot（PBI-050 / TASK-202）', () => {
  let container: HTMLDivElement;
  let root: Root;
  let pushSpy: ReturnType<typeof vi.fn>;
  // import.meta.env を直接書換えて検証する（vitest 4 の動的アクセス対応）。
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
  const savedClient = env.VITE_ADSENSE_CLIENT_ID;
  const savedSlot = env.VITE_ADSENSE_SLOT_ID;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    // adsbygoogle のキューを毎回クリーンに初期化し push 呼び出しを観測する。
    pushSpy = vi.fn();
    (
      window as unknown as { adsbygoogle?: { push: (x: Record<string, unknown>) => void } }
    ).adsbygoogle = { push: pushSpy } as unknown as Array<Record<string, unknown>>;

    // 環境変数の影響を排除する。
    env.VITE_ADSENSE_CLIENT_ID = '';
    env.VITE_ADSENSE_SLOT_ID = '';
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    env.VITE_ADSENSE_CLIENT_ID = savedClient;
    env.VITE_ADSENSE_SLOT_ID = savedSlot;
    delete (window as unknown as { adsbygoogle?: unknown }).adsbygoogle;
  });

  it('clientId / slotId がいずれも未設定なら何もレンダリングしない（安全フォールバック）', () => {
    act(() => {
      root.render(<AdSlot />);
    });
    expect(container.querySelector('ins.adsbygoogle')).toBeNull();
    expect(container.children.length).toBe(0);
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it('clientId のみ指定で slotId が未設定なら何もレンダリングしない', () => {
    act(() => {
      root.render(<AdSlot clientId="ca-pub-1234567890123456" />);
    });
    expect(container.querySelector('ins.adsbygoogle')).toBeNull();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it('slotId のみ指定で clientId が未設定なら何もレンダリングしない', () => {
    act(() => {
      root.render(<AdSlot slotId="1234567890" />);
    });
    expect(container.querySelector('ins.adsbygoogle')).toBeNull();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it('props で client/slot を渡すと ins.adsbygoogle 要素が描画され data 属性が設定される', () => {
    act(() => {
      root.render(<AdSlot clientId="ca-pub-1234567890123456" slotId="1234567890" />);
    });
    const ins = container.querySelector('ins.adsbygoogle') as HTMLElement | null;
    expect(ins).not.toBeNull();
    expect(ins!.getAttribute('data-ad-client')).toBe('ca-pub-1234567890123456');
    expect(ins!.getAttribute('data-ad-slot')).toBe('1234567890');
    expect(ins!.getAttribute('data-ad-format')).toBe('auto');
    expect(ins!.getAttribute('data-full-width-responsive')).toBe('true');
    expect(ins!.getAttribute('aria-label')).toBe('広告');
    expect(ins!.getAttribute('role')).toBe('complementary');
    expect(pushSpy).toHaveBeenCalledTimes(1);
  });

  it('環境変数フォールバック：props・環境変数いずれも未設定なら null（再掲）', () => {
    // props 不指定かつ beforeEach で環境変数を空に初期化済み。
    act(() => {
      root.render(<AdSlot />);
    });
    expect(container.querySelector('ins.adsbygoogle')).toBeNull();
  });

  it('dangerouslySetInnerHTML を使用していない（XSS 対策 / DoD §10-2）', () => {
    act(() => {
      root.render(<AdSlot clientId="ca-pub-1234567890123456" slotId="1234567890" />);
    });
    // ins 要素は子ノードを持たない（純粋な属性のみ）。
    const ins = container.querySelector('ins.adsbygoogle') as HTMLElement;
    expect(ins.innerHTML).toBe('');
    expect(ins.childNodes.length).toBe(0);
  });

  it('window.adsbygoogle 未定義でも例外なく描画され、push に積まれる（公式パターン）', () => {
    delete (window as unknown as { adsbygoogle?: unknown }).adsbygoogle;
    expect(() => {
      act(() => {
        root.render(<AdSlot clientId="ca-pub-1234567890123456" slotId="1234567890" />);
      });
    }).not.toThrow();
    const queue = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;
    expect(Array.isArray(queue)).toBe(true);
    expect(queue!.length).toBe(1);
  });
});
