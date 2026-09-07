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
import { constants, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONT_DIR = resolve(__dirname, '..');
const DIST_DIR = resolve(FRONT_DIR, 'dist');
const TEMPLATE = resolve(DIST_DIR, 'index.html');
// Sprint026 PBI-098 第1段階: `ref/chapterXX-*.md` から章本文（600字+）を取り込み、
// プリレンダ本文として焼き込む（AdSense審査の「薄いプリレンダ」根治）。
const REF_DIR = resolve(FRONT_DIR, '..', '..', 'ref');
// Sprint026 PBI-098 第2段階 / TASK-098-3: `src/data/cases.json` から代表ケース20件の
// 本文・解説・模範回答を取り込み、プリレンダ本文として焼き込む。
const CASES_JSON = resolve(FRONT_DIR, 'src', 'data', 'cases.json');
// AdSense「有用性の低いコンテンツ」対応: ページ固有の深掘り解説（出題場面／優先度の論拠／
// よくある失敗／回答例文／評価者視点）を焼き込む。全ページ共通の定型文は使用しない。
const PATTERN_DEEP_DIVE_JSON = resolve(FRONT_DIR, 'src', 'data', 'patternDeepDive.json');
const CASE_DEEP_DIVE_JSON = resolve(FRONT_DIR, 'src', 'data', 'caseDeepDive.json');
const SCORING_GUIDE = JSON.parse(
  readFileSync(resolve(FRONT_DIR, 'src', 'data', 'scoringGuide.json'), 'utf-8'),
);
const CONTENT_NOTICE = JSON.parse(
  readFileSync(resolve(FRONT_DIR, 'src', 'data', 'learningContentNotice.json'), 'utf-8'),
);

const APP_NAME = 'インバスケット - 学習アプリ';

// =====================================================================
// Sprint026 PBI-098 第1段階 / TASK-098-1
// Markdown → HTML 変換（依存追加なし / Node 標準のみ / 同期 readFileSync で
// ROUTES 評価時に章本文を取り込み view-source: で 600 字以上可視出力する）
// =====================================================================

/** インライン記法（**bold** / `code`）と HTML エスケープを行う。 */
function mdInline(s) {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * 章Markdown を view-source: 向けの簡素な HTML に変換する。
 * 対応要素: ##/### 見出し / 段落 / `- ` 箇条書き / GFM 表 / **bold** / `inline`
 * 非対応・除外: フロントマター / `---` 区切り / コードブロック / admonition
 */
export function mdToHtml(md) {
  let s = md.replace(/^---[\s\S]*?---\s*\n/, ''); // frontmatter
  s = s.replace(/```[\s\S]*?```/g, ''); // code fences
  const lines = s.split(/\r?\n/);

  const out = [];
  let listBuf = [];
  let tableBuf = [];
  let paraBuf = [];

  const flushPara = () => {
    if (paraBuf.length) {
      const text = mdInline(paraBuf.join(' ').trim());
      if (text) out.push(`<p>${text}</p>`);
      paraBuf = [];
    }
  };
  const flushList = () => {
    if (listBuf.length) {
      out.push('<ul>' + listBuf.map((li) => `<li>${mdInline(li)}</li>`).join('') + '</ul>');
      listBuf = [];
    }
  };
  const flushTable = () => {
    if (tableBuf.length >= 2) {
      const cells = (row) =>
        row
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => c.trim());
      const head = cells(tableBuf[0]);
      const body = tableBuf.slice(2).map(cells);
      const thead =
        '<thead><tr>' + head.map((c) => `<th>${mdInline(c)}</th>`).join('') + '</tr></thead>';
      const tbody =
        '<tbody>' +
        body
          .map((r) => '<tr>' + r.map((c) => `<td>${mdInline(c)}</td>`).join('') + '</tr>')
          .join('') +
        '</tbody>';
      out.push(`<table>${thead}${tbody}</table>`);
    }
    tableBuf = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      flushPara();
      flushList();
      flushTable();
      out.push(`<h2>${mdInline(trimmed.slice(3).trim())}</h2>`);
    } else if (trimmed.startsWith('### ')) {
      flushPara();
      flushList();
      flushTable();
      out.push(`<h3>${mdInline(trimmed.slice(4).trim())}</h3>`);
    } else if (/^- /.test(trimmed)) {
      flushPara();
      flushTable();
      listBuf.push(trimmed.slice(2).trim());
    } else if (/^\|.*\|$/.test(trimmed)) {
      flushPara();
      flushList();
      tableBuf.push(trimmed);
    } else if (trimmed === '' || /^-{3,}$/.test(trimmed) || trimmed.startsWith(':::')) {
      flushPara();
      flushList();
      flushTable();
    } else {
      flushList();
      flushTable();
      paraBuf.push(trimmed);
    }
  }
  flushPara();
  flushList();
  flushTable();
  return out.join('\n');
}

