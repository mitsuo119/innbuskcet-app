import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PrivacyPolicy } from '../PrivacyPolicy';
import { TermsOfService } from '../TermsOfService';
import { Contact } from '../Contact';

describe('PBI-051 法務ページスモークテスト', () => {
  it('PrivacyPolicy がタイトルと主要テキストを表示する', () => {
    const html = renderToStaticMarkup(<PrivacyPolicy onBack={vi.fn()} />);

    expect(html).toContain('プライバシーポリシー');
    expect(html).toContain('Google AdSense');
    expect(html).toContain('Cookieの使用');
  });

  it('TermsOfService がタイトルと主要テキストを表示する', () => {
    const html = renderToStaticMarkup(<TermsOfService onBack={vi.fn()} />);

    expect(html).toContain('利用規約');
    expect(html).toContain('第3条（禁止事項）');
    expect(html).toContain('第6条（免責事項）');
  });

  it('Contact がタイトルと主要テキストを表示する', () => {
    const html = renderToStaticMarkup(<Contact onBack={vi.fn()} />);

    expect(html).toContain('お問い合わせ');
    expect(html).toContain('お問い合わせ方法');
    expect(html).toContain('GitHub Issues でお問い合わせ');
  });
});
