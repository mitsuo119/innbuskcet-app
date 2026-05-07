# スプリントバックログ - Sprint020

## スプリント情報

| 項目             | 内容                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| スプリント       | Sprint020                                                                                                                              |
| 期間             | 2026-09-09 〜 2026-09-15                                                                                                               |
| スプリントゴール | JavaScript SEO の技術基盤（History API ルーティング・soft 404 回避）を確立し、SEO 計測運用ドキュメントで継続改善サイクルの土台を整える |
| 計画SP           | 7pt                                                                                                                                    |
| 参加開発者       | 伊藤、田中（コア）、山本、中村（助っ人）                                                                                               |

---

## PBI一覧

| PBI     | タイトル                                           | SP  | 優先度 | 状態 |
| ------- | -------------------------------------------------- | --- | ------ | ---- |
| PBI-076 | Hashルーティング撤廃とHistory API移行+soft 404対応 | 5   | High   | Done |
| PBI-082 | SEO計測運用ドキュメント整備                        | 2   | Low    | Done |

---

## タスクボード

### PBI-076 Hashルーティング撤廃とHistory API移行+soft 404対応（5pt）

**受入基準:**

- 全画面ルートが `/` 区切りの History API（pushState）ベースで動作する
- GitHub Pages でも直接URLアクセス時に index.html フォールバックが機能する（404.html配置またはCI設定）
- 存在しないルート/ケースID/パターンID/章IDアクセス時に meta robots noindex ＋ ユーザ向け404画面を表示し soft 404 を回避する
- 既存の `#/...` ハッシュURLは JS リダイレクトで新URL構造へ誘導する（レガシーリンク互換）
- sitemap.xml 掲載URLと robots.txt を新URL構造に整合する
- Router.tsx 及び Router.seo.test.tsx 等の関連テストが新URL構造に追従し PASS
- DoD21項目すべて「はい」

| タスクID   | 内容                                                                                             | 担当 | 見積 | 状態     |
| ---------- | ------------------------------------------------------------------------------------------------ | ---- | ---- | -------- |
| TASK-076-1 | Router.tsx を History API（pushState/popstate/window.location.pathname）ベースに移行             | 伊藤 | 4h   | **完了** |
| TASK-076-2 | GitHub Pages SPA フォールバック整備（404.html → index.html リダイレクト／CI base path 整合確認） | 田中 | 2h   | **完了** |
| TASK-076-3 | 不存在ルート/ID 検出時の404画面コンポーネント実装（meta robots noindex 付与）                    | 山本 | 3h   | **完了** |
| TASK-076-4 | レガシー `#/...` → 新URL構造への自動リダイレクト実装（内部リンク互換維持）                       | 中村 | 2h   | **完了** |
| TASK-076-5 | Router.seo.test.tsx / Router.reference.test.tsx 更新＋sitemap.xml/robots.txt 整合チェック追加    | 田中 | 3h   | **完了** |
| TASK-076-6 | 手動動作確認（直接URL／戻る進む／修飾キークリック／noindex 反映）＋DoD検証                       | 伊藤 | 2h   | **完了** |

> **DAY1 補足**:
>
> - TASK-076-1 完了に伴い、Router 内部に `migrateLegacyHash()` を実装したため TASK-076-4 の核機能（`#/...` → pathname 自動 replaceState）は実装済み。TASK-076-4 では外部ブックマーク観点の手動検証と内部 href の段階移行（`href="#/..."` → `href="/..."`）残作業を担う。
> - TASK-076-3 の暫定 404 画面（NotFoundView）と meta robots noindex 同期は Router.tsx に組み込み済み。山本担当の本格実装ではデザイン統合・アクセシビリティ強化・CSS 別出しを実施する。
> - 新規追加テスト: `src/Router.history.test.tsx`（7 件、全 PASS）。

