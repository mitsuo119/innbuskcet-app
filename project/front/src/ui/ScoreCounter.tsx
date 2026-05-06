import type { FilterMode } from '../domain/random';
import type { LearningStyle } from '../domain/learningStyle';
import { LEARNING_STYLE_LABELS } from '../domain/learningStyleLabel';
import type { LearningStyleScores, ModeScores, Score } from '../domain/score';
import { ratePercent } from '../domain/score';

interface Props {
  /** 全体スコア（互換維持・常時表示） */
  score: Score;
  /**
   * モード別スコア（PBI-021）。指定された場合は現在モードに応じた表示を行う。
   * 未指定の場合は従来どおり全体スコアのみ表示（後方互換）。
   */
  modeScores?: ModeScores;
  /** 現在の出題モード（PBI-021）。modeScores と併用 */
  currentMode?: FilterMode;
  /**
   * 学習スタイル別スコア（PBI-037 / TASK-015）。指定時は currentStyle のサマリを併記。
   */
  learningStyleScores?: LearningStyleScores;
  /** 現在の学習スタイル（PBI-037）。learningStyleScores と併用 */
  currentStyle?: LearningStyle;
  /**
   * 直近N件ローリング正答率（PBI-031）。
   * - Score: 直近 rollingN 件の集計結果
   * - null: 件数不足（安全表示: `-/- (--%)`）
   * - undefined: 表示しない（Exam モード等）
   */
  rollingScore?: Score | null;
  /** ローリング集計件数 N（デフォルト 10） */
  rollingN?: number;
}

const MODE_LABEL: Record<FilterMode, string> = {
  all: '全件',
  A: 'A問題',
  B: 'B問題',
  C: 'C問題',
};

function formatRate(score: Score): string {
  const r = ratePercent(score);
  return r === null ? '-' : `${r}%`;
}

/**
 * セッション内の正答/出題カウンタ表示（PBI-013 / PBI-021）。
 * - 全件モード: 総合正答率のみ
 * - A/B/C モード: 当該モードの「正答数/出題数(正答率%)」を表示
 * - aria-live="polite" で SR にも通知（DoD §9）
 */
export function ScoreCounter({
  score,
  modeScores,
  currentMode,
  learningStyleScores,
  currentStyle,
  rollingScore,
  rollingN = 10,
}: Props) {
  // 拡張プロパティ（modeScores + currentMode）が両方揃った場合のみモード別表示
  const showMode = modeScores !== undefined && currentMode !== undefined;
  const target: Score = showMode ? modeScores![currentMode!] : score;
  const modeLabel = showMode ? MODE_LABEL[currentMode!] : null;

  // 学習スタイル別表示（PBI-037 / TASK-015）
  const showStyle = learningStyleScores !== undefined && currentStyle !== undefined;
  const styleTarget: Score | null = showStyle ? learningStyleScores![currentStyle!] : null;
  const styleLabel = showStyle ? LEARNING_STYLE_LABELS[currentStyle!].label : null;

  const ariaLabelBase = showMode
    ? `${modeLabel} 正答 ${target.correct} / 出題 ${target.total}（正答率 ${formatRate(target)}）`
    : '正答数 / 出題数';
  const ariaLabel =
    showStyle && styleTarget
      ? `${ariaLabelBase}。${styleLabel}モード 正答 ${styleTarget.correct} / 出題 ${styleTarget.total}（正答率 ${formatRate(styleTarget)}）`
      : ariaLabelBase;

  // ローリング正答率テキスト（PBI-031）
  const rollingAriaText =
    rollingScore === undefined
      ? ''
      : rollingScore === null
        ? `直近${rollingN}問の正答率 集計中`
        : `直近${rollingN}問 正答${rollingScore.correct}/${rollingScore.total}（${formatRate(rollingScore)}）`;

  return (
    <div className="score-counter" aria-live="polite" aria-label={`${ariaLabel}${rollingAriaText ? '。' + rollingAriaText : ''}`}>
      {showMode && (
        <span className="score-counter__mode" aria-hidden="true">
          {modeLabel}
        </span>
      )}
      <span className="score-counter__label">正答 / 出題</span>
      <span className="score-counter__value">
        <strong>{target.correct}</strong>
        <span className="score-counter__sep"> / </span>
        <strong>{target.total}</strong>
      </span>
      {showMode && (
        <span className="score-counter__rate" aria-hidden="true">
          ({formatRate(target)})
        </span>
      )}
      {showStyle && styleTarget && (
        <span
          className="score-counter__style"
          aria-hidden="true"
          title={`${styleLabel}モードの正答率（強調）`}
        >
          <span className="score-counter__style-label">{styleLabel}</span>
          <strong>{styleTarget.correct}</strong>
          <span className="score-counter__sep">/</span>
          <strong>{styleTarget.total}</strong>
          <span className="score-counter__rate">({formatRate(styleTarget)})</span>
        </span>
      )}
      {rollingScore !== undefined && (
        <span className="score-counter__rolling" aria-hidden="true">
          <span className="score-counter__rolling-label">直近{rollingN}問</span>
          {rollingScore === null ? (
            <span>-/-&nbsp;(--%)</span>
          ) : (
            <>
              <strong>{rollingScore.correct}</strong>
              <span className="score-counter__sep">/</span>
              <strong>{rollingScore.total}</strong>
              <span className="score-counter__rate">({formatRate(rollingScore)}%)</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}
