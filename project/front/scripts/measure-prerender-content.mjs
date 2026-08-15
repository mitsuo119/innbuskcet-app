/**
 * Sprint026 PBI-098 / TASK-098-5
 * 52 詳細ページ（reference 12章 + cases 20件 + patterns 20件）の
 * `dist/<path>/index.html` から `data-prerender` ラッパ div の可視テキスト文字数を計測し、
 * Markdown レポートを標準出力する。
 *
 * 出力先: `project/docs/prerender_content_length_report.md` （リダイレクトで保存）。
 * 依存: なし（Node 標準のみ）。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, '..', 'dist');

function visibleTextLen(routeRel) {
  const html = readFileSync(resolve(DIST_DIR, routeRel, 'index.html'), 'utf-8');
  // `<div data-prerender="...">...</div></div>` の内側（外側 div は #root）。
  const m = html.match(/<div\s+data-prerender="[^"]+"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
  const inner = m ? m[1] : '';
  return inner.replace(/<[^>]+>/g, '').replace(/\s+/g, '').length;
}

const CHAPTERS = Array.from({ length: 12 }, (_, i) => `chapter${String(i + 1).padStart(2, '0')}`);
const CASES = [
  'case-001',
  'case-002',
  'case-004',
  'case-010',
  'case-012',
  'case-013',
  'case-015',
  'case-016',
  'case-017',
  'case-018',
  'case-019',
  'case-021',
  'case-029',
  'case-031',
  'case-035',
  'case-037',
  'case-039',
  'case-042',
  'case-048',
  'case-053',
];
const PATTERN_IDS = Array.from({ length: 20 }, (_, i) => i + 1);

const rows = [];
for (const id of CHAPTERS)
  rows.push({
    kind: 'reference',
    path: `/reference/${id}`,
    rel: `reference/${id}`,
    len: visibleTextLen(`reference/${id}`),
  });
for (const id of CASES)
  rows.push({
    kind: 'case',
    path: `/cases/${id}`,
    rel: `cases/${id}`,
    len: visibleTextLen(`cases/${id}`),
  });
for (const id of PATTERN_IDS)
  rows.push({
    kind: 'pattern',
    path: `/patterns/${id}`,
    rel: `patterns/${id}`,
    len: visibleTextLen(`patterns/${id}`),
  });

const min = Math.min(...rows.map((r) => r.len));
const max = Math.max(...rows.map((r) => r.len));
const avg = Math.round(rows.reduce((s, r) => s + r.len, 0) / rows.length);
const below600 = rows.filter((r) => r.len < 600);

const now = new Date().toISOString().slice(0, 10);
const lines = [];
lines.push(`# プリレンダ本文文字数レポート（52ページ）`);
lines.push('');
lines.push(`- 計測日: ${now}`);
lines.push(
  `- 対象: dist/<path>/index.html の \`<div data-prerender="...">\` 可視テキスト（タグ・空白除外）`,
);
lines.push(`- 件数: ${rows.length} ページ（reference 12 + cases 20 + patterns 20）`);
lines.push(`- 最小: ${min} 字 / 最大: ${max} 字 / 平均: ${avg} 字`);
lines.push(
  `- 600 字未満: ${below600.length} 件${below600.length ? ` （${below600.map((r) => r.path).join(', ')}）` : ' （0件）'}`,
);
lines.push('');
lines.push('## 種別サマリ');
lines.push('');
lines.push('| 種別 | 件数 | 最小 | 最大 | 平均 |');
lines.push('| --- | ---: | ---: | ---: | ---: |');
for (const kind of ['reference', 'case', 'pattern']) {
  const sub = rows.filter((r) => r.kind === kind);
  const smin = Math.min(...sub.map((r) => r.len));
  const smax = Math.max(...sub.map((r) => r.len));
  const savg = Math.round(sub.reduce((s, r) => s + r.len, 0) / sub.length);
  lines.push(`| ${kind} | ${sub.length} | ${smin} | ${smax} | ${savg} |`);
}
lines.push('');
lines.push('## 全件明細');
lines.push('');
lines.push('| # | 種別 | ルート | 可視文字数 | 600+ |');
lines.push('| ---: | --- | --- | ---: | :---: |');
rows.forEach((r, i) => {
  lines.push(`| ${i + 1} | ${r.kind} | ${r.path} | ${r.len} | ${r.len >= 600 ? '✅' : '❌'} |`);
});

process.stdout.write(lines.join('\n') + '\n');
const outPath = resolve(
  __dirname,
  '..',
  '..',
  '..',
  'project',
  'docs',
  'prerender_content_length_report.md',
);
writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
process.stderr.write(`[measure] wrote ${outPath}\n`);
