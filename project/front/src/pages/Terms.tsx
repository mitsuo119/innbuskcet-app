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
 */

import { GlobalNav } from '../ui/GlobalNav';

export function Terms() {
  return (
    <div className="container">
      <header className="legal-header">
        <a href="/" className="legal-back-btn" aria-label="ホームに戻る">
          ← ホームに戻る
        </a>
        <GlobalNav current="terms" />
        <h1 className="legal-title">サービス利用規約</h1>
        <p className="legal-updated">最終更新日: 2026年10月8日</p>
      </header>

      <main className="legal-body">
        <section className="legal-section">
          <p>
            本規約は、InBusket（インバスケット学習アプリ・以下「本サービス」）の利用条件を
            簡潔にまとめたものです。利用者は本サービスを利用することで、本規約に同意したもの
            とみなします。詳細条項は
            <a href="/terms-of-service" className="legal-link">
              利用規約（条文版）
            </a>
            を参照してください。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">1. 利用条件</h2>
          <ul className="legal-list">
            <li>本サービスはどなたでも無料でご利用いただけます。</li>
            <li>13 歳未満の方は、保護者の同意のうえご利用ください。</li>
            <li>
              ブラウザの JavaScript が無効な場合、一部機能（採点・進捗保存等）が利用できません。
            </li>
            <li>
              本規約および
              <a href="/privacy-policy" className="legal-link">
                プライバシーポリシー
              </a>
              に同意できない場合は、本サービスのご利用をお控えください。
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">2. 免責</h2>
          <ul className="legal-list">
            <li>
              本サービスの利用により生じた損害（直接・間接を問わず）について、運営者は責任を負いません。
            </li>
            <li>
              本サービスの中断・停止・変更・廃止について、運営者は事前通知の義務を負いません。
            </li>
            <li>掲載情報の正確性・完全性・有用性について、運営者は保証を行いません。</li>
            <li>外部リンク先のウェブサイトのコンテンツについて、運営者は責任を負いません。</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">3. 著作権・知的財産（ref テキストの取り扱い）</h2>
          <p>
            本サービスに掲載されているコンテンツ（テキスト・デザイン・ソースコード等）の著作権・
            知的財産権は、本サービス運営者または正当な権利者に帰属します。
          </p>
          <p>
            参考素材ノート <code>ref/chapter01..12</code> は GitHub リポジトリに公開していますが、
            本サイト本文は同素材を学習用に再構成した自前テキストであり、市販の対策書・研修教材
            からの転載は含みません。
          </p>
          <p>
            ソースコードについては、GitHub リポジトリに掲載のライセンス（LICENSE）に従うものと
            します。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">4. 禁止事項</h2>
          <ul className="legal-list">
            <li>本サービスのコンテンツの無断複製・転載・二次利用（個人の私的学習目的を除く）</li>
            <li>本サービスへの不正アクセス、システムへの干渉、過度なクロール・スクレイピング</li>
            <li>本サービスを通じた虚偽情報の流布や他者への迷惑行為</li>
            <li>商業目的での利用（事前に書面での許可がない場合）</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">5. 準拠法・管轄裁判所</h2>
          <p>
            本規約は日本法に準拠するものとし、本サービスに関する紛争については、運営者所在地を
            管轄する裁判所を専属的合意管轄とします。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">6. 改定</h2>
          <ul className="legal-list">
            <li>
              運営者は必要に応じて本規約を改定することがあります。改定後の規約は本ページに掲載した
              時点で効力を生じ、利用者の継続利用をもって同意とみなします。
            </li>
            <li>
              重大な改定を行う場合は、本サービス上での告知または GitHub リポジトリのリリースノート
              により周知します。
            </li>
            <li>本ページ末尾の「最終更新日」を改定日として更新します。</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">7. 関連ページ</h2>
          <ul className="legal-list">
            <li>
              <a href="/about" className="legal-link">
                運営者情報
              </a>
              ：サイト目的・運営者表記・更新ポリシー
            </li>
            <li>
              <a href="/privacy-policy" className="legal-link">
                プライバシーポリシー
              </a>
              ：個人情報・Cookie・広告配信の取り扱い
            </li>
            <li>
              <a href="/contact" className="legal-link">
                お問い合わせ
              </a>
              ：GitHub Issues 経由のご連絡方法
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
