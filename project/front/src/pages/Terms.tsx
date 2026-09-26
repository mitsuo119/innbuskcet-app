/**
 * サービス利用規約ページ /terms（PBI-089 / TASK-089-1）
 *
 * AdSense「有用性の低いコンテンツ」審査再申請に向けた E-E-A-T 最低ライン整備。
 * 必須記載 6 項目: 利用条件 / 免責 / 著作権・知的財産 / 禁止事項 / 準拠法 / 改定。
 *
 * - 既存 `/terms-of-service`（PBI-051 / TermsOfService.tsx）よりも短い canonical URL を
 *   提供しつつ、要旨を簡潔にまとめた AdSense クローラ向けの規約ページ。
 *   両者は title/description が一意になるよう構造化（TermsOfService=「利用規約」、
 *   本ページ=「サービス利用規約」）。
 * - dangerouslySetInnerHTML 不使用（DoD §10-2 / XSS 対策）
 * - PBI-051 PrivacyPolicy.tsx パターン流用（GlobalNav + legal-header/body 構造）
 * - 戻る導線は `<a href="/">` 化（PBI-077 / TASK-077-3 整合）
 * - 本文は siteInformation.json（terms）を静的HTML（scripts/prerender.mjs）と共有する
 */

import { GlobalNav } from '../ui/GlobalNav';
import { InformationSections } from '../ui/InformationSections';
import information from '../data/siteInformation.json';

export function Terms() {
  const content = information.terms;
  return (
    <div className="container">
      <header className="legal-header">
        <a href="/" className="legal-back-btn" aria-label="ホームに戻る">
          ← ホームに戻る
        </a>
        <GlobalNav current="terms" />
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
