# InBusket Front

インバスケット学習アプリ（ローカル稼働 Web アプリ）。  
案件をランダム出題し、A/B/C の優先度で回答 → 正解と解説を提示 → 次の問題、という1サイクルを完結する MVP。

## 技術スタック

| 区分                 | 採用                                             |
| -------------------- | ------------------------------------------------ |
| パッケージマネージャ | pnpm                                             |
| ビルド/Dev サーバ    | Vite 8（Sprint002 PBI-015 で 5→8 更新）          |
| UI フレームワーク    | React 18 + TypeScript                            |
| Lint / Format        | ESLint (flat config) + Prettier                  |
| 単体テスト           | Vitest 4（Sprint002 PBI-015 で 2→4 更新）        |
| 状態管理             | React `useState`（ローカル状態のみ。永続化なし） |
| データ               | `src/data/cases.json`（バンドル時に静的取込）    |

## 起動手順

```bash
# 依存関係のインストール
pnpm install

# 開発サーバ起動（既定: http://localhost:5173）
pnpm dev

# 本番ビルド
pnpm build

# Lint / Format / Test
pnpm lint
pnpm format
pnpm test
```

## ディレクトリ構成

```
project/front/
├── index.html
├── package.json
├── vite.config.ts
├── eslint.config.js          # ESLint v9 flat config
├── tsconfig*.json
└── src/
    ├── main.tsx              # エントリポイント
    ├── App.tsx               # ルートコンポーネント（出題→回答→解説→次問の制御）
    ├── styles.css            # 共通スタイル（レスポンシブ対応）
    ├── ui/                   # UI 層（将来モバイル化を見据え疎結合化 / Sprint002 PBI-010）
    │   ├── CaseView.tsx          # 案件1件の出題表示
    │   ├── AnswerButtons.tsx     # A/B/C 回答ボタン（radiogroup）
    │   ├── ExplanationView.tsx   # 採点バッジ・正解・解説 ＋ 「もう一度」ボタン（PBI-014）
    │   ├── ScoreCounter.tsx      # セッション内 正答数/出題数カウンタ（PBI-012）
    │   ├── HistoryView.tsx       # 直近10問の正誤履歴（aria-live / Sprint003 PBI-016）
    │   └── ModeSelector.tsx      # 出題モード切替 radiogroup（aria-checked / 矢印キー / Sprint003 PBI-018）
    ├── domain/               # ドメイン層（型・ロジック）
    │   ├── case.ts           # 案件(Case)/Priority 型定義
    │   ├── loader.ts         # cases.json の検証付きローダ（UI からの JSON 直 import 禁止）
    │   ├── loader.test.ts
    │   ├── judge.ts          # 採点関数 judge()
    │   ├── judge.test.ts
    │   ├── random.ts         # 直前1件除外つきランダム選択 ＋ FilterMode/pickNextCaseByMode（Sprint003 PBI-018）
    │   ├── random.test.ts
    │   ├── shortcut.ts       # A/B/C・Enter キー判定の純粋関数 resolveShortcut（PBI-011）
    │   ├── shortcut.test.ts
    │   ├── score.ts          # セッション内カウンタの加算ロジック addScore（PBI-012）
    │   ├── score.test.ts
    │   ├── history.ts        # 直近10件履歴の純粋関数 pushHistory（Sprint003 PBI-016）
    │   ├── history.test.ts
    │   ├── mode.ts           # 出題モード切替リセット applyModeChange（Sprint003 PBI-018）
    │   └── mode.test.ts
    └── data/                 # データ層（JSON）
        └── cases.json        # 案件データ（40件 / Sprint003 PBI-017 で 32→40 件・A/B/C 各30%以上に拡充）
```

## 案件データ（cases.json）スキーマ

`src/data/cases.json` は `Case` オブジェクトの配列。

| フィールド        | 型                      | 必須 | 説明                               |
| ----------------- | ----------------------- | ---- | ---------------------------------- |
| `id`              | string                  | ○    | 一意なID。慣習: `case-XXX`（連番） |
| `title`           | string                  | ○    | 案件タイトル（短い見出し）         |
| `body`            | string                  | ○    | 案件本文。改行は `\n` で表現可     |
| `correctPriority` | `"A"` \| `"B"` \| `"C"` | ○    | 正解優先度                         |
| `explanation`     | string                  | ○    | 正解理由・判断ポイントの解説       |

優先度の意味:

| 値  | 意味                   |
| --- | ---------------------- |
| A   | 緊急かつ重要           |
| B   | 重要 or 緊急のいずれか |
| C   | 緊急でも重要でもない   |

## 案件の追加手順

1. `src/data/cases.json` の配列末尾に新しいオブジェクトを追記する。

   ```json
   {
     "id": "case-014",
     "title": "新規追加サンプル",
     "body": "本文。状況を簡潔に記述する。",
     "correctPriority": "B",
     "explanation": "なぜ B なのか、判断のポイントを記述する。"
   }
   ```

