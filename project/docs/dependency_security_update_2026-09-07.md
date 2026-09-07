# 依存関係の脆弱性修正

確認日: 2026-09-07。対象: フロントエンドの直接・推移的依存（開発用を含む）。

## 修正結果

`pnpm audit --audit-level high` は、High 15件・Moderate 5件から **既知の脆弱性0件** になった。監査結果は確認日時点の公開アドバイザリに基づく。

| パッケージ | 更新前 | 更新後 |
| --- | --- | --- |
| vite | 8.0.10 | 8.2.2 |
| postcss | 8.5.12 | 8.5.28 |
| nanoid | 3.3.11 | 3.3.18 |
| form-data | 4.0.5 | 4.0.6 |
| ws | 8.20.0 | 8.21.0 |
| js-yaml | 4.1.1 | 4.3.1 |
| brace-expansion | 1.1.14 / 5.0.5 | 1.1.18 / 5.0.9 |

- Viteを同じ8系で更新し、PostCSS・nanoidも再解決した。
- 残る推移的依存は、[package.json](../front/package.json) の `pnpm.overrides` で脆弱なバージョン範囲だけを修正版に置換した。1系を5系に置換するなどのメジャー跨ぎは行っていない。
- [pnpm-lock.yaml](../front/pnpm-lock.yaml) に解決結果を固定。React・jsdom・ESLint・Vitestの直接依存のメジャーは変更していない。
- [デプロイCI](../../.github/workflows/deploy.yml) の監査から `--prod` を除去し、今回対象となった開発用依存もデプロイ前に検査する。
- 今後、上流の依存指定だけで修正版を解決できる状態になったら、監査結果を確認したうえで不要なoverrideを削除する。

## 検証

- `pnpm install --frozen-lockfile`: 成功。
- `pnpm audit --audit-level high`: 既知の脆弱性0件。
- Vitest: 64ファイル・1,253件成功。既存のjsdomのnavigation未実装ログは残るが、失敗なし。
- ESLint・TypeScript・Viteビルド: 成功。本番ドメインを設定した60ルートのHTMLを生成。
- `check:outcome`（preview）: 43ルート成功・失敗0。[検証結果](./outcome_verification_report.md) を更新。本番環境の計測ではない。
- YAML構文、CIの全依存監査コマンド、manifestとlockfileのoverride・Vite指定の一致を検証済み。
- 更新対象7種類のライセンスはすべてMIT。全依存には既存のMPL-2.0なども含まれ、GPL/AGPLは検出されていない。

## 残事項

- Viteの将来の設定ローダー変更に関する警告、500kB超バンドルの警告は残る。今回のビルドは成功している。
- Dependabot／Renovate設定、SBOMは未導入。今後の候補として自動更新とCIでのSBOM生成を検討する。
- コミット・プッシュ後のCI／自動デプロイ、本番表示、AdSenseの広告・同意設定と再申請は別途結果を確認する。