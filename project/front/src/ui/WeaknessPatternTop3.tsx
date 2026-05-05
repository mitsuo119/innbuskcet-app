import type { HistoryItem } from '../domain/history';
import {
  aggregateByPattern,
  selectWeaknessTop3,
  type PatternStat,
} from '../domain/patternWeakness';

interface Props {
  /** セッション内の回答履歴（全件） */
  history: readonly HistoryItem[];
}

/**
 * PBI-026: パターン別弱点分析 Top3 表示コンポーネント（TASK-262・TASK-263）。
 *
 * - セッション内の回答履歴をchapter08の20パターンで集計し、誤答率上位3パターンを表示する。
 * - 出題が少ないパターン（信頼度低）は警告アイコン付きで表示する。
 * - PBI-025（6軸レーダー）が"スキル軸の自己採点"であるのに対し、
 *   本コンポーネントは"問題種別ごとの客観集計"を担う（役割分担）。
 * - 3問以上回答済みのときに表示（呼び出し元で制御）。
 */
export function WeaknessPatternTop3({ history }: Props) {
  const stats = aggregateByPattern(history);
  const top3 = selectWeaknessTop3(stats);

  if (top3.length === 0) {
    return null;
  }

  return (
    <section className="weakness-pattern" aria-label="パターン別弱点分析 Top3" aria-live="polite">
      <h3 className="weakness-pattern__title">
        パターン別弱点 Top3
        <span className="weakness-pattern__subtitle">（問題種別ごとの誤答率）</span>
      </h3>
      <p className="weakness-pattern__desc">
        6軸自己採点がスキル軸の振り返りなのに対し、こちらは問題パターン別の客観集計です。
      </p>
      <ol className="weakness-pattern__list" aria-label="弱点パターンランキング">
        {top3.map((stat, index) => (
          <PatternStatItem key={stat.patternId} rank={index + 1} stat={stat} />
        ))}
      </ol>
    </section>
  );
}

interface PatternStatItemProps {
  rank: number;
  stat: PatternStat;
}

function PatternStatItem({ rank, stat }: PatternStatItemProps) {
  const errorPercent = Math.round(stat.errorRate * 100);
  // 弱点度合いを3段階で分類
  const weaknessLevel = stat.errorRate >= 0.7 ? 'high' : stat.errorRate >= 0.4 ? 'medium' : 'low';

  const weaknessLabel =
    weaknessLevel === 'high' ? '要注意' : weaknessLevel === 'medium' ? '注意' : '良好';

  return (
    <li
      className={`weakness-pattern__item weakness-pattern__item--${weaknessLevel}`}
      aria-label={`第${rank}位: ${stat.patternName}, 誤答率${errorPercent}%, 回答数${stat.total}問`}
    >
      <div className="weakness-pattern__rank" aria-hidden="true">
        {rank}
      </div>
      <div className="weakness-pattern__info">
        <div className="weakness-pattern__name">
          {stat.patternName}
          {stat.lowReliability && (
            <span
              className="weakness-pattern__low-reliability"
              title="出題数が少ないため信頼度が低い"
              aria-label="（出題数が少ないため信頼度が低い）"
            >
              ⚠ 参考値
            </span>
          )}
        </div>
        <div className="weakness-pattern__stats">
          <span className="weakness-pattern__count">
            {stat.total}問中{stat.incorrect}問誤答
          </span>
          {/* バー表示（視覚的な誤答率表現） */}
          <div
            className="weakness-pattern__bar-wrap"
            role="img"
            aria-label={`誤答率${errorPercent}%`}
          >
            <div
              className={`weakness-pattern__bar weakness-pattern__bar--${weaknessLevel}`}
              style={{ width: `${errorPercent}%` }}
            />
          </div>
          <span
            className={`weakness-pattern__badge weakness-pattern__badge--${weaknessLevel}`}
            aria-hidden="true"
          >
            {errorPercent}% {weaknessLabel}
          </span>
        </div>
      </div>
    </li>
  );
}
