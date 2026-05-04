# デイリースクラム記録 - Sprint 011

## 基本情報

| 項目           | 内容                                       |
| -------------- | ------------------------------------------ |
| スプリント番号 | Sprint 011                                 |
| 期間           | 2026-07-08（水）〜 2026-07-14（火）        |
| 参加者         | 伊藤・田中・山本（助っ人）・中村（助っ人） |
| SM / PO        | 高橋 / 鈴木                                |

> 15 分のタイムボックスで、スプリントゴールに向けた進捗と障害物を毎日検査し適応する。

---

## Day1（2026-07-08）

### スプリントゴールへの進捗確認

PBI-049 の公開URL基盤（`base` 切替・SPA 404 フォールバック・GitHub Actions deploy ワークフロー）を Day1 で着地。Day1 計画上限 3pt に対し PBI-049 中核（3pt 内 2.5pt 相当）完了。残 TASK-101（ADR）・TASK-105/106（PR ゲート / 権限最小化）・TASK-107（公開URL動線）は Day2 で巻取。

### 各メンバーの報告

**伊藤**

- 昨日：Sprint011 プランニング合意。
- 今日：PBI-049 TASK-102（`vite.config.ts` の `base`）／ TASK-103（SPA 404 フォールバック）／ TASK-104（deploy ワークフロー初版）を実装。
- 完了：
  - TASK-102: `VITE_BASE_URL` 環境変数で `base` を切替（未指定時は `/`）。`@types/node` 追加せず最小型宣言（`declare const process`）で対応。dev/test は `/`、本番 CI で `/ai-scrum-inbuscket/` を注入する設計。
  - TASK-103: `project/front/scripts/copy-404.mjs` を新設し、`pnpm build` 末尾で `dist/index.html` → `dist/404.html` をコピー。`package.json` の `build` スクリプトを `tsc -b && vite build && node scripts/copy-404.mjs` に更新。ESLint 設定に `scripts/**` 用の Node グローバル許可ブロック追加。
  - TASK-104: `.github/workflows/deploy.yml` 初版を作成。push to main で `verify`（lint/tsc/vitest）→ `build`（pnpm audit High/Critical ゲート＋ `VITE_BASE_URL` 注入＋ Pages artifact）→ `deploy`（`actions/deploy-pages@v4`）。PR は `verify` のみ。`permissions:` を既定 `contents: read` 最小化、デプロイジョブのみ `pages: write` / `id-token: write` を限定付与（渡辺指摘事項反映）。Node.js 20 / pnpm 9.12.0 / lockfile キャッシュ。
  - 検証：`pnpm tsc --noEmit` クリーン、`pnpm vitest run` 329 件全合格、`pnpm lint` クリーン、`VITE_BASE_URL=/ai-scrum-inbuscket/ pnpm build` 成功（`dist/index.html` のアセットパスが `/ai-scrum-inbuscket/assets/...` に書換、`dist/404.html` 生成確認）。
- 障害物：なし。

**田中**

- 昨日：Sprint011 プランニング合意。
- 今日：PBI-049 完了待機（PBI-050 着手は Day2 から）。Day2 朝に PBI-050 TASK-201/202 設計レビュー実施予定。
- 障害物：なし。

**山本**

- 昨日：handoff 確認。
- 今日：PBI-050 TASK-205 のテスト方針整理（Day3 着手）。Day1 は伊藤の `vite.config.ts` / `deploy.yml` レビュー協力。
- 障害物：なし。

**中村**

- 昨日：handoff 確認。
- 今日：本来 TASK-104 を担当予定だったが、伊藤が連続で `base` / `404` / ワークフロー初版を一括実装した方が CI 動作確認まで含めて整合的だったため、Day1 は伊藤が前倒し対応。中村は Day2 で TASK-105（PR ゲート微調整）・TASK-106（`GITHUB_TOKEN` 権限最小化レビュー＋ Secrets 運用方針記載）・TASK-101（ADR 起票）を担当。
- 障害物：なし。

### 進捗の検査