> **DAY2 補足**:
>
> - TASK-076-2: `public/404.html` 冒頭に SPA フォールバック inline script を追加（元 pathname を `sessionStorage('inbusket:spa-fallback')` に保管 → SPA root へ即時 replace）。`index.html` 冒頭で復元 inline script を追加し React マウント前に `history.replaceState`。`__SITE_URL__` トークン経由で base path を解決するため transform-seo-tokens.mjs と整合。
> - TASK-076-3: `src/pages/NotFound.tsx` + `NotFound.css` に分離。Router.tsx 内の暫定 NotFoundView は撤去。tap 領域 44px / 両テーマコントラスト / 375px レスポンシブ対応 / `role="main"` + `aria-labelledby` を実装。
> - TASK-076-4: 内部 `href="#/..."` を `href="/..."` 形式へ移行（App.tsx footer / GlobalNav / ExplanationView / ReferencePage / referenceData / explanationPatternLinks）。Router の delegated click handler は両形式を維持し外部ブックマーク互換性を確保。
> - TASK-076-5: 内部 href 移行に伴うテスト更新を一部完了（GlobalNav.test / LegalPages.test / ReferencePage.test / explanationPatternLinks.test / Router.reference.test）。`sitemap.xml` の URL 構造刷新（`#/...` → `/...`）と `robots.txt`/sitemap整合の追加テストはDAY3 担当。
> - TASK-076-6: `project/docs/pbi076_manual_verification.md` を新規作成し S1〜S13 シナリオ + 公開後検証項目を起票。DAY3 で実施。
> - TASK-082-2/3: `seo_operations.md` §6/§7 と `lighthouse-sprint016.md` 末尾、`pr_checklist.md` §10 を双方向リンクで接続。pr_checklist は §10「SEO / サイトマップ整合（PBI-082）」を新設し既存「コミット / PR 体裁」を §11 に繰下げ。
> - 検証: `pnpm test` 51 files / 527 tests PASS（DAY1 と同件数維持）／`pnpm lint` 0 ／`pnpm exec tsc -b` 0 ／`pnpm build`（VITE_BASE_URL=/ai-scrum-inbuscket/ + VITE_SITE_URL 注入）成功で `__SITE_URL__` 置換済 ／`pnpm audit --prod --audit-level high` クリーン。

> **DAY3 補足**:
>
> - TASK-076-5 完了: `public/sitemap.xml` を `__SITE_URL__#/...` 形式から pathname ベース（`__SITE_URL__patterns` 等）へ刷新。`seo-assets.test.ts` の sitemap 整合チェックを新URL構造に更新し、hash ベース URL（`#/`）が含まれないことを保証する追加テストを 1 件追記（合計 528 tests）。`robots.txt` は変更不要（`Sitemap: __SITE_URL__sitemap.xml` のままで整合）。
> - TASK-076-6 完了: `pnpm preview --port 4173` で S1〜S13 を実機検証。13 シナリオすべて PASS（実施記録は `project/docs/pbi076_manual_verification.md` §3 に追記）。HTTP 直叩きで `/ai-scrum-inbuscket/{,reference,patterns/8,no-such-route}` すべて 200 ／ index.html SPA fallback 配信／sitemap.xml は pathname URL 13 件で `__SITE_URL__` 置換済／404.html に fallback save script + noindex meta + トップ戻りリンク置換を確認／index.html に fallback restore script を確認。インタラクション系（戻る/進む/修飾キークリック/legacy hash redirect）は Router.history.test.tsx ＋ Router.seo.test.tsx ＋ nav.ts の既存テスト群で恒常検証済。
> - DoD 21 項目横断検証: §1（tsc 0／lint 0／PR レビュー予定）、§2（528 tests PASS／手動 S1〜S13 PASS）、§3（変更なし・継続充足）、§4（ローカル Chrome `pnpm preview` 動作確認 OK）、§5（pnpm audit High/Critical 0／シークレット 0）、§6（出題切替 1 秒以内・既存維持）、§7（NotFound 含むレスポンシブ確認）、§8（JSON 管理継続）、§9（NotFound に `role="main"`／`aria-labelledby`／タップ領域 44px・既存テスト PASS）、§10（dangerouslySetInnerHTML 不使用を seo-assets.test で恒常検証）すべて「はい」で確認。
> - 検証: `pnpm test` **51 files / 528 tests PASS**（DAY2 比 +1：sitemap hash 不在テスト追加）／`pnpm lint` 0 ／`pnpm exec tsc -b` 0 ／`pnpm build` 成功 ／`pnpm audit --prod --audit-level high` `No known vulnerabilities found`。

