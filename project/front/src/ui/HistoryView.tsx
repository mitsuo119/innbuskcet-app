import type { HistoryItem } from '../domain/history';
import { MAX_HISTORY } from '../domain/history';
import { PRIORITY_LABELS, formatPriorityLabel } from '../domain/priorityLabel';

interface Props {
  history: readonly HistoryItem[];
  /**
   * 表示する最大件数（PBI-020）。省略時は MAX_HISTORY(=10) と等価。
   * - 末尾（新しい側）から `maxDisplay` 件のみを表示する。
   * - 履歴配列のサイズ自体は呼び出し側（pushHistory の max 引数）で管理する。
   */
  maxDisplay?: number;
}

const judgementLabel = (j: HistoryItem['judgement']): string => (j === 'correct' ? '○' : '×');

const judgementAria = (j: HistoryItem['judgement']): string =>
  j === 'correct' ? '正解' : '不正解';

/**
 * 直近の正誤履歴（PBI-016 / PBI-020 / PBI-035）。
 * - 新しい回答ほど右に並ぶ（時系列・末尾が最新）
 * - 各セルは ○/× ＋ 正解優先度（A/B/C）＋ 記号（◎/○/△）を表示
 * - aria-label は `priorityLabel.ts` の意味文（最優先/中優先/低優先 + 即時着手すべき 等）を含めて読み上げる（PBI-035 / DoD §9-3）
 * - title 属性で意味文をホバー時に補足表示
 * - aria-live="polite" によりスクリーンリーダで読み上げ可能
 * - モバイル幅でも視認できるよう flex-wrap で折り返す
 * - 履歴 0 件時はガイド文を表示（カウンタとレイアウト両立）
 */
export function HistoryView({ history, maxDisplay = MAX_HISTORY }: Props) {
  const limit = Math.max(0, Math.floor(maxDisplay));
  const visible = history.length > limit ? history.slice(history.length - limit) : history;
  return (
    <section className="history-view" aria-label={`直近${limit}問の正誤履歴`}>
      <h2 className="history-view__title">直近{limit}問の履歴</h2>
      <ol className="history-view__list" aria-live="polite" aria-relevant="additions">
        {visible.length === 0 ? (
          <li className="history-view__empty">まだ履歴はありません</li>
        ) : (
          visible.map((item, index) => {
            const label = PRIORITY_LABELS[item.correctPriority];
            const priorityAria = formatPriorityLabel(item.correctPriority);
            const styleBadge =
              item.learningStyle === 'quick' ? 'Q' : item.learningStyle === 'deep' ? 'D' : null;
            const styleAria =
              item.learningStyle === 'quick'
                ? ' Quickモード'
                : item.learningStyle === 'deep'
                  ? ' Deepモード'
                  : '';
            return (
              <li
                key={`${item.caseId}-${index}`}
                className={
                  'history-view__item ' +
                  (item.judgement === 'correct'
                    ? 'history-view__item--correct'
                    : 'history-view__item--incorrect')
                }
                aria-label={`${index + 1}問目 ${judgementAria(item.judgement)} 正解優先度${priorityAria}${styleAria}`}
                title={`${judgementAria(item.judgement)} / 正解 ${priorityAria}${styleAria}`}
              >
                <span className="history-view__mark" aria-hidden="true">
                  {judgementLabel(item.judgement)}
                </span>
                <span className="history-view__priority" aria-hidden="true">
                  {item.correctPriority}
                  {label.symbol}
                </span>
                {styleBadge !== null && (
                  <span
                    className={`history-view__style history-view__style--${item.learningStyle}`}
                    aria-hidden="true"
                  >
                    [{styleBadge}]
                  </span>
                )}
              </li>
            );
          })
        )}
      </ol>
    </section>
  );
}
