import { useEffect } from 'react';
import {
  REFERENCE_DATA,
  type ReferenceBlock,
  type ReferenceChapter,
  type ReferenceChapterId,
} from '../data/referenceData';
import './ReferencePage.css';

interface Props {
  onBack: () => void;
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

function renderChapter(chapter: ReferenceChapter) {
  return (
    <article key={chapter.id} id={`reference-${chapter.id}`} className="reference-page__chapter">
      <header className="reference-page__chapter-header">
        <p className="reference-page__chapter-kicker">{chapter.id}</p>
        <h2 className="reference-page__chapter-title" tabIndex={-1}>
          {chapter.title}
        </h2>
        <p className="reference-page__chapter-description">{chapter.description}</p>
        <dl className="reference-page__meta">
          <div>
            <dt>参照元</dt>
            <dd>{chapter.sourcePath}</dd>
          </div>
          <div>
            <dt>学習ゴール</dt>
            <dd>{chapter.learningGoals.length}件</dd>
          </div>
        </dl>
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
    </article>
  );
}

export function ReferencePage({ onBack, focusChapterId = null }: Props) {
  const chapterLabel = REFERENCE_DATA.map((chapter) => chapter.id).join(' / ');

  useEffect(() => {
    if (!focusChapterId) return;
    const section = document.getElementById(`reference-${focusChapterId}`);
    const heading = section?.querySelector<HTMLElement>('.reference-page__chapter-title');
    section?.scrollIntoView?.({ block: 'start' });
    heading?.focus();
  }, [focusChapterId]);

  return (
    <div className="container reference-page">
      <header className="reference-page__header">
        <button
          type="button"
          className="reference-page__back"
          onClick={onBack}
          aria-label="ホームに戻る"
        >
          ← ホームに戻る
        </button>
        <p className="reference-page__eyebrow">解説リファレンス</p>
        <h1 className="reference-page__title">{chapterLabel} 解説リファレンス</h1>
        <p className="reference-page__lead">
          基礎（chapter01 /
          chapter02）に加え、優先順位づけ（chapter05）とパターン分類（chapter08）を
          1画面で往復できるようにした。
        </p>
      </header>

      <nav className="reference-page__chapter-nav" aria-label="章スキップ">
        {REFERENCE_DATA.map((chapter) => {
          const isCurrent = focusChapterId === chapter.id;
          return (
            <a
              key={chapter.id}
              href={`#/reference/${chapter.id}`}
              className="reference-page__chapter-link"
              aria-current={isCurrent ? 'page' : undefined}
            >
              {chapter.id}：{chapter.title}
            </a>
          );
        })}
      </nav>

      <main className="reference-page__main">
        {REFERENCE_DATA.map((chapter) => renderChapter(chapter))}
      </main>
    </div>
  );
}
