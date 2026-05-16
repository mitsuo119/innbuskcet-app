// PBI-086 / TASK-086-4 (Sprint024 DAY3) → PBI-087 / TASK-087-1+3+7 (Sprint025 DAY1〜4)
// SSG/Pre-render — ADR-002（C2: 自前静的 HTML 生成スクリプト）採用案の実装。
//
// 目的:
// - AdSense クローラ（Mediapartners-Google）が `view-source:` した際に、
//   h1 と本文段落・主要メタを「JS 実行前に」取得できる状態にすること。
// - 既存 SPA 挙動（React マウント後にクライアントルーティングへ移行）を完全に維持すること。
// - 既存 AdSense ローダー Vite プラグイン（vite.config.ts）／`scripts/transform-seo-tokens.mjs`／
//   `public/404.html`（PBI-076 SPA フォールバック）と衝突しないこと。
//
// 対象ルート（Sprint025 PBI-087 第1〜4段階 / 計 55 ルート）:
//   第1段階（高優先 6）: /, /about, /terms, /reference/chapter01〜03
//   第2段階（章 9）   : /reference/chapter04〜12
//   第3段階（cases 20）: /cases/case-XXX × 20（代表ケース）
//   第4段階（patterns 20）: /patterns/1〜20（全パターン詳細・DAY4 TASK-087-7）
//
// 動作:
//   - `dist/index.html` をテンプレートとして読み込み、ルートごとに以下を差し替えて出力する。
//       * <title>                                   → ルート別 title
//       * <meta name="description">                 → ルート別 description
//       * <link rel="canonical">                    → siteUrl + path
//       * <meta property="og:title|og:description|og:url">
//       * <meta name="twitter:title|twitter:description">
//       * <div id="root"></div>                     → 静的フォールバック本文（h1 + 段落）を内側に挿入
//         （React マウント時に置換される。view-source: では本文テキストとして可視。）
//   - 出力先: ルート path をディレクトリとし `index.html` を生成（`/` のみ dist 直下に in-place）。
//
// 注意（後続スプリントへの引き継ぎ）:
//   - 第3〜4段階で `routes.ts.PUBLIC_ROUTES` から動的ルートを列挙する設計に拡張する予定。
//   - DOM レンダリング（React コンポーネント評価）は行わず、ルートごとに静的に既知のテキストを
//     書き込む方式。重量級依存（Puppeteer / Playwright）を回避（ADR-002 / E3〜E6 / R-A）。
//
// 依存追加: なし（Node 標準のみ）。

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONT_DIR = resolve(__dirname, '..');
const DIST_DIR = resolve(FRONT_DIR, 'dist');
const TEMPLATE = resolve(DIST_DIR, 'index.html');

const APP_NAME = 'インバスケット - 学習アプリ';

/**
 * `transform-seo-tokens.mjs` と同等のロジックで siteUrl を解決する
 * （末尾 `/` を保証）。本番ビルドでは GitHub Actions が `VITE_SITE_URL` を注入する。
 */
export function resolveSiteUrl() {
  const raw = (process.env.VITE_SITE_URL ?? '').trim();
  if (raw) return raw.endsWith('/') ? raw : `${raw}/`;
  const base = process.env.VITE_BASE_URL ?? '/';
  const withLeading = base.startsWith('/') ? base : `/${base}`;
  const withTrailing = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  return `http://localhost:5173${withTrailing}`;
}

/** path（先頭 `/`）を絶対 URL に変換する。`/` はサイトルートのまま。 */
export function toAbsoluteUrl(siteUrl, path) {
  if (path === '/') return siteUrl;
  return `${siteUrl}${path.replace(/^\/+/, '')}`;
}

/**
 * 解説リファレンス章メタ。`src/data/referenceData.ts` の title/description と意味的に一致。
 * Sprint025 PBI-087 第1段階(chapter01〜03) + 第2段階(chapter04〜12)で全12章を対象化。
 *
 * relatedPath/relatedLabel は view-source: に出すクローラ向け主要内部リンク（パンくず相当）。
 */
