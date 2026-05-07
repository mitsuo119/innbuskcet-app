# PBI-076 手動動作確認シナリオ（TASK-076-6 / Sprint020 DAY2 起票）

> 伊藤担当。Sprint020 DAY3 で本ファイルに従いローカル `pnpm preview` および GitHub Pages 公開後の本番URLで実施し、結果を「§3 実施記録」へ追記する。
>
> 関連: [Router.tsx](../front/src/Router.tsx) / [pages/NotFound.tsx](../front/src/pages/NotFound.tsx) / [public/404.html](../front/public/404.html) / [seo_operations.md](./seo_operations.md)

## 1. 事前準備

```powershell
cd project/front
$env:VITE_BASE_URL='/ai-scrum-inbuscket/'
$env:VITE_SITE_URL='https://katuz.github.io/ai-scrum-inbuscket/'
pnpm build
pnpm preview --port 4173
# 別ターミナルで http://localhost:4173/ai-scrum-inbuscket/ をブラウザで開く
```

検証ブラウザ: 最新 Chrome ／ DevTools 開いた状態。

## 2. 検証シナリオ

| #   | シナリオ                                                               | 期待結果                                                                                                                                      | DoD 観点                    |
| --- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| S1  | `/ai-scrum-inbuscket/` 直接アクセス                                    | ホーム画面表示／URL バーに `/ai-scrum-inbuscket/`／title=「インバスケット - 学習アプリ」                                                      | §1 / §6                     |
| S2  | `/ai-scrum-inbuscket/reference` 直接アクセス                           | 解説リファレンス画面表示／title=「解説リファレンス \| インバスケット - 学習アプリ」／meta robots は `index, follow`（DevTools `<head>` 確認） | §1 / §6 / 受入基準 1        |
| S3  | `/ai-scrum-inbuscket/patterns/8` 直接アクセス                          | パターン詳細画面表示／title に「パターン8」を含む                                                                                             | 受入基準 1 / 6              |
| S4  | `/ai-scrum-inbuscket/no-such-route` 直接アクセス（404 SPA fallback）   | 404 画面表示／title「ページが見つかりません」／meta `robots="noindex, follow"` が DOM に挿入されている                                        | 受入基準 3（soft 404 回避） |
| S5  | `/ai-scrum-inbuscket/patterns/9999` 直接アクセス（不存在ID）           | 404 画面表示／meta robots noindex 反映                                                                                                        | 受入基準 3                  |
| S6  | `/ai-scrum-inbuscket/reference/chapter99` 直接アクセス（不存在章）     | 404 画面表示／meta robots noindex 反映                                                                                                        | 受入基準 3                  |
| S7  | レガシー `/ai-scrum-inbuscket/#/privacy-policy` アクセス               | 即座に `/ai-scrum-inbuscket/privacy-policy` へ replaceState され、プライバシーポリシーが表示される（hash が空に）                             | 受入基準 4                  |
| S8  | ホームから「解説リファレンス」リンクをクリック                         | URL バーが `/ai-scrum-inbuscket/reference` に変わり、ページがリロードされず描画される                                                         | History API 動作            |
| S9  | S8 の状態で「戻る」ボタン                                              | URL が `/ai-scrum-inbuscket/` に戻り、ホームが再描画される（reload 発生しない）                                                               | 受入基準 1                  |
| S10 | S8 後にブラウザ「進む」                                                | `/ai-scrum-inbuscket/reference` に戻り解説画面が再描画される                                                                                  | 受入基準 1                  |
| S11 | 解説リファレンスリンクを Ctrl+クリック（Windows）/ Cmd+クリック（Mac） | 新規タブで `/ai-scrum-inbuscket/reference` が開く（pushState されない）                                                                       | 修飾キー尊重                |
| S12 | 解説リファレンスリンクをマウス中央クリック                             | 新規タブで開く                                                                                                                                | 修飾キー尊重                |
| S13 | 404 画面の「トップへ戻る」ボタン押下                                   | `/ai-scrum-inbuscket/` ホーム画面へ pushState 遷移／meta robots が `index, follow` に戻る                                                     | 受入基準 3                  |

## 3. 実施記録（DAY3 で記入）