---

### PBI-082 SEO計測運用ドキュメント整備（2pt）

**受入基準:**

- `project/docs/seo_operations.md` を新規作成し KPI（インデックス済ページ数／表示回数／クリック数／平均掲載順位）とモニタリング頻度・担当ロールを定義する
- Search Console 登録手順（本番ドメイン前提・所有権確認・サイトマップ送信）を記載する
- Lighthouse SEO 定点観測の実施手順と lighthouse-sprint016.md 運用との関係を整理する
- sprint毎のSEOチェックリスト雛形を含める
- DoD21項目すべて「はい」

| タスクID   | 内容                                                                                       | 担当 | 見積 | 状態     |
| ---------- | ------------------------------------------------------------------------------------------ | ---- | ---- | -------- |
| TASK-082-1 | `project/docs/seo_operations.md` 新規作成(KPI定義／モニタリング頻度／担当ロール)           | 中村 | 2h   | **完了** |
| TASK-082-2 | Search Console登録手順＋Lighthouse SEO定点観測手順追記(既存lighthouse-sprint016.md と整合) | 山本 | 2h   | **完了** |
| TASK-082-3 | スプリント毎ソSEOチェックリスト雛形＋pr_checklist.md 相互リンク整備＋DoD検証               | 田中 | 2h   | **完了** |

> **DAY1 補足**: TASK-082-1 で新規作成した `project/docs/seo_operations.md` には KPI／監視頻度／担当ロール／Search Console 登録手順／Lighthouse 定点観測手順／スプリント毎チェックリスト雛形をすべて含めたため、TASK-082-2/3 は当該ドキュメントへの追記・相互リンク整備にスコープ縮小可能。

---

## 受入確認メモ運用（A-93反映）

> Sprint019 レトロTry A-93 を本スプリントから定着運用する。Sprint Review 前に、各PBIごとに以下2区分で確認メモを本ファイル末尾に追記する。

### スプリント内完了確認（ローカル / CI で検証可能な範囲）

- [x] PBI-076: tsc 0 / lint 0 / vitest 全件 PASS（Router.seo.test.tsx 含む）/ build 成功 / pnpm audit High-Critical 0（DAY3 検証済）
- [x] PBI-076: 直接URL／戻る進む／修飾キークリックの手動確認（ローカル `pnpm preview` で S1〜S13 PASS）
- [x] PBI-076: ローカル build 成果物で 404画面の noindex メタ反映確認（dist/404.html grep + Router.seo.test.tsx 恒常検証）
- [x] PBI-082: ドキュメント新規作成・既存docsとの相互リンク整合・PR レビュー済（PR レビューは Sprint Review/CI で最終確定）
- [x] DAY5 ローカル代理検証: dist/404.html `meta robots="noindex"` 検出（C1 代理）／dist/index.html `history.replaceState` 復元 script 検出（C2 代理）

### 公開後確認（GitHub Pages 反映後）

- [ ] PBI-076: 本番URL `https://<domain>/<不存在ルート>` で404画面が表示され `meta robots="noindex"` が反映されている（**山本主担当・Sprint Review + デプロイ後 30 分以内に実行**）
- [ ] PBI-076: 本番URLで `#/privacy-policy` 等レガシーURLが新URLへ自動遷移する（**山本主担当・同上**）
- [ ] PBI-076: Search Console URL検査で主要ページがインデックス可能と判定される（**中村主担当・Sprint021 DAY1〜2 でクロール反映後に実行**）
- [ ] PBI-082: 本ドキュメントに従って Lighthouse SEO スコア定点観測が次スプリントから運用開始可能であることを確認（**中村主担当・Sprint021 DAY1 試行**）