const CHAPTERS = [
  {
    id: 'chapter01',
    title: 'インバスケットとは何か',
    summary:
      'インバスケット試験は架空の管理職に着任した初日に未処理案件を制限時間内で処理するシミュレーションです。評価対象は「承認したか」よりも、なぜそう判断し誰にどう指示したかというマネージャーとしての行動パターンです。',
    intro:
      '本章では試験の正体と、エンジニアが求められる思考シフト（プレイヤー思考からマネージャー思考へ）を整理します。論理的思考力や問題分析力そのものは武器になりますが、使いどころを「自分が解く」から「組織で処理する」に切り替えることが合格の鍵です。',
    relatedPath: '/patterns/1',
    relatedLabel: '顧客クレーム（パターン1）',
  },
  {
    id: 'chapter02',
    title: '採点基準を逆算する',
    summary:
      'インバスケット試験では「全案件を完璧に処理したか」よりも、6つの評価ディメンション（判断力・統率力・問題分析力・計画組織力・対人関係力・主体性）でマネージャー行動の幅と質を測ります。',
    intro:
      '本章では各評価ディメンションの観点と、高得点行動／低評価行動の見分け方を整理します。採点基準を理解することで、案件ごとに「どのディメンションでアピールするか」を意図的に設計できるようになります。',
    relatedPath: '/patterns/2',
    relatedLabel: '部下のミス報告（パターン2）',
  },
  {
    id: 'chapter03',
    title: 'マネージャー思考への切替',
    summary:
      'プレイヤーとして優秀な人ほど「自分でやれば早い」と考えがちですが、管理職に求められるのは組織で成果を出す思考です。1案件あたりの所要時間が短くなり、より多くの案件を処理できるようになります。',
    intro:
      '本章では「自分で解く」モードから「組織で処理する」モードへの切替パターンを、判断・指示・委任・フォローの4つの観点から整理します。マネージャー思考の体現は採点6軸すべての底上げに繋がります。',
    relatedPath: '/reference/chapter02',
    relatedLabel: '採点基準を逆算する（chapter02）',
  },
  {
    id: 'chapter04',
    title: '時間配分とタイムマネジメント',
    summary:
      'インバスケット試験は時間との戦いです。20件前後の案件を 60〜90 分で処理する場合、1案件あたりの平均処理時間は 3〜5 分にすぎません。配分設計を持たずに着手すると後半で時間切れになります。',
    intro:
      '本章では序盤の俯瞰時間・案件区分別の配分・終了直前の見直しの 3 段階で時間を設計する方法を整理します。「時間切れで白紙」を防ぐ最大の防御策は、開始直後の俯瞰で全体量を把握することです。',
    relatedPath: '/reference/chapter05',
    relatedLabel: '優先順位づけの技術（chapter05）',
  },
  {
    id: 'chapter05',
    title: '優先順位づけの技術',
    summary:
      'インバスケット試験で安定して得点するには、緊急度×重要度マトリクスで案件を素早く分類し、配点効率の高い案件から処理する技術が不可欠です。判断の遅さはそのまま得点機会の喪失に直結します。',
    intro:
      '本章では緊急度・重要度の判定基準と、A／B／C ランク付けの実践フォーマットを整理します。マトリクスでの分類は「迷わず手を動かし続ける」ための骨格となり、終盤の時間切れを構造的に防ぎます。',
    relatedPath: '/patterns/3',
    relatedLabel: '緊急トラブル対応（パターン3）',
  },
  {
    id: 'chapter06',
    title: '意思決定フレームワーク',
    summary:
      '案件ごとの意思決定を場当たり的に行うと判断の質と速度がぶれます。フレームワーク化することで、限られた情報の中でも一貫した根拠で判断を下せるようになります。',
    intro:
      '本章では「事実確認 → 影響範囲評価 → 選択肢列挙 → 判断基準適用 → 指示・委任」の 5 ステップで意思決定を組み立てる手順を整理します。判断の根拠を 1 文で添える型は採点 6 軸の判断力／問題分析力を同時に押し上げます。',
    relatedPath: '/reference/chapter07',
    relatedLabel: '委任と組織活用の技術（chapter07）',
  },
  {
    id: 'chapter07',
    title: '委任と組織活用の技術',
    summary:
      '管理職が自分だけで案件を抱え込むと処理量がボトルネックになります。誰に・いつまでに・どう報告させるかという委任の型を持つことで、組織として案件を捌けるようになります。',
    intro:
      '本章では委任先の選定基準（スキル・余力・成長機会）と、委任時に必須の指示要素（目的・期限・成果物・報告タイミング）を整理します。「組織で処理する」発想は採点 6 軸の統率力・計画組織力を直接押し上げます。',
    relatedPath: '/patterns/4',
    relatedLabel: '部下への業務委任（パターン4）',
  },
  {
    id: 'chapter08',
    title: '案件パターン別攻略',
    summary:
      'インバスケット試験で頻出する案件は 20 パターン前後に分類できます。パターンごとに「優先度の目安」「処理の骨格」「典型的な失敗」を押さえておくことで本番の即応性が大幅に高まります。',
    intro:
      '本章では頻出 20 パターンを分類し、各パターンの回答骨格（誰に・何を・いつまでに）を素早く引き出すための索引を提供します。パターン認識ができるとマトリクス分類の速度も同時に上がります。',
    relatedPath: '/patterns',
    relatedLabel: 'パターン別解説（全20パターン）',
  },
  {
    id: 'chapter09',
    title: '答案の書き方と文章技術',
    summary:
      '同じ判断でも、答案の書き方が曖昧だと評価されません。「誰に・いつまでに・どう報告」を必ず書く型を徹底することで、判断の質を採点者に正しく伝えられます。',
    intro:
      '本章では合格答案の必須要素（判断・指示・根拠）と、短時間で書き切るための文章テンプレートを整理します。1 案件あたり 30〜60 秒で要点を書き切る型が身につくと、後半の時間切れリスクが大幅に減ります。',
    relatedPath: '/reference/chapter04',
    relatedLabel: '時間配分とタイムマネジメント（chapter04）',
  },
  {
    id: 'chapter10',
    title: '模擬試験の進め方',
    summary:
      '本番に近い条件で模擬試験を回すことで、時間配分・判断速度・答案の書き方の弱点が定量的に見えるようになります。模試なしの本番突入は最大のリスクです。',
    intro:
      '本章では模試の準備（時間設定・道具・環境）・実施（時間内完走の徹底）・振り返り（採点ログ化と弱点の特定）の 3 段階を整理します。模試 → 採点 → 改善のサイクルが学習効率を最大化します。',
    relatedPath: '/reference/chapter11',
    relatedLabel: '弱点分析と継続改善（chapter11）',
  },
  {
    id: 'chapter11',
    title: '弱点分析と継続改善',
    summary:
      '模擬試験の点数だけを見て一喜一憂しても改善には繋がりません。評価 6 軸ごとに弱点を可視化し、次回までに試す行動を 1〜2 点に絞ることで継続的に精度が上がります。',
    intro:
      '本章では「記録 → 採点 → 原因分析 → 対策」の改善サイクルを定型化し、答案ログ・弱点リスト・改善カードの 3 成果物として残す運用を整理します。改善幅を欲張らない設計が定着の鍵です。',
    relatedPath: '/reference/chapter10',
    relatedLabel: '模擬試験の進め方（chapter10）',
  },
  {
    id: 'chapter12',
    title: '本番当日の戦略',
    summary:
      '本番当日のパフォーマンスは前日からの準備で 8 割決まります。持ち物・睡眠・到着時刻・直前の心構えまで設計しておくことで、当日の動揺要素を最小化できます。',
    intro:
      '本章では本番前日と当日朝の準備・試験開始 5 分間の動き・終了直前の見直しまで、得点を最大化するための行動計画を整理します。新しい解法を試さず練習通りに振る舞うことが当日最重要のルールです。',
    relatedPath: '/reference/chapter10',
    relatedLabel: '模擬試験の進め方（chapter10）',
  },
];

