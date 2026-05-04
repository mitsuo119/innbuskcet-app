/**
 * プライバシーポリシーページ（PBI-051 / TASK-101）
 * - Google AdSense 審査要件に準拠（Cookie使用・広告表示の明示）
 * - SP対応（375px以上）
 * - dangerouslySetInnerHTML 不使用（XSS対策）
 * - 外部リンクは rel="noopener noreferrer" 付与
 */

import { GlobalNav } from '../ui/GlobalNav';

interface Props {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: Props) {
  return (
    <div className="container">
      <header className="legal-header">
        <button type="button" className="legal-back-btn" onClick={onBack} aria-label="ホームに戻る">
          ← ホームに戻る
        </button>
        <GlobalNav current="privacy-policy" />
        <h1 className="legal-title">プライバシーポリシー</h1>
        <p className="legal-updated">最終更新日: 2026年7月15日</p>
      </header>

      <main className="legal-body">
        <section className="legal-section">
          <p>
            InBusket（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の適切な保護に努めます。
            本プライバシーポリシーは、本サービスにおける情報収集・利用方針を説明するものです。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">1. 収集する情報</h2>
          <p>本サービスは、以下の情報を収集することがあります。</p>
          <ul className="legal-list">
            <li>
              <strong>利用状況データ</strong>:
              アクセス日時、閲覧ページ、使用ブラウザ・デバイスの種類などのログ情報
            </li>
            <li>
              <strong>Cookie情報</strong>:
              サービス改善および広告配信の目的でCookieを使用しています（詳細は「Cookieの使用」を参照）
            </li>
          </ul>
          <p>本サービスは、氏名・住所・電話番号などの個人を特定できる情報を直接収集しません。</p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">2. Cookieの使用</h2>
          <p>
            本サービスはCookie（クッキー）を使用しています。Cookieとは、ウェブサイトがお使いのブラウザに保存する小さなテキストファイルです。
          </p>
          <p>本サービスがCookieを使用する目的は以下のとおりです。</p>
          <ul className="legal-list">
            <li>学習進捗・設定（テーマ、学習モードなど）の保持</li>
            <li>サービスの利用状況の分析・改善</li>
            <li>広告の配信・最適化（Google AdSenseによる広告表示）</li>
          </ul>
          <p>
            ブラウザの設定によりCookieを無効にすることができますが、一部機能が正常に動作しなくなる場合があります。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">3. 広告について（Google AdSense）</h2>
          <p>
            本サービスでは、第三者配信事業者であるGoogleが提供するGoogle
            AdSenseを使用して広告を表示しています。
          </p>
          <p>Google AdSenseについて、以下の点をご確認ください。</p>
          <ul className="legal-list">
            <li>
              Google
              AdSenseはCookieを使用して、ユーザーの過去の本サービスや他サイトへのアクセス情報に基づいた広告を配信します
            </li>
            <li>
              DoubleClick
              CookieによりGoogleおよびそのパートナーが、本サービスおよびインターネット上の他のサイトへのユーザーのアクセス情報を使用して適切な広告を表示することがあります
            </li>
            <li>
              Googleによる広告配信に伴うCookieの使用は、
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                Googleの広告に関するポリシー
              </a>
              に従います
            </li>
          </ul>
          <p>
            広告のパーソナライズを無効にする場合は、
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Google 広告設定ページ
            </a>
            からオプトアウトできます。また、
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              aboutads.info
            </a>
            からも第三者配信事業者のCookieを無効化できます。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">4. アクセス解析ツール</h2>
          <p>
            本サービスでは、サービス改善のためにアクセス解析を行うことがあります。
            アクセス解析ツールはCookieを使用してデータを収集しますが、個人を特定する情報は含まれません。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">5. 情報の第三者提供</h2>
          <p>
            本サービスは、法令に基づく場合を除き、収集した情報を第三者に提供・販売・貸与することはありません。
            ただし、広告配信パートナー（Google
            AdSenseなど）が本ポリシーに記載の目的でデータを使用する場合を除きます。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">6. 情報の管理・セキュリティ</h2>
          <p>
            本サービスは、収集した情報の漏洩・紛失・改ざんを防ぐため、適切なセキュリティ対策を講じます。
            ただし、インターネット上での完全な安全性を保証するものではありません。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">7. お子様のプライバシー</h2>
          <p>
            本サービスは13歳未満のお子様から意図的に個人情報を収集しません。
            13歳未満のお子様が情報を提供したと判明した場合、速やかに削除します。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">8. プライバシーポリシーの変更</h2>
          <p>
            本プライバシーポリシーは、法令の改正やサービスの変更に伴い、予告なく変更する場合があります。
            変更後のポリシーは本ページに掲載した時点で効力を生じます。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">9. お問い合わせ</h2>
          <p>プライバシーポリシーに関するお問い合わせは、お問い合わせページよりご連絡ください。</p>
        </section>
      </main>
    </div>
  );
}