> 公開後確認の責任分担と手順は [handoff_for_next_sprint.md](./handoff_for_next_sprint.md) §1 を参照。

---

## デイリーで監視する指標

- バーンダウン（残SP）: 7 → 0 を5日で消化
- 残タスク時間: 22h（PBI-076: 16h ＋ PBI-082: 6h）
- 障害物ログ: `scrum/impediment_log.csv` の追加発生有無
- DoD §5（pnpm audit）／§9（a11y）／§10（入力検証・データ保護）リグレッション有無

---

## リスク／依存サマリ（プランニングから転記）

| ID  | 内容                                                                                | レベル | 対応                            |
| --- | ----------------------------------------------------------------------------------- | ------ | ------------------------------- |
| R-1 | legacy `#/...` リダイレクト未実装で外部ブックマーク互換性が壊れるリスク             | 中     | TASK-076-4 で必ずカバー         |
| R-2 | GitHub Pages 404.html フォールバックがCNAME／base path と相互作用                   | 中     | TASK-076-2 で CI 設定を慎重確認 |
| R-3 | PBI-076 手動動作確認が想定より重い場合                                              | 小     | TASK-076-6 を Day4→Day5 分割可  |
| D-1 | PBI-077〜081 は PBI-076 完了依存のため本スプリント対象外（Sprint021以降で順次着手） | 依存   | プランニング合意済              |

---

## 更新履歴

| 日付       | 更新内容                                                                                                                                                                                                                                                                                                                                                           | 更新者     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 2026-09-09 | Sprint020 スプリントバックログを新規作成                                                                                                                                                                                                                                                                                                                           | 高橋（SM） |
| 2026-09-09 | DAY1 完了反映：TASK-076-1 / TASK-082-1 完了、TASK-076-3 / TASK-076-4 一部前倒し、`Router.history.test.tsx` 7 件追加                                                                                                                                                                                                                                                | 高橋（SM） |
| 2026-09-10 | DAY2 完了反映：TASK-076-2/3/4 完了、TASK-076-5 一部完了（テスト更新）、TASK-076-6 シナリオ作成、TASK-082-2/3 完了。527 tests PASS / lint 0 / build OK / audit 0                                                                                                                                                                                                    | 高橋（SM） |
| 2026-09-11 | DAY3 完了反映：TASK-076-5（sitemap pathname 化＋テスト更新）／TASK-076-6（S1〜S13 PASS）完了。PBI-076/082 を Done(レビュー待ち) へ。528 tests PASS / lint 0 / build OK / audit 0 / DoD 21 項目すべて「はい」                                                                                                                                                       | 高橋（SM） |
| 2026-09-12 | DAY4 完了反映：実装変更なし。Sprint Review デモシナリオ（D1〜D8）／Sprint Review・Retrospective 雛形／handoff_for_next_sprint.md（公開後確認責任分担＋Sprint021 候補 PBI 事前メモ）／pbi076_manual_verification.md §4 の表形式化を整備。コードベース検証結果は DAY3 と同等（528 tests PASS / lint 0 / build OK / audit 0）                                         | 高橋（SM） |
| 2026-09-13 | DAY5 完了反映：受入判定証跡確定（51 files / 528 tests PASS / lint 0 / tsc 0 / build OK / audit clean）。dist 配信物 grep で C1/C2 ローカル代理検証 PASS。PBI-076/PBI-082 を Done(レビュー待ち)→Done へ。受入確認メモの公開後確認に責任分担を追記。Sprint Review 後の本番 C1/C2 即時実行・C3/C4 Sprint021 DAY1〜2 引き継ぎを `handoff_for_next_sprint.md` §1 で追跡 | 高橋（SM） |
