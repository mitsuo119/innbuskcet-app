import { useEffect, useRef } from 'react';
import { shouldShowAds, type AdPageMeta } from './adPolicy';

/**
 * Google AdSense の広告枠（PBI-050 / TASK-201）。
 *
 * ## 仕様
 * - `ins.adsbygoogle` 要素を 1 つレンダリングし、`data-ad-client` / `data-ad-slot` を付与する。
 * - 必要な ID（`clientId` props または環境変数 `VITE_ADSENSE_CLIENT_ID`、
 *   および `slotId` props または `VITE_ADSENSE_SLOT_ID`）が**1 つでも欠ける場合は何もレンダリングしない**。
 *   これにより未審査・ローカル開発・E2E 環境で安全にフォールバックする（DoD §10-1）。
 * - `useEffect` 内で `window.adsbygoogle.push({})` を **1 回だけ** 実行する。
 *   AdSense ローダー（`adsbygoogle.js`）の挿入は本コンポーネントの責務外
 *   （`index.html` 側で `VITE_ADSENSE_CLIENT_ID` 経由で本番ビルド時のみ注入する / TASK-202）。
 * - SSR は採用しない（Vite + CSR のみ）。
 *
 * ## セキュリティ
 * - AdSense の client / slot ID は**ハードコードしない**。`.env` / GitHub Secrets 経由のみ受け付ける（DoD §5-2）。
 * - `dangerouslySetInnerHTML` は使用しない（DoD §10-2）。
 *   data 属性は React の JSX 経由で設定し、属性値は文字列として安全にエスケープされる。
 * - `push({})` は AdSense 公式が公開している API 呼び出しのみ。任意のスクリプト文字列は実行しない。
 * - ローダー未読込時（`window.adsbygoogle` が undefined）は配列を初期化して enqueue する公式パターンに従う。
 */
export interface AdSlotProps {
  /** AdSense パブリッシャ ID。未指定時は `import.meta.env.VITE_ADSENSE_CLIENT_ID` を参照。 */
  clientId?: string;
  /** AdSense 広告ユニットの slot ID。未指定時は `import.meta.env.VITE_ADSENSE_SLOT_ID` を参照。 */
  slotId?: string;
  /** 広告フォーマット（既定: `auto`）。 */
  format?: string;
  /** レスポンシブ広告フラグ（既定: true）。 */
  responsive?: boolean;
  /** スクリーンリーダ向けラベル（既定: `広告`）。 */
  label?: string;
  /** 追加 className（マージン・罫線等のレイアウトは TASK-204 で配置側 CSS から付与）。 */
  className?: string;
  /**
   * 広告配置ポリシー（PBI-100 / TASK-100-2）入力メタ。
   * 指定時は `shouldShowAds(pageMeta)` が false の場合に何もレンダリングしない。
   * 省略時は従来通り（環境変数フォールバックのみ）。
   */
  pageMeta?: AdPageMeta;
}

// `window.adsbygoogle` のグローバル拡張（AdSense 公式仕様：未定義時は配列として push）。
declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

/** 環境変数からの ID 取得（未設定や空文字は undefined 扱い）。 */
function readEnv(name: 'VITE_ADSENSE_CLIENT_ID' | 'VITE_ADSENSE_SLOT_ID'): string | undefined {
  // Vite は `import.meta.env` を静的に展開する。test では vi.stubEnv で差替可能。
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const v = env?.[name];
  return v && v.length > 0 ? v : undefined;
}

export function AdSlot(props: AdSlotProps) {
  const {
    clientId = readEnv('VITE_ADSENSE_CLIENT_ID'),
    slotId = readEnv('VITE_ADSENSE_SLOT_ID'),
    format = 'auto',
    responsive = true,
    label = '広告',
    className,
    pageMeta,
  } = props;

  // 同一マウント内で push を 1 回に限定するためのフラグ（StrictMode 二重発火対策）。
  const pushedRef = useRef(false);

  // 広告配置ポリシー判定（PBI-100）: pageMeta 指定時のみ評価し、不適なら表示しない。
  const allowedByPolicy = pageMeta ? shouldShowAds(pageMeta) : true;

  useEffect(() => {
    if (!allowedByPolicy) return;
    if (!clientId || !slotId) return;
    if (pushedRef.current) return;
    pushedRef.current = true;

    try {
      // AdSense ローダー未読込時もキューに積めるよう、配列を初期化してから push する公式パターン。
      window.adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle.push({});
    } catch {
      // 広告配信エラーで本体機能を停止させない（学習アプリの可用性を最優先 / DoD §10-1）。
    }
  }, [allowedByPolicy, clientId, slotId]);

  // 配置ポリシー違反または未設定時は安全フォールバックとして何もレンダリングしない。
  if (!allowedByPolicy) return null;
  if (!clientId || !slotId) {
    return null;
  }

  return (
    <ins
      className={['adsbygoogle', className].filter(Boolean).join(' ')}
      style={{ display: 'block' }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
      role="complementary"
      aria-label={label}
    />
  );
}
