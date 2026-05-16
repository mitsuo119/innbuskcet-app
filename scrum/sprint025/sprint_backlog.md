# スプリントバックログ - Sprint025

## スプリント情報

- **スプリント**: Sprint025
- **期間**: 2026-05-16 〜 2026-05-22（5日間）
- **計画SP**: 6pt（PBI-087 5pt + PBI-096 1pt）
- **ストレッチ枠（A-113・容量試算外）**: PBI-091 2pt（DAY3 EOD判定）
- **容量試算上限**: 6〜8pt（A-99 第5回適用）

## スプリントゴール

> **AdSense再申請の最大関門であるSPAクローラ可視性を、主要57+ルートのプリレンダリング全面適用で解消し、あわせて固定ページの日付整合性を是正することで、AdSense再申請着手可能な状態を確立する**

---

## 選択PBI

### 主軸: PBI-087（5pt / Critical / Ready）

**主要57+ルートのプリレンダリング全面適用（order014§2-1）**

#### 受入基準（product_backlog.csv より）

- PBI-086のADR結論（ADR-002: C2自前静的HTML生成スクリプト採用）に従い対象ルート全件をプリレンダリング
- 対象: トップ + chapter01〜12 + patterns/1〜20 + cases/<20件> + /privacy-policy + /contact + /about + /terms
- 各HTMLの `view-source:` で h1・本文要約段落（導入1〜2段落）・パンくず・主要内部リンクが取得可能
- canonical/description/OGP/Twitter Card は退行ゼロ
- ビルド時間退行は10%以内に抑える（超過時は分割ビルド検討）
- vitest で主要5ルートの静的HTML出力スナップショット検証を追加
- Rich Results Test 主要5URLで構造化データOK
- DoD 21項目「はい」

#### A-111 段階展開戦略（4段階）

| 段階    | 対象ルート                                  | 件数    | 代表スナップショット  | DAY見込み |
| ------- | ------------------------------------------- | ------- | --------------------- | --------- |
| 第1段階 | /, /about, /terms, /reference/chapter01〜03 | 6       | 代表2ルート           | DAY1〜2   |
| 第2段階 | /reference/chapter04〜12                    | 9       | chapter06 / chapter12 | DAY2〜3   |
| 第3段階 | /cases/:id × 20                             | 20      | cases/1 / 10 / 20     | DAY3〜4   |
| 第4段階 | /patterns/:id × 20                          | 20      | patterns/1 / 10 / 20  | DAY4〜5   |
| **計**  | **57+ ルート**                              | **57+** | -                     | -         |

> 各段階で `view-source:` スナップショット代表1〜2ルート確認 + vitest 全 PASS を維持して累積進行（A-111 Sprint024 retro 合意）。

### 補助: PBI-096（1pt / High / Ready）

**固定ページ最終更新日を本日（2026年5月16日）に統一（order015）**

#### 受入基準（product_backlog.csv より）

- About.tsx L23 / PrivacyPolicy.tsx L21 / Terms.tsx L27 / TermsOfService.tsx L19 の4ファイルの最終更新日を「2026年5月16日」に統一
- 本文・JSON-LD・metadata は変更しない（4行差分のみ）
- vitest / tsc / eslint オールグリーン
- `pnpm build` 成功で dist の legal-updated も更新される
- a11y退行ゼロ / DoD 21項目「はい」

### ストレッチ: PBI-091（2pt / High / Ready / 容量試算外・DAY3 EOD判定）

**パンくず BreadcrumbList JSON-LD + 視覚UI（order014§3）**

> A-113適用: 積み残しPBI前倒し候補に限定／DAY3 EODでPBI-087第3段階完了見込みがある場合のみ投入。投入時は容量試算上の8pt到達に注意。

---

## タスクリスト

### Day0（2026-05-16 / SM対応）

| ID        | 内容                                                                                | 担当 | 見積  | 状態   |
| --------- | ----------------------------------------------------------------------------------- | ---- | ----- | ------ |
| TASK-D0-1 | A-108: A-100/A-101 を `scrum/scrum_team_culture.md` へ卒業反映                      | 高橋 | 30min | ✅完了 |
| TASK-D0-2 | A-110: `handoff_for_helpers.md` 新設 + 「オーナー権限再依頼経路」固定セクション追加 | 高橋 | 30min | ✅完了 |
| TASK-D0-3 | A-113: ストレッチ枠整理を `sprint_planning.md` に明記                               | 高橋 | 10min | ✅完了 |
| TASK-D0-4 | A-111: PBI-087 4段階展開戦略を本ファイル（sprint_backlog.md）に明記                 | 伊藤 | 30min | ✅完了 |

