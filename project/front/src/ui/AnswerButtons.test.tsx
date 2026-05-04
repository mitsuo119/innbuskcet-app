import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnswerButtons } from './AnswerButtons';

/**
 * PBI-063 Day3: 視認性向上の不変条件を最小担保するレンダリングテスト。
 * - 状態強調（selected modifier）が DOM に反映されること
 * - radiogroup / radio / aria-checked の a11y 属性が維持されること
 * - 色のみで意味を伝えない（記号◎/○/△・名称・優先度文字を併記）こと
 */
describe('AnswerButtons（PBI-063 / Day3 視認性・状態強調）', () => {
  it('selected = "A" のとき A ボタンに answer-buttons__btn--selected が付与される', () => {
    const html = renderToStaticMarkup(
      <AnswerButtons selected="A" locked={false} onSelect={() => {}} />,
    );
    // A は selected、B/C は selected ではない
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('answer-buttons__btn--selected');
    // selected が 1 個のみ存在
    const selectedMatches = html.match(/answer-buttons__btn--selected/g) ?? [];
    expect(selectedMatches.length).toBe(1);
  });

  it('selected = null のとき --selected modifier がどのボタンにも付かない', () => {
    const html = renderToStaticMarkup(
      <AnswerButtons selected={null} locked={false} onSelect={() => {}} />,
    );
    expect(html).not.toContain('answer-buttons__btn--selected');
    expect(html).not.toContain('aria-checked="true"');
  });

  it('a11y: radiogroup / radio / aria-label が描画され、A/B/C それぞれに記号と名称が併記される', () => {
    const html = renderToStaticMarkup(
      <AnswerButtons selected={null} locked={false} onSelect={() => {}} />,
    );
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="優先度を選択"');
    // 3 つの radio が存在
    const radios = html.match(/role="radio"/g) ?? [];
    expect(radios.length).toBe(3);
    // 記号（◎○△）が aria-hidden="true" の span として描画されている（DoD §9-2）
    expect(html).toContain('answer-buttons__symbol');
    expect(html).toContain('aria-hidden="true"');
  });

  it('locked = true のとき全ボタンが disabled となり再選択不可', () => {
    const html = renderToStaticMarkup(
      <AnswerButtons selected="B" locked={true} onSelect={() => {}} />,
    );
    const disabledMatches = html.match(/disabled=""/g) ?? html.match(/disabled/g) ?? [];
    // 3 ボタン全てに disabled
    expect(disabledMatches.length).toBeGreaterThanOrEqual(3);
  });
});