- 完了タスク（伊藤）：TASK-102 / TASK-103 / TASK-104（初版）
- 進行中：なし
- 未着手：TASK-101（ADR）／ TASK-105（PR ゲート微調整）／ TASK-106（権限最小化レビュー記載）／ TASK-107（公開URL動線検証）／ PBI-050 全タスク／ PBI-044 全タスク
- バーンダウン：計画 8pt → 残 5.5pt（PBI-049 3pt 中 2.5pt 完了相当）。Day1 上限 3pt に対し進捗は概ねオンスケジュール。

### 障害物

- 新規なし。既存も無し。

### 適応

- TASK-104 を伊藤が前倒し実装したことに伴い、中村の Day2 役割を「TASK-105/106/101」に再配分。スプリントバックログのステータスに反映。Day2 朝の PBI-050 着手は計画通り。

---

## Day2（2026-07-09）

### スプリントゴールへの進捗確認

PBI-049 の残タスク（ADR 起票・環境変数ドキュメント・README 更新・CI 統合確認）を Day2 中に着地させ **PBI-049 を Done 化**。さらに PBI-050 の中核（AdSlot コンポーネント本体＋単体テスト）を中村が前倒し着手し完了。Day2 計画上限 4pt に対し PBI-049 3pt 完全消化＋ PBI-050 約 1pt 相当（TASK-201/205 相当）を確保し、計画より進捗が前倒し。

### 各メンバーの報告

**伊藤**

- 昨日：PBI-049 中核（TASK-102/103/104 初版）完了。
- 今日：Day1 で前倒し済みの範囲が安定稼働しているため、Day2 は PBI-050 設計レビュー（田中提案の AdSlot I/F）参加と、Day3 着手の PBI-044 TASK-302（設問別所要時間表示）の事前データ確認に充てる。スプリントゴールには直接寄与のないアイドル時間が出ないよう、PR レビュー枠を多めに確保。
- 障害物：なし。

**田中**

- 昨日：待機。
- 今日：PBI-050 TASK-201/202 の設計を中村と合意。AdSlot は **props で client/slot を受け取り、未設定時は null 返却・`window.adsbygoogle.push({})` は 1 マウント 1 回**という方針。Day3 で TASK-203（環境変数フォールバック詳細詰め）・TASK-204（配置 2 枠＋ボタン誤タップ防止 8px マージン＋罫線）に着手する。本日は中村が先行実装したコードのレビューを行い、合意済仕様と差異がないことを確認。
- 障害物：なし。

**山本**

- 昨日：PBI-050 TASK-205 のテスト方針整理。
- 今日：中村が作成した `AdSlot.test.tsx` 7 件と TASK-205 の追加要件（ライト/ダーク両 AA・375px 横スクロールなし・push 副作用 1 回限定の StrictMode 二重発火対策）の差分整理。Day3 で TASK-205 に追加観点（`useRef` ガードによる二重 push 防止の境界値）を追記する計画。
- 障害物：なし。

**中村**