/** 章ID → `ref/` 内の Markdown ファイル名解決（chapterXX- プレフィクス一致）。 */
function resolveChapterMdPath(id) {
  const files = readdirSync(REF_DIR);
  const name = files.find((f) => f.startsWith(`${id}-`) && f.endsWith('.md'));
  if (!name) {
    throw new Error(`[prerender] ${id} に対応する Markdown が ref/ 配下に見つかりません`);
  }
  return resolve(REF_DIR, name);
}

/** 章ID → プリレンダ本文 HTML（同期読み込み）。テスト時も import 時に確定する。 */
function loadChapterBodyHtml(id) {
  if (id === SCORING_GUIDE.id) return referenceChapterHtml(SCORING_GUIDE);
  const md = readFileSync(resolveChapterMdPath(id), 'utf-8');
  return mdToHtml(md);
}

function referenceChapterHtml(chapter) {
  const listHtml = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  const blockHtml = (block) => {
    switch (block.kind) {
      case 'paragraph':
        return `<p>${escapeHtml(block.text)}</p>`;
      case 'bullet-list':
        return listHtml(block.items.map(escapeHtml));
      case 'note':
        return `<h3>${escapeHtml(block.title)}</h3><p>${escapeHtml(block.text)}</p>`;
      case 'table':
        return `<table><thead><tr>${block.headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'link-list':
        return listHtml(
          block.items.map(
            (item) =>
              `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>${item.description ? `：${escapeHtml(item.description)}` : ''}`,
          ),
        );
      default:
        throw new Error(`未対応の本文ブロック: ${block.kind}`);
    }
  };
  return `<h2>この章で学ぶこと</h2>${listHtml(chapter.learningGoals.map(escapeHtml))}${chapter.sections.map((section) => `<h2>${escapeHtml(section.title)}</h2>${section.blocks.map(blockHtml).join('')}`).join('')}`;
}

/**
 * Sprint026 PBI-098 第2段階 / TASK-098-3
 * `src/data/cases.json` を同期読み込みし `id → caseEntry` の Map を返す。
 * 本文・解説・模範回答を buildCaseRoute から焼き込むためのデータソース。
 */
function loadCasesById() {
  const raw = readFileSync(CASES_JSON, 'utf-8');
  /** @type {Array<Record<string, unknown>>} */
  const arr = JSON.parse(raw);
  /** @type {Map<string, Record<string, unknown>>} */
  const map = new Map();
  for (const c of arr) {
    if (typeof c?.id === 'string') map.set(c.id, c);
  }
  return map;
}

const CASES_BY_ID = loadCasesById();

/** パターン／ケースの深掘り解説（ページ固有本文）。定義源は React 側と共通の JSON。 */
const PATTERN_DEEP_DIVE = JSON.parse(readFileSync(PATTERN_DEEP_DIVE_JSON, 'utf-8'));
const CASE_DEEP_DIVE = JSON.parse(readFileSync(CASE_DEEP_DIVE_JSON, 'utf-8'));
const HOME_GUIDE = JSON.parse(
  readFileSync(resolve(FRONT_DIR, 'src', 'data', 'homeStudyGuide.json'), 'utf-8'),
);
const SITE_INFORMATION = JSON.parse(
  readFileSync(resolve(FRONT_DIR, 'src', 'data', 'siteInformation.json'), 'utf-8'),
);

function informationBodyHtml(content) {
  return `
    <h1>${escapeHtml(content.title)}</h1>
    <p>最終更新日: <time datetime="${escapeHtml(content.updated)}">${escapeHtml(content.updated)}</time></p>
    <p>${escapeHtml(content.introduction)}</p>
    ${content.sections
      .map(
        (section) => `
      <h2>${escapeHtml(section.heading)}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      ${section.points.length ? `<ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}
      ${section.links.length ? `<ul>${section.links.map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>` : ''}
    `,
      )
      .join('')}
  `;
}

function homeStudyGuideHtml() {
  const linksHtml = (links) =>
    `<ul>${links.map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>`;
  return `
    <h2 id="home-about-heading">${escapeHtml(HOME_GUIDE.title)}</h2>
    <p>更新日: <time datetime="${HOME_GUIDE.updated}">${HOME_GUIDE.updated}</time></p>
    <p>${escapeHtml(HOME_GUIDE.introduction)}</p>
    ${HOME_GUIDE.sections
      .map(
        (section) => `
      <h3>${escapeHtml(section.heading)}</h3>
      ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      ${section.points.length ? `<ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}
      ${section.links.length ? linksHtml(section.links) : ''}
    `,
      )
      .join('')}
    <p>${escapeHtml(HOME_GUIDE.siteSummary)}</p>
    ${linksHtml(HOME_GUIDE.siteLinks)}
  `;
}

/** 深掘り解説ブロックを `<h2>` + 本文の HTML に整形する（値が無い項目は出力しない）。 */
function deepDiveSectionsHtml(sections) {
  return sections
    .filter(([, value]) => (Array.isArray(value) ? value.length > 0 : Boolean(value)))
    .map(([heading, value]) =>
      Array.isArray(value)
        ? `<h2>${escapeHtml(heading)}</h2><ul>${value.map((v) => `<li>${escapeHtml(String(v))}</li>`).join('')}</ul>`
        : `<h2>${escapeHtml(heading)}</h2><p>${escapeHtml(String(value))}</p>`,
    )
    .join('');
}

/** プリレンダ HTML 本文部から可視テキスト文字数を概算する（タグ・空白を除く）。 */
export function countVisibleText(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, '').length;
}

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
      '本章では公式の採点基準と教材独自の自己点検を区別し、答案の具体的な一文を根拠に振り返ります。実際の配点や合否は推測せず、条件・権限・担当・報告の抜けを比較例から確認します。',
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
  // Sprint026 PBI-098 第1段階 / TASK-098-1
  // ref/chapterXX-*.md の本文を mdToHtml で焼き込み、view-source: で 600 字以上の
  // 本文を可視出力する（AdSense審査落ち「薄いプリレンダ」根治）。
  const chapterBody = loadChapterBodyHtml(meta.id);
  return {
    path: `/reference/${meta.id}`,
    outRelative: `reference/${meta.id}/index.html`,
    title: fullTitle,
    description,
    bodyHtml: `
      <div data-prerender="reference-${meta.id}">
        <h1>解説リファレンス：${meta.title}</h1>
        <p>${meta.summary}</p>
        <p>${meta.intro}</p>
        ${chapterBody}
        <p>関連リンク：<a href="${meta.relatedPath}">${meta.relatedLabel}</a> ／ <a href="/reference">解説リファレンス（章一覧）</a></p>
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
 *
 * Sprint026 PBI-098 第2段階 / TASK-098-3:
 *   `src/data/cases.json` から本文・解説・模範回答（判断/理由/対応）・登場人物・関係部署・
 *   テーマを焼き込み、view-source: で 600 字以上の本文を可視出力する。
 */
function buildCaseRoute(meta) {
  const num = meta.id.replace('case-', '');
  const fullTitle = `ケース${num}：パターン${meta.patternId}「${meta.patternName}」（${meta.difficulty}） | ${APP_NAME}`;
  const description = `インバスケット代表ケース${num}（パターン${meta.patternId}「${meta.patternName}」・難易度${meta.difficulty}）の本文と解説、模範回答の骨格を確認できる単独URLページです。`;

  // cases.json から実本文を取得（取得できないケースは ID 不整合）。
  const entry = CASES_BY_ID.get(meta.id);
  if (!entry) {
    throw new Error(`[prerender] cases.json に ${meta.id} が見つかりません`);
  }
  const caseTitle = String(entry.title ?? '');
  const body = String(entry.body ?? '');
  const explanation = String(entry.explanation ?? '');
  const correctPriority = String(entry.correctPriority ?? '');
  const theme = String(entry.theme ?? '');
  const characters = Array.isArray(entry.characters) ? entry.characters.map(String) : [];
  const departments = Array.isArray(entry.departments) ? entry.departments.map(String) : [];
  const ma = entry.modelAnswer ?? {};
  const judgment = String(ma.judgment ?? '');
  const reason = String(ma.reason ?? '');
  const action = String(ma.action ?? '');

  const priorityLabel =
    correctPriority === 'A'
      ? 'A優先（最優先）'
      : correctPriority === 'B'
        ? 'B優先（要計画対応）'
        : correctPriority === 'C'
          ? 'C優先（空き時間処理）'
          : `${correctPriority}優先`;

  const charsHtml = characters.length
    ? `<p>登場人物：${characters.map((c) => escapeHtml(c)).join(' / ')}</p>`
    : '';
  const deptsHtml = departments.length
    ? `<p>関係部署：${departments.map((d) => escapeHtml(d)).join(' / ')}</p>`
    : '';
  const themeHtml = theme ? `<p>テーマ分類：${escapeHtml(theme)}</p>` : '';

  // ページ固有の深掘り解説（AdSense「有用性の低いコンテンツ」対応）。
  const dd = CASE_DEEP_DIVE[meta.id] ?? {};
  const analysisHtml = deepDiveSectionsHtml([
    ['案件文から読み取るべきこと', dd.situationAnalysis],
    ['優先度判定の論拠', dd.priorityRationale],
    ['よくある誤答', dd.pitfalls],
    ['回答例文', dd.answerExample],
  ]);
  const followUpHtml = deepDiveSectionsHtml([['一次対応の後にやること', dd.followUp]]);

  return {
    path: `/cases/${meta.id}`,
    outRelative: `cases/${meta.id}/index.html`,
    title: fullTitle,
    description,
    bodyHtml: `
      <div data-prerender="case-${meta.id}">
        <h1>ケース${num}：パターン${meta.patternId}「${meta.patternName}」（${meta.difficulty}）</h1>
        <p>${escapeHtml(CONTENT_NOTICE.text)} <a href="${CONTENT_NOTICE.href}">${escapeHtml(CONTENT_NOTICE.label)}</a></p>
        <h2>ケース概要：${escapeHtml(caseTitle)}</h2>
        <p>${escapeHtml(body)}</p>
        ${charsHtml}
        ${deptsHtml}
        ${themeHtml}
        <h2>教材の分類例：${escapeHtml(priorityLabel)}</h2>
        <p>${escapeHtml(explanation)}</p>
        ${analysisHtml}
        <h2>模範回答の骨格</h2>
        <p>判断：${escapeHtml(judgment)}</p>
        <p>理由：${escapeHtml(reason)}</p>
        <p>対応：${escapeHtml(action)}</p>
        ${followUpHtml}
        ${dd.sources?.length ? `<h2>制度を確認する公的資料</h2><p>学習例を実務へ適用する際は、最新の制度と所属組織の規程を確認してください。</p><ul>${dd.sources.map((source) => `<li><a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a></li>`).join('')}</ul>` : ''}
        <p>関連リンク：<a href="/patterns/${meta.patternId}">パターン${meta.patternId}「${escapeHtml(meta.patternName)}」</a> ／ <a href="/reference/chapter08">解説リファレンス：案件パターン別攻略（chapter08）</a></p>
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
// Sprint026 PBI-098 第3段階 / TASK-098-4
// `src/data/patternData.ts` から PATTERN_DATA を同期読み込みし、
// id → meta の Map を返す。本文・特徴・回答骨格・キーフレーズ・注意事項を
// buildPatternRoute から焼き込むためのデータソース（依存追加なし / 簡易TS パーサ）。
const PATTERN_DATA_TS = resolve(FRONT_DIR, 'src', 'data', 'patternData.ts');

/**
 * patternData.ts から PATTERN_DATA リテラルをパースする（依存追加なし）。
 * - `export const PATTERN_DATA: PatternItem[] = [...]` を抽出
 * - TS シンタックス（trailing カンマ、シングルクォート、コメント）は本ソース運用上不要なため
 *   許容範囲のみ対応：シングルクォート → ダブルクォート、trailing カンマ除去、keyless オブジェクト無効
 */
function loadPatternData() {
  const src = readFileSync(PATTERN_DATA_TS, 'utf-8');
  const startMatch = src.match(/export const PATTERN_DATA[^=]*=\s*\[/);
  if (!startMatch) throw new Error('[prerender] PATTERN_DATA 配列の開始が見つかりません');
  const startIdx = startMatch.index + startMatch[0].length - 1; // `[` の位置
  // 角括弧の深さで対応する `]` を探す（文字列内の `[` `]` も簡易検知）。
  let depth = 0;
  let endIdx = -1;
  let inStr = false;
  let strCh = '';
  for (let i = startIdx; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') {
        i++;
        continue;
      }
      if (c === strCh) inStr = false;
      continue;
    }
    if (c === "'" || c === '"') {
      inStr = true;
      strCh = c;
      continue;
    }
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx < 0) throw new Error('[prerender] PATTERN_DATA 配列の終端が見つかりません');
  let literal = src.slice(startIdx, endIdx + 1);
  // コメント除去（行コメント）。
  literal = literal.replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  // シングルクォート文字列 → ダブルクォート（中に " が無い前提：patternData.ts は遵守）。
  literal = literal.replace(
    /'([^'\\]*(?:\\.[^'\\]*)*)'/g,
    (_m, body) => `"${body.replace(/"/g, '\\"')}"`,
  );
  // キーをダブルクォート化（識別子のみ）。
  literal = literal.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
  // trailing カンマ除去。
  literal = literal.replace(/,(\s*[\]}])/g, '$1');
  return JSON.parse(literal);
}

