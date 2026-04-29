import { describe, expect, it } from 'vitest';
import { judge } from './judge';
import type { Priority } from './case';

describe('judge()', () => {
  it('回答と正解が一致したら correct', () => {
    expect(judge('A', 'A')).toBe('correct');
    expect(judge('B', 'B')).toBe('correct');
    expect(judge('C', 'C')).toBe('correct');
  });

  it('回答と正解が異なれば incorrect', () => {
    expect(judge('A', 'B')).toBe('incorrect');
    expect(judge('B', 'C')).toBe('incorrect');
    expect(judge('C', 'A')).toBe('incorrect');
  });

  it('全組み合わせで一致時のみ correct を返す', () => {
    const priorities: Priority[] = ['A', 'B', 'C'];
    for (const a of priorities) {
      for (const c of priorities) {
        expect(judge(a, c)).toBe(a === c ? 'correct' : 'incorrect');
      }
    }
  });
});
