/**
 * お問い合わせページ（PBI-051 / TASK-103）
 * - SP対応（375px以上）
 * - dangerouslySetInnerHTML 不使用（XSS対策）
 */

interface Props {
  onBack: () => void;
}

export function Contact({ onBack }: Props) {
  return (
    <div className="container">
      <header className="legal-header">
        <button type="button" className="legal-back-btn" onClick={onBack} aria-label="ホームに戻る">
          ← ホームに戻る
        </button>
        <h1 className="legal-title">お問い合わせ</h1>
      </header>

      <main className="legal-body">
        <section className="legal-section">
          <p>
            InBusketに関するご質問・ご意見・不具合報告・著作権に関するお問い合わせは、
            以下の方法よりご連絡ください。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">お問い合わせ方法</h2>
          <p>現在、お問い合わせはGitHubのIssueを通じて受け付けています。</p>
          <p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              GitHub Issues でお問い合わせ
            </a>
          </p>
          <p className="legal-note">
            ※
            GitHubアカウントが必要です。アカウントをお持ちでない場合は、下記の対応カテゴリをご確認の上、
            別途ご連絡方法をご案内いたします。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">対応カテゴリ</h2>
          <ul className="legal-list">
            <li>
              <strong>不具合報告</strong>: 動作しない機能や表示の崩れ、エラーの報告
            </li>
            <li>
              <strong>機能要望</strong>: 新機能・改善のご提案
            </li>
            <li>
              <strong>コンテンツに関する問い合わせ</strong>: 問題文・解説の誤りや改善提案
            </li>
            <li>
              <strong>著作権・権利関係</strong>: コンテンツの利用許可・著作権に関するご相談
            </li>
            <li>
              <strong>プライバシー・個人情報</strong>: プライバシーポリシーに関するご質問
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">回答について</h2>
          <p>
            お問い合わせの内容によっては、回答までにお時間をいただく場合があります。
            また、内容によってはご回答できない場合もございますのでご了承ください。
          </p>
          <p>広告に関するお問い合わせは、Google AdSenseのサポートページをご参照ください。</p>
        </section>
      </main>
    </div>
  );
}