### Day1（2026-05-17 / IMP-002解消必達 + PBI-087着手 + PBI-096補助）

| ID         | 内容                                                                                                      | 担当      | 見積  | 状態                                                                  | A           |
| ---------- | --------------------------------------------------------------------------------------------------------- | --------- | ----- | --------------------------------------------------------------------- | ----------- |
| TASK-D1-a  | リポジトリオーナー権限による Settings>Pages 有効化を A-110 経路で再依頼 → 200応答確認                     | 中村+伊藤 | 1h    | ⚠️再依頼起票済・200未達（DAY1 EOD で 404 継続→Sprint026持ち越し継続） | A-109/A-110 |
| TASK-D1-b  | IMP-002 解消後 K-1 本計測 → `seo_operations.md` §9 Sprint025 行 実値追記                                  | 中村      | 30min | ⏸ブロック（IMP-002未解消→A-98代理計測継続）                           | A-109/A-102 |
| TASK-D1-c  | Lighthouse SEO 実スコア計測 → `lighthouse-sprint016.md` 系列値追記                                        | 中村      | 30min | ⏸ブロック（IMP-002未解消→dist代理継続）                               | A-109       |
| TASK-D1-d  | C1〜C3 URL検査 → 本ファイル §受入確認メモ追記                                                             | 山本+中村 | 1h    | ⏸ブロック（IMP-002未解消）                                            | A-109       |
| TASK-D1-e  | PBI-086 PoC 本番 view-source: 公開後確認 → A-112 初運用で `seo_operations.md` §9 に追記                   | 中村+鈴木 | 30min | ⏸ブロック（IMP-002未解消→Sprint026 A-112初運用へ繰延）                | A-112       |
| TASK-D1-f  | IMP-002 を `impediment_log.csv` でResolved化 → `impediment_log_resolved.csv` 移送                         | 高橋      | 15min | ⛔不実施（クローズ不能と判定→A-105チェック表で持ち越し記録）          | A-109       |
| TASK-087-1 | 第1段階: 高優先6ルートの `scripts/prerender.mjs` 拡張 + vitest スナップショット代表2ルート                | 伊藤      | 4h    | ✅完了（DAY2朝に完了 / 15ルート対応・vitest 97件 PASS）               | A-111       |
| TASK-096-1 | About.tsx/PrivacyPolicy.tsx/Terms.tsx/TermsOfService.tsx の最終更新日を「2026年5月16日」に置換（4行差分） | 山本      | 30min | ✅完了（vitest 607 PASS / lint OK / tsc OK / build成功）              | -           |

### Day2（2026-05-18）

| ID         | 内容                                                               | 担当 | 見積  | 状態                                                                                                                               | A     |
| ---------- | ------------------------------------------------------------------ | ---- | ----- | ---------------------------------------------------------------------------------------------------------------------------------- | ----- |
| TASK-087-2 | 第1段階の view-source: 確認 + ビルド時間退行計測（基準値+10%以内） | 田中 | 1h    | ✅完了（基準5.11s→4.76s / -6.8%・退行ゼロ / view-source: /about・/reference/chapter06・/chapter12 で h1+本文3段落+canonical 確認） | A-111 |
| TASK-087-3 | 第2段階: chapter04〜12（9ルート）拡張 + vitest 全 PASS 維持        | 山本 | 4h    | ✅完了（chapter04〜12 拡張・dist 15 index.html 出力・vitest 687 PASS / +80件）                                                     | A-111 |
| TASK-096-2 | PBI-096 vitest/tsc/eslint/build 確認 + DoD21項目チェック / PR提出  | 伊藤 | 30min | ✅完了（687 PASS / lint 0 / tsc 0 / build成功 / audit 0 / DoD21項目「はい」/ bundle JS に「2026年5月16日」含有確認）               | -     |

### Day3（2026-05-19）

| ID          | 内容                                                                                  | 担当      | 見積  | 状態                                                                                                                           | A     |
| ----------- | ------------------------------------------------------------------------------------- | --------- | ----- | ------------------------------------------------------------------------------------------------------------------------------ | ----- |
| TASK-087-4  | 第2段階の代表スナップショット確認（chapter06 / chapter12 等）                         | 田中      | 1h    | ✅完了（既存 vitest スナップ機構で再確認＝退行ゼロ）                                                                           | A-111 |
| TASK-087-5  | 第3段階: /cases/:id × 20 ルート拡張（動的ルート対応・`routes.ts.PUBLIC_ROUTES` 統合） | 田中      | 5h    | ✅完了（CASES＋`buildCaseRoute` helper追加・dist 35 index.html 出力・vitest 810 PASS / +123件 / build 5.48s = baseline +7.2%） | A-111 |
| TASK-STR-1  | DAY3 EODストレッチ判定: PBI-087 第3段階完了見込み確認 → PBI-091投入可否決定           | 田中+伊藤 | 30min | ✅完了（**投入可（条件付き）** / DAY4 EODに第4段階＋ビルド時間で最終判定）                                                     | A-113 |
| TASK-096-PR | PBI-096 PR提出（DAY3朝 / 伊藤ハンドル）                                               | 伊藤      | 15min | ✅完了（DoD 21項目「はい」維持・Sprint Reviewでmain反映）                                                                      | -     |

