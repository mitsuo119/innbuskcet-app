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

export function About() {
  return (
    <div className="container">
      <header className="legal-header">
        <a href="/" className="legal-back-btn" aria-label="ホームに戻る">
          ← ホームに戻る
        </a>
        <GlobalNav current="about" />
        <h1 className="legal-title">運営者情報（このサイトについて）</h1>
        <p className="legal-updated">最終更新日: 2026年10月8日</p>
      </header>

      <main className="legal-body">
        <section className="legal-section">
          <p>
            InBusket（インバスケット学習アプリ・以下「本サービス」）の運営方針と背景を、
            読者・利用者・広告審査担当者に向けて公開する運営者情報ページです。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">1. サイトの目的</h2>
          <p>
            本サービスは、管理職昇進試験などで出題されるインバスケット演習を、
            案件処理・優先順位付け・委任判断・意思決定フレームワーク・模擬試験まで
            ブラウザ上で体系的に無料学習できるようにすることを目的としています。
          </p>
          <p>
            紙ベース・有料研修中心になりがちなインバスケット学習を、いつでもどこでも繰り返し
            訓練できる環境にすることで、学習機会の格差解消を目指します。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">2. 想定読者</h2>
          <ul className="legal-list">
            <li>管理職昇進試験を控える社会人（中堅・係長・課長候補）</li>
            <li>インバスケット試験を初めて受験する方</li>
            <li>優先順位判断・委任・意思決定スキルを体系的に学びたい方</li>
            <li>研修講師・人事・教育担当として教材設計を検討する方</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">3. コンテンツ作成方針</h2>
          <p>
            本サービスの解説リファレンス（全12章）・パターン別解説（20パターン）・
            代表ケース（20件）・採点フィードバックは、すべて運営者による自前再構成の
            日本語オリジナルテキストです。市販の対策書やインバスケット研修教材から
            文章を転載することはありません。
          </p>
          <p>
            参考情報は <code>ref/chapter01..12</code> として GitHub リポジトリに
            素材ノートを公開し、本サイト本文はそれをもとに学習用に再編集して提供しています。
          </p>
          <p>
            更新は段階的に行い、内容の追加・修正履歴は GitHub のコミット履歴で透明化しています。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">4. 運営者表記</h2>
          <p>
            本サービスは、AI スクラム開発プロジェクト「ai-scrum-inbuscket」のスクラムチームが
            運営しています。プロジェクトの体制・スプリント運用・成果物は GitHub 公開リポジトリで
            透明に管理しており、開発の意思決定記録（ADR）・スプリントレビュー記録・
            セキュリティ監査記録なども同リポジトリで参照できます。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">5. 連絡手段</h2>
          <p>
            本サービスへのご意見・誤りの指摘・改善提案は、
            <a href="/contact" className="legal-link">
              お問い合わせページ
            </a>
            から GitHub Issues 経由でご連絡ください。原則として GitHub Issues 上で
            公開対応を行い、対応経緯を記録します。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">6. 更新ポリシー</h2>
          <ul className="legal-list">
            <li>
              本文・解説・採点ロジックは、スプリント単位（おおむね 1 週間サイクル）で継続的に
              改善・追記します。
            </li>
            <li>
              重大な誤りが判明した場合は、当該スプリント内で修正し、修正内容を GitHub のコミット
              履歴・スプリントレビュー記録に記載します。
            </li>
            <li>
              本ページ末尾の「最終更新日」は、運営者情報自体の改定日として更新します
              （本文の軽微なリライトでは更新しません）。
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">7. 関連ページ</h2>
          <ul className="legal-list">
            <li>
              <a href="/privacy-policy" className="legal-link">
                プライバシーポリシー
              </a>
              ：個人情報・Cookie・広告配信の取り扱い
            </li>
            <li>
              <a href="/terms" className="legal-link">
                サービス利用規約
              </a>
              ：利用条件・免責・知的財産・禁止事項・準拠法・改定方針
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