2. `id` は既存と重複しないこと（`loader.ts` がスキーマ不正・id 重複を起動時に検出する）。`correctPriority` は A/B/C 各 30% 以上の分布を維持する（Sprint003 PBI-017 で受入基準を 25%→30% に強化）。`ref/chapter08` の 20 業務パターンとの紐付けは [`project/docs/case_pattern_mapping.md`](../docs/case_pattern_mapping.md) を参照。

3. 検証:

   ```bash
   pnpm test    # loader 等の単体テスト
   pnpm dev     # ブラウザで実機表示確認
   ```

## 動作仕様（MVP / Sprint003 時点）

- 起動時に `cases.json` から1件をランダム出題する（出題モードに従いフィルタ）。
- A/B/C のいずれかを選択 → 「回答する」ボタン押下で確定し、ボタン群はロックされる。
- 採点結果（正解/不正解）と解説、自分の回答・正解優先度を表示する。
- 「次の問題」ボタンで次の案件へ。**直前と同じ案件は連続して出題されない**。
- 「もう一度」ボタン（解説枠内）で同一案件を未回答状態に戻して再挑戦できる（カウンタは加算しない / PBI-014）。
- キーボードショートカット（PBI-011）: `A` / `B` / `C` で回答選択、`Enter` で確定 / 次問 / もう一度。入力欄フォーカス中や修飾キー併用時は誤発火しない。
- セッション内カウンタ（PBI-012）: 画面右上に「正答数 / 出題数」を常時表示。リロードで 0/0 にリセット。
- **直近10問の正誤履歴表示（Sprint003 PBI-016）**: ヘッダ直下に ○/× ＋正解優先度を時系列で表示（aria-live）。FIFO で直近10件を保持し、リロードでクリア。
- **出題モード切替（Sprint003 PBI-018）**: 「全件 / A / B / C」を radiogroup で切替。Tab/矢印キー操作・focus 可視・aria-checked 対応。**切替時は履歴・カウンタ・現在の案件を一括リセット**。モード設定はセッション内のみ保持（リロードで「全件」に復帰）。
- 案件データ: 40件（A:13 / B:14 / C:13、各 32.5%/35.0%/32.5% で 30%以上）。`ref/chapter08` の 20 業務パターンを完全網羅（[case_pattern_mapping.md](../docs/case_pattern_mapping.md) 参照）。
- データはローカル静的 JSON のみ。サーバ・DB・外部 API は使用しない。

## デプロイ（Sprint011 / PBI-049）

main ブランチへの push をトリガに、GitHub Actions ([deploy.yml](../../.github/workflows/deploy.yml)) が
`lint → tsc → vitest → build → pnpm audit (High/Critical ゲート)` を経て GitHub Pages に自動公開する。

- 公開先: `https://<owner>.github.io/<repo>/`（サブパス配信）
- PR では検証ジョブ（lint/tsc/vitest）のみ実行。デプロイは行わない。
- `GITHUB_TOKEN` は既定 `contents: read` に最小化し、`deploy` ジョブにのみ `pages: write` / `id-token: write` を限定付与。長期 Secrets は発行しない（OIDC）。
- 採用理由は [ADR-001](../docs/adr/ADR-001-deploy-target.md) を参照。

### サブパス対応

`vite.config.ts` の `base` は `VITE_BASE_URL` 環境変数で切替（dev/test は `/`、本番ビルドのみサブパス）。
SPA フォールバックは `dist/index.html` を `dist/404.html` にコピーする方式（`scripts/copy-404.mjs`、`pnpm build` 末尾で実行）。

### 環境変数

雛形は [.env.example](./.env.example) を参照。実値はコミットしない。

| 変数名                   | 用途                           | 設定箇所                                |
| ------------------------ | ------------------------------ | --------------------------------------- |
| `VITE_BASE_URL`          | Vite の `base`（公開サブパス） | GitHub Actions が `/<repo>/` を自動注入 |
| `VITE_ADSENSE_CLIENT_ID` | Google AdSense パブリッシャ ID | GitHub Secrets（任意・PBI-050）         |
| `VITE_ADSENSE_SLOT_ID`   | Google AdSense 広告スロット ID | GitHub Secrets（任意・PBI-050）         |

`VITE_ADSENSE_*` のいずれかが未設定の場合、AdSlot コンポーネントは何も描画しない安全フォールバック動作となる（PBI-050 / DoD §10-1）。

### ローカル動作確認

```bash
# 本番相当のサブパスでビルド
VITE_BASE_URL=/ai-scrum-inbuscket/ pnpm build

# プレビュー（http://localhost:4173/ai-scrum-inbuscket/）
pnpm preview --base /ai-scrum-inbuscket/
```

## 関連スクラム成果物

- スプリントバックログ（最新）: [../../scrum/sprint011/sprint_backlog.md](../../scrum/sprint011/sprint_backlog.md)
- プロダクトゴール: [../../scrum/product_goal.md](../../scrum/product_goal.md)
- 完成の定義: [../../scrum/definition_of_done.md](../../scrum/definition_of_done.md)
- ADR: [ADR-001 公開デプロイ先](../docs/adr/ADR-001-deploy-target.md)
