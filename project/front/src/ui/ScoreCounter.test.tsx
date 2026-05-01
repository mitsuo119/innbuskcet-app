import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScoreCounter } from './ScoreCounter';
import { initialModeScores } from '../domain/score';

describe('ScoreCounter（PBI-013 / PBI-021）', () => {
  it('modeScores 未指定時は score の値を表示（後方互換）', () => {
    const html = renderToStaticMarkup(<ScoreCounter score={{ total: 5, correct: 3 }} />);
    expect(html).toContain('正答 / 出題');
    expect(html).toContain('>3<');
    expect(html).toContain('>5<');
    // 拡張UI（モードラベル/正答率）は出さない
    expect(html).not.toContain('score-counter__mode');
    expect(html).not.toContain('score-counter__rate');
    // aria-live="polite" を維持
    expect(html).toContain('aria-live="polite"');
  });

  it('A モード指定時は modeScores.A の値と「A問題」ラベル・正答率を表示', () => {
    const modeScores = {
      ...initialModeScores,
      all: { total: 4, correct: 2 },
      A: { total: 2, correct: 1 },
    };
    const html = renderToStaticMarkup(
      <ScoreCounter score={{ total: 0, correct: 0 }} modeScores={modeScores} currentMode="A" />,
    );
    expect(html).toContain('A問題');
    expect(html).toContain('>1<'); // 正答
    expect(html).toContain('>2<'); // 出題
    expect(html).toContain('(50%)');
    expect(html).toContain('aria-live="polite"');
  });

  it('全件モード指定時は「全件」ラベルと all の集計・正答率を表示', () => {
    const modeScores = {
      ...initialModeScores,
      all: { total: 4, correct: 3 },
    };
    const html = renderToStaticMarkup(
      <ScoreCounter score={{ total: 0, correct: 0 }} modeScores={modeScores} currentMode="all" />,
    );
    expect(html).toContain('全件');
    expect(html).toContain('>3<');
    expect(html).toContain('>4<');
    expect(html).toContain('(75%)');
  });

  it('0 件モードでは正答率を「-」で表示し NaN を出さない', () => {
    const html = renderToStaticMarkup(
      <ScoreCounter
        score={{ total: 0, correct: 0 }}
        modeScores={initialModeScores}
        currentMode="C"
      />,
    );
    expect(html).toContain('C問題');
    expect(html).toContain('(-)');
    expect(html).not.toContain('NaN');
  });

  it('aria-label にモード・正答数・出題数・正答率が含まれる（SR 通知）', () => {
    const modeScores = { ...initialModeScores, B: { total: 3, correct: 2 } };
    const html = renderToStaticMarkup(
      <ScoreCounter score={{ total: 0, correct: 0 }} modeScores={modeScores} currentMode="B" />,
    );
    // aria-label の値を抜き出して検証
    const m = html.match(/aria-label="([^"]+)"/);
    expect(m).not.toBeNull();
    const label = m![1];
    expect(label).toContain('B問題');
    expect(label).toContain('正答 2');
    expect(label).toContain('出題 3');
    expect(label).toContain('67%');
  });
});