/**
 * 章ルートをプリレンダリング ROUTES 形式に変換するヘルパー。
 * description は `Router.tsx#resolveRouteSeo`（reference-chapter 分岐）と意味的に一致させる。
 */
function buildChapterRoute(meta) {
  const fullTitle = `解説リファレンス：${meta.title} | ${APP_NAME}`;
  const description = `インバスケット学習の「${meta.title}」を中心に、要点とフレームワークを章別に確認できる解説リファレンスページです。`;
  return {
    path: `/reference/${meta.id}`,
    outRelative: `reference/${meta.id}/index.html`,
    title: fullTitle,
    description,
    bodyHtml: `
      <div data-prerender="reference-${meta.id}" hidden aria-hidden="true">
        <h1>解説リファレンス：${meta.title}</h1>
        <p>${meta.summary}</p>
        <p>${meta.intro}</p>
        <p>関連リンク：<a href="${meta.relatedPath}">${meta.relatedLabel}</a></p>
      </div>
    `.trim(),
  };
}

/**
 * 代表ケース 20 件のメタ（Sprint025 PBI-087 第3段階 / TASK-087-5）。
 *
 * `src/routes.ts.CASE_DETAIL_META` および `src/routes.ts.PUBLIC_ROUTES` の `/cases/:id`
 * 並び順と一致させる（ID昇順）。title/description は `Router.tsx#resolveRouteSeo`
 * （`case-detail` 分岐）と意味的に一致させ、view-source: 取得時の SEO 退行ゼロを担保する。
 */
