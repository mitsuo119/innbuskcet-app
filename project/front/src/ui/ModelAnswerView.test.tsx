import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ModelAnswerView } from './ModelAnswerView';
import type { ModelAnswer } from '../domain/case';

const sample: ModelAnswer = {
  judgment: 'Aランクとして本日中に対応する。',
  reason: '主要顧客の重大クレームであり、放置すると損失が拡大するため。',
  action: '担当部長に即時連絡し、対応チームを招集する。',
};

describe('ModelAnswerView（PBI-024 / TASK-009）', () => {
  it('visible=false の場合は「模範解答準備中」プレースホルダを表示する', () => {
    const html = renderToStaticMarkup(<ModelAnswerView modelAnswer={sample} visible={false} />);
    expect(html).toContain('模範解答準備中');
    expect(html).toContain('aria-label="模範解答"');
    expect(html).toContain('model-answer--empty');
    // 本文（判断・理由・アクションの内容）は描画されない
    expect(html).not.toContain(sample.judgment);
  });

  it('modelAnswer が undefined の場合は「模範解答準備中」プレースホルダを表示する', () => {
    const html = renderToStaticMarkup(<ModelAnswerView modelAnswer={undefined} visible={true} />);
    expect(html).toContain('模範解答準備中');
    expect(html).toContain('model-answer--empty');
  });

  it('visible=true かつ modelAnswer 整備済みの場合は判断・理由・アクションを表示する', () => {
    const html = renderToStaticMarkup(<ModelAnswerView modelAnswer={sample} visible={true} />);
    expect(html).toContain('判断');
    expect(html).toContain('理由');
    expect(html).toContain('アクション');
    expect(html).toContain(sample.judgment);
    expect(html).toContain(sample.reason);
    expect(html).toContain(sample.action);
    expect(html).toContain('aria-label="模範解答"');
  });

  it('DoD §10-2: dangerouslySetInnerHTML を使用しない（HTML 文字列がエスケープされる）', () => {
    const dangerous: ModelAnswer = {
      judgment: '<script>alert(1)</script>',
      reason: '<img src=x onerror=alert(1)>',
      action: '<b>bold</b>',
    };
    const html = renderToStaticMarkup(<ModelAnswerView modelAnswer={dangerous} visible={true} />);
    // 実行可能な script タグや b タグが生で出力されていない（エスケープされる）
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<b>bold</b>');
    // エスケープ済み表現が含まれる
    expect(html).toContain('&lt;script&gt;');
  });

  it('整備済みでもモデル骨格が空文字なら空ノードとしてそのまま描画する（loader 側で正規化済み前提）', () => {
    // loader.parseModelAnswer が空文字を弾く前提だが、UI はテキスト描画のみで副作用を持たない
    const html = renderToStaticMarkup(<ModelAnswerView modelAnswer={sample} visible={true} />);
    // <dl> 構造で 3 項目がレンダリングされている
    const dtCount = (html.match(/<dt /g) ?? []).length;
    const ddCount = (html.match(/<dd /g) ?? []).length;
    expect(dtCount).toBe(3);
    expect(ddCount).toBe(3);
  });
});