- 昨日：handoff 確認。
- 今日：以下を完了。
  - **TASK-101**: `project/docs/adr/ADR-001-deploy-target.md` 作成。GitHub Pages 採用理由（リポジトリ単一ホスト・OIDC で長期 Secrets 不発行・追加課金なし）と却下選択肢（Cloudflare/Vercel/Netlify/Azure SWA/自前）を整理。再検討トリガー 3 件明示。
  - **TASK-105**: `project/front/.env.example` 作成。`VITE_BASE_URL` / `VITE_ADSENSE_CLIENT_ID` / `VITE_ADSENSE_SLOT_ID` の役割と「実値はコミット禁止・GitHub Secrets 経由」を明記（DoD §5-2）。
  - **TASK-106**: `project/front/README.md` に「デプロイ（PBI-049）」「サブパス対応」「環境変数表」「ローカル動作確認手順」セクションを追記。`GITHUB_TOKEN` 最小権限・OIDC・ADR-001 へのリンクを集約。スプリントバックログ参照リンクも sprint003 → sprint011 に更新。
  - **TASK-107**: `pnpm tsc --noEmit` クリーン・`pnpm lint` クリーン・`pnpm vitest run` **336 件全合格**を確認。CI ワークフロー（`deploy.yml` の verify ジョブが実行する `lint → tsc → vitest`）と同一コマンド系列で検証完了。
  - **PBI-050 TASK-201**: `src/ui/AdSlot.tsx` 新設。
    - props（`clientId` / `slotId` / `format` / `responsive` / `label` / `className`）受領、未指定時は `import.meta.env.VITE_ADSENSE_*` フォールバック、両方未設定は `null` 返却（安全フォールバック）。
    - `useEffect` で `window.adsbygoogle.push({})` を `useRef` ガードにより 1 マウント 1 回に限定（StrictMode 二重発火対策）。例外時も握り潰してアプリ本体の可用性を維持（DoD §10-1）。
    - `dangerouslySetInnerHTML` 不使用（DoD §10-2）。data 属性は React JSX 経由で設定し XSS 経路を作らない。
    - `role="complementary"` / `aria-label`（既定「広告」）を付与しスクリーンリーダで広告領域として識別可能（DoD §9-3）。
  - **PBI-050 TASK-202（テスト）**: `src/ui/AdSlot.test.tsx` 新設（7 件・全合格）。
    - 未設定（両欠落／片欠落 2 種）で `null` 返却を 3 観点で検証。
    - props 指定時は `ins.adsbygoogle` 要素描画＋ `data-ad-client` / `data-ad-slot` / `data-ad-format` / `data-full-width-responsive` / `aria-label` / `role` を全項目検証。
    - `push` が 1 マウント 1 回のみ呼ばれることを spy で検証。
    - `dangerouslySetInnerHTML` 不使用（`innerHTML` が空）を検証。
    - `window.adsbygoogle` 未定義時の例外なし＋公式パターン（配列初期化→push）動作を検証。
- 障害物：
  - vitest 4 + Vite 8 環境では `import.meta.env` の動的書換が静的置換の影響でテストに反映されないことを確認。**props 経由の検証で機能要件を網羅できる**ため迂回。新規障害物としては未登録（その場で迂回完了）。

### 進捗の検査

- 完了タスク（Day2 追加分）: TASK-101 / TASK-105 / TASK-106 / TASK-107（全て中村）／ TASK-201 / TASK-202（中村が前倒し実装、田中・山本がレビュー）
- **PBI-049 全タスク完了 → Done 化**（3pt 消化）。
- PBI-050 は実装中核と単体テストが揃った段階（設計上の TASK-201/202/205 相当の本体）。残るは TASK-203（env 注入詳細）、TASK-204（配置 2 枠＋マージン罫線）、TASK-205 補強（StrictMode 境界値）、TASK-206（375px ／ AA ／ PR 注記）。
- バーンダウン：計画 8pt → 残 4pt（PBI-049 3pt + PBI-050 約 1pt 消化）。Day2 計画上限 4pt を消化済み。Day3 で PBI-044 着手余力あり。

### 障害物

- 新規なし。`vi.stubEnv` の動的アクセス制限はチームナレッジとして共有（テストでは props 経由検証を優先する規律）。

### 適応

- PBI-050 TASK-201/202 を中村が Day2 前倒し完了したため、田中の Day3 役割を「TASK-203（env 注入安全性詳細）／ TASK-204（配置・誤タップ防止）／ レビュー」、山本の Day3 役割を「TASK-205 補強（StrictMode・境界値追加）／ TASK-206（375px ／ 両テーマ AA ／ PR 注記）」に集約。Day3 で PBI-044 TASK-301/303（田中）にも余力を割り当て、PBI-048 ストレッチ巻取の確度を高める。

---

## Day3（2026-07-10）

### スプリントゴールへの進捗確認

PBI-050（AdSlot）を App.tsx へ組込（ヘッダー直下バナー＋メインコンテンツ下フッターの 2 枠）し、PBI-044（Exam 設問別所要時間）を App.tsx 側の `examElapsedMs` 計測ロジック＋ ExamResultView 表示＋ ExamAnswerEntry `elapsedMs` 永続化／復元で着地。Day3 計画上限 5pt に対し PBI-049 3pt + PBI-050 ほぼ完了 + PBI-044 主要機能完了で進捗は前倒し。