const CASES = [
  { id: 'case-001', patternId: 1, patternName: '顧客クレーム', difficulty: '上級' },
  { id: 'case-002', patternId: 12, patternName: '会議・セミナーへの参加依頼', difficulty: '初級' },
  { id: 'case-004', patternId: 8, patternName: 'ハラスメント報告', difficulty: '上級' },
  { id: 'case-010', patternId: 4, patternName: '部下の退職・異動の相談', difficulty: '上級' },
  { id: 'case-012', patternId: 17, patternName: '上位方針の伝達・対応', difficulty: '中級' },
  {
    id: 'case-013',
    patternId: 14,
    patternName: '情報セキュリティインシデント',
    difficulty: '上級',
  },
  {
    id: 'case-015',
    patternId: 5,
    patternName: '部下間の対立・人間関係トラブル',
    difficulty: '中級',
  },
  { id: 'case-016', patternId: 11, patternName: '業務改善提案', difficulty: '中級' },
  { id: 'case-017', patternId: 3, patternName: '新規取引・営業案件', difficulty: '中級' },
  { id: 'case-018', patternId: 13, patternName: '事故・災害報告', difficulty: '中級' },
  { id: 'case-019', patternId: 7, patternName: '部下の有給・休暇申請', difficulty: '初級' },
  { id: 'case-021', patternId: 19, patternName: '前任者の未完了案件', difficulty: '上級' },
  { id: 'case-029', patternId: 9, patternName: 'プロジェクト遅延・品質問題', difficulty: '上級' },
  {
    id: 'case-031',
    patternId: 20,
    patternName: '複合案件（複数パターンの組み合わせ）',
    difficulty: '上級',
  },
  { id: 'case-035', patternId: 10, patternName: '予算承認・経費申請', difficulty: '初級' },
  { id: 'case-037', patternId: 18, patternName: '他部署からの依頼・調整', difficulty: '初級' },
  {
    id: 'case-039',
    patternId: 15,
    patternName: 'コンプライアンス違反（不正行為）',
    difficulty: '中級',
  },
  { id: 'case-042', patternId: 6, patternName: '部下のパフォーマンス問題', difficulty: '中級' },
  { id: 'case-048', patternId: 16, patternName: '組織変更・人員配置', difficulty: '中級' },
  {
    id: 'case-053',
    patternId: 2,
    patternName: '取引先からの要求（値引き・仕様変更等）',
    difficulty: '初級',
  },
];

