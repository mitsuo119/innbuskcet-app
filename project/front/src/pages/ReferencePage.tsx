import { useEffect } from 'react';
import {
  REFERENCE_DATA,
  type ReferenceBlock,
  type ReferenceChapter,
  type ReferenceChapterId,
} from '../data/referenceData';
import { Breadcrumb } from '../ui/Breadcrumb';
import { GlobalNav } from '../ui/GlobalNav';
import { AdSlot } from '../ui/AdSlot';
import './ReferencePage.css';

interface Props {
  focusChapterId?: ReferenceChapterId | null;
}

function renderBlock(block: ReferenceBlock, chapterId: ReferenceChapterId, index: number) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p key={`${chapterId}-paragraph-${index}`} className="reference-page__paragraph">
          {block.text}
        </p>
      );
    case 'bullet-list':
      return (
        <ul key={`${chapterId}-list-${index}`} className="reference-page__list">
          {block.items.map((item, itemIndex) => (
            <li key={`${chapterId}-list-${index}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div key={`${chapterId}-table-${index}`} className="reference-page__table-wrap">
          <table className="reference-page__table">
            <thead>
              <tr>
                {block.headers.map((header, headerIndex) => (
                  <th key={`${chapterId}-table-${index}-header-${headerIndex}`} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${chapterId}-table-${index}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${chapterId}-table-${index}-row-${rowIndex}-cell-${cellIndex}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'note':
      return (
        <aside
          key={`${chapterId}-note-${index}`}
          className="reference-page__note"
          aria-label={block.title}
        >
          <h4 className="reference-page__note-title">{block.title}</h4>
          <p className="reference-page__note-text">{block.text}</p>
        </aside>
      );
    case 'link-list':
      return (
        <ul key={`${chapterId}-link-list-${index}`} className="reference-page__link-list">
          {block.items.map((item, itemIndex) => (
            <li key={`${chapterId}-link-list-${index}-${itemIndex}`}>
              <a href={item.href} className="reference-page__inline-link">
                {item.label}
              </a>
              {item.description && (
                <span className="reference-page__link-description">：{item.description}</span>
              )}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

interface ChapterNavInfo {
  prev: ReferenceChapter | null;
  next: ReferenceChapter | null;
  index: number;
  total: number;
}

function getChapterNavInfo(chapter: ReferenceChapter): ChapterNavInfo {
  const index = REFERENCE_DATA.findIndex((c) => c.id === chapter.id);
  return {
    prev: index > 0 ? REFERENCE_DATA[index - 1] : null,
    next: index >= 0 && index < REFERENCE_DATA.length - 1 ? REFERENCE_DATA[index + 1] : null,
    index,
    total: REFERENCE_DATA.length,
  };
}

function renderChapter(chapter: ReferenceChapter) {
  const nav = getChapterNavInfo(chapter);
  const positionLabel = `第 ${nav.index + 1} 章 / 全 ${nav.total} 章`;
  return (
    <article key={chapter.id} id={`reference-${chapter.id}`} className="reference-page__chapter">
      <header className="reference-page__chapter-header">
        <p className="reference-page__chapter-position" aria-hidden="true">
          {positionLabel}
        </p>
        <h2 className="reference-page__chapter-title" tabIndex={-1}>
          {chapter.title}
        </h2>
        <p className="reference-page__chapter-description">{chapter.description}</p>
      </header>

      <section className="reference-page__goal-card" aria-label={`${chapter.title} の学習ゴール`}>
        <h3 className="reference-page__section-heading">学習ゴール</h3>
        <ul className="reference-page__goal-list">
          {chapter.learningGoals.map((goal, index) => (
            <li key={`${chapter.id}-goal-${index}`}>{goal}</li>
          ))}
        </ul>
      </section>

      <div className="reference-page__sections">
        {chapter.sections.map((section) => (
          <section
            key={section.id}
            className="reference-page__section"
            aria-labelledby={section.id}
          >
            <h3 id={section.id} className="reference-page__section-heading">
              {section.title}
            </h3>
            {section.summary && (
              <p className="reference-page__section-summary">{section.summary}</p>
            )}
            <div className="reference-page__content">
              {section.blocks.map((block, index) => renderBlock(block, chapter.id, index))}
            </div>
          </section>
        ))}
      </div>

      <nav
        className="reference-page__chapter-pager"
        aria-label={`${chapter.title} の章間ナビゲーション`}
      >
        {nav.prev ? (
          <a
            className="reference-page__pager-link reference-page__pager-link--prev"
            href={`/reference/${nav.prev.id}`}
          >
            <span className="reference-page__pager-direction" aria-hidden="true">
              ← 前の章
            </span>
            <span className="reference-page__pager-title">{nav.prev.title}</span>
          </a>
        ) : (
          <span
            className="reference-page__pager-link reference-page__pager-link--prev reference-page__pager-link--disabled"
            aria-disabled="true"
            role="link"
          >
            <span className="reference-page__pager-direction" aria-hidden="true">
              ← 前の章
            </span>
            <span className="reference-page__pager-title">（最初の章です）</span>
          </span>
        )}
        <a
          className="reference-page__pager-link reference-page__pager-link--top"
          href="#reference-chapter-nav"
        >
          <span className="reference-page__pager-direction" aria-hidden="true">
            ↑
          </span>
          <span className="reference-page__pager-title">章一覧へ戻る</span>
        </a>
        {nav.next ? (
          <a
            className="reference-page__pager-link reference-page__pager-link--next"
            href={`/reference/${nav.next.id}`}
          >
            <span className="reference-page__pager-direction" aria-hidden="true">
              次の章 →
            </span>
            <span className="reference-page__pager-title">{nav.next.title}</span>
          </a>
        ) : (
          <span
            className="reference-page__pager-link reference-page__pager-link--next reference-page__pager-link--disabled"
            aria-disabled="true"
            role="link"
          >
            <span className="reference-page__pager-direction" aria-hidden="true">
              次の章 →
            </span>
            <span className="reference-page__pager-title">（最後の章です）</span>
          </span>
        )}
      </nav>
    </article>
  );
}

export function ReferencePage({ focusChapterId = null }: Props) {
  useEffect(() => {
    if (!focusChapterId) return;
    const section = document.getElementById(`reference-${focusChapterId}`);
    const heading = section?.querySelector<HTMLElement>('.reference-page__chapter-title');
    section?.scrollIntoView?.({ block: 'start' });
    heading?.focus();
  }, [focusChapterId]);

  const focusedChapter = focusChapterId
    ? REFERENCE_DATA.find((c) => c.id === focusChapterId)
    : undefined;
  const visibleChapters = focusedChapter ? [focusedChapter] : REFERENCE_DATA;

  return (
    <div className="container reference-page">
      <header className="reference-page__header">
        <a href="/" className="reference-page__back" aria-label="ホームに戻る">
          ← ホームに戻る
        </a>
        <GlobalNav current="reference" />
        {focusedChapter ? (
          <Breadcrumb
            items={[
              { label: 'ホーム', href: '/' },
              { label: '解説リファレンス', href: '/reference' },
              { label: focusedChapter.title },
            ]}
          />
        ) : (
          <Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: '解説リファレンス' }]} />
        )}
        <p className="reference-page__eyebrow">解説リファレンス</p>
        <h1 className="reference-page__title">
          {focusedChapter?.title ?? 'インバスケット解説リファレンス'}
        </h1>
        <p className="reference-page__lead">
          {focusedChapter?.description ??
            'インバスケットの基礎、判断の観点、優先順位づけ、委任、振り返りを全12章で整理します。'}
        </p>
        {!focusedChapter && (
          <p className="reference-page__lead reference-page__lead--howto">
            使い方の目安：第1〜3章で試験の正体と採点6軸を理解し、第4〜7章で時間配分・優先順位・意思決定・委任のコアテクニックを学び、第8〜9章で頻出20パターンと答案文章術を習得し、第10〜11章で模擬試験と弱点改善サイクルを回し、第12章で本番当日の戦略を確認します。各章タイトルから詳細ページへ遷移し、章末の関連リンクで隣接トピックへ横断できます。
          </p>
        )}
      </header>

      <nav
        id="reference-chapter-nav"
        className="reference-page__chapter-nav"
        aria-label="章スキップ"
      >
        {REFERENCE_DATA.map((chapter, index) => {
          const isCurrent = focusChapterId === chapter.id;
          return (
            <a
              key={chapter.id}
              href={`/reference/${chapter.id}`}
              className="reference-page__chapter-link"
              aria-current={isCurrent ? 'page' : undefined}
            >
              <span className="reference-page__chapter-link-index" aria-hidden="true">
                第{index + 1}章
              </span>
              <span className="reference-page__chapter-link-title">{chapter.title}</span>
              <span className="reference-page__chapter-link-description">
                {chapter.description}
              </span>
            </a>
          );
        })}
      </nav>

      <main className="reference-page__main">
        {visibleChapters.map((chapter) => renderChapter(chapter))}
        {/* PBI-100 / TASK-100-3: 章詳細（focusChapterId 付）のみ広告表示。
            /reference（一覧）は kind='reference-list' で shouldShowAds=false により非表示。 */}
        <AdSlot
          label="広告（コンテンツ下）"
          className="ad-slot--footer"
          pageMeta={{ kind: focusChapterId ? 'reference-chapter' : 'reference-list' }}
        />
      </main>
    </div>
  );
}