### Day4（2026-05-20）

| ID         | 内容                                                                          | 担当           | 見積  | 状態                                                                                                                                                                 | A     |
| ---------- | ----------------------------------------------------------------------------- | -------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| TASK-087-6 | DAY4朝の build時間再計測（第3段階状態・baseline +10% 内確認）                 | 中村           | 1h    | ✅完了（4.98s = baseline -2.5% / 退行ゼロ）                                                                                                                          | A-111 |
| TASK-087-7 | 第4段階: /patterns/:id × 20 ルート拡張 + vitest 全 PASS                       | 中村           | 5h    | ✅完了（PATTERNS＋`buildPatternRoute` helper追加・dist 55 index.html 出力・vitest 933 PASS / +123件 / build 4.86s = baseline -4.9% / view-source代表3パターン PASS） | A-111 |
| TASK-STR-2 | DAY4 EODストレッチ最終判定: 第4段階完了 + ビルド時間+10%内 → PBI-091 投入確定 | 高橋+伊藤+田中 | 30min | ✅完了（**PBI-091 投入確定** / DAY5に TASK-091-1/2 追加）                                                                                                            | A-113 |

### Day5（2026-05-22 / 最終品質ゲート + Sprint Review準備 + PBI-091ストレッチ）

| ID          | 内容                                                                                                                           | 担当      | 見積 | 状態                                                                                                                                                                                                 | A     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ | --------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| TASK-091-1  | PBI-091: BreadcrumbList JSON-LD 実装 + 視覚UI（パンくず）                                                                      | 伊藤+田中 | 3h   | ✅完了（`src/ui/Breadcrumb.tsx` 新設＋Router.tsx に `buildChapterBreadcrumbJsonLd/buildPatternBreadcrumbJsonLd/buildCaseBreadcrumbJsonLd` 純関数追加・3系統 JSON-LD注入+視覚UI統合・styles.cssでAA） | A-113 |
| TASK-087-8  | 第4段階の代表スナップショット確認 + Rich Results Test 主要5URL検証 / 残り2ルート（/privacy-policy /contact）prerender 追補検討 | 伊藤      | 1h   | ✅完了（中村実施：`prerender.mjs` に /privacy-policy /contact 追補→ **57ルート完遂**・主要5URL（/ /reference/chapter06 /patterns/1 /cases/case-001 /about）Rich Results 形式適合 PASS）              | A-111 |
| TASK-087-9  | ビルド時間累積退行計測（10%以内確認）/ 主要5ルート構造化データ検証                                                             | 田中      | 1h   | ✅完了（最終 build **4.87s = baseline 5.11s -4.7%**・累積退行ゼロ / 主要5URL構造化データ Rich Results 形式適合）                                                                                     | -     |
| TASK-087-10 | PBI-087 DoD21項目チェック / PR提出                                                                                             | 伊藤      | 1h   | ✅完了（DoD 21項目「はい」・PR提出準備）                                                                                                                                                             | -     |
| TASK-091-2  | PBI-091 DoD21項目チェック / PR提出（PBI-087 DoDクローズ後）                                                                    | 伊藤      | 1h   | ✅完了（DoD 21項目「はい」・PR提出準備）                                                                                                                                                             | A-113 |
| TASK-D5-1   | tsc / lint / vitest 全 PASS / build成功 / audit High-Critical 0 / sitemap ルート数確認                                         | 伊藤      | 1h   | ✅完了（山本実施：tsc 0 / lint 0 / vitest **951 PASS (57 files)** / build 4.87s / audit High-Critical 0 / dist `*/index.html` **57件**・prerender ログ `routes=57`）                                 | -     |
| TASK-D5-2   | product_backlog.csv 完了PBI状態更新 / product_backlog_done.csv 移送 / handoff還流欄記入                                        | 高橋+田中 | 1h   | ✅完了（PBI-087/091/096 を done.csv へ移送・velocity sprint025 行追記＝planned 6pt / completed 8pt / carried 0pt）                                                                                   | -     |

---

## 受入確認メモ

> Sprint Review 前にチームで埋める。

