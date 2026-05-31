# 依頼事項メモ order016

## 依頼者

顧客: 佐藤（上長不在のため代行作成）

## 依頼概要（最重要）

Google AdSense 審査に **2回連続で落選**。今回（2回目）の通知原因は以下 2 点：

1. 「**パブリッシャーのコンテンツを含まない画面における Google が配信する広告の扱い**」
   → コンテンツがない / 有用性が低い / 作成中 / ナビゲーション目的の画面に広告が配置されている。
2. 「**有用性の低いコンテンツ**」
   → コンテンツの最小要件を満たしていない。

リポジトリの客観調査の結果、**Sprint024/025 で導入した 57 ルートのプリレンダリング実装そのものが審査落ちの直接原因**になっている可能性が極めて高い。再申請の前に、以下の修正を**最優先**で実施してほしい。

---

## 根本原因（事実ベースで確認済み）

### 【最重要・クローキングリスク】プリレンダリングされた本文が `hidden aria-hidden="true"` で隠されている

- 該当: [project/front/scripts/prerender.mjs](../../project/front/scripts/prerender.mjs#L236) 付近のテンプレート
- 現状: `<div data-prerender="..." hidden aria-hidden="true">…本文…</div>` で静的 HTML を出力している。
- 問題: **視覚的にもクローラーにも隠されたテキスト**になっており、Google から見ると「**隠しテキスト / クローキング**」と判定されるリスクがある。これは AdSense / Search のポリシー違反に直結し、審査落ちの最大要因と考えられる。
- 修正方針: `hidden aria-hidden="true"` を**外す**。SPA hydration 前にユーザーにもクローラーにも見える形で表示する（hydration 後に React 側で置き換える設計に変更）。

### プリレンダリング本文が極端に薄い（実コンテンツの 70〜80% が欠落）

- 実データソース（[referenceData.ts](../../project/front/src/data/referenceData.ts) / [cases.json](../../project/front/src/data/cases.json) / [patternData.ts](../../project/front/src/data/patternData.ts)）には各項目 **800字以上**の本文・セクション・表・例が用意されている。
- 一方で prerender は **h1 + summary + intro + 関連リンク 1 本＝200〜250字**しか出していない。
- 修正方針: **実データから本文・主要セクション・例示を SSG 段階でフル抽出**して静的 HTML に焼き込む。Markdown→HTML 変換が必要なら build 時に実施。

### 一覧ページ `/reference` `/patterns` がプリレンダリング対象外

- SPA のままなので静的 HTML に本文が無く、「コンテンツのないナビゲーション画面」扱いになる。
- [src/pages/PatternList.tsx](../../project/front/src/pages/PatternList.tsx) は**リンクと優先度バッジのみで説明文ゼロ**。
- 修正方針:
  - 一覧ページ（`/reference`, `/patterns`）も**プリレンダリング対象に追加**する。
  - 各項目に**1〜2文の説明文**を付け、ページ冒頭にも一覧の目的・使い方を本文として記述する。

### 広告配置の不均衡 / ポリシー違反リスク

- 学習アプリ本体（[App.tsx L744 / L923](../../project/front/src/App.tsx)）にのみ `AdSlot` が配置され、主力 SEO ページ（ReferencePage / CaseDetail / PatternDetail）には**広告が一切ない**。
- 逆に「コンテンツの薄いナビゲーション画面」に広告が出てしまうと AdSense ポリシー違反。
- [AdSlot.tsx](../../project/front/src/components/AdSlot.tsx) は環境変数未設定時には何もレンダリングしない実装になっている。
- 修正方針:
  - **広告掲載ポリシーを明文化**し（後述）、十分な本文を持つページにのみ `AdSlot` を配置する制御を入れる。
  - 主力 SEO ページ（ReferencePage / CaseDetail / PatternDetail）には**本文を充実させた上で**広告を配置する。
  - 一覧ページ / 法務系固定ページ / 検索 / エラー / 404 等の**ナビゲーション・薄ページには広告を出さない**。

### 環境変数 `VITE_ADSENSE_CLIENT_ID` / `VITE_ADSENSE_SLOT_ID` が本番未設定の可能性

- 本番ビルドで実際に広告タグが出力されているか **未検証**。
- 修正方針: Cloudflare Pages 等の本番環境変数を確認し、設定されていなければ設定。設定済みなら本番 HTML を fetch して `adsbygoogle` タグが存在することを確認する。

---

## 修正方針（優先度順）

### P0（再申請前に必須・最優先）

1. **`hidden aria-hidden="true"` の除去**（クローキング解消）
   - [prerender.mjs](../../project/front/scripts/prerender.mjs) の全テンプレートから `hidden aria-hidden="true"` を外す。
   - 静的 HTML が**ユーザーにも視認可能**なように CSS / レイアウトを整える（hydration 後に React 側が同等内容で置換するなら FOUC 対策含む）。
2. **プリレンダリング本文のフル反映**
   - referenceData / cases / patternData の実本文・主要セクションを SSG 段階で HTML 化して焼き込む。
   - 目標: 各詳細ページの静的 HTML が**本文 600 字以上**（後述の最小コンテンツ基準を満たす）。

### P1（再申請前に強く推奨）

3. **一覧ページ `/reference` `/patterns` の対象化と底上げ**
   - prerender.mjs のルートリストに追加。
   - PatternList / ReferencePage 一覧側に**各項目の説明文 1〜2 文 + ページ冒頭の導入文**を追加。
4. **広告配置ポリシーの明文化と適用**
   - 後述「広告を出してよい画面の最小コンテンツ基準」を [project/docs/](../../project/docs/) 配下に新規ドキュメント（例: `adsense_placement_policy.md`）として作成。
   - 主力 SEO ページ（ReferencePage / CaseDetail / PatternDetail）に `AdSlot` を追加（基準を満たすページのみ）。
   - ナビゲーション・薄ページからは `AdSlot` を撤去 / 配置しない。

### P2（再申請に並行して確認）

5. **環境変数の本番設定確認**
   - 本番環境変数 `VITE_ADSENSE_CLIENT_ID` / `VITE_ADSENSE_SLOT_ID` が設定されているか確認。
   - 本番 URL を fetch して `adsbygoogle` タグが HTML に出力されていることを確認。

---

## 広告を出してよい画面の最小コンテンツ基準（新規定義）

以下の **全条件** を満たすページにのみ `AdSlot` を配置してよい。

| #   | 基準                 | 条件                                                                                    |
| --- | -------------------- | --------------------------------------------------------------------------------------- |
| 1   | 本文量               | **静的 HTML に本文 600 字以上**（タイトル・ナビ・フッター・コードを除く）               |
| 2   | ページ目的           | **ナビゲーション専用ではない**（一覧 / 検索結果 / 404 / メニュー / リダイレクトは不可） |
| 3   | オリジナリティ       | コピー貼り付けではなく**独自に作成された解説・分析・例示**を含む                        |
| 4   | 完成度               | 「作成中」「準備中」「Coming Soon」等のプレースホルダーを含まない                       |
| 5   | 法務・ユーティリティ | プライバシーポリシー / 利用規約 / 運営者情報 / お問い合わせ等の固定ページには配置しない |
| 6   | プリレンダリング     | 静的 HTML の段階で本文が**可視状態で**出力されている                                    |

→ この基準を満たすかどうかを判定するヘルパー（例: `shouldShowAds(pageMeta)`）を実装し、`AdSlot` の表示制御に組み込むことを推奨。

---

## 再申請の前提条件チェックリスト（Definition of Ready for Resubmission）

再申請ボタンを押す前に、以下が**全て ✓** であること。

- [ ] prerender.mjs から `hidden aria-hidden="true"` が完全に除去されている
- [ ] 詳細ページ（reference / case / pattern）の**静的 HTML を直接 view-source で確認**し、本文 600 字以上が可視で出力されている
- [ ] 一覧ページ（`/reference` / `/patterns`）がプリレンダリング対象になり、説明文が静的 HTML に含まれる
- [ ] `adsense_placement_policy.md`（仮）が `project/docs/` に存在し、上記最小コンテンツ基準が明文化されている
- [ ] ナビゲーション / 薄ページ / 法務固定ページから `AdSlot` が**取り除かれている**
- [ ] 主力 SEO ページに `AdSlot` が**追加されている**（基準を満たすもののみ）
- [ ] 本番環境変数 `VITE_ADSENSE_CLIENT_ID` / `VITE_ADSENSE_SLOT_ID` が設定済みで、本番 HTML に `adsbygoogle` タグが出力されている
- [ ] order015 で対応した最終更新日修正がデプロイ済み（信頼性シグナル）
- [ ] vitest / tsc / eslint / `pnpm build` がオールグリーン
- [ ] Lighthouse SEO スコアが主要ページで 90 以上（参考値として記録）

---

## スコープ外 / 別途検討

- AdSense 以外の広告ネットワーク採用は本依頼スコープ外。
- 利用規約 2 本立て（[Terms.tsx](../../project/front/src/pages/Terms.tsx) / [TermsOfService.tsx](../../project/front/src/pages/TermsOfService.tsx)）の一本化は order015 同様、別 PBI で扱うこと。
- prerender 後の HTML を hydration が破壊しないか（mismatch warning）の検証は P0 修正に含めて実施すること。

---

## 期待アウトプット

- 上記 P0/P1/P2 を反映した PR 群（PBI として適切に分割）
- `project/docs/adsense_placement_policy.md`（仮）の新規作成
- 再申請前チェックリストを全て ✓ にした上で、AdSense 再申請（3 回目）を実施
- スプリントレビューで「**詳細ページの view-source に本文が可視で 600 字以上含まれていること**」と「**広告が基準を満たすページにのみ表示されていること**」をデモ
