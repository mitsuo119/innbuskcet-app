// Sprint026 PBI-099 / TASK-099-2
// PatternList SPA 一覧側の本文拡充検証。
// - ページ冒頭の導入文（一覧の目的・使い方）が描画されること
// - 全20パターンに `characteristics`（1〜2文の説明文）が描画されること
// - dangerouslySetInnerHTML を使わない（XSS対策）
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { PatternList } from '../PatternList';
import { PATTERN_DATA } from '../../data/patternData';

const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'PatternList.tsx');
const source = readFileSync(sourcePath, 'utf-8');

describe('PBI-099 PatternList SPA 一覧本文拡充', () => {
  it('ページ冒頭に導入文（目的・使い方）が描画される', () => {
    const html = renderToStaticMarkup(<PatternList />);
    expect(html).toMatch(/案件20パターンの索引/);
    expect(html).toMatch(/使い方の目安/);
  });

  it('全20パターンの characteristics（1〜2文の説明文）が描画される', () => {
    const html = renderToStaticMarkup(<PatternList />);
    for (const p of PATTERN_DATA) {
      expect(html).toContain(p.characteristics);
    }
  });

  it('dangerouslySetInnerHTML を使わない', () => {
    expect(source).not.toMatch(/dangerouslySetInnerHTML\s*=/);
  });
});