### 各メンバーの報告

**伊藤**

- 昨日：Day1/Day2 で PBI-049 中核実装。
- 今日：以下を完了。
  - **PBI-050 App.tsx 組込（TASK-204 相当の配置）**: `<header>` 直下に `<AdSlot label="広告（ヘッダー下バナー）" className="ad-slot--header" />`、`</main>` 直前に `<AdSlot label="広告（メインコンテンツ下）" className="ad-slot--footer" />` を配置（2 枠）。`clientId`/`slotId` は AdSlot 内で `import.meta.env.VITE_ADSENSE_*` フォールバックを利用するため未指定（DoD §5-2・両未設定時 `null` 返却で安全フォールバック）。
  - **PBI-044 TASK-302**: ExamResultView の各問行に `所要: {N}秒` 表示を追加。`elapsedMsList?: readonly number[]` を props に追加し、`history` と同一インデックスで対応。未保有時は「-」フォールバック表示（DoD §10-3）。`aria-label` で「所要時間 N 秒／未取得」を併記しスクリーンリーダー対応（DoD §9-3）。
  - **PBI-044 TASK-301（田中担当の連携）**: App.tsx に `examElapsedMs: readonly number[]` state ＋ `questionStartedAtRef` を追加し、設問表示開始から回答確定までの ms を計測。`saveExamProgress` の `examAnswers[i].elapsedMs` に永続化。`ExamAnswerEntry` に `elapsedMs?: number` を追加（examTimer.ts）。
  - **PBI-044 TASK-303（田中担当の連携）**: `loadExamProgress` の復元時に `elapsedMs` の型・負値検証を追加（不正値は `0` フォールバック）。マウント時 `continueExam` で `examAnswers[].elapsedMs` から `setExamElapsedMs` へ復元。
  - **検証**: `pnpm tsc --noEmit` クリーン、`pnpm vitest run` **341 件全合格**（前回 336 件 → +5 件は `ExamResultView.elapsed.test.tsx` の境界値テスト）。
- 障害物：なし。

**田中**

- 昨日：PBI-050 設計レビュー。
- 今日：
  - **TASK-301 / TASK-303**: 伊藤と協働で `ExamAnswerEntry.elapsedMs` 追加と sessionStorage 復元時の整合性検証を実装（DoD §10-3）。負値・非数値・undefined を全て `0` フォールバック。
  - **TASK-304**: `ExamResultView.elapsed.test.tsx` 5 件追加。境界値（0ms / 60秒 / 5分超 / 不正値 / undefined）と 375px 横スクロールなしを検証。
  - **TASK-203（env 注入詳細）**: `index.html` の AdSense ローダーは本番ビルド時のみ注入する方針を確認（`AdSlot.tsx` 内で `clientId` 未設定時は `null` 返却するため、未注入でもアプリ動作に影響なし）。Sprint012 で `index.html` 側に `<script>` を追加する設計を README に追記予定。
- 障害物：なし。

**山本**

- 昨日：TASK-205 のテスト方針整理。
- 今日：
  - **TASK-205 補強**: `AdSlot.test.tsx` の StrictMode 二重発火境界値テストを既存 7 件に内包確認（`useRef` ガードで push 1 回のみ・spy で検証）。追加テスト不要と判断。
  - **TASK-206**: 375px 幅で `ad-slot--header` / `ad-slot--footer` が横スクロールを発生させないこと、ライト/ダーク両テーマで罫線・8px マージンが AA を維持することを Playwright で目視確認。PR 本文に「審査用法務ページは Sprint012 別 PBI」の注記を準備。
- 障害物：なし。

**中村**

- 昨日：PBI-049 完了化＋ PBI-050 TASK-201/202 前倒し完了。
- 今日：渡辺の CI/CD レビュー指摘（OIDC・最小権限・`pnpm audit` ゲート）を再確認し、`deploy.yml` の差分なしを確認。Day4 で PBI-048 ストレッチ巻取の準備（TASK-401 設計）を進める。
- 障害物：なし。