### PBI-087 受入確認

- [x] 57+ ルート全件 view-source: で h1・本文要約段落・パンくず・主要内部リンク取得可能（dist `*/index.html` 57件・代表12ルート view-source 確認）
- [x] canonical/description/OGP/Twitter Card 退行ゼロ（Router.seo.test.tsx 19件 PASS）
- [x] ビルド時間退行 10% 以内（baseline 5.11s → DAY5 4.87s = -4.7%）
- [x] vitest 主要5ルートスナップショット PASS（snapshot file更新済・第1〜4段階）
- [x] Rich Results Test 主要5URL OK（形式適合・公開後リモート検証は IMP-002 解消後 Sprint026）
- [x] DoD 21項目「はい」

### PBI-096 受入確認

- [x] 4ファイル4行差分のみ（About.tsx L23 / PrivacyPolicy.tsx L21 / Terms.tsx L27 / TermsOfService.tsx L19）
- [x] dist legal-updated が「2026年5月16日」に更新（bundle JS に含有確認 / DAY2）
- [x] vitest / tsc / eslint オールグリーン（687 PASS / 0 errors）
- [x] DoD 21項目「はい」（DAY2 TASK-096-2 で全項目確認 / pnpm audit High/Critical 0）

### 公開後確認（Day1 IMP-002解消後）

- [ ] C1: /cases/:id × 20 URL検査
- [ ] C2: /patterns/:id × 20 URL検査
- [ ] C3: /reference/chapter03..12 × 8 URL検査
- [ ] PBI-086 PoC ルート（/・/reference/chapter01）本番 view-source: 確認（A-112 初運用）

---

## 更新履歴

| 日付       | 更新内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 更新者     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 2026-05-16 | 初版作成（計画 6pt = PBI-087 5pt + PBI-096 1pt / ストレッチ PBI-091 2pt 容量試算外 / 4段階展開戦略・タスク分解）                                                                                                                                                                                                                                                                                                                                                         | 高橋（SM） |
| 2026-05-16 | DAY1 ステータス更新（Day0 4タスク完了 / TASK-096-1 完了 / TASK-087-1 進行中 / TASK-D1-a〜f は IMP-002 持ち越し継続によりブロック・不実施）                                                                                                                                                                                                                                                                                                                               | 高橋（SM） |
| 2026-05-18 | DAY2 ステータス更新（TASK-087-1 完了＝第1段階6ルート拡張・15ルート対応完成 / TASK-087-2 完了＝ビルド時間 5.11s→4.76s 退行ゼロ・view-source代表3ルート確認 / TASK-087-3 完了＝chapter04〜12 拡張済 / TASK-096-2 完了＝PBI-096 DoD 21項目「はい」確認 / **vitest 687 PASS（DAY1比+80）・lint 0・tsc 0・build成功・audit 0・dist 15 index.html 出力**）                                                                                                                     | 高橋（SM） |
| 2026-05-19 | DAY3 ステータス更新（TASK-087-4/5/STR-1 完了 + TASK-096-PR 完了：第3段階 cases 20ルート拡張・dist 35 index.html 出力・vitest **810 PASS（DAY2比+123）**・lint 0・tsc 0・build 5.48s = baseline +7.2%（10%以内）・view-source代表3ケース（001/029/053）確認・PBI-091 投入可（条件付き：DAY4 EOD再判定））                                                                                                                                                                 | 高橋（SM） |
| 2026-05-20 | DAY4 ステータス更新（TASK-087-6/7/STR-2 完了：第4段階 patterns 20ルート拡張・dist **55 index.html 出力**（55/57+≒96%）・vitest **933 PASS（DAY3比+123）**・lint 0・tsc 0・build **4.86s = baseline -4.9%**（退行なし）・view-source代表3パターン（1/10/20）確認・**PBI-091 投入確定**（DAY5に TASK-091-1/2 追加・容量試算8pt上限ぎり・PBI-087優先のガードレール付き））                                                                                                  | 高橋（SM） |
| 2026-05-22 | DAY5 ステータス更新（TASK-087-8/9/10/091-1/091-2/D5-1/D5-2 全完了：**57/57ルート完遂**・dist **57 index.html 出力**・vitest **951 PASS (57 files)（DAY4比+18）**・lint 0・tsc 0・build **4.87s = baseline -4.7%**（累積退行ゼロ）・audit High-Critical 0・3系統BreadcrumbList JSON-LD+視覚UI実装・PBI-087/091/096 全DoDクローズ・product_backlog.csv→done.csv 移送・velocity sprint025 行追記＝planned 6pt / completed **8pt** / carried 0pt・**スプリントゴール達成**） | 高橋（SM） |