/**
 * 代表ケース 1 件をプリレンダリング ROUTES 形式に変換するヘルパー。
 * title/description は `Router.tsx#resolveRouteSeo`（`case-detail` 分岐）と意味的に一致。
 */
function buildCaseRoute(meta) {
  const num = meta.id.replace('case-', '');
  const fullTitle = `ケース${num}：パターン${meta.patternId}「${meta.patternName}」（${meta.difficulty}） | ${APP_NAME}`;
  const description = `インバスケット代表ケース${num}（パターン${meta.patternId}「${meta.patternName}」・難易度${meta.difficulty}）の本文と解説、模範回答の骨格を確認できる単独URLページです。`;
  const summary = `本ページは代表ケース${num}を題材に、インバスケット試験で頻出する「${meta.patternName}」（パターン${meta.patternId}・難易度${meta.difficulty}）の判断・指示・委任のポイントを、単独URLで体系的に学べるよう構成しています。`;
  const intro = `想定読者は管理職昇進試験などで「${meta.patternName}」型の案件処理を訓練したい社会人です。本ケースを通じて、緊急度×重要度の判定、関係者への指示、報告タイミングの設計など、採点6軸（判断力・統率力・問題分析力・計画組織力・対人関係力・主体性）に直結する行動を学べます。`;
  return {
    path: `/cases/${meta.id}`,
    outRelative: `cases/${meta.id}/index.html`,
    title: fullTitle,
    description,
    bodyHtml: `
      <div data-prerender="case-${meta.id}" hidden aria-hidden="true">
        <h1>ケース${num}：パターン${meta.patternId}「${meta.patternName}」（${meta.difficulty}）</h1>
        <p>${summary}</p>
        <p>${intro}</p>
        <p>関連リンク：<a href="/patterns/${meta.patternId}">パターン${meta.patternId}「${meta.patternName}」</a></p>
      </div>
    `.trim(),
  };
}

/**
 * 全 20 パターンのメタ（Sprint025 PBI-087 第4段階 / TASK-087-7）。
 *
 * `src/data/patternData.ts` の `PATTERN_DATA[*].id / name` と意味的に一致させる
 * （ID昇順）。`Router.tsx#resolveRouteSeo`（`pattern-detail` 分岐）の
 * title/description テンプレートに合わせて view-source: 取得時の SEO 退行ゼロを担保する。
 */
const PATTERNS = [
  { id: 1, name: '顧客クレーム' },
  { id: 2, name: '取引先からの要求（値引き・仕様変更等）' },
  { id: 3, name: '新規取引・営業案件' },
  { id: 4, name: '部下の退職・異動の相談' },
  { id: 5, name: '部下間の対立・人間関係トラブル' },
  { id: 6, name: '部下のパフォーマンス問題' },
  { id: 7, name: '部下の有給・休暇申請' },
  { id: 8, name: 'ハラスメント報告' },
  { id: 9, name: 'プロジェクト遅延・品質問題' },
  { id: 10, name: '予算承認・経費申請' },
  { id: 11, name: '業務改善提案' },
  { id: 12, name: '会議・セミナーへの参加依頼' },
  { id: 13, name: '事故・災害報告' },
  { id: 14, name: '情報セキュリティインシデント' },
  { id: 15, name: 'コンプライアンス違反（不正行為）' },
  { id: 16, name: '組織変更・人員配置' },
  { id: 17, name: '上位方針の伝達・対応' },
  { id: 18, name: '他部署からの依頼・調整' },
  { id: 19, name: '前任者の未完了案件' },
  { id: 20, name: '複合案件（複数パターンの組み合わせ）' },
];

/**
 * パターン詳細 1 件をプリレンダリング ROUTES 形式に変換するヘルパー。
 * title/description は `Router.tsx#resolveRouteSeo`（`pattern-detail` 分岐）と意味的に一致。
 */
