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
// 対象ルート（計 60 ルート）:
//   /, /about, /terms, /terms-of-service, /privacy-policy, /contact,
//   /reference, /reference/chapter01〜12, /patterns, /patterns/1〜20, /cases/case-XXX × 20
//
// 動作:
//   - `dist/index.html` をテンプレートとして読み込み、ルートごとに以下を差し替えて出力する。
//       * <title>                                   → ルート別 title
//       * <meta name="description">                 → ルート別 description
//       * <link rel="canonical">                    → siteUrl + path
//       * <meta property="og:title|og:description|og:url">
//       * <meta name="twitter:title|twitter:description">
//       * <div id="root"></div>                     → 静的フォールバック本文を内側に挿入
//         （React マウント時に置換される。view-source: では本文テキストとして可視。）
//   - 出力先: ルート path をディレクトリとし `index.html` を生成（`/` のみ dist 直下に in-place）。
//
// 方針（2026-09-26）:
//   - 本文は画面（React）と同じ定義源（src/data の JSON・TS データ、routes.ts）から生成し、
//     画面に表示しない文章を静的HTMLだけに書かない（src/pages/__tests__/StaticParity.test.tsx で検証）。
//   - DOM レンダリング（React コンポーネント評価）は行わず、重量級依存（Puppeteer / Playwright）を
//     回避する（ADR-002 / E3〜E6 / R-A）。
//
// 依存追加: なし（Node 標準のみ）。

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONT_DIR = resolve(__dirname, '..');
const DIST_DIR = resolve(FRONT_DIR, 'dist');
const TEMPLATE = resolve(DIST_DIR, 'index.html');
const DATA_DIR = resolve(FRONT_DIR, 'src', 'data');

/** 画面と同じ定義源（src/data 配下の JSON）を読み込む。 */
function readDataJson(name) {
  return JSON.parse(readFileSync(resolve(DATA_DIR, name), 'utf-8'));
}

const CASES_JSON = resolve(DATA_DIR, 'cases.json');
const SCORING_GUIDE = readDataJson('scoringGuide.json');
const CONTENT_NOTICE = readDataJson('learningContentNotice.json');
const PAGE_INTRO = readDataJson('pageIntro.json');

const APP_NAME = 'インバスケット学習アプリ';

/**
 * TS ファイル内の配列リテラル（`<declaration>: T[] = [...]`）を取り出して評価する。
 * 静的HTMLを画面と同じデータから生成するために使う（依存追加なし）。
 * 配列の中はデータのみ（関数呼び出し・型注釈なし）であることを前提とする。
 */
function loadArrayLiteral(fileName, declaration) {
  const src = readFileSync(resolve(DATA_DIR, '..', fileName), 'utf-8');
  const match = new RegExp(`${declaration}\\b[^=]*=\\s*\\[`).exec(src);
  if (!match) throw new Error(`[prerender] ${fileName} に ${declaration} が見つかりません`);
  const start = match.index + match[0].length - 1;
  let depth = 0;
  let quote = '';
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c === '/' && src[i + 1] === '/') i = src.indexOf('\n', i);
    else if (c === '[') depth++;
    else if (c === ']' && --depth === 0) {
      const value = vm.runInNewContext(`(${src.slice(start, i + 1)})`);
      return JSON.parse(JSON.stringify(value));
    }
  }
  throw new Error(`[prerender] ${declaration} の終端が見つかりません`);
}

/** 解説リファレンス全章（ReferencePage と同じ referenceData.ts / scoringGuide.json）。 */
const REFERENCE_CHAPTERS = [
  ...loadArrayLiteral('data/referenceData.ts', 'const REFERENCE_DATA_SOURCE'),
  SCORING_GUIDE,
].sort((a, b) => a.id.localeCompare(b.id));

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
              `<a href="${escapeAttr(item.href)}">${escapeHtml(item.label)}</a>${item.description ? `：${escapeHtml(item.description)}` : ''}`,
          ),
        );
      default:
        throw new Error(`未対応の本文ブロック: ${block.kind}`);
    }
  };
  const sectionsHtml = chapter.sections
    .map(
      (section) =>
        `<h2>${escapeHtml(section.title)}</h2>${section.summary ? `<p>${escapeHtml(section.summary)}</p>` : ''}${section.blocks.map(blockHtml).join('')}`,
    )
    .join('\n');
  return `<h2>学習ゴール</h2>${listHtml(chapter.learningGoals.map(escapeHtml))}\n${sectionsHtml}`;
}

