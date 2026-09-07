/**
 * 運営者情報ページ /about（PBI-088 / TASK-088-1）
 *
 * AdSense「有用性の低いコンテンツ」審査再申請に向けた E-E-A-T 最低ライン整備。
 * 必須記載 6 項目: サイト目的 / 想定読者 / コンテンツ作成方針 / 運営者表記 / 連絡手段 / 更新ポリシー。
 *
 * - dangerouslySetInnerHTML 不使用（DoD §10-2 / XSS 対策）
 * - PBI-051 PrivacyPolicy.tsx パターン流用（GlobalNav + legal-header/body 構造）
 * - 戻る導線は `<a href="/">` 化（PBI-077 / TASK-077-3 整合）
 */

import { GlobalNav } from '../ui/GlobalNav';
import { InformationSections } from '../ui/InformationSections';
import information from '../data/siteInformation.json';

export function About() {
  const content = information.about;
  return (
    <div className="container">
      <header className="legal-header">
        <a href="/" className="legal-back-btn" aria-label="ホームに戻る">
          ← ホームに戻る
        </a>
        <GlobalNav current="about" />
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