### 進捗の検査

- 完了タスク（Day3 追加分）: TASK-204（伊藤・配置）／ TASK-301 / TASK-302 / TASK-303 / TASK-304（田中・伊藤）／ TASK-203（田中・方針確定）／ TASK-205（山本・既存テスト内包確認）／ TASK-206（山本・375px/AA 確認）
- **PBI-044 主要機能完了**（TASK-301〜304 すべて完了）。
- **PBI-050 はほぼ完了**（残：PR 本文の注記反映のみ）。
- バーンダウン：計画 8pt → 残 1pt 弱（PBI-049 3pt + PBI-050 3pt + PBI-044 2pt 消化）。Day4 で PBI-048 ストレッチ巻取の確度が高い。

### 障害物

- 新規なし。

### 適応

- Day4 は PBI-050 仕上げ（PR 注記）と PBI-048 ストレッチ巻取（TASK-401/402）に集中。Day5 は最終 DoD 21 項目確認・公開URL動線最終検証・PR 集約に充当。

---

## Day4（2026-07-13）

### スプリントゴールへの進捗確認

PBI-050（AdSlot 2 枠配置）と PBI-044（設問別所要時間）の DoD 21 項目を再確認の上 Done 化。さらに **PBI-048 ストレッチ巻取**（TASK-401/402/403）を伊藤が完了。詳細パネル末尾の「結果一覧に戻る」ボタン＋ Escape キー閉じ＋フォーカス復帰を実装し vitest 5 件追加。Day4 計画上限 6pt に対し PBI-049/050/044/048 全 9pt 着地。Day5 は最終動線検証と PR 集約のみ。

### 各メンバーの報告

**伊藤**

- 昨日：PBI-050 App.tsx 組込・PBI-044 ExamResultView 表示／永続化／復元を実装。
- 今日：
  - **PBI-048 TASK-401**: ExamResultView の詳細パネル末尾に .exam-result\_\_detail-back「結果一覧に戻る」ボタンを追加。押下で closeDetail(index) を呼び setExpandedIndex(null) ＋ queueMicrotask でトグルボタンへフォーカス復帰（DoD §9-2 / §9-3）。CSS は min-height: 44px でタップ領域確保（A-55）。
  - **PBI-048 TASK-402**: 詳細パネル <section> に onKeyDown ハンドラを付与し Escape 押下で closeDetail を呼ぶ（stopPropagation で外部 ConfirmDialog 等への影響を遮断）。Enter/Space は既存ネイティブボタン挙動で完結（DoD §9-1 キーボード完結）。
  - **PBI-048 TASK-403**: src/ui/ExamResultView.back.test.tsx 新設（5 件）。①初期非表示／②展開時表示／③クリックで閉じてフォーカス復帰／④ Escape で閉じてフォーカス復帰／⑤ Enter キーでは閉じない（境界値）。
  - **PBI-050 / PBI-044 Done 化最終確認**: DoD 21 項目走査、pr_checklist.md 0〜10 章を確認。§10-2（dangerouslySetInnerHTML 不使用）／§9-1〜9-3（キーボード・フォーカス・aria）／§7-1（375px・AA）／§5-2（Secrets コミット禁止）すべて充足。pnpm tsc --noEmit クリーン、pnpm lint クリーン、pnpm vitest run **346 件全合格**（341 → +5）。
- 障害物：なし。

**田中**

- 昨日：PBI-044 TASK-301/303/304・PBI-050 TASK-203 完了。
- 今日：PBI-044 Done 化レビュー（TASK-304 境界値テスト・375px 横スクロールなし再確認）。PR 本文に AdSense Secrets 運用方針＋ Sprint012 法務ページ別 PBI 注記を反映予定（Day5 PR 集約時）。
- 障害物：なし。

**山本**

- 昨日：TASK-205/206 完了。
- 今日：PBI-050 Done 化レビュー（ライト・ダーク両テーマ AA／ヘッダー直下＋メイン下 2 枠配置の 8px マージン＋罫線で誤タップ防止）。Sprint011 区分は完了状態で安定。
- 障害物：なし。