const CASES_BY_ID = new Map(
  JSON.parse(readFileSync(CASES_JSON, 'utf-8')).map((entry) => [entry.id, entry]),
);

/** パターン／ケースの深掘り解説（ページ固有本文）。定義源は React 側と共通の JSON。 */
const PATTERN_DEEP_DIVE = readDataJson('patternDeepDive.json');
const CASE_DEEP_DIVE = readDataJson('caseDeepDive.json');
const HOME_GUIDE = readDataJson('homeStudyGuide.json');
const SITE_INFORMATION = readDataJson('siteInformation.json');

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

/**
 * path（先頭 `/`）を絶対 URL に変換する。`/` はサイトルートのまま。
 * GitHub Pages は `/about` を `/about/`（about/index.html）へ転送するため、canonical と og:url は
 * 転送後の末尾スラッシュ付き URL にそろえる（JS 実行後の canonical とも一致する）。
 */
export function toAbsoluteUrl(siteUrl, path) {
  if (path === '/') return siteUrl;
  return `${siteUrl}${path.replace(/^\/+/, '').replace(/\/+$/, '')}/`;
}

/** 章スキップ（ReferencePage の章詳細ページと同じ章タイトル一覧）。 */
function chapterNavHtml() {
  return `<nav id="reference-chapter-nav" aria-label="章スキップ"><ul>${REFERENCE_CHAPTERS.map(
    (chapter, index) =>
      `<li><a href="/reference/${chapter.id}">第${index + 1}章 ${escapeHtml(chapter.title)}</a></li>`,
  ).join('')}</ul></nav>`;
}

