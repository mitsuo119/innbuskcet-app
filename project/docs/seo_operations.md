# SEO 計測運用ドキュメント（PBI-082 / Sprint020 DAY1）

> 本ドキュメントは JavaScript SEO 観点でのプロダクト品質を継続改善するための **計測 KPI / 監視頻度 / 担当ロール / 運用手順** を定義する。
> 関連: [seo_metadata_sitemap_guide.md](./seo_metadata_sitemap_guide.md) / [lighthouse-sprint016.md](./lighthouse-sprint016.md) / [pr_checklist.md](./pr_checklist.md)

## 1. 目的

- 公開後の SEO 指標（インデックス状況・流入・掲載順位）を **定点観測** し、前スプリント比の変化を捉える。
- Lighthouse SEO スコアの **回帰検出** を仕組み化し、PBI 完了後の品質低下を早期発見する。
- 各スプリント Sprint Review 時に、SEO の **増減ファクト** を客観的に確認できるようにする。

## 2. 主要 KPI と取得方法

| KPI                    | 目的                    | 出典                                     | 推奨頻度         |
| ---------------------- | ----------------------- | ---------------------------------------- | ---------------- |
| インデックス済ページ数 | クロール網羅性の確認    | Search Console「カバレッジ」             | 週次（毎週月曜） |
| 表示回数               | 検索結果露出量          | Search Console「検索パフォーマンス」     | 週次             |
| クリック数             | 検索からの実流入        | Search Console「検索パフォーマンス」     | 週次             |
| 平均掲載順位           | 重要キーワードの順位    | Search Console「検索パフォーマンス」     | 週次             |
| Lighthouse SEO スコア  | 技術 SEO の回帰検出     | Lighthouse CLI（dist 計測）              | スプリント毎     |
| Core Web Vitals        | UX 観点の検索順位影響度 | Search Console「ウェブに関する主な指標」 | 月次             |

> **計測 0 期間（公開直後〜2 週間）**: Search Console は反映に最大 2 週間ラグがある。0 計測期は「サイトマップ送信成功」「インデックス登録 URL ≧ 1」を最低基準とし、KPI 推移は 3 週目以降に評価する。

## 3. 担当ロール

| ロール              | 担当           | 責務                                                                                        |
| ------------------- | -------------- | ------------------------------------------------------------------------------------------- |
| SEO 運用責任者      | 鈴木（PO）     | KPI 全体の数値判断・優先度反映                                                              |
| 技術 SEO 監視       | 田中（開発者） | Lighthouse 定点観測・sitemap/robots 整合・計測スクリプト整備                                |
| ドキュメント管理    | 中村（助っ人） | 本ドキュメント・[seo_metadata_sitemap_guide.md](./seo_metadata_sitemap_guide.md) の差分反映 |
| Search Console 運用 | 田中（開発者） | サイトマップ送信・カバレッジ調査・URL 検査                                                  |

## 4. 監視頻度・サイクル

| 頻度                  | 実施内容                                                                                    | 担当        |
| --------------------- | ------------------------------------------------------------------------------------------- | ----------- |
| **毎スプリント Day1** | 前スプリント末との Lighthouse SEO スコア比較、差異が −5 ポイント以上なら障害物ログへ起票    | 田中        |
| **毎スプリント Day5** | dist ビルドで Lighthouse SEO 計測、本ドキュメント末尾「§7 計測ログ」へ追記                  | 田中        |
| **毎週月曜**          | Search Console「検索パフォーマンス」7 日間サマリを目視確認、急減（−30% 以上）時は障害物起票 | 鈴木 / 田中 |
| **毎月初**            | Core Web Vitals レポート確認、不合格 URL があれば PBI 候補として `scrum/order/` へメモ      | 鈴木        |

## 5. Search Console 登録手順（本番ドメイン前提）

> 前提: GitHub Pages 公開 URL = `https://katuz.github.io/ai-scrum-inbuscket/`（独自ドメイン化時は本節を更新）。

