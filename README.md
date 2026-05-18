# my-blog

個人ポートフォリオサイト [jishinzerogon.dev](https://jishinzerogon.dev) のインフラ一式。React + Vite でビルドした SPA を S3 + CloudFront で静的配信し、Terraform で構成管理している。

## アーキテクチャ

### アクセス経路 (ユーザーがサイトに到達するまで)

```
              ┌──────────────────┐
   ユーザ ──▶ │  Cloudflare DNS  │  ドメイン購入元 & ネームサーバ
              └─────┬────────────┘
                    │
              ┌─────▼──────┐
              │ CloudFront │ ◀── ACM (us-east-1)
              └─────┬──────┘
                    │ OAC 署名付きリクエスト
              ┌─────▼────────────────────┐
              │  S3 (静的ホスティング)    │  パブリックアクセス全ブロック
              │  jishinzerogon-dev-frontend │  CloudFront からのみ読み取り許可
              └──────────────────────────┘
```

SPA ルーティングのため、CloudFront は 403 / 404 を `index.html` にフォールバックする (TTL 60s)。

### デプロイ経路 (コミットから本番反映まで)

```
              ┌────────────┐
              │   GitHub   │  main push
              └─────┬──────┘
                    │ OIDC (鍵レス)
              ┌─────▼──────────┐
              │ GitHub Actions │  npm run build
              └─────┬──────────┘
                    │ aws s3 sync --delete
              ┌─────▼──────┐
              │     S3     │
              └─────┬──────┘
                    │ create-invalidation
              ┌─────▼──────────┐
              │   CloudFront   │  CDN キャッシュ無効化
              └────────────────┘
```

> ℹ️ ドメイン `jishinzerogon.dev` は Cloudflare で購入しており、ネームサーバも Cloudflare のまま利用している。DNS は Cloudflare、CDN 以降は AWS という構成を採用している。

### インフラの変遷

当初は ECS Fargate でコンテナを配信する構成 (CloudFront → ALB → ECS on Fargate) だったが、静的 SPA の配信には過剰だったため、2026-04 に S3 + CloudFront (OAC) 構成へ移行した。固定費は月 ~$22 から ~$0.10 以下に削減。ALB / ECS / ECR の Terraform 定義は将来のバックエンド追加に備え、`var.enable_serving = false` で停止状態のまま残置している (後述の[停止中のリソース](#停止中のリソース-enable_serving-フラグ)を参照)。

## 使用技術

### DNS (AWS 外)
- **Cloudflare DNS** — ドメイン `jishinzerogon.dev` の購入元 & ネームサーバ。CloudFront ディストリビューションへ向けている

### AWS
- **CloudFront** — CDN・HTTPS 終端・SPA フォールバック (403 / 404 → `index.html`)
- **S3** — 静的ファイルのホスティング (パブリックアクセス全ブロック、CloudFront OAC 経由でのみ読み取り許可)、および Terraform state のリモートバックエンド
- **ACM** — TLS 証明書 (CloudFront 用に us-east-1 で管理)
- **IAM (OIDC)** — GitHub Actions からの鍵レスデプロイ

### ツール
- **Terraform** — IaC (リソース種別ごとにファイル分割、変数は `variables.tf` に集約)
- **React + Vite** — ポートフォリオ SPA のフロントエンド
- **Docker** — マルチステージビルド (現在は CI の build 検証用)
- **GitHub Actions** — CI / CD

### 停止中のリソース (`enable_serving` フラグ)

ALB / ECS on Fargate / ECR の定義が Terraform に残っているが、`var.enable_serving = false` でコスト抑制のため停止中。`alb.tf` の ALB / Listener と `ecs.tf` の ECS Service が `count = var.enable_serving ? 1 : 0` でゲートされている。`Dockerfile` と `nginx.conf` は CI での Docker build 検証に引き続き使用する。

## 設計のポイント

### セキュリティ
- **S3 を非公開に保つ**: S3 バケットはパブリックアクセスを全ブロックし、CloudFront の OAC (Origin Access Control) で署名されたリクエストのみ読み取りを許可。S3 への直接アクセスを遮断
- **OIDC による鍵レスデプロイ**: GitHub Actions は IAM ユーザ・アクセスキーを一切使わず、OIDC で一時クレデンシャルを取得。trust policy の `sub` 条件で `main` ブランチ以外を弾く
- **最小権限の IAM ポリシー**: GitHub Actions 用 Role は S3 sync と CloudFront invalidation に必要な権限に限定
- **SG の多層分離 (停止中リソース)**: ALB 用 SG と ECS 用 SG を分離。ALB は CloudFront のマネージドプレフィックスリストからのみ受信し、ECS は ALB SG からのみ受信する構成。`enable_serving` を `true` に戻す際もこの境界を維持する

### CI / CD
- **CI と CD の責務分離**: PR では検証のみ (`ci.yml` で Docker build、`terraform-ci.yml` で fmt / validate / plan)、`main` push で本番デプロイ (`deploy.yml`)
- **静的配信のデプロイ**: `aws s3 sync --delete` で `dist/` を S3 に同期し、CloudFront の `create-invalidation` で CDN キャッシュを無効化

### IaC
- **ハードコード値の排除**: プロジェクト名、ドメイン、CIDR などは `variables.tf` に集約
- **命名規則の統一**: 全リソース名を `${var.project}-*` で統一
- **現行構文への準拠**: 非推奨 API (例: CloudFront の `forwarded_values`) は使わず、`Managed-CachingOptimized` などのマネージドポリシーを利用
- **State の S3 バックエンド管理**: ローカルに state を置かず、S3 をリモートバックエンドとして使用

## ローカル開発

### フロントエンド (React + Vite)

```bash
npm install
npm run dev        # 開発サーバ起動 (HMR)
npm run build      # dist/ に本番ビルド
npm run preview    # ビルド成果物をローカルプレビュー
```

### コンテナのビルド・動作確認 (CI と同じ)

```bash
docker build -t my-blog .
docker run --rm -p 8080:80 my-blog
# http://localhost:8080 にアクセスして確認
```

### Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
terraform fmt       # フォーマット
terraform validate  # 構文チェック
```

## ディレクトリ構成

```
.
├── Dockerfile              # マルチステージ (Node でビルド → nginx:alpine で配信)。現在は CI の build 検証用
├── nginx.conf              # nginx サーバ設定
├── index.html              # Vite エントリ HTML
├── vite.config.js
├── package.json            # React 19 + Vite
├── src/                    # ポートフォリオ SPA のソース
│   ├── main.jsx
│   └── App.jsx             # コンポーネント・データ定数を集約した単一ファイル
├── terraform/              # AWS インフラ定義 (リソース種別ごとにファイル分割)
│   ├── main.tf             # provider, backend
│   ├── variables.tf
│   ├── outputs.tf
│   ├── vpc.tf
│   ├── security_group.tf
│   ├── s3.tf               # 静的ホスティング用 S3 バケット
│   ├── cloudfront.tf       # CloudFront ディストリビューション (OAC)
│   ├── acm.tf
│   ├── iam.tf              # ECS 実行ロール、GitHub Actions OIDC ロール
│   ├── cloudwatch.tf
│   ├── alb.tf              # 停止中 (enable_serving フラグでゲート)
│   ├── ecs.tf              # 停止中 (enable_serving フラグでゲート)
│   └── ecr.tf              # 停止中
└── .github/workflows/
    ├── ci.yml              # PR 時: Docker build 検証
    ├── terraform-ci.yml    # terraform/** 変更 PR: fmt / validate / plan
    └── deploy.yml          # main push 時: npm build → S3 sync → CloudFront 無効化
```
