import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CaseDetail } from '../CaseDetail';
import { PatternDetail } from '../PatternDetail';
import contentNotice from '../../data/learningContentNotice.json';
import { findCaseDeepDive } from '../../data/deepDive';
import { CASE_DETAIL_META } from '../../routes';
import { ROUTES } from '../../../scripts/prerender.mjs';

describe('詳細解説の前提と参照資料', () => {
  for (const meta of CASE_DETAIL_META) {
    it(`${meta.id} の画面と静的HTMLで、学習例の前提と公的資料を共有する`, () => {
      const output = [
        renderToStaticMarkup(<CaseDetail caseId={meta.id} />),
        ROUTES.find((route: { path: string }) => route.path === `/cases/${meta.id}`)!.bodyHtml,
      ];
      for (const html of output) {
        const document = new DOMParser().parseFromString(html, 'text/html');
        expect(document.body.textContent).toContain(contentNotice.text);
        expect(document.body.textContent).toContain('教材の分類例');
        for (const source of findCaseDeepDive(meta.id)?.sources ?? []) {
          expect(document.querySelector(`a[href="${source.href}"]`)).not.toBeNull();
        }
      }
    });
  }

  it('全20パターンは採点者の基準を装わず、自己点検として表示する', () => {
    for (let patternId = 1; patternId <= 20; patternId += 1) {
      const output = [
        renderToStaticMarkup(<PatternDetail patternId={patternId} />),
        ROUTES.find((route: { path: string }) => route.path === `/patterns/${patternId}`)!.bodyHtml,
      ];
      for (const html of output) {
        expect(html).toContain(contentNotice.text);
        expect(html).toContain('答案を振り返る観点');
        expect(html).not.toContain('評価者はどこを見ているか');
      }
    }
  });
});