function buildPatternRoute(meta) {
  const fullTitle = `パターン${meta.id}：${meta.name} | ${APP_NAME}`;
  const description = `インバスケット案件パターン${meta.id}「${meta.name}」の特徴・優先度の目安・回答の骨格を確認できる詳細ページです。`;
  const summary = `本ページではインバスケット試験で頻出する案件パターン${meta.id}「${meta.name}」の特徴と優先度判定の観点、回答骨格（誰に・何を・いつまでに）を体系的に確認できます。`;
  const intro = `想定読者は管理職昇進試験などで「${meta.name}」型の案件処理を訓練したい社会人です。本パターンを通じて、緊急度×重要度の判定、関係者への指示、報告タイミングの設計など、採点6軸（判断力・統率力・問題分析力・計画組織力・対人関係力・主体性）に直結する行動を学べます。`;
  return {
    path: `/patterns/${meta.id}`,
    outRelative: `patterns/${meta.id}/index.html`,
    title: fullTitle,
    description,
    bodyHtml: `
      <div data-prerender="pattern-${meta.id}" hidden aria-hidden="true">
        <h1>パターン${meta.id}：${meta.name}</h1>
        <p>${summary}</p>
        <p>${intro}</p>
        <p>関連リンク：<a href="/patterns">パターン別解説（全20パターン）</a></p>
      </div>
    `.trim(),
  };
}

/**
 * 第1〜4段階対象ルート（57 件）。
 * - トップ：`/`（既存 PoC から踏襲）
 * - 運営者情報／サービス利用規約：`/about`, `/terms`（PBI-088/089 と意味的に一致）
 * - 法務系：`/privacy-policy`, `/contact`（Sprint025 DAY5 補完で 57+ 受入基準クローズ）
 * - 解説リファレンス：`/reference/chapter01〜12`（CHAPTERS から導出）
 * - 代表ケース：`/cases/case-XXX` × 20（CASES から導出 / Sprint025 PBI-087 第3段階）
 * - パターン詳細：`/patterns/1〜20`（PATTERNS から導出 / Sprint025 PBI-087 第4段階）
 */
