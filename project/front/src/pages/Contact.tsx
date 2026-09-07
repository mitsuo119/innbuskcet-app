/**
 * お問い合わせページ（PBI-051 / TASK-103）
 * - SP対応（375px以上）
 * - dangerouslySetInnerHTML 不使用（XSS対策）
 * - PBI-077 / TASK-077-3: 戻る導線を `<a href="/">` 化（onClick 単独遷移 0 件・修飾キーで新規タブ可）
 */

import { GlobalNav } from '../ui/GlobalNav';
import { InformationSections } from '../ui/InformationSections';
import information from '../data/siteInformation.json';

export function Contact() {
  const content = information.contact;
  return (
    <div className="container">
      <header className="legal-header">
        <a href="/" className="legal-back-btn" aria-label="ホームに戻る">
          ← ホームに戻る
        </a>
        <GlobalNav current="contact" />
        <h1 className="legal-title">{content.title}</h1>
        <p className="legal-updated">
          最終更新日: <time dateTime={content.updated}>{content.updated}</time>
        </p>
      </header>

      <main className="legal-body">
        <section className="legal-section">
          <p>{content.introduction}</p>
        </section>
        <InformationSections sections={content.sections} />
      </main>
    </div>
  );
}