1. [Google Search Console](https://search.google.com/search-console) にプロジェクト用アカウントでログイン。
2. 「プロパティを追加」→ **URL プレフィックス** 形式を選択し、`https://katuz.github.io/ai-scrum-inbuscket/` を入力。
3. **所有権の確認** は HTML タグ方式を使用：
   - 表示された `<meta name="google-site-verification" content="...">` をスクリーンショットで保管。
   - 当該 meta タグは `project/front/index.html` の `<head>` 末尾に追加し、対応 PBI で恒久化する（仮対応として手動デプロイで一時的に挿入する場合は次スプリント中に PR 化する）。
4. 「サイトマップ」メニューから `sitemap.xml` を送信（送信パス: 空欄に `sitemap.xml` を入力するだけで OK）。
5. **URL 検査** ツールで主要 URL（`/`, `/reference`, `/patterns`, `/patterns/1`, `/privacy-policy` 等）を 1 件ずつ検査し、「URL は Google に登録されています」/「URL は登録できます」のいずれかであることを確認する。

> **注意**: GitHub Pages サブドメイン（`*.github.io`）配下では、Search Console のドメイン プロパティ（DNS TXT 認証）は使用不可。URL プレフィックス方式のみ利用可能。

## 6. Lighthouse SEO 定点観測手順

> [lighthouse-sprint016.md](./lighthouse-sprint016.md) で確立した audit ID 単位の合否台帳を **継続活用** する。本節はその実施手順を整理する。

> **関連ドキュメントセット（PBI-082 / TASK-082-2）**:
>
> - SEO メタ・サイトマップ設計規律: [seo_metadata_sitemap_guide.md](./seo_metadata_sitemap_guide.md)
> - audit ID 合否台帳・Sprint016 静的レビュー結果: [lighthouse-sprint016.md](./lighthouse-sprint016.md)
> - スプリント毎 PR チェック項目: [pr_checklist.md](./pr_checklist.md)
> - 計測結果保存規約: 本ドキュメント §6.3 / §9

### 6.1 ローカル計測（毎スプリント Day5）

```powershell
# 1. dist ビルド（VITE_BASE_URL / VITE_SITE_URL は本番相当を注入）
cd project/front
$env:VITE_BASE_URL='/ai-scrum-inbuscket/'
$env:VITE_SITE_URL='https://katuz.github.io/ai-scrum-inbuscket/'
pnpm build

# 2. dist を `pnpm preview` で配信し別ターミナルで Lighthouse CLI 実行
pnpm preview --port 4173
# 別ターミナル:
pnpm dlx lighthouse http://localhost:4173/ai-scrum-inbuscket/ `
  --only-categories=seo,best-practices `
  --output=html --output-path=./project/docs/lighthouse-sprintNNN.html
```

### 6.2 公開後計測（GitHub Pages 反映後）

```powershell
pnpm dlx lighthouse https://katuz.github.io/ai-scrum-inbuscket/ `
  --only-categories=seo,best-practices `
  --output=html --output-path=./project/docs/lighthouse-prod-sprintNNN.html
```

### 6.3 結果の記録

- HTML レポートは `project/docs/lighthouse-sprintNNN.html` として保管（コミット対象）。
- スコアサマリは本ドキュメント末尾「§7 計測ログ」へ 1 行追記。
- スコアが −5 ポイント以上下落した audit ID は `scrum/impediment_log.csv` へ起票し、原因 PBI を特定する。

## 7. スプリント毎 SEO チェックリスト雛形

> Sprint Review 直前に PO（鈴木）または技術 SEO 担当（田中）が記入する。`pr_checklist.md` の SEO 節と相互補完する（PBI-082 / TASK-082-3）。
>
> **PR レビューとの関係**: 個別 PR 単位の SEO 点検は [pr_checklist.md §10 SEO / サイトマップ整合（PBI-082）](./pr_checklist.md#10-seo--サイトマップ整合pbi-082) に必り計上される。本節はそれらの「スプリント横断サマリ」として位置づける。

```markdown
### Sprint NNN SEO チェック

- [ ] sitemap.xml と Router.tsx の公開ルートに乖離がないこと（seo-assets.test.ts PASS）
- [ ] robots.txt が `Sitemap:` で sitemap.xml を参照していること
- [ ] 新規ルート追加 PBI がある場合、resolveRouteSeo にタイトル/説明が定義されている
- [ ] dist ビルドで Lighthouse SEO スコアが 95 以上（−5 ポイント以下の下落なし）
- [ ] Search Console「インデックス済」件数が前スプリント末以上（公開後 14 日経過後のみ評価）
- [ ] meta robots noindex が 404 ルート/開発用ルート以外に出現しない
- [ ] canonical / og:url が現在のページ URL と一致する（DevTools 目視）
- [ ] **Search Console 主要 KPI（インデックス済ページ数 / 表示回数 / クリック数 / 平均掲載順位）を §9 計測ログへ 1 行追記し、Sprint Review §5（環境変化の共有）または §6（プロダクトバックログ調整）で口頭共有する**（order011 佐藤(b) 反映 / 取得担当: 田中、報告担当: 鈴木、頻度: 毎スプリント、公開後 14 日未満は「測定 0 期」と注記）
```

## 8. 障害物起票基準

以下のいずれかに該当した時点で `scrum/impediment_log.csv` へ起票し、次スプリント Day1 までに対応方針を確定する：

- Lighthouse SEO スコアが連続 2 スプリントで 95 未満
- Search Console「カバレッジ」で「除外」件数が新規 5 件以上発生
- Core Web Vitals「不良」URL が新規発生
- sitemap.xml と Router 実装の乖離が `seo-assets.test.ts` で検出される

## 9. 計測ログ（追記欄）

| スプリント | 計測日            | Lighthouse SEO         | 表示回数（7d） | クリック数（7d） | インデックス数   | メモ                                                                                                                                                                                                                                                                                                                             |
| ---------- | ----------------- | ---------------------- | -------------- | ---------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --------- | ---------- | ------------------------------ | --------- | --------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sprint016  | -                 | 100（静的レビュー）    | -              | -                | -                | 公開前。基準値となる                                                                                                                                                                                                                                                                                                             |
| Sprint020  | -                 | -                      | -              | -                | -                | 本ドキュメント新規作成。Day5 で初回計測予定                                                                                                                                                                                                                                                                                      |
| Sprint021  | 2026-09-16〜09-22 | 試行（DAY1 §6.1 手順） | 測定 0 期      | 測定 0 期        | URL 検査済（C3） | C4（DAY1）：`pnpm build` → `pnpm preview` → Lighthouse CLI で 1 回試行・手順稼働確認。C3（DAY2）：`/`, `/reference`, `/patterns/8` を Search Console URL 検査し「URL は登録できます」判定確認。order011(b)：公開後 14 日未満のため測定 0 期、Sprint Review §5 で口頭共有。スコア値の正式記録は本番デプロイ後の本計測で更新する。 |     | Sprint022 | 2026-09-29 | 未計測（K-1 生データ取得のみ） | 測定 0 期 | 測定 0 期 | クロール待ち | K-1（DAY5 必達）：本スプリントで PBI-079（`/cases/:id` 20 件）と PBI-080（`/reference/chapter03..12` 8 章）を新規公開し sitemap.xml は 41 ルートに拡張済。調査時点で Search Console 侧のクロール・インデックス反映は 0 件（デプロイ直後のため）。A-98「測定前提条件」に従い「公開後 14 日未満・クロール待ち」と明示。Sprint Review §5 で口頭共有し、本計測は Sprint023 DAY1 に実施予定（担当：中村）。Lighthouse SEO は本スプリントで技術面 SEO 要素の退行ゼロ（title/description 一意・canonical・BreadcrumbList JSON-LD ・sitemap 整合）を `seo-assets.test.ts` 33 / `Router.seo.test.tsx` 13 で検証済。 |

## 10. 更新履歴

| 日付       | 更新内容                                                                                                                                                                                                     | 更新者               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | --- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 2026-09-09 | PBI-082 / TASK-082-1 として新規作成（Sprint020 Day1）                                                                                                                                                        | 中村（助っ人）       |
| 2026-09-10 | PBI-082 / TASK-082-2 §6 Lighthouse 手順に lighthouse-sprint016.md との横断ドキュメントセットを明記。TASK-082-3 §7 スプリント SEO チェックリストと pr_checklist.md §10 を双方向リンクで接続（Sprint020 Day2） | 山本（助っ人）・田中 |
| 2026-09-22 | §9 計測ログに Sprint021 行を追加（C4 DAY1 試行・C3 DAY2 URL 検査・order011(b) 測定 0 期共有方針を反映、Sprint021 DAY5）                                                                                      | 中村（助っ人）       |     | 2026-09-29 | §9 計測ログに Sprint022 行を追加（K-1 / TASK-K1 / DAY5）。PBI-079（`/cases/:id` 20 件）・PBI-080（`/reference/chapter03..12` 8 章）を新規公開し sitemap.xml を 41 ルートに拡張。誫りクロール待ち状態として K-1 データを記録、本計測は Sprint023 DAY1 に実施。 | 中村（助っ人） |
