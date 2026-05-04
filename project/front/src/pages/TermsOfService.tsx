/**
 * 利用規約ページ（PBI-051 / TASK-102）
 * - SP対応（375px以上）
 * - dangerouslySetInnerHTML 不使用（XSS対策）
 */

import { GlobalNav } from '../ui/GlobalNav';

interface Props {
  onBack: () => void;
}

export function TermsOfService({ onBack }: Props) {
  return (
    <div className="container">
      <header className="legal-header">
        <button type="button" className="legal-back-btn" onClick={onBack} aria-label="ホームに戻る">
          ← ホームに戻る
        </button>
        <GlobalNav current="terms-of-service" />
        <h1 className="legal-title">利用規約</h1>
        <p className="legal-updated">最終更新日: 2026年7月15日</p>
      </header>

      <main className="legal-body">
        <section className="legal-section">
          <p>
            本利用規約（以下「本規約」）は、InBusket（以下「本サービス」）の利用条件を定めるものです。
            ユーザーは本サービスを利用することで、本規約に同意したものとみなします。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">第1条（サービスの目的）</h2>
          <p>
            本サービスは、インバスケット思考のトレーニングを目的としたウェブアプリケーションです。
            ユーザーが優先度判断・管理職思考を学ぶことを支援します。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">第2条（利用資格）</h2>
          <p>本サービスはどなたでも無料でご利用いただけます。</p>
          <p>ただし、以下に該当するユーザーによる利用を禁止します。</p>
          <ul className="legal-list">
            <li>13歳未満の方（保護者の同意がない場合）</li>
            <li>過去に本規約違反により利用を禁止された方</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">第3条（禁止事項）</h2>
          <p>ユーザーは本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
          <ul className="legal-list">
            <li>本サービスのコンテンツの無断複製・転載・二次利用</li>
            <li>本サービスへの不正アクセスやシステムへの干渉</li>
            <li>本サービスを通じた虚偽情報の流布や他者への迷惑行為</li>
            <li>商業目的での利用（事前に書面での許可がない場合）</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">第4条（知的財産権）</h2>
          <p>
            本サービスに掲載されているコンテンツ（テキスト・デザイン・ソースコードなど）に関する著作権・知的財産権は、
            本サービス運営者または正当な権利者に帰属します。
          </p>
          <p>
            ただし、ソースコードについては、GitHubリポジトリに掲載のライセンスに従うものとします。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">第5条（広告の表示）</h2>
          <p>
            本サービスでは、Google AdSenseを通じた広告を表示しています。
            広告に関する詳細はプライバシーポリシーをご参照ください。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">第6条（免責事項）</h2>
          <p>本サービスは以下について一切の責任を負いません。</p>
          <ul className="legal-list">
            <li>本サービス利用により生じた損害（直接・間接を問わず）</li>
            <li>本サービスの中断・停止・変更・廃止</li>
            <li>本サービスに掲載された情報の正確性・完全性・有用性</li>
            <li>外部リンク先のウェブサイトのコンテンツ</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">第7条（サービスの変更・停止）</h2>
          <p>
            運営者は、ユーザーへの事前通知なくサービスの内容変更・停止・廃止を行う場合があります。
            これによりユーザーに生じた損害について、運営者は責任を負いません。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">第8条（規約の変更）</h2>
          <p>
            運営者は必要に応じて本規約を変更することがあります。
            変更後の規約は本ページに掲載した時点で効力を生じ、継続利用をもって同意とみなします。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">第9条（準拠法・管轄裁判所）</h2>
          <p>
            本規約は日本法に準拠するものとし、本サービスに関する紛争については、
            運営者所在地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </section>
      </main>
    </div>
  );
}
