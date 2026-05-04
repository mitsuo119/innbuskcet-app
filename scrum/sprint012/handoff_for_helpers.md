# Sprint012 助っ人向けハンドオフ

## 1. Sprint012で実装した機能の概要

- **PBI-051（3pt）**: AdSense審査用の法務ページ3件を実装
  - プライバシーポリシー / 利用規約 / お問い合わせ
  - フッターからの導線、キーボード到達性を整備
- **PBI-052（2pt）**: AdSenseローダーを本番ビルド時のみ注入
  - `VITE_ADSENSE_CLIENT_ID` / `VITE_ADSENSE_SLOT_ID` をSecrets経由で注入
  - 未設定時は安全フォールバック（広告非表示）
- **PBI-055（3pt）**: パターン別解説ページ（一覧・詳細）と解説文リンク連携
  - `#/patterns` / `#/patterns/:id` の画面導線
  - explanation文中の「パターン〇」を該当詳細へリンク化
- **PBI-054（1pt / ストレッチ）**: ExamResult詳細パネルの前後問連続閲覧
  - 「前の問へ/次の問へ」追加
  - 端境界disabled、遷移時フォーカス移動、既存戻り導線維持

## 2. 追加・変更した主なファイル一覧

### 法務ページ・導線

- `project/front/src/pages/PrivacyPolicy.tsx`
- `project/front/src/pages/TermsOfService.tsx`
- `project/front/src/pages/Contact.tsx`
- `project/front/src/Router.tsx`
- `project/front/src/App.tsx`
- `project/front/src/pages/__tests__/LegalPages.test.tsx`

### AdSense注入・CI

- `project/front/vite.config.ts`
- `project/front/index.html`
- `.github/workflows/deploy.yml`
- `project/front/.env.example`

### パターン別解説・リンク連携

- `project/front/src/data/patternData.ts`
- `project/front/src/pages/PatternList.tsx`
- `project/front/src/pages/PatternDetail.tsx`
- `project/front/src/utils/explanationPatternLinks.tsx`
- `project/front/src/utils/__tests__/explanationPatternLinks.test.tsx`

### DAY5で追加（ストレッチ完了）

- `project/front/src/ui/ExamResultView.tsx`
- `project/front/src/ui/ExamResultView.back.test.tsx`
- `project/front/src/styles.css`

## 3. 次スプリントで引き継ぎが必要な事項

- 法務ページ文言の定期見直し（運用実態・外部窓口URL変更時）
- AdSense本番運用の監視
  - 審査状態、広告配信率、フォールバック表示率の確認
- パターン解説の拡張方針
  - リファレンスエリア（PBI-056/057）との導線統合

## 4. 既知の課題・技術的負債

- `styles.css` が肥大化傾向（コンポーネント単位分割の検討余地）
- 一部UI動作はユニットテスト中心のため、E2Eテスト導入余地あり
- AdSense実配信の可観測性（簡易メトリクス）を将来強化可能

## 5. 最終品質ゲート結果（Sprint012 DAY5）

- `pnpm tsc --noEmit`: エラー0
- `pnpm lint`: エラー0
- `pnpm test`: 34 files / 356 tests passed
- `pnpm build`: 成功
- `pnpm audit --prod --audit-level high`: High/Critical 0
