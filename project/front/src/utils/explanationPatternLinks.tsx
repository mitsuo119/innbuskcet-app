import type { ReactNode } from 'react';
import { findPatternById } from '../data/patternData';

const PATTERN_REF_REGEX = /パターン\s*(\d{1,3})/g;

/**
 * explanation テキスト中の「パターンN」を PatternDetail へのリンクに変換する。
 * - dangerouslySetInnerHTML は使用しない
 * - patternData に存在するIDのみリンク化（未知IDはプレーンテキストのまま）
 */
export function renderExplanationWithPatternLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(PATTERN_REF_REGEX)) {
    const whole = match[0];
    const idText = match[1];
    const start = match.index ?? 0;
    const end = start + whole.length;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const patternId = Number.parseInt(idText, 10);
    if (Number.isFinite(patternId) && findPatternById(patternId)) {
      nodes.push(
        <a
          key={`pattern-link-${start}-${patternId}`}
          href={`#/patterns/${patternId}`}
          className="explanation__pattern-link"
          aria-label={`パターン${patternId}の詳細へ移動`}
        >
          {whole}
        </a>,
      );
    } else {
      nodes.push(whole);
    }

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
