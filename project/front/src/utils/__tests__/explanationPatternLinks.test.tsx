import { describe, expect, it } from 'vitest';
import { isValidElement } from 'react';
import { renderExplanationWithPatternLinks } from '../explanationPatternLinks';

describe('renderExplanationWithPatternLinks', () => {
  it('パターン1が含まれる場合、パターン1リンクが生成されること', () => {
    const nodes = renderExplanationWithPatternLinks('判断はパターン1を参照。');
    const anchor = nodes.find((node) => isValidElement(node) && node.props.href === '/patterns/1');

    expect(anchor).toBeDefined();
    expect(isValidElement(anchor) ? anchor.props.children : '').toBe('パターン1');
  });

  it('パターン番号が存在しない場合、テキストのまま返ること', () => {
    const nodes = renderExplanationWithPatternLinks('これはパターン99に近いケースです。');

    expect(nodes).toEqual(['これは', 'パターン99', 'に近いケースです。']);
  });

  it('複数のパターン参照がある場合、複数リンクが生成されること', () => {
    const nodes = renderExplanationWithPatternLinks('パターン2とパターン10を比較する。');
    const links = nodes.filter((node) => isValidElement(node));

    expect(links).toHaveLength(2);
    expect(isValidElement(links[0]) ? links[0].props.href : '').toBe('/patterns/2');
    expect(isValidElement(links[1]) ? links[1].props.href : '').toBe('/patterns/10');
  });
});
