import {
  SELF_SCORE_AXES,
  AXIS_META,
  aggregateSelfScores,
  findWeakestAxis,
  SELF_SCORE_MAX,
  type SelfScoreHistory,
  type SelfScoreAxis,
} from '../domain/selfScore';

interface Props {
  /** セッション内の自己採点履歴 */
  history: SelfScoreHistory;
}

/** SVGビューボックスの中心・半径 */
const CX = 160;
const CY = 160;
const OUTER_RADIUS = 120;
const INNER_LEVELS = 4; // 同心多角形の本数（除く最外）

/**
 * 軸インデックス・スコア値から SVG 座標を計算する。
 * - 0番軸を上（-90°）から始め、時計回りに等間隔配置
 */
function polarToXY(axisIndex: number, score: number): { x: number; y: number } {
  const angle = (-90 + (axisIndex * 360) / SELF_SCORE_AXES.length) * (Math.PI / 180);
  const radius = (score / SELF_SCORE_MAX) * OUTER_RADIUS;
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  };
}

/** 外周座標（スコア=最大値）を返す */
function outerPoint(axisIndex: number): { x: number; y: number } {
  return polarToXY(axisIndex, SELF_SCORE_MAX);
}

/** ラベル配置座標（外周より外側）を返す */
function labelPoint(axisIndex: number): { x: number; y: number } {
  const angle = (-90 + (axisIndex * 360) / SELF_SCORE_AXES.length) * (Math.PI / 180);
  const labelRadius = OUTER_RADIUS + 22;
  return {
    x: CX + labelRadius * Math.cos(angle),
    y: CY + labelRadius * Math.sin(angle),
  };
}

/** ポリゴン座標文字列に変換 */
function pointsString(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

/** 同心多角形のポリゴン座標文字列（スコア level に対応） */
function gridPolygonPoints(level: number): string {
  const score = (SELF_SCORE_MAX * level) / (INNER_LEVELS + 1);
  return pointsString(SELF_SCORE_AXES.map((_, i) => polarToXY(i, score)));
}

/** スコアポリゴンの座標文字列 */
function scorePolygonPoints(averages: Record<SelfScoreAxis, number>): string {
  return pointsString(SELF_SCORE_AXES.map((axis, i) => polarToXY(i, averages[axis])));
}

/**
 * PBI-025: SVG手書きベースのレーダーチャートコンポーネント（TASK-253）
 *
 * - 外部ライブラリ不使用（手書きSVG）
 * - 6軸の平均スコアをレーダーチャートで可視化
 * - 最低軸を赤強調し改善提案メッセージを表示（TASK-254）
 * - テキスト代替を aria-label で提供（DoD §9-3）
 */
export function RadarChart({ history }: Props) {
  const averages = aggregateSelfScores(history);
  if (!averages) return null;

  const weakest = findWeakestAxis(averages);
  const weakestMeta = AXIS_META[weakest];
  const weakestScore = averages[weakest].toFixed(1);

  // スクリーンリーダー向けサマリテキスト（DoD §9-3）
  const ariaDescription = SELF_SCORE_AXES.map(
    (axis) => `${AXIS_META[axis].label}: ${averages[axis].toFixed(1)}点`,
  ).join(', ');

  return (
    <section className="radar-chart" aria-label="6軸自己採点レーダーチャート">
      {/* スクリーンリーダー向け数値テキスト（視覚非表示） */}
      <p className="radar-chart__sr-only" aria-label={`採点サマリ: ${ariaDescription}`}>
        {SELF_SCORE_AXES.map((axis) => (
          <span key={axis}>
            {AXIS_META[axis].label}: {averages[axis].toFixed(1)}点{' '}
          </span>
        ))}
      </p>

      <h3 className="radar-chart__title">スキル分析（{history.length}問分の平均）</h3>

      <div className="radar-chart__container">
        <svg
          viewBox="0 0 320 320"
          width="320"
          height="320"
          className="radar-chart__svg"
          role="img"
          aria-label={`レーダーチャート: ${ariaDescription}`}
          aria-hidden="false"
        >
          {/* === グリッド（同心多角形） === */}
          {Array.from({ length: INNER_LEVELS }, (_, i) => i + 1).map((level) => (
            <polygon
              key={`grid-${level}`}
              className="radar-chart__grid"
              points={gridPolygonPoints(level)}
            />
          ))}

          {/* 最外グリッド */}
          <polygon
            className="radar-chart__grid radar-chart__grid--outer"
            points={pointsString(SELF_SCORE_AXES.map((_, i) => outerPoint(i)))}
          />

          {/* === 軸線 === */}
          {SELF_SCORE_AXES.map((_, i) => {
            const outer = outerPoint(i);
            return (
              <line
                key={`axis-${i}`}
                className="radar-chart__axis-line"
                x1={CX}
                y1={CY}
                x2={outer.x}
                y2={outer.y}
              />
            );
          })}

          {/* === スコアポリゴン === */}
          <polygon className="radar-chart__score" points={scorePolygonPoints(averages)} />

          {/* === スコアの頂点ドット === */}
          {SELF_SCORE_AXES.map((axis, i) => {
            const pt = polarToXY(i, averages[axis]);
            const isWeak = axis === weakest;
            return (
              <circle
                key={`dot-${axis}`}
                className={'radar-chart__dot' + (isWeak ? ' radar-chart__dot--weak' : '')}
                cx={pt.x}
                cy={pt.y}
                r={isWeak ? 6 : 4}
                aria-label={`${AXIS_META[axis].label}: ${averages[axis].toFixed(1)}`}
              />
            );
          })}

          {/* === 軸ラベル === */}
          {SELF_SCORE_AXES.map((axis, i) => {
            const lp = labelPoint(i);
            const isWeak = axis === weakest;
            return (
              <text
                key={`label-${axis}`}
                className={'radar-chart__label' + (isWeak ? ' radar-chart__label--weak' : '')}
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {AXIS_META[axis].label}
              </text>
            );
          })}

          {/* === スコア数値（各軸ドット近傍） === */}
          {SELF_SCORE_AXES.map((axis, i) => {
            const pt = polarToXY(i, averages[axis]);
            const angle = (-90 + (i * 360) / SELF_SCORE_AXES.length) * (Math.PI / 180);
            const offsetX = pt.x + Math.cos(angle) * 12;
            const offsetY = pt.y + Math.sin(angle) * 12;
            return (
              <text
                key={`score-${axis}`}
                className="radar-chart__score-value"
                x={offsetX}
                y={offsetY}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {averages[axis].toFixed(1)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* === 最低軸の強調表示・改善提案（TASK-254） === */}
      <div className="radar-chart__weakness" aria-live="polite">
        <p className="radar-chart__weakness-title">
          ⚠ 改善ポイント:{' '}
          <strong className="radar-chart__weakness-axis">{weakestMeta.label}</strong>
          （平均 {weakestScore}点）
        </p>
        <p className="radar-chart__weakness-suggestion">{weakestMeta.suggestion}</p>
        <p className="radar-chart__weakness-ref">
          参考: <span className="radar-chart__chapter-ref">{weakestMeta.chapterRef}</span>
        </p>
      </div>
    </section>
  );
}