const PATTERN_DATA = loadPatternData();
/** @type {Map<number, Record<string, unknown>>} */
const PATTERNS_BY_ID = new Map(PATTERN_DATA.map((p) => [p.id, p]));

const PATTERNS = PATTERN_DATA.map((p) => ({ id: p.id, name: p.name }));

const PRIORITY_LABEL_FOR_PATTERN = {
  A: 'A優先（最重要・緊急）',
  B: 'B優先（重要）',
  C: 'C優先（低優先度）',
  situational: '状況依存（案件の条件で判断）',
};

const CATEGORY_DESCRIPTION = {
  対外対応パターン:
    '顧客・取引先・営業先など社外関係者を相手にした案件群。初動の速度と顧客視点の指示が評価の中心になります。',
  '人事・部下マネジメントパターン':
    '部下の育成・配置・対人トラブルなど、ヒューマンスキルが問われる案件群。事実確認と本人の意思尊重、対面コミュニケーションが鍵になります。',
  '業務・プロジェクトパターン':
    '日常業務やプロジェクト運営に関する案件群。計画組織力と問題分析力で、リソース配分と進捗管理を構造化する判断が求められます。',
  'リスク・トラブルパターン':
    '事故・コンプライアンス・情報セキュリティなど、組織の存続に関わるリスク案件群。最優先（A優先）扱いで、封じ込めと報告系統の即時起動が求められます。',
  '組織・方針パターン':
    '組織変更・上位方針・部署間調整など、構造や戦略に関わる案件群。利害関係者の整理と段階的な実施計画、納得感の醸成が評価の中心になります。',
  その他のパターン:
    '前任引継ぎや複数パターンの複合案件など、定型化しにくい案件群。前提条件の確認と要素分解、優先順位の高い要素からの着手が求められます。',
};