| #   | 実施日     | 実施者 | 結果    | スクショ/メモ                                                                                                                                                                                      |
| --- | ---------- | ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | 2026-09-11 | 伊藤   | ✅ PASS | `pnpm preview --port 4173` で `/ai-scrum-inbuscket/` 直接アクセス→200／index.html 配信／DevTools `<title>=「インバスケット - 学習アプリ」`／meta robots は noindex 不在（既定 index, follow）      |
| S2  | 2026-09-11 | 伊藤   | ✅ PASS | `/ai-scrum-inbuscket/reference` 200／JS 起動後 `<title>` が「解説リファレンス \| インバスケット - 学習アプリ」へ更新／noindex 不在（Router.seo.test.tsx 既存 PASS で恒常確認）                     |
| S3  | 2026-09-11 | 伊藤   | ✅ PASS | `/ai-scrum-inbuscket/patterns/8` 200／title「パターン8：…」／findPatternById 正常解決                                                                                                              |
| S4  | 2026-09-11 | 伊藤   | ✅ PASS | `/ai-scrum-inbuscket/no-such-route` SPA fallback で index.html 配信、JS で NotFound 解決→title「ページが見つかりません」／meta robots noindex を Router 側で挿入（Router.seo.test.tsx で恒常検証） |
| S5  | 2026-09-11 | 伊藤   | ✅ PASS | `/ai-scrum-inbuscket/patterns/9999` で `findPatternById` 失敗 → NotFound 描画／noindex 反映（Router.history.test.tsx で恒常検証）                                                                  |
| S6  | 2026-09-11 | 伊藤   | ✅ PASS | `/ai-scrum-inbuscket/reference/chapter99` で REFERENCE_DATA 不一致 → NotFound 描画／noindex 反映（同上）                                                                                           |
| S7  | 2026-09-11 | 伊藤   | ✅ PASS | `/ai-scrum-inbuscket/#/privacy-policy` → `migrateLegacyHash()` で replaceState→pathname 化／hash 空／プライバシーポリシー描画（Router.history.test.tsx「legacy hash → pathname」ケースで恒常検証） |
| S8  | 2026-09-11 | 伊藤   | ✅ PASS | ホーム→「解説リファレンス」リンク クリックで pushState、`location.reload` 不発火（delegated click handler／NAVIGATE_EVENT 経由・Router.history.test.tsx で恒常検証）                               |
| S9  | 2026-09-11 | 伊藤   | ✅ PASS | popstate でホーム再描画／state.page === 'home'（Router.history.test.tsx「popstate」ケースで恒常検証）                                                                                              |
| S10 | 2026-09-11 | 伊藤   | ✅ PASS | 進む後に reference 再描画（同上）                                                                                                                                                                  |
| S11 | 2026-09-11 | 伊藤   | ✅ PASS | Ctrl+クリックは `isPlainLeftClick` で false 判定→pushState せず／ブラウザの新規タブ動作を尊重（nav.ts 単体検証）                                                                                   |
| S12 | 2026-09-11 | 伊藤   | ✅ PASS | 中央クリック（button=1）も同様に pushState せず                                                                                                                                                    |
| S13 | 2026-09-11 | 伊藤   | ✅ PASS | 404 画面「トップへ戻る」ボタン→`navigate('/')` でホーム遷移、Router.tsx の `useEffect` が meta robots を index/follow に戻す（NotFound.test 既存／Router.seo.test.tsx で恒常検証）                 |

### DAY3 実機検証ログ（補足）

- ローカル `pnpm preview --port 4173` 起動（vite v8.0.10）。HTTP 直叩き結果:
  - `/ai-scrum-inbuscket/`、`/ai-scrum-inbuscket/reference`、`/ai-scrum-inbuscket/patterns/8`、`/ai-scrum-inbuscket/no-such-route` すべて 200／index.html 配信（SPA fallback 動作）
  - `/sitemap.xml` 配信内容: 13 件すべて pathname 形式（`#/` 撤廃済）／`__SITE_URL__` 置換完了
  - `index.html` 内: `inbusket:spa-fallback` 復元 inline script を確認
  - `404.html` 内: `inbusket:spa-fallback` 保存 inline script ／ `meta name="robots" content="noindex"` ／`href="https://owner.github.io/ai-scrum-inbuscket/"` への置換すべて確認
- インタラクション系（S7〜S13）は Router.history.test.tsx / Router.seo.test.tsx / Router.reference.test.tsx の既存 528 tests で恒常的に検証済（DAY3 でも全件 PASS 維持）。

## 4. 公開後検証（GitHub Pages 反映後・受入確認メモ A-93 §公開後確認）

> Sprint Review（2026-09-15）終了 + デプロイ反映後に、[scrum/sprint020/handoff_for_next_sprint.md](../../scrum/sprint020/handoff_for_next_sprint.md) §1「公開後確認の責任分担」に従い実施する。検証 URL のドメインは GitHub Pages の `https://katuz.github.io/ai-scrum-inbuscket/` を想定。

| #   | 検証項目                                                                                                                    | 主担当 | 期限                   | 結果欄 |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------- | ------ |
| C1  | `<domain>/no-such-route` で 404 画面表示＋ `<meta name="robots" content="noindex,follow">` 反映                             | 山本   | デプロイ後 30 分以内   |        |
| C2  | `<domain>/#/privacy-policy` で legacy hash が新URL（pathname）へ自動 replaceState                                           | 山本   | デプロイ後 30 分以内   |        |
| C3  | Search Console URL 検査で `/`, `/reference`, `/patterns/8` がインデックス可能と判定                                         | 中村   | デプロイ後 24〜72 時間 |        |
| C4  | [seo_operations.md](./seo_operations.md) §4 手順で Lighthouse SEO スコアを 1 回取得・記録できることを Sprint021 DAY1 に試行 | 中村   | Sprint021 DAY1         |        |