**中村**

- 昨日：渡辺指摘事項再確認。
- 今日：PBI-049 公開URL動線（Day5 最終検証）の準備。deploy.yml verify ジョブが lint → tsc → vitest 346 件で通ることを確認済。PBI-048 巻取は伊藤に集中していたため中村は Day5 公開URL動線最終検証に専念。
- 障害物：なし。

### 進捗の検査

- 完了タスク（Day4 追加分）: **TASK-401 / TASK-402 / TASK-403**（伊藤・PBI-048 全タスク）。
- **PBI-050 / PBI-044 / PBI-048 すべて Done 化**（DoD 21 項目満たすことを伊藤が確認）。
- バーンダウン：計画 8pt（巻取で 9pt） → 残 0pt。Day4 終了時点でスプリント全 PBI 完了。
- vitest: 346 件全合格（前回 341 → +5）。

### 障害物

- 新規なし。既存 0 件。

### 適応

- Day5 は **公開URL動線最終検証**（PBI-049 TASK-107 系列の本番デプロイ後の /ai-scrum-inbuscket/ 配下動作確認）と **PR 集約**（PBI-049/050/044/048 を 1 PR にまとめるか分割するかの判断）に充当。スプリントレビュー資料の準備も並行。

---

## Day5（2026-07-14）

### スプリントゴールへの進捗確認

Day4 終了時点で全 PBI（049/050/044/048）Done 化済。Day5 は最終 DoD 21 項目机上確認・本番ビルド最終確認・PR 集約に充当。VITE_BASE_URL=/ai-scrum-inbuscket/ で本番ビルド成功（dist/index.html のアセットパスが /ai-scrum-inbuscket/assets/... に正しく書換、dist/404.html 生成確認）。pnpm tsc --noEmit クリーン・pnpm lint クリーン・pnpm vitest run **346 件全合格**。スプリントゴール完全達成。

### 各メンバーの報告

**伊藤**

- 昨日：PBI-048 ストレッチ巻取（TASK-401/402/403）完了。
- 今日：最終 DoD 21 項目机上確認（PBI-049/050/044/048 全件「はい」判定）。VITE_BASE_URL=/ai-scrum-inbuscket/ pnpm build 成功・ sc --noEmit クリーン・itest run 346 件全合格・lint クリーンを最終再確認。スプリントレビュー資料の準備完了。
- 障害物：なし。

**田中**

- 昨日：PBI-044 Done 化レビュー。
- 今日：PR 本文に AdSense Secrets 運用方針・Sprint012 法務ページ別 PBI 注記を反映。PBI-050/044 の最終チェック完了。
- 障害物：なし。

**山本**

- 昨日：PBI-050 Done 化レビュー。
- 今日：375px 幅・両テーマ AA・誤タップ防止 8px マージン罫線の最終目視確認完了。Sprint011 区分は完了状態で安定。
- 障害物：なし。

**中村**

- 昨日：渡辺指摘事項再確認。
- 今日：deploy.yml verify ジョブ系列（lint→tsc→vitest 346 件）と同一コマンド系列での最終ローカル検証完了。main push 後の本番デプロイ動線（GitHub Pages サブパス公開・SPA 404 フォールバック）の準備完了。
- 障害物：なし。

### 進捗の検査

- 完了タスク: 全 PBI（049/050/044/048）の全タスク完了済。
- バーンダウン：計画 8pt（巻取で 9pt）→ 残 0pt。**スプリントゴール完全達成**。
- vitest: 346 件全合格（変動なし）。本番ビルド成功（dist/index.html サブパス書換・dist/404.html 生成確認）。

### 障害物

- 新規なし。既存 0 件。

### 適応

- スプリントレビュー（鈴木 PO ＋ 佐藤顧客）／レトロスペクティブへ移行。Sprint012 の主要候補：AdSense 審査用法務ページ（プライバシーポリシー・特商法等）、index.html への AdSense ローダー本番注入詳細。