/** 章末の前後導線（ReferencePage の章間ナビゲーションと同じ文言）。 */
function chapterPagerHtml(index) {
  const prev = REFERENCE_CHAPTERS[index - 1];
  const next = REFERENCE_CHAPTERS[index + 1];
  const items = [
    prev
      ? `<a href="/reference/${prev.id}">← 前の章 ${escapeHtml(prev.title)}</a>`
      : '← 前の章 （最初の章です）',
    '<a href="/reference">↑ 章一覧へ戻る</a>',
    next
      ? `<a href="/reference/${next.id}">次の章 → ${escapeHtml(next.title)}</a>`
      : '次の章 → （最後の章です）',
  ];
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

/**
 * 章ルートをプリレンダリング ROUTES 形式に変換するヘルパー。
 * 本文は ReferencePage と同じ referenceData.ts から生成し、画面に無い文章を加えない。
 * title/description は `Router.tsx#resolveRouteSeo`（reference-chapter 分岐）と一致させる。
 */
function buildChapterRoute(chapter, index) {
  return {
    path: `/reference/${chapter.id}`,
    outRelative: `reference/${chapter.id}/index.html`,
    title: `解説リファレンス：${chapter.title} | ${APP_NAME}`,
    description: `インバスケット学習の「${chapter.title}」を中心に、要点とフレームワークを章別に確認できる解説リファレンスページです。`,
    bodyHtml: `
      <div data-prerender="reference-${chapter.id}">
        <p>解説リファレンス｜${escapeHtml(chapter.level)}</p>
        <h1>${escapeHtml(chapter.title)}</h1>
        <p>${escapeHtml(chapter.description)}</p>
        <p>第 ${index + 1} 章 / 全 ${REFERENCE_CHAPTERS.length} 章</p>
        ${referenceChapterHtml(chapter)}
        ${chapterPagerHtml(index)}
        ${chapterNavHtml()}
      </div>
    `.trim(),
  };
}

/** 解説リファレンス一覧（ReferencePage の一覧表示と同じ構成）。 */
function referenceIndexHtml() {
  const index = PAGE_INTRO.referenceIndex;
  const levels = index.levels.map(({ level, description }) => {
    const chapters = REFERENCE_CHAPTERS.map((chapter, order) => ({ chapter, order })).filter(
      ({ chapter }) => chapter.level === level,
    );
    return `<h2>${escapeHtml(level)}</h2><p>${escapeHtml(description)}</p>${chapters
      .map(
        ({ chapter, order }) =>
          `<h3><a href="/reference/${chapter.id}">第${order + 1}章 ${escapeHtml(chapter.title)}</a></h3><p>${escapeHtml(chapter.description)}</p><ul>${chapter.learningGoals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('')}</ul>`,
      )
      .join('')}`;
  });
  return `
    <p>解説リファレンス</p>
    <h1>${escapeHtml(index.title)}</h1>
    <p>${escapeHtml(index.lead)}</p>
    <p>${escapeHtml(index.howto)}</p>
    ${levels.join('\n')}
  `;
}

/** 代表ケース 20 件のメタ（CaseDetail / Router と同じ routes.ts の CASE_DETAIL_META）。 */
const CASES = loadArrayLiteral('routes.ts', 'export const CASE_DETAIL_META');

/** 優先度の表示名（CaseDetail / PatternDetail と同じ文言）。 */
const PRIORITY_LABEL = {
  A: 'A優先（最重要・緊急）',
  B: 'B優先（重要）',
  C: 'C優先（低優先度）',
  situational: '状況依存',
};

/**
 * 代表ケース 1 件をプリレンダリング ROUTES 形式に変換するヘルパー。
 * 本文は CaseDetail と同じ cases.json / caseDeepDive.json から、同じ見出しで生成する。
 * title/description は `Router.tsx#resolveRouteSeo`（`case-detail` 分岐）と一致させる。
 */
function buildCaseRoute(meta) {
  const num = meta.id.replace('case-', '');
  const entry = CASES_BY_ID.get(meta.id);
  if (!entry) {
    throw new Error(`[prerender] cases.json に ${meta.id} が見つかりません`);
  }
  const answer = entry.modelAnswer;
  const dd = CASE_DEEP_DIVE[meta.id];
  const analysisHtml = dd
    ? deepDiveSectionsHtml([
        ['案件文から読み取るべきこと', dd.situationAnalysis],
        ['優先度判定の論拠', dd.priorityRationale],
        ['よくある誤答', dd.pitfalls],
        ['回答例文', dd.answerExample],
      ])
    : '';
  const answerHtml = answer
    ? `<h2>モデル回答</h2><dl><dt>判断</dt><dd>${escapeHtml(answer.judgment)}</dd><dt>理由</dt><dd>${escapeHtml(answer.reason)}</dd><dt>具体行動</dt><dd>${escapeHtml(answer.action)}</dd></dl>`
    : '';
  const followUpHtml = dd ? deepDiveSectionsHtml([['一次対応の後にやること', dd.followUp]]) : '';
  const sourcesHtml = dd?.sources
    ? `<h2>制度を確認する公的資料</h2><p>学習例を実務へ適用する際は、最新の制度と所属組織の規程を確認してください。</p><ul>${dd.sources.map((source) => `<li><a href="${escapeAttr(source.href)}">${escapeHtml(source.label)}</a></li>`).join('')}</ul>`
    : '';

  return {
    path: `/cases/${meta.id}`,
    outRelative: `cases/${meta.id}/index.html`,
    title: `ケース${num}：パターン${meta.patternId}「${meta.patternName}」（${meta.difficulty}） | ${APP_NAME}`,
    description: `インバスケット代表ケース${num}（パターン${meta.patternId}「${meta.patternName}」・難易度${meta.difficulty}）の本文と解説、模範回答の骨格を確認できる単独URLページです。`,
    bodyHtml: `
      <div data-prerender="case-${meta.id}">
        <h1>ケース${num}：${escapeHtml(entry.title)}</h1>
        <p>パターン${meta.patternId}「${escapeHtml(meta.patternName)}」／難易度：${meta.difficulty}</p>
        <p>${escapeHtml(CONTENT_NOTICE.text)} <a href="${CONTENT_NOTICE.href}">${escapeHtml(CONTENT_NOTICE.label)}</a></p>
        <h2>ケース本文</h2>
        <p>${escapeHtml(entry.body)}</p>
        <h2>教材の分類例と解説</h2>
        <p><strong>${escapeHtml(PRIORITY_LABEL[entry.correctPriority] ?? entry.correctPriority)}</strong></p>
        <p>${escapeHtml(entry.explanation)}</p>
        ${analysisHtml}
        ${answerHtml}
        ${followUpHtml}
        ${sourcesHtml}
        <h2>関連リンク</h2>
        <ul><li><a href="/patterns/${meta.patternId}">パターン${meta.patternId}「${escapeHtml(meta.patternName)}」の詳細を見る</a></li><li><a href="/reference">解説リファレンス（章別の体系解説）</a></li></ul>
      </div>
    `.trim(),
  };
}

/** 全 20 パターン（PatternList / PatternDetail と同じ patternData.ts の PATTERN_DATA）。 */
const PATTERN_DATA = loadArrayLiteral('data/patternData.ts', 'export const PATTERN_DATA');

/** パターン一覧の優先度バッジ（PatternList と同じ文言）。 */
const PATTERN_LIST_BADGE = { A: 'A優先', B: 'B優先', C: 'C優先', situational: '状況依存' };

/** パターン別解説一覧（PatternList と同じ構成）。 */
function patternIndexHtml() {
  const index = PAGE_INTRO.patternIndex;
  const categories = [...new Set(PATTERN_DATA.map((pattern) => pattern.category))];
  return `
    <h1>${escapeHtml(index.title)}</h1>
    <p>${escapeHtml(index.subtitle)}</p>
    ${index.intro.map((text) => `<p>${escapeHtml(text)}</p>`).join('')}
    ${categories
      .map(
        (category) =>
          `<h2>${escapeHtml(category)}</h2><ul>${PATTERN_DATA.filter(
            (pattern) => pattern.category === category,
          )
            .map(
              (pattern) =>
                `<li><a href="/patterns/${pattern.id}">パターン${pattern.id} ${escapeHtml(pattern.name)} ${PATTERN_LIST_BADGE[pattern.typicalPriority]}</a><p>${escapeHtml(pattern.characteristics)}</p></li>`,
            )
            .join('')}</ul>`,
      )
      .join('\n')}
  `;
}

/**
 * パターン詳細 1 件をプリレンダリング ROUTES 形式に変換するヘルパー。
 * 本文は PatternDetail と同じ patternData.ts / patternDeepDive.json から、同じ見出しで生成する。
 * title/description は `Router.tsx#resolveRouteSeo`（`pattern-detail` 分岐）と一致させる。
 */
function buildPatternRoute(pattern) {
  const dd = PATTERN_DEEP_DIVE[String(pattern.id)];
  const sample = CASES.find((meta) => meta.patternId === pattern.id);
  const sampleCase = sample ? CASES_BY_ID.get(sample.id) : undefined;
  const section = (heading, html) => `<h2>${escapeHtml(heading)}</h2>${html}`;
  const paragraph = (text) => `<p>${escapeHtml(text)}</p>`;
  const list = (tag, items) =>
    `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;

  const parts = [
    section('優先度の目安', paragraph(PRIORITY_LABEL[pattern.typicalPriority])),
    section('特徴・優先度判定理由', paragraph(pattern.characteristics)),
    dd && section('案件の読み解き', paragraph(dd.situation)),
    dd && section('なぜこの優先度になるのか', paragraph(dd.priorityRationale)),
    section('回答の骨格', list('ol', pattern.answerSkeleton)),
    dd && section('よくある失敗', list('ul', dd.commonMistakes)),
    dd && section('回答例文', paragraph(dd.answerExample)),
    dd && section('答案を振り返る観点', paragraph(dd.evaluatorView)),
    pattern.keyPhrases?.length &&
      section(
        'キーフレーズ例',
        list(
          'ul',
          pattern.keyPhrases.map((phrase) => `「${phrase}」`),
        ),
      ),
    pattern.notes && section('対応ポイント・注意事項', paragraph(pattern.notes)),
    sample &&
      sampleCase &&
      section(
        'このパターンの代表ケース',
        `<ul><li><a href="/cases/${sample.id}">ケース${sample.id.replace('case-', '')}：${escapeHtml(sampleCase.title)}（${sample.difficulty}）</a></li></ul>`,
      ),
    section(
      '関連リンク',
      '<ul><li><a href="/patterns">パターン別解説（全20パターン）</a></li><li><a href="/reference/chapter08">解説リファレンス：案件パターン別攻略（第8章）</a></li></ul>',
    ),
  ].filter(Boolean);

  return {
    path: `/patterns/${pattern.id}`,
    outRelative: `patterns/${pattern.id}/index.html`,
    title: `パターン${pattern.id}：${pattern.name} | ${APP_NAME}`,
    description: `インバスケット案件パターン${pattern.id}「${pattern.name}」の特徴・優先度の目安・回答の骨格を確認できる詳細ページです。`,
    bodyHtml: `
      <div data-prerender="pattern-${pattern.id}">
        <h1>パターン${pattern.id}：${escapeHtml(pattern.name)}</h1>
        <p>${escapeHtml(pattern.category)}</p>
        <p>${escapeHtml(CONTENT_NOTICE.text)} <a href="${CONTENT_NOTICE.href}">${escapeHtml(CONTENT_NOTICE.label)}</a></p>
        ${parts.join('\n')}
      </div>
    `.trim(),
  };
}

/** トップの導入（App の HomeIntro と同じ pageIntro.json）。 */
function homeIntroHtml() {
  const home = PAGE_INTRO.home;
  return `
    <h1>${escapeHtml(home.title)}</h1>
    <p>${escapeHtml(home.lead)}</p>
    <ul>${home.actions.map((action) => `<li><a href="${escapeAttr(action.href)}">${escapeHtml(action.label)}</a></li>`).join('')}</ul>
    <h2>${escapeHtml(home.audienceHeading)}</h2>
    <ul>${home.audience.map((text) => `<li>${escapeHtml(text)}</li>`).join('')}</ul>
    <h2 id="home-intro-steps">${escapeHtml(home.stepsHeading)}</h2>
    <ol>${home.steps.map((step) => `<li>${escapeHtml(step.label)} ${escapeHtml(step.text)} <a href="${escapeAttr(step.href)}">${escapeHtml(step.linkLabel)}</a></li>`).join('')}</ol>
    <p>${escapeHtml(home.note)}</p>
    <h2 id="practice-heading">${escapeHtml(home.practiceHeading)}</h2>
  `;
}

/**
 * プリレンダ対象ルート（60 件）。本文はすべて画面（React）と同じ定義源から生成する。
 * title/description は `Router.tsx#resolveRouteSeo` と一致させる（StaticParity.test.tsx で検証）。
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
        ${homeIntroHtml()}
        ${homeStudyGuideHtml()}
      </div>
    `.trim(),
  },
  {
    path: '/about',
    outRelative: 'about/index.html',
    title: `運営者情報 | ${APP_NAME}`,
    description:
      'インバスケット学習アプリの運営者・サイトの目的・コンテンツ作成方針・連絡手段・更新ポリシーをまとめた運営者情報ページです。',
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
      'インバスケット学習アプリの利用条件・免責・著作権・禁止事項・準拠法・改定方針を簡潔にまとめたサービス利用規約の要旨ページです。',
    bodyHtml: `
      <div data-prerender="terms">
        ${informationBodyHtml(SITE_INFORMATION.terms)}
      </div>
    `.trim(),
  },
  {
    path: '/terms-of-service',
    outRelative: 'terms-of-service/index.html',
    title: `利用規約（条文版） | ${APP_NAME}`,
    description:
      'インバスケット学習アプリの利用規約（条文版）です。サービスの目的・利用資格・禁止事項・知的財産権・広告表示・免責事項・サービスの変更停止・規約の変更・準拠法と管轄を条文形式で定めています。',
    bodyHtml: `
      <div data-prerender="terms-of-service">
        ${informationBodyHtml(SITE_INFORMATION.termsOfService)}
      </div>
    `.trim(),
  },
  {
    path: '/privacy-policy',
    outRelative: 'privacy-policy/index.html',
    title: `プライバシーポリシー | ${APP_NAME}`,
    description:
      'インバスケット学習アプリで扱う情報、ブラウザ内の保存、広告配信（Google AdSense）やお問い合わせに伴う情報の取り扱いを説明するプライバシーポリシーです。',
    bodyHtml: `
      <div data-prerender="privacy-policy">
        ${informationBodyHtml(SITE_INFORMATION.privacy)}
      </div>
    `.trim(),
  },
  {
    path: '/contact',
    outRelative: 'contact/index.html',
    title: `お問い合わせ | ${APP_NAME}`,
    description:
      'インバスケット学習アプリへのお問い合わせ方法（GitHub Issues）と、投稿が公開されることなどの注意事項を案内するページです。',
    bodyHtml: `
      <div data-prerender="contact">
        ${informationBodyHtml(SITE_INFORMATION.contact)}
      </div>
    `.trim(),
  },
  ...REFERENCE_CHAPTERS.map(buildChapterRoute),
  ...CASES.map(buildCaseRoute),
  ...PATTERN_DATA.map(buildPatternRoute),
  {
    path: '/reference',
    outRelative: 'reference/index.html',
    title: `解説リファレンス（全12章） | ${APP_NAME}`,
    description:
      'インバスケット学習の解説リファレンス全12章の目次です。入門・基礎・実践・振り返り・本番準備の順に、各章の内容と学習ゴールを確認できます。',
    bodyHtml: `
      <div data-prerender="reference-index">
        ${referenceIndexHtml()}
      </div>
    `.trim(),
  },
  {
    path: '/patterns',
    outRelative: 'patterns/index.html',
    title: `パターン別解説（全20パターン） | ${APP_NAME}`,
    description:
      'インバスケット形式の案件を20の型に分けた索引です。各パターンの優先度の目安と特徴を一覧で確認し、詳細ページで回答の骨格と例文を読めます。',
    bodyHtml: `
      <div data-prerender="patterns-index">
        ${patternIndexHtml()}
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