export const ROUTES = [
  {
    path: '/',
    outRelative: 'index.html',
    title: APP_NAME,
    description:
      '管理職昇進試験のインバスケット演習を、案件処理・優先順位付け・委任判断などのフレームワークから模擬試験までブラウザで体系的に学べる無料の日本語学習Webアプリです。',
    bodyHtml: `
      <div data-prerender="home" hidden aria-hidden="true">
        <h1>インバスケット</h1>
        <p>InBusket（インバスケット学習アプリ）は、管理職昇進試験などで出題されるインバスケット演習を、案件処理・優先順位付け・委任判断・意思決定フレームワーク・模擬試験まで、ブラウザ上で体系的に無料で学べる日本語の学習Webサービスです。</p>
        <p>想定読者は管理職昇進試験を控える社会人や、優先順位判断・委任・意思決定スキルを体系的に学びたい方です。コンテンツは全12章の解説リファレンス、全20パターンのケース別解説、代表ケース20件の単独URL演習、Quick（速習）／Deep（記述）／Exam（模試）の3つの学習モードで構成されます。</p>
        <p>詳細は <a href="/about">運営者情報</a> ／ <a href="/terms">サービス利用規約</a> をご覧ください。</p>
      </div>
    `.trim(),
  },
  {
    path: '/about',
    outRelative: 'about/index.html',
    title: `運営者情報 | ${APP_NAME}`,
    description:
      'インバスケット学習アプリ InBusket の運営者・サイト目的・コンテンツ作成方針・連絡手段・更新ポリシーをまとめた運営者情報ページです。',
    bodyHtml: `
      <div data-prerender="about" hidden aria-hidden="true">
        <h1>運営者情報（このサイトについて）</h1>
        <p>InBusket（インバスケット学習アプリ）は、管理職昇進試験などで出題されるインバスケット演習を、案件処理・優先順位付け・委任判断・意思決定フレームワーク・模擬試験までブラウザ上で体系的に無料学習できるようにすることを目的とした学習Webサービスです。</p>
        <p>本ページでは運営目的・想定読者・コンテンツ作成方針・連絡手段・更新ポリシーを公開しています。紙ベース・有料研修中心になりがちなインバスケット学習を、いつでもどこでも繰り返し訓練できる環境にすることで学習機会の格差解消を目指します。</p>
        <p>関連リンク：<a href="/terms">サービス利用規約</a> ／ <a href="/privacy-policy">プライバシーポリシー</a></p>
      </div>
    `.trim(),
  },
  {
    path: '/terms',
    outRelative: 'terms/index.html',
    title: `サービス利用規約 | ${APP_NAME}`,
    description:
      'インバスケット学習アプリ InBusket の利用条件・免責・著作権・禁止事項・準拠法・改定方針を簡潔にまとめたサービス利用規約の要旨ページです。',
    bodyHtml: `
      <div data-prerender="terms" hidden aria-hidden="true">
        <h1>サービス利用規約</h1>
        <p>本規約は、InBusket（インバスケット学習アプリ）の利用条件を簡潔にまとめたものです。利用者は本サービスを利用することで、本規約に同意したものとみなします。詳細条項は利用規約（条文版）を参照してください。</p>
        <p>本サービスはどなたでも無料でご利用いただけます。本規約および <a href="/privacy-policy">プライバシーポリシー</a> に同意できない場合は、本サービスのご利用をお控えください。</p>
        <p>関連リンク：<a href="/terms-of-service">利用規約（条文版）</a> ／ <a href="/about">運営者情報</a></p>
      </div>
    `.trim(),
  },
  {
    // Sprint025 DAY5 / PBI-087 第4段階補完: 57+ 受入基準クローズのため追加
    path: '/privacy-policy',
    outRelative: 'privacy-policy/index.html',
    title: `プライバシーポリシー | ${APP_NAME}`,
    description:
      'インバスケット学習アプリ InBusket の個人情報の取り扱い方針（収集情報・利用目的・第三者提供・問い合わせ窓口）をまとめたプライバシーポリシーです。',
    bodyHtml: `
      <div data-prerender="privacy-policy" hidden aria-hidden="true">
        <h1>プライバシーポリシー</h1>
        <p>本ポリシーは、InBusket（インバスケット学習アプリ）における個人情報の取り扱い方針を定めたものです。本サービスは学習進捗・回答履歴をブラウザ内（localStorage / sessionStorage）に限定して保存し、サーバーへ送信しません。</p>
        <p>利用目的・収集情報・第三者提供・Cookie/広告（AdSense）・問い合わせ窓口・改定方針を明示し、利用者の不安を可視化のもとで解消することを目指します。</p>
        <p>関連リンク：<a href="/terms">サービス利用規約</a> ／ <a href="/about">運営者情報</a> ／ <a href="/contact">お問い合わせ</a></p>
      </div>
    `.trim(),
  },
  {
    // Sprint025 DAY5 / PBI-087 第4段階補完: 57+ 受入基準クローズのため追加
    path: '/contact',
    outRelative: 'contact/index.html',
    title: `お問い合わせ | ${APP_NAME}`,
    description:
      'インバスケット学習アプリ InBusket へのお問い合わせ方法・連絡先・対応範囲・回答目安をまとめた連絡窓口ページです。',
    bodyHtml: `
      <div data-prerender="contact" hidden aria-hidden="true">
        <h1>お問い合わせ</h1>
        <p>本ページは、InBusket（インバスケット学習アプリ）に関するお問い合わせ方法を案内する連絡窓口ページです。学習内容・採点ロジック・不具合・改善要望などのご連絡を受け付けます。</p>
        <p>対応範囲（運営者によるベストエフォート対応）・回答目安・連絡手段を公開し、利用者と運営の双方向コミュニケーションを担保します。</p>
        <p>関連リンク：<a href="/about">運営者情報</a> ／ <a href="/privacy-policy">プライバシーポリシー</a> ／ <a href="/terms">サービス利用規約</a></p>
      </div>
    `.trim(),
  },
  ...CHAPTERS.map(buildChapterRoute),
  ...CASES.map(buildCaseRoute),
  ...PATTERNS.map(buildPatternRoute),
];

