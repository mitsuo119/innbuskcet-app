import type { HistoryItem } from '../domain/history';
import { MAX_HISTORY } from '../domain/history';

interface Props {
  history: readonly HistoryItem[];
}

const judgementLabel = (j: HistoryItem['judgement']): string => (j === 'correct' ? '○' : '×');

const judgementAria = (j: HistoryItem['judgement']): string =>
  j === 'correct' ? '正解' : '不正解';

/**
 * 直近10問の正誤履歴（PBI-016）。
 * - 新しい回答ほど右に並ぶ（時系列・末尾が最新）
 * - 各セルは ○/× ＋ 正解優先度（A/B/C）を表示
 * - aria-live="polite" によりスクリーンリーダで読み上げ可能
 * - モバイル幅でも視認できるよう flex-wrap で折り返す
 * - 履歴 0 件時はガイド文を表示（カウンタとレイアウト両立）
 */
export function HistoryView({ history }: Props) {
  return (
    <section className="history-view" aria-label={`直近${MAX_HISTORY}問の正誤履歴`}>
      <h2 className="history-view__title">直近{MAX_HISTORY}問の履歴</h2>
      <ol className="history-view__list" aria-live="polite" aria-relevant="additions">
        {history.length === 0 ? (
          <li className="history-view__empty">まだ履歴はありません</li>
        ) : (
          history.map((item, index) => (
            <li
              key={`${item.caseId}-${index}`}
              className={
                'history-view__item ' +
                (item.judgement === 'correct'
                  ? 'history-view__item--correct'
                  : 'history-view__item--incorrect')
              }
              aria-label={`${index + 1}問目 ${judgementAria(item.judgement)} 正解優先度${item.correctPriority}`}
            >
              <span className="history-view__mark" aria-hidden="true">
                {judgementLabel(item.judgement)}
              </span>
              <span className="history-view__priority" aria-hidden="true">
                {item.correctPriority}
              </span>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
