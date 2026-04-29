# InBusket Front

インバスケット学習アプリ（ローカル稼働 Web アプリ）。  
案件をランダム出題し、A/B/C の優先度で回答 → 正解と解説を提示 → 次の問題、という1サイクルを完結する MVP。

## 技術スタック

| 区分                 | 採用                                             |
| -------------------- | ------------------------------------------------ |
| パッケージマネージャ | pnpm                                             |
| ビルド/Dev サーバ    | Vite                                             |
| UI フレームワーク    | React 18 + TypeScript                            |
| Lint / Format        | ESLint (flat config) + Prettier                  |
| 単体テスト           | Vitest                                           |
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
    ├── components/
    │   ├── CaseView.tsx          # 案件1件の出題表示
    │   ├── AnswerButtons.tsx     # A/B/C 回答ボタン（radiogroup）
    │   └── ExplanationView.tsx   # 採点バッジ・正解・解説の表示
    ├── domain/
    │   ├── case.ts           # 案件(Case)/Priority 型定義
    │   ├── loader.ts         # cases.json の検証付きローダ
    │   ├── loader.test.ts
    │   ├── judge.ts          # 採点関数 judge()
    │   ├── judge.test.ts
    │   ├── random.ts         # 直前1件除外つきランダム選択
    │   └── random.test.ts
    └── data/
        └── cases.json        # 案件データ（13件以上）
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

2. `id` は既存と重複しないこと（`loader.ts` がスキーマ不正・id 重複を起動時に検出する）。

3. 検証:

   ```bash
   pnpm test    # loader 等の単体テスト
   pnpm dev     # ブラウザで実機表示確認
   ```

## 動作仕様（MVP）

- 起動時に `cases.json` から1件をランダム出題する。
- A/B/C のいずれかを選択 → 「回答する」ボタン押下で確定し、ボタン群はロックされる。
- 採点結果（正解/不正解）と解説、自分の回答・正解優先度を表示する。
- 「次の問題」ボタンで次の案件へ。**直前と同じ案件は連続して出題されない**。
- データはローカル静的 JSON のみ。サーバ・DB・外部 API は使用しない。

## 関連スクラム成果物

- スプリントバックログ: [../../scrum/sprint001/sprint_backlog.md](../../scrum/sprint001/sprint_backlog.md)
- プロダクトゴール: [../../scrum/product_goal.md](../../scrum/product_goal.md)
- 完成の定義: [../../scrum/definition_of_done.md](../../scrum/definition_of_done.md)