/** title 要素の中身を差し替える（テンプレート 1 件のみ存在前提）。 */
function replaceTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

/** name 属性 meta の content を差し替える（存在しない場合は no-op）。 */
function replaceMetaByName(html, name, content) {
  const re = new RegExp(`(<meta\\s+name="${escapeRegExp(name)}"\\s+content=)"[^"]*"`, 'i');
  return html.replace(re, `$1"${escapeAttr(content)}"`);
}

/** property 属性 meta の content を差し替える（OGP 用）。 */
function replaceMetaByProperty(html, property, content) {
  const re = new RegExp(`(<meta\\s+property="${escapeRegExp(property)}"\\s+content=)"[^"]*"`, 'i');
  return html.replace(re, `$1"${escapeAttr(content)}"`);
}

/** canonical の href を差し替える。 */
function replaceCanonical(html, absoluteUrl) {
  return html.replace(
    /(<link\s+rel="canonical"\s+href=)"[^"]*"/i,
    `$1"${escapeAttr(absoluteUrl)}"`,
  );
}

/**
 * `<div id="root"></div>`（または既存の中身入り `<div id="root">...</div>`）の内側に
 * 静的フォールバック本文を挿入する。React マウント時に内容は置換される。
 * 既に prerender 済（`data-prerender` 属性）の場合は二重挿入を避けて差し替える。
 */
function injectIntoRoot(html, bodyHtml) {
  const re = /<div id="root">[\s\S]*?<\/div>/i;
  return html.replace(re, `<div id="root">${bodyHtml}</div>`);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureTemplateExists() {
  try {
    await access(TEMPLATE, constants.R_OK);
  } catch {
    throw new Error(
      `[prerender] dist/index.html が存在しません。先に \`vite build\` を実行してください: ${TEMPLATE}`,
    );
  }
}

/**
 * テンプレート HTML をルート別メタ＋本文で書き換える純関数。
 * ファイル I/O を伴わず副作用がないため vitest で検証可能（TASK-086-5）。
 */
export function transformTemplateForRoute(template, siteUrl, route) {
  const absoluteUrl = toAbsoluteUrl(siteUrl, route.path);
  let html = template;
  html = replaceTitle(html, route.title);
  html = replaceMetaByName(html, 'description', route.description);
  html = replaceCanonical(html, absoluteUrl);
  html = replaceMetaByProperty(html, 'og:title', route.title);
  html = replaceMetaByProperty(html, 'og:description', route.description);
  html = replaceMetaByProperty(html, 'og:url', absoluteUrl);
  html = replaceMetaByName(html, 'twitter:title', route.title);
  html = replaceMetaByName(html, 'twitter:description', route.description);
  html = injectIntoRoot(html, route.bodyHtml);
  return html;
}

async function generateRoute(template, siteUrl, route) {
  const html = transformTemplateForRoute(template, siteUrl, route);
  const outPath = resolve(DIST_DIR, route.outRelative);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, 'utf-8');
  console.log(`[prerender] wrote ${route.path} -> ${outPath}`);
}

async function main() {
  await ensureTemplateExists();
  const siteUrl = resolveSiteUrl();
  const template = await readFile(TEMPLATE, 'utf-8');
  for (const route of ROUTES) {
    await generateRoute(template, siteUrl, route);
  }
  console.log(`[prerender] done (siteUrl=${siteUrl}, routes=${ROUTES.length})`);
}

// CLI として直接実行された場合のみ main() を呼ぶ（vitest からの import 時は副作用なし）。
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