/**
 * パターン詳細 1 件をプリレンダリング ROUTES 形式に変換するヘルパー。
 * title/description は `Router.tsx#resolveRouteSeo`（`pattern-detail` 分岐）と意味的に一致。
 */
function buildPatternRoute(meta) {
  const fullTitle = `パターン${meta.id}：${meta.name} | ${APP_NAME}`;
  const description = `インバスケット案件パターン${meta.id}「${meta.name}」の特徴・優先度の目安・回答の骨格を確認できる詳細ページです。`;

  // Sprint026 PBI-098 第3段階 / TASK-098-4
  // patternData.ts の実データ（characteristics / answerSkeleton / keyPhrases / notes / category /
  // typicalPriority）を view-source: で 600 字以上可視出力する形に焼き込む。
  const entry = PATTERNS_BY_ID.get(meta.id);
  if (!entry) {
    throw new Error(`[prerender] patternData.ts に id=${meta.id} が見つかりません`);
  }
  const category = String(entry.category ?? '');
  const characteristics = String(entry.characteristics ?? '');
  const typicalPriority = String(entry.typicalPriority ?? '');
  const priorityLabel = PRIORITY_LABEL_FOR_PATTERN[typicalPriority] ?? typicalPriority;
  const categoryDesc = CATEGORY_DESCRIPTION[category] ?? '';
  const skeleton = Array.isArray(entry.answerSkeleton) ? entry.answerSkeleton.map(String) : [];
  const keyPhrases = Array.isArray(entry.keyPhrases) ? entry.keyPhrases.map(String) : [];
  const notes = String(entry.notes ?? '');

  const skeletonHtml = skeleton.length
    ? `<h2>回答の骨格（誰に・何を・いつまでに）</h2><ol>${skeleton.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ol>`
    : '';
  const keyPhrasesHtml = keyPhrases.length
    ? `<h2>キーフレーズ例</h2><ul>${keyPhrases.map((p) => `<li>「${escapeHtml(p)}」</li>`).join('')}</ul>`
    : '';
  const notesHtml = notes ? `<h2>対応ポイント・注意事項</h2><p>${escapeHtml(notes)}</p>` : '';

  // ページ固有の深掘り解説（AdSense「有用性の低いコンテンツ」対応）。
  const dd = PATTERN_DEEP_DIVE[String(meta.id)] ?? {};
  const situationHtml = deepDiveSectionsHtml([
    ['出題される場面の読み解き', dd.situation],
    ['なぜこの優先度になるのか', dd.priorityRationale],
  ]);
  const practiceHtml = deepDiveSectionsHtml([
    ['よくある失敗', dd.commonMistakes],
    ['回答例文', dd.answerExample],
    ['答案を振り返る観点', dd.evaluatorView],
  ]);

  return {
    path: `/patterns/${meta.id}`,
    outRelative: `patterns/${meta.id}/index.html`,
    title: fullTitle,
    description,
    bodyHtml: `
      <div data-prerender="pattern-${meta.id}">
        <h1>パターン${meta.id}：${meta.name}</h1>
        <p>${escapeHtml(CONTENT_NOTICE.text)} <a href="${CONTENT_NOTICE.href}">${escapeHtml(CONTENT_NOTICE.label)}</a></p>
        <h2>カテゴリ：${escapeHtml(category)}</h2>
        <p>${escapeHtml(categoryDesc)}</p>
        <h2>優先度の目安：${escapeHtml(priorityLabel)}</h2>
        <p>${escapeHtml(characteristics)}</p>
        ${situationHtml}
        ${skeletonHtml}
        ${practiceHtml}
        ${keyPhrasesHtml}
        ${notesHtml}
        <p>関連リンク：<a href="/patterns">パターン別解説（全20パターン）</a> ／ <a href="/reference/chapter08">解説リファレンス：案件パターン別攻略（chapter08）</a></p>
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
      <div data-prerender="home">
        <h1>インバスケット</h1>
        ${homeStudyGuideHtml()}
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
      <div data-prerender="about">
        ${informationBodyHtml(SITE_INFORMATION.about)}
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
      <div data-prerender="terms">
        <h1>サービス利用規約</h1>
        <p>本規約は、InBusket（インバスケット学習アプリ）の利用条件を簡潔にまとめたものです。利用者は本サービスを利用することで、本規約に同意したものとみなします。詳細条項は利用規約（条文版）を参照してください。</p>
        <p>本サービスはどなたでも無料でご利用いただけます。本規約および <a href="/privacy-policy">プライバシーポリシー</a> に同意できない場合は、本サービスのご利用をお控えください。</p>
        <p>関連リンク：<a href="/terms-of-service">利用規約（条文版）</a> ／ <a href="/about">運営者情報</a></p>
      </div>
    `.trim(),
  },
  {
    // Sprint027 追補: /terms-of-service（利用規約・条文版）。sitemap 掲載 URL だが
    // 未プリレンダのため HTTP 404（ソフト404）になっていたのを解消する（PBI-106）。
    path: '/terms-of-service',
    outRelative: 'terms-of-service/index.html',
    title: `利用規約（条文版） | ${APP_NAME}`,
    description:
      'インバスケット学習アプリ InBusket の利用規約（条文版）です。サービスの目的・利用資格・禁止事項・知的財産権・広告表示・免責事項・サービスの変更停止・規約の変更・準拠法と管轄を条文形式で定めています。',
    bodyHtml: `
      <div data-prerender="terms-of-service">
        <h1>利用規約</h1>
        <p>本利用規約（以下「本規約」）は、InBusket（インバスケット学習アプリ／以下「本サービス」）の利用条件を定めるものです。ユーザーは本サービスを利用することで、本規約に同意したものとみなします。最終更新日: 2026年5月16日。</p>
        <h2>第1条（サービスの目的）</h2>
        <p>本サービスは、インバスケット思考のトレーニングを目的としたウェブアプリケーションです。ユーザーが優先度判断・管理職思考を学ぶことを支援します。</p>
        <h2>第2条（利用資格）</h2>
        <p>本サービスはどなたでも無料でご利用いただけます。ただし、13歳未満の方（保護者の同意がない場合）、および過去に本規約違反により利用を禁止された方による利用を禁止します。</p>
        <h2>第3条（禁止事項）</h2>
        <p>ユーザーは、本サービスのコンテンツの無断複製・転載・二次利用、本サービスへの不正アクセスやシステムへの干渉、虚偽情報の流布や他者への迷惑行為、書面での事前許可のない商業目的での利用、その他運営者が不適切と判断する行為を行ってはなりません。</p>
        <h2>第4条（知的財産権）</h2>
        <p>本サービスに掲載されているコンテンツ（テキスト・デザイン・ソースコードなど）に関する著作権・知的財産権は、本サービス運営者または正当な権利者に帰属します。ただし、ソースコードについては、GitHubリポジトリに掲載のライセンスに従うものとします。</p>
        <h2>第5条（広告の表示）</h2>
        <p>本サービスでは、Google AdSense を通じた広告を表示しています。広告に関する詳細は <a href="/privacy-policy">プライバシーポリシー</a> をご参照ください。</p>
        <h2>第6条（免責事項）</h2>
        <p>本サービスは、利用により生じた損害（直接・間接を問わず）、サービスの中断・停止・変更・廃止、掲載情報の正確性・完全性・有用性、外部リンク先のコンテンツについて、一切の責任を負いません。</p>
        <h2>第7条（サービスの変更・停止）</h2>
        <p>運営者は、ユーザーへの事前通知なくサービスの内容変更・停止・廃止を行う場合があります。これによりユーザーに生じた損害について、運営者は責任を負いません。</p>
        <h2>第8条（規約の変更）</h2>
        <p>運営者は必要に応じて本規約を変更することがあります。変更後の規約は本ページに掲載した時点で効力を生じ、継続利用をもって同意とみなします。</p>
        <h2>第9条（準拠法・管轄裁判所）</h2>
        <p>本規約は日本法に準拠するものとし、本サービスに関する紛争については、運営者所在地を管轄する裁判所を専属的合意管轄とします。</p>
        <p>関連リンク：<a href="/terms">サービス利用規約（要旨）</a> ／ <a href="/about">運営者情報</a> ／ <a href="/contact">お問い合わせ</a></p>
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
      <div data-prerender="privacy-policy">
        ${informationBodyHtml(SITE_INFORMATION.privacy)}
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
      <div data-prerender="contact">
        ${informationBodyHtml(SITE_INFORMATION.contact)}
      </div>
    `.trim(),
  },
  ...CHAPTERS.map(buildChapterRoute),
  ...CASES.map(buildCaseRoute),
  ...PATTERNS.map(buildPatternRoute),
  // Sprint026 PBI-099 / TASK-099-1
  // 一覧プリレンダ化（/reference, /patterns）。各項目に1〜2文の説明文＋導入文を
  // 静的HTMLとして焼き込み、view-source: で本文を可視化する（広告掲載最小基準充足）。
  {
    path: '/reference',
    outRelative: 'reference/index.html',
    title: `解説リファレンス（章一覧） | ${APP_NAME}`,
    description:
      'インバスケット学習アプリ InBusket の解説リファレンス全12章を一覧で確認できる索引ページです。基礎理解からコアテクニック、当日戦略までを章ごとの要旨付きで整理しています。',
    bodyHtml: `
      <div data-prerender="reference-index">
        <h1>解説リファレンス（章一覧）</h1>
        <p>本ページはインバスケット学習アプリ InBusket の解説リファレンス全12章の索引です。第1〜3章で試験の正体と採点6軸を理解し、第4〜7章で時間配分・優先順位・意思決定・委任のコアテクニックを学び、第8〜9章で頻出20パターンと答案文章術を習得し、第10〜11章で模擬試験と弱点改善サイクルを回し、第12章で本番当日の戦略を確認する構成です。</p>
        <p>使い方の目安：まず通しで一読し、その後は第10章の模擬試験に取り組みながら、苦手分野を該当章で繰り返し復習するとマネージャー思考が定着しやすくなります。各章タイトルから詳細ページへ遷移し、章末の関連リンクで隣接トピックへ横断できます。</p>
        <ul>${CHAPTERS.map(
          (c) =>
            `<li><a href="/reference/${c.id}">${escapeHtml(c.title)}</a>：${escapeHtml(c.summary)}</li>`,
        ).join('')}</ul>
        <p>関連リンク：<a href="/patterns">案件パターン別解説（全20パターン）</a> ／ <a href="/about">運営者情報</a></p>
      </div>
    `.trim(),
  },
  {
    path: '/patterns',
    outRelative: 'patterns/index.html',
    title: `案件パターン別解説（全20パターン） | ${APP_NAME}`,
    description:
      'インバスケット試験で頻出する案件20パターンの索引ページです。各パターンの特徴・優先度の目安・回答骨格（誰に・何を・いつまでに）を確認できます。',
    bodyHtml: `
      <div data-prerender="patterns-index">
        <h1>案件パターン別解説（全20パターン）</h1>
        <p>本ページはインバスケット試験で頻出する案件20パターンの索引です。対外対応・人事マネジメント・業務プロジェクト・リスクトラブル・組織方針・その他の6カテゴリに分類し、緊急度×重要度の判定、関係者への指示、報告タイミングの設計など、採点6軸（判断力・統率力・問題分析力・計画組織力・対人関係力・主体性）に直結する行動を学べる構成です。</p>
        <p>使い方の目安：まず各パターンの「優先度傾向」と「特徴」を一覧で押さえ、本番で迷いなくマトリクス分類できる状態を作ります。その上で頻出パターン（顧客クレーム・部下退職相談・プロジェクト遅延・情報セキュリティインシデント等）の回答骨格を反復し、代表ケース20件で実戦演習する流れが効果的です。</p>
        <ul>${PATTERNS.map(
          (p) =>
            `<li><a href="/patterns/${p.id}">パターン${p.id}：${escapeHtml(p.name)}</a>：管理職昇進試験で頻出する「${escapeHtml(p.name)}」型の案件処理の特徴・優先度・回答骨格を確認できます。</li>`,
        ).join('')}</ul>
        <p>関連リンク：<a href="/reference/chapter08">解説リファレンス：案件パターン別攻略（chapter08）</a> ／ <a href="/reference">解説リファレンス（章一覧）</a></p>
      </div>
    `.trim(),
  },
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
  return html.replace(re, `<div id="root">${bodyHtml.replace(/[ \t]+$/gm, '')}</div>`);
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
